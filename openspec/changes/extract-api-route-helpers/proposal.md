## Why

Several API routes repeat the same implementation patterns:

- store POST, PUT, and PATCH each validate province/city slugs against the database and overwrite labels from DB records
- article single action and bulk action both define `getUpdateData()` and `revalidateArticlePaths()`
- article GET and store GET both parse `page`, `limit`, `skip`, and pagination response metadata by hand

This increases maintenance risk: changing validation, pagination bounds, or article revalidation behavior requires editing multiple route files.

## What

- Add scoped shared helpers in `src/lib/api-helpers.ts` or a small `src/lib/api-helpers/` folder.
- Extract pagination parsing and response metadata generation.
- Extract store region validation and canonical label resolution.
- Extract article action update-data generation and article path revalidation.
- Update the affected API routes to call the shared helpers while preserving response shapes and status codes.
- Add focused unit tests for helpers and targeted route tests to prove behavior did not change.

## Impact

- Affected files:
  - `src/app/api/stores/route.ts`
  - `src/app/api/stores/[id]/route.ts`
  - `src/app/api/articles/route.ts`
  - `src/app/api/articles/[id]/[action]/route.ts`
  - `src/app/api/articles/bulk/route.ts`
  - new `src/lib/api-helpers.ts` or helper folder
- Behavior risk:
  - Error response details must remain compatible with admin form handling.
  - Pagination defaults and max limits must remain stable unless explicitly changed.
  - Article publish/sticky revalidation must still cover public and admin paths.
- Verification:
  - targeted API route tests for stores and articles
  - helper unit tests
  - `npm run lint`
  - `npm run typecheck`
