import { test, expect, type Page } from '@playwright/test';

/**
 * Analytics E2E tests (E1-E14)
 *
 * 前置：admin@lanhui.com / admin123
 * 关键：E11-E14 验证真实事件入库；用 admin session 复用 GET
 *   /api/analytics/stats 看 totalEvents 变化。
 */

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.locator('input[name="username"], input#username').fill(ADMIN_USER);
  await page.locator('input[type="password"]').fill(ADMIN_PASS);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15_000 });
}

async function getTotalEvents(page: Page): Promise<number> {
  // 通过 /api/analytics/stats?startDate=...&endDate=...&groupBy=day 读取
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const url = `/api/analytics/stats?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}&groupBy=day`;
  const res = await page.request.get(url);
  expect(res.status()).toBe(200);
  const json = (await res.json()) as { success: boolean; data: { totalEvents: number } };
  expect(json.success).toBe(true);
  return json.data.totalEvents;
}

test.describe('Analytics E2E', () => {
  test('E1: 未登录访问 /admin/analytics → 跳 /admin/login', async ({ page }) => {
    await page.context().clearCookies();
    const res = await page.goto('/admin/analytics');
    // 跳转到 /admin/login
    await page.waitForURL(/\/admin\/login/);
    expect(page.url()).toContain('/admin/login');
  });

  test('E2: 登录 admin 后访问 /admin/analytics → 200, 标题"数据分析", 4 KPI 卡片', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
    await expect(page).toHaveURL(/\/admin\/analytics/);
    // 标题
    await expect(page.getByRole('heading', { name: '数据分析' })).toBeVisible();
    // 4 个 KPI label
    await expect(page.getByText('总 PV').first()).toBeVisible();
    await expect(page.getByText('总事件').first()).toBeVisible();
    await expect(page.getByText('门店访问').first()).toBeVisible();
    await expect(page.getByText('预约次数').first()).toBeVisible();
  });

  test('E3: 总 PV > 0（DB 254 条）', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
    // 等数据加载完成（loading 态结束）
    await page.waitForSelector('text=总 PV', { timeout: 15_000 });
    // 找包含 "总 PV" 的卡片，读出数字
    const kpiValue = await page.evaluate(() => {
      // 找包含 "总 PV" 的小卡片，向下取兄弟节点
      const labels = Array.from(document.querySelectorAll('span'));
      const lbl = labels.find((s) => s.textContent?.trim() === '总 PV');
      if (!lbl) return null;
      const card = lbl.closest('div.rounded-xl');
      const num = card?.querySelector('p');
      return num?.textContent?.trim() ?? null;
    });
    expect(kpiValue).not.toBeNull();
    const n = Number((kpiValue ?? '0').replace(/,/g, ''));
    expect(n).toBeGreaterThan(0);
  });

  test('E4: 门店访问 = 0，预约次数 = 0（关键 BUG 信号：DB 仅有 pageview）', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
    await page.waitForSelector('text=总 PV', { timeout: 15_000 });
    const result = await page.evaluate(() => {
      function readKpi(label: string): string | null {
        const lbl = Array.from(document.querySelectorAll('span')).find(
          (s) => s.textContent?.trim() === label,
        );
        if (!lbl) return null;
        const card = lbl.closest('div.rounded-xl');
        const num = card?.querySelector('p');
        return num?.textContent?.trim() ?? null;
      }
      return {
        storeViews: readKpi('门店访问'),
        reservations: readKpi('预约次数'),
      };
    });
    expect(Number((result.storeViews ?? '0').replace(/,/g, ''))).toBe(0);
    expect(Number((result.reservations ?? '0').replace(/,/g, ''))).toBe(0);
  });

  test('E5: 切换 7d/30d/90d 触发 3 次 /api/analytics/stats 请求', async ({ page }) => {
    await loginAsAdmin(page);
    const calls: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/analytics/stats')) {
        calls.push(req.url());
      }
    });
    await page.goto('/admin/analytics');
    await page.waitForSelector('text=总 PV', { timeout: 15_000 });
    // 初始 1 次
    // 切换 7d
    await page.getByRole('button', { name: '最近 7 天' }).click();
    await page.waitForTimeout(500);
    // 切换 90d
    await page.getByRole('button', { name: '最近 90 天' }).click();
    await page.waitForTimeout(500);
    // 回到 30d
    await page.getByRole('button', { name: '最近 30 天' }).click();
    await page.waitForTimeout(500);
    // 总共 4 次（1 初始 + 3 切换）
    expect(calls.length).toBeGreaterThanOrEqual(3);
  });

  test('E6: recharts 渲染 — .recharts-surface 数量 >= 4', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
    await page.waitForSelector('text=总 PV', { timeout: 15_000 });
    // 等图表渲染
    await page.waitForSelector('.recharts-surface', { timeout: 15_000 });
    const count = await page.locator('.recharts-surface').count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('E7: 折线图 — .recharts-line-curve 至少 1 个', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
    await page.waitForSelector('.recharts-surface', { timeout: 15_000 });
    const lineCount = await page.locator('.recharts-line-curve').count();
    expect(lineCount).toBeGreaterThanOrEqual(1);
  });

  test('E8: 柱状图 — .recharts-bar-rectangle > 0', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/analytics');
    await page.waitForSelector('.recharts-surface', { timeout: 15_000 });
    const barCount = await page.locator('.recharts-bar-rectangle').count();
    expect(barCount).toBeGreaterThan(0);
  });

  test('E9: mock /api/analytics/stats 500 → 页面顶部红字错误', async ({ page }) => {
    await loginAsAdmin(page);
    await page.route('**/api/analytics/stats**', (route) => {
      route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: 'mock 500' }) });
    });
    await page.goto('/admin/analytics');
    // 等错误 UI 出现（红色边框 + 文字）
    await expect(page.locator('.text-red-400').first()).toBeVisible({ timeout: 10_000 });
  });

  test('E10: mock /api/analytics/stats 5s 延迟 → 4 个 animate-pulse 卡片', async ({ page }) => {
    await loginAsAdmin(page);
    await page.route('**/api/analytics/stats**', async (route) => {
      await new Promise((r) => setTimeout(r, 5000));
      await route.continue();
    });
    // 不等完成，访问页面
    const nav = page.goto('/admin/analytics');
    // 等 KPI 骨架出现
    await page.waitForSelector('.animate-pulse', { timeout: 5_000 });
    // KPI 区域有 4 个 CardSkeleton，每个含 2 个 .animate-pulse → 至少 4 个可见
    const pulseCount = await page.locator('.animate-pulse').count();
    expect(pulseCount).toBeGreaterThanOrEqual(4);
    // 释放 navigation（避免超时）
    await nav.catch(() => {});
  });

  test('E11: 真实埋点 — 清 storage → 访问 / → 等 11s → totalEvents +1 pageview', async ({ page, context }) => {
    await loginAsAdmin(page);
    const before = await getTotalEvents(page);

    // 用 incognito context 防止 analytics buffer 污染
    const ctx2 = await context.browser()!.newContext();
    const page2 = await ctx2.newPage();
    // 直接 GET / 触发 pageview
    await page2.goto('/');
    // 等 11s 让 flush 触发
    await page2.waitForTimeout(11_000);
    await ctx2.close();

    // 重新查 stats
    const after = await getTotalEvents(page);
    expect(after).toBe(before + 1);
  });

  test('E12: 跨页 — 访问 / → /product/electric-steps → 各 +1 条', async ({ page, context }) => {
    await loginAsAdmin(page);
    const before = await getTotalEvents(page);

    const ctx2 = await context.browser()!.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto('/');
    await page2.waitForTimeout(1000);
    await page2.goto('/product/electric-steps');
    await page2.waitForTimeout(11_000);
    await ctx2.close();

    const after = await getTotalEvents(page);
    expect(after).toBe(before + 2);
  });

  test('E13: admin 路由不埋点 — 访问 /admin/dashboard → totalEvents 不变', async ({ page, context }) => {
    await loginAsAdmin(page);
    const before = await getTotalEvents(page);

    // 走 incognito 防 buffer
    const ctx2 = await context.browser()!.newContext();
    const page2 = await ctx2.newPage();
    // 不登录，直接访问 admin 路由
    await page2.goto('/admin/dashboard');
    await page2.waitForTimeout(11_000);
    await ctx2.close();

    const after = await getTotalEvents(page);
    expect(after).toBe(before);
  });

  test('E14: sendBeacon 触发 — 访问 / 后关闭页面，DB +1', async ({ page, context }) => {
    await loginAsAdmin(page);
    const before = await getTotalEvents(page);

    const ctx2 = await context.browser()!.newContext();
    const page2 = await ctx2.newPage();
    await page2.goto('/');
    // 不等 10s 定时器；直接 close → 触发 beforeunload → flush
    await page2.waitForTimeout(1500);
    await page2.close();
    await ctx2.close();

    // wait 一会儿让 sendBeacon 请求完成
    await page.waitForTimeout(2000);
    const after = await getTotalEvents(page);
    expect(after).toBe(before + 1);
  });
});
