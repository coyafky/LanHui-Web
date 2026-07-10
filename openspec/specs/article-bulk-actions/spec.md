# article-bulk-actions Specification

## Purpose
TBD - created by archiving change implement-article-bulk-actions. Update Purpose after archive.
## Requirements
### Requirement: Article batch selection
The admin articles page SHALL allow selecting multiple articles via checkboxes for batch operations.

#### Scenario: Select all on current page
- **WHEN** the admin clicks the header checkbox
- **THEN** all articles on the current page are selected

#### Scenario: Deselect all
- **WHEN** the admin clicks the header checkbox while all articles are selected
- **THEN** all selections are cleared

#### Scenario: Select single article
- **WHEN** the admin clicks a row checkbox
- **THEN** that article is added to the selection set

#### Scenario: Deselect single article
- **WHEN** the admin clicks a checked row checkbox
- **THEN** that article is removed from the selection set

#### Scenario: Clear selection on filter change
- **WHEN** the admin changes pagination or filter
- **THEN** the selection is cleared

### Requirement: Batch action toolbar
When articles are selected, the admin articles page SHALL show a batch action toolbar with publish, archive, and delete buttons.

#### Scenario: Toolbar visible when articles selected
- **WHEN** at least one article is selected
- **THEN** a toolbar appears showing the selected count and batch action buttons

#### Scenario: Toolbar hidden when no selection
- **WHEN** no articles are selected
- **THEN** the toolbar is not rendered

### Requirement: Batch API integration
The admin articles page SHALL call `POST /api/articles/bulk` via `adminCsrfFetch` with the selected action and article IDs.

#### Scenario: Batch publish
- **WHEN** the admin confirms batch publish
- **THEN** `POST /api/articles/bulk` is called with `{ action: "publish", ids: [...] }`

#### Scenario: Batch delete
- **WHEN** the admin confirms batch delete
- **THEN** `POST /api/articles/bulk` is called with `{ action: "delete", ids: [...] }`

#### Scenario: Batch success feedback
- **WHEN** the bulk API returns success
- **THEN** the admin sees a toast with the count of succeeded articles and the list refreshes

#### Scenario: Batch partial failure feedback
- **WHEN** the bulk API returns with some skipped or failed items
- **THEN** the admin sees a toast summarizing succeeded, skipped, and failed counts

