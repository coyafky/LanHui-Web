## Context

产品数据层已经出现大量重复基础类型和 helper。当前可见重复包括：

- 多个文件重复定义 `*ImageStatus`
- 多个文件重复定义 `ProductImage` 形状：`publicPath`、`alt`、`width`、`height`、`aspectRatio`
- 多个文件重复实现 `matchedImage()`、`missingImage()`、`pendingReviewImage()`、`product()`、`makeId()` 等 helper
- 问界已经有局部共享文件 `src/lib/wenjie-preview-images.ts`，说明“局部共享”方向可行，但还没有全站产品数据层基础类型
- `src/lib/xiaomi-series-upgrade-projects.ts` 存在真实 union bug：`"matched" | "missing" | "missing"`

项目约束：

- 产品数据文件是很多页面和组件的 source-of-truth，不能在一次重构中改变 publicPath、alt、项目 id、项目顺序或业务字段含义。
- 现有代码中图片状态命名不完全统一，存在 `"matched"`、`"missing"`、`"pending-review"`、`"product-preview"`、`"generated-preview"`、`"real"`、`"pending"` 等历史差异。
- 之前已明确官网宣传可以使用“商品预览效果图”语义，因此共享层应避免继续把 AI/占位感的命名暴露到 UI。
- TypeScript strict，不使用 `any`。

## Goals / Non-Goals

**Goals:**

- 新增 `src/lib/product-types.ts`，统一产品图片基础类型、状态、尺寸常量和 helper。
- 修复 `XiaomiSeriesImageStatus` 重复 `"missing"` bug。
- 分阶段迁移高重复产品数据文件，先从小米系列和一批代表文件开始。
- 让新产品数据文件禁止继续本地定义重复 `ImageStatus` union 和基础图片 helper。
- 保持页面输出稳定：图片路径、alt、尺寸、aspectRatio、项目 id、项目顺序不因重构变化。
- 为共享类型和 helper 添加测试与防回归检查。

**Non-Goals:**

- 不统一所有业务字段，例如 category、scenario、tier、sourceArea、applicableModels。
- 不重写所有车型专题数据 schema。
- 不删除问界局部共享文件，除非迁移验证充分。
- 不改变产品图片真实资产路径。
- 不改变 UI 文案组件，只提供数据层状态和 label helper。
- 不一次性迁移全部 30+ 文件；首批完成后按清单继续。

## Decisions

### Decision 1: Canonical 状态使用 `product-preview`，兼容 legacy `generated-preview`

共享层定义目标状态：

```ts
export type ProductImageStatus =
  | "matched"
  | "product-preview"
  | "pending-review"
  | "missing";
```

并提供 legacy 兼容：

```ts
export type LegacyProductImageStatus =
  | ProductImageStatus
  | "generated-preview"
  | "real"
  | "pending";

export function normalizeProductImageStatus(status: LegacyProductImageStatus): ProductImageStatus;
```

映射建议：

- `"generated-preview"` → `"product-preview"`
- `"real"` → `"matched"`
- `"pending"` → `"pending-review"`
- 其他 canonical 状态保持不变

理由：

- 当前部分文件已使用 `product-preview`，并且站点宣传口径更适合“商品预览效果图”。
- 兼容旧输入可以分批迁移，而不是一次性改动所有文件。

替代方案：

- 直接采用用户示例中的 `"generated-preview"` 作为 canonical。缺点是会继续保留不利于宣传的命名，并和当前部分代码的 `product-preview` 不一致。

### Decision 2: 统一图片对象，但允许 `publicPath` 为空

共享图片类型：

```ts
export type ProductImageWidth = 1448;
export type ProductImageHeight = 1086;
export type ProductImageAspectRatio = "4/3";

export type ProductImage = {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: ProductImageWidth | null;
  readonly height: ProductImageHeight | null;
  readonly aspectRatio: ProductImageAspectRatio | null;
};
```

理由：

- 当前大量产品图固定 1448×1086、4:3。
- 缺图状态需要 `publicPath: null`。
- 某些旧文件的缺图 width/height 可能仍填固定值，迁移时必须保留兼容或通过测试确认不会影响 UI。

### Decision 3: Helper 只解决基础重复，不接管业务命名规则

共享 helper 覆盖：

- `matchedImage`
- `productPreviewImage`
- `pendingReviewImage`
- `missingImage`
- `buildProductAlt`
- `makeProductId`
- `slugifyProductName`
- `defineProductImage`

但品牌专属文件仍可以保留：

- category union
- scenario union
- model union
- sourceArea
- tier
- 特殊手工 slug map
- PRD 计数断言

理由：

- 真正重复的是图片和 id/slug 基础能力，不是所有业务模型。
- 保留专属字段能降低迁移风险。

### Decision 4: 分批迁移，首批必须包含 bug 文件

首批迁移建议：

1. `src/lib/xiaomi-series-upgrade-projects.ts`：修复 union bug，并接入共享状态类型。
2. `src/lib/xiaomi-su7-upgrade-projects.ts` 和 `src/lib/xiaomi-yu7-upgrade-projects.ts`：同系列相似，迁移收益高。
3. `src/lib/zeekr-products.ts`：包含本地 `matchedImage/missingImage/pendingReviewImage/product/makeId/slugify`，适合作为复杂 helper 试点。

第二批再迁移：

- `li-auto-*`
- `tesla-products.ts`
- `denza-d9-products.ts`
- `nio-products.ts`
- `gaoshan-products.ts`
- `xpeng-gx-products.ts`
- `voyah-products.ts`
- `zhijie-v9-products.ts`
- `ledao-l90-products.ts`

理由：

- 首批覆盖 bug 修复、同系列重复、复杂 helper 三种情况。
- 避免一次性横跨 30+ 文件导致难以 review。

### Decision 5: 使用检查脚本防止新增重复

新增 `scripts/check-product-type-duplication.mjs`，检查新代码中是否继续出现：

- `export type .*ImageStatus = ...` 本地重复 union
- `function matchedImage`
- `function missingImage`
- `function pendingReviewImage`
- 基础 `ProductImage` 重复结构

脚本允许历史文件白名单，迁移完成后逐步缩小白名单。

理由：

- 不可能一次性清完所有旧文件，但可以立刻阻止技术债扩大。

## Proposed API

```ts
export type ProductImageStatus =
  | "matched"
  | "product-preview"
  | "pending-review"
  | "missing";

export type LegacyProductImageStatus =
  | ProductImageStatus
  | "generated-preview"
  | "real"
  | "pending";

export type ProductImage = {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: 1448 | null;
  readonly height: 1086 | null;
  readonly aspectRatio: "4/3" | null;
};

export type ProductImageInput = {
  readonly publicPath: string;
  readonly alt: string;
};

export function normalizeProductImageStatus(status: LegacyProductImageStatus): ProductImageStatus;
export function imageStatusLabel(status: LegacyProductImageStatus): string;
export function matchedImage(input: ProductImageInput): ProductImage;
export function productPreviewImage(input: ProductImageInput): ProductImage;
export function pendingReviewImage(alt: string): ProductImage;
export function missingImage(alt: string): ProductImage;
export function buildProductAlt(parts: {
  brand: string;
  model?: string;
  name: string;
  kind?: "display" | "preview" | "missing" | "pending-review";
}): string;
export function makeProductId(parts: readonly string[]): string;
export function slugifyProductName(name: string, manualSlugs?: Readonly<Record<string, string>>): string;
```

## Risks / Trade-offs

- [Risk] 状态命名统一导致 UI label 变化  
  → Mitigation: 提供 `imageStatusLabel()` 并为每个状态加测试，确保 `product-preview` 和 legacy `generated-preview` 都显示为“商品预览效果图”。

- [Risk] publicPath 或 alt 在迁移后改变  
  → Mitigation: 为首批迁移文件加快照式数据测试，断言关键项目路径和 alt 不变。

- [Risk] 共享 helper 无法覆盖特殊 slug  
  → Mitigation: `slugifyProductName()` 支持传入 manual slug map；复杂文件可保留本地专属 map。

- [Risk] 脚本误报历史文件  
  → Mitigation: 首版维护 legacy allowlist，只拦截新增重复和已迁移文件回退。

- [Risk] 问界局部共享文件与全局共享文件重叠  
  → Mitigation: 首批不强制迁移问界，后续可把 `wenjie-preview-images.ts` 改为 re-export 或 adapter。

## Migration Plan

1. 新建共享类型和 helper，不改任何现有数据文件。
2. 为共享类型和 helper 添加测试。
3. 修复 `XiaomiSeriesImageStatus` bug，并接入共享状态类型。
4. 迁移小米 SU7/YU7/Series 的图片状态类型和基础图片 helper。
5. 迁移 `zeekr-products.ts` 作为复杂 helper 试点。
6. 新增重复检查脚本和 package script。
7. 记录第二批迁移清单。

Rollback：

- 单文件迁移可通过 git 回退。
- 共享 `product-types.ts` 无副作用，未被引用时可保留。
- 检查脚本可临时从 `package.json` 解绑，但必须保留 migration TODO。

## Open Questions

- `generated-preview` 是否需要永久保留为可输入 legacy 状态，建议保留到所有旧文件迁移完后再评估删除。
- 缺图状态是否统一使用 `width/height/aspectRatio: null`，还是保持部分历史文件的固定尺寸；首批迁移应以不改变 UI 为优先。
