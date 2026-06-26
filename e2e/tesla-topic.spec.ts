import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`tesla-topic-${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/product/tesla", { waitUntil: "networkidle" });
    await expect(page).toHaveTitle(/特斯拉/);
    await expect(page.locator("h1").first()).toBeVisible();
    mkdirSync(`docs/test-reports/tesla-topic-2026-06-26/${vp.name}`, { recursive: true });
    await page.screenshot({
      path: `docs/test-reports/tesla-topic-2026-06-26/${vp.name}/tesla-topic.png`,
      fullPage: true,
    });
  });
}