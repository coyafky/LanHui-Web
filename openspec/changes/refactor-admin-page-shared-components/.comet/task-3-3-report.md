# Task 3.3 Report: Migrate Stores Page to useStoreAction

## Status: DONE

## What Changed

### `src/app/admin/(dashboard)/stores/page.tsx`

1. **Added import** for `useStoreAction` from `@/hooks/use-store-action` (line after `availableActionsFor` import).

2. **Extracted `StoreRowActions` component** (new function component, module-level):
   - One `useStoreAction(store.id, { onSuccess: () => onFetchStores() })` instance per row.
   - Renders action buttons (publish/suspend/resume/terminate) directly in the row cell.
   - Renders its own `<ConfirmDialog>` for single-row actions, using the hook's state (`actionOpen`, `statusReason`, `actionError`, `performAction`, etc.).
   - Validates reason textarea is filled for suspend/terminate before calling `performAction`.

3. **Modified `buildColumns`**:
   - Removed `onAction` parameter (no longer needed — each row manages its own action).
   - Added `onFetchStores` parameter, passed through to `StoreRowActions`.
   - Actions cell now renders `<StoreRowActions store={row.original} onFetchStores={onFetchStores} />`.

4. **Replaced centralized action state** in `StoresPageInner`:
   - Removed: `actionTarget`, `statusReason`, `acting`, `actionError` state.
   - Removed: `openActionDialog`, `closeActionDialog`, `confirmAction` functions.
   - Added page-level state for keyboard + bulk only: `pageActionTarget`, `pageStatusReason`, `pageActing`, `pageActionError`.
   - Added `openPageAction` and `pageConfirmAction` functions (same logic as old, but isolated to keyboard/bulk).

5. **Updated `handleBulkAction`**: Changed `openActionDialog(row, action)` → `openPageAction(row, action)`.

6. **Updated keyboard handler**: Changed `openActionDialog(row, action)` → `openPageAction(row, action)`.

7. **Updated columns memo**: Changed `buildColumns(openActionDialog, selectedIds, setSelectedIds)` → `buildColumns(selectedIds, setSelectedIds, fetchStores)` with deps `[selectedIds, fetchStores]`.

8. **Replaced bottom `ConfirmDialog`**:
   - Now driven by `pageActionTarget` state (keyboard shortcuts + bulk only).
   - Single-row button clicks use the per-row `ConfirmDialog` in `StoreRowActions`.

## Typecheck Result

`npx tsc --noEmit` reports **0 errors** in `stores/page.tsx`. All pre-existing errors in test files are unchanged.

## Boundaries / Residual Risk

- **Bulk action behavior unchanged**: `handleBulkAction` still operates on the first selected store only (pre-existing logic, not touched).
- **Keyboard handler behavior unchanged**: Uses `openPageAction` → page-level dialog, same as before but with renamed state.
- **`StoreRowActions` dialogs are stacked** (one per row in the table), but only one is ever open at a time since `useStoreAction` manages single-row state locally. React's reconciliation handles this correctly.
- **No visual or behavioral change** for the user: action buttons, dialogs, and flow are identical.
