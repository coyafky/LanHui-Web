#!/usr/bin/env node

/**
 * verify-static-images.mjs
 *
 * Verifies store and product images referenced in static data exist in public/.
 * Missing or empty required assets fail the production gate.
 *
 * Checks:
 *   1. Store images referenced by src/lib/store.ts
 *   2. Product category images referenced in src/lib/*-products.ts
 *
 * Usage:
 *   node scripts/verify-static-images.mjs
 */

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");

/** @type {{ path: string; reason: string }[]} */
const missing = [];
/** @type {{ path: string; reason: string }[]} */
const empty = [];

function checkFile(publicRelPath, label) {
  const absPath = join(PUBLIC, publicRelPath);
  if (!existsSync(absPath)) {
    missing.push({ path: `public/${publicRelPath}`, reason: label });
    return;
  }
  const size = statSync(absPath).size;
  if (size === 0) {
    empty.push({ path: `public/${publicRelPath}`, reason: `${label} (0 bytes)` });
  }
}

/**
 * Extract image paths from TypeScript product files by regex.
 * Matches `image: "/images/..."` or `image: '/images/...'` patterns.
 */
function extractImagePaths(filePath) {
  const content = readFileSync(filePath, "utf8");
  const pattern = /image:\s*["'](\/images\/[^"']+\.(?:webp|png|jpe?g|avif))["']/gi;
  const paths = [];
  for (const match of content.matchAll(pattern)) {
    paths.push(match[1].replace(/^\//, ""));
  }
  return paths;
}

function main() {
  console.log("[verify:static-images] Checking static image assets...\n");

  // ── Store images ──
  const storeDataPath = join(ROOT, "src", "lib", "store.ts");
  const storeImages = extractImagePaths(storeDataPath);
  console.log(`[verify:static-images] Store images referenced: ${storeImages.length}`);
  for (const imagePath of storeImages) {
    checkFile(imagePath, `store.ts: ${imagePath}`);
  }

  // ── Product images ──
  const productDataDir = join(ROOT, "src", "lib");
  const productFiles = readdirSync(productDataDir).filter(
    (f) => f.endsWith("-products.ts") && f !== "china-regions.ts"
  );

  let totalProductImages = 0;
  for (const fileName of productFiles) {
    const filePath = join(productDataDir, fileName);
    const images = extractImagePaths(filePath);
    for (const img of images) {
      totalProductImages++;
      const label = `${fileName}: ${img}`;
      checkFile(img, label);
    }
  }

  console.log(`[verify:static-images] Product images referenced: ${totalProductImages}`);
  console.log();

  // ── Report ──
  if (empty.length > 0) {
    console.warn("⚠️  Empty files (0 bytes):");
    for (const { path, reason } of empty) {
      console.warn(`  - ${path}  (${reason})`);
    }
    console.warn();
  }

  if (missing.length > 0) {
    console.warn("⚠️  Missing files:");
    for (const { path, reason } of missing) {
      console.warn(`  - ${path}  (${reason})`);
    }
    console.warn(`\n${missing.length} file(s) missing. ${empty.length} file(s) empty.`);
    console.error("[verify:static-images] FAILED — required assets must exist before deployment");
    process.exit(1);
  }

  if (empty.length > 0) {
    console.error(`[verify:static-images] FAILED — ${empty.length} empty file(s) found`);
    process.exit(1);
  }
  console.log("[verify:static-images] OK — all images present");
  process.exit(0);
}

main();
