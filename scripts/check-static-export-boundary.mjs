#!/usr/bin/env node

/**
 * check-static-export-boundary.mjs
 *
 * Scans the project for runtime/server dependencies that would prevent
 * a pure static HTML export. Violations must be eliminated before the
 * site can be served from a static host (CDN / object storage).
 *
 * Detected boundary violations:
 *   1. src/app/admin/       — CMS routes (force-dynamic, auth-guarded)
 *   2. src/app/api/         — API route handlers (require Node.js runtime)
 *   3. src/lib/prisma.ts    — Database client singleton
 *   4. src/lib/auth.ts      — next-auth / server-side auth logic
 *   5. prisma/              — Schema + migrations (DB dependency)
 *   6. Import of @/lib/prisma, @/lib/auth, or next-auth in source files
 *   7. fetch("/api/...") calls to local API routes
 *   8. Runtime/database imports left in scripts included by TypeScript
 *
 * Contract (target state after Task 5):
 *   Public-facing source files must have ZERO boundary violations.
 *   Admin / API / prisma paths are excluded from the scan scope.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");
const INSPECTOR_PATH = resolve(import.meta.filename);
const SRC_DIR = join(PROJECT_ROOT, "src");
const SCRIPTS_DIR = join(PROJECT_ROOT, "scripts");

const VIOLATION_PATHS = [
  "src/app/admin",
  "src/app/api",
  "src/lib/prisma.ts",
  "src/lib/auth.ts",
  "prisma",
];

const FORBIDDEN_IMPORTS = [
  "@/lib/prisma",
  "@/lib/auth",
  "next-auth",
  "@prisma/client",
];

const API_FETCH_RE = /fetch\s*\(\s*["'`]\/api\//;

function pathExists(relPath) {
  try {
    statSync(join(PROJECT_ROOT, relPath));
    return true;
  } catch {
    return false;
  }
}

function collectSrcFiles(dir) {
  const out = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      out.push(...collectSrcFiles(full));
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(e.name)) {
      out.push(full);
    }
  }
  return out;
}

function main() {
  const violations = [];

  // 1. Check path existence violations
  for (const relPath of VIOLATION_PATHS) {
    if (pathExists(relPath)) {
      violations.push(`path-exists: ${relPath}`);
    }
  }

  // 2. Scan application source and production scripts included by TypeScript.
  const srcFiles = [SRC_DIR, SCRIPTS_DIR]
    .flatMap((dir) => collectSrcFiles(dir))
    .filter(
      (file) =>
        file !== INSPECTOR_PATH && !/\.test\.[cm]?[jt]sx?$/.test(file),
    );

  for (const absPath of srcFiles) {
    const relPath = absPath.slice(PROJECT_ROOT.length + 1);
    let content;
    try {
      content = readFileSync(absPath, "utf8");
    } catch {
      continue;
    }

    for (const imp of FORBIDDEN_IMPORTS) {
      if (content.includes(`from "${imp}"`) || content.includes(`from '${imp}'`)) {
        violations.push(`forbidden-import: ${relPath} imports ${imp}`);
      }
    }

    if (API_FETCH_RE.test(content)) {
      violations.push(`api-fetch: ${relPath} calls fetch("/api/...")`);
    }
  }

  // Report
  if (violations.length > 0) {
    console.error("❌ Static export boundary violations detected!\n");
    console.error("The following runtime/server dependencies must be removed\n");
    console.error("for the site to be served from a static host:\n");
    for (const v of violations) {
      console.error(`  - ${v}`);
    }
    console.error(`\n${violations.length} violation(s) found.`);
    process.exit(1);
  }

  console.log("✅ No static export boundary violations");
  process.exit(0);
}

main();
