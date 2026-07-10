## ADDED Requirements

### Requirement: Clear image module naming
The system SHALL expose the static asset registry from `src/lib/image-registry.ts`.

#### Scenario: Registry import uses clear name
- **WHEN** a component needs `ImageAsset` or registered image assets
- **THEN** it imports from `@/lib/image-registry`

#### Scenario: Entity image helper remains separate
- **WHEN** code needs store or city placeholder resolution
- **THEN** it imports from `@/lib/image`

### Requirement: Registry exports remain stable
The system SHALL preserve the existing static image registry export contract during the rename.

#### Scenario: Asset type preserved
- **WHEN** code imports `ImageAsset` from `@/lib/image-registry`
- **THEN** the type contains the same fields as the previous registry module

#### Scenario: Image props helper preserved
- **WHEN** code calls `getImageProps()` with an existing asset
- **THEN** the returned props match the previous output

#### Scenario: Asset data preserved
- **WHEN** the registry is imported after the rename
- **THEN** existing asset paths, alt text, dimensions, priority flags, and sizes values are unchanged

### Requirement: Ambiguous import prevention
The system SHALL prevent new imports from the ambiguous `@/lib/images` module.

#### Scenario: New ambiguous import is rejected
- **WHEN** a non-compatibility file imports `@/lib/images`
- **THEN** the import guard fails with a message telling developers to use `@/lib/image-registry`

#### Scenario: Compatibility shim is allowed
- **WHEN** `src/lib/images.ts` re-exports from `src/lib/image-registry.ts`
- **THEN** the import guard allows that file during the migration window

### Requirement: Compatibility shim has no duplicate data
If `src/lib/images.ts` remains during migration, it SHALL only re-export from `src/lib/image-registry.ts`.

#### Scenario: Shim contains no registry objects
- **WHEN** the compatibility shim is inspected
- **THEN** it does not define its own `homeImages`, `productImages`, `brandImages`, `storeImages`, or `certImages`
