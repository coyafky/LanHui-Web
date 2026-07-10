## Why

The admin UI currently lets `editor` users enter store-management surfaces that are protected by admin-only APIs. This creates a broken experience: editors can see filters, rows, and action affordances, but `all=true` data and store state mutations are rejected or silently downgraded by the API.

## What Changes

- Define a consistent admin role model for the dashboard:
  - `admin`: full dashboard access, including store management and destructive/status-changing store actions.
  - `editor`: article/content workflow access only; no store management entry points.
- Make store-management admin-only across:
  - sidebar navigation
  - `/admin/stores` and nested store routes
  - store list/action UI affordances
  - store APIs that already enforce admin role
- Preserve editor access to article management and non-store dashboard surfaces that are explicitly safe for editors.
- Add a clear forbidden/redirect experience instead of letting editors land on half-functional store pages.
- Add tests or route-level checks proving editors cannot access store management but can still access article workflows.

## Capabilities

### New Capabilities

- `admin-role-permissions`: Defines role-based access contracts for admin dashboard navigation, route guards, store-management surfaces, and editor-safe content workflows.

### Modified Capabilities

- None.

## Impact

- Affected UI:
  - `src/app/admin/(dashboard)/layout.tsx`
  - `src/components/admin/Sidebar.tsx`
  - `src/app/admin/(dashboard)/stores/page.tsx`
  - nested store admin routes such as store detail, image, and action flows
- Affected APIs:
  - Existing store APIs remain admin-only; the UI will align with this contract instead of exposing unusable editor entry points.
- Affected auth/session behavior:
  - `session.user.role` becomes a first-class input to dashboard navigation and page guards.
- Risk:
  - Hiding store routes must not accidentally remove article access for editors.
  - Existing admin behavior must remain unchanged.
