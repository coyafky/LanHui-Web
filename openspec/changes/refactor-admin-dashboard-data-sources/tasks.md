## 1. Baseline And Callers

- [ ] 1.1 Inventory all imports of `getKpiSnapshot`, `getStoreNetwork`, `getContentHealth`, `getDashboardSummary`, `getKpiSnapshotV2`, `getStoreSummary`, `getContentSummaryV2`, `getInterestSummaryV2`, and `getDashboardSummaryV2`
- [ ] 1.2 Record current V1 and V2 return shapes from `src/lib/admin-dashboard.test.ts`
- [ ] 1.3 Add missing baseline tests for `getStoreNetwork` and `getContentHealth` if they are not already directly covered
- [ ] 1.4 Add a baseline failure test for `getInterestSummaryV2` preserving `zeroReason: "query-failed"`

## 2. Result And Date Helpers

- [ ] 2.1 Add a shared `withDashboardResult` helper for `DashboardFetchResult<T>`
- [ ] 2.2 Ensure the helper logs `admin-dashboard.fetch.failed` with module names through `logger.warn`
- [ ] 2.3 Ensure the helper supports both `data: null` failures and explicit fallback data
- [ ] 2.4 Consolidate month range and days range helpers
- [ ] 2.5 Add tests for result helper success, default failure, fallback failure, and date helper behavior

## 3. KPI Refactor

- [ ] 3.1 Add a shared KPI raw data function covering V1 reservations and V2 contact intent
- [ ] 3.2 Add `toDashboardKpiV1` presenter returning `DashboardKpi`
- [ ] 3.3 Add `toDashboardKpiV2` presenter returning `DashboardKpiV2`
- [ ] 3.4 Refactor `getKpiSnapshot` to use the shared raw function and V1 presenter
- [ ] 3.5 Refactor `getKpiSnapshotV2` to use the shared raw function and V2 presenter
- [ ] 3.6 Update tests to verify both output shapes and representative query parameters

## 4. Store Refactor

- [ ] 4.1 Add a shared store raw data function selecting all fields required by V1 and V2
- [ ] 4.2 Add shared effective store status helper preserving `status` plus `isActive` fallback behavior
- [ ] 4.3 Add `toStoreNetworkV1` presenter returning `StoreNetwork`
- [ ] 4.4 Add `toStoreSummaryV2` presenter returning `StoreSummaryV2`
- [ ] 4.5 Refactor `getStoreNetwork` to use the shared raw function and V1 presenter
- [ ] 4.6 Refactor `getStoreSummary` to use the shared raw function and V2 presenter
- [ ] 4.7 Update tests for active/inactive counts, byProvince, byStatus labels, byLevel, topProvinces, and missingProfile

## 5. Content Refactor

- [ ] 5.1 Add a shared content raw data function covering status groups, category groups, recent published count, and missing cover count
- [ ] 5.2 Add `toContentHealthV1` presenter returning `ContentHealth`
- [ ] 5.3 Add `toContentSummaryV2` presenter returning `ContentSummaryV2`
- [ ] 5.4 Refactor `getContentHealth` to use the shared raw function and V1 presenter
- [ ] 5.5 Refactor `getContentSummaryV2` to use the shared raw function and V2 presenter
- [ ] 5.6 Update tests for V1 totals, V1 top categories, V2 labels, recent7dPublished, topCategories, and missingCover

## 6. Interest Summary Refactor

- [ ] 6.1 Extract `buildDailyTrend30d` or equivalent helper for pageview trends
- [ ] 6.2 Extract product and topic interest aggregation helpers
- [ ] 6.3 Extract store view aggregation helper
- [ ] 6.4 Extract contact trend helper
- [ ] 6.5 Extract zero reason helper
- [ ] 6.6 Refactor `getInterestSummaryV2` to compose these helpers through `withDashboardResult`
- [ ] 6.7 Preserve the existing failure fallback with empty arrays and `zeroReason: "query-failed"`

## 7. Summary Aggregators

- [ ] 7.1 Keep `getDashboardSummary` partial-failure behavior unchanged
- [ ] 7.2 Keep `getDashboardSummaryV2` partial-failure behavior unchanged
- [ ] 7.3 Ensure V2 quick actions remain role-aware and unchanged
- [ ] 7.4 Add or update tests for partial failures in both summary aggregators

## 8. Duplication Guard

- [ ] 8.1 Create `scripts/check-admin-dashboard-duplication.mjs`
- [ ] 8.2 Detect repeated V1/V2 Prisma query blocks for KPI, store, and content logic
- [ ] 8.3 Allow Prisma calls inside approved shared raw data helpers
- [ ] 8.4 Add `check:admin-dashboard-duplication` to `package.json`
- [ ] 8.5 Document the intended admin dashboard data layer structure in the script error message or a short code comment

## 9. Cleanup And Verification

- [ ] 9.1 Remove obsolete duplicated V1/V2 query blocks after presenters are wired
- [ ] 9.2 Keep all public export names stable
- [ ] 9.3 Run `npx vitest run src/lib/admin-dashboard.test.ts`
- [ ] 9.4 Run `npm run lint`
- [ ] 9.5 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [ ] 9.6 Run `npm run build`
- [ ] 9.7 Run `npm run check:admin-dashboard-duplication`

## 10. Follow-up Notes

- [ ] 10.1 Record whether V1 functions still have active callers after the refactor
- [ ] 10.2 If V1 has no callers, create a separate cleanup proposal to remove V1 exports in a later change
- [ ] 10.3 Record remaining opportunities to split `admin-dashboard.ts` if it remains too large after duplicate removal
