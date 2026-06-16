#!/usr/bin/env node
/**
 * 截取 /product 和 /product/zeekr 的桌面 1440px + 移动 390px 截图
 * 用于 ZEEKR Build Subtask 6 视觉验证
 *
 * 用法:先 npm run dev,然后 node scripts/screenshot-zeekr.mjs
 * 输出:docs/test-reports/zeekr-screenshots/
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs/test-reports/zeekr-screenshots");
mkdirSync(OUT, { recursive: true });

const BASE = "http://localhost:3000";
const PAGES = [
  { path: "/product", name: "product" },
  { path: "/product/zeekr", name: "product-zeekr" },
];
const VIEWPORTS = [
  { width: 1440, height: 900, name: "desktop-1440" },
  { width: 390, height: 844, name: "mobile-390" },
];

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  for (const p of PAGES) {
    const page = await ctx.newPage();
    await page.goto(BASE + p.path, { waitUntil: "networkidle", timeout: 30_000 });
    // 等图片懒加载完成
    await page.waitForTimeout(1500);
    const file = join(OUT, `${p.name}.${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`  ✓ ${file}`);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log("\n[done] screenshots saved to docs/test-reports/zeekr-screenshots/");
