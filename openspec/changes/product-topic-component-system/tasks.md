## 1. Baseline Audit

- [ ] 1.1 Inventory all vehicle topic component directories and record which files match `Hero`, `Faq`, `ServiceFlow`, `ScenarioMatrix`, `ProjectGrid`, and `TopicViewTrack`
- [ ] 1.2 Choose the complex pilot page, preferring `src/app/product/xpeng/gx/page.tsx` or `src/app/product/zeekr/9x/page.tsx`
- [ ] 1.3 Choose the repeated-series pilot page, preferring one `src/app/product/li-auto/*/page.tsx` route
- [ ] 1.4 Capture current pilot page behavior: headings, CTA links, category names, scenario anchors, project counts, FAQ count, and tracking event keys

## 2. Shared Types And Utilities

- [ ] 2.1 Create `src/lib/product-topic/types.ts` with strict generic types for topic config, project, category, scenario, FAQ, service step, hero, tracking, and image status
- [ ] 2.2 Create `src/components/product-topic/ProductTopicTheme.ts` with controlled accent token maps and no unbounded dynamic Tailwind classes
- [ ] 2.3 Create `src/lib/product-topic/image-status.ts` to map internal image statuses to public-facing labels such as `商品预览效果图`
- [ ] 2.4 Create `src/lib/product-topic/hash.ts` to parse scenario hashes and project hashes from configurable prefixes
- [ ] 2.5 Create `src/lib/product-topic/assertions.ts` for unique id checks, optional expected count checks, and development-only diagnostics
- [ ] 2.6 Export shared utilities from `src/lib/product-topic/index.ts`

## 3. Shared Components

- [ ] 3.1 Create `src/components/product-topic/ProductTopicSectionHeader.tsx` for repeated section eyebrow/title/description UI
- [ ] 3.2 Create `src/components/product-topic/ProductTopicHero.tsx` with configurable title, subtitle, badges, stats, CTAs, and accent theme
- [ ] 3.3 Create `src/components/product-topic/ProductTopicScenarioMatrix.tsx` with configurable scenarios and stable hash links
- [ ] 3.4 Create `src/components/product-topic/ProductTopicProjectGrid.tsx` as a Client Component supporting category tabs, scenario filtering, project expansion, image status labels, empty state, and tracking callbacks
- [ ] 3.5 Create `src/components/product-topic/ProductTopicServiceFlow.tsx` with configurable service steps
- [ ] 3.6 Create `src/components/product-topic/ProductTopicFaq.tsx` with accessible question/answer rendering
- [ ] 3.7 Create `src/components/product-topic/ProductTopicViewTrack.tsx` to preserve configured topic view tracking metadata
- [ ] 3.8 Export all shared components from `src/components/product-topic/index.ts`

## 4. Adapter Layer

- [ ] 4.1 Create `src/lib/product-topic/adapters.ts` or per-topic adapter files for the selected complex pilot
- [ ] 4.2 Map the complex pilot's existing project data into `ProductTopicProject` without changing its source data file
- [ ] 4.3 Map the complex pilot's scenarios, category labels, category order, image statuses, and tracking keys into topic config
- [ ] 4.4 Create adapter logic for the repeated-series pilot without changing its source data file
- [ ] 4.5 Ensure adapters use `satisfies` or explicit generic types so missing fields fail typecheck

## 5. Pilot Page Migration

- [ ] 5.1 Replace the complex pilot page's cloned components with shared product-topic components
- [ ] 5.2 Preserve the complex pilot's route, primary heading, section ids, scenario hash behavior, project hash behavior, category tab labels, CTA links, and FAQ content
- [ ] 5.3 Replace the repeated-series pilot page's cloned components with shared product-topic components
- [ ] 5.4 Preserve the repeated-series pilot's route, primary heading, CTA links, project count, service flow, and FAQ content
- [ ] 5.5 Keep old cloned component files in place during the first migration unless removing a pilot file is demonstrably safe and covered by tests

## 6. Tests

- [ ] 6.1 Add unit tests for `src/lib/product-topic/hash.ts`
- [ ] 6.2 Add unit tests for `src/lib/product-topic/image-status.ts`
- [ ] 6.3 Add unit tests for `src/components/product-topic/ProductTopicTheme.ts`
- [ ] 6.4 Add component tests for `ProductTopicProjectGrid` covering category filtering, scenario clearing, project expansion, and empty states
- [ ] 6.5 Add smoke tests for both migrated pilot pages verifying primary content and no obvious hydration failure
- [ ] 6.6 Run browser checks for pilot pages at 390px, 768px, and 1440px

## 7. Clone Prevention

- [ ] 7.1 Create `scripts/check-product-topic-clones.mjs` to detect newly added full-copy topic component sets
- [ ] 7.2 Add a migration allowlist for existing legacy directories so historical clones do not fail the first check
- [ ] 7.3 Add a package script such as `check:product-topic-clones`
- [ ] 7.4 Document how to add a new vehicle topic page using shared components instead of copying a directory

## 8. Verification

- [ ] 8.1 Run `npm run lint`
- [ ] 8.2 Run `npm run typecheck` and document the known pre-existing test-only errors if they still appear
- [ ] 8.3 Run targeted vitest files for `src/lib/product-topic/*` and `src/components/product-topic/*`
- [ ] 8.4 Run `npm run build`
- [ ] 8.5 Run `npm run check:product-topic-clones`
- [ ] 8.6 Compare pilot pages before and after migration with screenshots or Playwright assertions

## 9. Follow-up Migration Plan

- [ ] 9.1 Create a ranked backlog for remaining topic directories by clone size and risk
- [ ] 9.2 Mark high-confidence next migrations, likely `li-auto` siblings, `zeekr-8x`, `xiaomi-su7`, and `xiaomi-yu7`
- [ ] 9.3 Identify pages that require custom slots or should remain partially bespoke
