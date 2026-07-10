# admin-shared-page-patterns Specification

## Purpose
TBD - created by archiving change refactor-admin-page-shared-components. Update Purpose after archive.
## Requirements
### Requirement: Shared article categories hook
The system SHALL provide a shared hook for loading article categories from `/api/articles/categories`. Articles list, article create, and article edit pages MUST use the shared hook instead of duplicating fetch and fallback logic.

#### Scenario: Categories load successfully
- **WHEN** `/api/articles/categories` returns `success: true` with categories
- **THEN** the shared hook exposes those categories to the page

#### Scenario: Categories fallback on failure
- **WHEN** the categories request fails or returns an invalid response
- **THEN** the shared hook exposes the shared fallback category list

#### Scenario: All article pages use the hook
- **WHEN** articles list, article create, and article edit pages need category options
- **THEN** they import and use the shared categories hook or shared category source

### Requirement: Shared article form state
The system SHALL provide shared article form state logic for article create and edit pages. The shared logic MUST preserve create/edit differences while removing duplicated field state, validation, dirty detection, and submit payload construction.

#### Scenario: Create mode dirty detection
- **WHEN** a new article form starts empty
- **THEN** it is not dirty until the user changes at least one field from the create defaults

#### Scenario: Edit mode dirty detection
- **WHEN** an edit article form finishes loading existing article data
- **THEN** it stores a snapshot and reports dirty only after the user changes a field from that snapshot

#### Scenario: Client validation reused
- **WHEN** either create or edit form is submitted with invalid values
- **THEN** the shared form state runs `validateArticleForm` and exposes field errors to `ArticleForm`

#### Scenario: Server field errors mapped
- **WHEN** the article save API returns server field errors
- **THEN** the shared form state maps those errors back to `ArticleForm`

#### Scenario: Existing ArticleForm retained
- **WHEN** create and edit pages render the form
- **THEN** they continue to render the existing `ArticleForm` component rather than duplicating form JSX

### Requirement: Shared entity image page
The system SHALL provide a configurable `EntityImagePage` component for admin entity image management. Article image and store image routes MUST use this component for loading, error, retry, breadcrumb, title, uploader, and storage hint UI.

#### Scenario: Article image page
- **WHEN** `/admin/articles/[id]/image` loads successfully
- **THEN** it renders the shared entity image page with article title, article featured image path, and `entity="article"`

#### Scenario: Store image page
- **WHEN** `/admin/stores/[id]/image` loads successfully
- **THEN** it renders the shared entity image page with store name, store image path, and `entity="store"`

#### Scenario: Entity image retry
- **WHEN** the entity fetch fails
- **THEN** the shared page shows the existing retry affordance and retries the configured fetch endpoint when activated

#### Scenario: Entity image refetch after upload or delete
- **WHEN** `EntityImageUploader` reports upload or delete success
- **THEN** the shared page refetches the configured entity data

### Requirement: Shared store action hook
The system SHALL provide a shared hook for store status actions. Store list and store detail pages MUST use the shared hook for action dialog state, reason input state, acting state, error state, API request, and toast handling where applicable.

#### Scenario: Store action success
- **WHEN** a store action request succeeds
- **THEN** the shared hook closes the action dialog, clears the reason, emits success feedback, and calls the configured success callback

#### Scenario: Store action failure
- **WHEN** a store action request fails
- **THEN** the shared hook exposes the error, emits failure feedback, and keeps the page in a recoverable state

#### Scenario: Reason required actions
- **WHEN** the user confirms a `suspend` or `terminate` action without a reason where a reason is required
- **THEN** the hook or consuming page prevents the request and shows a validation message

#### Scenario: Detail page state sync
- **WHEN** a store detail action succeeds and returns a new status
- **THEN** the detail page can update local `storeStatus` and `storeData` through the hook success callback

#### Scenario: List page refresh
- **WHEN** a store list action succeeds
- **THEN** the list page can refetch rows or update the affected row through the hook success callback

### Requirement: Admin page behavior compatibility
The system SHALL preserve existing admin page routes, visible labels, loading states, error states, toast behavior, ConfirmDialog behavior, and navigation behavior after refactoring shared components and hooks.

#### Scenario: Article create route unchanged
- **WHEN** the user visits `/admin/articles/new`
- **THEN** the page still supports auto slug, validation, unsaved changes guard, save success toast, and navigation back to articles

#### Scenario: Article edit route unchanged
- **WHEN** the user visits `/admin/articles/[id]`
- **THEN** the page still loads article data, supports validation, unsaved changes guard, save success toast, and updates snapshot after successful save

#### Scenario: Image routes unchanged
- **WHEN** the user visits article or store image management routes
- **THEN** the routes still render the correct title, breadcrumb, uploader, and storage hint

#### Scenario: Store action UI unchanged
- **WHEN** the user opens a store action dialog from list or detail pages
- **THEN** the existing ConfirmDialog style and reason input behavior remain available

### Requirement: Duplication prevention
The system SHALL include a guard against reintroducing duplicated admin page logic for article categories, entity image pages, article form state, and store status actions.

#### Scenario: Duplicated categories loader rejected
- **WHEN** an admin page duplicates `/api/articles/categories` loading logic instead of using the shared hook
- **THEN** the duplication check fails with a clear message

#### Scenario: Duplicated entity image page rejected
- **WHEN** a new entity image page duplicates loading/error/refetch/uploader UI instead of using `EntityImagePage`
- **THEN** the duplication check fails with a clear message

#### Scenario: Existing shared hooks allowed
- **WHEN** duplicated patterns appear inside the approved shared hooks or shared component
- **THEN** the duplication check allows them

### Requirement: Verification coverage
The system SHALL add or update tests for shared admin page patterns. Tests MUST cover hooks, shared image page behavior, and migrated pages.

#### Scenario: Hook tests
- **WHEN** hook tests run
- **THEN** `useCategories`, `useArticleFormState`, and `useStoreAction` success and failure cases are covered

#### Scenario: EntityImagePage tests
- **WHEN** EntityImagePage tests run
- **THEN** article/store selectors, loading, error retry, and refetch after upload/delete are covered

#### Scenario: Existing page tests pass
- **WHEN** existing article page tests run
- **THEN** create/edit/list behavior still passes after migration

