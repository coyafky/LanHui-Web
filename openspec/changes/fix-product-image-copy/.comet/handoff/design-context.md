# Comet Design Handoff

- Change: fix-product-image-copy
- Phase: design
- Mode: compact
- Context hash: 699c117b24f2b0f2ed326c3416f7196e26eebab45eaccc05382be7dd6e24b414

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-product-image-copy/proposal.md

- Source: openspec/changes/fix-product-image-copy/proposal.md
- Lines: 1-36
- SHA256: cdb6cf781444201920ccd05ad0489b9d9ccdef8f7153ab661401c6cca88b4ae5

```md
# 修复 M1 Product 图片标注：generated-preview → product-preview

## Why

当前产品图数据使用 `imageStatus: "generated-preview"`，前台文案显示"功能预览图""生成预览图""AI 生成"，让用户感觉图片不正式、不可信，削弱宣传效果。产品决策明确：网站是宣传展示用途，这些图片应作为正式的商品预览效果图展示，需统一修正状态字段和文案。

## What Changes

- **BREAKING**: `imageStatus` 枚举值 `"generated-preview"` 全局重命名为 `"product-preview"`（类型定义 + 所有数据文件 + 组件判断 + 测试 + 脚本）
- 函数 `buildWenjieGeneratedPreviewImage` 重命名为 `buildWenjieProductPreviewImage`，同步更新所有 import
- 图片 alt 文案 "功能预览图" → "商品预览效果图"（src/lib + src/components）
- `product-preview` 状态图片不再显示 badge（删除 AlertCircle 图标 + "效果预览" 文案）
- Hero 组件中的 "功能预览图用于说明升级方向，不代表实车案例" 免责声明删除
- Hero 中的 "功能预览图 · 后续补充" 文案删除
- 新增 `scripts/check-product-image-copy.mjs` 检查脚本，禁止 `generated-preview`/`功能预览图`/`生成预览图`/`AI 生成` 在 src/ 中再次出现
- 更新 `scripts/test/image-status-audit.mjs` 中的 `"generated-preview"` 计数器
- `package.json` 新增 `check:product-image-copy` 命令，接入 `npm run check`

## Capabilities

### New Capabilities

无 —— 本次为纯文案/命名修正，不引入新 capability。

### Modified Capabilities

无 —— 无 spec 级行为变更，仅实现层面的字段和文案替换。

## Impact

- `src/lib/` — ~14 个产品数据文件（类型定义 + 数据 + 辅助函数）
- `src/components/` — ~22 个 ProjectGrid/Hero/FeaturedGrid 组件
- `src/lib/` — ~8 个测试文件（断言同步更新）
- `scripts/test/image-status-audit.mjs` — 计数器更新
- `scripts/check-product-image-copy.mjs` — 新增
- `package.json` — 新增 check 子命令
```

## openspec/changes/fix-product-image-copy/design.md

- Source: openspec/changes/fix-product-image-copy/design.md
- Lines: 1-93
- SHA256: 6916cc790a0c856c0e987fd21de3c54105c639ac4b94077617ed906d51a94cc5

[TRUNCATED]

```md
# Design: fix-product-image-copy

## Context

当前产品图系统使用 `imageStatus: "generated-preview"` 标识 AI 生成的预览图。前台组件根据此状态显示 "效果预览" badge（带 AlertCircle 图标）和 "功能预览图" 免责声明。产品决策：网站是宣传展示用途，这些图片应作为正式商品预览效果图展示，不应标注为 AI 生成/预览。

### 当前架构

```
src/lib/*-products.ts (类型 + 数据)
    │  imageStatus: "generated-preview"
    │  alt: "XX 功能预览图"
    ▼
src/lib/wenjie-preview-images.ts (辅助函数)
    │  buildWenjieGeneratedPreviewImage()
    │  返回 imageStatus + alt
    ▼
src/components/**/ProjectGrid.tsx (渲染层)
    │  imageStatus === "generated-preview" → badge 显示
    │  alt 直接传递给 Image 组件
    ▼
src/components/**/Hero.tsx (Hero 层)
    │  免责声明文案
```

### 影响矩阵

| 层 | 文件数 | 改动类型 | 风险 |
|----|--------|---------|------|
| 类型+辅助函数 | 2 | 重命名枚举值+函数 | 低 — TS strict 兜底 |
| 产品数据文件 | ~15 | 批量替换 imageStatus + alt | 低 — 字面量替换 |
| 组件 ProjectGrid | ~15 | 删除 badge 代码块 | 低 — UI 纯删减 |
| 组件 Hero/FeaturedGrid | ~7 | 删除免责声明 + alt 修正 | 低 |
| 测试文件 | ~8 | 断言同步 | 低 |
| 脚本 | 1 更新 + 1 新建 | 计数器更新 + 新增 | 低 |

## Goals / Non-Goals

**Goals:**
- `"generated-preview"` 在 `src/` 中 0 出现
- "功能预览图"/"生成预览图"/"AI 生成" 在 `src/` 中 0 出现
- `product-preview` 状态图片不显示 badge
- alt 统一为 "商品预览效果图"
- 新增检查脚本防止回归

**Non-Goals:**
- 不改图片路径 (`/generated/` 保留)
- 不移动/删除图片资产
- 不修改 docs/ 和 openspec/changes/ 下的历史文件
- 不引入新依赖

## Decisions

### 1. 新枚举值选择: `product-preview`

- **选择**: `"product-preview"`
- **备选**: `"preview"`, `"generated"`, `"ai-generated"`
- **理由**: `product-preview` 明确表达"产品预览"语义，区别于 "generated" 暗示 AI 生成，也比单纯 "preview" 更有业务含义

### 2. Badge 策略: 完全移除 product-preview 的 badge

- **选择**: 删除所有 `imageStatus === "product-preview"` 条件下的 badge 渲染代码
- **理由**: 用户确认 badge 反而降低信任度；alt 文案已足够传达信息
- **影响**: WYSIWYG — 删除条件分支和 `<span>` 元素，图片区域更干净

### 3. 每种产品类型独立 ImageStatus 类型，不合并

- **选择**: 保持各产品文件独立的 `ImageStatus` 类型定义
- **理由**: 各产品有独立演进需求，合并需要改动 imports（超出范围）
- **实际做法**: 每个产品文件内的类型字面量从 `"generated-preview"` 改为 `"product-preview"`

### 4. 图片路径 `/generated/` 目录名保持不变

- **选择**: 不修改文件系统路径
- **理由**: 目录名是内部资产组织方式，不影响前台用户体验；改路径需要迁移文件 → 风险高且超出范围

### 5. 检查脚本用拼接字符串规避自检误报

- **选择**: `scripts/check-product-image-copy.mjs` 中用 `"generated" + "-preview"` 构建 forbidden 列表
- **理由**: 脚本自身的 forbidden list 不应被自己扫描到
```

Full source: openspec/changes/fix-product-image-copy/design.md

## openspec/changes/fix-product-image-copy/tasks.md

- Source: openspec/changes/fix-product-image-copy/tasks.md
- Lines: 1-55
- SHA256: 2bcee96f00b231cac882e1e1369868e82a63005c4ca549885aee473d6d169548

```md
# Tasks: fix-product-image-copy

## 1. 新增检查脚本

- [ ] 1.1 创建 `scripts/check-product-image-copy.mjs`，扫描 `src/lib` `src/components` `src/app/product` `scripts` 目录，禁止 `generated-preview` `功能预览图` `生成预览图` `AI 生成`（用拼接字符串规避自检误报）
- [ ] 1.2 `package.json` 新增 `check:product-image-copy` 命令，接入 `npm run check` 链（放在 build 之前）

## 2. 核心 lib 改动

- [ ] 2.1 `src/lib/wenjie-preview-images.ts`：类型 `"generated-preview"` → `"product-preview"`，函数 `buildWenjieGeneratedPreviewImage` → `buildWenjieProductPreviewImage`，alt "功能预览图" → "商品预览效果图"
- [ ] 2.2 同步更新 4 个 wenjie upgrade-project 文件的 import 和调用（m6/m7/m8/series）

## 3. 产品数据文件 — 类型 + 数据批量替换

- [ ] 3.1 `src/lib/li-auto-*-products.ts`（i6/i8/l9/one/mega）— imageStatus 类型 + 数据值替换
- [ ] 3.2 `src/lib/li-auto-series-upgrade-projects.ts` — imageStatus 类型 + 数据值替换
- [ ] 3.3 `src/lib/nio-products.ts` — imageStatus 类型 + 数据值替换 + disclaimer 文案更新
- [ ] 3.4 `src/lib/zeekr-9x-products.ts` — imageStatus 类型 + 数据值替换
- [ ] 3.5 `src/lib/zeekr-8x-products.ts` — imageStatus 类型 + 数据值替换
- [ ] 3.6 `src/lib/denza-d9-products.ts` — imageStatus 类型 + 数据值替换
- [ ] 3.7 `src/lib/voyah-products.ts` — imageStatus 类型 + 数据值替换 + validate 函数更新
- [ ] 3.8 `src/lib/gaoshan-products.ts` — imageStatus 类型 + 数据值替换
- [ ] 3.9 `src/lib/zhijie-v9-products.ts` — imageStatus 类型 + 数据值替换
- [ ] 3.10 `src/lib/ledao-l90-products.ts` — imageStatus 类型 + 数据值替换
- [ ] 3.11 `src/lib/xpeng-gx-products.ts` — imageStatus 类型 + 数据值替换 + alt 文案更新
- [ ] 3.12 `src/lib/xiaomi-yu7-upgrade-projects.ts` — imageStatus 类型 + 数据值替换

## 4. 组件 — imageStatus 判断 + alt 文案更新

- [ ] 4.1 `src/components/wenjie/model/WenjieModelProjectGrid.tsx` — 类型 "generated-preview" → "product-preview"，删除 badge，statusLabel 更新
- [ ] 4.2 `src/components/wenjie/WenjieSeriesHero.tsx` — 删除免责声明 "功能预览图用于说明升级方向，不代表实车案例"
- [ ] 4.3 `src/components/wenjie/WenjieSeriesSubModelsGrid.tsx` — alt "升级款式功能预览图" → "升级款式商品预览效果图"
- [ ] 4.4 `src/components/xiaomi-series/XiaomiSeriesHero.tsx` — 删除免责声明 + alt "功能预览图" → "商品预览效果图"
- [ ] 4.5 `src/components/xiaomi-series/XiaomiSeriesFeaturedGrid.tsx` — alt "升级项目功能预览图" → "升级项目商品预览效果图"
- [ ] 4.6 `src/components/denza/DenzaBrandHero.tsx` — 删除 "功能预览图 · 后续补充"
- [ ] 4.7 `src/components/li-auto/LiAutoSeriesHero.tsx` — 删除 "功能预览图 · 后续补充"
- [ ] 4.8 `src/components/li-auto/LiAutoSeriesSubModelsGrid.tsx` — aria-label "升级款式功能预览图" → "升级款式商品预览效果图"
- [ ] 4.9 批量更新所有 ProjectGrid 组件（~14 个）— `"generated-preview"` → `"product-preview"` + 删除 product-preview badge + alt 文案修正

## 5. 产品页面文案修正

- [ ] 5.1 `src/app/product/zhijie/page.tsx` — "功能预览图 · 后续补充" 删除或替换

## 6. 测试文件更新

- [ ] 6.1 更新 wenjie 测试（m6/m7/m8/series）— 断言 `"generated-preview"` → `"product-preview"`
- [ ] 6.2 更新 li-auto 测试 — 断言 + 测试描述 "AI 生成预览图" → "商品预览效果图"
- [ ] 6.3 更新 `scripts/test/image-status-audit.mjs` — 计数器 `"generated-preview"` → `"product-preview"`

## 7. 验证

- [ ] 7.1 `npm run check:product-image-copy` 通过
- [ ] 7.2 `npm run typecheck` 无新增错误
- [ ] 7.3 `npm run build` 通过
- [ ] 7.4 浏览器抽查 8 个产品页面，确认无禁用文案
```

