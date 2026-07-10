import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { exit } from "node:process";

const SRC = join(import.meta.dirname || ".", "../src/lib");
const ALLOWLIST = new Set([
  // non-migrated legacy files — shrink this list after each batch
  "li-auto-i8-products.ts",
  "li-auto-l9-products.ts",
  "li-auto-one-products.ts",
  "li-auto-mega-products.ts",
  "li-auto-i6-products.ts",
  "tesla-products.ts",
  "denza-d9-products.ts",
  "nio-products.ts",
  "gaoshan-products.ts",
  "xpeng-gx-products.ts",
  "voyah-products.ts",
  "zhijie-v9-products.ts",
  "ledao-l90-products.ts",
  "wenjie-products.ts",
  "wenjie-preview-images.ts",
  "zeekr-products.ts",
  "zeekr-8x-products.ts",
  "zeekr-9x-products.ts",
  "xiaomi-products.ts",
  "xiaomi-series-upgrade-projects.ts",
]);

const IMAGE_STATUS_PATTERN = /export\s+type\s+\w*ImageStatus\s*=\s*(?:"[a-z-]+"(?:\s*\|\s*"[a-z-]+")*\s*)/i;
const HELPER_PATTERNS = [
  { name: "matchedImage", pattern: /function\s+matchedImage\s*\(/ },
  { name: "missingImage", pattern: /function\s+missingImage\s*\(/ },
  { name: "pendingReviewImage", pattern: /function\s+pendingReviewImage\s*\(/ },
  { name: "productPreviewImage", pattern: /function\s+productPreviewImage\s*\(/ },
];

const files = readdirSync(SRC).filter((f) => extname(f) === ".ts");
let failed = false;

for (const file of files) {
  if (ALLOWLIST.has(file)) continue;
  if (file === "product-types.ts") continue;

  const content = readFileSync(join(SRC, file), "utf-8");

  if (IMAGE_STATUS_PATTERN.test(content)) {
    console.error(`FAIL: ${file}: local ImageStatus union detected — use import { ImageStatus } from "./product-types"`);
    failed = true;
  }

  for (const { name, pattern } of HELPER_PATTERNS) {
    if (pattern.test(content)) {
      console.error(`FAIL: ${file}: local ${name}() detected — use import from "./product-types"`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("\nAdd non-migrated files to ALLOWLIST in scripts/check-product-type-duplication.mjs if this is expected during migration.");
  exit(1);
}

console.log("PASS: no unauthorized duplicate product types or helpers detected.");
exit(0);
