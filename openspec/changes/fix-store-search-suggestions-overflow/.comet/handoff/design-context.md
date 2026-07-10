# Comet Design Handoff

- Change: fix-store-search-suggestions-overflow
- Phase: design
- Mode: compact
- Context hash: 0840cb900ce3a8ea4d0d9a9e85fbffb88da78808ae23ce4c2c46e781031133d7

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/fix-store-search-suggestions-overflow/proposal.md

- Source: openspec/changes/fix-store-search-suggestions-overflow/proposal.md
- Lines: 1-34
- SHA256: 16dda78ff993a329c3cd6bb180740772d7ec1485b7a435f68579c5576550998f

```md
## Why

The public store search dropdown can visually show only the first two suggestions even though the component requests up to 6 matches. The dropdown is rendered inside the `/agent` hero section, and the hero uses `overflow-hidden`, so suggestions that extend beyond the hero are clipped.

## What Changes

- Keep the existing debounced search and `limit=6` behavior.
- Ensure all returned suggestions can be seen and selected on desktop and mobile.
- Prevent parent hero/background overflow rules from clipping the dropdown.
- Add a scrollable dropdown list when the suggestion list exceeds the available viewport space.
- Preserve keyboard navigation, combobox semantics, click navigation, and clear/search behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `store-search-suggestions`: Add dropdown visibility and overflow requirements so returned suggestions are not clipped or silently hidden.

## Impact

- Affected files:
  - `src/app/agent/page.tsx`
  - `src/components/agent/StoreSearch.tsx`
  - `src/components/agent/StoreSearch.test.tsx`
- Likely implementation:
  - Move hero decorative clipping to an inner background wrapper instead of clipping the whole hero section, or render the dropdown in a portal/floating layer.
  - Add responsive `max-height` and `overflow-y-auto` to the suggestions list.
- Verification:
  - Unit/component tests for 6 suggestions.
  - Browser checks at 390px, 768px, and 1440px with a query returning more than two stores.

```

## openspec/changes/fix-store-search-suggestions-overflow/design.md

- Source: openspec/changes/fix-store-search-suggestions-overflow/design.md
- Lines: 1-70
- SHA256: b997759780d963d1506e7ad5833ef0d28c0880ebedac64c3fd0854c3852a1d1e

```md
## Context

`StoreSearch` requests `/api/stores?search=<keyword>&limit=6&sort=public_featured` and stores all returned suggestions in state. The dropdown panel is `position: absolute` below the input. On `/agent`, the search component sits inside a hero `<section>` with `overflow-hidden` used for decorative gradients and blurred background shapes.

That parent overflow clips the dropdown when it extends beyond the hero section, so the UI can look like it only has two results even when more suggestions exist.

## Goals / Non-Goals

**Goals:**

- Show all suggestions returned by the current search request, up to the configured limit.
- Keep the dropdown visually attached to the input.
- Avoid clipping by hero/background containers.
- Add a scroll area for long suggestion lists on small viewports.
- Preserve accessibility and keyboard behavior.

**Non-Goals:**

- Do not change search ranking.
- Do not change the default API request limit unless explicitly needed later.
- Do not replace the search UI with a modal.
- Do not change navigation targets for selected stores.

## Decisions

### Decision 1: Do Not Clip The Whole Hero Section

Prefer changing `/agent` hero structure so decorative background elements are clipped inside their own absolute background wrapper, while the content layer and dropdown can overflow visibly.

Example direction:

- section: `overflow-visible`
- background wrapper: `absolute inset-0 overflow-hidden`
- content wrapper/search: high enough `z-index`

This preserves the visual background containment without cutting off the dropdown.

### Decision 2: Add Dropdown Max Height And Scroll

The dropdown should display up to the current API limit where space allows. On smaller screens, the suggestion list should use `max-height` based on viewport size and `overflow-y-auto` so all returned items remain accessible.

### Decision 3: Preserve Combobox Keyboard Semantics

If the list scrolls, ArrowDown/ArrowUp must still move through every suggestion. The highlighted option should stay visible, using `scrollIntoView` or equivalent if necessary.

### Decision 4: Keep API Limit Separate From Visual Limit

The API can continue returning up to 6 suggestions. The visual layer must not impose an accidental two-row limit. Any intentional future display cap must show a clear "view all results" affordance.

## Risks / Trade-offs

- [Risk] Removing `overflow-hidden` from hero lets decorative glows spill into nearby sections.
  → Mitigation: move clipping to the background wrapper only.

- [Risk] Dropdown overlaps following sections.
  → Mitigation: use z-index and shadow/border styling so the dropdown intentionally floats above content.

- [Risk] Scrollable list breaks keyboard focus visibility.
  → Mitigation: ensure highlighted option scrolls into view and add tests where practical.

- [Risk] Mobile viewport height is too small for 6 rows.
  → Mitigation: use responsive max-height such as `min(60vh, ...)` and vertical scrolling.

## Migration Plan

1. Adjust `/agent` hero overflow so the search dropdown can extend beyond the hero.
2. Add scrollable max-height styling to the dropdown list.
3. Ensure keyboard highlight remains visible in scrollable lists.
4. Add tests for rendering 6 suggestions and navigating to lower suggestions.
5. Verify visually on desktop and mobile.

```

## openspec/changes/fix-store-search-suggestions-overflow/tasks.md

- Source: openspec/changes/fix-store-search-suggestions-overflow/tasks.md
- Lines: 1-47
- SHA256: b938afd1c37ac777e4fda6651bd207066a98b76868075e4a6f8230f947638e86

```md
## 1. Baseline Audit

- [ ] 1.1 Confirm StoreSearch stores all API suggestions in state and does not slice to 2 items
- [ ] 1.2 Confirm `/agent` hero section clips the dropdown with parent `overflow-hidden`
- [ ] 1.3 Confirm current API request uses `limit=6`
- [ ] 1.4 Capture a screenshot or browser reproduction where only two suggestions are visible

## 2. Hero Overflow Fix

- [ ] 2.1 Move hero decorative clipping from the whole section to an inner background wrapper
- [ ] 2.2 Ensure the StoreSearch content layer can overflow visibly above following sections
- [ ] 2.3 Preserve existing hero background gradients and decorative blur appearance
- [ ] 2.4 Verify the dropdown z-index places suggestions above subsequent page content

## 3. Dropdown Scroll Behavior

- [ ] 3.1 Add responsive max-height to the suggestions dropdown or suggestion list
- [ ] 3.2 Add `overflow-y-auto` for suggestion lists taller than the available space
- [ ] 3.3 Keep loading, empty, and error states visually stable
- [ ] 3.4 Ensure row borders and rounded corners still look correct when the list scrolls

## 4. Keyboard And Accessibility

- [ ] 4.1 Ensure ArrowDown and ArrowUp can highlight every returned suggestion
- [ ] 4.2 Ensure highlighted options scroll into view when necessary
- [ ] 4.3 Preserve `role="combobox"`, `role="listbox"`, `role="option"`, `aria-expanded`, and `aria-activedescendant`
- [ ] 4.4 Ensure Escape closes the dropdown without clearing input

## 5. Tests

- [ ] 5.1 Add or update StoreSearch tests to render 6 suggestions
- [ ] 5.2 Add a test proving all 6 suggestions are present in the DOM
- [ ] 5.3 Add a keyboard navigation test reaching the last suggestion
- [ ] 5.4 Add a click test for a lower suggestion navigating to `/agent/store/{id}`

## 6. Browser Verification

- [ ] 6.1 Run `/agent` at 390px with a query returning more than two stores
- [ ] 6.2 Run `/agent` at 768px with a query returning more than two stores
- [ ] 6.3 Run `/agent` at 1440px with a query returning more than two stores
- [ ] 6.4 Confirm no horizontal overflow or clipped dropdown on all checked viewports

## 7. Quality Gates

- [ ] 7.1 Run targeted StoreSearch tests
- [ ] 7.2 Run `npm run lint`
- [ ] 7.3 Run `npm run typecheck` and document known pre-existing test-only errors if still present

```

## openspec/changes/fix-store-search-suggestions-overflow/specs/store-search-suggestions/spec.md

- Source: openspec/changes/fix-store-search-suggestions-overflow/specs/store-search-suggestions/spec.md
- Lines: 1-64
- SHA256: 6dbd3b1f5c5f035044dea48255aa520763e1d953ef9fe09b7a2c0353c2c58196

```md
## ADDED Requirements

### Requirement: Dropdown is not clipped by page hero
The store search suggestions dropdown SHALL remain visible outside the visual bounds of the hero content area when opened from the `/agent` page.

#### Scenario: More than two suggestions extend beyond hero
- **WHEN** the search API returns more than two suggestions on `/agent`
- **THEN** suggestions after the second item remain visible or reachable instead of being clipped by the hero section

#### Scenario: Decorative hero clipping remains contained
- **WHEN** the hero contains decorative gradients or blurred background shapes
- **THEN** those background decorations remain visually contained without clipping the search dropdown

### Requirement: Dropdown displays all returned suggestions up to API limit
The StoreSearch dropdown SHALL render every suggestion returned by the current API response up to the configured request limit.

#### Scenario: Six returned suggestions are rendered
- **WHEN** the API returns 6 matching stores
- **THEN** the dropdown renders 6 selectable options

#### Scenario: No accidental two-row cap
- **WHEN** the API returns 3 or more matching stores
- **THEN** the dropdown does not visually stop at 2 rows without a way to reach the remaining options

### Requirement: Long suggestion lists are scrollable
The StoreSearch dropdown SHALL use a responsive max height and vertical scrolling when its content exceeds available viewport space.

#### Scenario: Mobile list scrolls
- **WHEN** a mobile viewport displays a query with 6 suggestions
- **THEN** the dropdown remains within the viewport and allows vertical scrolling to every suggestion

#### Scenario: Desktop list shows or scrolls all suggestions
- **WHEN** a desktop viewport displays a query with 6 suggestions
- **THEN** all suggestions are either visible at once or reachable through dropdown scrolling

### Requirement: Keyboard navigation covers hidden-by-scroll suggestions
Keyboard navigation SHALL continue to work for every rendered suggestion, including suggestions below the initial visible scroll area.

#### Scenario: ArrowDown reaches lower suggestions
- **WHEN** the dropdown contains 6 suggestions and only part of the list is initially visible
- **THEN** pressing ArrowDown repeatedly highlights each suggestion in order

#### Scenario: Highlighted suggestion scrolls into view
- **WHEN** keyboard navigation highlights a suggestion outside the current scroll area
- **THEN** the dropdown scrolls enough for the highlighted suggestion to be visible

#### Scenario: Enter selects lower suggestion
- **WHEN** a lower suggestion is highlighted with keyboard navigation
- **THEN** pressing Enter navigates to that suggestion's store detail page

### Requirement: Existing search behavior remains unchanged
The overflow fix SHALL preserve existing search request, accessibility, and navigation behavior.

#### Scenario: Request contract unchanged
- **WHEN** the user types a keyword
- **THEN** StoreSearch still requests `/api/stores?search=<keyword>&limit=6&sort=public_featured` after the existing debounce

#### Scenario: Click selection unchanged
- **WHEN** the user clicks a suggestion
- **THEN** the router navigates to `/agent/store/{store.id}` and closes the dropdown

#### Scenario: Combobox semantics preserved
- **WHEN** the dropdown is open
- **THEN** the input, listbox, and options keep their existing combobox ARIA semantics

```
