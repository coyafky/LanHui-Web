---
comet_change: fix-store-search-suggestions-overflow
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-10-fix-store-search-suggestions-overflow
status: final
---

# Design Doc: Fix Store Search Suggestions Overflow

## Context

`StoreSearch` requests `/api/stores?search=<keyword>&limit=6&sort=public_featured` and stores all returned suggestions in state. The dropdown panel is `position: absolute` below the input. On `/agent`, the search component sits inside a hero `<section>` with `overflow-hidden` used for decorative gradients and blurred background shapes.

That parent overflow clips the dropdown when it extends beyond the hero, so the UI can look like it only has two results even when more suggestions exist.

## Goals / Non-Goals

**Goals:**
- Show all suggestions returned by the current search request, up to the configured limit
- Keep the dropdown visually attached to the input
- Avoid clipping by hero/background containers
- Add a scroll area for long suggestion lists on small viewports
- Preserve accessibility and keyboard behavior

**Non-Goals:**
- Do not change search ranking
- Do not change the default API request limit
- Do not replace the search UI with a modal
- Do not change navigation targets for selected stores

## Decisions

### 1: Move Hero Clipping to Background Wrapper Only

Change `/agent` hero structure: `overflow-visible` on the section, move `overflow-hidden` to an inner absolute background wrapper. Content/search gets high enough `z-index` to float above.

### 2: Add Dropdown Max Height And Scroll

Dropdown gets `max-h-[min(60vh,24rem)] overflow-y-auto` so all 6 items are reachable on any viewport.

### 3: Preserve Combobox Keyboard Semantics

ArrowDown/ArrowUp must still move through every suggestion. Highlighted option stays visible via `scrollIntoView({ block: 'nearest' })`.

### 4: Keep API Limit Separate From Visual Limit

API continues returning up to 6 suggestions. Visual layer must not impose an accidental two-row limit.

## Files Changed

1. `src/app/agent/page.tsx` — adjust hero overflow structure
2. `src/components/agent/StoreSearch.tsx` — add scrollable dropdown + keyboard scroll
3. `src/components/agent/StoreSearch.test.tsx` — add overflow/scroll tests
