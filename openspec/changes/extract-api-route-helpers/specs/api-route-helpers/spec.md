## ADDED Requirements

### Requirement: Shared pagination helper
The system SHALL provide a shared helper for API pagination parsing and pagination metadata.

#### Scenario: Missing pagination uses defaults
- **WHEN** `page` and `limit` are absent
- **THEN** the helper returns page `1`, limit `20`, skip `0`, and take `20`

#### Scenario: Pagination is clamped
- **WHEN** `page` is below `1` or `limit` is outside the allowed range
- **THEN** the helper clamps values to the existing API bounds

#### Scenario: Pagination metadata is consistent
- **WHEN** a route has `page`, `limit`, and `total`
- **THEN** the helper returns metadata with consistent `totalPages`

### Requirement: Shared store region label resolver
The system SHALL provide a shared helper for validating store province/city slugs and resolving canonical labels from the database.

#### Scenario: Valid region returns canonical labels
- **WHEN** a route passes an active province and an active city that belongs to that province
- **THEN** the helper returns the DB `provinceLabel` and `cityLabel`

#### Scenario: Missing or inactive province returns current error details
- **WHEN** the province does not exist or is inactive
- **THEN** the route returns status `400` with `details.provinceSlug` containing `请选择已开通的省份`

#### Scenario: Missing, inactive, or mismatched city returns current error details
- **WHEN** the city does not exist, is inactive, or does not belong to the province
- **THEN** the route returns status `400` with `details.citySlug` containing `所选城市暂未开通或不属于所选省份`

#### Scenario: Partial update uses existing values
- **WHEN** PUT or PATCH passes only one of `provinceSlug` or `citySlug`
- **THEN** the helper resolves the missing slug from the existing store before validation

### Requirement: Shared article action helper
The system SHALL share article action update-data and revalidation logic between single-action and bulk-action routes.

#### Scenario: Sticky action update data
- **WHEN** an article action is `sticky`
- **THEN** the shared helper returns update data that sets `isSticky` to `true`

#### Scenario: Unsticky action update data
- **WHEN** an article action is `unsticky`
- **THEN** the shared helper returns update data that sets `isSticky` to `false`

#### Scenario: Publish backfills publishedAt
- **WHEN** an article is published or republished and has no `publishedAt`
- **THEN** the shared helper includes a new `publishedAt` value

#### Scenario: Existing publishedAt is preserved
- **WHEN** an article is published or republished and already has `publishedAt`
- **THEN** the shared helper does not overwrite it

#### Scenario: Revalidation paths are consistent
- **WHEN** a single or bulk article action succeeds
- **THEN** public news paths and admin article paths are revalidated consistently

### Requirement: Route behavior remains compatible
The system SHALL preserve existing response envelopes, status codes, and permission/security checks while extracting helpers.

#### Scenario: Store route errors remain compatible
- **WHEN** a store create/update validation failure occurs
- **THEN** the response keeps the existing `{ success, error, details }` shape

#### Scenario: Article route security remains unchanged
- **WHEN** an article action route handles a write request
- **THEN** existing auth, role, CSRF, and rate-limit checks still run before mutation

#### Scenario: GET route pagination remains compatible
- **WHEN** clients call article or store list APIs
- **THEN** pagination response fields remain `page`, `limit`, `total`, and `totalPages`

### Requirement: Duplication removal
The system SHALL remove repeated implementations from the affected API routes after helpers are introduced.

#### Scenario: Store region logic is not copied
- **WHEN** store POST, PUT, and PATCH are inspected
- **THEN** they call the shared region resolver instead of each owning duplicate province/city validation blocks

#### Scenario: Article action logic is not copied
- **WHEN** article single-action and bulk-action routes are inspected
- **THEN** they call shared article action helpers instead of each owning duplicate `getUpdateData()` and `revalidateArticlePaths()` implementations
