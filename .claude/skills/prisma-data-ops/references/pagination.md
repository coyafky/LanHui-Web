# Pagination

Two patterns. Pick by use case.

## Offset Pagination — admin tables, search results

**When**: total count matters, user can jump to a specific page, data size is bounded (≤10k rows).

**Pattern**:
```typescript
const page = Math.max(1, Number(searchParams.get("page")) || 1);
const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

const [items, total] = await Promise.all([
  prisma.x.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
    include: { /* relations */ },
  }),
  prisma.x.count({ where }),
]);

return Response.json({
  success: true,
  data: items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
});
```

**Pros**: simple, supports "page 5 of 12", total count is known.
**Cons**: `OFFSET` is O(N) — page 1000 of a 1M-row table scans 20k rows. New rows shift pages on refresh (cursor pagination doesn't have this problem).

## Cursor Pagination — infinite scroll, public lists

**When**: scrolling feeds, "load more" buttons, real-time data where rows are being added.

**Pattern**:
```typescript
const cursor = searchParams.get("cursor");  // last seen ID, or null
const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));

const items = await prisma.x.findMany({
  where,
  take: limit + 1,                              // fetch one extra to detect "has more"
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),  // skip the cursor itself
  orderBy: { id: "asc" },
});

const hasMore = items.length > limit;
const data = hasMore ? items.slice(0, limit) : items;
const nextCursor = hasMore ? data[data.length - 1].id : null;

return Response.json({
  success: true,
  data,
  nextCursor,
  hasMore,
});
```

**Pros**: O(1) regardless of position, stable under inserts (new rows appear at the end), no "page shift" on refresh.
**Cons**: no random access ("jump to page 5" doesn't work), total count is unknown (or expensive to compute).

## Cursor with multi-field sort

If the order isn't by `id` (e.g., `orderBy: { publishedAt: "desc" }`), use a composite cursor:

```typescript
prisma.x.findMany({
  where: {
    ...otherFilters,
    OR: [
      { publishedAt: { lt: cursorPublishedAt } },
      {
        publishedAt: cursorPublishedAt,
        id: { lt: cursorId },  // tie-breaker
      },
    ],
  },
  orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
  take: limit + 1,
});
```

## API conventions

| Method | Path / Query | Response |
|--------|--------------|----------|
| Offset | `?page=2&limit=20` | `{ data, pagination: { page, limit, total, totalPages } }` |
| Cursor | `?cursor=xyz&limit=20` | `{ data, nextCursor, hasMore }` |

Don't mix. If the endpoint uses cursor, don't return `pagination.total`. If it uses offset, don't return `nextCursor`.

## When to choose

- **Admin tables** (articles list, stores list, users list) → offset
- **Public listings** (news feed, store directory) → cursor
- **Search results** (e.g., admin search across articles) → offset (with optional `cursor` for "load more")
- **Internal exports** → no pagination, stream via raw SQL with `COPY`

## Anti-patterns

### ❌ Counting all rows just to paginate
```typescript
const total = await prisma.x.count();  // 1M rows → slow
const items = await prisma.x.findMany({ skip: 100000, take: 20 });  // also slow
```
→ Use cursor pagination, or add a max `page` cap (`page <= 100`).

### ❌ Slice in JavaScript
```typescript
const all = await prisma.x.findMany();  // loads everything
return all.slice(skip, skip + take);     // pagination? no.
```
→ Always push the limit to the database with `take`/`skip`.

### ❌ `findUnique` for paginated lookups
```typescript
for (let i = 0; i < 10; i++) {
  const item = await prisma.x.findUnique({ where: { id: ids[i] } });
  // N round trips
}
```
→ Use `findMany({ where: { id: { in: ids } } })` — one round trip.

## Codebase examples

- `src/app/api/articles/route.ts` — offset pagination with parallel `findMany`+`count`
- `src/app/api/stores/route.ts` — offset with `where: { isActive: true }` and includes
- Public front-end `src/lib/data.ts` — uses `next: { revalidate }` for ISR on top of the same APIs
