#!/usr/bin/env node
/**
 * Lighthouse 跑分 — mobile + desktop
 * 用法:
 *   node scripts/audit/lighthouse-run.mjs [--dry-run] [--base-url=URL] [--out-dir=DIR] [--routes=FILE]
 * 输出: docs/audits/lighthouse/{mobile|desktop}/{slug}.json + SUMMARY.md
 */

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { collectRoutes, slugify } from "./lib/collect-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const WITH_LIGHTHOUSE_ADMIN = argv.includes("--with-lighthouse-admin");
const argVal = (flag) => {
  const a = argv.find((s) => s.startsWith(`${flag}=`));
  return a ? a.split("=").slice(1).join("=") : null;
};
const BASE_URL = argVal("--base-url") || process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = argVal("--out-dir") || join(ROOT, "docs", "audits", "lighthouse");
const ROUTES_FILE = argVal("--routes");

const FORM_FACTORS = [
  { name: "mobile", config: {
      extends: "lighthouse:default", settings: {
        formFactor: "mobile",
        screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
        throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
        emulatedUserAgent: "Mozilla/5.0 (Linux; Android 11) Lighthouse",
      },
    },
  },
  { name: "desktop", config: {
      extends: "lighthouse:default", settings: {
        formFactor: "desktop",
        screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
        throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1, requestLatencyMs: 0, downloadThroughputKbps: 0, uploadThroughputKbps: 0 },
      },
    },
  },
];

async function getRoutes() {
  if (existsSync(ROUTES_FILE)) {
    const raw = JSON.parse(readFileSync(ROUTES_FILE, "utf8"));
    if (Array.isArray(raw)) return raw.map((p) => ({ path: typeof p === "string" ? p : p.path, label: typeof p === "string" ? slugify(p) : (p.label ?? slugify(p.path)) }));
  }
  const all = await collectRoutes({ withAdmin: WITH_LIGHTHOUSE_ADMIN, withDynamic: true, baseUrl: BASE_URL });
  // 默认排除 /admin 路由(后台管理不做性能跑分);--with-lighthouse-admin 才包含
  return all.filter((r) => WITH_LIGHTHOUSE_ADMIN || !r.path.startsWith("/admin"));
}

function pickScore(lhr, key) {
  const v = lhr.categories?.[key]?.score;
  return typeof v === "number" ? Math.round(v * 100) : null;
}
function pickAudit(lhr, id) {
  const a = lhr.audits?.[id];
  return a ? { numericValue: a.numericValue, score: a.score, displayValue: a.displayValue } : null;
}

async function runOne(url, ff) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
  try {
    const opts = { port: chrome.port, output: "json", logLevel: "error", ...ff.config };
    const result = await lighthouse(url, opts);
    return result?.lhr ?? null;
  } finally {
    await chrome.kill();
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const ff of FORM_FACTORS) mkdirSync(join(OUT_DIR, ff.name), { recursive: true });

  const routes = await getRoutes();
  const targets = DRY_RUN ? routes.filter((r) => r.path === "/").slice(0, 1) : routes;
  console.log(`[plan] ${targets.length} routes x ${FORM_FACTORS.length} form factors${WITH_LIGHTHOUSE_ADMIN ? " (含 admin)" : ""}`);

  const summary = [];

  for (const r of targets) {
    const url = `${BASE_URL.replace(/\/$/, "")}${r.path}`;
    const row = { path: r.path, label: r.label, perf_m: null, perf_d: null, a11y: null, seo: null, best: null, LCP_m: null, CLS_m: null, TBT_m: null };

    for (const ff of FORM_FACTORS) {
      try {
        console.log(`[lh] ${r.path} @ ${ff.name} ...`);
        const lhr = await runOne(url, ff);
        if (!lhr) throw new Error("no lhr returned");
        const file = join(OUT_DIR, ff.name, `${slugify(r.path)}.json`);
        writeFileSync(file, JSON.stringify(lhr, null, 2), "utf8");

        if (ff.name === "mobile") {
          row.perf_m = pickScore(lhr, "performance");
          row.a11y  = pickScore(lhr, "accessibility");
          row.seo   = pickScore(lhr, "seo");
          row.LCP_m = pickAudit(lhr, "largest-contentful-paint")?.displayValue ?? null;
          row.CLS_m = pickAudit(lhr, "cumulative-layout-shift")?.displayValue ?? null;
          row.TBT_m = pickAudit(lhr, "total-blocking-time")?.displayValue ?? null;
        } else {
          row.perf_d = pickScore(lhr, "performance");
        }
        console.log(`[ok] ${r.path} @ ${ff.name} → perf ${ff.name === "mobile" ? row.perf_m : row.perf_d}`);
      } catch (err) {
        console.log(`[lighthouse-fail] ${r.path} @ ${ff.name}: ${err.message?.slice(0, 100)}`);
      }
    }

    row.best = Math.max(row.perf_m ?? 0, row.perf_d ?? 0) || null;
    summary.push(row);
  }

  // ── SUMMARY.md ──
  const lines = [
    "# Lighthouse Summary",
    "",
    `生成时间: ${new Date().toISOString()} · BASE_URL: ${BASE_URL}`,
    "",
    "| route | perf_m | perf_d | a11y | seo | best | LCP_m | CLS_m | TBT_m |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  for (const r of summary) {
    lines.push(`| ${r.path} | ${r.perf_m ?? "—"} | ${r.perf_d ?? "—"} | ${r.a11y ?? "—"} | ${r.seo ?? "—"} | ${r.best ?? "—"} | ${r.LCP_m ?? "—"} | ${r.CLS_m ?? "—"} | ${r.TBT_m ?? "—"} |`);
  }
  writeFileSync(join(OUT_DIR, "SUMMARY.md"), lines.join("\n"), "utf8");
  console.log(`[ok] SUMMARY.md written (${summary.length} rows)`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[crash]", err);
  process.exit(2);
});
