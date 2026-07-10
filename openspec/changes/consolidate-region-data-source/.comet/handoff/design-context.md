# Comet Design Handoff

- Change: consolidate-region-data-source
- Phase: design
- Mode: compact
- Context hash: 40f2e6d65ba27b5943ae7951fbdc1bd41a0caf99a24ad401fd17cbb2993514b0

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/consolidate-region-data-source/proposal.md

- Source: openspec/changes/consolidate-region-data-source/proposal.md
- Lines: 1-29
- SHA256: e4958d0da22658dd5c4167b80210af38959b1192ce17d35755fc2b3eceb5b178

```md
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
```

## openspec/changes/consolidate-region-data-source/design.md

- Source: openspec/changes/consolidate-region-data-source/design.md
- Lines: 1-54
- SHA256: 37d2fa731f25b2fc6f2da1984f5140568bd8235f0e13a737b0fde1cc76844ea5

```md
---
comet_change: consolidate-region-data-source
role: technical-design
canonical_spec: openspec
---

## Source-Of-Truth Decision

Use `src/lib/regions/mainland-regions.ts` as the canonical source.

Reasons:

- It is already consumed by `prisma/seed.ts` and deterministic test fixtures.
- It has dedicated tests covering province counts, excluded HK/Macao/Taiwan data, unique codes/slugs, and city-to-province relationships.
- It stores official administrative codes, typed province/city kinds, and order metadata.
- Its file header documents the intended scope: mainland China only, 31 provinces and 333 city-level units.

`src/lib/china-regions.ts` is a legacy UI cascade. It has a simpler `Region[]` shape and contains hand-maintained children arrays. It should not remain an independent data source.

## Migration Shape

Add derived selectors near the canonical module or in a small adapter module:

- `getMainlandProvinceOptions()`
- `getMainlandCityOptions(provinceSlug)`
- `findMainlandProvince(slug)`
- `findMainlandCity(slug)`
- `buildRegionCascade()` returning the legacy `Region[]` shape

Then make `src/lib/china-regions.ts` either:

1. a compatibility re-export/adapter that derives `regions` from `mainland-regions.ts`, or
2. a deleted file after every import is migrated.

Prefer option 1 for the first implementation pass so downstream code can migrate safely without a large blast radius.

## Stability Rules

- Existing slugs used by stores MUST NOT change.
- Existing Chinese labels used in store records MUST NOT be rewritten by this refactor.
- The public `/api/provinces`, `/api/cities`, and store APIs MUST keep their current response contracts.
- The legacy `Region` type can remain temporarily, but new code MUST import canonical province/city types from `src/lib/regions/mainland-regions.ts`.

## Duplication Guard

Add a lightweight check script that fails when a second large hand-written region array is introduced outside the canonical module or approved adapter.

The guard should allow:

- canonical data in `src/lib/regions/mainland-regions.ts`
- derived adapter output in `src/lib/china-regions.ts`
- test fixtures that import canonical data

It should reject new hand-maintained arrays that duplicate province/city hierarchy data.
```

## openspec/changes/consolidate-region-data-source/tasks.md

- Source: openspec/changes/consolidate-region-data-source/tasks.md
- Lines: 1-42
- SHA256: 935d808c232b85f27d7d11968f8850c6bdabdfd87663f743859c0adfc753c60b

```md
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
```

## openspec/changes/consolidate-region-data-source/specs/region-data-source/spec.md

- Source: openspec/changes/consolidate-region-data-source/specs/region-data-source/spec.md
- Lines: 1-60
- SHA256: 3141ef91a47a7178594020f6872d71414b2a44413589407cd64f6a6dd58bcfbf

```md
## ADDED Requirements

### Requirement: Canonical mainland region source
The system SHALL use `src/lib/regions/mainland-regions.ts` as the canonical source for mainland province and city data.

#### Scenario: Seed imports canonical data
- **WHEN** the database seed script needs province and city fixtures
- **THEN** it imports `MAINLAND_PROVINCES` and `MAINLAND_CITIES` from the canonical module

#### Scenario: Runtime code uses canonical selectors
- **WHEN** runtime code needs province or city options
- **THEN** it uses canonical data or selectors derived from `src/lib/regions/mainland-regions.ts`

### Requirement: Legacy region cascade is derived
The system SHALL NOT maintain `src/lib/china-regions.ts` as an independent hand-written region dataset. Any legacy `Region[]` cascade MUST be derived from the canonical source.

#### Scenario: Legacy import remains compatible
- **WHEN** existing code imports `regions` or `Region` from `src/lib/china-regions.ts`
- **THEN** the import continues to work through a compatibility adapter during migration

#### Scenario: Derived data matches canonical labels
- **WHEN** the legacy cascade is generated
- **THEN** province and city labels come from canonical province and city records

#### Scenario: Derived data matches canonical slugs
- **WHEN** the legacy cascade is generated
- **THEN** province and city values come from canonical slugs

### Requirement: Region data stability
The system SHALL preserve existing slugs, labels, and public API response shapes during consolidation.

#### Scenario: Existing store slugs remain valid
- **WHEN** stores reference an existing `provinceSlug` and `citySlug`
- **THEN** the canonical source can resolve both values

#### Scenario: Public APIs remain stable
- **WHEN** clients call existing province, city, or store APIs
- **THEN** the response field names and label formats remain compatible

### Requirement: Region parity tests
The system SHALL include tests proving the derived legacy cascade stays in sync with canonical region data.

#### Scenario: Province parity
- **WHEN** region parity tests run
- **THEN** every derived province maps to a canonical province by slug and label

#### Scenario: City parity
- **WHEN** region parity tests run
- **THEN** every derived city maps to a canonical city by slug, label, and provinceSlug

### Requirement: Duplicate region data guard
The system SHALL prevent new hand-maintained duplicate region hierarchy files.

#### Scenario: New duplicate region array is rejected
- **WHEN** a non-allowlisted file introduces a large province/city hierarchy array
- **THEN** the duplication guard fails with a message pointing developers to the canonical module

#### Scenario: Canonical module is allowed
- **WHEN** the duplication guard scans `src/lib/regions/mainland-regions.ts`
- **THEN** it allows the canonical province and city arrays
```

