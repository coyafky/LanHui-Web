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
