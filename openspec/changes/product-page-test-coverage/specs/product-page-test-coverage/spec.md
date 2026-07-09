# product-page-test-coverage Spec

## ADDED Requirements

### Requirement: Product Page Smoke Tests

All live product pages MUST have at least one smoke test that verifies the page renders without crashing.

#### Scenario: Brand pages have smoke test entries

- **Given** `getLiveBrands()` returns 12 live brands
- **When** the brands smoke test file runs
- **Then** each of the 12 live brand pages has a table-driven test entry that verifies render + brand name

#### Scenario: Model pages have smoke test entries

- **Given** `ALL_MODELS.filter(m => m.status === "live")` returns 16 live models
- **When** the models smoke test file runs
- **Then** each of the 16 live model pages has a table-driven test entry that verifies render + model name

#### Scenario: Service pages have smoke test entries

- **Given** `getLiveServices()` returns 9 live services
- **When** the services smoke test file runs
- **Then** each of the 9 live service pages has a table-driven test entry that verifies render + navLabel

#### Scenario: Index page has smoke test

- **Given** the `/product` index page exists
- **When** the index smoke test file runs
- **Then** `/product` renders without crashing and shows key content sections

#### Scenario: Window-film dynamic route has smoke test

- **Given** `window-film/[packageSlug]` is a dynamic route with 7 known slugs
- **When** the index smoke test file runs
- **Then** the route renders for valid slugs and `notFound` is called for invalid slugs

### Requirement: Route Registry Consistency

The route registry (`product-routes.ts`) MUST be consistent with actual page files on disk.

#### Scenario: Live brand canonicalPath matches page file

- **Given** `ALL_BRANDS` contains live brands with `canonicalPath` values
- **When** each `canonicalPath` is mapped to `src/app<path>/page.tsx`
- **Then** every live brand's page file exists on disk

#### Scenario: Live model canonicalPath matches page file

- **Given** `ALL_MODELS` contains live models with `canonicalPath` values
- **When** each `canonicalPath` is mapped to `src/app<path>/page.tsx`
- **Then** every live model's page file exists on disk

#### Scenario: Live service canonicalPath matches page file

- **Given** `ALL_SERVICES` contains live services with `canonicalPath` values
- **When** each `canonicalPath` is mapped to `src/app<path>/page.tsx`
- **Then** every live service's page file exists on disk

#### Scenario: No duplicate canonicalPath values

- **Given** all canonicalPath values across brands, models, and services
- **When** the set is checked for duplicates
- **Then** no canonicalPath appears more than once

#### Scenario: No legacyPath conflicts with canonicalPath

- **Given** `ALL_LEGACY_ALIASES` contains legacy path mappings
- **When** each `from` path is checked against all canonicalPath values
- **Then** no legacy `from` path conflicts with any canonicalPath

#### Scenario: Planned pages excluded from live coverage

- **Given** `ALL_MODELS` and `ALL_SERVICES` contain planned/coming-soon entries
- **When** live filtering is applied
- **Then** planned entries are not included in `liveModels` or `liveServices`

### Requirement: CI Anti-Regression Check

A CI check script MUST detect when a new live product page is added without corresponding test coverage.

#### Scenario: All live pages covered — exit 0

- **Given** all live product pages have entries in smoke test manifests
- **When** `check:product-page-tests` runs
- **Then** the script exits with code 0

#### Scenario: New live page without test coverage — exit 1

- **Given** a new `page.tsx` exists under `src/app/product/` that is a live page
- **When** the page has no corresponding entry in any smoke test manifest
- **Then** the script exits with code 1 and reports the uncovered path

#### Scenario: Planned pages are excluded

- **Given** planned pages (wenjie/m6, wenjie/m7, wenjie/m8, business-comfort, skid-plate) exist
- **When** the CI script scans all page.tsx files
- **Then** planned pages are reported as skipped, not as failures

### Requirement: Car-Care Test Hygiene

The existing `car-care/page.test.tsx` MUST be updated to use typed imports (no `any`) and shared test utilities.

#### Scenario: No `any` type in page variable

- **Given** car-care's `page.test.tsx` previously used `let Page: any`
- **When** the test file is refactored
- **Then** `Page` is typed with a precise TypeScript type derived from the page module

#### Scenario: Existing test assertions still pass

- **Given** the refactored car-care test
- **When** the test suite runs
- **Then** all car-care test cases pass
