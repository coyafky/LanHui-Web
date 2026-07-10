## 1. Baseline Audit

- [x] 1.1 Inventory local `ImageStatus` definitions across `src/lib/*-products.ts` and `src/lib/*-upgrade-projects.ts`
- [x] 1.2 Inventory local image helper functions including `matchedImage`, `missingImage`, `pendingReviewImage`, `productPreviewImage`, `buildAlt`, `makeId`, and `slugify`
- [x] 1.3 Record first-batch expected output for Xiaomi Series, Xiaomi SU7, Xiaomi YU7, and one complex helper-heavy file such as `zeekr-products.ts`
- [x] 1.4 Confirm current public image status labels used by components so shared labels do not regress UI copy

## 2. Shared Product Type Module

- [x] 2.1 Create `src/lib/product-types.ts`
- [x] 2.2 Add `ImageStatus`, `ProductImage`
- [x] 2.3 Add constants for standard product image dimensions: 1448×1086 and `4/3`
- [x] 2.4 Add `matchedImage()`, `productPreviewImage()`, `pendingReviewImage()`, and `missingImage()`
- [x] 2.5 Add `buildProductAlt()`, `makeProductId()`, and `slugifyProductName()` with manual slug override support

## 3. Tests For Shared Module

- [x] 3.1 Create `src/lib/product-types.test.ts`
- [x] 3.2 Test image builder output for publicPath, alt, width, height, and aspectRatio
- [x] 3.3 Test slug helper manual overrides and fallback behavior
- [x] 3.4 Test id helper deterministic output
- [x] 3.5 Test alt helper output format

## 4. Xiaomi Series Bug Fix

- [x] 4.1 Modify `src/lib/xiaomi-series-upgrade-projects.ts` so `XiaomiSeriesImageStatus` no longer repeats `"missing"`
- [x] 4.2 Fix now includes `"generated-preview"` in the status union

## 5. First Batch Migration

- [x] 5.1 Migrate `src/lib/xiaomi-su7-upgrade-projects.ts` to shared image status and image helpers where applicable
- [x] 5.2 Migrate `src/lib/xiaomi-yu7-upgrade-projects.ts` to shared image status and image helpers where applicable
- [x] 5.3 Migrate `src/lib/xiaomi-series-upgrade-projects.ts` to shared image status and helper conventions where applicable
- [x] 5.4 Migrate one complex helper-heavy file, preferably `src/lib/zeekr-products.ts`, to shared image types and reusable helper pieces
- [x] 5.5 Preserve all existing ids, product order, non-null publicPath values, and alt text unless a change is explicitly required by the bug fix
- [x] 5.6 Keep brand-specific category, scenario, tier, sourceArea, and manual slug maps local to their data files

## 6. Output Stability Tests

- [x] 6.1 Existing Xiaomi Series tests pass (37/37)
- [x] 6.2 Add tests for the complex migrated file verifying representative ids, image paths, alt text, and grouped ordering
- [x] 6.3 Ensure legacy status inputs normalize to canonical values without breaking existing component expectations

## 7. Duplication Guard

- [x] 7.1 Create `scripts/check-product-type-duplication.mjs`
- [x] 7.2 Detect newly introduced local duplicated `ImageStatus` unions outside an explicit legacy allowlist
- [x] 7.3 Detect newly introduced base image helpers such as local `matchedImage`, `missingImage`, and `pendingReviewImage` outside the allowlist
- [x] 7.4 Add a migration allowlist for legacy files that are not migrated in this change
- [x] 7.5 Add `check:product-types` to `package.json`
- [x] 7.6 Document how to shrink the allowlist as later batches migrate

## 8. Verification

- [x] 8.1 Run `npx vitest run src/lib/product-types.test.ts`
- [x] 8.2 Run targeted tests for migrated product data files
- [x] 8.3 Run `npm run lint`
- [x] 8.4 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [x] 8.5 Run `npm run build`
- [x] 8.6 Run `npm run check:product-types`

## 9. Follow-up Migration Backlog

- [x] 9.1 Second-batch migration list: `li-auto-*`, `tesla-products.ts`, `denza-d9-products.ts`, `nio-products.ts`, `gaoshan-products.ts`, `xpeng-gx-products.ts`, `voyah-products.ts`, `zhijie-v9-products.ts`, `ledao-l90-products.ts` — tracked in allowlist
- [x] 9.2 `src/lib/wenjie-preview-images.ts` added to legacy allowlist; decision: domain adapter for now
- [x] 9.3 Allowlist shrink per batch — documented in check script comments
