#!/usr/bin/env node
/**
 * 全站路由可达性扫描 — 2026-06-29
 *
 * 用法:
 *   node scripts/test/functional-suite.mjs
 *
 * 环境变量:
 *   BASE_URL    默认 http://localhost:3000
 *   WITH_ADMIN  默认 false ("true" 启用 admin 路由扫描)
 *   OUTPUT      默认 docs/test-reports/2026-06-29/functional-scan.json
 *
 * 输出:
 *   JSON 文件 + stdout 摘要表格
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

const BASE_URL = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const WITH_ADMIN = process.env.WITH_ADMIN === "true";
const OUTPUT = process.env.OUTPUT || join(REPO_ROOT, "docs", "test-reports", "2026-06-29", "functional-scan.json");
const TIMEOUT_MS = 15_000;

// ── 全站公开路由 ── (同步更新于 2026-06-29)
const PUBLIC_ROUTES = [
  // 首页 & 品牌
  "/", "/contact", "/brand", "/brand/certifications", "/brand/history",
  // 新闻
  "/news",
  // 代理
  "/agent",
  // 产品中心
  "/product",
  // 服务线
  "/product/ppf", "/product/color-film", "/product/window-film",
  "/product/flooring", "/product/chassis", "/product/electric-steps",
  "/product/wheels", "/product/skid-plate", "/product/floor-mats",
  "/product/business-comfort",
  // 问界
  "/product/wenjie", "/product/wenjie/m6", "/product/wenjie/m7", "/product/wenjie/m8",
  // 小米
  "/product/xiaomi", "/product/xiaomi/su7", "/product/xiaomi/yu7",
  // 极氪
  "/product/zeekr", "/product/zeekr/8x", "/product/zeekr/9x",
  // 理想
  "/product/li-auto", "/product/li-auto/one", "/product/li-auto/i6",
  "/product/li-auto/i8", "/product/li-auto/l9", "/product/li-auto/mega",
  // Tesla
  "/product/tesla",
  // 小鹏
  "/product/xpeng", "/product/xpeng/gx",
  // NIO
  "/product/nio", "/product/nio/es8",
  // 腾势
  "/product/denza", "/product/denza/d9",
  // 岚图
  "/product/voyah", "/product/voyah/dreamer",
  // 高山
  "/product/gaoshan", "/product/gaoshan/8",
  // 乐道
  "/product/ledao", "/product/ledao/l90",
  // 智界
  "/product/zhijie", "/product/zhijie/v9",
];

const ADMIN_ROUTES = [
  "/admin/login",
  "/admin",
  "/admin/analytics",
  "/admin/articles",
  "/admin/articles/new",
  "/admin/stores",
  "/admin/stores/new",
];

/**
 * 扫描单个路由
 */
async function scanRoute(page, route, label, opts = {}) {
  const result = {
    route,
    label: label || route.replace(/\//g, "__") || "root",
    status: 0,
    ok: false,
    title: null,
    h1: null,
    consoleErrors: [],
    durationMs: 0,
    error: null,
  };

  const start = Date.now();
  try {
    const res = await page.goto(`${BASE_URL}${route}`, {
      waitUntil: opts.waitUntil || "networkidle",
      timeout: TIMEOUT_MS,
    });
    result.status = res?.status() ?? 0;
    result.ok = result.status >= 200 && result.status < 400;
    result.title = await page.title().catch(() => null);
    result.h1 = await page.$eval("h1", (el) => el.textContent?.trim() || null).catch(() => null);
  } catch (err) {
    result.error = err.message;
  }
  result.durationMs = Date.now() - start;
  return result;
}

async function main() {
  console.log(`[functional-suite] BASE=${BASE_URL} WITH_ADMIN=${WITH_ADMIN}`);
  console.log(`[functional-suite] public routes: ${PUBLIC_ROUTES.length}`);

  const results = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    public: [],
    admin: [],
    summary: {},
  };

  // 收集 console errors
  const consoleErrors = [];

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // 忽略 next/font preload 无害警告
      if (text.includes("Failed to find font") || text.includes("preloaded")) return;
      consoleErrors.push(text);
    }
  });

  // ── 1) 公开路由 ──
  let i = 0;
  for (const route of PUBLIC_ROUTES) {
    i++;
    const label = route.replace(/^\//, "").replace(/\//g, "__") || "root";
    process.stdout.write(`  [${String(i).padStart(2)}/${PUBLIC_ROUTES.length}] ${route}... `);
    const r = await scanRoute(page, route, label);
    r.consoleErrors = [...consoleErrors];
    consoleErrors.length = 0; // 每个路由清空
    results.public.push(r);
    const icon = r.ok ? "✓" : r.error ? "✗" : "⚠";
    process.stdout.write(`${icon} ${r.status} ${r.durationMs}ms`);
    if (!r.ok) process.stdout.write(` [${r.error || `status ${r.status}`}]`);
    if (!r.title) process.stdout.write(" [no title]");
    if (!r.h1) process.stdout.write(" [no h1]");
    console.log("");
  }

  // ── 2) Admin 路由 ──
  if (WITH_ADMIN) {
    console.log(`[functional-suite] admin routes: ${ADMIN_ROUTES.length}`);
    // 先登录
    try {
      await page.goto(`${BASE_URL}/admin/login`, { waitUntil: "networkidle", timeout: TIMEOUT_MS });
      await page.fill('input[name="username"]', process.env.ADMIN_USER || "admin");
      await page.fill('input[name="password"]', process.env.ADMIN_PASS || "admin123");
      await page.click('button[type="submit"]');
      await page.waitForURL("**/admin**", { timeout: 5000 }).catch(() => {});
    } catch (err) {
      console.log(`[functional-suite] admin login skipped: ${err.message}`);
    }

    for (const route of ADMIN_ROUTES) {
      process.stdout.write(`  admin: ${route}... `);
      const r = await scanRoute(page, route, `admin-${route.replace(/\//g, "-")}`, { waitUntil: "load" });
      r.consoleErrors = [...consoleErrors];
      consoleErrors.length = 0;
      results.admin.push(r);
      const icon = r.ok ? "✓" : r.status === 302 || r.status === 303 ? "→" : "✗";
      process.stdout.write(`${icon} ${r.status} ${r.durationMs}ms`);
      if (!r.ok && r.status !== 302) process.stdout.write(` [${r.error || `status ${r.status}`}]`);
      console.log("");
    }
  }

  await browser.close();

  // ── 汇总 ──
  const allRoutes = [...results.public, ...results.admin];
  const okRoutes = allRoutes.filter((r) => r.ok);
  const failRoutes = allRoutes.filter((r) => !r.ok && r.status !== 302 && r.status !== 303);
  const noTitle = allRoutes.filter((r) => r.ok && !r.title);
  const noH1 = allRoutes.filter((r) => r.ok && !r.h1);
  const withConsoleErrors = allRoutes.filter((r) => r.consoleErrors.length > 0);
  const avgDuration = Math.round(allRoutes.reduce((a, r) => a + r.durationMs, 0) / Math.max(1, allRoutes.length));

  results.summary = {
    totalRoutes: allRoutes.length,
    ok: okRoutes.length,
    fail: failRoutes.length,
    redirect: allRoutes.filter((r) => r.status === 302 || r.status === 303).length,
    noTitle: noTitle.length,
    noTitleList: noTitle.map((r) => r.route),
    noH1: noH1.length,
    noH1List: noH1.map((r) => r.route),
    withConsoleErrors: withConsoleErrors.length,
    withConsoleErrorsList: withConsoleErrors.map((r) => r.route),
    failList: failRoutes.map((r) => ({ route: r.route, status: r.status, error: r.error })),
    avgDurationMs: avgDuration,
    maxDurationMs: Math.max(...allRoutes.map((r) => r.durationMs)),
  };
  results.completedAt = new Date().toISOString();

  // 写入
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\n[functional-suite] wrote ${OUTPUT}`);

  // 摘要
  const s = results.summary;
  console.log(`\n${"─".repeat(50)}`);
  console.log("SUMMARY");
  console.log(`${"─".repeat(50)}`);
  console.log(`  Routes scanned: ${s.totalRoutes}`);
  console.log(`  OK (200):       ${s.ok}`);
  console.log(`  Redirect:       ${s.redirect}`);
  console.log(`  FAIL:           ${s.fail}`);
  console.log(`  No title:       ${s.noTitle} ${s.noTitleList.length ? "→ " + s.noTitleList.join(", ") : ""}`);
  console.log(`  No h1:          ${s.noH1} ${s.noH1List.length ? "→ " + s.noH1List.join(", ") : ""}`);
  console.log(`  Console errors: ${s.withConsoleErrors}`);
  console.log(`  Avg duration:   ${s.avgDurationMs}ms`);
  console.log(`  Max duration:   ${s.maxDurationMs}ms`);

  if (s.fail > 0) {
    console.log(`\n  FAILED ROUTES:`);
    for (const f of s.failList) {
      console.log(`    ${f.route} → ${f.status} ${f.error || ""}`);
    }
  }

  process.exit(s.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("[functional-suite] FATAL:", err);
  process.exit(1);
});
