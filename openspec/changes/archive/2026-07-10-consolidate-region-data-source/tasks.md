## 1. Baseline Audit

- [x] 1.1 Confirm all imports of `src/lib/china-regions.ts` and `src/lib/regions/mainland-regions.ts` → 0 importers found for china-regions.ts; 3 importers for mainland-regions.ts (seed, fixtures, tests)
- [x] 1.2 Record current province/city API response examples before migration → API routes query DB, not static files; no API response shape changes needed
- [x] 1.3 Record current admin selector behavior for province and city fields → RegionSelector component defines its own types, does not import from china-regions.ts

## 2. Canonical Selectors

- [x] 2.1 Add selector helpers derived from `MAINLAND_PROVINCES` and `MAINLAND_CITIES`
- [x] 2.2 ~~Add a helper that builds the legacy `Region[]` cascade from canonical data~~ → Skipped: no consumers exist, china-regions.ts deleted instead
- [x] 2.3 Keep canonical data arrays immutable from consumer code

## 3. Legacy Adapter

- [x] 3.1 ~~Convert `src/lib/china-regions.ts` into a compatibility adapter~~ → Deleted entirely: zero runtime consumers
- [x] 3.2 ~~Preserve the exported `Region` type and `regions` constant during migration~~ → Not needed: no consumers
- [x] 3.3 ~~Add a deprecation comment telling new code to import from `src/lib/regions/mainland-regions.ts`~~ → Not applicable: file deleted

## 4. Consumer Migration

- [x] 4.1 ~~Update region-consuming code to import canonical selectors where practical~~ → No consumers to migrate
- [x] 4.2 Keep seed and test fixtures on canonical imports → Already the case
- [x] 4.3 Update audit scripts so they do not treat the adapter as a second source of truth → Fixed extractAgentRegion() in collect-routes.mjs

## 5. Tests

- [x] 5.1 Extend `src/lib/regions/mainland-regions.test.ts` for selector behavior → 10 new tests added (26 total)
- [x] 5.2 ~~Add parity tests for the legacy cascade adapter~~ → Not needed: china-regions.ts deleted
- [x] 5.3 ~~Add tests verifying existing store province/city slugs resolve~~ → Covered by existing 16 tests + new selector tests

## 6. Duplication Guard

- [x] 6.1 Add a script that detects new hand-written region hierarchy arrays outside the canonical module
- [x] 6.2 Add an allowlist for the canonical module and compatibility adapter
- [x] 6.3 Wire the guard into a package script or documented verification step → `npm run check:region-duplication` chained into `npm run check`

## 7. Verification

- [x] 7.1 Run `npx vitest run src/lib/regions/mainland-regions.test.ts` → 26/26 passed
- [x] 7.2 ~~Run targeted API tests for provinces, cities, and stores~~ → API routes unaffected (query DB, not static files)
- [x] 7.3 Run `npm run lint` → Only pre-existing errors
- [x] 7.4 Run `npm run typecheck` → Only pre-existing errors (9 in analytics test files)
- [x] 7.5 Run duplication guard → No duplication detected
