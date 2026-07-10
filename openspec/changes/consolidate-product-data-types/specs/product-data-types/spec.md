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
- **WHEN** first batch is complete
- **THEN** the three Xiaomi product files import `ImageStatus` and/or `ProductImage` from `@/lib/product-types` instead of defining local types

#### Scenario: Complex file migrated
- **WHEN** first batch is complete
- **THEN** `zeekr-products.ts` uses shared image types or helpers from `@/lib/product-types`

### Requirement: Output stability preserved
The system SHALL NOT change existing product ids, image paths, product counts, or ordering as a result of migration, except for the intentional Xiaomi series status bug fix.

#### Scenario: Product counts unchanged
- **WHEN** migrated product data arrays are exported
- **THEN** array lengths match pre-migration values

#### Scenario: Image paths unchanged
- **WHEN** migrated product image objects are inspected
- **THEN** non-null publicPath values are identical to pre-migration values

#### Scenario: Product ordering unchanged
- **WHEN** migrated product arrays are iterated
- **THEN** element order is identical to pre-migration order

### Requirement: Duplicate type prevention guard
The system SHALL include `scripts/check-product-type-duplication.mjs` that rejects new local `ImageStatus` unions or base image helper definitions outside the shared module, with a migration allowlist for legacy files.

#### Scenario: New duplicate ImageStatus rejected
- **WHEN** a non-allowlisted file adds a local `ImageStatus` union matching the shared set
- **THEN** the check script fails with a clear message naming the file

#### Scenario: New duplicate helper rejected
- **WHEN** a non-allowlisted file adds local `matchedImage`, `missingImage`, `productPreviewImage`, or `pendingReviewImage`
- **THEN** the check script fails with a clear message

#### Scenario: Allowlisted legacy files pass
- **WHEN** the check scans files in the migration allowlist
- **THEN** it does not fail for those files' existing local definitions

### Requirement: Test coverage
The system SHALL include tests in `src/lib/product-types.test.ts` covering shared types, image builders, alt/slug/id helpers, and the Xiaomi bug fix.

#### Scenario: Image builder tests pass
- **WHEN** `product-types.test.ts` runs
- **THEN** `matchedImage()`, `missingImage()`, `productPreviewImage()`, and `pendingReviewImage()` output is verified

#### Scenario: Helper tests pass
- **WHEN** `product-types.test.ts` runs
- **THEN** `buildProductAlt()`, `makeProductId()`, and `slugifyProductName()` output is verified

#### Scenario: Migrated data tests pass
- **WHEN** tests for migrated product data files run
- **THEN** they verify stable ids, paths, counts, and statuses

### Requirement: Type migration completeness
The system SHALL track remaining non-migrated product files. A follow-up backlog MUST list second-batch files and any domain adapters that should remain separate.

#### Scenario: Backlog documented
- **WHEN** the first batch is complete
- **THEN** tasks.md contains a follow-up batch list with `li-auto-*`, `tesla-products.ts`, `denza-d9-products.ts`, `nio-products.ts`, `gaoshan-products.ts`, `xpeng-gx-products.ts`, `voyah-products.ts`, `zhijie-v9-products.ts`, `ledao-l90-products.ts`

#### Scenario: Domain adapter decision
- **WHEN** first batch is complete
- **THEN** `src/lib/wenjie-preview-images.ts` is evaluated for whether it should re-export from `product-types.ts` or remain a domain adapter
