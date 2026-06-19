#!/usr/bin/env node
/**
 * 多视口全站截图 — 三视口(desktop 1440 / tablet 768 / mobile 390)
 * 用法:
 *   node scripts/audit/screenshot-all.mjs [--dry-run] [--with-admin]
 * 环境变量:
 *   BASE_URL  默认 http://localhost:3000(可用已起的 dev server)
 *
 * 输出: docs/audits/screenshots/{desktop|tablet|mobile}/{slug}.png
 *       docs/audits/screenshots/INDEX.md
 */

import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { collectRoutes, slugify, VIEWPORTS } from "./lib/collect-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const OUT = join(ROOT, "docs", "audits", "screenshots");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const DRY_RUN = process.argv.includes("--dry-run");
const WITH_ADMIN = process.argv.includes("--with-admin");
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

const VIEWPORT_LIST = [VIEWPORTS.DESKTOP, VIEWPORTS.TABLET, VIEWPORTS.MOBILE];

// ── admin 登录 helper ──
async function loginAsAdmin(page) {
  await page.goto(`${BASE_URL.replace(/\/$/, "")}/admin/login`, { waitUntil: "networkidle", timeout: 30_000 });
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

// 路由输出目录:admin → admin/{viewport}/,公开 → {viewport}/
function outDirFor(routePath) {
  return routePath.startsWith("/admin") ? "admin" : "";
}

// ── dev server 生命周期 ──
let devChild = null;

async function waitFor(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function startDevServerIfNeeded() {
  if (process.env.BASE_URL && process.env.BASE_URL !== "http://localhost:3000") return; // 复用外部
  console.log("[dev] 启动 npm run dev ...");
  devChild = spawn("npm", ["run", "dev"], {
    cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], detached: false,
  });
  devChild.stdout.on("data", (d) => process.stdout.write(`[dev] ${d}`));
  devChild.stderr.on("data", (d) => process.stderr.write(`[dev] ${d}`));

  const ok = await waitFor(BASE_URL, 60_000);
  if (!ok) {
    devChild?.kill("SIGTERM");
    throw new Error(`dev server 未在 60s 内就绪 @ ${BASE_URL}`);
  }
  console.log(`[ok] dev server ready @ ${BASE_URL}`);
}

function stopDevServer() {
  if (!devChild) return;
  try { devChild.kill("SIGTERM"); } catch {}
  devChild = null;
}

// ── 主流程 ──
async function main() {
  mkdirSync(OUT, { recursive: true });
  for (const vp of VIEWPORT_LIST) {
    mkdirSync(join(OUT, vp.name), { recursive: true });
    if (WITH_ADMIN) mkdirSync(join(OUT, "admin", vp.name), { recursive: true });
  }

  if (!DRY_RUN) await startDevServerIfNeeded();

  const routes = await collectRoutes({ withAdmin: WITH_ADMIN, withDynamic: true, baseUrl: BASE_URL });
  console.log(`[plan] 共 ${routes.length} 条路由 x ${VIEWPORT_LIST.length} 视口`);

  if (DRY_RUN) {
    for (const r of routes) {
      for (const vp of VIEWPORT_LIST) {
        console.log(`[dry] ${r.path} @ ${vp.width}x${vp.height}`);
      }
    }
    console.log("[dry-run] 完成,无实际截图");
    stopDevServer();
    process.exit(0);
  }

  const browser = await chromium.launch();
  const results = []; // { slug, viewport, status, error? }

  // 第一个视口建一个专用 context 跑 admin 登录(后续视口可复用 cookie)
  let adminCtx = null;
  let adminPage = null;

  for (const vp of VIEWPORT_LIST) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });

    // 第一次进 admin 路由前登录
    let adminLoggedIn = false;

    for (const r of routes) {
      const isAdmin = r.path.startsWith("/admin");
      const needsLogin = isAdmin && r.requiresAdmin;
      const url = `${BASE_URL.replace(/\/$/, "")}${r.path}`;
      const page = await ctx.newPage();
      try {
        if (needsLogin && !adminLoggedIn) {
          await loginAsAdmin(page);
          adminLoggedIn = true;
        }
        const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
        await page.waitForTimeout(500);
        const subdir = outDirFor(r.path);
        const file = join(OUT, subdir, vp.name, `${slugify(r.path)}.png`);
        await page.screenshot({ path: file, fullPage: true });
        const status = resp ? resp.status() : 0;
        console.log(`[ok] ${r.path} @ ${vp.name}${isAdmin ? " [ADMIN]" : ""} → ${status}`);
        results.push({ slug: slugify(r.path), route: r.path, viewport: vp.name, isAdmin, status: status < 400 ? "ok" : "http-error", httpStatus: status });
      } catch (err) {
        console.log(`[fail] ${r.path} @ ${vp.name} → ${err.message?.slice(0, 80)}`);
        results.push({ slug: slugify(r.path), route: r.path, viewport: vp.name, isAdmin, status: "failed", error: err.message });
      } finally {
        await page.close();
      }
    }
    await ctx.close();
  }

  await browser.close();

  // ── INDEX.md ──
  const byRoute = new Map();
  for (const r of results) {
    const key = r.route;
    if (!byRoute.has(key)) byRoute.set(key, {});
    byRoute.get(key)[r.viewport] = r;
  }
  const publicRoutes = [...byRoute.keys()].filter((r) => !r.startsWith("/admin")).sort();
  const adminRoutes  = [...byRoute.keys()].filter((r) =>  r.startsWith("/admin")).sort();

  const lines = [
    "# Screenshot Audit Index",
    "",
    `生成时间: ${new Date().toISOString()} · BASE_URL: ${BASE_URL}`,
    `WITH_ADMIN=${WITH_ADMIN}`,
    "",
    "## 公开站",
    "",
    "| route | desktop | tablet | mobile | status |",
    "|---|---|---|---|---|",
  ];
  for (const route of publicRoutes) {
    const vps = byRoute.get(route);
    const d = vps.desktop?.status ?? "—";
    const t = vps.tablet?.status  ?? "—";
    const m = vps.mobile?.status  ?? "—";
    const overall = (d === "ok" && t === "ok" && m === "ok") ? "ok" : "partial/failed";
    lines.push(`| ${route} | ${d} | ${t} | ${m} | ${overall} |`);
  }
  if (WITH_ADMIN && adminRoutes.length) {
    lines.push("", "## /admin 后台(需登录)", "");
    lines.push("| route | desktop | tablet | mobile | status |");
    lines.push("|---|---|---|---|---|");
    for (const route of adminRoutes) {
      const vps = byRoute.get(route);
      const d = vps.desktop?.status ?? "—";
      const t = vps.tablet?.status  ?? "—";
      const m = vps.mobile?.status  ?? "—";
      const overall = (d === "ok" && t === "ok" && m === "ok") ? "ok" : "partial/failed";
      lines.push(`| ${route} | ${d} | ${t} | ${m} | ${overall} |`);
    }
  }
  lines.push("", `共 ${results.length} 条截图 · ${results.filter((r) => r.status === "ok").length} 成功 · ${adminRoutes.length} admin 路由`);
  writeFileSync(join(OUT, "INDEX.md"), lines.join("\n"), "utf8");
  console.log(`[ok] INDEX.md written (${results.length} rows, ${adminRoutes.length} admin)`);

  stopDevServer();
  process.exit(results.some((r) => r.status === "ok") ? 0 : 1);
}

main().catch((err) => {
  console.error("[crash]", err);
  stopDevServer();
  process.exit(2);
});
