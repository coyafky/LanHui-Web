---
comet_change: consolidate-product-data-types
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-10-consolidate-product-data-types
status: final
---

# Design Doc: Consolidate Product Data Types

## Context

~30 product data files in `src/lib/` independently define identical types and helpers:
- Brand-specific `XxxImageStatus` unions (all with same 4 values)
- `matchedImage()`, `missingImage()`, `buildAlt()`, `product()`, `makeId()` copied across files
- Standard image dimensions 1448×1086 at 4:3 repeated inline

Real bug found: `XiaomiSeriesImageStatus = "matched" | "missing" | "missing"` — duplicate union member, missing `"generated-preview"`.

## Goals / Non-Goals

**Goals:**
- Create `src/lib/product-types.ts` as single source of truth
- Fix Xiaomi series duplicate union bug
- Migrate 4 files in first batch
- Add CI guard against regression
- Preserve all existing product output

**Non-Goals:**
- Do not merge brand-specific business types
- Do not migrate all 30+ files at once
- Do not change product page rendering

## Decisions

### 1: Canonical `ImageStatus`

```ts
export type ImageStatus = "matched" | "generated-preview" | "pending-review" | "missing";
```

Most existing files already use these exact names. Brand-specific aliases import this type.

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

### 3: Image Builder Functions

- `matchedImage(path, alt)` → `{ publicPath: path, alt, width: 1448, height: 1086, aspectRatio: "4/3" }`
- `missingImage(alt)` → `{ publicPath: null, alt, width: null, height: null, aspectRatio: null }`
- `productPreviewImage(path, alt)` → full image with preview path
- `pendingReviewImage(alt)` → null-path image

### 4: Shared Helper Functions

- `buildProductAlt(brand, model, product, kind)` → Chinese alt text
- `makeProductId(...parts)` → deterministic slug-like id
- `slugifyProductName(name, overrides?)` → slug with manual override support

### 5: First-Batch Migration (4 Files)

1. `xiaomi-series-upgrade-projects.ts` — bug fix + shared types
2. `xiaomi-su7-upgrade-projects.ts` — shared types
3. `xiaomi-yu7-upgrade-projects.ts` — shared types
4. `zeekr-products.ts` — shared types + helpers

### 6: CI Guard Script

`scripts/check-product-type-duplication.mjs` scans for local `ImageStatus` unions and base helpers. Allowlist for non-migrated legacy files. Hook into `package.json` as `check:product-types`.

## Files Changed

| Category | Files |
|----------|-------|
| New | `src/lib/product-types.ts`, `src/lib/product-types.test.ts`, `scripts/check-product-type-duplication.mjs` |
| First batch | `xiaomi-series-upgrade-projects.ts`, `xiaomi-su7-upgrade-projects.ts`, `xiaomi-yu7-upgrade-projects.ts`, `zeekr-products.ts` |
| Config | `package.json` |

