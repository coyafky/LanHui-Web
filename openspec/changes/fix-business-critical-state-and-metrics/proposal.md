## Why

Several admin/public APIs currently blur read visibility, profile editing, state transitions, and analytics side effects. This creates real business bugs: public callers can discover non-public stores, article/store state machines can be bypassed by generic edit endpoints, and article view metrics are corrupted by API reads, crawlers, admin screens, and cache behavior.

## What Changes

- Lock public store listing visibility so unauthenticated and non-admin callers can only receive actively operating stores, regardless of `isActive=false` or non-active status filters.
- **BREAKING**: Make article status changes action-only via `POST /api/articles/{id}/{action}`; ordinary article edit endpoints must reject direct `status`/publication state mutation.
- **BREAKING**: Make store status changes action-only via `POST /api/stores/{id}/{action}`; ordinary store profile endpoints must reject `status`, `isActive`, and `statusReason`.
- Remove database writes from article GET endpoints and replace automatic `viewCount` increments with a client-side `article_view` event flow that validates, deduplicates, and aggregates public page exposures.
- Update existing admin UI contracts so status controls can remain visible, but only as explicit action controls that call the state-machine endpoints.

## Capabilities

### New Capabilities

- `store-api-visibility`: Public/admin store list visibility rules and filter authorization.
- `article-status-actions`: Canonical article status state machine and action-only mutation contract.
- `store-status-actions`: Canonical store status state machine and action-only mutation contract.
- `article-view-events`: Public article view tracking through validated analytics events instead of GET side effects.

### Modified Capabilities

- `store-edit-status-sync`: Replace editable profile status submission with read-only current status plus state-machine action controls.
- `article-bulk-actions`: Ensure batch article mutations use canonical action names and the same state-machine rules as single-row actions.

## Impact

- API routes: `src/app/api/stores/route.ts`, `src/app/api/stores/[id]/route.ts`, `src/app/api/stores/[id]/[action]/route.ts`, `src/app/api/articles/[id]/route.ts`, `src/app/api/articles/[id]/[action]/route.ts`, `src/app/api/articles/bulk/route.ts`, and analytics tracking routes.
- Admin UI: article list/form actions, store edit form, store detail actions, status badges/previews, confirmation dialogs, and toast feedback.
- Validation/data layer: Zod schemas for article profile edits and store profile edits; status transition helpers; tests that currently encode insecure or bypass behavior.
- Metrics: article detail public page exposure tracking, dedupe/windowing logic, and `viewCount` update strategy.
