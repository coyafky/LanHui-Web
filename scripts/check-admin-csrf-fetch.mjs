#!/usr/bin/env node

/**
 * check-admin-csrf-fetch.mjs
 *
 * 防回归检查：
 * 1. articles/page.tsx 中不允许对 /api/articles 路径使用裸 fetch（必须用 adminCsrfFetch）
 * 2. 状态转换操作（置顶/发布/撤回/归档）必须调用 action 路由而非 PUT
 * 3. 后端 articles 写 route 必须导入并调用 requireCsrf
 * 4. 客户端代码不允许通过 document.cookie 读取 lanhui_csrf
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

// 1. articles/page.tsx 不允许裸 fetch 写文章 API
const pageFile = join(ROOT, "src/app/admin/(dashboard)/articles/page.tsx");
const pageSource = readFileSync(pageFile, "utf-8");

const bareFetchMatches = pageSource.match(
  /fetch\(\s*[`"']\/api\/articles\//g,
);
if (bareFetchMatches && bareFetchMatches.length > 0) {
  fail(
    `articles/page.tsx 中存在 ${bareFetchMatches.length} 处裸 fetch 调用 /api/articles/，请改用 adminCsrfFetch`,
  );
} else {
  pass("articles/page.tsx 中已无裸 fetch 调用 /api/articles/ 的写操作");
}

// 2. 状态转换操作必须调用 action 路由而非 PUT
if (
  /fetch\(\s*[`"']\/api\/articles\/\$\{.*\.id\}[\s\S]*?method:\s*"PUT"/.test(
    pageSource,
  )
) {
  fail("articles/page.tsx 中仍存在 PUT /api/articles/[id] 调用，应改用 action 路由");
} else {
  pass("articles/page.tsx 中已无 PUT 状态转换调用");
}

// 3. 后端 articles 写 route 必须导入并调用 requireCsrf
const routesToCheck = [
  ["articles/[id]/route.ts", "src/app/api/articles/[id]/route.ts"],
  ["articles/route.ts", "src/app/api/articles/route.ts"],
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

// 4. 客户端代码不允许 document.cookie 读取 lanhui_csrf
const adminFiles = [
  "src/app/admin/(dashboard)/articles/page.tsx",
];

for (const relPath of adminFiles) {
  const filePath = join(ROOT, relPath);
  const source = readFileSync(filePath, "utf-8");
  if (
    /document\.cookie/.test(source) &&
    /lanhui_csrf/.test(source)
  ) {
    fail(`${relPath} 通过 document.cookie 读取 lanhui_csrf，应通过 adminCsrfFetch 获取`);
  } else {
    pass(`${relPath} 未直接读取 document.cookie 中的 lanhui_csrf`);
  }
}

if (exitCode === 0) {
  console.log("\n所有检查通过。");
} else {
  console.error("\n部分检查未通过，请修复后重试。");
}
process.exit(exitCode);
