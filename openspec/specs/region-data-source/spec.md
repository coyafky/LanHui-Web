# region-data-source Specification

## Purpose
TBD - created by archiving change consolidate-region-data-source. Update Purpose after archive.
## Requirements
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

