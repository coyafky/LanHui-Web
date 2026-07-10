## ADDED Requirements

### Requirement: Shared product image types
The system SHALL provide shared product image types in `src/lib/product-types.ts`. Product data files MUST be able to import a common image status type and image object type instead of redefining identical local structures.

#### Scenario: Shared image status is imported
- **WHEN** a migrated product data file needs an image status type
- **THEN** it imports the shared status type or aliases it from `src/lib/product-types.ts`

#### Scenario: Shared image object is imported
- **WHEN** a migrated product data file needs an image object type
- **THEN** it imports the shared image type or aliases it from `src/lib/product-types.ts`

### Requirement: Canonical image status set
The system SHALL define a canonical image status set containing `matched`, `product-preview`, `pending-review`, and `missing`. The system MUST provide a normalization helper for legacy status names.

#### Scenario: Canonical status accepted
- **WHEN** product data uses `matched`, `product-preview`, `pending-review`, or `missing`
- **THEN** the shared image status type accepts the value

#### Scenario: Legacy generated-preview normalized
- **WHEN** product data or migration code passes `generated-preview` into the normalization helper
- **THEN** the helper returns `product-preview`

#### Scenario: Legacy real normalized
- **WHEN** product data or migration code passes `real` into the normalization helper
- **THEN** the helper returns `matched`

#### Scenario: Legacy pending normalized
- **WHEN** product data or migration code passes `pending` into the normalization helper
- **THEN** the helper returns `pending-review`

### Requirement: Public image status labels
The system SHALL provide a shared image status label helper. The helper MUST keep public-facing promotional copy consistent and MUST NOT expose implementation terms such as `generated-preview` to users.

#### Scenario: Preview label
- **WHEN** the label helper receives `product-preview` or legacy `generated-preview`
- **THEN** it returns `商品预览效果图`

#### Scenario: Matched label
- **WHEN** the label helper receives `matched` or legacy `real`
- **THEN** it returns a real/matched image label approved by the current UI copy

#### Scenario: Missing label
- **WHEN** the label helper receives `missing`
- **THEN** it returns a missing image label approved by the current UI copy

### Requirement: Shared image builders
The system SHALL provide shared helper functions for matched images, product preview images, pending-review images, and missing images. These helpers MUST produce the same `ProductImage` shape used by product pages.

#### Scenario: Matched image builder
- **WHEN** a migrated file calls the matched image helper with `publicPath` and `alt`
- **THEN** the helper returns an image object with the same path and alt plus the standard 1448×1086 `4/3` metadata

#### Scenario: Preview image builder
- **WHEN** a migrated file calls the preview image helper with `publicPath` and `alt`
- **THEN** the helper returns an image object with the same path and alt plus the standard 1448×1086 `4/3` metadata

#### Scenario: Missing image builder
- **WHEN** a migrated file calls the missing image helper with an alt value
- **THEN** the helper returns an image object with `publicPath: null` and missing-image metadata compatible with existing UI rendering

#### Scenario: Pending review image builder
- **WHEN** a migrated file calls the pending-review image helper with an alt value
- **THEN** the helper returns an image object with `publicPath: null` and pending-review metadata compatible with existing UI rendering

### Requirement: Shared alt, slug, and id helpers
The system SHALL provide shared helpers for product alt text, product ids, and product-name slugs. The helpers MUST support manual slug overrides for products whose filenames cannot be generated reliably.

#### Scenario: Alt helper includes product context
- **WHEN** the alt helper receives brand, model, product name, and kind
- **THEN** it returns Chinese alt text that includes the relevant product context

#### Scenario: Slug helper supports manual override
- **WHEN** the slug helper receives a name with a manual override
- **THEN** it returns the manual slug instead of a generated fallback

#### Scenario: ID helper returns stable ids
- **WHEN** the id helper receives stable string parts
- **THEN** it returns a deterministic slug-like id suitable for product data

### Requirement: Xiaomi series image status bug fixed
The system SHALL fix the duplicated `missing` union in `src/lib/xiaomi-series-upgrade-projects.ts`. The fixed type MUST not repeat union members and MUST support the intended preview status.

#### Scenario: Xiaomi series status has no duplicate union
- **WHEN** `XiaomiSeriesImageStatus` is inspected after migration
- **THEN** it does not contain duplicate `"missing"` members

#### Scenario: Xiaomi series supports preview status
- **WHEN** Xiaomi series data needs a product preview status
- **THEN** the image status type supports the shared preview status

### Requirement: First migration batch
The system SHALL migrate an initial batch of product data files to the shared type layer. The first batch MUST include the Xiaomi series bug file and at least one complex helper-heavy file.

#### Scenario: Xiaomi series migrated
- **WHEN** the first migration batch is complete
- **THEN** `src/lib/xiaomi-series-upgrade-projects.ts` imports or aliases shared product image types

#### Scenario: Xiaomi SU7 and YU7 migrated
- **WHEN** the first migration batch is complete
- **THEN** the Xiaomi SU7 and YU7 product data files import or alias shared product image types where applicable

#### Scenario: Complex helper file migrated
- **WHEN** the first migration batch is complete
- **THEN** at least one helper-heavy file such as `src/lib/zeekr-products.ts` uses shared image helpers or shared image types

### Requirement: Output stability during migration
The system SHALL preserve existing product data output for migrated files except for intentional image status bug fixes and legacy status normalization.

#### Scenario: Product ids remain stable
- **WHEN** migrated product data is imported
- **THEN** existing product ids remain unchanged

#### Scenario: Product image paths remain stable
- **WHEN** migrated product data is imported
- **THEN** existing non-null image public paths remain unchanged

#### Scenario: Product order remains stable
- **WHEN** migrated product data is imported
- **THEN** existing project ordering remains unchanged

### Requirement: Duplicate type prevention
The system SHALL include a check script that prevents new duplicated product image status unions and local base image helper definitions. The script MUST allow legacy files during migration through an explicit allowlist.

#### Scenario: New duplicated image status is rejected
- **WHEN** a non-allowlisted product data file adds a local `ImageStatus` union duplicating the shared status set
- **THEN** the check script fails with a clear message

#### Scenario: New duplicated image helper is rejected
- **WHEN** a non-allowlisted product data file adds local `matchedImage`, `missingImage`, or `pendingReviewImage` base helper functions
- **THEN** the check script fails with a clear message

#### Scenario: Legacy files remain allowed during migration
- **WHEN** the check script scans legacy files listed in the migration allowlist
- **THEN** it does not fail solely because those files still contain old local definitions

### Requirement: Verification coverage
The system SHALL add tests for shared product data types and the first migration batch. Tests MUST cover status normalization, label mapping, image helper output, and the Xiaomi series status bug.

#### Scenario: Shared helper tests pass
- **WHEN** the product type test suite runs
- **THEN** status normalization, label mapping, and image builder output are verified

#### Scenario: Migrated data tests pass
- **WHEN** tests for migrated product data files run
- **THEN** they verify key ids, paths, counts, and statuses remain stable
