import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const OUT = join(ROOT, "docs", "design-reviews", "screenshots");
const BASE_URL = "http://localhost:3000";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

mkdirSync(join(OUT, "desktop"), { recursive: true });
mkdirSync(join(OUT, "mobile"), { recursive: true });

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    const resp = await page.goto(`${BASE_URL}/brand`, { waitUntil: "networkidle", timeout: 30_000 });
    await page.waitForTimeout(800);
    const file = join(OUT, vp.name, "public-brand.png");
    await page.screenshot({ path: file, fullPage: true });
    console.log(`[ok] /brand @ ${vp.name} → HTTP ${resp.status()} → ${file.replace(ROOT + "/", "")}`);
  } catch (e) {
    console.log(`[fail] /brand @ ${vp.name} → ${e.message}`);
  }
  await ctx.close();
}
await browser.close();
