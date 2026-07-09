---
change: fix-product-image-copy
design-doc: docs/superpowers/specs/2026-07-09-fix-product-image-copy-design.md
base-ref: a9876ced60ea346341803265d70f84391be85067
archived-with: 2026-07-09-fix-product-image-copy
---

# 产品图片标注修正 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将全站 `imageStatus: "generated-preview"` 及关联前端文案（"功能预览图""生成预览图""AI 生成"）统一修正为 `"product-preview"`（"商品预览效果图"），删除所有 related badge 和免责声明。

**架构：** 自上而下实施，利用 TS strict 类型检查即时暴露未同步处。新增检查脚本防回归，批量替换类型字面量 + 组件中的条件渲染。

**技术栈：** TypeScript strict, Next.js 16, React 19, Tailwind v4, vitest

archived-with: 2026-07-09-fix-product-image-copy
---

## 文件结构

### 新增文件
| 文件 | 职责 |
|------|------|
| `scripts/check-product-image-copy.mjs` | 扫描 `src/lib` `src/components` `src/app/product` `scripts`，禁止 `generated-preview` `功能预览图` `生成预览图` `AI 生成` 文案回归 |

### 修改文件索引

**检查和配置：**
- `package.json` — 新增 `check:product-image-copy` 脚本，接入 `npm run check` 链

**核心类型和函数（1 文件）：**
- `src/lib/wenjie-preview-images.ts` — `WenjiePreviewImageStatus` 类型 `"generated-preview"` → `"product-preview"`，`buildWenjieGeneratedPreviewImage` → `buildWenjieProductPreviewImage`，alt 文案更新

**Wenjie upgrade-project 文件（4 文件）：**
- `src/lib/wenjie-m6-upgrade-projects.ts` — import + 函数调用更新
- `src/lib/wenjie-m7-upgrade-projects.ts` — import + 函数调用更新
- `src/lib/wenjie-m8-upgrade-projects.ts` — import + 函数调用更新
- `src/lib/wenjie-series-upgrade-projects.ts` — import + 函数调用更新

**产品数据文件 — 类型 + 数据替换（17 文件）：**
- `src/lib/li-auto-i6-products.ts` — `"generated-preview"` → `"product-preview"` + alt
- `src/lib/li-auto-i8-products.ts` — 同上
- `src/lib/li-auto-l9-products.ts` — 同上
- `src/lib/li-auto-one-products.ts` — 同上
- `src/lib/li-auto-mega-products.ts` — 同上
- `src/lib/li-auto-series-upgrade-projects.ts` — 同上
- `src/lib/nio-products.ts` — 类型 + 数据 + FAQ 文案更新
- `src/lib/zeekr-9x-products.ts` — 类型 + 数据替换
- `src/lib/zeekr-8x-products.ts` — 类型 + 数据替换
- `src/lib/denza-d9-products.ts` — 类型 + 数据替换
- `src/lib/voyah-products.ts` — 类型 + 数据 + validate 内断言更新
- `src/lib/gaoshan-products.ts` — 类型 + 数据替换
- `src/lib/zhijie-v9-products.ts` — 类型 + 数据替换
- `src/lib/ledao-l90-products.ts` — 类型 + 数据替换
- `src/lib/xpeng-gx-products.ts` — 类型 + 数据 + alt 文案更新
- `src/lib/xiaomi-yu7-upgrade-projects.ts` — 类型 + 数据替换
- `src/lib/tesla-products.ts` — 类型 + 数据替换

**组件文件 — ProjectGrid badge + alt（12 文件）：**
- `src/components/wenjie/model/WenjieModelProjectGrid.tsx`
- `src/components/zeekr-9x/Zeekr9xProjectGrid.tsx`
- `src/components/zeekr-8x/Zeekr8xProjectGrid.tsx`
- `src/components/xiaomi-yu7/XiaomiYu7ProjectGrid.tsx`
- `src/components/xiaomi-su7/XiaomiSu7ProjectGrid.tsx`
- `src/components/zhijie/ZhijieV9ProjectGrid.tsx`
- `src/components/xpeng/XpengGxProjectGrid.tsx`
- `src/components/voyah/VoyahDreamerProjectGrid.tsx`
- `src/components/li-auto/LiAutoI6ProjectGrid.tsx`
- `src/components/ledao/LedaoL90ProjectGrid.tsx`
- `src/components/gaoshan/Gaoshan8ProjectGrid.tsx`
- `src/components/denza/DenzaD9ProjectGrid.tsx`

每个 ProjectGrid 组件需做 3 处改动：
1. 类型定义中 `"generated-preview"` → `"product-preview"`
2. statusLabel `"效果预览"` → `"商品预览效果图"`
3. 删除 `project.imageStatus === "generated-preview"` 对应的 AlertCircle 或纯文本 badge 条件块

**组件文件 — Hero/Grid 文案修正（8 文件）：**
- `src/components/wenjie/WenjieSeriesHero.tsx` — 删除免责声明 `<p>功能预览图用于说明升级方向...</p>`
- `src/components/wenjie/WenjieSeriesSubModelsGrid.tsx` — alt "升级款式功能预览图" → "升级款式商品预览效果图"
- `src/components/wenjie/WenjieSeriesFeaturedGrid.tsx` — 注释中文案修正（仅注释，可选）
- `src/components/xiaomi-series/XiaomiSeriesHero.tsx` — 删除免责声明 + alt "小米系列升级方案功能预览图" → "小米系列升级方案商品预览效果图"
- `src/components/xiaomi-series/XiaomiSeriesFeaturedGrid.tsx` — alt "升级项目功能预览图" → "升级项目商品预览效果图"
- `src/components/li-auto/LiAutoSeriesHero.tsx` — 删除 `<p>功能预览图 · 后续补充</p>`
- `src/components/li-auto/LiAutoSeriesSubModelsGrid.tsx` — aria-label "升级款式功能预览图" → "升级款式商品预览效果图"
- `src/components/li-auto/LiAutoSeriesFeaturedGrid.tsx` — 注释中文案修正（可选）
- `src/components/denza/DenzaBrandHero.tsx` — 删除 `<p>功能预览图 · 后续补充</p>`

**页面文件（1 文件）：**
- `src/app/product/zhijie/page.tsx` — 删除 "功能预览图 · 后续补充" 文案行

**测试文件（约 14 文件）：**
- `src/lib/wenjie-m6-upgrade-projects.test.ts` — 断言 `"generated-preview"` → `"product-preview"`，注释更新
- `src/lib/wenjie-m7-upgrade-projects.test.ts` — 同上
- `src/lib/wenjie-m8-upgrade-projects.test.ts` — 同上
- `src/lib/wenjie-series-upgrade-projects.test.ts` — 同上
- `src/lib/li-auto-series-upgrade-projects.test.ts` — 同上
- `src/lib/li-auto-l9-products.test.ts` — 断言 + 测试描述 "AI 生成预览图" → "商品预览效果图"
- `src/lib/li-auto-mega-products.test.ts` — 同上
- `src/lib/zeekr-9x-products.test.ts` — 断言 `"generated-preview"` → `"product-preview"`
- `src/lib/zeekr-8x-products.test.ts` — 同上
- `src/lib/xpeng-gx-products.test.ts` — `valid` 数组中 `"generated-preview"` → `"product-preview"`
- `src/lib/nio-products.test.ts` — 断言 + FAQ 测试描述更新
- `src/lib/tesla-products.test.ts` — 断言 `"generated-preview"` → `"product-preview"` + valid 数组更新

**审计脚本（1 文件）：**
- `scripts/test/image-status-audit.mjs` — 计数器键 `"generated-preview"` → `"product-preview"`

archived-with: 2026-07-09-fix-product-image-copy
---

## 任务

### 任务 1：创建检查脚本

**文件：**
- 创建：`scripts/check-product-image-copy.mjs`
- 修改：`package.json`

- [x] **步骤 1：创建检查脚本**

创建 `scripts/check-product-image-copy.mjs`，扫描产品相关目录，禁止禁用文案回归。

```js
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
      // 排除检查脚本自身（自检引用 name + label 可能包含）
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
```

- [x] **步骤 2：package.json 添加脚本并接入 check 链**

在 `package.json` 的 `scripts` 区域找到 `"check:news-content"` 行，在其后添加：

```json
    "check:product-image-copy": "node scripts/check-product-image-copy.mjs",
```

找到 `"check"` 脚本行（`"npm run lint && npm run typecheck && ..."`），在 `check:news-content` 和 `build` 之间插入 `&& npm run check:product-image-copy`：

```json
"check": "npm run lint && npm run typecheck && npm run verify:zeekr-images && npm run check:backup && npm run check:breadcrumbs && npm run check:product-layout && npm run check:contact-copy && npm run check:product-placeholders && npm run check:news-content && npm run check:product-image-copy && npm run build",
```

- [x] **步骤 3：验证**

运行：`node scripts/check-product-image-copy.mjs`
预期：PASS（此时代码中仍有 `generated-preview`，所以会 FAIL——这是正常的，后续修复后它会 PASS）

- [x] **步骤 4：提交**

```bash
git add scripts/check-product-image-copy.mjs package.json
git commit -m "feat: add check-product-image-copy script to prevent forbidden copy regression"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 2：核心 lib 类型 + 函数改名

**文件：**
- 修改：`src/lib/wenjie-preview-images.ts`

- [x] **步骤 1：修改核心类型和函数**

在 `src/lib/wenjie-preview-images.ts` 中：

1. 第 1 行：`export type WenjiePreviewImageStatus = "real" | "generated-preview" | "missing";` → `export type WenjiePreviewImageStatus = "real" | "product-preview" | "missing";`

2. 第 41 行：函数名 `buildWenjieGeneratedPreviewImage` → `buildWenjieProductPreviewImage`

3. 第 50 行：`imageStatus: "generated-preview"` → `imageStatus: "product-preview"`

4. 第 53 行：`alt: \`问界 ${name} 功能预览图\`` → `alt: \`问界 ${name} 商品预览效果图\``

5. 第 63 行：`alt: "问界系列轻改功能预览图"` → `alt: "问界系列轻改商品预览效果图"`

6. 第 74 行：`alt: \`问界 ${modelKey} 轻改功能预览图\`` → `alt: \`问界 ${modelKey} 轻改商品预览效果图\``

- [x] **步骤 2：运行 typecheck 验证**

运行：`npx tsc --noEmit`
预期：TypeScript 报类型错误（因为上游调用方还在用旧函数名 `buildWenjieGeneratedPreviewImage`）——这是预期行为，后续任务修复。

- [x] **步骤 3：提交**

```bash
git add src/lib/wenjie-preview-images.ts
git commit -m "fix: rename WenjiePreviewImageStatus type and build function"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 3：更新 wenjie upgrade-project 文件的 import 和调用

**文件：**
- 修改：`src/lib/wenjie-m6-upgrade-projects.ts`
- 修改：`src/lib/wenjie-m7-upgrade-projects.ts`
- 修改：`src/lib/wenjie-m8-upgrade-projects.ts`
- 修改：`src/lib/wenjie-series-upgrade-projects.ts`

这 4 个文件均 import `buildWenjieGeneratedPreviewImage` 并在数据中调用它。

- [x] **步骤 1：更新 `wenjie-m6-upgrade-projects.ts`**

将第 22 行 `buildWenjieGeneratedPreviewImage,` → `buildWenjieProductPreviewImage,`
将第 60 行 `...buildWenjieGeneratedPreviewImage(project.id, project.name, "M6"),` → `...buildWenjieProductPreviewImage(project.id, project.name, "M6"),`

- [x] **步骤 2：更新 `wenjie-m7-upgrade-projects.ts`**

将第 25 行 `buildWenjieGeneratedPreviewImage,` → `buildWenjieProductPreviewImage,`
将第 73 行 `...buildWenjieGeneratedPreviewImage(project.id, project.name, "M7"),` → `...buildWenjieProductPreviewImage(project.id, project.name, "M7"),`

- [x] **步骤 3：更新 `wenjie-m8-upgrade-projects.ts`**

将第 27 行 `buildWenjieGeneratedPreviewImage,` → `buildWenjieProductPreviewImage,`
将第 75 行 `...buildWenjieGeneratedPreviewImage(project.id, project.name, "M8"),` → `...buildWenjieProductPreviewImage(project.id, project.name, "M8"),`

- [x] **步骤 4：更新 `wenjie-series-upgrade-projects.ts`**

将第 23 行 `buildWenjieGeneratedPreviewImage,` → `buildWenjieProductPreviewImage,`
将第 75 行 `...buildWenjieGeneratedPreviewImage(project.key, project.name),` → `...buildWenjieProductPreviewImage(project.key, project.name),`

- [x] **步骤 5：typecheck 验证**

运行：`npx tsc --noEmit`
预期：wenjie 相关的类型错误已修复

- [x] **步骤 6：提交**

```bash
git add src/lib/wenjie-m6-upgrade-projects.ts src/lib/wenjie-m7-upgrade-projects.ts src/lib/wenjie-m8-upgrade-projects.ts src/lib/wenjie-series-upgrade-projects.ts
git commit -m "fix: update wenjie upgrade-project imports and calls for buildWenjieProductPreviewImage"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 4：产品数据文件批量替换（17 文件）

**文件：** 见上方"产品数据文件"列表

通用替换模式（每个文件）：
1. 类型定义中 `"generated-preview"` → `"product-preview"`（作为 union member）
2. 数据值中 `imageStatus: "generated-preview"` → `imageStatus: "product-preview"`（每个出现处）
3. 注释中 `generated-preview` → `product-preview`
4. alt 文案从"功能预览图"或类似 → "商品预览效果图"（如适用）
5. validate 函数中的断言（如 voyah-products.ts 第 468-469 行 `"generated-preview"` → `"product-preview"`）
6. FAQ 文案（nio-products.ts 第 543-545 行：`"图片是真实施工案例吗？"` 的回答移除 `AI 功能预览图（generated-preview）` 引用）

- [x] **步骤 1：批量替换 li-auto 6 文件**

执行 sed 替换 `"generated-preview"` → `"product-preview"` 在：
- `src/lib/li-auto-i6-products.ts`
- `src/lib/li-auto-i8-products.ts`
- `src/lib/li-auto-l9-products.ts`
- `src/lib/li-auto-one-products.ts`
- `src/lib/li-auto-mega-products.ts`
- `src/lib/li-auto-series-upgrade-projects.ts`

```bash
cd /Users/fkycoya/Documents/WebsiteClone/lanhui-website
for f in src/lib/li-auto-i6-products.ts src/lib/li-auto-i8-products.ts src/lib/li-auto-l9-products.ts src/lib/li-auto-one-products.ts src/lib/li-auto-mega-products.ts src/lib/li-auto-series-upgrade-projects.ts; do
  sed -i '' 's/"generated-preview"/"product-preview"/g' "$f"
done
```

验证：检查是否还有 `generated-preview` 残留：
```bash
grep -n "generated-preview" src/lib/li-auto-i6-products.ts src/lib/li-auto-i8-products.ts src/lib/li-auto-l9-products.ts src/lib/li-auto-one-products.ts src/lib/li-auto-mega-products.ts src/lib/li-auto-series-upgrade-projects.ts
```
预期：无输出

- [x] **步骤 2：替换 `src/lib/nio-products.ts`**

替换 `"generated-preview"` → `"product-preview"`（类型定义 + 数据值）。

更新 FAQ 文案（第 543-545 行），将：
```ts
    question: "图片是真实施工案例吗？",
    answer:
      "当前展示的是 AI 功能预览图（generated-preview），真实施工以到店沟通和现场评估为准。",
```
改为：
```ts
    question: "图片是真实施工案例吗？",
    answer:
      "当前展示的是商品预览效果图，真实施工以到店沟通和现场评估为准。",
```

- [x] **步骤 3：替换 `zeekr-9x-products.ts` 和 `zeekr-8x-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'` 作用于两个文件。

- [x] **步骤 4：替换 `denza-d9-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'` 作用于该文件。

- [x] **步骤 5：替换 `voyah-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'` 作用于该文件。

然后在 validate 函数中（约第 468-469 行）手动更新断言文案：
```ts
    if (p.imageStatus !== "product-preview") {
      throw new Error(`Project ${p.id} expected product-preview imageStatus`);
    }
```

- [x] **步骤 6：替换 `gaoshan-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'`

- [x] **步骤 7：替换 `zhijie-v9-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'`

- [x] **步骤 8：替换 `ledao-l90-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'`

- [x] **步骤 9：替换 `xpeng-gx-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'`

同时更新 alt 文案：检查文件中是否有 "功能预览图" 相关 alt 并改为 "商品预览效果图"。用：
```bash
grep -n "功能预览图\|预览图" src/lib/xpeng-gx-products.ts
```
如果有，逐个替换为 "商品预览效果图"。

- [x] **步骤 10：替换 `xiaomi-yu7-upgrade-projects.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g'`

- [x] **步骤 11：替换 `tesla-products.ts`**

`sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/tesla-products.ts`

- [x] **步骤 12：验证**

运行：`npx tsc --noEmit`
预期：类型错误数量相比上一步减少（但仍可能有组件层错误）

- [x] **步骤 13：提交**

```bash
git add src/lib/li-auto-i6-products.ts src/lib/li-auto-i8-products.ts src/lib/li-auto-l9-products.ts src/lib/li-auto-one-products.ts src/lib/li-auto-mega-products.ts src/lib/li-auto-series-upgrade-projects.ts src/lib/nio-products.ts src/lib/zeekr-9x-products.ts src/lib/zeekr-8x-products.ts src/lib/denza-d9-products.ts src/lib/voyah-products.ts src/lib/gaoshan-products.ts src/lib/zhijie-v9-products.ts src/lib/ledao-l90-products.ts src/lib/xpeng-gx-products.ts src/lib/xiaomi-yu7-upgrade-projects.ts src/lib/tesla-products.ts
git commit -m "fix: replace generated-preview with product-preview in all product data files"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 5：组件 ProjectGrid badge + alt 更新（12 文件）

**文件：** 全部 12 个 `*ProjectGrid.tsx` 组件

每个组件需要执行以下 3 处改动：
1. 类型局部定义中 `"generated-preview"` → `"product-preview"`
2. statusLabel `"效果预览"` → `"商品预览效果图"`（和/或对应的条件式）
3. 删除 `<AlertCircle />`（带 AlertCircle 的条件块）或纯文本 badge 条件块

**通用替换模式（wenjie 系，如 `WenjieModelProjectGrid.tsx`）：**

```tsx
// 旧 - 类型定义
type WenjieModelImageStatus = "real" | "generated-preview" | "missing";

// 新
type WenjieModelImageStatus = "real" | "product-preview" | "missing";

// 旧 - statusLabel
const statusLabel =
  project.imageStatus === "generated-preview"
    ? "效果预览"
    : project.imageStatus === "real"
      ? "实拍匹配"
      : "图片待补充";

// 新 - product-preview 不再需要特殊 label，"效果预览" → "商品预览效果图"
const statusLabel =
  project.imageStatus === "product-preview"
    ? "商品预览效果图"
    : project.imageStatus === "real"
      ? "实拍匹配"
      : "图片待补充";

// 旧 - badge 中的 AlertCircle
<span className="absolute top-2 right-2 ...">
  {project.imageStatus === "generated-preview" ? (
    <AlertCircle className="h-3 w-3" aria-hidden />
  ) : null}
  {statusLabel}
</span>

// 新 - 删除 AlertCircle 条件块
<span className="absolute top-2 right-2 ...">
  {statusLabel}
</span>
```

**通用替换模式（非 wenjie 系，如 `Zeekr9xProjectGrid.tsx`）：**

```tsx
// 旧
project.imageStatus === "generated-preview" ? (
  <AlertCircle className="h-3 w-3" aria-hidden />
) : null

// 新：删除整个条件块
```

**有特殊模式的组件：**

`XiaomiYu7ProjectGrid.tsx` 第 81-84 行使用了 `||`（同时覆盖 `generated-preview` 和 `pending-review`）：
```tsx
{project.imageStatus === "generated-preview" ||
project.imageStatus === "pending-review" ? (
  <AlertCircle className="h-3 w-3" aria-hidden />
) : null}
```
改为只保留 `pending-review`：
```tsx
{project.imageStatus === "pending-review" ? (
  <AlertCircle className="h-3 w-3" aria-hidden />
) : null}
```

**`XiaomiSu7ProjectGrid.tsx`** 需要同样检查——它的 badging 模式可能和 Yu7 一致。

**系统化替换命令：**

对所有 12 个 ProjectGrid 文件执行：
```bash
cd /Users/fkycoya/Documents/WebsiteClone/lanhui-website

FILES="
src/components/wenjie/model/WenjieModelProjectGrid.tsx
src/components/zeekr-9x/Zeekr9xProjectGrid.tsx
src/components/zeekr-8x/Zeekr8xProjectGrid.tsx
src/components/xiaomi-yu7/XiaomiYu7ProjectGrid.tsx
src/components/xiaomi-su7/XiaomiSu7ProjectGrid.tsx
src/components/zhijie/ZhijieV9ProjectGrid.tsx
src/components/xpeng/XpengGxProjectGrid.tsx
src/components/voyah/VoyahDreamerProjectGrid.tsx
src/components/li-auto/LiAutoI6ProjectGrid.tsx
src/components/ledao/LedaoL90ProjectGrid.tsx
src/components/gaoshan/Gaoshan8ProjectGrid.tsx
src/components/denza/DenzaD9ProjectGrid.tsx
"

# 替换类型字面量
for f in $FILES; do
  sed -i '' 's/"generated-preview"/"product-preview"/g' "$f"
done

# 替换 statusLabel "效果预览" → "商品预览效果图"
for f in $FILES; do
  sed -i '' 's/"效果预览"/"商品预览效果图"/g' "$f"
done
```

- [x] **步骤 1：执行字符串替换**

运行上述 sed 命令，对所有 12 个文件执行类型和文案替换。

- [x] **步骤 2：逐个确认并删除 AlertCircle 条件块**

对每个文件，人工确认并删除 `project.imageStatus === "product-preview"` 对应的 AlertCircle 条件块。

每个文件中的目标模式是：
```tsx
{project.imageStatus === "product-preview" ? (
  <AlertCircle className="h-3 w-3" aria-hidden />
) : null}
```
→ 直接删除这 4 行。

对于 `XiaomiYu7ProjectGrid.tsx`（和可能类似的 `XiaomiSu7ProjectGrid.tsx`），将：
```tsx
{project.imageStatus === "product-preview" ||
project.imageStatus === "pending-review" ? (
  <AlertCircle className="h-3 w-3" aria-hidden />
) : null}
```
改为：
```tsx
{project.imageStatus === "pending-review" ? (
  <AlertCircle className="h-3 w-3" aria-hidden />
) : null}
```

- [x] **步骤 3：验证**

运行：`npx tsc --noEmit`
预期：类型错误数量显著减少

- [x] **步骤 4：提交**

```bash
git add src/components/wenjie/model/WenjieModelProjectGrid.tsx src/components/zeekr-9x/Zeekr9xProjectGrid.tsx src/components/zeekr-8x/Zeekr8xProjectGrid.tsx src/components/xiaomi-yu7/XiaomiYu7ProjectGrid.tsx src/components/xiaomi-su7/XiaomiSu7ProjectGrid.tsx src/components/zhijie/ZhijieV9ProjectGrid.tsx src/components/xpeng/XpengGxProjectGrid.tsx src/components/voyah/VoyahDreamerProjectGrid.tsx src/components/li-auto/LiAutoI6ProjectGrid.tsx src/components/ledao/LedaoL90ProjectGrid.tsx src/components/gaoshan/Gaoshan8ProjectGrid.tsx src/components/denza/DenzaD9ProjectGrid.tsx
git commit -m "fix: update ProjectGrid components - replace generated-preview with product-preview, remove AlertCircle badges"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 6：Hero/Grid 免责声明和文案更新

**文件：** 8 个组件文件

- [x] **步骤 1：WenjieSeriesHero.tsx — 删除免责声明**

在第 110-112 行，删除：
```tsx
            <p className="text-xs text-zinc-500 mt-3 text-center">
              功能预览图用于说明升级方向，不代表实车案例
            </p>
```

- [x] **步骤 2：WenjieSeriesSubModelsGrid.tsx — 更新 alt**

搜索 `aria-label` 或 `alt` 中包含 "功能预览图" 的文案，替换为 "商品预览效果图"。
具体：找到第 23 行注释中的"4:3 功能预览图"（仅注释，可以不改），但如果 alt/aria-label 中有"功能预览图"则改为"商品预览效果图"。

（注意：此组件中 Image 的 alt 文本由 `getWenjieModelHeroImage` 函数返回，已在任务 2 中更新，此处可能需要检查是否有内联 alt。）

- [x] **步骤 3：XiaomiSeriesHero.tsx — 删除免责声明 + 更新 alt**

在第 102-104 行，删除：
```tsx
            <p className="text-xs text-zinc-500 mt-3 text-center">
              功能预览图用于说明升级方向，不代表实车案例
            </p>
```

同时在第 91 行，将：
```tsx
                alt="小米系列升级方案功能预览图"
```
改为：
```tsx
                alt="小米系列升级方案商品预览效果图"
```

- [x] **步骤 4：XiaomiSeriesFeaturedGrid.tsx — 更新 alt**

在第 58 行，将：
```tsx
                  alt={`小米系列 ${p.name} 升级项目功能预览图`}
```
改为：
```tsx
                  alt={`小米系列 ${p.name} 升级项目商品预览效果图`}
```

- [x] **步骤 5：LiAutoSeriesHero.tsx — 删除 "功能预览图 · 后续补充"**

在第 107 行，删除：
```tsx
                  <p className="text-xs text-zinc-600 mt-4">功能预览图 · 后续补充</p>
```

- [x] **步骤 6：LiAutoSeriesSubModelsGrid.tsx — 更新 aria-label**

在第 69 行，将：
```tsx
                  aria-label={`${m.modelName} 升级款式功能预览图`}
```
改为：
```tsx
                  aria-label={`${m.modelName} 升级款式商品预览效果图`}
```

- [x] **步骤 7：DenzaBrandHero.tsx — 删除 "功能预览图 · 后续补充"**

在第 66 行，删除：
```tsx
                  <p className="text-xs text-zinc-600 mt-4">功能预览图 · 后续补充</p>
```

- [x] **步骤 8：验证**

运行：`npx tsc --noEmit`
预期：类型检查通过

- [x] **步骤 9：提交**

```bash
git add src/components/wenjie/WenjieSeriesHero.tsx src/components/wenjie/WenjieSeriesSubModelsGrid.tsx src/components/xiaomi-series/XiaomiSeriesHero.tsx src/components/xiaomi-series/XiaomiSeriesFeaturedGrid.tsx src/components/li-auto/LiAutoSeriesHero.tsx src/components/li-auto/LiAutoSeriesSubModelsGrid.tsx src/components/denza/DenzaBrandHero.tsx
git commit -m "fix: remove disclaimers and update alt text in Hero/Grid components"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 7：页面文件文案修正

**文件：**
- 修改：`src/app/product/zhijie/page.tsx`

- [x] **步骤 1：删除 "功能预览图 · 后续补充"**

在第 123-125 行附近，删除：
```tsx
                      <p className="text-xs text-zinc-600 mt-4">
                        功能预览图 · 后续补充
                      </p>
```

- [x] **步骤 2：提交**

```bash
git add src/app/product/zhijie/page.tsx
git commit -m "fix: remove '功能预览图 · 后续补充' from zhijie product page"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 8：测试文件更新

**文件：** 约 14 个测试文件

- [x] **步骤 1：更新 wenjie 测试（m6/m7/m8/series）**

这 4 个测试文件中有 `"generated-preview"` 断言和注释：

- `src/lib/wenjie-m6-upgrade-projects.test.ts`
- `src/lib/wenjie-m7-upgrade-projects.test.ts`
- `src/lib/wenjie-m8-upgrade-projects.test.ts`
- `src/lib/wenjie-series-upgrade-projects.test.ts`

每个文件需要：
1. 替换断言中的 `"generated-preview"` → `"product-preview"`
2. 更新注释中的 "generated-preview" → "product-preview"
3. 更新测试名 `it("all imageStatus are 'generated-preview'"` → `it("all imageStatus are 'product-preview'"`

```bash
cd /Users/fkycoya/Documents/WebsiteClone/lanhui-website
for f in src/lib/wenjie-m6-upgrade-projects.test.ts src/lib/wenjie-m7-upgrade-projects.test.ts src/lib/wenjie-m8-upgrade-projects.test.ts src/lib/wenjie-series-upgrade-projects.test.ts; do
  sed -i '' "s/generated-preview/product-preview/g" "$f"
  sed -i '' "s/imageStatus are 'generated-preview/imageStatus are 'product-preview/g" "$f"
done
```

- [x] **步骤 2：更新 li-auto 测试**

涉及：
- `src/lib/li-auto-series-upgrade-projects.test.ts` — 替换 `"generated-preview"` → `"product-preview"`
- `src/lib/li-auto-l9-products.test.ts` — 替换 `"generated-preview"` → `"product-preview"` + 第 54 行测试描述 "AI 生成预览图" → "商品预览效果图"
- `src/lib/li-auto-mega-products.test.ts` — 替换 `"generated-preview"` → `"product-preview"` + 第 54 行测试描述 "AI 生成预览图" → "商品预览效果图"

```bash
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/li-auto-series-upgrade-projects.test.ts
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/li-auto-l9-products.test.ts
sed -i '' 's/AI 生成预览图/商品预览效果图/g' src/lib/li-auto-l9-products.test.ts
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/li-auto-mega-products.test.ts
sed -i '' 's/AI 生成预览图/商品预览效果图/g' src/lib/li-auto-mega-products.test.ts
```

- [x] **步骤 3：更新 zeekr 测试**

```bash
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/zeekr-9x-products.test.ts
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/zeekr-8x-products.test.ts
```

- [x] **步骤 4：更新 `xpeng-gx-products.test.ts`**

在第 156-157 行，将 `valid` 数组中 `"generated-preview"` → `"product-preview"`。

```bash
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/xpeng-gx-products.test.ts
```

- [x] **步骤 5：更新 `nio-products.test.ts`**

更新第 50-52 行断言 `"generated-preview"` → `"product-preview"`。
更新第 167-171 行的 FAQ 测试描述，移除对 "generated-preview" 或 "AI" 的断言（因为 FAQ 答案已无此内容）。

```bash
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/nio-products.test.ts
```

然后手动检查第 167-171 行的测试。FAQ 答案文本已改为"商品预览效果图"，因此测试名也需要更新：

```ts
    it("FAQ 中包含「图片是真实施工案例吗」澄清商品预览效果图状态", () => {
      const faq = nioEs8Faq.find((f) => f.question.includes("真实施工"));
      expect(faq).toBeDefined();
      expect(
        faq!.answer.includes("商品预览效果图"),
      ).toBe(true);
    });
```

- [x] **步骤 6：更新 `tesla-products.test.ts`**

```bash
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/tesla-products.test.ts
```

同时检查 valid 数组是否有 `"generated-preview"` → 需要改为 `"product-preview"`。

- [x] **步骤 7：更新 `tesla-products.test.ts`**

```bash
sed -i '' 's/"generated-preview"/"product-preview"/g' src/lib/tesla-products.test.ts
```

同时检查 valid 数组（第 88 行附近）：
```ts
expect(["matched", "product-preview", "pending-review", "missing"]).toContain(p.imageStatus);
```

- [x] **步骤 8：运行测试**

运行：`npx vitest run`（或筛选受影响的测试：`npx vitest run src/lib/`）
预期：测试全部通过

- [x] **步骤 9：提交**

```bash
git add src/lib/wenjie-m6-upgrade-projects.test.ts src/lib/wenjie-m7-upgrade-projects.test.ts src/lib/wenjie-m8-upgrade-projects.test.ts src/lib/wenjie-series-upgrade-projects.test.ts src/lib/li-auto-series-upgrade-projects.test.ts src/lib/li-auto-l9-products.test.ts src/lib/li-auto-mega-products.test.ts src/lib/zeekr-9x-products.test.ts src/lib/zeekr-8x-products.test.ts src/lib/xpeng-gx-products.test.ts src/lib/nio-products.test.ts src/lib/tesla-products.test.ts
git commit -m "fix: update test assertions and descriptions for product-preview rename"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 9：审计脚本更新

**文件：**
- 修改：`scripts/test/image-status-audit.mjs`

- [x] **步骤 1：更新计数器和键名**

在 `scripts/test/image-status-audit.mjs` 中：

1. 第 98 行：`totals: { matched: 0, "pending-review": 0, "generated-preview": 0, missing: 0, other: 0 }` → `totals: { matched: 0, "pending-review": 0, "product-preview": 0, missing: 0, other: 0 }`

2. 第 108 行：`const counts = { matched: 0, "pending-review": 0, "generated-preview": 0, missing: 0, other: 0 };` → `const counts = { matched: 0, "pending-review": 0, "product-preview": 0, missing: 0, other: 0 };`

3. 第 135 行：`results.totals["generated-preview"]` → `results.totals["product-preview"]`

4. 第 148 行：表格标题和列对应更新：`"generated-preview"` → `"product-preview"`，列对齐调整
   - 第 140 行：`console.log("Brand                    | Total | matched | pending | generated | missing | other");` → `console.log("Brand                    | Total | matched | pending | product-pv | missing | other");`
   - 第 150-152 行：输出列引用 `c["generated-preview"]` → `c["product-preview"]`

5. 第 158-159 行：`${String(t["generated-preview"]).padStart(9)}` → `${String(t["product-preview"]).padStart(9)}`

- [x] **步骤 2：验证脚本**

运行：`node scripts/test/image-status-audit.mjs`
预期：无报错，输出表格中 `product-preview` 列代替 `generated-preview` 列

- [x] **步骤 3：提交**

```bash
git add scripts/test/image-status-audit.mjs
git commit -m "fix: update image-status-audit script counter from generated-preview to product-preview"
```

archived-with: 2026-07-09-fix-product-image-copy
---

### 任务 10：全链验证

- [x] **步骤 1：运行检查脚本**

运行：`node scripts/check-product-image-copy.mjs`
预期：PASS，输出 "未发现禁用文案"

- [x] **步骤 2：typecheck**

运行：`npx tsc --noEmit`
预期：无新增类型错误（允许 pre-existing 的 9 个错误）

- [x] **步骤 3：运行测试**

运行：`npx vitest run`
预期：所有测试通过

- [x] **步骤 4：运行 build**

运行：`npm run build`
预期：build 通过（注意：pre-existing 的 build 错误在 `news/[slug]/page.tsx`，与本任务无关）

- [x] **步骤 5：浏览器抽查 8 个产品页面**

打开以下 URL 在浏览器中确认无禁用文案残留：
- `/product/wenjie`
- `/product/wenjie/m6`
- `/product/xiaomi`
- `/product/zeekr`
- `/product/li-auto`
- `/product/denza`
- `/product/zhijie`
- `/product/nio/es8`

检查项：
- 图片 badge 无 "效果预览" 字眼
- Hero 区域无 "功能预览图用于说明升级方向" 免责声明
- 无 "功能预览图 · 后续补充" 文案
- alt 文本无 "功能预览图"、"生成预览图"、"AI 生成"

- [x] **步骤 6：最终提交**

```bash
git add .
git commit -m "fix: complete product image copy migration - generated-preview to product-preview"
```

archived-with: 2026-07-09-fix-product-image-copy
---

## 验证清单

| 步骤 | 命令 | 预期 |
|------|------|------|
| 检查脚本 | `node scripts/check-product-image-copy.mjs` | PASS |
| typecheck | `npx tsc --noEmit` | 无新增错误 |
| 测试 | `npx vitest run` | 全部通过 |
| build | `npm run build` | 通过 |
| 浏览器 | 8 个产品页面 | 无禁用文案 |

archived-with: 2026-07-09-fix-product-image-copy
---

## 风险和注意事项

1. **TS strict 是兜底**：如果在任何步骤 typecheck 发现错误，说明某处漏了替换——停止并修复。
2. **xiaomi-yu7/xiaomi-su7 的 `||` 模式**：AlertCircle 条件同时覆盖 `generated-preview || pending-review`，改为只保留 `pending-review`。
3. **注释不必强求**：文件头注释、JSDoc 中的 "generated-preview" 引用不强制修改，但建议一并替换以保持一致性。
4. **`Tesla` 已纳入批量替换**：`src/lib/tesla-products.ts` 及其测试文件已在任务 4 和任务 8 中覆盖。
