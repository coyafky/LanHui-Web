## MODIFIED Requirements

### Requirement: Batch API integration
The admin articles page SHALL call `POST /api/articles/bulk` via `adminCsrfFetch` with selected article IDs and a canonical state-machine action name.

#### Scenario: Batch publish
- **WHEN** the admin confirms batch publish
- **THEN** `POST /api/articles/bulk` is called with `{ action: "publish", ids: [...] }`

#### Scenario: Batch withdraw
- **WHEN** the admin confirms batch撤回发布 for published articles
- **THEN** `POST /api/articles/bulk` is called with `{ action: "withdraw", ids: [...] }`

#### Scenario: Batch archive
- **WHEN** the admin confirms batch archive
- **THEN** `POST /api/articles/bulk` is called with `{ action: "archive", ids: [...] }`

#### Scenario: Batch restore
- **WHEN** the admin confirms batch restore for archived articles
- **THEN** `POST /api/articles/bulk` is called with `{ action: "restore", ids: [...] }`

#### Scenario: Batch delete
- **WHEN** the admin confirms batch delete
- **THEN** `POST /api/articles/bulk` is called with `{ action: "delete", ids: [...] }`

#### Scenario: Batch success feedback
- **WHEN** the bulk API returns success
- **THEN** the admin sees a toast with the count of succeeded articles and the list refreshes

#### Scenario: Batch partial failure feedback
- **WHEN** the bulk API returns with some skipped or failed items
- **THEN** the admin sees a toast summarizing succeeded, skipped, and failed counts

### Requirement: Batch action toolbar
When articles are selected, the admin articles page SHALL show a batch action toolbar with only actions valid for the selected articles' current statuses.

#### Scenario: Toolbar visible when articles selected
- **WHEN** at least one article is selected
- **THEN** a toolbar appears showing the selected count and available batch action buttons

#### Scenario: Toolbar hidden when no selection
- **WHEN** no articles are selected
- **THEN** the toolbar is not rendered

#### Scenario: Invalid mixed-status action is not offered
- **WHEN** selected articles do not share a valid lifecycle transition
- **THEN** the toolbar does not offer that lifecycle action or routes invalid rows to skipped results
