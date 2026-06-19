#!/usr/bin/env node
/**
 * API 路由连通性探测 — 2026-06-19 daily test
 *
 * 用法:
 *   node scripts/audit/api-probe.mjs
 *
 * 环境变量:
 *   BASE_URL    默认 http://localhost:3000
 *   ADMIN_USER  默认 admin
 *   ADMIN_PASS  默认 admin123
 *
 * 输出:
 *   /tmp/api-2026-06-19.json — 探测结果
 *   stdout — 同样 JSON
 *
 * 探测范围:
 *   公开 GET:   /api/cities /api/provinces /api/regions /api/stores /api/articles
 *   公开 POST:  /api/analytics/track
 *   Admin:      /api/articles /api/stores /api/upload /api/analytics/stats
 *
 * 鉴权判定:
 *   - 公开端点 401/403 → 鉴权生效(OK),但不等于有数据
 *   - Admin 端点 401/403 → 鉴权失败(FAIL)
 *   - 2xx → 通过;5xx → 服务端错误
 */

import { writeFileSync } from "node:fs";

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const SLOW_THRESHOLD_MS = 2000;

const PUBLIC_GET = [
  "/api/cities",
  "/api/provinces",
  "/api/regions",
  "/api/stores",
  "/api/articles",
];

const PUBLIC_POST = [
  "/api/analytics/track",
];

const ADMIN_ENDPOINTS = [
  { path: "/api/articles", methods: ["GET"] },
  { path: "/api/stores", methods: ["GET"] },
  { path: "/api/upload", methods: ["POST"] },
  { path: "/api/analytics/stats", methods: ["GET"] },
];

/**
 * 探测单个端点
 * @param {string} path
 * @param {string} method
 * @param {string|null} cookie
 * @returns {Promise<object>}
 */
async function probe(path, method, cookie) {
  const start = Date.now();
  let resp;
  try {
    const opts = {
      method,
      headers: cookie ? { Cookie: cookie } : {},
    };
    if (method === "POST" && path === "/api/analytics/track") {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify({
        type: "pageview",
        path: "/test-2026-06-19",
        timestamp: new Date().toISOString(),
      });
    }
    resp = await fetch(`${BASE}${path}`, opts);
  } catch (err) {
    return {
      endpoint: path,
      method,
      status: 0,
      durationMs: Date.now() - start,
      hasDataField: false,
      errorField: `fetch-failed: ${err.message}`,
      authRequired: null,
      authPassed: false,
      slow: false,
      networkError: true,
    };
  }
  const durationMs = Date.now() - start;
  const status = resp.status;
  let data = null;
  let text = "";
  try {
    text = await resp.text();
    if (text) data = JSON.parse(text);
  } catch {
    // non-JSON
  }
  return {
    endpoint: path,
    method,
    status,
    durationMs,
    hasDataField: !!(data && "data" in data),
    errorField: data?.error ?? null,
    authRequired: cookie ? null : path.startsWith("/api/upload") || path === "/api/analytics/stats",
    authPassed: cookie ? status < 400 : null,
    slow: durationMs > SLOW_THRESHOLD_MS,
    responseSizeBytes: text.length,
  };
}

/**
 * NextAuth v5 CSRF + credentials 登录拿 cookie
 * @returns {Promise<string|null>} session cookie 字符串
 */
async function loginAsAdmin() {
  try {
    // Step 1: GET CSRF token
    const csrfResp = await fetch(`${BASE}/api/auth/csrf`);
    const csrfData = await csrfResp.json();
    const csrfToken = csrfData.csrfToken;
    if (!csrfToken) return null;
    const csrfCookie = csrfResp.headers.getSetCookie?.() ?? [];
    let cookieHeader = csrfCookie.map((c) => c.split(";")[0]).join("; ");

    // Step 2: POST credentials
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
        Cookie: cookieHeader,
      },
      body,
      redirect: "manual",
    });

    const setCookies = loginResp.headers.getSetCookie?.() ?? [];
    const sessionCookie = setCookies.find((c) => c.includes("next-auth.session-token") || c.includes("__Secure-next-auth.session-token"));
    if (sessionCookie) {
      cookieHeader = [cookieHeader, sessionCookie.split(";")[0]].filter(Boolean).join("; ");
    } else {
      // 用所有 set-cookie 兜底
      cookieHeader = [cookieHeader, ...setCookies.map((c) => c.split(";")[0])]
        .filter(Boolean)
        .join("; ");
    }
    return cookieHeader;
  } catch (err) {
    console.error("[login] failed:", err.message);
    return null;
  }
}

async function main() {
  console.log(`[api-probe] BASE=${BASE} ADMIN=${ADMIN_USER}`);
  const results = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE,
    publicGet: [],
    publicPost: [],
    admin: [],
    loginSucceeded: false,
    summary: {},
  };

  // 1) 公开 GET
  for (const path of PUBLIC_GET) {
    const r = await probe(path, "GET", null);
    results.publicGet.push(r);
    console.log(`  ${r.status} ${r.method} ${path}  ${r.durationMs}ms`);
  }

  // 2) 公开 POST
  for (const path of PUBLIC_POST) {
    const r = await probe(path, "POST", null);
    results.publicPost.push(r);
    console.log(`  ${r.status} ${r.method} ${path}  ${r.durationMs}ms`);
  }

  // 3) Admin — 先登录
  const cookie = await loginAsAdmin();
  results.loginSucceeded = !!cookie;
  console.log(`[api-probe] admin login: ${cookie ? "OK" : "FAILED"}`);

  if (cookie) {
    for (const ep of ADMIN_ENDPOINTS) {
      for (const method of ep.methods) {
        const r = await probe(ep.path, method, cookie);
        results.admin.push(r);
        console.log(`  ${r.status} ${r.method} ${ep.path}  ${r.durationMs}ms`);
      }
    }
  } else {
    // 登录失败 — 仍探测（用空 cookie），结果会是 401/403
    for (const ep of ADMIN_ENDPOINTS) {
      for (const method of ep.methods) {
        const r = await probe(ep.path, method, null);
        r.authPassed = false;
        r.authError = "login-failed";
        results.admin.push(r);
        console.log(`  ${r.status} ${r.method} ${ep.path}  ${r.durationMs}ms  (no auth)`);
      }
    }
  }

  // 4) 汇总
  const all = [...results.publicGet, ...results.publicPost, ...results.admin];
  results.summary = {
    totalProbes: all.length,
    pass2xx: all.filter((r) => r.status >= 200 && r.status < 300).length,
    authRequired3xx: all.filter((r) => r.status >= 300 && r.status < 400).length,
    clientError4xx: all.filter((r) => r.status >= 400 && r.status < 500).length,
    serverError5xx: all.filter((r) => r.status >= 500).length,
    networkError: all.filter((r) => r.networkError).length,
    slow: all.filter((r) => r.slow).length,
    avgDurationMs: Math.round(all.reduce((a, r) => a + r.durationMs, 0) / Math.max(1, all.length)),
    maxDurationMs: Math.max(...all.map((r) => r.durationMs)),
  };
  results.completedAt = new Date().toISOString();

  const outPath = "/tmp/api-2026-06-19.json";
  writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`[api-probe] wrote ${outPath}`);
  console.log(`[api-probe] summary: ${JSON.stringify(results.summary)}`);
}

main().catch((err) => {
  console.error("[api-probe] FATAL:", err);
  process.exit(1);
});
