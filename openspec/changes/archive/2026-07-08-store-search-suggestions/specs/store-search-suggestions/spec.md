## ADDED Requirements

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
