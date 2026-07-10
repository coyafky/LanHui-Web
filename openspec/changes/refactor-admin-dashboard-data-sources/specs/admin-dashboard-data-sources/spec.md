## ADDED Requirements

### Requirement: Dashboard public export compatibility
The system SHALL preserve existing public dashboard data exports while refactoring their internal implementation. Existing callers MUST be able to import the same function names and receive the same public result shapes.

#### Scenario: V1 exports remain available
- **WHEN** code imports `getKpiSnapshot`, `getStoreNetwork`, `getContentHealth`, or `getDashboardSummary`
- **THEN** the imports resolve and return the documented V1 `DashboardFetchResult` shapes

#### Scenario: V2 exports remain available
- **WHEN** code imports `getKpiSnapshotV2`, `getStoreSummary`, `getContentSummaryV2`, `getInterestSummaryV2`, or `getDashboardSummaryV2`
- **THEN** the imports resolve and return the documented V2 `DashboardFetchResult` shapes

### Requirement: Shared KPI data source
The system SHALL use one shared KPI data source for V1 and V2 KPI functions. V1 and V2 MUST not duplicate the same Prisma query and month-range logic in separate full implementations.

#### Scenario: V1 KPI maps from shared data
- **WHEN** `getKpiSnapshot` succeeds
- **THEN** it returns `activeStores`, `publishedArticles`, `monthlyPageViews`, and `monthlyReservations` derived from the shared KPI data source

#### Scenario: V2 KPI maps from shared data
- **WHEN** `getKpiSnapshotV2` succeeds
- **THEN** it returns `activeStores`, `publishedArticles`, `monthlyPageViews`, and `monthlyContactIntent` derived from the shared KPI data source

#### Scenario: KPI query failure
- **WHEN** the shared KPI data source throws
- **THEN** both V1 and V2 KPI functions return `ok: false` with an error message and compatible `data` fallback behavior

### Requirement: Shared store data source
The system SHALL use one shared store data source for V1 store network and V2 store summary functions. Store status fallback, province aggregation, level aggregation, and missing profile counting MUST be derived from the same fetched store records.

#### Scenario: V1 store network maps from shared records
- **WHEN** `getStoreNetwork` succeeds
- **THEN** it returns `byProvince`, `totalActive`, and `totalInactive` derived from the shared store records

#### Scenario: V2 store summary maps from shared records
- **WHEN** `getStoreSummary` succeeds
- **THEN** it returns `byStatus`, `topProvinces`, `byLevel`, and `missingProfile` derived from the shared store records

#### Scenario: Store status fallback preserved
- **WHEN** a store row lacks a valid `status`
- **THEN** V2 status aggregation uses the existing `isActive` fallback behavior

### Requirement: Shared content data source
The system SHALL use one shared content data source for V1 content health and V2 content summary functions. Article status and category aggregations MUST not be implemented twice with divergent query logic.

#### Scenario: V1 content health maps from shared data
- **WHEN** `getContentHealth` succeeds
- **THEN** it returns `byStatus`, `byCategory`, `totalDrafts`, `totalPublished`, and `totalArchived` derived from shared content data

#### Scenario: V2 content summary maps from shared data
- **WHEN** `getContentSummaryV2` succeeds
- **THEN** it returns labeled `byStatus`, `recent7dPublished`, `topCategories`, and `missingCover` derived from shared content data

#### Scenario: Content labels preserved
- **WHEN** V2 content status rows are returned
- **THEN** known statuses use the existing Chinese labels such as `草稿`, `已发布`, `已归档`, and `已撤回`

### Requirement: Interest summary helper extraction
The system SHALL refactor `getInterestSummaryV2` into smaller internal helpers without changing its public output shape. The function MUST preserve trend filling, top product/topic/store calculations, contact trend calculation, and zero reason behavior.

#### Scenario: Interest summary success shape
- **WHEN** `getInterestSummaryV2` succeeds
- **THEN** it returns `dailyTrend30d`, `topProductInterest`, `topTopicInterest`, `topStoreViews`, `contactTrend30d`, and `zeroReason`

#### Scenario: Interest summary query failure fallback
- **WHEN** an interest summary query throws
- **THEN** `getInterestSummaryV2` returns `ok: false`, empty arrays for list fields, and `zeroReason: "query-failed"`

### Requirement: Unified dashboard result handling
The system SHALL centralize dashboard result wrapping and error logging for dashboard data functions. Repeated local `try/catch` blocks MUST be replaced by a shared result helper where practical.

#### Scenario: Successful result
- **WHEN** a dashboard data helper succeeds
- **THEN** the result wrapper returns `{ ok: true, data }`

#### Scenario: Failed result logs module
- **WHEN** a dashboard data helper fails
- **THEN** the result wrapper logs `admin-dashboard.fetch.failed` with the module name and returns `ok: false`

#### Scenario: Failed result supports fallback data
- **WHEN** a dashboard data helper defines fallback data for failure
- **THEN** the result wrapper returns that fallback data instead of `null`

### Requirement: Dashboard summary aggregation compatibility
The system SHALL preserve the V1 and V2 summary aggregation behavior. A failed individual data source MUST not cause the whole dashboard summary to throw.

#### Scenario: V1 partial failure
- **WHEN** one V1 dashboard data source fails
- **THEN** `getDashboardSummary` returns `null` for that section and preserves successful sections

#### Scenario: V2 partial failure
- **WHEN** one V2 dashboard data source fails
- **THEN** `getDashboardSummaryV2` returns `null` for that section and preserves successful sections and quick actions

### Requirement: Duplication prevention
The system SHALL include a guard against reintroducing large V1/V2 duplicate query blocks in `admin-dashboard.ts`. The guard MUST fail when new duplicated dashboard Prisma query logic appears outside approved shared data source functions.

#### Scenario: Duplicated dashboard query block rejected
- **WHEN** `admin-dashboard.ts` contains separate V1 and V2 implementations that repeat the same Prisma query block
- **THEN** the duplication check fails with a message directing developers to the shared data source layer

#### Scenario: Shared data source allowed
- **WHEN** Prisma queries appear inside approved shared raw data functions
- **THEN** the duplication check allows them

### Requirement: Verification coverage
The system SHALL add or update tests for the refactored dashboard data layer. Tests MUST cover V1 shape, V2 shape, shared failure handling, and representative query parameters.

#### Scenario: Existing dashboard tests pass
- **WHEN** `src/lib/admin-dashboard.test.ts` runs
- **THEN** existing V1 and V2 behavior tests pass after the refactor

#### Scenario: Shared result helper tested
- **WHEN** shared result helper tests run
- **THEN** success, failure with null data, and failure with fallback data are covered

#### Scenario: Query sharing tested
- **WHEN** V1 and V2 functions are exercised in tests
- **THEN** tests verify they rely on shared raw data helpers or equivalent shared query behavior rather than separate duplicated implementations
