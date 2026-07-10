---
comet_change: shared-vehicle-page-components
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-10-shared-vehicle-page-components
status: final
---

# Design Doc: Shared Vehicle Page Components

## Context

10+ vehicle product pages independently maintain brand-specific Hero, ProjectGrid, ScenarioMatrix, ServiceFlow, FAQ, BundleList components. These share 80-90% identical structure — only data and theme colors differ. Adding a vehicle requires copying 5-8 components.

## Goals / Non-Goals

**Goals:**
- Create `src/components/vehicle-page/` with 7 shared data-driven components
- Define Zod-validated `VehiclePageConfig` schema
- Pilot migration on xiaomi-yu7 + zeekr-9x
- 2-3 visual templates (theme-aware, not brand-locked)

**Non-Goals:**
- Do not change visual output of any page
- Do not modify product data files
- Do not touch routing
- Do not migrate all vehicles at once

## Decisions

### 1: Zod Schema + TypeScript Inference

`vehicle-page.schema.ts` defines `VehiclePageConfig` via Zod, exporting both the schema object (for runtime validation) and inferred TypeScript types. Config files use `satisfies VehiclePageConfig`.

### 2: Component-Per-Section Architecture

Each section is a standalone file: `VehicleHero`, `ProjectGrid`, `ScenarioMatrix`, `ServiceFlow`, `FaqSection`, `BundleList`. Each accepts `theme` prop for consistent accent coloring.

### 3: VehiclePageRenderer as Composition Entry

`VehiclePageRenderer` receives `VehiclePageConfig` and renders all sections. Pages import once: `<VehiclePageRenderer config={xiaomiYu7Config} />`.

### 4: Theme System

7 theme colors map to Tailwind classes via a `THEME_MAP` constant: orange→orange, cyan→cyan, amber→amber, blue→blue, green→green, red→red, neutral→zinc.

### 5: Pilot Batch

xiaomi-yu7 (existing orange theme, suite of all sections) + zeekr-9x (largest product count, orange theme). Success criteria: visual output identical to pre-migration.

## Files Changed

| Category | Files |
|----------|-------|
| New | `src/components/vehicle-page/` (8 files) |
| New | `src/lib/xiaomi-yu7-page-config.ts` |
| New | `src/lib/zeekr-9x-page-config.ts` |
| Modified | `src/app/product/xiaomi/yu7/page.tsx` |
| Modified | `src/app/product/zeekr/9x/page.tsx` |

