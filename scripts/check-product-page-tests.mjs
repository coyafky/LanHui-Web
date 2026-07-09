#!/usr/bin/env node

/**
 * check-product-page-tests.mjs
 *
 * CI anti-regression script: verifies every live product page.tsx has
 * a corresponding entry in one of the four smoke test manifests.
 *
 * Usage: node scripts/check-product-page-tests.mjs
 * Exit 0 = all pages covered, Exit 1 = missing coverage
 */

import { execSync } from "node:child_process";

// ---- Configuration ----

/** Substring-matched exclusion patterns (planned routes + dynamic segments) */
const EXCLUDED_SUBSTRINGS = [
  "wenjie/m6",
  "wenjie/m7",
  "wenjie/m8",
  "business-comfort",
  "skid-plate",
  "window-film/[",
];

/** The four smoke test manifests and their covered paths */
const MANIFESTS = [
  {
    file: "src/app/product/product-pages-services.smoke.test.tsx",
    paths: [
      "ppf", "window-film", "color-film", "electric-steps",
      "wheels", "chassis", "flooring", "floor-mats", "car-care",
    ].map((s) => `/product/${s}`),
  },
  {
    file: "src/app/product/product-pages-brands.smoke.test.tsx",
    paths: [
      "wenjie", "xiaomi", "zeekr", "li-auto", "tesla",
      "xpeng", "denza", "voyah", "ledao", "gaoshan", "zhijie", "nio",
    ].map((b) => `/product/${b}`),
  },
  {
    file: "src/app/product/product-pages-models.smoke.test.tsx",
    paths: [
      "xiaomi/su7", "xiaomi/yu7", "zeekr/9x", "zeekr/8x",
      "li-auto/one", "li-auto/i6", "li-auto/i8", "li-auto/l9", "li-auto/mega",
      "denza/d9", "voyah/dreamer", "xpeng/gx",
      "ledao/l90", "gaoshan/8", "zhijie/v9", "nio/es8",
    ].map((m) => `/product/${m}`),
  },
  {
    file: "src/app/product/product-pages-index.smoke.test.tsx",
    paths: ["/product"],
  },
];

// ---- Helpers ----

/**
 * Convert a git-ls-files path to a route path.
 *   src/app/product/ppf/page.tsx      → /product/ppf
 *   src/app/product/xiaomi/su7/page.tsx → /product/xiaomi/su7
 */
function extractRoutePath(pageTsxPath) {
  const match = pageTsxPath.match(/src\/app(\/product\/.*)\.tsx$/);
  if (!match) return null;
  return match[1].replace(/\/page$/, "");
}

/** Check if a route matches any exclusion pattern */
function isExcluded(route) {
  return EXCLUDED_SUBSTRINGS.some((sub) => route.includes(sub));
}

// ---- Main ----

console.log("检查 product page.tsx 的测试覆盖...\n");

// Note: `**` in git ls-files does NOT match zero directory levels (unlike .gitignore),
// so the root src/app/product/page.tsx must be included as a separate pattern.
const raw = execSync("git ls-files 'src/app/product/page.tsx' 'src/app/product/**/page.tsx'", {
  encoding: "utf-8",
});

const allFiles = raw.trim().split("\n").filter(Boolean);
console.log(`找到 ${allFiles.length} 个 page.tsx 文件\n`);

// Build a reverse-lookup: route → manifest file name
const manifestMap = new Map();
for (const manifest of MANIFESTS) {
  for (const path of manifest.paths) {
    manifestMap.set(path, manifest.file);
  }
}

let okCount = 0;
let skipCount = 0;
let failCount = 0;
const fails = [];

for (const file of allFiles) {
  const route = extractRoutePath(file);
  if (!route) {
    console.log(`  [WARN] 无法解析路由: ${file}`);
    skipCount++;
    continue;
  }

  if (isExcluded(route)) {
    console.log(`  [跳过] ${route} (已排除)`);
    skipCount++;
    continue;
  }

  if (manifestMap.has(route)) {
    console.log(`  [OK] ${route}`);
    okCount++;
  } else {
    console.log(`  [FAIL] ${route} 缺少测试覆盖`);
    failCount++;
    fails.push(route);
  }
}

console.log(`\n---`);
console.log(
  `排除列表验证: ${EXCLUDED_SUBSTRINGS.join(", ")}`,
);
console.log(`\n结果: ${okCount} 已覆盖, ${skipCount} 已跳过, ${failCount} 失败\n`);

if (failCount > 0) {
  console.error(`❌ ${failCount} 个页面缺少测试覆盖:`);
  for (const f of fails) {
    console.error(`   - ${f}`);
  }
  process.exit(1);
} else {
  console.log("✅ 所有 live product 页面均有测试覆盖。");
  process.exit(0);
}
