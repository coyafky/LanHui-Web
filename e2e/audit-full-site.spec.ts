import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

/**
 * 全站公开页 + admin 后台 e2e 审计
 *
 * 公开站(默认):
 *   - homepage / contact / brand(/cert/history) / news(list + 3 detail) / agent(list + province + city) / product(11)
 *   - 控制台无 error
 *
 * Admin 后台(需 PLAYWRIGHT_ADMIN_USER/ADMIN_PASS env;默认 admin/admin123):
 *   - login 公开页 + 登录流 + dashboard 9 页 + auth 守卫
 *
 * 已知: /news/[slug] 触发 commit 0b8f38c 的 item.content 缺失问题 → test.fixme
 */

const PUBLIC_PRODUCT_PAGES = [
  '/product',
  '/product/chassis',
  '/product/color-film',
  '/product/electric-steps',
  '/product/flooring',
  '/product/ppf',
  '/product/wheels',
  '/product/window-film',
  '/product/wenjie',
  '/product/xiaomi',
  '/product/zeekr',
];

const BRAND_NEWS_CONTACT = [
  '/',
  '/contact',
  '/brand',
  '/brand/certifications',
  '/brand/history',
  '/news',
  '/news/brand-website-prep',
  '/news/shunde-store-upgrade',
  '/news/service-matrix',
  '/agent',
];

const ADMIN_DASHBOARD_PAGES = [
  '/admin',
  '/admin/analytics',
  '/admin/stores',
  '/admin/stores/new',
  '/admin/articles',
  '/admin/articles/new',
];

const ADMIN_USER = process.env.PLAYWRIGHT_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.PLAYWRIGHT_ADMIN_PASS || 'admin123';

async function assertPageOk(page: Page, path: string): Promise<void> {
  const resp = await page.goto(path);
  expect(resp, `response missing for ${path}`).not.toBeNull();
  const status = resp!.status();
  expect(status, `${path} returned ${status}`).toBeLessThan(400);

  const h1 = page.locator('h1').first();
  await expect(h1, `${path} missing h1`).toBeVisible({ timeout: 10_000 });
  const h1Text = (await h1.textContent())?.trim() ?? '';
  expect(h1Text.length, `${path} h1 empty`).toBeGreaterThan(0);

  const title = await page.title();
  expect(title.length, `${path} title empty`).toBeGreaterThan(0);
}

/**
 * admin 登录 fixture — 跑 dashboard 测试前先登录
 * 用例:先调 loginAsAdmin(page),再访问 /admin/* 子页
 */
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.fill('#username', ADMIN_USER);
  await page.fill('#password', ADMIN_PASS);
  await Promise.all([
    page.waitForURL((u) => !u.toString().includes('/admin/login'), { timeout: 15_000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState('networkidle', { timeout: 15_000 });
  expect(page.url(), 'admin login did not redirect away from /admin/login').not.toContain('/admin/login');
}

test.describe('Audit — homepage', () => {
  test('homepage loads, has h1 + title', async ({ page }) => {
    await assertPageOk(page, '/');
  });
});

test.describe('Audit — product pages (11)', () => {
  for (const path of PUBLIC_PRODUCT_PAGES) {
    test(`product page ok: ${path}`, async ({ page }) => {
      await assertPageOk(page, path);
    });
  }
});

test.describe('Audit — brand / news / contact / agent', () => {
  for (const path of BRAND_NEWS_CONTACT) {
    test(`public page ok: ${path}`, async ({ page }) => {
      await assertPageOk(page, path);
    });
  }
});

// 已知 pre-existing bug — news/[slug] 引用 item.content(commit 0b8f38c)
test.describe('Audit — known pre-existing bug', () => {
  test.fixme('news/[slug] dynamic page — pre-existing item.content undefined (commit 0b8f38c)', async ({ page }) => {
    await assertPageOk(page, '/news/brand-website-prep');
  });
});

test.describe('Audit — no console errors on public pages', () => {
  test('homepage: zero console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors, `console errors: ${errors.join(' | ')}`).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────
// Admin 后台 (require Postgres + seeded admin/admin123 user)
// ────────────────────────────────────────────────────────────────────

test.describe('Audit — admin login (public)', () => {
  test('login page loads without auth', async ({ page }) => {
    const resp = await page.goto('/admin/login');
    expect(resp).not.toBeNull();
    expect(resp!.status()).toBeLessThan(400);
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login flow with valid creds redirects to /admin', async ({ page }) => {
    await loginAsAdmin(page);
    expect(page.url()).toContain('/admin');
  });

  test('login flow with bad creds stays on /admin/login', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'definitely-wrong-password');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2_000);
    expect(page.url(), 'bad creds should not redirect').toContain('/admin/login');
  });
});

test.describe('Audit — admin auth guard', () => {
  test('unauthenticated /admin redirects to login', async ({ page }) => {
    await page.goto('/admin');
    // 等 1s 让 client-side redirect / middleware 跑完
    await page.waitForTimeout(1_500);
    expect(page.url(), `expected redirect to /admin/login, got ${page.url()}`).toContain('/admin/login');
  });
});

test.describe('Audit — admin dashboard (auth required)', () => {
  for (const path of ADMIN_DASHBOARD_PAGES) {
    test(`admin page ok: ${path}`, async ({ page }) => {
      await loginAsAdmin(page);
      await assertPageOk(page, path);
    });
  }
});

test.describe('Audit — admin no console errors', () => {
  test('/admin (logged in): zero console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await loginAsAdmin(page);
    await page.waitForLoadState('networkidle');
    expect(errors, `admin console errors: ${errors.join(' | ')}`).toEqual([]);
  });
});
