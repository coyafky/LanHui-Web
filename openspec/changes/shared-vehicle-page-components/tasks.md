## 1. Schema Foundation

- [x] 1.1 Create `src/components/vehicle-page/vehicle-page.schema.ts` with Zod schemas
- [x] 1.2 Define `VehiclePageConfig`, `HeroConfig`, `ProjectConfig`, `ScenarioConfig`, `ServiceFlowConfig`, `FaqItemConfig`, `BundleConfig`
- [x] 1.3 Export inferred TypeScript types alongside Zod schemas
- [x] 1.4 Create `src/components/vehicle-page/index.ts` barrel export

## 2. Shared Components

- [x] 2.1 Create `VehicleHero.tsx` — theme-aware hero section
- [x] 2.2 Create `ProjectGrid.tsx` — upgrade project grid from config
- [x] 2.3 Create `ScenarioMatrix.tsx` — scenario showcase
- [x] 2.4 Create `ServiceFlow.tsx` — service process steps
- [x] 2.5 Create `FaqSection.tsx` — FAQ accordion
- [x] 2.6 Create `BundleList.tsx` — product bundle list
- [x] 2.7 Create `VehiclePageRenderer.tsx` — composes all sections

## 3. Pilot: Xiaomi YU7 Migration

- [x] 3.1 Create `src/lib/xiaomi-yu7-page-config.ts` from existing xiaomi-yu7 page data
- [x] 3.2 Update `src/app/product/xiaomi/yu7/page.tsx` to use `VehiclePageRenderer`
- [x] 3.3 Verify visual output matches pre-migration

## 4. Pilot: ZEEKR 9X Migration

- [x] 4.1 Create `src/lib/zeekr-9x-page-config.ts` from existing zeekr-9x page data
- [x] 4.2 Update `src/app/product/zeekr/9x/page.tsx` to use `VehiclePageRenderer`
- [x] 4.3 Verify visual output matches pre-migration

## 5. Verification

- [x] 5.1 Run `npm run typecheck`
- [x] 5.2 Run `npm run lint`
- [x] 5.3 Run relevant product page tests
- [x] 5.4 Visual check: xiaomi-yu7 at 390/768/1440px
- [x] 5.5 Visual check: zeekr-9x at 390/768/1440px
