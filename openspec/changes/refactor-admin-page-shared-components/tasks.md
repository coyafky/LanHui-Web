## 1. Baseline Audit

- [ ] 1.1 Confirm current `ArticleForm` usage in article create and edit pages
- [ ] 1.2 Record duplicated category loading blocks in articles list, article create, and article edit pages
- [ ] 1.3 Record duplicated image page behavior in article image and store image routes
- [ ] 1.4 Record duplicated store action state and API logic in stores list and store detail pages
- [ ] 1.5 Run existing article page and ArticleForm tests as a baseline

## 2. Shared Categories Hook

- [x] 2.1 Create `src/hooks/use-categories.ts`
- [x] 2.2 Move `ARTICLE_CATEGORIES_FALLBACK` into the shared hook module or adjacent shared constant
- [x] 2.3 Implement loading, error, fallback, cancellation, and refetch behavior
- [x] 2.4 Migrate `src/app/admin/(dashboard)/articles/page.tsx` to use `useCategories`
- [x] 2.5 Migrate `src/app/admin/(dashboard)/articles/new/page.tsx` to use `useCategories`
- [ ] 2.6 Migrate `src/app/admin/(dashboard)/articles/[id]/page.tsx` to use `useCategories`
- [ ] 2.7 Add hook tests for success, API failure, invalid response, and cancellation-safe fallback

## 3. Shared Entity Image Page

- [ ] 3.1 Create `src/components/admin/EntityImagePage.tsx`
- [ ] 3.2 Support configurable `entity`, `entityId`, `fetchEndpoint`, `backHref`, `crumbLabel`, `title`, `storageHint`, `placeholderPath`, and `selectData`
- [ ] 3.3 Preserve existing loading spinner UI
- [ ] 3.4 Preserve existing error retry UI
- [ ] 3.5 Preserve refetch after `EntityImageUploader` upload success and delete success
- [ ] 3.6 Migrate `src/app/admin/(dashboard)/articles/[id]/image/page.tsx` to render `EntityImagePage`
- [ ] 3.7 Migrate `src/app/admin/(dashboard)/stores/[id]/image/page.tsx` to render `EntityImagePage`
- [ ] 3.8 Add component tests for article config and store config

## 4. Shared Store Action Hook

- [ ] 4.1 Create `src/hooks/use-store-action.ts`
- [ ] 4.2 Implement action dialog state: open action, close action, reason, acting, and error
- [ ] 4.3 Implement store action POST request to `/api/stores/{id}/{action}`
- [ ] 4.4 Preserve reason handling for `suspend` and `terminate`
- [ ] 4.5 Preserve success and failure toast behavior
- [ ] 4.6 Support `onSuccess` callback so pages can update local state or refetch
- [ ] 4.7 Migrate `src/app/admin/(dashboard)/stores/[id]/page.tsx` to use `useStoreAction`
- [ ] 4.8 Migrate single-row action logic in `src/app/admin/(dashboard)/stores/page.tsx` where safe; leave bulk action logic local if it does not fit the single-store hook
- [ ] 4.9 Add hook tests for success, API failure, network failure, reason validation, and onSuccess callback

## 5. Shared Article Form State

- [ ] 5.1 Create `src/hooks/use-article-form-state.ts`
- [ ] 5.2 Do not create a second `ArticleForm`; keep using existing `src/components/admin/ArticleForm.tsx`
- [ ] 5.3 Implement create mode initial values, dirty detection, validation, saving state, fieldErrors, and submit payload construction
- [ ] 5.4 Implement edit mode load-to-snapshot flow, dirty detection, validation, saving state, fieldErrors, and submit payload construction
- [ ] 5.5 Preserve auto slug behavior in create mode
- [ ] 5.6 Preserve slug manually edited behavior
- [ ] 5.7 Preserve `useUnsavedChangesGuard` integration for both create and edit
- [ ] 5.8 Migrate `src/app/admin/(dashboard)/articles/new/page.tsx` to use the shared form state hook
- [ ] 5.9 Migrate `src/app/admin/(dashboard)/articles/[id]/page.tsx` to use the shared form state hook
- [ ] 5.10 Add hook tests for create dirty, edit dirty, validation failure, server field errors, successful create, and successful edit snapshot update

## 6. Duplication Guard

- [ ] 6.1 Create `scripts/check-admin-page-duplication.mjs`
- [ ] 6.2 Detect duplicated `/api/articles/categories` loading blocks outside `use-categories`
- [ ] 6.3 Detect duplicated entity image page fetch/refetch/uploader structure outside `EntityImagePage`
- [ ] 6.4 Detect duplicated store action state clusters outside `use-store-action`
- [ ] 6.5 Allow duplicated patterns inside approved shared hooks/components
- [ ] 6.6 Add `check:admin-page-duplication` to `package.json`

## 7. Tests And Verification

- [ ] 7.1 Run `npx vitest run src/components/admin/ArticleForm.test.tsx`
- [ ] 7.2 Run article create/edit/list page tests
- [ ] 7.3 Run new hook tests for `use-categories`, `use-store-action`, and `use-article-form-state`
- [ ] 7.4 Run new `EntityImagePage` tests
- [ ] 7.5 Run `npm run lint`
- [ ] 7.6 Run `npm run typecheck` and document known pre-existing test-only errors if still present
- [ ] 7.7 Run `npm run build`
- [ ] 7.8 Run `npm run check:admin-page-duplication`

## 8. Follow-up Notes

- [ ] 8.1 Record remaining admin page duplication that is out of scope for this change
- [ ] 8.2 Decide whether bulk store actions should get a separate `useStoreBulkAction` hook in a later change
- [ ] 8.3 Decide whether `ArticleForm` props should later be collapsed to a single `value/onChange` object API
