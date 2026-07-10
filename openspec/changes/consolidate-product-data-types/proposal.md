## Why

产品数据层在 30+ 个 `src/lib/*-products.ts` 和 `*-upgrade-projects.ts` 文件中重复定义相同或近似的图片状态、图片对象、构建 helper 和 id/slug helper。重复定义已经导致真实类型 bug，例如 `src/lib/xiaomi-series-upgrade-projects.ts` 中 `XiaomiSeriesImageStatus = "matched" | "missing" | "missing"`，既重复 `"missing"`，又缺少当前宣传图语义所需的 preview 状态。

现在需要建立一个共享基础类型层，让产品数据文件只保留业务差异，图片状态、图片尺寸、alt 构建、缺图/预览图 helper 和基础断言从统一模块导入。

## What Changes

- 新增 `src/lib/product-types.ts` 作为产品数据层共享基础类型与 helper：
  - `ProductImageStatus`
  - `ProductImage`
  - `ProductImageDimensions`
  - `ProductImageAspectRatio`
  - `matchedImage`
  - `productPreviewImage`
  - `pendingReviewImage`
  - `missingImage`
  - `buildProductAlt`
  - `makeProductId`
  - `slugifyProductName`
- 修复 `src/lib/xiaomi-series-upgrade-projects.ts` 的 `XiaomiSeriesImageStatus` 重复 union bug，并纳入统一状态类型。
- 分阶段迁移高重复文件，优先迁移：
  - `xiaomi-series-upgrade-projects.ts`
  - `xiaomi-su7-upgrade-projects.ts`
  - `xiaomi-yu7-upgrade-projects.ts`
  - `zeekr-products.ts`
  - `zeekr-8x-products.ts`
  - `zeekr-9x-products.ts`
  - `li-auto-*`
  - `tesla-products.ts`
  - `denza-d9-products.ts`
  - `nio-products.ts`
  - `gaoshan-products.ts`
  - `xpeng-gx-products.ts`
  - `voyah-products.ts`
  - `zhijie-v9-products.ts`
  - `ledao-l90-products.ts`
- 保留品牌/车型专属 category、scenario、tier、sourceArea 等业务类型，不强行合并所有产品数据 schema。
- 新增测试和检查脚本，防止新增重复 `ImageStatus` union 和本地图片 helper。

## Capabilities

### New Capabilities
- `product-data-types`: 产品数据层共享类型与 helper，统一图片状态、图片对象、图片构建函数、基础 id/slug helper，并提供重复定义防回归检查。

### Modified Capabilities
（无 — 本次新增产品数据层基础能力，不改变现有公开页面行为。）

## Impact

- 新增：
  - `src/lib/product-types.ts`
  - `src/lib/product-types.test.ts`
  - `scripts/check-product-type-duplication.mjs`
- 修改：
  - `src/lib/xiaomi-series-upgrade-projects.ts`
  - 一批 `src/lib/*-products.ts` 与 `src/lib/*-upgrade-projects.ts`
  - `package.json`
- 后续协同：
  - 可被 `product-topic-component-system` change 复用，作为共享组件适配器的底层类型。
- 风险：
  - 不同历史文件存在 `"generated-preview"`、`"product-preview"`、`"real"`、`"pending"` 等状态命名差异，需要设计兼容映射。
  - 一次性迁移 30+ 文件风险高，应按试点和批次推进。
  - 图片 publicPath、alt、width/height/aspectRatio 不能因为统一 helper 而改变页面渲染结果。
