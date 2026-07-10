## 1. Baseline Audit

- [ ] 1.1 Inventory local `ImageStatus` definitions across `src/lib/*-products.ts` and `src/lib/*-upgrade-projects.ts`
- [ ] 1.2 Inventory local image helper functions including `matchedImage`, `missingImage`, `pendingReviewImage`, `productPreviewImage`, `buildAlt`, `makeId`, and `slugify`
- [ ] 1.3 Record first-batch expected output for Xiaomi Series, Xiaomi SU7, Xiaomi YU7, and one complex helper-heavy file such as `zeekr-products.ts`
- [ ] 1.4 Confirm current public image status labels used by components so shared labels do not regress UI copy

## 2. Shared Product Type Module

- [ ] 2.1 Create `src/lib/product-types.ts`
- [ ] 2.2 Add `ProductImageStatus`, `LegacyProductImageStatus`, `ProductImageWidth`, `ProductImageHeight`, `ProductImageAspectRatio`, and `ProductImage`
- [ ] 2.3 Add constants for standard product image dimensions: 1448×1086 and `4/3`
- [ ] 2.4 Add `normalizeProductImageStatus()` with legacy mappings for `generated-preview`, `real`, and `pending`
- [ ] 2.5 Add `imageStatusLabel()` returning public-facing labels such as `商品预览效果图`
- [ ] 2.6 Add `matchedImage()`, `productPreviewImage()`, `pendingReviewImage()`, and `missingImage()`
- [ ] 2.7 Add `buildProductAlt()`, `makeProductId()`, and `slugifyProductName()` with manual slug override support

## 3. Tests For Shared Module

- [ ] 3.1 Create `src/lib/product-types.test.ts`
- [ ] 3.2 Test canonical status acceptance and legacy status normalization
- [ ] 3.3 Test public label output for preview, matched, pending-review, and missing statuses
- [ ] 3.4 Test image builder output for publicPath, alt, width, height, and aspectRatio
- [ ] 3.5 Test slug helper manual overrides and fallback behavior
- [ ] 3.6 Test id helper deterministic output

## 4. Xiaomi Series Bug Fix

- [ ] 4.1 Modify `src/lib/xiaomi-series-upgrade-projects.ts` so `XiaomiSeriesImageStatus` no longer repeats `"missing"`
- [ ] 4.2 Alias or import Xiaomi Series image status from the shared product type module
- [ ] 4.3 Ensure Xiaomi Series can represent the intended preview status through the shared type
- [ ] 4.4 Add or update Xiaomi Series tests to assert no duplicate status union and stable project count

## 5. First Batch Migration

- [ ] 5.1 Migrate `src/lib/xiaomi-su7-upgrade-projects.ts` to shared image status and image helpers where applicable
- [ ] 5.2 Migrate `src/lib/xiaomi-yu7-upgrade-projects.ts` to shared image status and image helpers where applicable
- [ ] 5.3 Migrate `src/lib/xiaomi-series-upgrade-projects.ts` to shared image status and helper conventions where applicable
- [ ] 5.4 Migrate one complex helper-heavy file, preferably `src/lib/zeekr-products.ts`, to shared image types and reusable helper pieces
- [ ] 5.5 Preserve all existing ids, product order, non-null publicPath values, and alt text unless a change is explicitly required by the bug fix
- [ ] 5.6 Keep brand-specific category, scenario, tier, sourceArea, and manual slug maps local to their data files

## 6. Output Stability Tests

- [ ] 6.1 Add tests for migrated Xiaomi files verifying counts, representative ids, representative image paths, and representative statuses
- [ ] 6.2 Add tests for the complex migrated file verifying representative ids, image paths, alt text, and grouped ordering
- [ ] 6.3 Ensure legacy status inputs normalize to canonical values without breaking existing component expectations

## 7. Duplication Guard

- [ ] 7.1 Create `scripts/check-product-type-duplication.mjs`
- [ ] 7.2 Detect newly introduced local duplicated `ImageStatus` unions outside an explicit legacy allowlist
- [ ] 7.3 Detect newly introduced base image helpers such as local `matchedImage`, `missingImage`, and `pendingReviewImage` outside the allowlist
- [ ] 7.4 Add a migration allowlist for legacy files that are not migrated in this change
- [ ] 7.5 Add `check:product-types` to `package.json`
- [ ] 7.6 Document how to shrink the allowlist as later batches migrate

## 8. Verification

- [ ] 8.1 Run `npx vitest run src/lib/product-types.test.ts`
- [ ] 8.2 Run targeted tests for migrated product data files
- [ ] 8.3 Run `npm run lint`
- [ ] 8.4 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [ ] 8.5 Run `npm run build`
- [ ] 8.6 Run `npm run check:product-types`

## 9. Follow-up Migration Backlog

- [ ] 9.1 Create a second-batch migration list for `li-auto-*`, `tesla-products.ts`, `denza-d9-products.ts`, `nio-products.ts`, `gaoshan-products.ts`, `xpeng-gx-products.ts`, `voyah-products.ts`, `zhijie-v9-products.ts`, and `ledao-l90-products.ts`
- [ ] 9.2 Decide whether `src/lib/wenjie-preview-images.ts` should remain as a domain adapter or re-export from `src/lib/product-types.ts`
- [ ] 9.3 Track remaining local helper definitions and update the check script allowlist after each batch
