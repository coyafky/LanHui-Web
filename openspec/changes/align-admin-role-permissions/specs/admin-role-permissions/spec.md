## ADDED Requirements

### Requirement: Dashboard roles have explicit capabilities
The system SHALL define explicit dashboard capabilities for `admin` and `editor` roles.

#### Scenario: Admin has store capability
- **WHEN** the authenticated user role is `admin`
- **THEN** the system grants access to store-management dashboard routes and store-management actions

#### Scenario: Editor does not have store capability
- **WHEN** the authenticated user role is `editor`
- **THEN** the system does not grant access to store-management dashboard routes or store-management actions

#### Scenario: Editor keeps article capability
- **WHEN** the authenticated user role is `editor`
- **THEN** the system grants access to article-management workflows that are allowed by existing article APIs

### Requirement: Sidebar navigation is role-aware
The dashboard sidebar SHALL render navigation items according to the authenticated user's role.

#### Scenario: Admin sees store management
- **WHEN** an admin views the dashboard sidebar
- **THEN** the sidebar includes the store-management navigation item

#### Scenario: Editor does not see store management
- **WHEN** an editor views the dashboard sidebar
- **THEN** the sidebar does not include the store-management navigation item

#### Scenario: Editor sees article management
- **WHEN** an editor views the dashboard sidebar
- **THEN** the sidebar includes the article-management navigation item

### Requirement: Store admin routes are admin-only
The system SHALL protect `/admin/stores` and nested store admin routes with an admin-only server-side guard.

#### Scenario: Unauthenticated user is redirected to login
- **WHEN** an unauthenticated user requests a store admin route
- **THEN** the system redirects the user to `/admin/login`

#### Scenario: Editor cannot open store list
- **WHEN** an editor requests `/admin/stores`
- **THEN** the system returns a clear forbidden experience or redirects the editor to an allowed admin page

#### Scenario: Editor cannot open nested store route
- **WHEN** an editor requests a nested store admin route such as store detail or store image management
- **THEN** the system returns a clear forbidden experience or redirects the editor to an allowed admin page

#### Scenario: Admin can open store routes
- **WHEN** an admin requests `/admin/stores` or a nested store admin route
- **THEN** the system renders the requested store admin page

### Requirement: Store admin UI does not expose unusable editor actions
The system SHALL NOT expose store-management action controls to users who cannot run the corresponding store APIs.

#### Scenario: Editor has no store action controls
- **WHEN** an editor is on any allowed admin page
- **THEN** the UI does not render controls that call store publish, suspend, resume, terminate, upload, or edit endpoints

#### Scenario: Admin keeps store action controls
- **WHEN** an admin is on a store-management page
- **THEN** the UI renders store-management controls according to the existing store status rules

### Requirement: Dashboard links respect role permissions
Dashboard cards, quick actions, todo items, and navigation links SHALL respect the same role permissions as the target routes.

#### Scenario: Editor dashboard has no forbidden store links
- **WHEN** an editor views the dashboard landing page
- **THEN** the page does not link to store admin routes the editor cannot access

#### Scenario: Admin dashboard keeps store links
- **WHEN** an admin views the dashboard landing page
- **THEN** store-related dashboard links remain visible where they exist today

### Requirement: Store APIs remain admin-protected
Store APIs SHALL remain the final authorization boundary for store management.

#### Scenario: Editor store list all flag is rejected or ignored
- **WHEN** an editor calls `/api/stores?all=true`
- **THEN** the API does not return admin-only inactive or unpublished store data

#### Scenario: Editor store action is forbidden
- **WHEN** an editor calls a store state action endpoint
- **THEN** the API returns a forbidden response and does not mutate store state

#### Scenario: Admin store action still works
- **WHEN** an admin calls a valid store state action endpoint
- **THEN** the API applies the existing transition rules and mutates store state when valid

### Requirement: Permission behavior is tested
The system SHALL include tests or targeted checks for dashboard role behavior.

#### Scenario: Admin route access test
- **WHEN** admin route-access tests run
- **THEN** they verify admins can access store-management pages

#### Scenario: Editor route access test
- **WHEN** editor route-access tests run
- **THEN** they verify editors cannot access store-management pages

#### Scenario: Sidebar role test
- **WHEN** sidebar role tests run
- **THEN** they verify store navigation is visible for admins and hidden for editors
