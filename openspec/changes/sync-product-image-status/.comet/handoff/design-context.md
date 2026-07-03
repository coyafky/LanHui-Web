# Comet Design Handoff

- Change: sync-product-image-status
- Phase: design
- Mode: compact
- Context hash: e43387db2b43b722ca527183966213df1f747b26cd1aabc147e5aaea490a85de

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/sync-product-image-status/proposal.md

- Source: openspec/changes/sync-product-image-status/proposal.md
- Lines: 1-26
- SHA256: 4f5059a49c5a13b4bc4d95635b359d843d5ed0c6f752d8789aecfa4fdce8e8a2

```md
## Why

li-auto、tesla、xiaomi 三个品牌的产品专题页已上线，但对应的 `src/lib/*-products.ts` 中所有产品条目的 `imageStatus` 仍为 `pending-review` 或 `missing`，`publicPath` 未赋值。实际上 `public/images/products/` 下已有对应的 AI 生成预览图（li-auto 82 张、tesla 12 张）和真实施工照片（xiaomi 21 张）及映射清单（items.json/manifest.json），只是未接入产品数据。这导致所有产品卡片渲染空白占位图而非实际图片。

## What Changes

- 为 3 个品牌的产品数据文件中的每个产品条目，根据已有图片文件和映射清单，补全 `publicPath`、`width`、`height`、`aspectRatio` 字段
- 将 AI 生成图的 `imageStatus` 更新为 `generated-preview`，将 xiaomi 真实施工图的 `imageStatus` 更新为 `matched`
- 涉及 8 个产品数据文件的逐项配对更新，不修改组件、UI、路由或数据库

## Capabilities

### New Capabilities
<!-- 本次不引入新的 capability，仅修复已有产品数据与图片资产的映射 -->

### Modified Capabilities
<!-- 不修改 spec 级行为，imageStatus 枚举值 generated-preview/matched 已在类型定义中存在 -->

## Impact

| 层面 | 影响 |
|------|------|
| 数据文件 | `src/lib/li-auto-i6-products.ts`、`src/lib/li-auto-l9-products.ts`、`src/lib/li-auto-mega-products.ts`、`src/lib/li-auto-one-products.ts`、`src/lib/li-auto-series-upgrade-projects.ts`、`src/lib/tesla-products.ts`、`src/lib/xiaomi-series-upgrade-projects.ts`、`src/lib/xiaomi-yu7-upgrade-projects.ts` 共 8 个文件 |
| 运行时 | 产品卡片 `imageStatus` 从 `pending-review`/`missing` 变为 `generated-preview`/`matched`，渲染真实图片 |
| Build | SSG 不受影响，图片在 public 目录直接服务 |
| 不涉及 | 组件 UI、页面路由、API、数据库、新增图片生成 |
```

## openspec/changes/sync-product-image-status/design.md

- Source: openspec/changes/sync-product-image-status/design.md
- Lines: 1-76
- SHA256: 34d3fb9ff9a81afc8e7f59faa18c2120188750f952638f8c5c772ba24a7a2618

```md
## Context

三个品牌（li-auto、tesla、xiaomi）的产品专题页已上线，`public/images/products/` 下已有 AI 生成预览图（li-auto 82 张、tesla 12 张）和真实施工照片（xiaomi 21 张），但 `src/lib/*-products.ts` 中所有产品条目的 `imageStatus` 仍为 `pending-review` 或 `missing`，`publicPath` 未赋值。原因是图片生成后未反向同步到产品数据文件。

项目对 imageStatus 已有 4 种枚举值：`matched` | `generated-preview` | `pending-review` | `missing`。本次需要将已有图片的产品条目更新为对应状态并补全路径。

## Goals / Non-Goals

**Goals:**
- 根据已有图片文件和映射清单，为每个产品条目补全 `publicPath`、`width`、`height`、`aspectRatio`
- 将 AI 生成图的产品条目 `imageStatus` 更新为 `generated-preview`
- 将 xiaomi 真实施工图的产品条目 `imageStatus` 更新为 `matched`
- 保留现有字面量类型约束不变

**Non-Goals:**
- 不新增/删除产品条目
- 不修改 UI 组件渲染逻辑
- 不生成新图片
- 不处理无图片的 li-auto i8
- 不修改 `imageStatus` 类型定义

## Decisions

### D1: 手动逐项配对的匹配策略

**选择**: 按中文名逐项手动匹配 items.json/manifest.json 中的条目与产品 lib 中的条目。

**原因**: 各品牌的 key 命名约定差异显著，无法用统一算法自动匹配：
- li-auto 系列 items.json 用 `li-auto-paint-protection-film`，而产品 lib 用 `li-auto-series-paint-film`
- li-auto i6 items.json 用 `i6-paint-protection-film`，而产品 lib 用 `paint-protection-film`
- tesla manifest.json 用 `paint-protection-film`，而产品 lib 用 `tesla-featured-paint-ppf`
- xiaomi manifest.json 用产品中文名（如 `前包围`），而产品 lib 用数字 ID（如 `xs7-01`）

**备选方案**: 按 order 序号匹配 — 但不同数据源的产品顺序可能不一致，且 li-auto 系列 items.json 有 40 个条目而产品 lib 只有 21 个。

### D2: imageStatus 分配

- AI 生成图（li-auto 全系、tesla）→ `generated-preview`。这些图由 AI 生成作为预览，非真实施工照。
- xiaomi SU7/YU7 产品图 → `matched`。这些是来自 `ymyy-sales-agent` 的真实产品款式图，有 sha256 校验。

### D3: 图片尺寸处理

- li-auto、tesla AI 图统一使用 1448×1086、aspectRatio "4/3"（manifest 中的标准规格）
- xiaomi 真实施工图使用 manifest.json 中记录的实际尺寸（非标准 4:3），不填 aspectRatio

### D4: 无图片产品保持现状

没有匹配图片的产品条目保持原 `imageStatus`（`pending-review` 或 `missing`），不修改。这是预期行为 — 部分产品暂无图片资产。

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 中文名匹配可能出错（同名不同物） | 逐个人工核对，每个品牌完成后自查 |
| xiaomi 图片尺寸不标准 | manifest.json 已记录实际 width/height，直接使用 |
| publicPath 格式不符合类型约束 | 每个 publicPath 使用各文件定义的字面量模板类型 |

## 涉及文件

| 产品数据文件 | 图片源目录 | 映射文件 | 图片状态 |
|-------------|-----------|---------|---------|
| `src/lib/li-auto-series-upgrade-projects.ts` | `li-auto/generated/` | `items.json` | generated-preview |
| `src/lib/li-auto-i6-products.ts` | `li-auto/i6/generated/` | `items.json` | generated-preview |
| `src/lib/li-auto-l9-products.ts` | `li-auto/l9/generated/` | `manifest.json` | generated-preview |
| `src/lib/li-auto-mega-products.ts` | `li-auto/mega/generated/` | `items.json` | generated-preview |
| `src/lib/li-auto-one-products.ts` | `li-auto/one/generated/` | `manifest.json` | generated-preview |
| `src/lib/tesla-products.ts` | `tesla/generated/` | `manifest.json` | generated-preview |
| `src/lib/xiaomi-series-upgrade-projects.ts` | `xiaomi/manifest.json` | manifest（按中文名） | matched |
| `src/lib/xiaomi-su7-upgrade-projects.ts` | `xiaomi/su7/` | `manifest.json`（按中文名） | matched |
| `src/lib/xiaomi-yu7-upgrade-projects.ts` | `xiaomi/yu7/` | `manifest.json`（按中文名） | matched |

跳过: `src/lib/li-auto-i8-products.ts`（无图片目录）

## Open Questions

- xiaomi 系列升级项目（`xiaomi-series-upgrade-projects.ts`）的 manifest.json 中只有 `Image/SU7/` 和 `Image/YU7/` 的车型图，没有系列级产品图。需要确认是否有独立系列图，还是系列页复用车型图。
```

## openspec/changes/sync-product-image-status/tasks.md

- Source: openspec/changes/sync-product-image-status/tasks.md
- Lines: 1-61
- SHA256: 01cd8c118f9010257ca5a755a217e3eccbcb9cb2a9ed9bbc9b2083036619ee02

```md
## 1. li-auto 系列升级项目

- [ ] 1.1 读取 `public/images/products/li-auto/generated/items.json`，获取 40 个条目的 key→name 映射
- [ ] 1.2 逐项匹配 `src/lib/li-auto-series-upgrade-projects.ts` 中的 21 个升级项目，按中文名对应
- [ ] 1.3 为匹配成功的条目设置 `imageStatus: "generated-preview"`、`publicPath`、`width: 1448`、`height: 1086`、`aspectRatio: "4/3"`
- [ ] 1.4 保留未匹配条目的现有状态不变

## 2. li-auto i6

- [ ] 2.1 读取 `public/images/products/li-auto/i6/generated/items.json`（20 个条目，key 格式 `i6-<slug>`）
- [ ] 2.2 逐项匹配 `src/lib/li-auto-i6-products.ts` 中的 20 个项目（key 格式 `<slug>`，去掉 `i6-` 前缀后匹配）
- [ ] 2.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段
- [ ] 2.4 处理 items.json 中 key 名为 `i6-sway-bar`（对应产品 lib 的 `stabilizer-bar`）、`i6-wheels`（对应 `wheel-rims`）等特殊映射

## 3. li-auto l9

- [ ] 3.1 读取 `public/images/products/li-auto/l9/generated/manifest.json`，获取图片文件列表
- [ ] 3.2 逐项匹配 `src/lib/li-auto-l9-products.ts` 中的产品条目，按中文名或文件名关键词对应
- [ ] 3.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 4. li-auto mega

- [ ] 4.1 读取 `public/images/products/li-auto/mega/generated/items.json`（key 格式 `mega-<slug>`）
- [ ] 4.2 逐项匹配 `src/lib/li-auto-mega-products.ts` 中的产品条目（去掉 `mega-` 前缀后匹配）
- [ ] 4.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 5. li-auto one

- [ ] 5.1 读取 `public/images/products/li-auto/one/generated/manifest.json`，获取图片文件列表
- [ ] 5.2 逐项匹配 `src/lib/li-auto-one-products.ts` 中的产品条目，按中文名或文件名关键词对应
- [ ] 5.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 6. tesla

- [ ] 6.1 读取 `public/images/products/tesla/generated/manifest.json`（12 个条目含 publicPath）
- [ ] 6.2 逐项匹配 `src/lib/tesla-products.ts` 中的产品条目，按中文名对应（manifest 用简短 key，产品 lib 用 `tesla-featured-<slug>` 格式）
- [ ] 6.3 为匹配成功的条目设置 `imageStatus: "generated-preview"` 和图片字段

## 7. xiaomi SU7

- [ ] 7.1 读取 `public/images/products/xiaomi/manifest.json` 中 `vehicleModel: "SU7"` 的 12 张图片
- [ ] 7.2 逐项匹配 `src/lib/xiaomi-su7-upgrade-projects.ts` 中的产品条目，按 manifest 中的 `productName` 中文名对应
- [ ] 7.3 为匹配成功的条目设置 `imageStatus: "matched"`、`publicPath`、实际 width/height（不使用 4:3 预设）

## 8. xiaomi YU7

- [ ] 8.1 读取 `public/images/products/xiaomi/manifest.json` 中 `vehicleModel: "YU7"` 的 6 张图片
- [ ] 8.2 逐项匹配 `src/lib/xiaomi-yu7-upgrade-projects.ts` 中的产品条目，按中文名对应
- [ ] 8.3 为匹配成功的条目设置 `imageStatus: "matched"` 和图片字段

## 9. xiaomi 系列升级项目

- [ ] 9.1 检查 `public/images/products/xiaomi/manifest.json` 是否有系列级产品图（非车型图）
- [ ] 9.2 如有匹配项，更新 `src/lib/xiaomi-series-upgrade-projects.ts`；如无系列图，标记为 `pending-review` 保持不变

## 10. 验证

- [ ] 10.1 运行 `npm run typecheck`，确保 publicPath 字面量类型编译通过
- [ ] 10.2 运行 `npm test -- --run`，确保现有测试全部通过
- [ ] 10.3 运行 `npm run build`，确保 SSG 构建不受影响
- [ ] 10.4 检查每个修改文件中所有产品条目的 `imageStatus` 分布（generated-preview / matched / pending-review / missing），确认匹配数量合理
```

