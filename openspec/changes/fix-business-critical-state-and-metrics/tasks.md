## 1. Store Visibility

- [ ] 1.1 Add failing API tests proving unauthenticated `GET /api/stores?isActive=false` and non-active status filters do not return non-active stores.
- [ ] 1.2 Update `src/app/api/stores/route.ts` so public/non-admin requests are always constrained to active stores unless an authenticated admin successfully requests `all=true`.
- [ ] 1.3 Update admin-only store list tests to prove admins can still filter inactive and non-active stores with `all=true`.

## 2. Article State Machine

- [ ] 2.1 Create or tighten an article profile update schema that excludes `status` and lifecycle-owned publication fields.
- [ ] 2.2 Update `PUT /api/articles/{id}` to reject lifecycle fields and preserve existing status during content edits.
- [ ] 2.3 Align article table/form action code to canonical actions: `publish`, `withdraw`, `republish`, `archive`, `restore`, and `delete` where deletion is supported.
- [ ] 2.4 Update article action and bulk tests so撤回发布 calls `withdraw` and no UI path sends `unpublish` or direct `{ status: ... }` through the generic edit endpoint.

## 3. Store State Machine

- [ ] 3.1 Create `StoreProfileUpdateSchema` from store validation schemas that omits `status`, `isActive`, and `statusReason`.
- [ ] 3.2 Update `POST`, `PUT`, and `PATCH` store profile routes so lifecycle fields are rejected or ignored according to the accepted API contract, and new stores do not become active without the publish action.
- [ ] 3.3 Replace the store edit page's profile status select submission with read-only current status plus explicit action controls that call `publish`, `suspend`, `resume`, or `terminate`.
- [ ] 3.4 Add tests proving profile saves exclude lifecycle fields and status action failures leave the current status preview unchanged.

## 4. Article View Tracking

- [ ] 4.1 Remove `viewCount` increments from `GET /api/articles/{id}` and update tests to assert the route is read-only.
- [ ] 4.2 Add or extend an `article_view` analytics event endpoint that validates published articles and requires a session identity.
- [ ] 4.3 Implement dedupe/windowing so repeated article views from the same session within the configured window only count once.
- [ ] 4.4 Emit `article_view` from the public article detail page only, not from admin edit pages or CMS data fetches.
- [ ] 4.5 Update admin labels/docs/tests so article view counts are treated as deduplicated public exposure metrics.

## 5. Verification

- [ ] 5.1 Run targeted API route tests for stores, article actions, article bulk actions, and article view events.
- [ ] 5.2 Run targeted admin UI tests for article actions and store edit status actions.
- [ ] 5.3 Run `npm run lint`.
- [ ] 5.4 Run `npm run typecheck` and document the known pre-existing test-only type errors if still present.
- [ ] 5.5 Run a browser check for public article pages and admin store/article pages at desktop and mobile widths.
