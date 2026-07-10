## MODIFIED Requirements

### Requirement: Edit form initializes status from persisted store
The admin store edit page SHALL initialize current status displays from the persisted store status returned by the store API, without treating that status as a generic profile field.

#### Scenario: Active store shows active current status
- **WHEN** the edit page loads a store whose API `status` is `active`
- **THEN** the header badge and right-side `当前状态` card display `营业中`

#### Scenario: Pending store shows pending current status
- **WHEN** the edit page loads a store whose API `status` is `pending`
- **THEN** the header badge and right-side `当前状态` card display `待发布`

#### Scenario: Suspended store shows suspended current status
- **WHEN** the edit page loads a store whose API `status` is `suspended`
- **THEN** the header badge and right-side `当前状态` card display `暂停合作`

#### Scenario: Terminated store shows terminated current status
- **WHEN** the edit page loads a store whose API `status` is `terminated`
- **THEN** the header badge and right-side `当前状态` card display `终止合作`

### Requirement: Persisted status preview and draft status are distinct
The edit page SHALL clearly distinguish the persisted current store status from any pending status action selection.

#### Scenario: Current status preview uses persisted value
- **WHEN** the edit page first loads
- **THEN** the header badge and right-side `当前状态` card show the persisted store status

#### Scenario: Pending action is labeled before confirmation
- **WHEN** the admin chooses a different status action but has not confirmed it
- **THEN** any preview of the selected target status is labeled as an action target or pending confirmation instead of current status

#### Scenario: No false mismatch on first load
- **WHEN** a loaded store has `status=active`
- **THEN** the page does not show `营业中` as current status while another unconfirmed status target appears as the persisted state

### Requirement: Save refreshes persisted status preview
After a successful store status action, the edit page SHALL update its persisted status preview to match the action result.

#### Scenario: Status action updates current preview
- **WHEN** an admin changes status from `active` to `suspended` through the suspend action and the action succeeds
- **THEN** the header badge and right-side current status preview update to `暂停合作`

#### Scenario: Profile save does not change current status
- **WHEN** an admin saves ordinary profile fields without running a status action
- **THEN** the header badge and right-side current status preview remain the last persisted status

#### Scenario: Status action failure keeps previous current status
- **WHEN** a status action fails
- **THEN** the current status preview remains the last persisted status and the action control remains available for correction

### Requirement: Regression coverage
The system SHALL include tests or targeted checks covering status initialization and action-based synchronization.

#### Scenario: Initialization test covers all statuses
- **WHEN** the edit page initialization tests run
- **THEN** they verify `pending`, `active`, `suspended`, and `terminated` render as the current persisted status correctly

#### Scenario: Action/current distinction test
- **WHEN** a pending status action differs from current status in a test
- **THEN** the UI exposes the target value as an action target or pending confirmation, not as persisted current status

#### Scenario: Profile save excludes lifecycle fields
- **WHEN** profile save tests inspect the submitted payload
- **THEN** the payload does not include `status`, `isActive`, or `statusReason`

## REMOVED Requirements

### Requirement: Status select options remain editable
**Reason**: Submitting status as an editable profile field bypasses the store state machine, including transition rules, required suspension/termination reasons, publish completeness checks, audit metadata, CSRF/action handling, and action-specific rate limits.

**Migration**: Replace the editable profile status select with explicit status action controls. The options may remain visible, but selecting an option MUST resolve to the relevant action endpoint rather than being included in a generic profile save payload.

### Requirement: isActive remains synchronized with selected status
**Reason**: `isActive` is a derived compatibility field owned by the store state machine. Synchronizing it from a generic form selection allows callers to bypass action validation.

**Migration**: Action endpoints update `status` and `isActive` together. The edit page may display `isActive` as read-only compatibility information, but profile save payloads MUST NOT submit it.
