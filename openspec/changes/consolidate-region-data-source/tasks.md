## 1. Baseline Audit

- [ ] 1.1 Confirm all imports of `src/lib/china-regions.ts` and `src/lib/regions/mainland-regions.ts`
- [ ] 1.2 Record current province/city API response examples before migration
- [ ] 1.3 Record current admin selector behavior for province and city fields

## 2. Canonical Selectors

- [ ] 2.1 Add selector helpers derived from `MAINLAND_PROVINCES` and `MAINLAND_CITIES`
- [ ] 2.2 Add a helper that builds the legacy `Region[]` cascade from canonical data
- [ ] 2.3 Keep canonical data arrays immutable from consumer code

## 3. Legacy Adapter

- [ ] 3.1 Convert `src/lib/china-regions.ts` into a compatibility adapter
- [ ] 3.2 Preserve the exported `Region` type and `regions` constant during migration
- [ ] 3.3 Add a deprecation comment telling new code to import from `src/lib/regions/mainland-regions.ts`

## 4. Consumer Migration

- [ ] 4.1 Update region-consuming code to import canonical selectors where practical
- [ ] 4.2 Keep seed and test fixtures on canonical imports
- [ ] 4.3 Update audit scripts so they do not treat the adapter as a second source of truth

## 5. Tests

- [ ] 5.1 Extend `src/lib/regions/mainland-regions.test.ts` for selector behavior
- [ ] 5.2 Add parity tests for the legacy cascade adapter
- [ ] 5.3 Add tests verifying existing store province/city slugs resolve

## 6. Duplication Guard

- [ ] 6.1 Add a script that detects new hand-written region hierarchy arrays outside the canonical module
- [ ] 6.2 Add an allowlist for the canonical module and compatibility adapter
- [ ] 6.3 Wire the guard into a package script or documented verification step

## 7. Verification

- [ ] 7.1 Run `npx vitest run src/lib/regions/mainland-regions.test.ts`
- [ ] 7.2 Run targeted API tests for provinces, cities, and stores
- [ ] 7.3 Run `npm run lint`
- [ ] 7.4 Run `npm run typecheck`
