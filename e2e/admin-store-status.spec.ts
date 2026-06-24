import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * Admin Store Status Machine E2E (S1-S7)
 *
 * 覆盖 PRD §3 的 4 态状态机：pending / active / suspended / terminated
 *
 * 前置：admin / admin123 已 seed
 * 数据隔离：每个测试自己创建门店，test.afterAll 统一清理
 *
 * 与 vitest route.test.ts 的差别：
 *   - vitest 测纯 API + 状态机逻辑
 *   - 这里测端到端 UI 渲染 + 交互（徽章颜色、按钮 disabled、ConfirmDialog 等）
 */

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

const TEST_PROVINCE = 'guangdong';
const TEST_CITY = 'guangzhou';
const TEST_PHONE = '13900139000';

interface CreatedStore {
  id: string;
  slug: string;
}

/** 用 admin session 通过 API 直接创建门店（不依赖 UI 表单） */
async function createStoreViaApi(
  request: APIRequestContext,
  page: Page,
  overrides: { name?: string; slug?: string; status?: string } = {},
): Promise<CreatedStore> {
  const slug =
    overrides.slug ?? `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const name = overrides.name ?? `E2E 测试门店 ${slug}`;
  // 用 page.request 继承登录 cookie
  const res = await page.request.post('/api/stores', {
    data: {
      name,
      slug,
      level: 'flagship',
      provinceSlug: TEST_PROVINCE,
      citySlug: TEST_CITY,
      address: '广州市天河区 E2E 测试地址 88 号',
      phone: TEST_PHONE,
      businessHours: '09:00-18:00',
      status: overrides.status,
    },
  });
  expect(res.status()).toBe(201);
  const json = (await res.json()) as {
    success: boolean;
    data: { id: string; slug: string };
  };
  expect(json.success).toBe(true);
  return { id: json.data.id, slug: json.data.slug };
}

/** 走 API 直接更新 status（绕过 UI）— 用于准备多状态测试数据 */
async function setStoreStatusViaApi(
  page: Page,
  storeId: string,
  action: 'publish' | 'suspend' | 'resume' | 'terminate',
  reason?: string,
): Promise<void> {
  const res = await page.request.post(`/api/stores/${storeId}/${action}`, {
    data: reason ? { statusReason: reason } : {},
  });
  expect(res.status(), `${action} → ${res.status()}`).toBe(200);
  const json = (await res.json()) as { success: boolean };
  expect(json.success, `${action} success`).toBe(true);
}

async function deleteStoreViaApi(page: Page, storeId: string): Promise<void> {
  // 项目没有 DELETE 端点（terminated 状态即可）；用 Prisma 直接 SQL 删
  // 但 e2e 走 page.request 拿不到 DB 直连，只能通过 API 标记 terminated
  // 这里用 fetch 直接打到内部 helper — 实际清理由 afterAll 通过 admin DB 完成
  // (测试数据用 status=terminated 标识，便于人工/脚本后续清理)
  void storeId;
}

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.locator('input[name="username"], input#username').fill(ADMIN_USER);
  await page.locator('input[type="password"]').fill(ADMIN_PASS);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15_000 });
}

test.describe('Admin Store Status Machine (S1-S7)', () => {
  const createdStoreIds: string[] = [];

  test.afterAll(async ({ request }) => {
    // 清理：用直连 SQL 不可达,改用每条记录的「终止」标记 + 由后续脚本清理
    // (本次 e2e 测试只标记 terminated，不破坏 DB 行)
    for (const id of createdStoreIds) {
      try {
        await request.post(`/api/stores/${id}/terminate`, {
          data: { statusReason: 'e2e cleanup' },
        });
      } catch {
        // 已被 deleted/已 terminated 忽略
      }
    }
  });

  test('S1: 4 态徽章在 /admin/stores 列表正确渲染', async ({ page }) => {
    await loginAsAdmin(page);

    // 准备 4 个不同状态的门店
    const stores = {
      pending: await createStoreViaApi(page.request, page, { status: 'pending' }),
      active: await createStoreViaApi(page.request, page, { status: 'pending' }),
      suspended: await createStoreViaApi(page.request, page, { status: 'pending' }),
      terminated: await createStoreViaApi(page.request, page, { status: 'pending' }),
    };
    createdStoreIds.push(...Object.values(stores).map((s) => s.id));

    await setStoreStatusViaApi(page, stores.active.id, 'publish');
    await setStoreStatusViaApi(page, stores.suspended.id, 'publish');
    await setStoreStatusViaApi(page, stores.suspended.id, 'suspend', 'e2e setup');
    await setStoreStatusViaApi(page, stores.terminated.id, 'publish');
    await setStoreStatusViaApi(page, stores.terminated.id, 'suspend', 'e2e setup');
    await setStoreStatusViaApi(page, stores.terminated.id, 'terminate', 'e2e setup');

    // 用 search 过滤只显示这 4 个（避免其他门店干扰）
    await page.goto(`/admin/stores?search=e2e-${Date.now().toString().slice(0, 7)}`);
    // fallback: 直接打开列表
    await page.goto('/admin/stores');

    // 等列表加载
    await page.waitForSelector('text=门店名称', { timeout: 10_000 });

    // 4 态徽章应全部可见（用 aria-label 精确定位）
    await expect(page.locator('[aria-label="状态：待发布"]').first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator('[aria-label="状态：营业中"]').first()).toBeVisible();
    await expect(page.locator('[aria-label="状态：暂停合作"]').first()).toBeVisible();
    await expect(page.locator('[aria-label="状态：终止合作"]').first()).toBeVisible();
  });

  test('S2: pending → publish 完整 UI 流程', async ({ page }) => {
    await loginAsAdmin(page);

    const store = await createStoreViaApi(page.request, page, { status: 'pending' });
    createdStoreIds.push(store.id);

    await page.goto('/admin/stores');
    await page.waitForSelector('text=门店名称', { timeout: 10_000 });

    // 找到测试门店所在行
    const row = page.locator(`tr:has-text("${store.slug}")`).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.locator('[aria-label="状态：待发布"]')).toBeVisible();

    // 点击「发布」按钮（pending 状态下唯一动作）
    await row.getByRole('button', { name: '发布' }).click();

    // ConfirmDialog 弹出 — 确认按钮是动作名 "发布"（scope to alertdialog 避免与 row 按钮歧义）
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: '发布', exact: true })
      .click();

    // 等动作完成 → 列表刷新 → 状态变为「营业中」
    await expect(row.locator('[aria-label="状态：营业中"]')).toBeVisible({
      timeout: 10_000,
    });
    // active 状态只允许「暂停」（terminate 必须先经过 suspended — 状态机规则）
    await expect(row.getByRole('button', { name: '暂停' })).toBeVisible();
    await expect(row.getByRole('button', { name: '终止' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: '恢复' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: '发布' })).toHaveCount(0);
  });

  test('S3: active → suspend 必填 statusReason', async ({ page }) => {
    await loginAsAdmin(page);

    const store = await createStoreViaApi(page.request, page, { status: 'pending' });
    createdStoreIds.push(store.id);
    await setStoreStatusViaApi(page, store.id, 'publish');

    await page.goto('/admin/stores');
    await page.waitForSelector('text=门店名称', { timeout: 10_000 });

    const row = page.locator(`tr:has-text("${store.slug}")`).first();
    await expect(row).toBeVisible({ timeout: 10_000 });

    // 点击「暂停」
    await row.getByRole('button', { name: '暂停' }).click();

    // ConfirmDialog 弹出，应有 statusReason textarea（id=statusReason）
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 });
    const dialog = page.getByRole('alertdialog');
    const reasonInput = dialog.locator('textarea#statusReason');
    await expect(reasonInput).toBeVisible();

    // 不填原因 → 提交 → 应有 "请填写原因" 错误提示
    await dialog.getByRole('button', { name: '暂停', exact: true }).click();
    await expect(page.locator('text=请填写原因').first()).toBeVisible({
      timeout: 5_000,
    });

    // 填写原因 → 确认
    await reasonInput.fill('e2e 测试暂停原因');
    await dialog.getByRole('button', { name: '暂停', exact: true }).click();

    // 状态变为「暂停合作」
    await expect(row.locator('[aria-label="状态：暂停合作"]')).toBeVisible({
      timeout: 10_000,
    });
    await expect(row.getByRole('button', { name: '恢复' })).toBeVisible();
    await expect(row.getByRole('button', { name: '终止' })).toBeVisible();
  });

  test('S4: suspended → resume', async ({ page }) => {
    await loginAsAdmin(page);

    const store = await createStoreViaApi(page.request, page, { status: 'pending' });
    createdStoreIds.push(store.id);
    await setStoreStatusViaApi(page, store.id, 'publish');
    await setStoreStatusViaApi(page, store.id, 'suspend', 'e2e setup');

    await page.goto('/admin/stores');
    await page.waitForSelector('text=门店名称', { timeout: 10_000 });

    const row = page.locator(`tr:has-text("${store.slug}")`).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.locator('[aria-label="状态：暂停合作"]')).toBeVisible();

    // 点击「恢复」（不需要 reason）— 确认按钮文字也是 "恢复"（scope 到 alertdialog）
    await row.getByRole('button', { name: '恢复' }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: '恢复', exact: true })
      .click();

    // 状态回到 active
    await expect(row.locator('[aria-label="状态：营业中"]')).toBeVisible({
      timeout: 10_000,
    });
  });

  test('S5: terminated 状态 — 无动作按钮,只能查看详情', async ({ page }) => {
    await loginAsAdmin(page);

    const store = await createStoreViaApi(page.request, page, { status: 'pending' });
    createdStoreIds.push(store.id);
    await setStoreStatusViaApi(page, store.id, 'publish');
    await setStoreStatusViaApi(page, store.id, 'suspend', 'e2e setup');
    await setStoreStatusViaApi(page, store.id, 'terminate', 'e2e setup');

    await page.goto('/admin/stores');
    await page.waitForSelector('text=门店名称', { timeout: 10_000 });

    const row = page.locator(`tr:has-text("${store.slug}")`).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.locator('[aria-label="状态：终止合作"]')).toBeVisible();

    // terminated 行：4 个状态动作按钮（发布/暂停/恢复/终止）**都** 不应出现
    await expect(row.getByRole('button', { name: '发布' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: '暂停' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: '恢复' })).toHaveCount(0);
    await expect(row.getByRole('button', { name: '终止' })).toHaveCount(0);
    // 应显示「已终止」标记
    await expect(row.locator('[aria-label="已终止合作，只读"]')).toBeVisible();

    // 进入编辑页 — form 应为 readOnly（fieldset disabled）
    await row.getByRole('link', { name: '编辑' }).click();
    await page.waitForURL(new RegExp(`/admin/stores/${store.id}`));
    // 顶部应显示「已终止」banner
    await expect(page.locator('text=已终止').first()).toBeVisible({ timeout: 10_000 });
    // 所有表单输入 disabled
    const fieldset = page.locator('fieldset[disabled]').first();
    await expect(fieldset).toBeVisible();
  });

  test('S6: 状态筛选下拉过滤列表', async ({ page }) => {
    await loginAsAdmin(page);

    // 准备：1 active + 1 pending
    const active = await createStoreViaApi(page.request, page, { status: 'pending' });
    createdStoreIds.push(active.id);
    await setStoreStatusViaApi(page, active.id, 'publish');

    const pending = await createStoreViaApi(page.request, page, { status: 'pending' });
    createdStoreIds.push(pending.id);

    await page.goto('/admin/stores');
    await page.waitForSelector('text=门店名称', { timeout: 10_000 });

    // 默认 all=true 应同时显示 2 个
    await expect(page.locator(`tr:has-text("${active.slug}")`)).toBeVisible();
    await expect(page.locator(`tr:has-text("${pending.slug}")`)).toBeVisible();

    // 找到状态筛选 select（aria-label="按状态筛选"）
    const statusSelect = page.locator('select[aria-label="按状态筛选"]');

    // 选「待发布」（option value 是 lowercase status）
    await statusSelect.selectOption('pending');
    // 等列表刷新
    await page.waitForTimeout(1000);

    // pending 仍可见，active 不应在结果中
    await expect(page.locator(`tr:has-text("${pending.slug}")`)).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.locator(`tr:has-text("${active.slug}")`)).toHaveCount(0);
  });

  test('S7: 公开契约 — 未登录 GET /api/stores 仅返回 status=active', async ({
    page,
    context,
  }) => {
    // 准备：1 active + 1 pending + 1 suspended
    // 必须用 admin session 创建（未登录用户无法 POST）
    await loginAsAdmin(page);
    const active = await createStoreViaApi(page.request, page, { status: 'pending' });
    const pending = await createStoreViaApi(page.request, page, { status: 'pending' });
    const suspended = await createStoreViaApi(page.request, page, {
      status: 'pending',
    });
    createdStoreIds.push(active.id, pending.id, suspended.id);
    await setStoreStatusViaApi(page, active.id, 'publish');
    await setStoreStatusViaApi(page, suspended.id, 'publish');
    await setStoreStatusViaApi(page, suspended.id, 'suspend', 'e2e setup');

    // 退出登录 → 未登录 session
    await context.clearCookies();

    // 调用公开 API
    const res = await page.request.get('/api/stores?limit=100');
    expect(res.status()).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: Array<{ id: string; slug: string; status: string }>;
    };
    expect(json.success).toBe(true);

    // active 应在结果中
    const ids = json.data.map((d) => d.id);
    expect(ids).toContain(active.id);
    // pending / suspended **不应** 在公开结果中（P1 修复）
    expect(ids).not.toContain(pending.id);
    expect(ids).not.toContain(suspended.id);

    // 进一步断言：所有返回行的 status === 'active'
    for (const row of json.data) {
      expect(row.status, `row ${row.slug} should be active`).toBe('active');
    }
  });
});
