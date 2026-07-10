## 1. Baseline Audit

- [ ] 1.1 Inventory all `/admin/stores` route files, including nested detail, edit, image, and new-store routes
- [ ] 1.2 Inventory dashboard cards, quick actions, todo links, and sidebar items that link to store admin routes
- [ ] 1.3 Confirm existing article-management routes and APIs that editors are allowed to use
- [ ] 1.4 Record current store API permission behavior for editor and admin sessions

## 2. Shared Permission Helpers

- [ ] 2.1 Create a shared admin permission module such as `src/lib/admin-permissions.ts`
- [ ] 2.2 Add role helpers for store access, store management, article access, and navigation filtering
- [ ] 2.3 Add unit tests for admin, editor, missing role, and unknown role behavior
- [ ] 2.4 Ensure helpers are safe to import from both server and client components where needed

## 3. Sidebar And Navigation

- [ ] 3.1 Update `src/components/admin/Sidebar.tsx` to derive visible nav items from user role
- [ ] 3.2 Hide store-management navigation for editors
- [ ] 3.3 Preserve article-management navigation for editors
- [ ] 3.4 Preserve full existing navigation for admins
- [ ] 3.5 Add or update Sidebar tests for admin and editor nav visibility

## 4. Store Route Guards

- [ ] 4.1 Add a reusable admin-only guard for store admin server pages
- [ ] 4.2 Guard `/admin/stores`
- [ ] 4.3 Guard nested store admin routes such as detail, edit, new, and image pages
- [ ] 4.4 Choose and implement one consistent editor denial behavior: shared forbidden UI or redirect to an allowed admin page
- [ ] 4.5 Ensure unauthenticated users still redirect to `/admin/login`

## 5. Store UI Alignment

- [ ] 5.1 Ensure store list fetching with `all=true` is only reachable through admin-only pages
- [ ] 5.2 Ensure store action controls are not rendered outside admin-only store pages
- [ ] 5.3 Ensure upload/edit/delete/state-transition store controls remain available for admins
- [ ] 5.4 Keep existing store status transition UI rules unchanged for admins

## 6. Dashboard Link Audit

- [ ] 6.1 Update dashboard quick actions so editors do not see links to store admin routes
- [ ] 6.2 Update dashboard todo items so editors do not see store-management tasks they cannot complete
- [ ] 6.3 Update any store analytics or maintenance cards that link to admin-only store routes
- [ ] 6.4 Keep admin dashboard store links unchanged

## 7. API Regression Coverage

- [ ] 7.1 Add or update tests proving editor calls to store state action endpoints return forbidden and do not mutate state
- [ ] 7.2 Add or update tests proving admin store state actions still follow existing transition rules
- [ ] 7.3 Add or update tests proving `/api/stores?all=true` does not leak inactive/unpublished data to editors

## 8. Verification

- [ ] 8.1 Run targeted permission helper tests
- [ ] 8.2 Run targeted Sidebar/navigation tests
- [ ] 8.3 Run targeted store admin route guard tests
- [ ] 8.4 Run targeted store API permission tests
- [ ] 8.5 Run `npm run lint`
- [ ] 8.6 Run `npm run typecheck` and document known pre-existing test-only errors if still present
