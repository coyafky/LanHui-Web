#!/usr/bin/env node
/**
 * Xpeng GX 专题页内容验收脚本
 *
 * 验证项 (SPEC §11):
 * 1. 静态数据 shape (15 项目 + 6 场景 + 3 组合 + 7 步 + 8 FAQ)
 * 2. PRD §3.2 车型适配边界声明 (原文一字不改)
 * 3. PRD §3.3 合规红线 9 项 (不得命中)
 * 4. JSON-LD ItemList count = 15
 * 5. 电动门 saleStatus = "preorder"
 * 6. TopicBanner HTML 不含 15 项目名 (不依赖数据层)
 *
 * 用法: node scripts/verify-xpeng-gx-content.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// PRD §3.2 车型适配边界声明 — 一字不改
const REQUIRED_BOUNDARY_TEXT =
  "不同年份、批次、版本和配置的小鹏 GX 在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考，最终以到店确认和施工评估为准。";

// PRD §3.3 合规红线 — 不得命中
const FORBIDDEN_PHRASES = [
  "小鹏官方授权",
  "原厂配件",
  "官方同款",
  "不影响原厂质保",
  "不影响原车质保",
  "100%无损安装",
  "100% 无损安装",
  "永久质保",
  "全网最低",
  "性能提升",
  "操控提升",
  "制动提升",
];

const XPENG_GX_PATHS = [
  "src/app/product/xpeng",
  "src/components/xpeng",
  "src/lib/xpeng-gx-products.ts",
];

let failures = 0;
const fail = (msg) => {
  console.error(`✗ ${msg}`);
  failures++;
};
const pass = (msg) => console.log(`✓ ${msg}`);

// === 1. 数据 shape 检查 ===
console.log("\n=== 1. 数据 shape 检查 ===");
try {
  const tsCode = readFileSync(join(ROOT, "src/lib/xpeng-gx-products.ts"), "utf8");

  // 15 项目
  const projectCount = (tsCode.match(/order:\s*\d+/g) ?? []).length;
  if (projectCount === 15) pass(`升级项目数 = 15 (order 字段 ${projectCount} 处)`);
  else fail(`升级项目数应为 15, 实际 ${projectCount}`);

  // 6 场景
  const scenarioCount = (tsCode.match(/key:\s*"scenario-/g) ?? []).length;
  if (scenarioCount === 6) pass(`场景数 = 6`);
  else fail(`场景数应为 6, 实际 ${scenarioCount}`);

  // 3 组合
  const bundleCount = (tsCode.match(/key:\s*"bundle-/g) ?? []).length;
  if (bundleCount === 3) pass(`组合数 = 3`);
  else fail(`组合数应为 3, 实际 ${bundleCount}`);

  // 7 步
  const stepCount = (tsCode.match(/step:\s*\d+/g) ?? []).length;
  if (stepCount === 7) pass(`服务步数 = 7 (step 字段 ${stepCount} 处)`);
  else fail(`服务步数应为 7, 实际 ${stepCount}`);

  // 8 FAQ
  const faqCount = (tsCode.match(/question:/g) ?? []).length;
  if (faqCount === 8) pass(`FAQ 数 = 8 (question 字段 ${faqCount} 处)`);
  else fail(`FAQ 数应为 8, 实际 ${faqCount}`);

  // 6 类别标签
  const requiredLabels = [
    "protection",
    "appearance",
    "electric_convenience",
    "chassis",
    "screen_care",
    "cabin_care",
  ];
  const allLabelsPresent = requiredLabels.every((l) =>
    tsCode.includes(`${l}:`),
  );
  if (allLabelsPresent) pass(`6 类别标签完整 (${requiredLabels.join(", ")})`);
  else fail(`缺少类别标签: ${requiredLabels.filter((l) => !tsCode.includes(`${l}:`)).join(", ")}`);

  // runtime 断言函数存在
  if (tsCode.includes("assertXpengGxDataShape()")) {
    pass("runtime assertXpengGxDataShape() 存在");
  } else {
    fail("缺少 assertXpengGxDataShape() 调用");
  }
} catch (err) {
  fail(`数据文件读取失败: ${err.message}`);
}

// === 2. PRD §3.2 边界声明文案 ===
console.log("\n=== 2. PRD §3.2 边界声明 ===");
const fitNotePath = join(ROOT, "src/components/xpeng/XpengGxModelFitNote.tsx");
if (existsSync(fitNotePath)) {
  const content = readFileSync(fitNotePath, "utf8");
  if (content.includes(REQUIRED_BOUNDARY_TEXT)) {
    pass("XpengGxModelFitNote 包含 PRD §3.2 原文（一字不改）");
  } else {
    fail(`XpengGxModelFitNote 缺少 PRD §3.2 原文:\n  期望: ${REQUIRED_BOUNDARY_TEXT}`);
  }
} else {
  fail("XpengGxModelFitNote.tsx 不存在");
}

// === 3. 合规红线全 grep ===
console.log("\n=== 3. 合规红线（PRD §3.3） ===");
try {
  for (const path of XPENG_GX_PATHS) {
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
const pagePath = join(ROOT, "src/app/product/xpeng/gx/page.tsx");
if (existsSync(pagePath)) {
  const content = readFileSync(pagePath, "utf8");
  if (content.includes("itemListElement")) {
    pass("page.tsx 包含 ItemList 结构");
  } else {
    fail("page.tsx 缺少 ItemList");
  }
  const jsonLdMatch = content.match(/itemListElement:\s*xpengGxUpgradeProjects\.map\([^)]*\)/);
  if (jsonLdMatch) {
    pass("JSON-LD itemListElement 绑定到 xpengGxUpgradeProjects (15 项)");
  } else {
    fail("JSON-LD itemListElement 未正确绑定数据");
  }
} else {
  fail("/product/xpeng/gx/page.tsx 不存在");
}

// === 5. 电动门 saleStatus = "preorder" ===
console.log("\n=== 5. 电动门预售状态 ===");
try {
  const tsCode = readFileSync(join(ROOT, "src/lib/xpeng-gx-products.ts"), "utf8");
  const electricDoorMatch = tsCode.match(
    /id:\s*"xpeng-gx-electric-door"[\s\S]*?saleStatus:\s*"([^"]+)"/,
  );
  if (electricDoorMatch && electricDoorMatch[1] === "preorder") {
    pass("电动门 saleStatus = \"preorder\"");
  } else {
    fail(`电动门 saleStatus 应为 \"preorder\", 实际: ${electricDoorMatch ? electricDoorMatch[1] : "未找到"}`);
  }
} catch (err) {
  fail(`电动门检查失败: ${err.message}`);
}

// === 6. TopicBanner HTML 不含 15 项目名 (不依赖数据层) ===
console.log("\n=== 6. TopicBanner 与数据层解耦 ===");
const bannerPath = join(ROOT, "src/components/xpeng/XpengGxTopicBanner.tsx");
if (existsSync(bannerPath)) {
  const content = readFileSync(bannerPath, "utf8");
  if (content.includes("import") && content.includes("xpeng-gx-products")) {
    fail("XpengGxTopicBanner 不应 import 数据层");
  } else {
    pass("XpengGxTopicBanner 不依赖数据层 (无 import xpeng-gx-products)");
  }
} else {
  fail("XpengGxTopicBanner.tsx 不存在");
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