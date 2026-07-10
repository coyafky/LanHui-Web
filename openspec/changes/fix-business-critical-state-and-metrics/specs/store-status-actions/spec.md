## ADDED Requirements

### Requirement: Store profile edits cannot mutate status fields
The ordinary store profile create/edit APIs SHALL reject direct mutation of fields owned by the store status state machine.

#### Scenario: Store edit rejects status
- **WHEN** a caller submits `PUT /api/stores/{id}` with a `status` field
- **THEN** the API returns a validation error and does not change store status

#### Scenario: Store edit rejects isActive
- **WHEN** a caller submits `PUT /api/stores/{id}` with an `isActive` field
- **THEN** the API returns a validation error and does not change operational visibility

#### Scenario: Store edit rejects status reason
- **WHEN** a caller submits `PUT /api/stores/{id}` with a `statusReason` field
- **THEN** the API returns a validation error and does not write status transition reason data

#### Scenario: Profile edit preserves status
- **WHEN** a caller submits valid profile fields such as name, address, phone, or business hours
- **THEN** the API updates the profile and preserves the current status, `isActive`, and status reason values

### Requirement: Store status changes use action endpoints
Store operational lifecycle changes SHALL be performed only through the dedicated store action endpoints.

#### Scenario: Publish store through action endpoint
- **WHEN** an admin publishes a pending store
- **THEN** the client calls `POST /api/stores/{id}/publish`

#### Scenario: Suspend store through action endpoint
- **WHEN** an admin suspends an active store
- **THEN** the client calls `POST /api/stores/{id}/suspend` with the required reason

#### Scenario: Resume store through action endpoint
- **WHEN** an admin resumes a suspended store
- **THEN** the client calls `POST /api/stores/{id}/resume`

#### Scenario: Terminate store through action endpoint
- **WHEN** an admin terminates a store partnership
- **THEN** the client calls `POST /api/stores/{id}/terminate` with the required reason

### Requirement: Store action routes remain the source of business validation
The store action endpoints SHALL enforce transition rules, completeness checks, audit metadata, CSRF protection, authorization, and action-specific rate limits.

#### Scenario: Publish checks completeness
- **WHEN** an admin attempts to publish a store missing required public fields
- **THEN** the publish action rejects the request and returns actionable validation details

#### Scenario: Suspend requires reason
- **WHEN** an admin attempts to suspend a store without a reason
- **THEN** the suspend action rejects the request and leaves the store active

#### Scenario: Generic edit cannot bypass action limits
- **WHEN** a caller attempts to change status through the generic store edit endpoint
- **THEN** the request is rejected before any state-machine side effects can be bypassed

### Requirement: Store creation starts from a controlled initial lifecycle state
New stores SHALL enter a controlled initial lifecycle state and SHALL NOT be created as active through arbitrary profile payload fields.

#### Scenario: New store defaults to pending
- **WHEN** an admin creates a store through the profile form
- **THEN** the store is created in the pending lifecycle state unless a dedicated creation workflow explicitly defines otherwise

#### Scenario: Create payload cannot force active state
- **WHEN** a caller submits `POST /api/stores` with `status=active` or `isActive=true`
- **THEN** the API ignores or rejects those lifecycle fields and does not create a publicly active store
