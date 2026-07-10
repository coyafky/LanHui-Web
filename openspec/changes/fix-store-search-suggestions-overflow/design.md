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
