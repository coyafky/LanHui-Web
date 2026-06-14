# Raw SQL Safety

`prisma.$queryRaw` and `prisma.$executeRaw` are the only ways to do things the Prisma Query API can't (window functions, recursive CTEs, `DATE_TRUNC` with dynamic granularity, `RETURNING` on updates, etc.). They are also the easiest place to introduce SQL injection or the "dynamic identifier trap".

## The Two Failure Modes

### Failure Mode 1: Dynamic identifier (BUG-1, the worst kind)

The mistake: you want to use a *function name* or *column name* that depends on user input.

```typescript
// ❌ BUG-1 — Prisma parameterizes the WHOLE expression as $1
const expr = `DATE_TRUNC('${groupBy}', "timestamp")`;
return prisma.$queryRaw`SELECT ${expr} FROM "AnalyticsEvent"`;
// Generated SQL: SELECT $1 FROM "AnalyticsEvent"
// Postgres: "ERROR: column '$1' does not exist"
```

The fix: **3-branch hardcoded SQL**. Yes, it's verbose. No, there's no other way.

```typescript
// ✅ Correct
if (groupBy === "day") {
  return prisma.$queryRaw<...>`
    SELECT DATE_TRUNC('day', "timestamp")::date::text AS date,
           COUNT(*)::int AS count
    FROM "AnalyticsEvent"
    WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
    GROUP BY DATE_TRUNC('day', "timestamp")
    ORDER BY date ASC
  `;
}
if (groupBy === "week") {
  return prisma.$queryRaw<...>`/* ... DATE_TRUNC('week', ...) ... */`;
}
return prisma.$queryRaw<...>`/* ... DATE_TRUNC('month', ...) ... */`;
```

### Failure Mode 2: Value interpolation (safe IF you do it right)

Values are safe — Prisma parameterizes them. The risk is forgetting to use the `sql` template and using a regular string instead.

```typescript
// ✅ Safe: template literal with ${value}
prisma.$queryRaw`SELECT * FROM "User" WHERE id = ${userId}`;
// Generated SQL: SELECT * FROM "User" WHERE id = $1
// Prisma sends [userId] as parameters, properly escaped.

// ❌ UNSAFE: string concatenation
prisma.$queryRawUnsafe(`SELECT * FROM "User" WHERE id = '${userId}'`);
// Generated SQL: SELECT * FROM "User" WHERE id = 'whatever-the-user-typed'
// SQL injection risk.
```

**Rule**: Always use `prisma.$queryRaw\`...\`` (template form), never `prisma.$queryRawUnsafe(...)`. The template form is the ONLY safe form.

## When to Use Raw SQL

| Use it for | Don't use it for |
|------------|------------------|
| `DATE_TRUNC` with dynamic granularity (analytics) | Basic CRUD — use `findMany`/`create`/etc. |
| Window functions (`ROW_NUMBER() OVER (...)`) | Simple filters — use `where` |
| Recursive CTEs | Pagination — use `skip`/`take` |
| `RETURNING` on bulk update/delete | Aggregation that Prisma supports — use `groupBy`/`aggregate` |
| Database-specific features (Postgres `tsvector`, `ltree`) | Anything where you'd be tempted to string-interpolate |

## Pattern: Reuse the `where` clause via `Prisma.sql`

If you have 3 branches of raw SQL with the same WHERE clause, extract:

```typescript
const whereClause = Prisma.sql`WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}`;

if (groupBy === "day") {
  return prisma.$queryRaw`
    SELECT DATE_TRUNC('day', "timestamp")::date::text AS date, COUNT(*)::int AS count
    FROM "AnalyticsEvent" ${whereClause}
    GROUP BY DATE_TRUNC('day', "timestamp")
    ORDER BY date ASC
  `;
}
// ... week, month
```

The `${whereClause}` is a `Prisma.Sql` object — it's inlined as raw SQL but with parameterized values. Safe and DRY.

## Pattern: Type-annotated results

Raw queries return `unknown[]`. Always annotate the shape:

```typescript
const rows = await prisma.$queryRaw<Array<{ date: string; count: number }>>`
  SELECT DATE_TRUNC('day', "timestamp")::date::text AS date, COUNT(*)::int AS count
  FROM "AnalyticsEvent" ...
`;
// rows[0].date is typed as string
```

For `bigint` returns (count from `COUNT(*)` is `bigint` in Prisma 7), cast with `Number()`:
```typescript
rows.map((r) => ({ date: r.date, count: Number(r.count) }))
```

## Pattern: Quote identifiers explicitly

Postgres is case-sensitive when identifiers are quoted. `"timestamp"` is the column; `timestamp` is the type.

```typescript
prisma.$queryRaw`SELECT "timestamp" FROM "AnalyticsEvent"`  // ✅ column
prisma.$queryRaw`SELECT timestamp FROM "AnalyticsEvent"`   // ❌ parser error
```

## Pattern: Allowlist-driven ORDER BY

```typescript
// ❌ BUG risk: any user-supplied sort column gets inlined
const orderBy = req.query.orderBy; // "name", "createdAt", etc.
await prisma.$queryRaw`SELECT * FROM "User" ORDER BY ${orderBy}`;

// ✅ Correct: allowlist
const sortMap = { name: '"name"', createdAt: '"createdAt"' } as const;
const orderCol = sortMap[req.query.orderBy as keyof typeof sortMap] || '"createdAt"';
await prisma.$queryRaw`SELECT * FROM "User" ORDER BY ${Prisma.raw(orderCol)}`;
```

Or simpler: switch to the Prisma Query API — it has `orderBy: { [field]: "asc" | "desc" }` with type-safe field names.

## When `$queryRawUnsafe` is acceptable

Almost never in user-facing code. The only valid uses:
- Maintenance scripts (admin tool, one-off migration)
- Code that's already escaped values manually (e.g., a CSV export of static data)

For all production route handlers: never.

## Codebase Examples

- `src/app/api/analytics/stats/route.ts` — 3-branch `DATE_TRUNC` raw SQL, `whereClause` extracted
- `prisma/seed.ts` — uses `prisma.$executeRaw` to clear tables before reseeding (acceptable in scripts)
