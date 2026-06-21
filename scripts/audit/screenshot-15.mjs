#!/usr/bin/env node
/**
 * 视觉质量审计专用截图 — 15 核心页 × 2 视口(desktop 1440 + mobile 390)
 *
 * 与 screenshot-all.mjs 的差异:
 *   - 路由固定为 15 个核心页(公开 10 + admin 5),不调用 collectRoutes
 *   - 视口仅 desktop + mobile(跳过 tablet)
 *   - 输出目录改为 docs/design-reviews/screenshots/
 *   - 不启动 dev server(必须外部起好,BASE_URL 默认 http://localhost:3000)
 *   - 不输出 INDEX.md(由人工 / 评分阶段写 docs/design-reviews/INDEX.md)
 *
 * 用法:
 *   node scripts/audit/screenshot-15.mjs
 *
 * 环境变量:
 *   BASE_URL   默认 http://localhost:3000
 *   ADMIN_USER 默认 admin
 *   ADMIN_PASS 默认 admin123
 */

import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const OUT = join(ROOT, "docs", "design-reviews", "screenshots");

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

// 15 核心路由(公开 10 + admin 5),与 prd.md §2.1 一致
const ROUTES = [
  // 公开站
  { kind: "public", slug: "public-home", path: "/" },
  { kind: "public", slug: "public-product", path: "/product" },
  { kind: "public", slug: "public-product-wenjie", path: "/product/wenjie" },
  { kind: "public", slug: "public-product-xiaomi", path: "/product/xiaomi" },
  { kind: "public", slug: "public-product-zeekr", path: "/product/zeekr" },
  { kind: "public", slug: "public-product-flooring", path: "/product/flooring" },
  { kind: "public", slug: "public-product-window-film", path: "/product/window-film" },
  { kind: "public", slug: "public-agent", path: "/agent" },
  { kind: "public", slug: "public-news", path: "/news" },
  { kind: "public", slug: "public-brand-about", path: "/brand/about" },
  // admin 后台
  { kind: "admin", slug: "admin-login", path: "/admin/login" },
  { kind: "admin", slug: "admin-dashboard", path: "/admin", requiresAdmin: true },
  { kind: "admin", slug: "admin-analytics", path: "/admin/analytics", requiresAdmin: true },
  { kind: "admin", slug: "admin-stores", path: "/admin/stores", requiresAdmin: true },
  { kind: "admin", slug: "admin-articles", path: "/admin/articles", requiresAdmin: true },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle", timeout: 30_000 });
  await page.fill("#username", ADMIN_USER);
  await page.fill("#password", ADMIN_PASS);
  await Promise.all([
    page.waitForURL((u) => !u.toString().includes("/admin/login"), { timeout: 15_000 }),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState("networkidle", { timeout: 15_000 });
  if (page.url().includes("/admin/login")) {
    throw new Error(`admin 登录失败:URL 仍为 ${page.url()}`);
  }
  console.log(`[ok] admin 已登录 @ ${page.url()}`);
}

async function main() {
  mkdirSync(join(OUT, "desktop"), { recursive: true });
  mkdirSync(join(OUT, "mobile"), { recursive: true });

  // 探活 dev server
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(3000) });
    console.log(`[ok] ${BASE_URL} reachable · status=${res.status}`);
  } catch (e) {
    console.error(`[fatal] ${BASE_URL} 不可达,请先 npm run dev`);
    process.exit(2);
  }

  const browser = await chromium.launch();
  const results = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    let adminLoggedIn = false;

    for (const r of ROUTES) {
      const needsLogin = r.requiresAdmin === true;
      const page = await ctx.newPage();
      const url = `${BASE_URL}${r.path}`;
      try {
        if (needsLogin && !adminLoggedIn) {
          await loginAsAdmin(page);
          adminLoggedIn = true;
        }
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
        await page.waitForTimeout(800); // 等动画 / 图片 lazyload
        const file = join(OUT, vp.name, `${r.slug}.png`);
        await page.screenshot({ path: file, fullPage: true });
        const status = resp ? resp.status() : 0;
        console.log(`[ok] ${r.slug} @ ${vp.name} → HTTP ${status} → ${file.replace(ROOT + "/", "")}`);
        results.push({ slug: r.slug, route: r.path, viewport: vp.name, kind: r.kind, status: status < 400 ? "ok" : "http-error", httpStatus: status });
      } catch (err) {
        console.log(`[fail] ${r.slug} @ ${vp.name} → ${err.message?.slice(0, 100)}`);
        results.push({ slug: r.slug, route: r.path, viewport: vp.name, kind: r.kind, status: "failed", error: err.message });
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }

  await browser.close();

  const okCount = results.filter((r) => r.status === "ok").length;
  console.log(`\n[summary] ${results.length} 截图, ${okCount} 成功, ${results.length - okCount} 失败`);
  process.exit(okCount === results.length ? 0 : 1);
}

main().catch((err) => {
  console.error("[crrash]", err);
  process.exit(2);
});