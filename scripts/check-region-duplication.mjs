#!/usr/bin/env node

/**
 * check-region-duplication.mjs
 *
 * Scans src/ for hand-maintained province/city hierarchy arrays that
 * duplicate data already in the canonical src/lib/regions/mainland-regions.ts.
 *
 * Whitelist:
 *   - src/lib/regions/mainland-regions.ts (canonical source)
 *
 * Detection heuristic:
 *   A file is flagged if it contains 20+ lines matching /(label|value)\s*:/
 *   AND at least one /children\s*:/ match — which together signal a
 *   hand-written Region[]-style cascade.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const SRC_DIR = join(PROJECT_ROOT, "src");

const WHITELIST = new Set([
  "src/lib/regions/mainland-regions.ts",
]);

const LABEL_VALUE_RE = /(label|value)\s*:/;
const CHILDREN_RE = /children\s*:/;
const THRESHOLD = 20;

/** Recursively collect .ts/.tsx files under a directory. */
function collectFiles(dir) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      out.push(...collectFiles(full));
    } else if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const files = collectFiles(SRC_DIR);
  const violations = [];

  for (const absPath of files) {
    const relPath = absPath.slice(PROJECT_ROOT.length + 1); // e.g. "src/lib/foo.ts"
    if (WHITELIST.has(relPath)) continue;

    let content;
    try {
      content = readFileSync(absPath, "utf8");
    } catch {
      continue; // skip unreadable files
    }

    const lines = content.split("\n");
    let labelValueCount = 0;
    let hasChildren = false;

    for (const line of lines) {
      if (LABEL_VALUE_RE.test(line)) labelValueCount++;
      if (CHILDREN_RE.test(line)) hasChildren = true;
    }

    if (labelValueCount >= THRESHOLD && hasChildren) {
      violations.push(relPath);
    }
  }

  if (violations.length > 0) {
    console.error(
      "❌ Region data duplication detected!\n" +
        "\n" +
        "The following files appear to contain hand-maintained province/city hierarchy\n" +
        "arrays. Please use the canonical data source instead:\n" +
        "\n" +
        "    src/lib/regions/mainland-regions.ts\n" +
        "\n" +
        "Violations:",
    );
    for (const f of violations) {
      console.error(`  - ${f}`);
    }
    process.exit(1);
  }

  console.log("✅ No region data duplication detected");
  process.exit(0);
}

main();
