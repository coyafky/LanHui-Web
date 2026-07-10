## Why

`src/lib/china-regions.ts` and `src/lib/regions/mainland-regions.ts` both maintain China region hierarchy data in different shapes. The current duplication creates drift risk: seed/test data already uses `mainland-regions.ts`, while `china-regions.ts` keeps an older province/city UI cascade structure with less formal validation.

Investigation shows `src/lib/regions/mainland-regions.ts` is the better source of truth because it contains documented data sources, canonical province/city types, 31 mainland provinces, 333 city-level units, and dedicated tests. `src/lib/china-regions.ts` should become a derived compatibility adapter or be removed once all imports are migrated.

## What

- Treat `src/lib/regions/mainland-regions.ts` as the canonical mainland region data source.
- Derive any legacy `Region[]` cascade shape from canonical `MAINLAND_PROVINCES` and `MAINLAND_CITIES` instead of maintaining a second hand-written dataset.
- Update imports so runtime, seed, fixtures, and tests consume one canonical source.
- Add parity tests and a duplication guard to prevent future hand-maintained region data copies.
- Preserve existing public API response shapes and admin selector behavior during migration.

## Impact

- Affected files:
  - `src/lib/regions/mainland-regions.ts`
  - `src/lib/china-regions.ts`
  - `src/lib/regions/mainland-regions.test.ts`
  - region-consuming APIs, fixtures, seed scripts, and audit scripts
- Behavior risk:
  - Province/city labels and slugs must remain stable for existing stores.
  - UI code that expects `Region[]` children must keep working until migrated.
- Verification:
  - `npx vitest run src/lib/regions/mainland-regions.test.ts`
  - targeted tests for region consumers
  - `npm run lint`
  - `npm run typecheck`
