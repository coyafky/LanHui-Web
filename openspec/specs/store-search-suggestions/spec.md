# store-search-suggestions Specification

## Purpose
TBD - created by archiving change store-search-suggestions. Update Purpose after archive.
## Requirements
### Requirement: Search input triggers debounced API suggestions

The StoreSearch component SHALL debounce user input by 200ms and fetch up to 6 store suggestions from `/api/stores?search=<keyword>&limit=6&sort=public_featured` when the trimmed keyword length is >= 1.

#### Scenario: Keyword triggers API request after debounce

- **WHEN** user types "南京" in the search input
- **THEN** after 200ms of no further input, a GET request SHALL be sent to `/api/stores?search=%E5%8D%97%E4%BA%AC&limit=6&sort=public_featured`
- **AND** matching active stores SHALL appear in a dropdown list

#### Scenario: Empty keyword does not trigger request

- **WHEN** user clears the input to an empty string
- **THEN** no API request SHALL be sent
- **AND** the dropdown SHALL close

#### Scenario: Keyword shorter than 1 char after trim does not trigger request

- **WHEN** user types only whitespace characters
- **THEN** no API request SHALL be sent

### Requirement: Dropdown displays store name and location

Each suggestion item SHALL display the store name as primary text and province/city/district as secondary text.

#### Scenario: Suggestion item renders store info

- **WHEN** API returns a store with name "蓝辉轻改南京店", provinceLabel "江苏省", cityLabel "南京市", district "江宁区"
- **THEN** the suggestion SHALL show "蓝辉轻改南京店" as the title
- **AND** SHALL show "江苏省 · 南京市 · 江宁区" as the subtitle

#### Scenario: Suggestion without district omits district from subtitle

- **WHEN** API returns a store with district=null
- **THEN** the subtitle SHALL show "省份 · 城市" without trailing separator

### Requirement: Clicking a suggestion navigates to store detail page

Clicking a suggestion item SHALL navigate to `/agent/store/{store.id}` and close the dropdown.

#### Scenario: Click navigates to store detail

- **WHEN** user clicks a suggestion with store id "abc123"
- **THEN** router navigates to `/agent/store/abc123`
- **AND** the dropdown SHALL close

### Requirement: Keyboard navigation with ArrowDown, ArrowUp, Enter, Escape

The combobox SHALL support ArrowDown to move highlight down, ArrowUp to move highlight up, Enter to select the highlighted item or perform keyword search, and Escape to close the dropdown.

#### Scenario: ArrowDown highlights next suggestion

- **WHEN** dropdown is open with suggestions and no item is highlighted
- **THEN** pressing ArrowDown SHALL highlight the first suggestion

#### Scenario: ArrowDown wraps to first after last

- **WHEN** the last suggestion is highlighted
- **THEN** pressing ArrowDown SHALL highlight the first suggestion

#### Scenario: ArrowUp wraps to last from first

- **WHEN** the first suggestion is highlighted
- **THEN** pressing ArrowUp SHALL highlight the last suggestion

#### Scenario: Enter with highlighted suggestion navigates to store

- **WHEN** a suggestion is highlighted
- **THEN** pressing Enter SHALL navigate to `/agent/store/{id}` for the highlighted store
- **AND** SHALL close the dropdown

#### Scenario: Enter without highlighted suggestion performs keyword search

- **WHEN** dropdown is open but no suggestion is highlighted
- **THEN** pressing Enter SHALL navigate to `/agent?q=<keyword>`

#### Scenario: Escape closes dropdown

- **WHEN** dropdown is open
- **THEN** pressing Escape SHALL close the dropdown
- **AND** SHALL NOT clear the input value

### Requirement: Combobox accessibility semantics

The search input SHALL use `role="combobox"` with `aria-expanded`, `aria-controls`, and `aria-activedescendant` attributes. The dropdown SHALL use `role="listbox"`. Each suggestion SHALL use `role="option"` with `aria-selected`.

#### Scenario: Combobox announces expanded state

- **WHEN** dropdown opens with suggestions
- **THEN** input SHALL have `aria-expanded="true"`

#### Scenario: Combobox announces collapsed state

- **WHEN** dropdown closes
- **THEN** input SHALL have `aria-expanded="false"`

### Requirement: API search covers province, city, and district names

The `/api/stores` GET endpoint SHALL include `provinceLabel`, `cityLabel`, and `district` in its search OR conditions using case-insensitive contains matching, in addition to the existing name/address/phone/slug fields.

#### Scenario: Search by city name returns matching stores

- **WHEN** GET `/api/stores?search=南京`
- **THEN** response SHALL include stores whose cityLabel contains "南京"

#### Scenario: Search by province name returns matching stores

- **WHEN** GET `/api/stores?search=广东`
- **THEN** response SHALL include stores whose provinceLabel contains "广东"

#### Scenario: Search respects active-only filter for public requests

- **WHEN** an unauthenticated GET request includes `?search=南京`
- **THEN** only stores with `status=active` SHALL be returned

### Requirement: Clear button resets search state

Clicking the clear button SHALL clear the input value, close the dropdown, and navigate to `/agent`.

#### Scenario: Clear button resets everything

- **WHEN** user clicks the clear button while dropdown is open
- **THEN** input value SHALL be cleared
- **AND** dropdown SHALL close
- **AND** router SHALL navigate to `/agent`

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

