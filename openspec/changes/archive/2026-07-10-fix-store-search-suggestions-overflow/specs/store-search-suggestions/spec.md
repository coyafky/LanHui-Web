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
