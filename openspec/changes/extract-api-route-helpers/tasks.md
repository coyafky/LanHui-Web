## 1. Baseline Audit

- [ ] 1.1 Record current pagination parsing behavior in store and article GET routes
- [ ] 1.2 Record current store region error responses for POST, PUT, and PATCH
- [ ] 1.3 Record current article action update-data and revalidation behavior in single and bulk routes

## 2. Pagination Helpers

- [ ] 2.1 Add `parsePaginationParams()` with current defaults and clamp bounds
- [ ] 2.2 Add `buildPaginationMeta()`
- [ ] 2.3 Update `src/app/api/stores/route.ts` GET to use the helper
- [ ] 2.4 Update `src/app/api/articles/route.ts` GET to use the helper

## 3. Store Region Helper

- [ ] 3.1 Add `resolveStoreRegionLabels()` or equivalent helper
- [ ] 3.2 Preserve current validation messages and details keys
- [ ] 3.3 Update store POST to use the helper
- [ ] 3.4 Update store PUT to use the helper
- [ ] 3.5 Update store PATCH to use the helper
- [ ] 3.6 Keep flagship uniqueness checks using the same final target province/city/level values

## 4. Article Action Helpers

- [ ] 4.1 Add shared article action update-data helper
- [ ] 4.2 Add shared article revalidation helper
- [ ] 4.3 Update `src/app/api/articles/[id]/[action]/route.ts`
- [ ] 4.4 Update `src/app/api/articles/bulk/route.ts`
- [ ] 4.5 Preserve existing role, CSRF, rate-limit, transition, and publish-field checks

## 5. Tests

- [ ] 5.1 Add unit tests for pagination helper defaults, clamping, skip/take, and totalPages
- [ ] 5.2 Add unit tests for store region helper valid and invalid cases
- [ ] 5.3 Add unit tests for article action helper update data
- [ ] 5.4 Update affected route tests only where imports or helper mocks require changes

## 6. Duplication Guard

- [ ] 6.1 Add a lightweight check or test that catches reintroduced local `getUpdateData()` and `revalidateArticlePaths()` in article route files
- [ ] 6.2 Add a check or test that catches copied store province/city validation blocks in store route files

## 7. Verification

- [ ] 7.1 Run targeted store API tests
- [ ] 7.2 Run targeted article API tests
- [ ] 7.3 Run helper unit tests
- [ ] 7.4 Run `npm run lint`
- [ ] 7.5 Run `npm run typecheck`
