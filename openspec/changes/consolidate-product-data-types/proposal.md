## Why

Product data layer has ~30 `src/lib/*-products.ts` and `*-upgrade-projects.ts` files that independently define identical image status types, image object shapes, build helpers, and id/slug helpers. This duplication has produced a real bug: `src/lib/xiaomi-series-upgrade-projects.ts` defines `XiaomiSeriesImageStatus = "matched" | "missing" | "missing"` — duplicate `"missing"` and missing `"generated-preview"`.

A shared base type layer lets product data files keep only their brand-specific differences while importing image status, image dimensions, alt builder, missing/preview helper, and base helpers from a single module.

## What Changes

- New `src/lib/product-types.ts` as the shared product data layer:
  - `ImageStatus`
  - `ProductImage`
  - `matchedImage`, `missingImage`, `productPreviewImage`, `pendingReviewImage`
  - `buildProductAlt`, `makeProductId`, `slugifyProductName`
- Fix `src/lib/xiaomi-series-upgrade-projects.ts` duplicate `"missing"` union bug, adopt shared `ImageStatus`
- Migrate first batch (4 files):
  - `xiaomi-series-upgrade-projects.ts`
  - `xiaomi-su7-upgrade-projects.ts`
  - `xiaomi-yu7-upgrade-projects.ts`
  - `zeekr-products.ts`
- Keep brand-specific types (category, scenario, tier, sourceArea) local to each file
- Add tests for shared module + migrated files
- Add `scripts/check-product-type-duplication.mjs` to prevent regression

## Capabilities

### New Capabilities
- `product-data-types`: Shared product data types and helpers — unified image status, image object, image builder functions, base id/slug helpers, and a duplicate-prevention guard script.

### Modified Capabilities
(None — this adds a base product data layer; no public page behavior changes.)

## Impact

- New files:
  - `src/lib/product-types.ts`
  - `src/lib/product-types.test.ts`
  - `scripts/check-product-type-duplication.mjs`
- Modified files:
  - `src/lib/xiaomi-series-upgrade-projects.ts`
  - `src/lib/xiaomi-su7-upgrade-projects.ts`
  - `src/lib/xiaomi-yu7-upgrade-projects.ts`
  - `src/lib/zeekr-products.ts`
  - `package.json`
- Future coordination:
  - Can be reused by `product-topic-component-system` as the base type for shared component adapters
- Risks:
  - Historical files have status naming differences (`generated-preview`, `product-preview`, `real`, `pending`) — need compatible mapping
  - One-shot migration of 30+ files is high-risk — proceed by pilot batches
  - Shared helpers must not change product page rendering output
