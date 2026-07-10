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
