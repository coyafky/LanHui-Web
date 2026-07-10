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
