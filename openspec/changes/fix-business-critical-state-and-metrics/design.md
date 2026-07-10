## Context

The codebase already has dedicated action routes for article and store status transitions, but generic edit routes still accept status-shaped fields. That means the state machine exists without being the only write path. The public store list endpoint also allows `isActive=false` without requiring admin visibility, and the article GET endpoint performs writes by incrementing `viewCount`.

These issues cross public APIs, admin UI, validation schemas, tests, and analytics. The fix should be treated as a business correctness boundary rather than a cosmetic UI cleanup.

## Goals / Non-Goals

**Goals:**

- Prevent public callers from reading unpublished, suspended, terminated, or pending stores.
- Make article and store state transitions consistent, auditable, validated, rate-limited, and CSRF-protected through action endpoints.
- Keep profile editing focused on profile data only.
- Track public article views from real page exposure events, not from API reads.
- Update tests so they protect the new security and state-machine boundaries.

**Non-Goals:**

- Rebuilding the entire CMS workflow.
- Adding a new external APM or analytics vendor.
- Changing public article URL structure.
- Changing store phone-number policy or store level rules.

## Decisions

### Public store visibility defaults to active-only

For `GET /api/stores`, public mode is the default unless `all=true` is requested by an authenticated admin. In public mode, the query MUST force active stores only and MUST NOT honor `isActive=false` or non-active status filters.

Alternative considered: return `403` for unsupported public filters. That is stricter but can break existing public search clients. The preferred behavior is to ignore non-public visibility filters while guaranteeing no non-active rows are returned.

### Status fields are removed from profile update schemas

Article edit schemas and store profile schemas should omit state-machine fields. For stores this includes `status`, `isActive`, and `statusReason`. For articles this includes `status` and publication lifecycle fields such as `publishedAt` when they are derived from actions.

Alternative considered: allow admins to continue direct status edits. That preserves the current form but defeats transition validation, completeness checks, audit logs, and action-specific limits.

### UI status options become action controls

The admin UI may still show status options, but selecting a new status must resolve to an action route such as `publish`, `withdraw`, `suspend`, or `terminate`. A profile save must never carry status fields.

### Article views move to analytics events

The article GET endpoint becomes read-only. Public article pages emit a client-side `article_view` event after page exposure. The server validates the article exists and is published, then deduplicates by article/session/time window before aggregating to `viewCount` or a statistics table.

Alternative considered: increment in the RSC page. That still couples rendering/caching to writes and can undercount when cached output serves many users.

## Risks / Trade-offs

- Existing admin tests may expect direct status submission -> update fixtures and assertions to action endpoint calls.
- Existing analytics reports may have discontinuity -> document that old `viewCount` mixed API reads with page views.
- Users may expect status select + save behavior -> keep current status visible and provide explicit action buttons/options with confirmation and toast feedback.
- Public clients passing `isActive=false` may receive only active stores -> acceptable because non-active store data is not public.

## Migration Plan

1. Add failing tests for the four bugs before implementation.
2. Harden public store filters and remove insecure test expectations.
3. Introduce profile-only schemas for article/store edits and reject direct lifecycle fields.
4. Align admin UI actions and bulk actions to canonical action endpoints.
5. Remove article GET `viewCount` increments and add the `article_view` event pipeline.
6. Run targeted API/UI tests, then `npm run lint`, `npm run typecheck`, and relevant Playwright checks.

Rollback can restore previous endpoint behavior, but should only be used for severe production regression because it reopens the data visibility and state-machine bypass defects.
