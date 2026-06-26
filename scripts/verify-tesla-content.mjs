#!/usr/bin/env node
/**
 * Tesla 专题页内容验收脚本
 *
 * 验证项:
 * 1. PRD §17.1 内容验收（10+32 项 + 场景 + 边界声明）
 * 2. PRD §3.3 合规红线（不得命中 7 个违规关键词）
 * 3. JSON-LD ItemList 数量 = 42
 *
 * 用法: node scripts/verify-tesla-content.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// PRD §3.2 车型适配边界声明 — 一字不改
const REQUIRED_BOUNDARY_TEXT =
  "不同年份、版本和配置的 Tesla 车型在安装结构、接口、尺寸和空间上可能存在差异。页面项目作为轻改方向参考，最终以到店确认和施工评估为准。";

// PRD §3.3 合规红线 — 不得命中
const FORBIDDEN_PHRASES = [
  "Tesla 官方授权",
  "原厂配件",
  "原厂件",
  "不影响原车质保",
  "不影响原厂质保",
  "100%无损安装",
  "永久质保",
  "全网最低",
];

const TESLA_PATHS = [
  "src/app/product/tesla",
  "src/components/tesla",
  "src/lib/tesla-products.ts",
];

let failures = 0;
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  failures++;
};
const pass = (msg) => console.log(`✓ ${msg}`);

// === 1. 静态数据 shape 检查 ===
console.log("\n=== 1. 数据 shape 检查 ===");
try {
  const tsCode = readFileSync(join(ROOT, "src/lib/tesla-products.ts"), "utf8");
  if (tsCode.includes("teslaFeaturedProjects") && tsCode.includes("teslaOptionalProjects")) {
    pass("teslaFeaturedProjects + teslaOptionalProjects 导出存在");
  } else {
    fail("缺少 teslaFeaturedProjects 或 teslaOptionalProjects 导出");
  }
  const featuredCount = (tsCode.match(/priority:\s*"featured"/g) ?? []).length;
  const optionalCount = (tsCode.match(/priority:\s*"optional"/g) ?? []).length;
  if (featuredCount === 10) {
    pass(`featured 项目数 = 10 (找到 ${featuredCount} 处 priority: "featured")`);
  } else {
    fail(`featured 项目数应为 10, 实际 ${featuredCount}`);
  }
  if (optionalCount === 32) {
    pass(`optional 项目数 = 32 (找到 ${optionalCount} 处 priority: "optional")`);
  } else {
    fail(`optional 项目数应为 32, 实际 ${optionalCount}`);
  }
  // 场景与流程与 FAQ 计数
  const scenarioCount = (tsCode.match(/^\s*\{\s*key:\s*"scenario-/gm) ?? []).length;
  if (scenarioCount === 6) pass(`场景数 = 6`);
  else fail(`场景数应为 6, 实际 ${scenarioCount}`);
} catch (err) {
  fail(`数据文件读取失败: ${err.message}`);
}

// === 2. 边界声明文案 ===
console.log("\n=== 2. PRD §3.2 边界声明 ===");
const fitNotePath = join(ROOT, "src/components/tesla/TeslaModelFitNote.tsx");
if (existsSync(fitNotePath)) {
  const content = readFileSync(fitNotePath, "utf8");
  if (content.includes(REQUIRED_BOUNDARY_TEXT)) {
    pass("TeslaModelFitNote 包含 PRD §3.2 原文（一字不改）");
  } else {
    fail(`TeslaModelFitNote 缺少 PRD §3.2 原文:\n  期望: ${REQUIRED_BOUNDARY_TEXT}`);
  }
} else {
  fail("TeslaModelFitNote.tsx 不存在");
}

// === 3. 合规红线全 grep ===
console.log("\n=== 3. 合规红线（PRD §3.3） ===");
try {
  for (const path of TESLA_PATHS) {
    const fullPath = join(ROOT, path);
    if (!existsSync(fullPath)) continue;
    const pattern = FORBIDDEN_PHRASES.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const result = execSync(
      `grep -rE "${pattern}" ${fullPath} 2>&1 || true`,
      { encoding: "utf8", cwd: ROOT }
    );
    const hits = result.trim().split("\n").filter(Boolean);
    if (hits.length === 0) {
      pass(`${path} - 0 合规红线命中`);
    } else {
      fail(`${path} 命中合规红线:\n${hits.join("\n")}`);
    }
  }
} catch (err) {
  fail(`合规检查失败: ${err.message}`);
}

// === 4. JSON-LD ItemList count ===
console.log("\n=== 4. JSON-LD ItemList count ===");
const pagePath = join(ROOT, "src/app/product/tesla/page.tsx");
if (existsSync(pagePath)) {
  const content = readFileSync(pagePath, "utf8");
  if (content.includes("itemListElement")) {
    pass("page.tsx 包含 ItemList 结构");
  } else {
    fail("page.tsx 缺少 ItemList");
  }
  if (/allProjects.*=.*\.\.\.teslaFeaturedProjects[\s\S]*teslaOptionalProjects/.test(content) ||
      /allProjects.*=.*\.\.\.teslaOptionalProjects[\s\S]*teslaFeaturedProjects/.test(content)) {
    pass("allProjects = featured + optional (42 项)");
  } else {
    fail("allProjects 未正确合并 featured + optional");
  }
} else {
  fail("/product/tesla/page.tsx 不存在");
}

// === 5. 总结 ===
console.log("\n=== 5. 总结 ===");
if (failures === 0) {
  console.log("✓ 所有验收项通过");
  process.exit(0);
} else {
  console.error(`✗ ${failures} 项验收失败`);
  process.exit(1);
}