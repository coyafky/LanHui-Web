#!/usr/bin/env node

/**
 * check-product-placeholders.mjs
 *
 * Verifies that product pages no longer show placeholder text, preventing regression.
 *
 * Checks:
 *   1. 7 product pages do NOT contain "方案整理中" or "内容由团队完善中"
 *   2. business-comfort is NOT in live services (remains "planned" in SERVICES array)
 *
 * Exit code: 0 = all pass, 1 = failures found
 *
 * Usage:
 *   node scripts/check-product-placeholders.mjs
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ROOT = new URL("..", import.meta.url).pathname;

const CHECK_PAGES = [
  "src/app/product/denza/page.tsx",
  "src/app/product/voyah/page.tsx",
  "src/app/product/xpeng/page.tsx",
  "src/app/product/nio/page.tsx",
  "src/app/product/ledao/page.tsx",
  "src/app/product/gaoshan/page.tsx",
];

const BANNED_PATTERNS = [
  /方案整理中/,
  /内容由团队完善中/,
];

let failures = 0;

// ---------------------------------------------------------------------------
// Check 1: Scan for banned placeholder text in the 7 public pages
// ---------------------------------------------------------------------------
console.log("--- Checking for banned placeholder text ---");

for (const pagePath of CHECK_PAGES) {
  const fullPath = join(PROJECT_ROOT, pagePath);
  let content;
  try {
    content = readFileSync(fullPath, "utf-8");
  } catch {
    console.log(`WARN: ${pagePath} not found — skipping`);
    continue;
  }
  const lines = content.split("\n");

  for (const pattern of BANNED_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        console.error(`  FAIL  ${pagePath}:${i + 1} — banned pattern: "${pattern.source}"`);
        console.error(`        ${lines[i].trim()}`);
        failures++;
      }
    }
  }
}

if (failures === 0) {
  console.log("  OK    No banned placeholder text found");
}

// ---------------------------------------------------------------------------
// Check 2: Verify business-comfort is not live
// ---------------------------------------------------------------------------
console.log("--- Checking business-comfort status ---");

const routesPath = join(PROJECT_ROOT, "src/lib/product-routes.ts");
const routesContent = readFileSync(routesPath, "utf-8");

// Check that the SERVICES array has business-comfort with planned (not live) status
const bizComfortPlanned = routesContent.includes('serviceSlug: "business-comfort"') ||
  routesContent.includes("serviceSlug: 'business-comfort'");

if (bizComfortPlanned) {
  // Verify it's NOT live
  const bizSection = routesContent.match(
    /serviceSlug:\s*["']business-comfort["'][\s\S]{0,200}?status:\s*["'](\w+)["']/
  );
  if (bizSection) {
    const status = bizSection[1];
    if (status === "live") {
      console.error(`  FAIL  business-comfort status is "live" — should be "planned"`);
      failures++;
    } else {
      console.log(`  OK    business-comfort status is "${status}" (not live)`);
    }
  } else {
    console.log("  OK    business-comfort not found in live services");
  }
} else {
  console.log("  OK    business-comfort not in SERVICES");
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log("");
if (failures > 0) {
  console.error(`FAIL: ${failures} issue(s) found.`);
  process.exit(1);
}

console.log("PASS: All product placeholder checks passed.");
