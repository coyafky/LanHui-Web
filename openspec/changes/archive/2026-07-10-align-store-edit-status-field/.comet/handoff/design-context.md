# Comet Design Handoff

- Change: align-store-edit-status-field
- Phase: design
- Mode: compact
- Context hash: 98edec7a62d578a62368203654ec9c7fbf8c9eecaddd9b0bfc2b19aef062a27b

Generated-by: comet-handoff.sh

OpenSpec remains the canonical capability spec. This handoff is a deterministic, source-traceable context pack, not an agent-authored summary.

## openspec/changes/align-store-edit-status-field/proposal.md

- Source: openspec/changes/align-store-edit-status-field/proposal.md
- Lines: 1-41
- SHA256: 5742052263b48c0f69b9025b38a6fd8cd1dfd0332f17767758a488623a8d9a80

```md
## Why

The admin store edit page can show conflicting store state: the header/sidebar preview reflects the persisted current status (for example `营业中`), while the `门店状态` select defaults to `待发布`. This happens because the edit page maps API data into form defaults without passing the persisted `status`, and the select falls back to `pending`.

## What Changes

- Keep the `门店状态` select options. The admin must still be able to choose a different target status.
- Make the select initial value match the current persisted store status loaded from `/api/stores/[id]?all=true`.
- Use one canonical status source for:
  - header status badge
  - right-side current status preview
  - form default value
  - hidden `isActive` compatibility field
- Clarify UI wording so admins can distinguish:
  - current persisted status
  - selected draft status before saving
- Add regression tests or targeted checks proving active/suspended/pending/terminated stores initialize the select correctly.

## Capabilities

### New Capabilities

- `store-edit-status-sync`: Defines how the admin store edit form initializes, previews, and saves store status while preserving status options.

### Modified Capabilities

- None.

## Impact

- Affected UI:
  - `src/app/admin/(dashboard)/stores/[id]/page.tsx`
  - `src/components/admin/StoreForm.tsx`
  - `src/components/admin/stores/LevelStatusFields.tsx`
- Affected behavior:
  - Edit form status select must reflect the API `status` field on first render.
  - Changing the select remains possible and should update the draft state and `isActive` compatibility value.
- Risks:
  - Accidentally treating a draft select change as persisted current status.
  - Accidentally removing the status select or blocking valid status changes.
  - Saving without status could regress back to fallback `pending`.

```

## openspec/changes/align-store-edit-status-field/design.md

- Source: openspec/changes/align-store-edit-status-field/design.md
- Lines: 1-73
- SHA256: 1dd55d8e249a0a82288f08a685ab0934df1fa1d1a926fe8a65774928ea22b2e5

```md
## Context

The store edit page currently keeps separate pieces of state:

- `storeStatus` for the header badge and right-side current status card.
- `storeData` passed as `defaultValues` to `StoreForm`.
- React Hook Form state inside `StoreForm`.

The API response includes `status`, but the edit page's `setStoreData()` mapping currently omits it. `LevelStatusFields` then renders the status select with `value={field.value ?? "pending"}`, causing the dropdown to display `待发布` even when the loaded store is `active`.

## Goals / Non-Goals

**Goals:**

- Make the edit form's initial `status` value come from the loaded store.
- Keep all status options available in the select.
- Keep the right-side current status preview tied to persisted data.
- Show draft/selected status separately if it differs from the persisted current status.
- Keep `isActive` synchronized with selected status for backward compatibility.

**Non-Goals:**

- Do not redesign the store state machine.
- Do not remove the status select.
- Do not change store action endpoint permissions.
- Do not change public store visibility rules beyond the existing `status`/`isActive` behavior.

## Decisions

### Decision 1: API `status` Is The Canonical Initial Form Value

When the edit page loads a store, it must pass `status: d.status ?? resolve fallback` into `StoreForm` default values. `isActive` should be derived from that status unless the API response requires compatibility fallback.

Preferred fallback order:

1. `d.status` if present and valid
2. convert `d.isActive` through `isActiveToStatus()`
3. `pending` only for truly missing legacy records

### Decision 2: Select Shows Draft Status, Preview Shows Persisted Status

The status select represents the draft value that will be saved if the admin clicks `保存修改`. The header/right-side badge represents the persisted current value. If the admin changes the select before saving, the UI should label the selected value as draft or pending save, not as current persisted status.

### Decision 3: Keep Status Options But Remove Implicit Pending Fallback From Display Semantics

`LevelStatusFields` can still use a safe fallback internally, but it must not make a loaded active store look pending. If the field is missing on edit pages, that is a data initialization defect and should be visible in tests.

### Decision 4: Update Local State After Successful Save

After a successful PUT, local persisted preview state should be updated from the saved response or submitted status so the header/right-side preview no longer disagrees with the saved form.

## Risks / Trade-offs

- [Risk] Draft status and persisted status appear confusing.
  → Mitigation: label the sidebar as `当前状态` and any changed select preview as `待保存状态`.

- [Risk] Legacy records without `status` still need a value.
  → Mitigation: use `isActiveToStatus()` fallback and only use `pending` as the final fallback.

- [Risk] `isActive` can drift from selected status.
  → Mitigation: update hidden `isActive` whenever status changes and initialize it from canonical status.

- [Risk] React Hook Form default values do not update after async load.
  → Mitigation: mount `StoreForm` only after `storeData` exists, or call `reset()` when default values change.

## Migration Plan

1. Normalize API store status in the edit page mapping.
2. Include `status` in `StoreForm` default values for edit pages.
3. Ensure `StoreForm` resets or remounts when async default values change.
4. Update `LevelStatusFields` copy to distinguish current status from selected/draft status.
5. Update successful save flow to refresh persisted preview state.
6. Add regression coverage for all store statuses.

```

## openspec/changes/align-store-edit-status-field/tasks.md

- Source: openspec/changes/align-store-edit-status-field/tasks.md
- Lines: 1-49
- SHA256: 1a7ccd3d00da7a587b3860faff645751c160cccbc5f4124f22de6aad88d937ba

```md
## 1. Baseline Audit

- [ ] 1.1 Confirm `/api/stores/[id]?all=true` returns `status` for edit pages
- [ ] 1.2 Confirm `src/app/admin/(dashboard)/stores/[id]/page.tsx` currently omits `status` from `setStoreData()`
- [ ] 1.3 Confirm `LevelStatusFields` currently displays `pending` when form field value is missing
- [ ] 1.4 Record current labels for `pending`, `active`, `suspended`, and `terminated`

## 2. Status Normalization

- [ ] 2.1 Add or reuse a helper to normalize API store status with fallback order: `status` → `isActive` → `pending`
- [ ] 2.2 Include normalized `status` in edit page `storeData`
- [ ] 2.3 Initialize `isActive` from normalized status instead of independently trusting stale compatibility data
- [ ] 2.4 Ensure invalid unknown status values do not crash the edit page

## 3. Form State Synchronization

- [ ] 3.1 Ensure `StoreForm` receives `status` in `defaultValues` on edit pages
- [ ] 3.2 Ensure React Hook Form state resets or remounts if async default values change
- [ ] 3.3 Keep all `STORE_STATUSES` options in the status select
- [ ] 3.4 Keep hidden `isActive` synchronized whenever the selected status changes

## 4. Preview And Copy

- [ ] 4.1 Keep header badge and right-side `当前状态` card tied to persisted status
- [ ] 4.2 Add a draft/pending-save label when selected status differs from persisted status
- [ ] 4.3 Update helper text near the status select so admins understand the select is a saved-on-submit value
- [ ] 4.4 Avoid showing `当前状态` for unsaved draft values

## 5. Save Flow

- [ ] 5.1 After successful PUT, update local persisted status preview from response data or submitted status
- [ ] 5.2 After save failure, preserve previous persisted preview state
- [ ] 5.3 Ensure level/slug/sidebar preview updates continue to work after the status fix

## 6. Tests

- [ ] 6.1 Add unit or component tests for status initialization across all four statuses
- [ ] 6.2 Add a test for missing `status` with `isActive=true` deriving `active`
- [ ] 6.3 Add a test for missing `status` with `isActive=false` deriving a non-active fallback
- [ ] 6.4 Add a test for draft status differing from persisted current status
- [ ] 6.5 Add a test for successful save updating persisted status preview

## 7. Verification

- [ ] 7.1 Run targeted tests for store edit status initialization
- [ ] 7.2 Run targeted tests for `LevelStatusFields`
- [ ] 7.3 Run `npm run lint`
- [ ] 7.4 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [ ] 7.5 Browser-check the edit page with an active store and confirm the select shows `营业中`

```

## openspec/changes/align-store-edit-status-field/specs/store-edit-status-sync/spec.md

- Source: openspec/changes/align-store-edit-status-field/specs/store-edit-status-sync/spec.md
- Lines: 1-83
- SHA256: 3a17e391ffae76f2af26b60b17053083cc0887a7bb3160e27ef6cf9dce1de896

[TRUNCATED]

```md
## ADDED Requirements

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


```

Full source: openspec/changes/align-store-edit-status-field/specs/store-edit-status-sync/spec.md
