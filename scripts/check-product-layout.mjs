#!/usr/bin/env node

/**
 * check-product-layout.mjs
 *
 * Verifies that:
 *   1. src/app/product/layout.tsx exists and contains <Header /> and <Footer />
 *   2. All product page.tsx files (under src/app/product/) do NOT import or render Header/Footer
 *   3. src/components/ProductDetail.tsx does NOT import Header or Footer
 *   4. src/components/film/FilmPageHero.tsx does NOT import Header
 *
 * This prevents regression after moving Header/Footer into the shared layout
 * for all /product/** routes.
 *
 * Exit code: 0 = all pass, 1 = failures found
 *
 * Usage:
 *   node scripts/check-product-layout.mjs
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const PROJECT_ROOT = new URL("..", import.meta.url).pathname;
const PRODUCT_DIR = join(PROJECT_ROOT, "src/app/product");
const COMPONENTS_DIR = join(PROJECT_ROOT, "src/components");

// ---------------------------------------------------------------------------
// File collection helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Check 1: layout.tsx must contain Header and Footer
// ---------------------------------------------------------------------------

function checkLayout() {
  const layoutPath = join(PRODUCT_DIR, "layout.tsx");

  if (!existsSync(layoutPath)) {
    return { pass: false, message: "src/app/product/layout.tsx does not exist" };
  }

  const content = readFileSync(layoutPath, "utf-8");
  const issues = [];

  if (!content.includes("<Header />")) {
    issues.push("missing <Header />");
  }
  if (!content.includes("<Footer />")) {
    issues.push("missing <Footer />");
  }

  if (issues.length > 0) {
    return { pass: false, message: issues.join("; ") };
  }

  return { pass: true, message: "contains <Header /> and <Footer />" };
}

// ---------------------------------------------------------------------------
// Check 2: all page.tsx files must NOT import or render Header/Footer
// ---------------------------------------------------------------------------

const FORBIDDEN_PATTERNS = [
  { pattern: `import { Header } from`, label: "import Header" },
  { pattern: `import { Footer } from`, label: "import Footer" },
  { pattern: `<Header />`, label: "render <Header />" },
  { pattern: `<Footer />`, label: "render <Footer />" },
];

function checkPageFiles() {
  const pageFiles = collectPageFiles(PRODUCT_DIR).sort();
  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const filePath of pageFiles) {
    const content = readFileSync(filePath, "utf-8");
    const relPath = relative(PRODUCT_DIR, filePath);
    const pageIssues = [];

    for (const { pattern, label } of FORBIDDEN_PATTERNS) {
      if (content.includes(pattern)) {
        pageIssues.push(label);
      }
    }

    if (pageIssues.length === 0) {
      passed++;
    } else {
      failed++;
      failures.push({ relPath, issues: pageIssues });
    }
  }

  return { passed, failed, total: pageFiles.length, failures };
}

// ---------------------------------------------------------------------------
// Check 3: ProductDetail.tsx must not import Header/Footer
// ---------------------------------------------------------------------------

function checkProductDetail() {
  const filePath = join(COMPONENTS_DIR, "ProductDetail.tsx");

  if (!existsSync(filePath)) {
    return { pass: false, message: "src/components/ProductDetail.tsx does not exist" };
  }

  const content = readFileSync(filePath, "utf-8");
  const issues = [];

  if (content.includes(`import { Header }`)) {
    issues.push("imports Header");
  }
  if (content.includes(`import { Footer }`)) {
    issues.push("imports Footer");
  }

  if (issues.length > 0) {
    return { pass: false, message: issues.join("; ") };
  }

  return { pass: true, message: "no import { Header } or import { Footer }" };
}

// ---------------------------------------------------------------------------
// Check 4: FilmPageHero.tsx must not import Header
// ---------------------------------------------------------------------------

function checkFilmPageHero() {
  const filePath = join(COMPONENTS_DIR, "film", "FilmPageHero.tsx");

  if (!existsSync(filePath)) {
    return { pass: false, message: "src/components/film/FilmPageHero.tsx does not exist" };
  }

  const content = readFileSync(filePath, "utf-8");
  const issues = [];

  if (content.includes(`import { Header }`)) {
    issues.push("imports Header");
  }

  if (issues.length > 0) {
    return { pass: false, message: issues.join("; ") };
  }

  return { pass: true, message: "no import { Header }" };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  let allPassed = true;

  // Check 1: layout.tsx
  console.log("\n  [Check 1] src/app/product/layout.tsx contains Header/Footer");
  const layoutResult = checkLayout();
  if (layoutResult.pass) {
    console.log(`    \u2713 ${layoutResult.message}`);
  } else {
    console.log(`    \u2717 ${layoutResult.message}`);
    allPassed = false;
  }

  // Check 2: page.tsx files
  console.log("\n  [Check 2] All product page.tsx files must NOT contain Header/Footer");
  const pageResult = checkPageFiles();
  if (pageResult.failures.length > 0) {
    for (const { relPath, issues } of pageResult.failures) {
      console.log(`    \u2717 ${relPath}`);
      for (const issue of issues) {
        console.log(`        - forbidden: ${issue}`);
      }
    }
    allPassed = false;
  }
  console.log(`    ${pageResult.passed} passed, ${pageResult.failed} failed out of ${pageResult.total} pages`);

  // Check 3: ProductDetail.tsx
  console.log("\n  [Check 3] src/components/ProductDetail.tsx no Header/Footer import");
  const detailResult = checkProductDetail();
  if (detailResult.pass) {
    console.log(`    \u2713 ${detailResult.message}`);
  } else {
    console.log(`    \u2717 ${detailResult.message}`);
    allPassed = false;
  }

  // Check 4: FilmPageHero.tsx
  console.log("\n  [Check 4] src/components/film/FilmPageHero.tsx no Header import");
  const heroResult = checkFilmPageHero();
  if (heroResult.pass) {
    console.log(`    \u2713 ${heroResult.message}`);
  } else {
    console.log(`    \u2717 ${heroResult.message}`);
    allPassed = false;
  }

  // Result summary
  console.log("\n  ------------------------------");
  if (allPassed) {
    console.log("  Result: ALL CHECKS PASSED\n");
  } else {
    console.log("  Result: SOME CHECKS FAILED\n");
    process.exit(1);
  }
}

main();
