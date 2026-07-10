## 1. Baseline Audit

- [x] 1.1 Confirm `/api/stores/[id]?all=true` returns `status` for edit pages
- [x] 1.2 Confirm `src/app/admin/(dashboard)/stores/[id]/page.tsx` currently omits `status` from `setStoreData()`
- [x] 1.3 Confirm `LevelStatusFields` currently displays `pending` when form field value is missing
- [x] 1.4 Record current labels for `pending`, `active`, `suspended`, and `terminated`

## 2. Status Normalization

- [x] 2.1 Add or reuse a helper to normalize API store status with fallback order: `status` → `isActive` → `pending`
- [x] 2.2 Include normalized `status` in edit page `storeData`
- [x] 2.3 Initialize `isActive` from normalized status instead of independently trusting stale compatibility data
- [x] 2.4 Ensure invalid unknown status values do not crash the edit page

## 3. Form State Synchronization

- [x] 3.1 Ensure `StoreForm` receives `status` in `defaultValues` on edit pages
- [x] 3.2 Ensure React Hook Form state resets or remounts if async default values change
- [x] 3.3 Keep all `STORE_STATUSES` options in the status select
- [x] 3.4 Keep hidden `isActive` synchronized whenever the selected status changes

## 4. Preview And Copy

- [x] 4.1 Keep header badge and right-side `当前状态` card tied to persisted status
- [x] 4.2 Add a draft/pending-save label when selected status differs from persisted status
- [x] 4.3 Update helper text near the status select so admins understand the select is a saved-on-submit value
- [x] 4.4 Avoid showing `当前状态` for unsaved draft values

## 5. Save Flow

- [x] 5.1 After successful PUT, update local persisted status preview from response data or submitted status
- [x] 5.2 After save failure, preserve previous persisted preview state
- [x] 5.3 Ensure level/slug/sidebar preview updates continue to work after the status fix

## 6. Tests

- [x] 6.1 Add unit or component tests for status initialization across all four statuses
- [x] 6.2 Add a test for missing `status` with `isActive=true` deriving `active`
- [x] 6.3 Add a test for missing `status` with `isActive=false` deriving a non-active fallback
- [x] 6.4 Add a test for draft status differing from persisted current status
- [x] 6.5 Add a test for successful save updating persisted status preview

## 7. Verification

- [x] 7.1 Run targeted tests for store edit status initialization
- [x] 7.2 Run targeted tests for `LevelStatusFields`
- [x] 7.3 Run `npm run lint`
- [x] 7.4 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [x] 7.5 Browser-check the edit page with an active store and confirm the select shows `营业中`
