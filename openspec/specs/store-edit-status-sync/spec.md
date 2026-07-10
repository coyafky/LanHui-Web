# store-edit-status-sync Specification

## Purpose
TBD - created by archiving change align-store-edit-status-field. Update Purpose after archive.
## Requirements
### Requirement: Edit form initializes status from persisted store
The admin store edit form SHALL initialize the `门店状态` select from the persisted store status returned by the store API.

#### Scenario: Active store shows active option
- **WHEN** the edit page loads a store whose API `status` is `active`
- **THEN** the `门店状态` select displays `营业中`

#### Scenario: Pending store shows pending option
- **WHEN** the edit page loads a store whose API `status` is `pending`
- **THEN** the `门店状态` select displays `待发布`

#### Scenario: Suspended store shows suspended option
- **WHEN** the edit page loads a store whose API `status` is `suspended`
- **THEN** the `门店状态` select displays `暂停合作`

#### Scenario: Terminated store shows terminated option
- **WHEN** the edit page loads a store whose API `status` is `terminated`
- **THEN** the `门店状态` select displays `终止合作`

### Requirement: Status select options remain editable
The store edit page SHALL keep the status select as an editable control for authorized admins.

#### Scenario: Admin can choose another status
- **WHEN** an admin opens the status select on an editable store
- **THEN** the select contains all supported status options

#### Scenario: Status change updates draft form state
- **WHEN** an admin selects a different status option
- **THEN** the form draft value changes to the selected status without immediately changing the persisted current status preview

### Requirement: Persisted status preview and draft status are distinct
The edit page SHALL clearly distinguish the persisted current store status from the selected draft status.

#### Scenario: Current status preview uses persisted value
- **WHEN** the edit page first loads
- **THEN** the header badge and right-side `当前状态` card show the persisted store status

#### Scenario: Draft status is labeled before save
- **WHEN** the admin changes the status select but has not saved
- **THEN** any preview of the selected value is labeled as draft or pending save instead of current status

#### Scenario: No false mismatch on first load
- **WHEN** a loaded store has `status=active`
- **THEN** the page does not show `营业中` as current status while the status select displays `待发布`

### Requirement: isActive remains synchronized with selected status
The edit form SHALL keep the legacy `isActive` compatibility field synchronized with the selected status.

#### Scenario: Active maps to isActive true
- **WHEN** the selected status is `active`
- **THEN** the submitted form data includes `isActive=true`

#### Scenario: Non-active maps to isActive false
- **WHEN** the selected status is `pending`, `suspended`, or `terminated`
- **THEN** the submitted form data includes `isActive=false`

#### Scenario: Legacy fallback uses isActive
- **WHEN** an API response is missing `status` but includes `isActive`
- **THEN** the edit form derives the initial status from `isActive`

### Requirement: Save refreshes persisted status preview
After a successful save, the edit page SHALL update its persisted status preview to match the saved status.

#### Scenario: Save selected status
- **WHEN** an admin changes status from `active` to `suspended` and saves successfully
- **THEN** the header badge and right-side current status preview update to `暂停合作`

#### Scenario: Save failure keeps previous current status
- **WHEN** a status change save fails
- **THEN** the current status preview remains the last persisted status and the draft select remains available for correction

### Requirement: Regression coverage
The system SHALL include tests or targeted checks covering status initialization and save synchronization.

#### Scenario: Initialization test covers all statuses
- **WHEN** the edit form initialization tests run
- **THEN** they verify `pending`, `active`, `suspended`, and `terminated` initialize the select correctly

#### Scenario: Draft/current distinction test
- **WHEN** the draft status differs from current status in a test
- **THEN** the UI exposes the selected value as draft or pending save, not as persisted current status

