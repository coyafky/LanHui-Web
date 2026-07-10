# Task 3.2 Report: Migrate stores/[id]/page.tsx to use useStoreAction hook

## Status: DONE_WITH_CONCERNS

## What Changed

### Created
- **`src/hooks/use-store-action.ts`** — The hook file (was referenced as "already created, committed as 455f87d" in the task spec, but did not exist in the working tree. Created from scratch based on the task description interface.)

### Modified
- **`src/app/admin/(dashboard)/stores/[id]/page.tsx`** — migrated inline action state to the hook:
  1. Removed `type StoreAction` import from `@/lib/validations/store-transitions`
  2. Added `import { useStoreAction, type StoreAction } from "@/hooks/use-store-action"`
  3. Replaced 4 `useState` declarations (`actionOpen`, `statusReason`, `acting`, `actionError`) with `useStoreAction(id, { onSuccess: ... })`
  4. Removed the 47-line `performStatusAction` function (replaced by hook's `performAction`)
  5. Replaced inline `onClick` with `openAction(action)`
  6. Replaced `onConfirm` to call `performAction` (kept same inline reason validation)
  7. Replaced `onCancel` with `closeAction()`

### Hook type adjustments (vs. task spec)
- Changed `StoreAction` type from `"open" | "close" | "suspend" | "terminate"` to `"publish" | "suspend" | "resume" | "terminate"` to match the actual API route (`/api/stores/[id]/[action]`) and the existing `ACTION_TARGET`/`ACTION_ICON` usage in the page
- Added `setActionError` to the hook's exposed return interface (needed for inline reason validation in the ConfirmDialog)

## Typecheck Result

**PASS** — 0 errors in the stores page file. 19 pre-existing errors in test files (unchanged from baseline):
- `src/app/api/analytics/stats/route.test.ts` (3 BigInt errors — known)
- `src/lib/analytics.test.ts` (6 tuple cast errors — known)
- `src/app/admin/(dashboard)/articles/*.test.tsx` (2 errors)
- `src/app/product/*.test.tsx` (8 errors)

## Concerns

1. **Hook file missing**: The hook was supposed to exist at `src/hooks/use-store-action.ts` (committed as 455f87d) but was not found in the working tree. Had to create it.

2. **StoreAction type mismatch** (task spec vs. API reality): The task spec shows `StoreAction = "open" | "close" | "suspend" | "terminate"`, but the actual store API only accepts `"publish"`, `"suspend"`, `"resume"`, `"terminate"`. Changed the hook's type to match the API. Using `"open"`/`"close"` would result in 400 errors from the API route.

3. **`setActionError` missing from hook**: The task spec's onConfirm handler calls `setActionError("请填写原因")` for inline validation, but the hook didn't expose a `setActionError` setter. Added it to maintain the existing inline validation pattern.
