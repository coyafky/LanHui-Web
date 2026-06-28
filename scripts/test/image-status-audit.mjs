#!/usr/bin/env node
/**
 * 图片状态全站审计 — 2026-06-29
 *
 * 扫描 src/lib/ 下所有产品数据文件，提取 imageStatus 字段值，
 * 汇总各品牌/车型的图片状态分布。
 *
 * 用法:
 *   node scripts/test/image-status-audit.mjs
 *
 * 输出:
 *   stdout 表格 + docs/test-reports/2026-06-29/image-status.json
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const SRC_LIB = join(REPO_ROOT, "src", "lib");
const OUTPUT = join(REPO_ROOT, "docs", "test-reports", "2026-06-29", "image-status.json");

// 品牌 → 数据文件映射（相对于 src/lib/）
const BRAND_DATA_FILES = {
  "问界-Wenjie Series": "wenjie-series-upgrade-projects.ts",
  "问界-M6": "wenjie-m6-upgrade-projects.ts",
  "问界-M7": "wenjie-m7-upgrade-projects.ts",
  "问界-M8": "wenjie-m8-upgrade-projects.ts",
  "小米-Series": "xiaomi-series-upgrade-projects.ts",
  "小米-SU7": "xiaomi-su7-upgrade-projects.ts",
  "小米-YU7": "xiaomi-yu7-upgrade-projects.ts",
  "极氪-9X": "zeekr-9x-products.ts",
  "极氪-8X": "zeekr-8x-products.ts",
  "极氪-Series": "zeekr-products.ts",
  "理想-Series": "li-auto-series-upgrade-projects.ts",
  "理想-i6": "li-auto-i6-products.ts",
  "理想-i8": "li-auto-i8-products.ts",
  "理想-L9": "li-auto-l9-products.ts",
  "理想-MEGA": "li-auto-mega-products.ts",
  "理想-ONE": "li-auto-one-products.ts",
  "Tesla": "tesla-products.ts",
  "小鹏-GX": "xpeng-gx-products.ts",
  "NIO-ES8": "nio-products.ts",
  "腾势-D9": "denza-d9-products.ts",
  "岚图-梦想家": "voyah-products.ts",
  "高山-8": "gaoshan-products.ts",
  "乐道-L90": "ledao-l90-products.ts",
  "智界-V9": "zhijie-v9-products.ts",
};

/**
 * 从 TS 文件中提取 imageStatus 值
 * @returns {Array<{ id?: string, name?: string, imageStatus: string }>}
 */
function extractImageStatuses(filePath) {
  const absPath = join(SRC_LIB, filePath);
  let src;
  try {
    src = readFileSync(absPath, "utf8");
  } catch {
    return { error: `file not found: ${filePath}`, projects: [] };
  }

  const projects = [];

  // 匹配 imageStatus: "xxx" 或 imageStatus: 'xxx'
  const statusRe = /imageStatus:\s*["']([^"']+)["']/g;
  let statusMatch;
  while ((statusMatch = statusRe.exec(src)) !== null) {
    projects.push({ imageStatus: statusMatch[1] });
  }

  // 尝试匹配 name 和 id（向前查找，简化版）
  const nameRe = /name:\s*["']([^"']+)["']/g;
  const idRe = /id:\s*["']([^"']+)["']/g;
  const names = [];
  const ids = [];
  let m;
  while ((m = nameRe.exec(src)) !== null) names.push(m[1]);
  while ((m = idRe.exec(src)) !== null) ids.push(m[1]);

  // 按顺序对应 id/name 到 imageStatus
  for (let i = 0; i < projects.length; i++) {
    if (i < ids.length) projects[i].id = ids[i];
    if (i < names.length) projects[i].name = names[i];
  }

  return { file: filePath, count: projects.length, projects };
}

function main() {
  console.log("[image-status-audit] scanning product data files...\n");

  const results = {
    scannedAt: new Date().toISOString(),
    brands: {},
    totals: { matched: 0, "pending-review": 0, "generated-preview": 0, missing: 0, other: 0 },
  };

  for (const [brand, file] of Object.entries(BRAND_DATA_FILES)) {
    const data = extractImageStatuses(file);
    if (data.error) {
      results.brands[brand] = { file, error: data.error, projects: [] };
      continue;
    }

    const counts = { matched: 0, "pending-review": 0, "generated-preview": 0, missing: 0, other: 0 };
    for (const p of data.projects) {
      if (counts.hasOwnProperty(p.imageStatus)) {
        counts[p.imageStatus]++;
      } else {
        counts.other++;
      }
    }

    results.brands[brand] = {
      file,
      total: data.count,
      counts,
      projects: data.projects,
    };

    // 累加总计
    for (const [status, n] of Object.entries(counts)) {
      if (results.totals.hasOwnProperty(status)) {
        results.totals[status] += n;
      }
    }
  }

  results.totals.grandTotal =
    results.totals.matched +
    results.totals["pending-review"] +
    results.totals["generated-preview"] +
    results.totals.missing +
    results.totals.other;

  // ── 输出表格 ──
  console.log("Brand                    | Total | matched | pending | generated | missing | other");
  console.log("─".repeat(90));
  for (const [brand, b] of Object.entries(results.brands)) {
    if (b.error) {
      console.log(`${brand.padEnd(25)} |  ${"⚠ " + b.error}`);
      continue;
    }
    const c = b.counts;
    console.log(
      `${brand.padEnd(25)} | ${String(b.total).padStart(5)} | ` +
        `${String(c.matched).padStart(7)} | ${String(c["pending-review"]).padStart(7)} | ` +
        `${String(c["generated-preview"]).padStart(9)} | ${String(c.missing).padStart(7)} | ${String(c.other).padStart(5)}`
    );
  }
  console.log("─".repeat(90));
  const t = results.totals;
  console.log(
    `${"TOTAL".padEnd(25)} | ${String(t.grandTotal).padStart(5)} | ` +
      `${String(t.matched).padStart(7)} | ${String(t["pending-review"]).padStart(7)} | ` +
      `${String(t["generated-preview"]).padStart(9)} | ${String(t.missing).padStart(7)} | ${String(t.other).padStart(5)}`
  );

  // 写入 JSON
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(results, null, 2));
  console.log(`\n[image-status-audit] wrote ${OUTPUT}`);

  // 异常提示
  const mismatches = [];
  for (const [brand, b] of Object.entries(results.brands)) {
    if (b.error) continue;
    const statuses = Object.entries(b.counts).filter(([, n]) => n > 0).map(([s]) => s);
    if (statuses.length > 1) {
      mismatches.push(`${brand}: ${statuses.join(" + ")}`);
    }
  }
  if (mismatches.length > 0) {
    console.log("\n⚠ Brands with mixed imageStatus:");
    mismatches.forEach((m) => console.log(`  - ${m}`));
  }
}

main();
