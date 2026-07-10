# Comet Design Handoff

- Change: shared-vehicle-page-components
- Phase: design
- Mode: compact
- Context hash: fe17b8ed774c5319a7c82f14f746853ece5dc530f06d5953413cf11f9f99a178

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/shared-vehicle-page-components/proposal.md

- Source: openspec/changes/shared-vehicle-page-components/proposal.md
- Lines: 1-33
- SHA256: 66443e8902cd02e9bdda6072bb2708ba13f5596677e69f730d0c36300df78a9d

```md
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

```

## openspec/changes/shared-vehicle-page-components/design.md

- Source: openspec/changes/shared-vehicle-page-components/design.md
- Lines: 1-54
- SHA256: a87e07f514ec993c119b64edcf1757b17cf193dce83f6cae8c379f98b60bca0e

```md
## Context

10+ vehicle pages (xiaomi, zeekr, wenjie, tesla, denza, nio, gaoshan, xpeng, voyah, zhijie, ledao) each maintain their own brand-specific Hero, ProjectGrid, ScenarioMatrix, ServiceFlow, FAQ, and BundleList components. These components share 80-90% identical structure with only data and theme colors differing.

## Goals / Non-Goals

**Goals:**
- Create shared `vehicle-page/` component library that renders from a typed config
- Each vehicle provides 1 config object satisfying `VehiclePageConfig` 
- Support theme colors (orange, cyan, amber, blue, etc.) per config
- Pilot migration on 2-3 vehicles to validate the pattern
- Keep 2-3 visual layout templates to maintain design flexibility

**Non-Goals:**
- Do not change any vehicle page's visual appearance
- Do not modify product data files (`*-products.ts`)
- Do not touch routing or SSR strategy
- Do not migrate all vehicles in one batch

## Decisions

### 1: Zod Schema for VehiclePageConfig

Define a `vehicle-page.schema.ts` with `VehiclePageConfig` type inferred from Zod. This provides runtime validation for config objects and auto-completion in editors.

```ts
const VehiclePageConfig = z.object({
  theme: z.enum(["orange", "cyan", "amber", "blue", "green"]),
  hero: z.object({ title, subtitle, description, badge }),
  projects: z.array(ProjectSchema),
  scenarios: z.array(ScenarioSchema),
  serviceFlow: ServiceFlowConfig,
  faq: z.array(FaqItemSchema),
  bundles: z.array(BundleSchema),
});
```

### 2: VehiclePageRenderer as Composition Layer

`VehiclePageRenderer.tsx` receives a `VehiclePageConfig` and renders all sections in order. This is the single entry point for vehicle pages.

### 3: Component-Centric Distribution

Each shared component is a standalone file under `vehicle-page/`. They are individually importable for pages that don't need all sections (e.g., some vehicles may skip bundles).

### 4: Pilot Batch: xiaomi-yu7 + zeekr-9x

Start with 2 vehicles that represent different visual template needs. Add nio-es8 later if the pattern holds.

## Risks / Trade-offs

- [Risk] Shared components may not cover all existing visual edge cases → Mitigation: allow 1-2 additional props per component for variant support
- [Risk] Large config objects → Mitigation: split into sub-configs per section; TypeScript ensures completeness
- [Risk] Existing tests tied to old components → Mitigation: update tests alongside migration; verify visual output stability

```

## openspec/changes/shared-vehicle-page-components/tasks.md

- Source: openspec/changes/shared-vehicle-page-components/tasks.md
- Lines: 1-36
- SHA256: 68a097a7909ae6a67679c95fe57f8c4b31eeaa3f661437060c14582aeb118ea6

```md
## 1. Schema Foundation

- [ ] 1.1 Create `src/components/vehicle-page/vehicle-page.schema.ts` with Zod schemas
- [ ] 1.2 Define `VehiclePageConfig`, `HeroConfig`, `ProjectConfig`, `ScenarioConfig`, `ServiceFlowConfig`, `FaqItemConfig`, `BundleConfig`
- [ ] 1.3 Export inferred TypeScript types alongside Zod schemas
- [ ] 1.4 Create `src/components/vehicle-page/index.ts` barrel export

## 2. Shared Components

- [ ] 2.1 Create `VehicleHero.tsx` — theme-aware hero section
- [ ] 2.2 Create `ProjectGrid.tsx` — upgrade project grid from config
- [ ] 2.3 Create `ScenarioMatrix.tsx` — scenario showcase
- [ ] 2.4 Create `ServiceFlow.tsx` — service process steps
- [ ] 2.5 Create `FaqSection.tsx` — FAQ accordion
- [ ] 2.6 Create `BundleList.tsx` — product bundle list
- [ ] 2.7 Create `VehiclePageRenderer.tsx` — composes all sections

## 3. Pilot: Xiaomi YU7 Migration

- [ ] 3.1 Create `src/lib/xiaomi-yu7-page-config.ts` from existing xiaomi-yu7 page data
- [ ] 3.2 Update `src/app/product/xiaomi/yu7/page.tsx` to use `VehiclePageRenderer`
- [ ] 3.3 Verify visual output matches pre-migration

## 4. Pilot: ZEEKR 9X Migration

- [ ] 4.1 Create `src/lib/zeekr-9x-page-config.ts` from existing zeekr-9x page data
- [ ] 4.2 Update `src/app/product/zeekr/9x/page.tsx` to use `VehiclePageRenderer`
- [ ] 4.3 Verify visual output matches pre-migration

## 5. Verification

- [ ] 5.1 Run `npm run typecheck`
- [ ] 5.2 Run `npm run lint`
- [ ] 5.3 Run relevant product page tests
- [ ] 5.4 Visual check: xiaomi-yu7 at 390/768/1440px
- [ ] 5.5 Visual check: zeekr-9x at 390/768/1440px

```

## openspec/changes/shared-vehicle-page-components/specs/vehicle-page-components/spec.md

- Source: openspec/changes/shared-vehicle-page-components/specs/vehicle-page-components/spec.md
- Lines: 1-48
- SHA256: 6822e8acbb531854d9ae5d4a1a5bc3731b54034b7ccbd782187edf76d6cc5c59

```md
## ADDED Requirements

### Requirement: VehiclePageConfig schema
The system SHALL provide a Zod-validated `VehiclePageConfig` type that defines the complete data structure for a vehicle product page. Each vehicle MUST provide a single config object conforming to this schema.

#### Scenario: Config defines theme
- **WHEN** a vehicle config sets `theme: "orange"`
- **THEN** the rendered page uses orange accent colors for buttons, badges, and links

#### Scenario: Config defines all sections
- **WHEN** a vehicle config includes hero, projects, scenarios, serviceFlow, faq, and bundles
- **THEN** `VehiclePageRenderer` renders all six sections in order

#### Scenario: Config omits optional section
- **WHEN** a vehicle config does not include bundles
- **THEN** the BundleList section is not rendered

### Requirement: Shared VehicleHero component
The system SHALL provide a `VehicleHero` component that renders from hero config data. It MUST support theme-aware styling and responsive layout.

#### Scenario: Theme-aware hero
- **WHEN** `VehicleHero` receives `theme: "cyan"` with hero config
- **THEN** the hero section uses cyan accent colors for badges and decorative elements

### Requirement: Shared service sections
The system SHALL provide `ProjectGrid`, `ScenarioMatrix`, `ServiceFlow`, `FaqSection`, and `BundleList` components, each driven by their respective config arrays. Each MUST accept `theme` for consistent styling.

#### Scenario: ProjectGrid renders all upgrade projects
- **WHEN** ProjectGrid receives 10 project items
- **THEN** it renders 10 project cards in the configured layout

### Requirement: VehiclePageRenderer composition
The system SHALL provide a `VehiclePageRenderer` that accepts a `VehiclePageConfig` and composes all sections with consistent spacing and theming. It MUST be usable as a single component in a vehicle page route.

#### Scenario: Single component entry
- **WHEN** a page imports `<VehiclePageRenderer config={xiaomiYu7Config} />`
- **THEN** it renders the complete Xiaomi YU7 page with hero, grid, flow, FAQ, and bundles

### Requirement: Pilot migration
The system SHALL migrate at least 2 existing vehicle pages to use the shared component system as proof of concept.

#### Scenario: Xiaomi YU7 migrated
- **WHEN** the xiaomi-yu7 page is rendered through VehiclePageRenderer
- **THEN** the visual output matches the pre-migration page

#### Scenario: ZEEKR 9X migrated
- **WHEN** the zeekr-9x page is rendered through VehiclePageRenderer  
- **THEN** the visual output matches the pre-migration page

```
