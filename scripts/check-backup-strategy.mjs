#!/usr/bin/env node
/**
 * 备份策略完整性检查脚本
 *
 * 检查备份/恢复脚本、Runbook、cron 模板是否存在，
 * 以及 .gitignore 是否包含必要的备份文件忽略规则。
 *
 * 用法:
 *   npm run check:backup
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const REQUIRED_FILES = [
  "scripts/db-backup.mjs",
  "scripts/db-restore.mjs",
  "docs/DATABASE_BACKUP_RUNBOOK.md",
  "ops/cron/lanhui-db-backup.cron.example",
];

const REQUIRED_GITIGNORE_RULES = [
  "backups/",
  "*.sql",
  "*.sql.gz",
  "*.dump",
];

function checkFiles() {
  const missing = [];
  for (const file of REQUIRED_FILES) {
    const fullPath = resolve(ROOT, file);
    if (!existsSync(fullPath)) {
      missing.push(file);
    }
  }
  return missing;
}

function checkGitignore() {
  const gitignorePath = resolve(ROOT, ".gitignore");
  if (!existsSync(gitignorePath)) {
    return { missing: REQUIRED_GITIGNORE_RULES, gitignoreExists: false };
  }

  const content = readFileSync(gitignorePath, "utf-8");
  const lines = content.split("\n").map((l) => l.trim());

  const missing = [];
  for (const rule of REQUIRED_GITIGNORE_RULES) {
    if (!lines.some((line) => line === rule)) {
      missing.push(rule);
    }
  }
  return { missing, gitignoreExists: true };
}

function main() {
  let hasError = false;

  // Check required files
  console.log("=== Backup Strategy File Check ===");
  const missingFiles = checkFiles();
  if (missingFiles.length === 0) {
    console.log("All required files present:");
    for (const file of REQUIRED_FILES) {
      console.log(`  ✓ ${file}`);
    }
  } else {
    hasError = true;
    console.log("Missing files:");
    for (const file of missingFiles) {
      console.log(`  ✗ ${file}`);
    }
    console.log("");
    console.log("Fix: Create the missing files. See docs/DATABASE_BACKUP_RUNBOOK.md for guidance.");
  }

  console.log("");

  // Check .gitignore rules
  console.log("=== .gitignore Rule Check ===");
  const { missing: missingRules, gitignoreExists } = checkGitignore();
  if (!gitignoreExists) {
    hasError = true;
    console.log(".gitignore not found. Create it with the required rules.");
  } else if (missingRules.length === 0) {
    console.log("All required .gitignore rules present:");
    for (const rule of REQUIRED_GITIGNORE_RULES) {
      console.log(`  ✓ ${rule}`);
    }
  } else {
    hasError = true;
    console.log("Missing .gitignore rules:");
    for (const rule of missingRules) {
      console.log(`  ✗ ${rule}`);
    }
    console.log("");
    console.log("Fix: Add the following lines to .gitignore:");
    for (const rule of missingRules) {
      console.log(`  ${rule}`);
    }
  }

  console.log("");

  if (hasError) {
    console.log("RESULT: FAIL — one or more checks failed.");
    process.exit(1);
  }

  console.log("RESULT: PASS — all checks passed.");
}

main();
