import { test, expect, type Page } from '@playwright/test';

/**
 * NIO ES8 专题页验收（plan §F.2 + §F.4 + §F.5）
 *
 * 覆盖:
 *   - 1 页 × 3 视口 (390 / 768 / 1440) = 3 张截图
 *   - mobile 视口无横向溢出 (scrollWidth === clientWidth)
 *   - /product 入口折叠区存在指向 /product/nio/es8 的链接
 *
 * 路径: /product/nio/es8 (status: planned, 页面可访问)
 * 输出: docs/test-reports/nio-es8-2026-06-27/{viewport}/nio-es8.png
 */

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];
const ROUTE = '/product/nio/es8';
const PRODUCT_INDEX = '/product';

async function captureErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

for (const vp of VIEWPORTS) {
  test(`nio-es8-verify @ ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    const errors = await captureErrors(page);

    const resp = await page.goto(ROUTE, { waitUntil: 'networkidle' });
    expect(resp?.status()).toBe(200);

    const h1 = await page.locator('h1').first().textContent();
    expect(h1).toBeTruthy();

    // F.4 — mobile 横向溢出检查（所有视口都跑，最严格只看 mobile）
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    if (vp.name === 'mobile') {
      expect(overflow).toBe(false);
    }

    await page.screenshot({
      path: `docs/test-reports/nio-es8-2026-06-27/${vp.name}/nio-es8.png`,
      fullPage: true,
    });

    if (errors.length > 0) {
      console.log(`[ERRORS] ${vp.name}: ${errors.join(' | ')}`);
    }
  });
}

test('nio-es8-verify /product 折叠区入口', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PRODUCT_INDEX, { waitUntil: 'networkidle' });

  // F.5 — 入口折叠区断言：至少存在 1 个指向 /product/nio/es8 的链接
  const linkCount = await page
    .locator('a[href="/product/nio/es8"]')
    .count();
  expect(linkCount).toBeGreaterThanOrEqual(1);

  // mobile 点击跳转验证（折叠区可能隐藏，强制 click 第一个匹配）
  const link = page.locator('a[href="/product/nio/es8"]').first();
  await link.click({ trial: false }).catch(() => {
    // 折叠区隐藏时，强制派发 click 跳过可见性检查
    return link.evaluate((el) => (el as HTMLAnchorElement).click());
  });
  await page.waitForURL(/\/product\/nio\/es8/);
  expect(page.url()).toContain('/product/nio/es8');
});
