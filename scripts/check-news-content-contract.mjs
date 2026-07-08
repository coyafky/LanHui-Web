#!/usr/bin/env node

/**
 * check-news-content-contract.mjs
 *
 * 验证 NewsItem.content 类型契约不被破坏：
 * 1. `NewsItem` 类型中 `content` 字段仍是 `string`
 * 2. `data.ts` 中存在 `normalizeArticle` 函数且无旧的 `mapApiArticle`
 * 3. `page.tsx` 中 `ArticleContent` 的 content 使用了 || 兜底
 *
 * Exit code: 0 = all pass, 1 = failures found
 *
 * Usage:
 *   node scripts/check-news-content-contract.mjs
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
let exitCode = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

// 1. 检查 NewsItem 类型中 content 为 string
const newsFile = join(ROOT, "src/lib/news.ts");
const newsSource = readFileSync(newsFile, "utf-8");
if (
  /content:\s*string\s*;/.test(newsSource) ||
  /content:\s*string\s*}/.test(newsSource)
) {
  pass("NewsItem.content 类型为 string");
} else {
  fail("NewsItem.content 不是 string 类型，可能被改为 string | undefined");
}

// 2. 检查 data.ts 中存在 normalizeArticle 且不存在 mapApiArticle
const dataFile = join(ROOT, "src/lib/data.ts");
const dataSource = readFileSync(dataFile, "utf-8");

if (dataSource.includes("function normalizeArticle(")) {
  pass("data.ts 中存在 normalizeArticle 函数");
} else {
  fail("data.ts 中缺少 normalizeArticle 函数");
}

if (dataSource.includes("function mapApiArticle(")) {
  fail("data.ts 中仍存在旧的 mapApiArticle 函数，需删除");
} else {
  pass("data.ts 中已无 mapApiArticle 残留");
}

// 3. 检查 page.tsx 中 ArticleContent 使用了 || 兜底
const pageFile = join(ROOT, "src/app/news/[slug]/page.tsx");
const pageSource = readFileSync(pageFile, "utf-8");

const articleContentMatch = pageSource.match(
  /<ArticleContent\s+content=\{([^}]+)\}\s*\/>/,
);
if (articleContentMatch) {
  const contentExpr = articleContentMatch[1];
  if (contentExpr.includes("||")) {
    pass(`page.tsx ArticleContent 使用了兜底表达式: ${contentExpr}`);
  } else {
    fail(
      `page.tsx ArticleContent 直接传 ${contentExpr}，缺少 || 兜底`,
    );
  }
} else {
  fail("page.tsx 中未找到 ArticleContent 调用");
}

if (exitCode === 0) {
  console.log("\n所有检查通过。");
} else {
  console.error("\n部分检查未通过，请修复后重试。");
}
process.exit(exitCode);
