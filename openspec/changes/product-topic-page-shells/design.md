## Context

Product topic pages are repeating page-level orchestration across multiple route files:

- `/product/wenjie` and `/product/xiaomi` both compose series hero, featured grid, scenario matrix, sub-model grid, service flow, FAQ, bottom CTA, compliance copy, `ItemList` JSON-LD, and breadcrumb JSON-LD.
- `/product/zeekr` and `/product/flooring` hand-write their hero section, product/category groups, service flow, structured data, and disclaimers.
- The existing `product-topic-component-system` change targets reusable modules such as shared hero, project grid, FAQ, scenario matrix, and tracking components. It does not cover the page-level shell: `main` layout, section ordering, JSON-LD, CTA, compliance copy, or service/category topic pages such as flooring.

This change introduces a complementary page-shell layer. The shell owns stable page choreography, while module components remain replaceable and page-specific content stays possible through slots.

## Goals / Non-Goals

**Goals:**

- Create reusable product topic page shells for first-level topic pages and model-level topic pages.
- Centralize JSON-LD generation for breadcrumb schema, `ItemList`, and `CollectionPage`.
- Centralize common bottom CTA, compliance/disclaimer copy, and service flow rendering.
- Keep product topic pages data-driven through typed configs.
- Migrate at least two pilot pages: one brand series topic and one service/category topic.
- Preserve existing route paths, metadata, page headings, key content, visual theme, and SEO meaning.

**Non-Goals:**

- Do not migrate every product topic page in the first implementation.
- Do not replace the separate `product-topic-component-system`; this change composes with it.
- Do not force all topics into identical content sections.
- Do not change source product data files unless a small adapter is needed.
- Do not change public product URLs or sitemap behavior.

## Decisions

### Decision 1: Use Two Shell Levels

Add two shells:

- `TopicPageShell`: first-level pages such as `/product/xiaomi`, `/product/wenjie`, `/product/zeekr`, `/product/flooring`.
- `ModelTopicShell`: model-level pages such as `/product/xiaomi/su7`, `/product/wenjie/m7`, and future model routes.

Rationale: first-level topic pages often aggregate submodels or product groups, while model pages focus on one model's projects. A single shell would become too conditional.

### Decision 2: Shell Owns Page Choreography, Not Every Section

The shell should own:

- `main id="main-content"` and accessibility attributes
- common hero wrapper or hero slot
- ordered section rendering
- service flow section
- bottom CTA section
- compliance/disclaimer section
- JSON-LD script rendering

The shell should not own every domain-specific section. It must allow slots for:

- featured grid
- scenario matrix
- submodel grid
- product/model groups
- gallery
- feature/structure grids
- bespoke page sections

### Decision 3: Typed Config + Render Slots

Define a config type in `src/lib/product-topic-shell/types.ts` and render slots through React nodes or render functions:

```ts
export type TopicPageShellConfig = {
  routePath: string;
  accent: "orange" | "amber" | "cyan" | "red" | "blue" | "emerald";
  hero: TopicHeroConfig;
  structuredData: TopicStructuredDataConfig;
  serviceFlow?: TopicServiceFlowConfig;
  cta?: TopicCtaConfig;
  compliance?: TopicComplianceConfig;
};
```

The route file remains responsible for assembling data, but should shrink to:

1. load static config/data
2. build page config
3. pass slots/sections to `TopicPageShell`

### Decision 4: JSON-LD Helpers Are Pure Functions

Add pure helpers for:

- `buildProductTopicItemListJsonLd()`
- `buildProductTopicCollectionJsonLd()`
- `buildProductTopicBreadcrumbJsonLd()`
- `serializeJsonLd()`

Rationale: JSON-LD output is SEO-sensitive and should be testable without rendering the full page.

### Decision 5: Shell Integrates With Product Topic Components

When shared components from `product-topic-component-system` exist, page shells should use them for hero, service flow, FAQ, project grid, and scenario matrix. Until then, shells can accept slots that render legacy components.

Rationale: this avoids blocking page-shell work on the broader component migration and prevents duplicate abstractions from competing.

### Decision 6: Pilot Pages Cover Two Different Shapes

Pilot A: brand series topic, preferably `/product/xiaomi` or `/product/wenjie`.

Pilot B: service/category topic, preferably `/product/flooring`.

Rationale: a brand series page validates submodel/featured/scenario/FAQ composition; flooring validates non-vehicle category pages, `CollectionPage` schema, gallery/feature slots, and service flow reuse.

## Proposed Structure

```txt
src/components/product-topic-shell/
  TopicPageShell.tsx
  ModelTopicShell.tsx
  TopicHeroSection.tsx
  TopicServiceFlowSection.tsx
  TopicCtaSection.tsx
  TopicComplianceNote.tsx
  TopicJsonLdScripts.tsx
  TopicSection.tsx
  index.ts

src/lib/product-topic-shell/
  types.ts
  json-ld.ts
  config-assertions.ts
  topic-page-configs.ts
  index.ts
```

Example route shape:

```tsx
export default function XiaomiTopicPage() {
  const config = buildXiaomiTopicShellConfig();

  return (
    <TopicPageShell config={config}>
      <XiaomiSeriesFeaturedGrid projects={config.featuredProjects} />
      <XiaomiSeriesScenarioMatrix scenarios={config.scenarios} />
      <XiaomiSeriesSubModelsGrid subModels={config.subModels} />
      <XiaomiSeriesFaq items={config.faq} />
    </TopicPageShell>
  );
}
```

## Risks / Trade-offs

- [Risk] The shell becomes too rigid for unique pages.
  → Mitigation: use slots/children for domain sections and keep only repeated page infrastructure inside the shell.

- [Risk] JSON-LD changes accidentally alter SEO semantics.
  → Mitigation: add snapshot or structural tests for generated JSON-LD for migrated pages.

- [Risk] Shell and shared component library overlap.
  → Mitigation: define shell as page orchestration; define component system as reusable visual/interactive modules.

- [Risk] First migration increases abstraction without reducing enough code.
  → Mitigation: require two pilot pages and compare route-file line count and duplicated blocks before/after.

- [Risk] Tailwind accent styles are lost if generated dynamically.
  → Mitigation: reuse controlled accent token maps and static class maps.

## Migration Plan

1. Add shell types and pure JSON-LD helpers.
2. Add shared shell components with slot support.
3. Migrate one brand series pilot.
4. Migrate one service/category pilot.
5. Add tests for JSON-LD helpers, config assertions, and pilot pages.
6. Add a duplication guard or checklist to discourage new hand-written page shells.

Rollback:

- Revert pilot page route files to previous explicit composition.
- Leave shell components unused until the design is corrected.
- Keep JSON-LD helpers isolated so they can be rolled back without touching product data.
