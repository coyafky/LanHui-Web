# Comet Design Handoff

- Change: consolidate-product-data-types
- Phase: design
- Mode: compact
- Context hash: d67cb3f9a67252f39e0cf5c8a2da5ccc8b8ce7cbed5dab481ccd73c7eb192a93

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/consolidate-product-data-types/proposal.md

- Source: openspec/changes/consolidate-product-data-types/proposal.md
- Lines: 1-49
- SHA256: 207edcf542a5ba22dd1de3258a6dba6e1f3e4897311ae723320d95630541a4e9

```md
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

```

## openspec/changes/consolidate-product-data-types/design.md

- Source: openspec/changes/consolidate-product-data-types/design.md
- Lines: 1-76
- SHA256: 77c2a88a765abaf52cbd3fb63b3ac647840e5a8e47a51b66d674058176f0c0b2

```md
## Context

Product data files in `src/lib/` independently define identical types and helpers:
- `XxxImageStatus` union (brand-specific, identical values)
- `matchedImage()`, `missingImage()`, `buildAlt()`, `product()`, `makeId()` helpers
- Image dimensions: 1448×1086, aspect ratio 4/3

This duplication causes real bugs (e.g. `XiaomiSeriesImageStatus` with duplicate `"missing"`) and makes maintenance fragile.

## Goals / Non-Goals

**Goals:**
- Create `src/lib/product-types.ts` with shared `ImageStatus`, `ProductImage`, and helper functions
- Fix the Xiaomi series duplicate union bug
- Migrate first batch of 4 files to shared types
- Add duplicate-prevention guard script
- Preserve all existing product output (ids, paths, counts, ordering)

**Non-Goals:**
- Do not merge brand-specific business types (category, scenario, tier, sourceArea)
- Do not migrate all 30+ files in one batch
- Do not change product page rendering behavior
- Do not modify API or database schemas

## Decisions

### 1: Canonical `ImageStatus` = `"matched" | "generated-preview" | "pending-review" | "missing"`

Use the most common status names from existing files. All brand-specific `XxxImageStatus` types alias or import this shared type.

### 2: Shared `ProductImage` Interface

```ts
export interface ProductImage {
  readonly publicPath: string | null;
  readonly alt: string;
  readonly width: 1448 | null;
  readonly height: 1086 | null;
  readonly aspectRatio: "4/3" | null;
}
```

### 3: Image Builders Instead of Inline Objects

Replace inline `{ publicPath, alt, width: 1448, height: 1086, aspectRatio: "4/3" }` with `matchedImage(path, alt)`. Missing/preview images use `missingImage(alt)` / `productPreviewImage(path, alt)` / `pendingReviewImage(alt)`.

### 4: First Batch → 4 Xiaomi/Zeekr Files

Start with the buggy file plus its siblings and one complex file:
1. `xiaomi-series-upgrade-projects.ts` (bug fix + migration)
2. `xiaomi-su7-upgrade-projects.ts`
3. `xiaomi-yu7-upgrade-projects.ts`
4. `zeekr-products.ts` (complex, helper-heavy)

### 5: Duplicate Prevention via CI Script

`scripts/check-product-type-duplication.mjs` scans for local `ImageStatus` unions and base image helpers. Legacy non-migrated files are allowed via allowlist; new files cannot add duplicates.

### 6: Output Stability Guarantee

Migration must preserve existing product ids, image paths, product counts, and array ordering. Tests verify these invariants.

## Risks / Trade-offs

- [Risk] Breaking existing product pages → Mitigation: output stability tests verify ids, paths, counts
- [Risk] 30-file migration too large → Mitigation: batch approach; allowlist for non-migrated files
- [Risk] Status naming differences in legacy files → Mitigation: use the most common canonical names; legacy variants handled per-file during migration

## Migration Plan

1. Create `src/lib/product-types.ts` with types, helpers, and builders
2. Create `src/lib/product-types.test.ts`
3. Fix Xiaomi series bug + migrate 4 first-batch files
4. Add stability tests for migrated files
5. Add `scripts/check-product-type-duplication.mjs` + `check:product-types` npm script
6. Document second-batch backlog in tasks.md

```

## openspec/changes/consolidate-product-data-types/tasks.md

- Source: openspec/changes/consolidate-product-data-types/tasks.md
- Lines: 1-71
- SHA256: 62baf3c888c89cbbf866c693c2d1718a549b70be3c937c2bc55a355a7bd6e27b

```md
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

```

## openspec/changes/consolidate-product-data-types/specs/product-data-types/spec.md

- Source: openspec/changes/consolidate-product-data-types/specs/product-data-types/spec.md
- Lines: 1-142
- SHA256: 94bb3462ec779964156794e93e2b13ec7b56a8b2e23cd5530dfacab0409797e7

[TRUNCATED]

```md
## ADDED Requirements

### Requirement: Shared product image types
The system SHALL provide shared product image types in `src/lib/product-types.ts`. Product data files MUST import common types instead of redefining identical local structures.

#### Scenario: Shared image status imported
- **WHEN** a migrated product data file needs an image status type
- **THEN** it imports `ImageStatus` from `@/lib/product-types` instead of defining a local union

#### Scenario: Shared image object imported
- **WHEN** a migrated product data file needs a product image type
- **THEN** it imports `ProductImage` from `@/lib/product-types`

### Requirement: Canonical image status set
The system SHALL define a canonical image status type `ImageStatus` with values `"matched" | "generated-preview" | "pending-review" | "missing"`. All product data files MUST use this shared type rather than defining brand-specific status unions.

#### Scenario: Canonical status values accepted
- **WHEN** product data uses `matched`, `generated-preview`, `pending-review`, or `missing`
- **THEN** `ImageStatus` accepts the value

#### Scenario: Brand-specific status type eliminated
- **WHEN** migration is complete for a product data file
- **THEN** the file no longer contains a brand-specific `XxxImageStatus` type alias duplicating `ImageStatus`

### Requirement: ProductImage interface
The system SHALL provide a shared `ProductImage` interface with readonly fields `publicPath`, `alt`, `width`, `height`, and `aspectRatio`. All product data files producing image objects MUST use this interface.

#### Scenario: ProductImage shape
- **WHEN** a product data file produces an image object
- **THEN** the object conforms to `ProductImage` with `publicPath: string | null`, `alt: string`, `width: 1448 | null`, `height: 1086 | null`, `aspectRatio: "4/3" | null`

### Requirement: Shared image builder functions
The system SHALL provide shared image builder functions `matchedImage()`, `missingImage()`, `productPreviewImage()`, and `pendingReviewImage()`. Each MUST return a `ProductImage` compatible with existing UI rendering.

#### Scenario: matchedImage builder
- **WHEN** `matchedImage(path, alt)` is called
- **THEN** it returns `{ publicPath: path, alt, width: 1448, height: 1086, aspectRatio: "4/3" }`

#### Scenario: missingImage builder
- **WHEN** `missingImage(alt)` is called
- **THEN** it returns `{ publicPath: null, alt, width: null, height: null, aspectRatio: null }`

#### Scenario: productPreviewImage builder
- **WHEN** `productPreviewImage(path, alt)` is called
- **THEN** it returns a `ProductImage` with the given path and alt plus standard 1448×1086 dimensions

#### Scenario: pendingReviewImage builder
- **WHEN** `pendingReviewImage(alt)` is called
- **THEN** it returns `{ publicPath: null, alt, width: null, height: null, aspectRatio: null }`

### Requirement: Shared alt text, id, and slug helpers
The system SHALL provide `buildProductAlt()`, `makeProductId()`, and `slugifyProductName()` helpers so product data files do not duplicate branding logic.

#### Scenario: buildProductAlt includes brand and model
- **WHEN** `buildProductAlt(brand, model, product, kind)` is called
- **THEN** it returns Chinese alt text containing the relevant product context

#### Scenario: slugifyProductName supports manual override
- **WHEN** `slugifyProductName(name, overrides)` is called with a name that has a manual override
- **THEN** it returns the manual slug instead of a generated fallback

#### Scenario: makeProductId returns deterministic stable ids
- **WHEN** `makeProductId(...parts)` is called with stable string parts
- **THEN** it returns a deterministic slug-like id unchanged by migration

### Requirement: Xiaomi series image status bug fixed
The system SHALL fix the duplicated `"missing"` union member in `XiaomiSeriesImageStatus` in `src/lib/xiaomi-series-upgrade-projects.ts`. The fixed type MUST also support `generated-preview`.

#### Scenario: No duplicate union members
- **WHEN** `XiaomiSeriesImageStatus` is inspected after the fix
- **THEN** it resolves to `ImageStatus` and contains no duplicate union members

#### Scenario: Preview status available
- **WHEN** Xiaomi series data needs a generated-preview image
- **THEN** the status field accepts `"generated-preview"` without error

### Requirement: First-batch migration
The system SHALL migrate at least 4 product data files to the shared type layer in the first batch: `xiaomi-series-upgrade-projects.ts`, `xiaomi-su7-upgrade-projects.ts`, `xiaomi-yu7-upgrade-projects.ts`, and one complex file such as `zeekr-products.ts`.

#### Scenario: Xiaomi series files migrated

```

Full source: openspec/changes/consolidate-product-data-types/specs/product-data-types/spec.md
