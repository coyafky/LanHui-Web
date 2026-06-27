#!/usr/bin/env node
/**
 * NIO ES8 专题页内容验收脚本（plan §F.3）
 *
 * 验证项:
 *   1. 数据 shape (17 项目 + 4 场景 + 4 组合 + 7 步 + 9 FAQ)
 *   2. PRD §3.2 边界声明文案（一字不改）
 *   3. PRD §3.3 合规红线 9 项（不得命中）
 *   4. JSON-LD ItemList count = 17
 *   5. 海报红线 3 关键词（不得命中）
 *   6. TopicBanner 与数据层解耦（不 import @/lib/nio-products）
 *   7. 总结: failures > 0 则 exit 1
 *
 * 用法: node scripts/verify-nio-content.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// PRD §3.2 边界声明 — 一字不改
const REQUIRED_BOUNDARY_TEXT =
  "不同年份、批次、版本和配置的蔚来 ES8 在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考，最终以到店确认和施工评估为准。";

// PRD §3.3 合规红线 — 不得命中
const FORBIDDEN_PHRASES = [
  "蔚来官方授权",
  "原厂配件",
  "官方同款",
  "不影响原车质保",
  "不影响原厂质保",
  "100%无损安装",
  "100% 无损安装",
  "永久质保",
  "全网最低",
  "性能提升",
  "操控提升",
  "制动提升",
];

const NIO_PATHS = [
  "src/app/product/nio",
  "src/components/nio",
  "src/lib/nio-products.ts",
];

// 海报模块红线（PRD §0 变更说明）
const POSTER_RED_FLAGS = ["poster_expand_click", "poster_asset_view", "PosterStub"];

let failures = 0;
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  failures++;
};
const pass = (msg) => console.log(`✓ ${msg}`);

// === 1. 数据 shape 检查 ===
console.log("\n=== 1. 数据 shape 检查 ===");
try {
  const tsCode = readFileSync(join(ROOT, "src/lib/nio-products.ts"), "utf8");

  // 17 项目
  const projectCount = (tsCode.match(/order:\s*\d+/g) ?? []).length;
  if (projectCount === 17) pass(`升级项目数 = 17 (order 字段 ${projectCount} 处)`);
  else fail(`升级项目数应为 17, 实际 ${projectCount}`);

  // 4 场景 — 沿用 xpeng-gx 模式: 统计 NioEs8Scenario data entry
  const scenarioCount = (tsCode.match(/key:\s*"protection"|key:\s*"appearance"|key:\s*"family_cabin"|key:\s*"driving_protection"/g) ?? []).length;
  if (scenarioCount === 4) pass(`场景数 = 4 (scenario data entry ${scenarioCount} 处)`);
  else fail(`场景数应为 4, 实际 ${scenarioCount}`);

  // 4 组合
  const bundleCount = (tsCode.match(/key:\s*"new-car-protection"|key:\s*"appearance-upgrade"|key:\s*"family-cabin-upgrade"|key:\s*"driving-daily-protection"/g) ?? []).length;
  if (bundleCount === 4) pass(`组合数 = 4`);
  else fail(`组合数应为 4, 实际 ${bundleCount}`);

  // 7 步
  const stepCount = (tsCode.match(/step:\s*\d+/g) ?? []).length;
  if (stepCount === 7) pass(`服务步数 = 7 (step 字段 ${stepCount} 处)`);
  else fail(`服务步数应为 7, 实际 ${stepCount}`);

  // 9 FAQ — 只统计 data entry 的 `question:` (排除类型定义)
  const faqCount = (tsCode.match(/^\s*question:\s*"/gm) ?? []).length;
  if (faqCount === 9) pass(`FAQ 数 = 9 (data entry ${faqCount} 处)`);
  else fail(`FAQ 数应为 9, 实际 ${faqCount}`);

  // runtime 断言函数 — 5 个 count drift 检查
  const driftChecks = [
    "nioEs8UpgradeProjects.length !== NIO_ES8_PROJECT_COUNT",
    "nioEs8Scenarios.length !== NIO_ES8_SCENARIO_COUNT",
    "nioEs8Bundles.length !== NIO_ES8_BUNDLE_COUNT",
    "nioEs8ServiceSteps.length !== NIO_ES8_SERVICE_STEP_COUNT",
    "nioEs8Faq.length !== NIO_ES8_FAQ_COUNT",
  ];
  const allDriftChecksPresent = driftChecks.every((c) => tsCode.includes(c));
  if (allDriftChecksPresent) {
    pass(`5 个 runtime count drift check 全部存在`);
  } else {
    const missing = driftChecks.filter((c) => !tsCode.includes(c));
    fail(`缺少 runtime drift check: ${missing.join(", ")}`);
  }
} catch (err) {
  fail(`数据文件读取失败: ${err.message}`);
}

// === 2. PRD §3.2 边界声明文案 ===
console.log("\n=== 2. PRD §3.2 边界声明 ===");
const fitNoteCandidates = [
  "src/app/product/nio/es8/page.tsx",
  "src/components/nio/NioEs8ModelFitNote.tsx",
  "src/components/nio/NioEs8Hero.tsx",
];
let boundaryFound = false;
for (const path of fitNoteCandidates) {
  const fullPath = join(ROOT, path);
  if (!existsSync(fullPath)) continue;
  const content = readFileSync(fullPath, "utf8");
  if (content.includes(REQUIRED_BOUNDARY_TEXT)) {
    pass(`${path} 包含 PRD §3.2 原文（一字不改）`);
    boundaryFound = true;
    break;
  }
}
if (!boundaryFound) {
  fail(
    `PRD §3.2 原文未在候选文件中找到:\n  期望: ${REQUIRED_BOUNDARY_TEXT}\n  候选: ${fitNoteCandidates.join(", ")}\n  说明: 页面实际使用 3 段改写文案（FIT_NOTE_PARAGRAPHS），与 PRD §3.2 原文存在语义偏差，需后续 batch 修复`,
  );
}

// === 3. 合规红线全 grep ===
console.log("\n=== 3. 合规红线（PRD §3.3） ===");
try {
  for (const path of NIO_PATHS) {
    const fullPath = join(ROOT, path);
    if (!existsSync(fullPath)) continue;
    const pattern = FORBIDDEN_PHRASES.map((p) =>
      p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    ).join("|");
    const result = execSync(
      `grep -rE "${pattern}" ${fullPath} 2>&1 || true`,
      { encoding: "utf8", cwd: ROOT },
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
const pagePath = join(ROOT, "src/app/product/nio/es8/page.tsx");
if (existsSync(pagePath)) {
  const content = readFileSync(pagePath, "utf8");
  if (content.includes("itemListElement")) {
    pass("page.tsx 包含 ItemList 结构");
  } else {
    fail("page.tsx 缺少 ItemList");
  }
  const jsonLdMatch = content.match(
    /itemListElement:\s*nioEs8UpgradeProjects\.map\([^)]*\)/,
  );
  if (jsonLdMatch) {
    pass("JSON-LD itemListElement 绑定到 nioEs8UpgradeProjects (17 项)");
  } else {
    fail("JSON-LD itemListElement 未正确绑定数据");
  }
  const numberMatch = content.match(
    /numberOfItems:\s*nioEs8UpgradeProjects\.length/,
  );
  if (numberMatch) {
    pass("JSON-LD numberOfItems 引用 nioEs8UpgradeProjects.length (=17)");
  } else {
    fail("JSON-LD numberOfItems 未引用数据长度");
  }
} else {
  fail("/product/nio/es8/page.tsx 不存在");
}

// === 5. 海报红线 grep（PRD §0 变更说明） ===
console.log("\n=== 5. 海报模块红线 ===");
try {
  for (const path of NIO_PATHS) {
    const fullPath = join(ROOT, path);
    if (!existsSync(fullPath)) continue;
    const pattern = POSTER_RED_FLAGS.map((p) =>
      p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    ).join("|");
    const result = execSync(
      `grep -rE "${pattern}" ${fullPath} 2>&1 || true`,
      { encoding: "utf8", cwd: ROOT },
    );
    const hits = result.trim().split("\n").filter(Boolean);
    if (hits.length === 0) {
      pass(`${path} - 0 海报红线命中`);
    } else {
      fail(`${path} 命中海报红线:\n${hits.join("\n")}`);
    }
  }
} catch (err) {
  fail(`海报检查失败: ${err.message}`);
}

// === 6. TopicBanner 与数据层解耦 ===
console.log("\n=== 6. TopicBanner 与数据层解耦 ===");
const bannerPath = join(ROOT, "src/components/product/NioTopicBanner.tsx");
if (existsSync(bannerPath)) {
  const content = readFileSync(bannerPath, "utf8");
  const importsDataLayer =
    /^import\s.+from\s+["'].*nio-products["']/m.test(content);
  if (importsDataLayer) {
    fail("NioTopicBanner 不应 import 数据层");
  } else {
    pass("NioTopicBanner 不依赖数据层 (无 import 语句指向 nio-products)");
  }
} else {
  fail("NioTopicBanner.tsx 不存在");
}

// === 7. 总结 ===
console.log("\n=== 7. 总结 ===");
if (failures === 0) {
  console.log("✓ 所有验收项通过");
  process.exit(0);
} else {
  console.error(`✗ ${failures} 项验收失败`);
  process.exit(1);
}
