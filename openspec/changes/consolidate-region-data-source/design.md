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
