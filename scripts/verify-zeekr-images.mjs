#!/usr/bin/env node
/**
 * ZEEKR 图片 CI 校验脚本
 *
 * 按 PRD v2.0 §8.6 校验 public/images/products/zeekr/ 下所有 PNG/JPG。
 * 校验项(任一不通过则退出码 1,中断 build):
 *   1. 像素 = 1448 × 1086
 *   2. 宽高比 = 4:3(允许浮点误差 ≤ 0.01)
 *   3. 命名符合 ^[a-z0-9-]+\.(png|jpe?g)$
 *   4. 文件大小 ≤ 3 MB
 *   5. 路径前缀 public/images/products/zeekr/{9x,8x,009}/
 *   6. 文件总数 = 21
 *
 * 用法:
 *   node scripts/verify-zeekr-images.mjs
 *
 * 设计:只校验 zeekr,不顺带扫描其他专题(其他专题的图规格不在本 PRD 范围)。
 */

import { readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SCAN_ROOT = join(ROOT, "public/images/products/zeekr");
const ALLOWED_SUBDIRS = new Set(["9x", "8x", "009"]);
const EXPECTED_TOTAL = 21;
const EXPECTED_WIDTH = 1448;
const EXPECTED_HEIGHT = 1086;
const MAX_ASPECT_DELTA = 0.01;
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB
const NAME_REGEX = /^[a-z0-9-]+\.(png|jpe?g)$/i;

/** @type {string[]} */
const failures = [];

function fail(file, reason) {
  const rel = relative(ROOT, file);
  failures.push(`[FAIL] ${rel} — ${reason}`);
}

function fatal(msg) {
  console.error(`[ERROR] ${msg}`);
  process.exit(1);
}

async function checkFile(file) {
  // 1. 路径前缀:文件必须在 zeekr/{9x,8x,009}/ 之下
  const relFromScan = relative(SCAN_ROOT, file);
  const topSegment = relFromScan.split(/[\\/]/)[0];
  if (!topSegment) {
    fail(file, "文件不在 zeekr/ 任何子目录中");
    return;
  }
  if (!ALLOWED_SUBDIRS.has(topSegment)) {
    fail(
      file,
      `不允许的子目录 "${topSegment}",只接受 ${[...ALLOWED_SUBDIRS].join("|")}`,
    );
    return;
  }

  // 2. 文件名 ASCII slug
  const baseName = relFromScan.split(/[\\/]/).pop() ?? "";
  if (!NAME_REGEX.test(baseName)) {
    fail(file, `文件名不符合 ^[a-z0-9-]+\\.(png|jpe?g)$: ${baseName}`);
    return;
  }

  // 3. 文件大小 ≤ 3 MB
  const size = statSync(file).size;
  if (size > MAX_FILE_SIZE) {
    fail(
      file,
      `文件大小 ${(size / 1024 / 1024).toFixed(2)} MB 超过 3 MB`,
    );
    return;
  }

  // 4. 像素 + 宽高比(sharp 读 PNG/JPG)
  let meta;
  try {
    meta = await sharp(file).metadata();
  } catch (err) {
    fail(file, `sharp 读取失败: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }
  if (meta.width !== EXPECTED_WIDTH) {
    fail(file, `宽度 ${meta.width} ≠ ${EXPECTED_WIDTH}`);
    return;
  }
  if (meta.height !== EXPECTED_HEIGHT) {
    fail(file, `高度 ${meta.height} ≠ ${EXPECTED_HEIGHT}`);
    return;
  }
  const ratio = (meta.width ?? 0) / (meta.height ?? 1);
  if (Math.abs(ratio - 4 / 3) > MAX_ASPECT_DELTA) {
    fail(file, `宽高比 ${ratio.toFixed(4)} 偏离 4:3 超过 ${MAX_ASPECT_DELTA}`);
    return;
  }
}

async function main() {
  if (!existsSync(SCAN_ROOT)) {
    fatal(`目录不存在: ${SCAN_ROOT}`);
  }

  // 递归收集 zeekr/ 下所有 png/jpg/jpeg
  /** @type {string[]} */
  const files = [];
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(p);
      } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
        files.push(p);
      }
    }
  }
  walk(SCAN_ROOT);

  if (files.length !== EXPECTED_TOTAL) {
    fail(
      SCAN_ROOT,
      `文件总数 ${files.length} ≠ ${EXPECTED_TOTAL}(9X 14 + 8X 6 + 009 1)`,
    );
  }

  await Promise.all(files.map((f) => checkFile(f)));

  console.log(`[verify:zeekr-images] 扫描 ${files.length} 个文件`);
  if (failures.length === 0) {
    console.log("[verify:zeekr-images] OK — 所有校验通过");
    process.exit(0);
  } else {
    console.error(`[verify:zeekr-images] 失败 ${failures.length} 项:`);
    for (const msg of failures) console.error(`  ${msg}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(
    `[verify:zeekr-images] 未捕获异常: ${err instanceof Error ? err.stack : String(err)}`,
  );
  process.exit(1);
});
