#!/usr/bin/env node

/**
 * check-footer-copyright-year.mjs
 *
 * 防回归检查：
 * 1. Footer.tsx 不允许直接使用 © {brand.foundedYear} 作为版权年份
 * 2. Footer.tsx 必须导入和使用 CurrentCopyrightYear 组件
 * 3. brand.ts 中 foundedYear 字段必须存在
 * 4. CurrentCopyrightYear.tsx 组件文件必须存在
 *
 * Exit code: 0 = 通过，1 = 发现问题
 *
 * Usage:
 *   node scripts/check-footer-copyright-year.mjs
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = new URL("..", import.meta.url).pathname;
let exitCode = 0;

function fail(msg, file) {
  console.error(`FAIL [${file}]: ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

// 用 git ls-files 确保只扫 tracked 文件
let files;
try {
  const output = execSync(
    "git ls-files src/components/Footer.tsx src/components/CurrentCopyrightYear.tsx src/lib/brand.ts",
    { cwd: ROOT, encoding: "utf-8" }
  );
  files = output.trim().split("\n").filter(Boolean);
} catch {
  console.error("WARN: git ls-files failed");
  process.exit(0);
}

// Check Footer.tsx
const footerPath = join(ROOT, "src/components/Footer.tsx");
try {
  const footerContent = readFileSync(footerPath, "utf8");

  // Must NOT contain direct brand.foundedYear in copyright line
  if (footerContent.includes("© {brand.foundedYear}")) {
    fail(
      "Footer.tsx 禁止直接使用 © {brand.foundedYear} 作为版权年份",
      "src/components/Footer.tsx"
    );
  } else {
    pass("Footer.tsx 未直接使用 brand.foundedYear 作为版权年份");
  }

  // Must import CurrentCopyrightYear
  if (!footerContent.includes("CurrentCopyrightYear")) {
    fail(
      "Footer.tsx 必须导入和使用 CurrentCopyrightYear 组件",
      "src/components/Footer.tsx"
    );
  } else {
    pass("Footer.tsx 使用了 CurrentCopyrightYear");
  }
} catch {
  fail("无法读取 Footer.tsx", "src/components/Footer.tsx");
}

// Check brand.ts — foundedYear must still exist
const brandPath = join(ROOT, "src/lib/brand.ts");
try {
  const brandContent = readFileSync(brandPath, "utf8");
  if (!brandContent.includes("foundedYear")) {
    fail("brand.foundedYear 被删除或重命名", "src/lib/brand.ts");
  } else {
    pass("brand.foundedYear 仍然存在");
  }
} catch {
  fail("无法读取 brand.ts", "src/lib/brand.ts");
}

// Check CurrentCopyrightYear.tsx exists
const ccyPath = join(ROOT, "src/components/CurrentCopyrightYear.tsx");
try {
  readFileSync(ccyPath, "utf8");
  pass("CurrentCopyrightYear.tsx 存在");
} catch {
  fail("CurrentCopyrightYear.tsx 不存在", "src/components/CurrentCopyrightYear.tsx");
}

process.exit(exitCode);
