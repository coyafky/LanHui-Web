#!/usr/bin/env node
/**
 * 检查生产 UI 代码中是否残留测试占位文案或个人微信号。
 *
 * 禁止出现的文案：
 * - fkycoya（个人微信号）
 * - 微信号:fkycoya（含微信号前缀）
 *
 * 扫描范围：src/components、src/app、src/lib
 * 跳过：*.test.* 文件、*.spec.* 文件
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const FORBIDDEN = [
  { pattern: "fkycoya", label: "fkycoya" },
  { pattern: "微信号:fkycoya", label: "微信号:fkycoya" },
];

const SCAN_DIRS = ["src/components", "src/app", "src/lib"];

let failures = 0;

for (const dir of SCAN_DIRS) {
  const files = globSync(`${dir}/**/*.{ts,tsx}`, {
    cwd: ROOT,
    nodir: true,
    ignore: ["**/*.test.*", "**/*.spec.*"],
  });

  for (const file of files) {
    const fullPath = join(ROOT, file);
    const content = readFileSync(fullPath, "utf8");

    for (const { pattern, label } of FORBIDDEN) {
      if (content.includes(pattern)) {
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(pattern)) {
            console.error(`✗ ${file}:${i + 1} — 违规文案 "${label}"`);
            failures++;
          }
        }
      }
    }
  }
}

if (failures === 0) {
  console.log("✓ 生产 UI 代码未发现测试占位文案或个人微信号");
  process.exit(0);
} else {
  console.error(`\n✗ ${failures} 处违规文案需要修复`);
  process.exit(1);
}
