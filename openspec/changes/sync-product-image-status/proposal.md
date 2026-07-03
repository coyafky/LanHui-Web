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
