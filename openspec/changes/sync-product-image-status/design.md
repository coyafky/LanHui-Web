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
