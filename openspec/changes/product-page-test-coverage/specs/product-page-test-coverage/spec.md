# product-page-test-coverage Spec

## ADDED Requirements

### REQ-TEST-COVERAGE-01: Product Page Smoke Tests

All live product pages MUST have at least one smoke test that verifies the page renders without crashing.

**Acceptance:**
- 12 live brand pages each have a smoke test entry
- 16 live model pages each have a smoke test entry
- 10 live service pages each have a smoke test entry
- `/product` index page has a smoke test entry
- `window-film/[packageSlug]` dynamic route has a smoke test

### REQ-TEST-COVERAGE-02: Route Registry Consistency

The route registry (`product-routes.ts`) MUST be consistent with actual page files on disk.

**Acceptance:**
- Every live brand canonicalPath has a corresponding `page.tsx`
- Every live model canonicalPath has a corresponding `page.tsx`
- Every live service canonicalPath has a corresponding `page.tsx`
- No duplicate canonicalPath values exist
- No legacyPath conflicts with canonicalPath
- Planned pages are excluded from live coverage requirements

### REQ-TEST-COVERAGE-03: CI Anti-Regression

A CI check script MUST detect when a new live product page is added without corresponding test coverage.

**Acceptance:**
- `check:product-page-tests` script scans all `src/app/product/**/page.tsx`
- Excludes planned/hidden pages
- Fails (exit 1) when a live page has no test coverage entry
- Passes (exit 0) when all live pages are covered

### REQ-TEST-COVERAGE-04: Car-Care Test Hygiene

The existing `car-care/page.test.tsx` MUST be updated to use typed imports (no `any`) and shared test utilities.

**Acceptance:**
- `let Page: any` is replaced with a precise type
- Test still passes with same assertions
- Uses `src/test/product-page-test-utils.tsx` for shared mocks
