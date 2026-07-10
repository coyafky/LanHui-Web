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
