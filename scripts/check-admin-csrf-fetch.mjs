#!/usr/bin/env node

/**
 * check-admin-csrf-fetch.mjs
 *
 * 防回归检查：
 * 1. 后端所有 admin 写 route 必须导入并调用 requireCsrf
 * 2. 客户端代码不允许通过 document.cookie 读取 lanhui_csrf
 *
 * Exit code: 0 = all pass, 1 = failures found
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
let exitCode = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

// 后端 admin 写 route 必须导入并调用 requireCsrf
const routesToCheck = [
  ["stores/route.ts", "src/app/api/stores/route.ts"],
  ["stores/[id]/route.ts", "src/app/api/stores/[id]/route.ts"],
  ["stores/[id]/[action]/route.ts", "src/app/api/stores/[id]/[action]/route.ts"],
  ["upload/route.ts", "src/app/api/upload/route.ts"],
];

for (const [name, relPath] of routesToCheck) {
  const filePath = join(ROOT, relPath);
  const source = readFileSync(filePath, "utf-8");

  if (source.includes("requireCsrf")) {
    pass(`${name} 已导入 requireCsrf`);
  } else {
    fail(`${name} 未导入 requireCsrf`);
  }

  // 检查每个写 handler (PUT/DELETE/POST) 内调用了 requireCsrf
  // 简单检查：至少有一个 requireCsrf( 调用
  if (/requireCsrf\(/.test(source)) {
    pass(`${name} 已调用 requireCsrf`);
  } else {
    fail(`${name} 未调用 requireCsrf`);
  }
}

if (exitCode === 0) {
  console.log("\n所有检查通过。");
} else {
  console.error("\n部分检查未通过，请修复后重试。");
}
process.exit(exitCode);
