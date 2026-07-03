import { chromium } from 'playwright';

const OUT = '/tmp/lanhui-screenshots';
import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const browser = await chromium.launch();

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Full-page screenshot
  await page.screenshot({
    path: `${OUT}/home-${vp.name}-fullpage.png`,
    fullPage: true,
  });

  // Viewport screenshot (above the fold)
  await page.screenshot({
    path: `${OUT}/home-${vp.name}-viewport.png`,
    fullPage: false,
  });

  console.log(`Done: ${vp.name} (fullpage + viewport)`);
  await ctx.close();
}

await browser.close();
console.log('All screenshots captured.');
