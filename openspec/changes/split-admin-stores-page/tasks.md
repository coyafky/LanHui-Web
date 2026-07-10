## 1. Baseline Audit

- [ ] 1.1 Record current `src/app/admin/(dashboard)/stores/page.tsx` line count and inline component list
- [ ] 1.2 Record current query parameters and default values for search, province, city, level, status, image, sort, page, and group
- [ ] 1.3 Record current stores API request shape from the page
- [ ] 1.4 Verify current BulkBar behavior with multiple selected ids and document whether only the first selected id is acted on
- [ ] 1.5 Run existing stores page tests or create a minimal baseline smoke test if none exists

## 2. Shared Types

- [ ] 2.1 Create `src/components/admin/stores/types.ts`
- [ ] 2.2 Move `StoreRow`, `ProvinceOption`, pagination, group mode, sort key, and image filter types into the shared types module
- [ ] 2.3 Update `stores/page.tsx` imports to use shared types

## 3. Extract Pure UI Components

- [ ] 3.1 Extract `LevelBadge` to `src/components/admin/stores/LevelBadge.tsx`
- [ ] 3.2 Extract `StatusBadge` to `src/components/admin/stores/StatusBadge.tsx`
- [ ] 3.3 Extract `LevelFilter` to `src/components/admin/stores/LevelFilter.tsx`
- [ ] 3.4 Extract `Kbd` and `KbdFooter` to `src/components/admin/stores/KeyboardHints.tsx`
- [ ] 3.5 Extract `KpiStrip` and `KpiTile` to `src/components/admin/stores/KpiStrip.tsx`
- [ ] 3.6 Extract `TableSkeleton` to `src/components/admin/stores/TableSkeleton.tsx`
- [ ] 3.7 Add `src/components/admin/stores/index.ts` barrel exports
- [ ] 3.8 Add focused component tests for badges, LevelFilter, KpiStrip, and TableSkeleton

## 4. Extract Table And Columns

- [ ] 4.1 Extract `buildColumns` to `src/components/admin/stores/storeColumns.tsx`
- [ ] 4.2 Extract `StoreTable` to `src/components/admin/stores/StoreTable.tsx`
- [ ] 4.3 Ensure StoreTable receives explicit props instead of closing over page state
- [ ] 4.4 Preserve selection checkbox behavior
- [ ] 4.5 Preserve row action buttons and available action logic
- [ ] 4.6 Add StoreTable tests for rendering rows, selecting rows, and triggering row actions

## 5. URL Sync Hook

- [ ] 5.1 Create `src/hooks/use-admin-stores-url-sync.ts`
- [ ] 5.2 Parse initial state from existing query parameters
- [ ] 5.3 Serialize state back to query parameters using `router.replace(..., { scroll: false })`
- [ ] 5.4 Preserve multi-value `level` query parameters
- [ ] 5.5 Preserve search input debounce behavior
- [ ] 5.6 Provide reset filters and active filter count helpers
- [ ] 5.7 Add hook tests for parsing, serialization, multi-level filters, reset, and debounce

## 6. Store Fetch Hook

- [ ] 6.1 Create `src/hooks/use-admin-stores-fetch.ts`
- [ ] 6.2 Move `/api/stores` URLSearchParams construction into the hook
- [ ] 6.3 Move loading, error, stores, pagination, and refetch state into the hook
- [ ] 6.4 Preserve pagination updates from API response
- [ ] 6.5 Extract province and city option loading into the hook or separate small hooks
- [ ] 6.6 Preserve city reset behavior when province is cleared
- [ ] 6.7 Add hook tests for fetch success, fetch failure, refetch, province loading, and city loading

## 7. BulkBar Bug Fix

- [ ] 7.1 Extract `BulkBar` to `src/components/admin/stores/BulkBar.tsx`
- [ ] 7.2 Change BulkBar API so action handlers receive all selected ids, not just one id
- [ ] 7.3 Implement true multi-selected action behavior using a bulk endpoint if available, otherwise sequentially call existing single-store action endpoints
- [ ] 7.4 Filter or report selected stores that are ineligible for the chosen action
- [ ] 7.5 Show success, partial failure, and all-failure feedback
- [ ] 7.6 Clear selection only when all selected actions succeed, or preserve failed/skipped ids on partial failure
- [ ] 7.7 Add regression test proving multiple selected ids are processed

## 8. Page Composition Refactor

- [ ] 8.1 Replace inline UI component definitions in `stores/page.tsx` with imports
- [ ] 8.2 Replace URL parsing/sync code with `useAdminStoresUrlSync`
- [ ] 8.3 Replace store/province/city fetch code with `useAdminStoresFetch`
- [ ] 8.4 Keep keyboard shortcuts wired to the new state/hook APIs
- [ ] 8.5 Keep grouping logic either in page or extract to a pure helper if it remains large
- [ ] 8.6 Keep store action confirm dialog behavior compatible with current UI
- [ ] 8.7 Reduce `stores/page.tsx` toward composition-only structure

## 9. Duplication Guard

- [ ] 9.1 Create `scripts/check-admin-stores-page-size.mjs`
- [ ] 9.2 Fail if `stores/page.tsx` reintroduces extracted component definitions
- [ ] 9.3 Warn or fail if `stores/page.tsx` grows above the agreed line-count budget after refactor
- [ ] 9.4 Add `check:admin-stores-page` to `package.json`

## 10. Verification

- [ ] 10.1 Run focused tests for `src/components/admin/stores/*`
- [ ] 10.2 Run focused tests for `use-admin-stores-url-sync` and `use-admin-stores-fetch`
- [ ] 10.3 Run stores page smoke/page tests
- [ ] 10.4 Run `npm run lint`
- [ ] 10.5 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [ ] 10.6 Run `npm run build`
- [ ] 10.7 Run `npm run check:admin-stores-page`

## 11. Follow-up Notes

- [ ] 11.1 Record whether `useStoreAction` from the admin shared page patterns change should replace any local store action logic
- [ ] 11.2 Record remaining large blocks in `stores/page.tsx` that may deserve a follow-up extraction
