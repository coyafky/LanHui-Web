# Task 4 Report: useArticleFormState Hook (Group 4 — Tasks 4.1-4.4)

> Date: 2026-07-10
> Worker: Claude Code (deepseek-v4-flash)

---

## Status: DONE

## What was created/changed

### Created
- `src/hooks/use-article-form-state.ts` — Shared form state hook for article create/edit pages
- `src/hooks/use-article-form-state.test.tsx` — 18 test cases covering both modes

### Modified (migrated)
- `src/app/admin/(dashboard)/articles/new/page.tsx` — Replaced 11 `useState` + `dirty` `useMemo` + `handleSubmit` `useCallback` with single `useArticleFormState("create")` call
- `src/app/admin/(dashboard)/articles/[id]/page.tsx` — Replaced form state, snapshot, dirty detection, and handleSubmit with `useArticleFormState("edit", { initialData, articleId })`. Async data loading preserved at page level.

## Hook interface (per spec)

```typescript
useArticleFormState(mode: "create" | "edit", options?: {
  initialData?: ArticleFormInput;
  articleId?: string;
}): {
  // Field value/onChange pairs matching ArticleForm props
  title, onTitleChange, slug, onSlugChange, slugManuallyEdited,
  excerpt, onExcerptChange, content, onContentChange,
  featuredImage, onFeaturedImageChange, category, onCategoryChange,
  tags, onTagsChange, status, onStatusChange, isSticky, onIsStickyChange,
  // Meta state
  fieldErrors, saving, dirty, serverError,
  // Actions
  handleSubmit,
}
```

## Key behaviors

| Mode | Init | Dirty | Slug | Submit |
|------|------|-------|------|--------|
| create | Empty defaults | Any field non-empty | Auto-generate via `Date.now().toString(36)` when title changes (not manually edited) | `POST /api/articles` → `toast.success("创建成功")` → `router.push` |
| edit | From `initialData` | Diff from snapshot | No auto-generation | `PUT /api/articles/{articleId}` → update snapshot → `toast.success("更新成功")` → `router.push` |

Both modes:
- Client-side validation via `validateArticleForm` before API call
- Server field errors mapped to form via `json.details?.fieldErrors`
- `toast.error` on API failure
- `useUnsavedChangesGuard` integration preserved at page level (hook returns `dirty` and `saving`)

## Test results

```
✓ src/hooks/use-article-form-state.test.tsx (18 tests) 25ms

 Test Files  1 passed (1)
      Tests  18 passed (18)
```

18 test cases across two describe blocks:

**Create mode** (10 tests):
- Empty defaults, dirty false initially, dirty when title non-empty
- Auto-generates slug, no slug when manually edited
- POST on valid input, fieldErrors on validation failure
- No fetch when validation fails, toast.error on API failure
- Server field error mapping, saving resets to false after completion

**Edit mode** (8 tests):
- Fields from initialData, dirty false when matching snapshot
- Dirty true when title differs, no auto-slug on title change
- PUT with articleId on valid input, snapshot update after save
- toast.error on API failure

## Typecheck result

Clean — 0 new type errors. Pre-existing error in `articles/[id]/page.test.tsx:215` is unrelated.

## Design decisions

1. **Sync effect for async loading**: The hook uses a `useEffect` with `JSON.stringify(initialData)` dependency to sync fields when `initialData` arrives asynchronously (edit page loads article data after mount). A `useRef` tracks the previous serialized value to avoid redundant syncs.

2. **State-based snapshot (not ref)**: The snapshot for dirty comparison is stored as `useState` rather than `useRef`, so `dirty` recalculates after successful save (when snapshot is updated). Using a ref would cause stale dirty values.

3. **Slug auto-generation**: Both the hook and `TitleSlugFields` component generate slugs — the hook via `useEffect` (isolation safety net), `TitleSlugFields` via `handleTitleChange` handler (production path). The `slugManuallyEdited` state prevents double-generation.

4. **No useUnsavedChangesGuard inside hook**: As specified, the hook does not wrap the guard internally. Pages call `useUnsavedChangesGuard(formState.dirty, formState.saving)` themselves and retain the `ConfirmDialog`.

## Concerns

- **No `autoSlug` in edit page**: The edit page does not pass `autoSlug` to `ArticleForm` (same as before migration). Title changes in edit mode do not regenerate slug, which is correct for existing articles.
