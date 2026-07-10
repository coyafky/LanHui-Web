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
