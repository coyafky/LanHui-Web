#!/usr/bin/env node

/**
 * check-admin-page-duplication.mjs
 *
 * Detects duplicated patterns in admin pages that should have been
 * consolidated into shared hooks/components.
 *
 * Checks:
 *   1.  Direct /api/articles/categories calls outside use-categories
 *   2.  EntityImageUploader + Loader2 patterns outside EntityImagePage
 *   3.  Store action state marker clusters outside use-store-action
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const SRC_DIR = join(PROJECT_ROOT, "src");

let violations = 0;

/** Recursively collect .ts/.tsx files under a directory. */
function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry.startsWith(".") || entry === "node_modules") continue;
      yield* walk(full);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      yield full;
    }
  }
}

/** Safely read a file; return null on failure. */
function read(filePath) {
  try {
    return readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

const allFiles = [...walk(SRC_DIR)];

// ---------------------------------------------------------------------------
// 1. Duplicated /api/articles/categories loading blocks outside use-categories
// ---------------------------------------------------------------------------
const CATEGORIES_ALLOWED = new Set([
  join(SRC_DIR, "hooks/use-categories.ts"),
  join(SRC_DIR, "hooks/use-categories.test.tsx"),
  join(SRC_DIR, "app/api/articles/categories/route.ts"),
  join(SRC_DIR, "app/api/articles/categories/route.test.ts"),
]);

for (const f of allFiles) {
  if (CATEGORIES_ALLOWED.has(f)) continue;
  // Skip test files — mock/interceptor setup referencing the URL is legitimate
  if (f.includes(".test.")) continue;

  const content = read(f);
  if (!content) continue;

  if (content.includes("/api/articles/categories")) {
    console.log(
      `VIOLATION [categories]: ${f} — ` +
        `直接调用 /api/articles/categories，应使用 useCategories()`,
    );
    violations++;
  }
}

// ---------------------------------------------------------------------------
// 2. Duplicated entity image page patterns outside EntityImagePage
// ---------------------------------------------------------------------------
const IMAGE_ALLOWED = new Set([
  join(SRC_DIR, "components/admin/EntityImagePage.tsx"),
  join(SRC_DIR, "components/admin/EntityImageUploader.tsx"),
]);

for (const f of allFiles) {
  if (IMAGE_ALLOWED.has(f)) continue;
  // Only check files in src/app/admin/ (actual page files), not src/components/admin/
  if (!f.includes("/app/admin/")) continue;
  if (f.includes(".test.")) continue;

  const content = read(f);
  if (!content) continue;

  if (content.includes("EntityImageUploader") && content.includes("Loader2")) {
    console.log(
      `VIOLATION [image-page]: ${f} — ` +
        `包含 EntityImageUploader + Loader2，应使用 EntityImagePage`,
    );
    violations++;
  }
}

// ---------------------------------------------------------------------------
// 3. Duplicated store action state clusters outside use-store-action
// ---------------------------------------------------------------------------
const STORE_ACTION_ALLOWED = new Set([
  join(SRC_DIR, "hooks/use-store-action.ts"),
  join(SRC_DIR, "hooks/use-store-action.test.tsx"),
]);

const ACTION_MARKERS = [
  "actionOpen",
  "statusReason",
  "acting",
  "actionError",
  "performStatusAction",
];

for (const f of allFiles) {
  if (STORE_ACTION_ALLOWED.has(f)) continue;
  if (!f.includes("admin/") && !f.includes("stores/")) continue;
  if (f.includes(".test.")) continue;

  const content = read(f);
  if (!content) continue;

  // If the file already imports useStoreAction, it's consuming the shared hook correctly
  if (content.includes("useStoreAction")) continue;

  const hits = ACTION_MARKERS.filter((m) => content.includes(m));
  if (hits.length >= 3) {
    console.log(
      `VIOLATION [store-action]: ${f} — ` +
        `包含 ${hits.length}/5 个 store action 状态标记 (${hits.join(", ")})，` +
        `应使用 useStoreAction()`,
    );
    violations++;
  }
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------
if (violations > 0) {
  console.log(`\n${violations} duplication violation(s) found.`);
  process.exit(1);
} else {
  console.log("No admin page duplication violations found.");
  process.exit(0);
}
