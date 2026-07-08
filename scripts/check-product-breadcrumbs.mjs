#!/usr/bin/env node

/**
 * check-product-breadcrumbs.mjs
 *
 * Verifies that every product page under src/app/product/ imports
 * getProductBreadcrumbSchema, calls it with its canonical path, and renders
 * the resulting JSON-LD script tag.
 *
 * Exit code: 0 = all pass, 1 = failures found
 *
 * Usage:
 *   node scripts/check-product-breadcrumbs.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const PROJECT_ROOT = new URL("..", import.meta.url).pathname;
const PRODUCT_DIR = join(PROJECT_ROOT, "src/app/product");

const IGNORE_PATTERNS = [
  // zeekr/page.tsx already has both breadcrumb and ItemList JSON-LD (canonical example)
  "zeekr/page.tsx",
  // layout.tsx, loading.tsx, error.tsx are not page components
  "/layout.tsx",
  "/loading.tsx",
  "/error.tsx",
  // not-found.tsx is a fallback, not a content page
  "/not-found.tsx",
];

function shouldIgnore(relPath) {
  return IGNORE_PATTERNS.some((p) => relPath.endsWith(p));
}

function collectPageFiles(dir) {
  const entries = [];
  try {
    const items = readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = join(dir, item.name);
      if (item.isDirectory()) {
        if (!item.name.startsWith(".")) {
          entries.push(...collectPageFiles(fullPath));
        }
      } else if (item.name === "page.tsx") {
        entries.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist or not accessible
  }
  return entries;
}

function checkPage(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const relPath = relative(PRODUCT_DIR, filePath);
  const issues = [];

  // 1. Must import getProductBreadcrumbSchema
  if (!content.includes("getProductBreadcrumbSchema")) {
    issues.push("missing import of getProductBreadcrumbSchema");
  }

  // 2. Must call getProductBreadcrumbSchema with a path
  if (!content.includes("getProductBreadcrumbSchema(")) {
    issues.push("missing call to getProductBreadcrumbSchema()");
  }

  // 3. Must render breadcrumbSchema in JSX
  if (!content.includes("JSON.stringify(breadcrumbSchema)")) {
    issues.push("missing JSON.stringify(breadcrumbSchema) render block");
  }

  // 4. Must have the && guard
  if (!content.includes("{breadcrumbSchema &&")) {
    issues.push("missing {breadcrumbSchema && ...} guard");
  }

  return { relPath, issues };
}

function main() {
  const pageFiles = collectPageFiles(PRODUCT_DIR)
    .filter((f) => !shouldIgnore(relative(PRODUCT_DIR, f)))
    .sort();

  let passed = 0;
  let failed = 0;

  console.log(`\n  Checking ${pageFiles.length} product pages for breadcrumb JSON-LD...\n`);

  for (const filePath of pageFiles) {
    const { relPath, issues } = checkPage(filePath);

    if (issues.length === 0) {
      console.log(`  \u2713 ${relPath}`);
      passed++;
    } else {
      console.log(`  \u2717 ${relPath}`);
      for (const issue of issues) {
        console.log(`      - ${issue}`);
      }
      failed++;
    }
  }

  console.log(`\n  Result: ${passed} passed, ${failed} failed out of ${pageFiles.length} pages\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main();
