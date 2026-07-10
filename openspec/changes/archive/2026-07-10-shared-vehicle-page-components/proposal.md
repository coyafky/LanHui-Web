## Why

10+ vehicle product pages independently maintain their own Hero, ProjectGrid, ScenarioMatrix, ServiceFlow, FAQ, BundleList, and MoreChoices components. Adding a new vehicle requires copying 5-8 components; any unified design change requires modifying 10+ files. This is unsustainable.

## What Changes

- Create `src/components/vehicle-page/` directory with shared, data-driven components:
  - `VehicleHero.tsx` — hero section with configurable theme, title, description
  - `ProjectGrid.tsx` — upgrade project grid driven by config array
  - `ScenarioMatrix.tsx` — scenario showcase grid
  - `ServiceFlow.tsx` — service process steps
  - `FaqSection.tsx` — FAQ accordion
  - `BundleList.tsx` — product bundle/category list
  - `VehiclePageRenderer.tsx` — composes all sections from a single VehiclePageConfig
  - `vehicle-page.schema.ts` — Zod schema + TypeScript types for VehiclePageConfig
- Migrate 2-3 vehicles as pilot batch (e.g., xiaomi-yu7, zeekr-9x, nio-es8)
- Keep remaining vehicles using existing components; allowlist for gradual migration
- Each vehicle provides a single config object typed as `VehiclePageConfig`

## Capabilities

### New Capabilities
- `vehicle-page-components`: Shared data-driven vehicle page section components with a typed `VehiclePageConfig` schema. Enables adding new vehicle pages with one config file instead of 5-8 component copies.

### Modified Capabilities
(None — existing vehicle pages keep their current components during migration. No public behavior changes.)

## Impact

- New: `src/components/vehicle-page/` (8 files)
- Modified: 2-3 pilot vehicle page files (e.g., `src/app/product/xiaomi/yu7/page.tsx`)
- Existing: 10+ vehicle pages remain unchanged (migration allowlist)
- No API, database, or routing changes
