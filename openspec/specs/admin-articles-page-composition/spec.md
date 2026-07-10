# admin-articles-page-composition Specification

## Purpose
TBD - created by archiving change split-admin-articles-and-forms. Update Purpose after archive.
## Requirements
### Requirement: Article list page SHALL be composed of sub-components

The `articles/page.tsx` page SHALL be refactored from a monolithic component into a composition of focused sub-components, each with a single responsibility. The page's external behavior (data fetching, filter params, API calls, UI rendering) MUST remain identical.

#### Scenario: Page renders with sub-components
- **WHEN** an admin user navigates to `/admin/articles`
- **THEN** the page SHALL render using `ArticleFilterBar`, `ArticleTable`, `ArticleBulkToolbar`, and `PaginationBar` sub-components
- **AND** all existing filter/search/table/pagination interactions SHALL work identically

#### Scenario: Existing tests continue to pass
- **WHEN** `npx vitest run src/app/admin/(dashboard)/articles/page.test.tsx` is executed after refactoring
- **THEN** all 12 existing tests SHALL pass without modification

### Requirement: ArticleFilterBar SHALL encapsulate all filter controls

The `ArticleFilterBar` component SHALL contain the search input, status dropdown, and category dropdown currently inlined in `articles/page.tsx`. It SHALL accept `search`, `statusFilter`, `categoryFilter`, and `onChange` callbacks as props.

#### Scenario: Search input triggers filter change
- **WHEN** user types in the search input
- **THEN** the parent page SHALL receive updated search state via onChange callback

#### Scenario: Status dropdown filters articles
- **WHEN** user selects a status option
- **THEN** the table SHALL display only articles matching that status

### Requirement: ArticleTable SHALL encapsulate table rendering and row actions

The `ArticleTable` component SHALL contain the table element, column definitions, checkbox column, and row-level action menus. It SHALL accept `articles`, `selectedIds`, `onToggleSelect`, `onToggleSelectAll`, and action handlers as props.

#### Scenario: Table renders article rows with checkboxes
- **WHEN** articles are loaded
- **THEN** each row SHALL display a checkbox, title, category, status, and action menu

#### Scenario: Select-all checkbox toggles all rows
- **WHEN** user clicks the header checkbox
- **THEN** all visible rows SHALL be selected or deselected

### Requirement: ArticleBulkToolbar SHALL display batch actions

The `ArticleBulkToolbar` component SHALL render when one or more articles are selected. It SHALL display the selected count and batch action buttons (publish, archive, delete). It SHALL accept `selectedCount`, `onClear`, and `onAction` callbacks as props.

#### Scenario: Toolbar visible when articles selected
- **WHEN** at least one article checkbox is checked
- **THEN** the bulk action toolbar SHALL appear with selected count and action buttons

#### Scenario: Toolbar hidden when no selection
- **WHEN** all checkboxes are unchecked
- **THEN** the bulk action toolbar SHALL not render

