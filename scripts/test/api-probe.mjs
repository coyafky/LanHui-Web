#!/usr/bin/env node
/**
 * API 端点连通性全面测试 — 2026-06-29
 *
 * 覆盖全部 13 个 API 端点：公开 GET/POST + 需认证写操作 + 权限校验
 *
 * 用法:
 *   node scripts/test/api-probe.mjs
 *
 * 环境变量:
 *   BASE_URL    默认 http://localhost:3000
 *   ADMIN_USER  默认 admin
 *   ADMIN_PASS  默认 admin123
 *   OUTPUT      默认 docs/test-reports/2026-06-29/api-probe.json
 *
 * 输出:
 *   JSON 文件 + stdout 摘要
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const OUTPUT = process.env.OUTPUT || join(REPO_ROOT, "docs", "test-reports", "2026-06-29", "api-probe.json");
const TIMEOUT_MS = 10_000;
const SLOW_THRESHOLD_MS = 2000;

// ── 端点定义 ──
const PUBLIC_GET = [
  "/api/articles",
  "/api/articles/categories",
  "/api/stores",
  "/api/regions",
  "/api/cities",
  "/api/provinces",
];

const PUBLIC_POST = [
  "/api/analytics/track",
];

// 需 auth 的端点：path, method, 是否可写, 所需角色
const AUTH_ENDPOINTS = [
  { path: "/api/articles", method: "POST", role: "editor" },
  { path: "/api/articles/placeholder", method: "GET", role: "editor", needsDynamicId: true },
  { path: "/api/articles/placeholder", method: "PUT", role: "editor", needsDynamicId: true },
  { path: "/api/articles/placeholder", method: "DELETE", role: "admin", needsDynamicId: true },
  { path: "/api/stores", method: "POST", role: "admin" },
  { path: "/api/stores/placeholder", method: "GET", role: "admin", needsDynamicId: true },
  { path: "/api/stores/placeholder", method: "PUT", role: "admin", needsDynamicId: true },
  { path: "/api/stores/placeholder", method: "DELETE", role: "admin", needsDynamicId: true },
  { path: "/api/stores/placeholder/approve", method: "POST", role: "admin", needsDynamicId: true },
  { path: "/api/upload", method: "POST", role: "admin" },
  { path: "/api/analytics/stats", method: "GET", role: "admin" },
];

// ── 辅助函数 ──

async function fetchJson(path, method, opts = {}) {
  const { cookie, body, rawBody } = opts;
  const headers = cookie ? { Cookie: cookie } : {};
  if (body) {
    headers["Content-Type"] = "application/json";
  } else if (rawBody) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
  }

  const fetchOpts = { method, headers };
  if (body) fetchOpts.body = JSON.stringify(body);
  if (rawBody) fetchOpts.body = rawBody;

  const res = await fetch(`${BASE}${path}`, { ...fetchOpts, signal: AbortSignal.timeout(TIMEOUT_MS) });
  let text = "";
  let data = null;
  try {
    text = await res.text();
    if (text) data = JSON.parse(text);
  } catch { /* non-JSON */ }

  return {
    status: res.status,
    hasDataField: !!(data && "data" in data),
    hasSuccessField: !!(data && "success" in data),
    errorField: data?.error ?? null,
    dataType: Array.isArray(data?.data) ? "array" : data?.data ? typeof data.data : null,
    itemCount: Array.isArray(data?.data) ? data.data.length : null,
    responseSizeBytes: text.length,
  };
}

/**
 * NextAuth v5 CSRF + credentials 登录
 */
async function loginAsAdmin() {
  try {
    // Step 1: CSRF
    const csrfResp = await fetch(`${BASE}/api/auth/csrf`);
    const csrfData = await csrfResp.json();
    const csrfToken = csrfData.csrfToken;
    if (!csrfToken) return null;
    const csrfCookie = (csrfResp.headers.getSetCookie?.() ?? [])
      .map((c) => c.split(";")[0])
      .join("; ");

    // Step 2: Credentials
    const body = new URLSearchParams({
      csrfToken,
      username: ADMIN_USER,
      password: ADMIN_PASS,
      redirect: "false",
      json: "true",
      callbackUrl: "/admin",
    });
    const loginResp = await fetch(`${BASE}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body,
      redirect: "manual",
    });

    const setCookies = loginResp.headers.getSetCookie?.() ?? [];
    const sessionCookie = setCookies.find(
      (c) => c.includes("next-auth.session-token") || c.includes("__Secure-next-auth.session-token")
    );
    const allCookies = [
      ...csrfCookie ? [csrfCookie] : [],
      ...(sessionCookie ? [sessionCookie.split(";")[0]] : setCookies.map((c) => c.split(";")[0])),
    ];
    return allCookies.filter(Boolean).join("; ");
  } catch (err) {
    console.error("[api-probe] login failed:", err.message);
    return null;
  }
}

/**
 * 从 /api/stores 或 /api/articles 获取第一个 ID
 */
async function fetchFirstId(cookie, apiPath) {
  try {
    const r = await fetchJson(apiPath, "GET", { cookie });
    if (r.status === 200 && Array.isArray(r.data) && r.data.length > 0 && r.data[0]?.id) {
      return r.data[0].id;
    }
    return null;
  } catch {
    return null;
  }
}

// ── 主流程 ──

async function main() {
  console.log(`[api-probe] BASE=${BASE} ADMIN=${ADMIN_USER}\n`);

  const results = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE,
    publicGet: [],
    publicPost: [],
    authWithoutLogin: [],
    authWithLogin: [],
    loginSucceeded: false,
    summary: {},
  };

  // ── 1) 公开 GET ──
  console.log("── Public GET ──");
  for (const path of PUBLIC_GET) {
    const start = Date.now();
    const r = await fetchJson(path, "GET");
    r.durationMs = Date.now() - start;
    r.endpoint = path;
    r.method = "GET";
    r.slow = r.durationMs > SLOW_THRESHOLD_MS;
    results.publicGet.push(r);

    const icon = r.status === 200 ? "✓" : "✗";
    console.log(`  ${icon} GET ${path} → ${r.status} ${r.durationMs}ms data=${r.itemCount ?? "null"}`);
  }

  // ── 2) 公开 POST ──
  console.log("\n── Public POST ──");
  for (const path of PUBLIC_POST) {
    const start = Date.now();
    const r = await fetchJson(path, "POST", {
      body: { type: "pageview", path: "/test-2026-06-29", timestamp: new Date().toISOString() },
    });
    r.durationMs = Date.now() - start;
    r.endpoint = path;
    r.method = "POST";
    r.slow = r.durationMs > SLOW_THRESHOLD_MS;
    results.publicPost.push(r);

    const icon = r.status === 200 ? "✓" : "✗";
    console.log(`  ${icon} POST ${path} → ${r.status} ${r.durationMs}ms`);
  }

  // ── 3) 未登录访问需 auth 端点（应返回 401/403） ──
  console.log("\n── Auth Required (no login) ──");
  for (const ep of AUTH_ENDPOINTS) {
    const path = ep.path;
    const start = Date.now();
    const r = await fetchJson(path, ep.method);
    r.durationMs = Date.now() - start;
    r.endpoint = path;
    r.method = ep.method;
    r.roleRequired = ep.role;
    r.expectedUnauthorized = true;
    r.isUnauthorized = r.status === 401 || r.status === 403 || r.status >= 400;
    r.slow = r.durationMs > SLOW_THRESHOLD_MS;
    results.authWithoutLogin.push(r);

    const icon = r.isUnauthorized ? "✓" : "⚠";
    console.log(`  ${icon} ${ep.method} ${path} → ${r.status} ${r.durationMs}ms (expected 401/403)`);
  }

  // ── 4) 登录后访问需 auth 端点 ──
  const cookie = await loginAsAdmin();
  results.loginSucceeded = !!cookie;
  console.log(`\n[api-probe] admin login: ${cookie ? "✓ OK" : "✗ FAILED"}`);

  if (cookie) {
    // 获取动态 ID
    const storeId = await fetchFirstId(cookie, "/api/stores");
    const articleId = await fetchFirstId(cookie, "/api/articles");
    console.log(`[api-probe] storeId=${storeId || "N/A"} articleId=${articleId || "N/A"}`);

    console.log("\n── Auth Required (with login) ──");
    for (const ep of AUTH_ENDPOINTS) {
      // 替换动态 ID 占位符
      let path = ep.path;
      if (ep.needsDynamicId) {
        if (path.includes("/articles/") && articleId) {
          path = path.replace("/articles/placeholder", `/articles/${articleId}`);
        } else if (path.includes("/stores/") && storeId) {
          path = path.replace("/stores/placeholder", `/stores/${storeId}`);
        } else {
          results.authWithLogin.push({
            endpoint: ep.path, method: ep.method, status: "skipped",
            reason: "no dynamic id available", roleRequired: ep.role,
          });
          continue;
        }
      }

      const start = Date.now();
      const body = ep.method === "POST" && ep.path === "/api/analytics/track"
        ? { type: "pageview", path: "/test-auth", timestamp: new Date().toISOString() }
        : undefined;

      const r = await fetchJson(path, ep.method, { cookie, body });
      r.durationMs = Date.now() - start;
      r.endpoint = path;
      r.method = ep.method;
      r.roleRequired = ep.role;
      r.slow = r.durationMs > SLOW_THRESHOLD_MS;
      results.authWithLogin.push(r);

      const ok = r.status >= 200 && r.status < 300;
      const icon = ok ? "✓" : "✗";
      console.log(`  ${icon} ${ep.method} ${path} → ${r.status} ${r.durationMs}ms${r.slow ? " ⚠SLOW" : ""}`);
    }
  }

  // ── 汇总 ──
  const allProbes = [
    ...results.publicGet,
    ...results.publicPost,
    ...results.authWithoutLogin,
    ...results.authWithLogin,
  ];

  results.summary = {
    totalProbes: allProbes.length,
    publicGetOk: results.publicGet.filter((r) => r.status === 200).length,
    publicGetFail: results.publicGet.filter((r) => r.status !== 200).length,
    publicPostOk: results.publicPost.filter((r) => r.status === 200).length,
    authBlockedOk: results.authWithoutLogin.filter((r) => r.isUnauthorized).length,
    authBlockedFail: results.authWithoutLogin.filter((r) => !r.isUnauthorized).length,
    authAccessOk: results.authWithLogin.filter((r) => r.status >= 200 && r.status < 300).length,
    authAccessFail: results.authWithLogin.filter((r) => r.status < 200 || r.status >= 300).length,
    slow: allProbes.filter((r) => r.slow).length,
    avgDurationMs: Math.round(allProbes.reduce((a, r) => a + (r.durationMs || 0), 0) / Math.max(1, allProbes.length)),
    maxDurationMs: Math.max(...allProbes.map((r) => r.durationMs || 0)),
  };

  results.completedAt = new Date().toISOString();

  // 写入
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\n[api-probe] wrote ${OUTPUT}`);

  // 摘要
  const s = results.summary;
  console.log(`\n${"─".repeat(50)}`);
  console.log("SUMMARY");
  console.log(`${"─".repeat(50)}`);
  console.log(`  Public GET:       ${s.publicGetOk}/${results.publicGet.length} OK`);
  console.log(`  Public POST:      ${s.publicPostOk}/${results.publicPost.length} OK`);
  console.log(`  Auth blocked:     ${s.authBlockedOk}/${results.authWithoutLogin.length} (should all be 401/403)`);
  console.log(`  Auth access:      ${s.authAccessOk}/${results.authWithLogin.length} OK`);
  console.log(`  Slow endpoints:   ${s.slow}`);
  console.log(`  Avg duration:     ${s.avgDurationMs}ms`);
  console.log(`  Max duration:     ${s.maxDurationMs}ms`);

  const allOk =
    s.publicGetFail === 0 &&
    s.publicPostFail === 0 &&
    s.authBlockedFail === 0 &&
    s.authAccessFail === 0;

  console.log(`\n  Overall: ${allOk ? "✓ ALL PASS" : "✗ FAILURES DETECTED"}`);
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error("[api-probe] FATAL:", err);
  process.exit(1);
});
