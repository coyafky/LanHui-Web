## ADDED Requirements

### Requirement: Article status changes use canonical action endpoints
Article lifecycle changes SHALL be performed only through canonical state-machine action endpoints.

#### Scenario: Publish article through action endpoint
- **WHEN** an admin publishes an article
- **THEN** the client calls `POST /api/articles/{id}/publish`

#### Scenario: Withdraw article through action endpoint
- **WHEN** an admin withdraws a published article
- **THEN** the client calls `POST /api/articles/{id}/withdraw`

#### Scenario: Republish article through action endpoint
- **WHEN** an admin republishes a withdrawn article
- **THEN** the client calls `POST /api/articles/{id}/republish`

#### Scenario: Archive article through action endpoint
- **WHEN** an admin archives an article
- **THEN** the client calls `POST /api/articles/{id}/archive`

#### Scenario: Restore article through action endpoint
- **WHEN** an admin restores an archived article
- **THEN** the client calls `POST /api/articles/{id}/restore`

### Requirement: Article edit endpoint forbids lifecycle mutation
The ordinary article create/edit API SHALL reject direct mutation of article lifecycle fields that belong to the state machine.

#### Scenario: Edit endpoint rejects status
- **WHEN** a caller submits `PUT /api/articles/{id}` with a `status` field
- **THEN** the API returns a validation error and does not change the article status

#### Scenario: Edit endpoint rejects publication timestamp
- **WHEN** a caller submits `PUT /api/articles/{id}` with a lifecycle-owned publication timestamp
- **THEN** the API returns a validation error and does not change publish state

#### Scenario: Content edits preserve lifecycle
- **WHEN** a caller submits `PUT /api/articles/{id}` with valid content fields only
- **THEN** the API updates the content and preserves the current article status

### Requirement: Article UI uses canonical action names
The admin article UI SHALL use the backend canonical action names instead of UI-only lifecycle aliases.

#### Scenario: No unpublish action is sent
- **WHEN** an admin chooses the撤回发布 action in the article table menu
- **THEN** the client sends `withdraw` to the API rather than `unpublish`

#### Scenario: Confirmation copy may differ from action name
- **WHEN** the UI labels an action as撤回发布
- **THEN** the underlying API action remains `withdraw`

### Requirement: Article state-machine transitions are enforced consistently
The article action endpoints SHALL enforce the same transition table for single-row actions, form-adjacent actions, and bulk actions.

#### Scenario: Invalid transition is rejected
- **WHEN** a caller requests an action that is not valid for the current article status
- **THEN** the API rejects the request and leaves the article unchanged

#### Scenario: Valid transition updates derived fields
- **WHEN** a valid publish or republish action succeeds
- **THEN** the API updates status and derived publication fields according to the state-machine rules
