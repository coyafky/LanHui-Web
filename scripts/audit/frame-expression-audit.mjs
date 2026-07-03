#!/usr/bin/env node
/**
 * 页面表达逐帧截图审计
 *
 * 输出:
 * - docs/design-reviews/screenshots/2026-06-29-frame-audit/{desktop|mobile}/*.png
 * - docs/design-reviews/screenshots/2026-06-29-frame-audit/frames.json
 *
 * 用法:
 *   BASE_URL=http://localhost:3000 node scripts/audit/frame-expression-audit.mjs
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const OUT = join(
  ROOT,
  "docs",
  "design-reviews",
  "screenshots",
  "2026-06-29-frame-audit",
);

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const ROUTES = [
  { slug: "home", path: "/", label: "首页" },
  { slug: "product", path: "/product", label: "产品中心" },
  { slug: "wenjie", path: "/product/wenjie", label: "问界专题" },
  { slug: "xiaomi", path: "/product/xiaomi", label: "小米专题" },
  { slug: "zeekr", path: "/product/zeekr", label: "极氪专题" },
  { slug: "window-film", path: "/product/window-film", label: "汽车窗膜" },
  { slug: "agent", path: "/agent", label: "门店网络" },
  { slug: "brand", path: "/brand", label: "品牌页" },
  { slug: "news", path: "/news", label: "资讯页" },
  { slug: "contact", path: "/contact", label: "联系页" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, maxFrames: 4 },
  { name: "mobile", width: 390, height: 844, maxFrames: 5 },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getPageFacts(page) {
  return page.evaluate(() => {
    const text = (node) => node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    const headings = [...document.querySelectorAll("h1,h2,h3")]
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: text(el),
      }))
      .filter((h) => h.text)
      .slice(0, 24);
    const ctas = [...document.querySelectorAll("a,button")]
      .map((el) => text(el))
      .filter(Boolean)
      .filter((label, index, arr) => arr.indexOf(label) === index)
      .slice(0, 36);
    return {
      title: document.title,
      h1: text(document.querySelector("h1")),
      height: Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      ),
      headings,
      ctas,
    };
  });
}

async function getVisibleFacts(page) {
  return page.evaluate(() => {
    const viewportHeight = window.innerHeight;
    const isVisible = (el) => {
      const rect = el.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < viewportHeight && rect.width > 0 && rect.height > 0;
    };
    const text = (node) => node?.textContent?.replace(/\s+/g, " ").trim() ?? "";
    return {
      headings: [...document.querySelectorAll("h1,h2,h3")]
        .filter(isVisible)
        .map((el) => `${el.tagName.toLowerCase()}: ${text(el)}`)
        .filter(Boolean),
      ctas: [...document.querySelectorAll("a,button")]
        .filter(isVisible)
        .map(text)
        .filter(Boolean)
        .filter((label, index, arr) => arr.indexOf(label) === index)
        .slice(0, 12),
      bodyText: text(document.body).slice(0, 600),
    };
  });
}

async function main() {
  for (const vp of VIEWPORTS) mkdirSync(join(OUT, vp.name), { recursive: true });

  const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
  if (res.status >= 500) throw new Error(`${BASE_URL} returned ${res.status}`);

  const browser = await chromium.launch();
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    routes: [],
  };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    for (const route of ROUTES) {
      const page = await context.newPage();
      const url = `${BASE_URL}${route.path}`;
      const routeRecord = {
        ...route,
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        frames: [],
      };

      try {
        const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
        await sleep(700);
        const facts = await getPageFacts(page);
        routeRecord.status = response?.status() ?? 0;
        routeRecord.facts = facts;

        const maxScroll = Math.max(0, facts.height - vp.height);
        const frameCount = Math.min(
          vp.maxFrames,
          Math.max(1, Math.ceil(facts.height / vp.height)),
        );
        const positions = frameCount === 1
          ? [0]
          : Array.from({ length: frameCount }, (_, i) =>
              Math.round((maxScroll * i) / (frameCount - 1)),
            );

        for (let i = 0; i < positions.length; i += 1) {
          const y = positions[i];
          await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
          await sleep(350);
          const visible = await getVisibleFacts(page);
          const filename = `${route.slug}-frame-${String(i + 1).padStart(2, "0")}.png`;
          const path = join(OUT, vp.name, filename);
          await page.screenshot({ path, fullPage: false });
          routeRecord.frames.push({
            index: i + 1,
            scrollY: y,
            filename: `${vp.name}/${filename}`,
            visible,
          });
          console.log(`[ok] ${route.path} ${vp.name} frame ${i + 1}/${positions.length}`);
        }
      } catch (error) {
        routeRecord.error = error.message;
        console.log(`[fail] ${route.path} ${vp.name}: ${error.message}`);
      } finally {
        manifest.routes.push(routeRecord);
        await page.close();
      }
    }
    await context.close();
  }

  await browser.close();
  writeFileSync(join(OUT, "frames.json"), JSON.stringify(manifest, null, 2), "utf8");
  console.log(`[done] ${join(OUT, "frames.json")}`);
}

main().catch((error) => {
  console.error("[crash]", error);
  process.exit(1);
});
