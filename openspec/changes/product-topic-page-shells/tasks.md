## 1. Baseline Audit

- [ ] 1.1 Inventory first-level product topic pages that hand-write hero, JSON-LD, service flow, CTA, or compliance sections
- [ ] 1.2 Inventory model-level topic pages that repeat the same page shell pattern
- [ ] 1.3 Compare `/product/wenjie`, `/product/xiaomi`, `/product/zeekr`, and `/product/flooring` for shared shell fields and page-specific slots
- [ ] 1.4 Choose the brand series pilot, preferring `/product/xiaomi` or `/product/wenjie`
- [ ] 1.5 Choose the service/category pilot, preferring `/product/flooring`
- [ ] 1.6 Record current pilot metadata, headings, JSON-LD shape, CTA links, service steps, and compliance copy

## 2. Shell Types And Config

- [ ] 2.1 Create `src/lib/product-topic-shell/types.ts`
- [ ] 2.2 Define `TopicPageShellConfig` for first-level topic pages
- [ ] 2.3 Define `ModelTopicShellConfig` for model-level topic pages
- [ ] 2.4 Define shared config types for hero, stats, service flow, CTA, compliance, structured data, and accent tokens
- [ ] 2.5 Add config assertion helpers for required fields, unique item ids, and supported accent tokens
- [ ] 2.6 Export shell types and helpers from `src/lib/product-topic-shell/index.ts`

## 3. Structured Data Helpers

- [ ] 3.1 Create `src/lib/product-topic-shell/json-ld.ts`
- [ ] 3.2 Add helper for breadcrumb JSON-LD using existing product breadcrumb data
- [ ] 3.3 Add helper for `ItemList` JSON-LD used by brand series pages
- [ ] 3.4 Add helper for `CollectionPage` JSON-LD used by category pages such as flooring
- [ ] 3.5 Add safe `serializeJsonLd()` helper for script rendering
- [ ] 3.6 Add unit tests for breadcrumb, `ItemList`, `CollectionPage`, and serialization helpers

## 4. Shell Components

- [ ] 4.1 Create `src/components/product-topic-shell/TopicPageShell.tsx`
- [ ] 4.2 Create `src/components/product-topic-shell/ModelTopicShell.tsx`
- [ ] 4.3 Create shared `TopicHeroSection` or hero slot handling
- [ ] 4.4 Create `TopicServiceFlowSection` supporting four-step and six-step layouts
- [ ] 4.5 Create `TopicCtaSection`
- [ ] 4.6 Create `TopicComplianceNote`
- [ ] 4.7 Create `TopicJsonLdScripts`
- [ ] 4.8 Create `TopicSection` for repeated section spacing and heading patterns
- [ ] 4.9 Export shell components from `src/components/product-topic-shell/index.ts`

## 5. Brand Series Pilot Migration

- [ ] 5.1 Build shell config for the selected brand series pilot
- [ ] 5.2 Replace hand-written `main`, JSON-LD scripts, service flow, CTA, and compliance blocks with `TopicPageShell`
- [ ] 5.3 Keep existing domain sections such as featured grid, scenario matrix, submodel grid, and FAQ as slots if they are not yet shared components
- [ ] 5.4 Preserve route path, metadata, primary heading, key hero copy, section order, CTA link targets, and compliance copy
- [ ] 5.5 Add or update tests/smoke checks for the migrated brand series page

## 6. Service Category Pilot Migration

- [ ] 6.1 Build shell config for the selected service/category pilot, preferably flooring
- [ ] 6.2 Replace hand-written `main`, JSON-LD scripts, service flow, and any repeated compliance copy with `TopicPageShell`
- [ ] 6.3 Keep feature grid, structure grid, vehicle groups, and gallery as page-specific slots
- [ ] 6.4 Preserve `CollectionPage` JSON-LD semantics and visible content
- [ ] 6.5 Add or update tests/smoke checks for the migrated service/category page

## 7. Compatibility With Product Topic Components

- [ ] 7.1 Ensure shell slots can render legacy topic components without output changes
- [ ] 7.2 Ensure shell slots can render shared components from `src/components/product-topic` when available
- [ ] 7.3 Document the boundary between `product-topic-shell` and `product-topic` component library
- [ ] 7.4 Avoid creating duplicate hero/project-grid/scenario abstractions in the shell layer

## 8. Duplicate Shell Guard

- [ ] 8.1 Create or extend a check script that detects new product topic pages hand-writing hero, JSON-LD, service flow, CTA, and compliance blocks
- [ ] 8.2 Add an allowlist for existing legacy pages not migrated in this change
- [ ] 8.3 Add a package script such as `check:product-topic-shells`
- [ ] 8.4 Document how a new product topic page should use `TopicPageShell` or `ModelTopicShell`

## 9. Verification

- [ ] 9.1 Run unit tests for product-topic-shell types, assertions, and JSON-LD helpers
- [ ] 9.2 Run shell component render tests
- [ ] 9.3 Run targeted smoke tests for both migrated pilot pages
- [ ] 9.4 Run browser checks at 390px, 768px, and 1440px for both pilot pages
- [ ] 9.5 Run `npm run lint`
- [ ] 9.6 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [ ] 9.7 Run `npm run build`
- [ ] 9.8 Run `npm run check:product-topic-shells`

## 10. Follow-Up Migration Plan

- [ ] 10.1 Rank remaining product topic pages by duplicated shell size and migration risk
- [ ] 10.2 Identify which pages can use `TopicPageShell` directly and which require `ModelTopicShell`
- [ ] 10.3 Record pages that need custom slots before migration
- [ ] 10.4 Update future product-page creation guidance to forbid copying old shell blocks
