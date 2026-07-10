## Why

Product topic pages are now duplicating page-level composition, not only individual components. `wenjie`, `xiaomi`, `zeekr`, and `flooring` repeat hero layout, breadcrumb JSON-LD, item-list JSON-LD, service flow, CTA, compliance copy, section spacing, and page chrome. As more brands and models go live, every SEO, accessibility, CTA, or compliance adjustment will require many manual edits.

## What Changes

- Introduce shared product topic page shells:
  - `TopicPageShell` for first-level brand/service topic pages such as `/product/xiaomi`, `/product/wenjie`, `/product/zeekr`, and `/product/flooring`.
  - `ModelTopicShell` for model-level topic pages such as `/product/xiaomi/su7`, `/product/wenjie/m7`, or future model pages.
- Define a typed page configuration contract covering:
  - route identity and breadcrumb path
  - hero copy and media
  - stats/chips
  - structured data type and item list generation
  - service flow
  - CTA section
  - compliance/disclaimer copy
  - ordered page sections and extension slots
- Centralize JSON-LD helpers for product topic pages so breadcrumb schema and `ItemList` / `CollectionPage` schema do not stay hand-written per page.
- Centralize shared service flow, CTA, and compliance disclaimer rendering.
- Migrate two representative pilot pages:
  - one brand series topic such as `/product/xiaomi` or `/product/wenjie`
  - one service/category topic such as `/product/flooring`
- Keep compatibility with the existing `product-topic-component-system` change: shared shell components MAY compose the shared product-topic components when those are available, but this shell change focuses on page-level orchestration.
- Preserve existing public routes, metadata, headings, key copy, CTA targets, JSON-LD meaning, and visual theme.

## Capabilities

### New Capabilities

- `product-topic-page-shells`: Defines reusable product topic page shells, typed page configuration, shared structured-data helpers, shared CTA/compliance/service-flow sections, and pilot migration requirements.

### Modified Capabilities

- None.

## Impact

- New or changed files:
  - `src/components/product-topic-shell/`
  - `src/lib/product-topic-shell/`
  - pilot pages under `src/app/product/*/page.tsx`
- Related but separate existing change:
  - `openspec/changes/product-topic-component-system/` remains focused on reusable module components such as project grids, scenario matrices, and hero components.
- Candidate pilot pages:
  - `src/app/product/xiaomi/page.tsx`
  - `src/app/product/wenjie/page.tsx`
  - `src/app/product/flooring/page.tsx`
  - optionally `src/app/product/zeekr/page.tsx` if implementation risk is acceptable
- Verification impact:
  - unit tests for shell config and JSON-LD helpers
  - smoke tests for migrated pilot pages
  - visual/browser checks at 390px, 768px, and 1440px
- Risks:
  - over-abstracting page structure could make special pages harder to express
  - JSON-LD regressions could affect SEO
  - shell and component-system work must remain complementary, not competing
