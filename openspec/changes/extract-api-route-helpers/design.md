## Helper Boundaries

Keep helper extraction scoped to repeated route logic. Do not introduce a broad API framework in this change.

Recommended module shape:

```ts
// src/lib/api-helpers.ts
export function parsePaginationParams(searchParams, options?)
export function buildPaginationMeta(params)
export async function resolveStoreRegionLabels(prisma, input)
export function buildArticleActionUpdateData(action, article)
export function revalidateArticlePaths(article?)
```

If the file grows too large during implementation, split into:

- `src/lib/api-helpers/pagination.ts`
- `src/lib/api-helpers/store-region.ts`
- `src/lib/api-helpers/article-actions.ts`

and re-export from `src/lib/api-helpers/index.ts`.

## Pagination

The current behavior clamps:

- `page` default: `1`
- `page` minimum: `1`
- `limit` default: `20`
- `limit` minimum: `1`
- `limit` maximum: `100`

The helper should return:

- `page`
- `limit`
- `skip`
- `take`

and a metadata builder should return:

- `page`
- `limit`
- `total`
- `totalPages`

## Store Region Resolution

The helper should accept:

- target `provinceSlug`
- target `citySlug`
- optional existing store values for partial update routes

It should:

1. resolve missing target values from the existing store when needed
2. fetch province and city in parallel
3. reject missing/inactive province with the current `details.provinceSlug` message
4. reject missing/inactive/mismatched city with the current `details.citySlug` message
5. return canonical `provinceLabel` and `cityLabel` from DB records

Routes should continue returning the same `{ success: false, error: "参数验证失败", details }` envelope and `400` status.

## Article Actions

Article single-action and bulk-action routes should share:

- action-to-update-data logic
- sticky/unsticky logic
- `publishedAt` backfill for publish/republish
- public/admin path revalidation

The helper must not weaken existing permission, CSRF, rate-limit, or publish-field validation.

## Testing Strategy

Add helper unit tests first, then keep existing route tests passing. The implementation should verify:

- pagination parsing for bad, missing, low, and high values
- store region validation for valid, missing province, inactive province, missing city, inactive city, and city/province mismatch
- article update data for publish, republish, archive-like status actions, sticky, and unsticky
- article revalidation path coverage
