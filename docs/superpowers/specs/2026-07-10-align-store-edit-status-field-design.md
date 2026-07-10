---
comet_change: align-store-edit-status-field
role: technical-design
canonical_spec: openspec
archived-with: 2026-07-10-align-store-edit-status-field
status: final
---

# Design Doc: Align Store Edit Status Field

## Context

The admin store edit page (`stores/[id]/page.tsx`) loads store data from `/api/stores/[id]?all=true` and maps it to `StoreForm` default values. The `status` field is omitted from the mapping (line 105-121), while `storeStatus` state correctly reads `d.status` for the header badge. This causes the `门店状态` select to show `待发布` even when the persisted store is `active`.

Root cause: `setStoreData()` does not include `status` in the mapped object. `LevelStatusFields` then hardcodes `?? "pending"` as fallback.

## Goals / Non-Goals

**Goals:**
- Pass persisted `status` into `StoreForm` default values on edit page load
- Keep all status options available in the select
- Keep header badge and right-side preview tied to persisted status
- Show draft/selected status as distinct from persisted current status
- Keep `isActive` synchronized with selected status
- Update persisted preview after successful save

**Non-Goals:**
- Do not redesign the store state machine
- Do not remove the status select
- Do not change store action endpoint permissions

## Decisions

### 1: Use `resolveStoreStatus()` as Canonical Fallback

The existing `resolveStoreStatus()` helper in `src/lib/validations/store.ts:62` provides the correct fallback chain: `d.status` → `isActiveToStatus(d.isActive)` → `"pending"`. Use it in `setStoreData()` mapping.

### 2: Form `status` Field Represents Draft, `storeStatus` State Represents Persisted

The edit page already has `storeStatus` state for the header badge. Keep it as the persisted preview source. The form's `status` field represents the selectable draft value. After save, update `storeStatus` from the response.

### 3: Remove Implicit "pending" Hardcode from `LevelStatusFields`

Change `value={field.value ?? "pending"}` to `value={field.value ?? ""}` or pass a sensible default from the parent. The parent (edit page) is now responsible for providing the correct initial value.

### 4: Save Flow Update

After successful PUT, update `storeStatus` and `storeData.status` from the saved response or submitted values.

## Risks / Trade-offs

- [Risk] Legacy records without `status` → Mitigation: `resolveStoreStatus()` handles `isActive` fallback
- [Risk] `isActive` drift → Mitigation: keep `isActive` in form data synchronized with status
- [Risk] React Hook Form stale defaults → Mitigation: `StoreForm` mounts after `storeData` exists (already the case with `if (!storeData) return null`)

## Files Changed

1. `src/app/admin/(dashboard)/stores/[id]/page.tsx` — add `status` to `setStoreData()` mapping + save flow update
2. `src/components/admin/stores/LevelStatusFields.tsx` — fix hardcoded `pending` fallback

