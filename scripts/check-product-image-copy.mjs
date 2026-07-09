#!/usr/bin/env node

/**
 * check-product-image-copy.mjs
 *
 * 检查产品图片文案是否混入禁用词：
 * 1. imageStatus 字段值 "generated-preview"
 * 2. 前台文案 "功能预览图"、"生成预览图"、"AI 生成"
 *
 * Exit code: 0 = 通过，1 = 发现禁用文案
 *
 * Usage:
 *   node scripts/check-product-image-copy.mjs
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
let exitCode = 0;

// 用拼接字符串规避自检误报
const FORBIDDEN_STATUS = "generated" + "-preview";
const FORBIDDEN_PATTERNS = [
  { pattern: FORBIDDEN_STATUS, label: 'imageStatus "generated-preview"' },
  { pattern: "功能预览图", label: '文案 "功能预览图"' },
  { pattern: "生成预览图", label: '文案 "生成预览图"' },
  { pattern: "AI 生成", label: '文案 "AI 生成"' },
];

// 扫描 src/lib, src/components, src/app/product, scripts（含 test 子目录）
const SCAN_DIRS = [
  "src/lib",
  "src/components",
  "src/app/product",
  "scripts",
];

function fail(msg, file) {
  console.error(`FAIL [${file}]: ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

// 用 git ls-files 确保只扫 tracked 文件（避免 .next/ node_modules/）
let allFiles = [];
try {
  const output = execSync(
    "git ls-files " + SCAN_DIRS.join(" "),
    { cwd: ROOT, encoding: "utf-8" }
  );
  allFiles = output.trim().split("\n").filter(Boolean);
} catch {
  console.error("WARN: git ls-files failed, falling back to no-op");
  process.exit(0);
}

let totalChecked = 0;
let foundIssues = false;

for (const file of allFiles) {
  const absPath = join(ROOT, file);
  let content;
  try {
    content = readFileSync(absPath, "utf8");
  } catch {
    continue;
  }

  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (content.includes(pattern)) {
      // 排除检查脚本自身
      if (absPath.endsWith("check-product-image-copy.mjs")) continue;
      fail(`发现 ${label}`, file);
      foundIssues = true;
    }
  }
  totalChecked++;
}

pass(`扫描完成: ${totalChecked} 个文件`);
if (foundIssues) {
  console.error("\n存在禁用文案，请修复后重新检查。");
} else {
  console.log("\n未发现禁用文案。");
}
process.exit(exitCode);
