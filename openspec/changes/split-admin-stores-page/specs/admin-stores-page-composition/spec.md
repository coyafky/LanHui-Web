## ADDED Requirements

### Requirement: Stores page component extraction
The system SHALL extract admin stores list inline UI components into domain-specific component files under `src/components/admin/stores/`. The stores page MUST no longer define large reusable UI components inline.

#### Scenario: Badge components extracted
- **WHEN** the stores page renders store level and status
- **THEN** it uses extracted `LevelBadge` and `StatusBadge` components

#### Scenario: Filter and KPI components extracted
- **WHEN** the stores page renders level filters and KPI summary
- **THEN** it uses extracted `LevelFilter` and `KpiStrip` components

#### Scenario: Table components extracted
- **WHEN** the stores page renders loading skeleton, table columns, and store table
- **THEN** it uses extracted table-related components or helpers from `src/components/admin/stores/`

### Requirement: Shared stores page types
The system SHALL define shared admin stores page types in one module. Components, hooks, and the page MUST import shared types instead of redefining `StoreRow`, pagination, group mode, sort key, and filter types.

#### Scenario: Shared StoreRow type
- **WHEN** StoreTable, BulkBar, URL hook, and fetch hook need store row shape
- **THEN** they import the same `StoreRow` type

#### Scenario: Shared filter types
- **WHEN** URL sync and fetch hooks need filter state
- **THEN** they use the same shared filter type

### Requirement: URL synchronization hook
The system SHALL provide a `useAdminStoresUrlSync` hook or equivalent for stores page URL state. The hook MUST preserve existing query parameter names and bidirectional behavior between filter state and the browser URL.

#### Scenario: Query initializes filters
- **WHEN** the stores page loads with `search`, `province`, `city`, `level`, `status`, `image`, `sort`, `page`, or `group` query parameters
- **THEN** the hook initializes matching filter and pagination state

#### Scenario: Filters update URL
- **WHEN** the user changes filters, sort, group mode, search, or page
- **THEN** the hook updates the URL query string without a full page reload

#### Scenario: Multi-level filter preserved
- **WHEN** multiple `level` query parameters are present
- **THEN** the hook preserves them as a multi-select level filter

#### Scenario: Reset filters
- **WHEN** the user resets filters
- **THEN** the hook clears filter-related query parameters and restores default filter state

### Requirement: Stores fetch hook
The system SHALL provide a `useAdminStoresFetch` hook or equivalent for stores list data loading. The hook MUST own API parameter construction, loading state, error state, pagination, and refetch behavior.

#### Scenario: Fetch stores with filters
- **WHEN** filters or page change
- **THEN** the hook requests `/api/stores` with the correct query parameters

#### Scenario: Fetch success
- **WHEN** `/api/stores` returns success
- **THEN** the hook exposes stores and pagination data

#### Scenario: Fetch failure
- **WHEN** `/api/stores` fails
- **THEN** the hook exposes an error state and does not leave loading stuck

#### Scenario: Refetch after action
- **WHEN** a store action succeeds
- **THEN** the page can call the hook refetch function to reload current data

### Requirement: Province and city options loading
The system SHALL preserve existing province and city filter behavior after the fetch/url refactor. Province and city option loading MAY be part of `useAdminStoresFetch` or separate hooks, but MUST remain testable.

#### Scenario: Province options load
- **WHEN** the stores page mounts
- **THEN** province filter options are loaded from the existing endpoint

#### Scenario: City options depend on province
- **WHEN** a province is selected
- **THEN** city options are loaded for that province

#### Scenario: Province cleared
- **WHEN** province filter is cleared
- **THEN** city filter and city options reset consistently

### Requirement: BulkBar real bulk behavior
The system SHALL fix `BulkBar` so its behavior matches its bulk UI. If multiple stores are selected, a bulk action MUST act on every eligible selected store or clearly report why an item was skipped.

#### Scenario: Multiple selected stores action
- **WHEN** two or more stores are selected and the user chooses a bulk action
- **THEN** the action is attempted for every eligible selected store, not only the first selected id

#### Scenario: Partial bulk failure
- **WHEN** some selected stores succeed and some fail
- **THEN** the user receives a result summary and failed or skipped items remain recoverable

#### Scenario: Ineligible selected store
- **WHEN** a selected store cannot perform the chosen action based on its current status
- **THEN** the UI disables the action or reports that the store was skipped

#### Scenario: Bulk success clears selection
- **WHEN** all selected store actions succeed
- **THEN** the page clears selection and refetches or updates the store rows

### Requirement: Stores page behavior compatibility
The system SHALL preserve existing stores list behavior after splitting the page. Users MUST retain the same route, filters, table interactions, pagination, keyboard shortcuts, grouping, sorting, selection, and status action workflows.

#### Scenario: Route unchanged
- **WHEN** the user visits `/admin/stores`
- **THEN** the same stores management page renders

#### Scenario: Keyboard shortcuts preserved
- **WHEN** the user uses existing keyboard shortcuts on the stores page
- **THEN** shortcuts continue to work after component extraction

#### Scenario: Grouping preserved
- **WHEN** the user groups stores by province, city, level, or status
- **THEN** grouped table rendering remains available

#### Scenario: Pagination preserved
- **WHEN** there are multiple pages of stores
- **THEN** pagination controls continue to navigate pages and sync URL state

### Requirement: Page size reduction
The system SHALL reduce `src/app/admin/(dashboard)/stores/page.tsx` to a composition-focused page. The page SHOULD target approximately 300 lines and MUST not continue to contain all extracted component implementations inline.

#### Scenario: Page no longer contains extracted component definitions
- **WHEN** the refactor is complete
- **THEN** `stores/page.tsx` does not define extracted components such as `LevelBadge`, `StatusBadge`, `KpiStrip`, `BulkBar`, or `StoreTable` inline

### Requirement: Verification coverage
The system SHALL add or update tests for extracted stores components, URL sync, fetch hook, and BulkBar behavior.

#### Scenario: Component tests
- **WHEN** stores component tests run
- **THEN** badges, filters, KPI strip, skeleton, table, and BulkBar render expected UI

#### Scenario: Hook tests
- **WHEN** URL sync and fetch hook tests run
- **THEN** query parsing, query serialization, fetch success, fetch failure, and refetch are covered

#### Scenario: BulkBar bug regression test
- **WHEN** BulkBar receives multiple selected ids
- **THEN** the test verifies the action handler receives or processes all selected ids

#### Scenario: Stores page smoke test
- **WHEN** the stores page test runs
- **THEN** it verifies primary filters, table rendering, pagination, and no missing core UI after extraction
