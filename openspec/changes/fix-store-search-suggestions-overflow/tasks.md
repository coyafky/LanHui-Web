## 1. Baseline Audit

- [x] 1.1 Confirm StoreSearch stores all API suggestions in state and does not slice to 2 items
- [x] 1.2 Confirm `/agent` hero section clips the dropdown with parent `overflow-hidden`
- [x] 1.3 Confirm current API request uses `limit=6`
- [x] 1.4 Capture a screenshot or browser reproduction where only two suggestions are visible

## 2. Hero Overflow Fix

- [x] 2.1 Move hero decorative clipping from the whole section to an inner background wrapper
- [x] 2.2 Ensure the StoreSearch content layer can overflow visibly above following sections
- [x] 2.3 Preserve existing hero background gradients and decorative blur appearance
- [x] 2.4 Verify the dropdown z-index places suggestions above subsequent page content

## 3. Dropdown Scroll Behavior

- [x] 3.1 Add responsive max-height to the suggestions dropdown or suggestion list
- [x] 3.2 Add `overflow-y-auto` for suggestion lists taller than the available space
- [x] 3.3 Keep loading, empty, and error states visually stable
- [x] 3.4 Ensure row borders and rounded corners still look correct when the list scrolls

## 4. Keyboard And Accessibility

- [x] 4.1 Ensure ArrowDown and ArrowUp can highlight every returned suggestion
- [x] 4.2 Ensure highlighted options scroll into view when necessary
- [x] 4.3 Preserve `role="combobox"`, `role="listbox"`, `role="option"`, `aria-expanded`, and `aria-activedescendant`
- [x] 4.4 Ensure Escape closes the dropdown without clearing input

## 5. Tests

- [x] 5.1 Add or update StoreSearch tests to render 6 suggestions
- [x] 5.2 Add a test proving all 6 suggestions are present in the DOM
- [x] 5.3 Add a keyboard navigation test reaching the last suggestion
- [x] 5.4 Add a click test for a lower suggestion navigating to `/agent/store/{id}`

## 6. Browser Verification

- [x] 6.1 Run `/agent` at 390px with a query returning more than two stores
- [x] 6.2 Run `/agent` at 768px with a query returning more than two stores
- [x] 6.3 Run `/agent` at 1440px with a query returning more than two stores
- [x] 6.4 Confirm no horizontal overflow or clipped dropdown on all checked viewports

## 7. Quality Gates

- [x] 7.1 Run targeted StoreSearch tests
- [x] 7.2 Run `npm run lint`
- [x] 7.3 Run `npm run typecheck` and document known pre-existing test-only errors if still present
