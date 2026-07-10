## Context

The dashboard route group currently guards only authentication in `src/app/admin/(dashboard)/layout.tsx`. Once authenticated, both `admin` and `editor` users receive the same sidebar navigation and can reach `/admin/stores`.

The store-management UI then calls `/api/stores?all=true`, but the API only honors `all=true` for admins. Store state actions such as publish, suspend, resume, and terminate are also admin-only. As a result, editors can land on store screens that either show incomplete public-only data or expose actions that will fail with `403`.

## Goals / Non-Goals

**Goals:**

- Align admin dashboard navigation, page access, and API permissions.
- Make the store-management module admin-only.
- Keep editor access focused on content workflows, especially article management.
- Provide a clear denial/redirect path for editors who manually visit store admin URLs.
- Preserve existing admin behavior and existing store API permission checks.

**Non-Goals:**

- This change does not introduce a full RBAC permission matrix or database-stored permissions.
- This change does not make store management read-only for editors.
- This change does not change public store pages or public store APIs.
- This change does not loosen existing store write permissions.

## Decisions

### Decision 1: Store Management Is Admin-Only

Editors will not see or access store-management routes. This matches the existing API contract, where `all=true` data and store state actions are admin-only.

Alternative considered: make `/admin/stores` read-only for editors. Rejected for this change because the current page is action-heavy and relies on unpublished/inactive data; making it truly read-only would require additional UI states, API contracts, and audit rules.

### Decision 2: Use Shared Role Helpers

Create a small shared role helper, for example `src/lib/admin-permissions.ts`, to centralize role decisions:

- `canAccessStoreAdmin(role)`
- `canManageStores(role)`
- `canAccessArticleAdmin(role)`
- `filterAdminNavItems(role)`

This prevents Sidebar, layout guards, and page guards from drifting.

### Decision 3: Guard Store Routes At Page Level

Use server-side route guards for store admin pages and nested store routes. An editor manually visiting `/admin/stores` or `/admin/stores/<id>` MUST receive a clear forbidden state or be redirected to an allowed page such as `/admin/articles`.

The preferred behavior is:

- unauthenticated: redirect to `/admin/login`
- authenticated editor on store route: redirect to `/admin/articles?forbidden=stores` or render a shared forbidden page
- authenticated admin: render normally

Implementation can choose redirect or forbidden UI, but it must be consistent across all store admin routes.

### Decision 4: Sidebar Is Role-Aware

Sidebar navigation must be derived from the session role. Editors must not see:

- 门店管理
- store-specific quick actions
- any store settings/action routes

Editors may continue seeing article management and dashboard items that do not expose admin-only mutations. If a dashboard card links to store admin surfaces, it must be hidden or disabled for editors.

### Decision 5: APIs Remain The Final Authorization Boundary

Store APIs should keep enforcing admin-only permissions. UI changes improve experience but must not become the security boundary.

## Risks / Trade-offs

- [Risk] Editors may lose visibility into store data they previously saw partially.
  → Mitigation: document the role model and route editors to article/content work.

- [Risk] Hidden sidebar links do not protect manual URL access.
  → Mitigation: add server-side guards to store admin routes and keep API role checks.

- [Risk] Role checks can drift if implemented inline.
  → Mitigation: use shared permission helpers and tests.

- [Risk] Dashboard cards may still link editors to forbidden store pages.
  → Mitigation: audit quick actions, todo items, and dashboard links for role-aware rendering.

## Migration Plan

1. Add shared admin permission helpers.
2. Make Sidebar navigation role-aware.
3. Add page-level guards for `/admin/stores` and nested store admin routes.
4. Audit dashboard links and quick actions that point to store admin surfaces.
5. Add tests for admin/editor navigation and route access.
6. Keep store API admin checks unchanged and add regression coverage where missing.

Rollback is straightforward: revert UI/page guard changes while keeping the existing API permissions.
