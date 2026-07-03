import { test, expect, type Page } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];
const ROUTES = [
  { path: '/product/wenjie', name: 'l1' },
  { path: '/product/wenjie/m6', name: 'm6' },
  { path: '/product/wenjie/m7', name: 'm7' },
  { path: '/product/wenjie/m8', name: 'm8' },
];

async function captureErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

for (const vp of VIEWPORTS) {
  for (const r of ROUTES) {
    test(`wenjie-verify ${r.name} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = await captureErrors(page);
      const resp = await page.goto(r.path, { waitUntil: 'networkidle' });
      expect(resp?.status()).toBe(200);
      const h1 = await page.locator('h1').first().textContent();
      expect(h1).toBeTruthy();
      await page.screenshot({
        path: `/tmp/wenjie-audit/${r.name}-${vp.name}.png`,
        fullPage: true,
      });
      if (errors.length > 0) {
        console.log(`[ERRORS] ${r.name} @ ${vp.name}: ${errors.join(' | ')}`);
      }
    });
  }
}
