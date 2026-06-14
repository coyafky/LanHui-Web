---
name: prisma-data-ops
description: Prisma 7 + PostgreSQL database operations for the LANHUI project — singleton client setup, route handler conventions, pagination, raw SQL safety, bulk operations, transactions, and the anti-patterns we've already hit. Use this whenever writing or modifying code that touches prisma, @/lib/prisma, prisma.x.findMany/create/update/delete, $queryRaw, $executeRaw, $transaction, or any src/app/api/**/route.ts handler. Triggers on "prisma", "数据库", "query", "findMany", "createMany", "groupBy", "raw sql", "raw query", "transaction", "事务", "批量", "分页", "pagination", "$queryRaw", "$executeRaw".
license: MIT
metadata:
  author: lanhui-team
  version: "1.0.0"
  prisma: "7.x"
  datasource: postgresql
---

# Prisma Data Operations — LANHUI Project

Project-specific Prisma 7 + PostgreSQL operations guide. Encodes our singleton, route-handler conventions, and the anti-patterns we've already paid for in production (analytics BUG-1/2/4/5, etc.).

## When to Apply

Reference this skill when:
- Adding/modifying a route handler in `src/app/api/**/route.ts`
- Writing a Prisma query (`prisma.x.findMany`, `create`, `update`, `delete`, `groupBy`, `aggregate`)
- Building a data access function in `src/lib/data.ts` or `src/lib/*-data.ts`
- Doing bulk operations (`createMany`, `updateMany`, `deleteMany`)
- Writing raw SQL via `$queryRaw` or `$executeRaw`
- Setting up transactions (`$transaction`)
- Touching `prisma/schema.prisma`

If you only need the API reference for individual methods, defer to the official `prisma-client-api` skill (if installed) — this skill is the **project-operational** layer on top.

## Rule Categories by Priority

| Priority | Category | Impact | Prefix | Reference |
|----------|----------|--------|--------|-----------|
| 1 | Client setup (singleton + adapter) | HIGH | `client` | `references/client-singleton.md` |
| 2 | Route handler conventions | CRITICAL | `route` | `references/route-handler.md` |
| 3 | Anti-patterns (real bugs) | CRITICAL | `anti` | `references/anti-patterns.md` |
| 4 | Raw SQL safety | CRITICAL | `raw` | `references/raw-queries.md` |
| 5 | Bulk operations | HIGH | `bulk` | `references/bulk-operations.md` |
| 6 | Transactions | HIGH | `tx` | `references/transactions.md` |
| 7 | Pagination | MEDIUM | `page` | `references/pagination.md` |
| 8 | Common soft-delete / status filter | MEDIUM | `soft` | `references/soft-delete.md` |

## Quick Reference

| Operation | Use this | Don't use this |
|-----------|----------|----------------|
| Get singleton client | `import { prisma } from "@/lib/prisma"` | `new PrismaClient()` in route/component |
| API auth + zod validation | `auth()` + Zod `.safeParse()` + `try/catch` | Inline `if (!body.x) return ...` |
| List with pagination | `findMany({ skip, take })` + parallel `count()` | Single query + slice in memory |
| Bulk insert telemetry | `createMany({ data })` after **valid/invalid split** | `createMany({ data })` directly with unfiltered client payload |
| Dynamic raw SQL identifier | **3-branch `if/else`** hardcoded SQL | `Prisma.sql\`... ${variable} ...\`` for enum/column |
| Multi-write atomic | `prisma.$transaction([...])` | Sequential `await` without rollback |
| Status filter | `where: { isActive: true }` | `findMany()` then `.filter()` in JS |
| Json field | `metadata: event.metadata ?? null` then Prisma serializes | `metadata: JSON.stringify(...)` (don't double-encode) |

## Client Setup (the only correct way)

`src/lib/prisma.ts` is the **only** place that constructs a `PrismaClient`. Never `new PrismaClient()` in a route or component.

```typescript
// src/lib/prisma.ts — DO NOT MODIFY without team review
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

Why each line:
- `globalThis` guard → prevents connection-pool exhaustion during Next.js HMR in dev (would otherwise leak ~10 connections per reload).
- `PrismaPg` adapter → Prisma 7 requires a driver adapter; raw `PrismaClient` constructor without adapter throws.
- `process.env.NODE_ENV !== "production"` guard → in prod, fresh lambda/container gets a fresh client (no global carry-over).
- `process.env.DATABASE_URL` is loaded at module init. If you're running a script, ensure `.env` is loaded **before** import — see `references/client-singleton.md`.

## Route Handler Conventions

Every `src/app/api/**/route.ts` follows this skeleton:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SomeZodSchema } from "@/lib/validations/some";

export async function GET(request: NextRequest) {
  try {
    // 1. Auth (admin-only endpoints MUST check role)
    const session = await auth();
    if (!session?.user) return Response.json({ success: false, error: "未认证" }, { status: 401 });
    if (session.user.role !== "admin") return Response.json({ success: false, error: "权限不足" }, { status: 403 });

    // 2. Parse + validate query params
    const { searchParams } = request.nextUrl;
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    // 3. Query (parallel where possible)
    const [items, total] = await Promise.all([
      prisma.store.findMany({ where: { isActive: true }, take: limit, skip: ... }),
      prisma.store.count({ where: { isActive: true } }),
    ]);

    // 4. Uniform response shape
    return Response.json({ success: true, data: items, pagination: { total, limit } });
  } catch (error) {
    console.error("[GET /api/.../...]", error);
    return Response.json({ success: false, error: "服务器内部错误" }, { status: 500 });
  }
}
```

Full details: `references/route-handler.md`.

## Anti-Patterns (NEVER do these — we have the scars)

Each is a real production bug. The full investigation, root cause, and fix are in `references/anti-patterns.md`.

### ANTI-1: Don't pass dynamic identifiers into `Prisma.sql` template literals

```typescript
// ❌ BUG-1 (P0) — broke analytics dashboard for week/month grouping
const whereClause = Prisma.sql`WHERE ${groupBy} = ${value}`;
const result = await prisma.$queryRaw`SELECT ${groupBy} FROM ... ${whereClause} ...`;

// ✅ Correct: 3-branch hardcoded SQL
if (groupBy === "day") return prisma.$queryRaw`SELECT DATE_TRUNC('day', "timestamp") ...`;
if (groupBy === "week") return prisma.$queryRaw`SELECT DATE_TRUNC('week', "timestamp") ...`;
return prisma.$queryRaw`SELECT DATE_TRUNC('month', "timestamp") ...`;
```

**Why**: Prisma parameterizes template variables as `$1` even when the value is meant to be a SQL identifier or function. The query becomes `WHERE $1 = $2` and Postgres returns a column-not-found error.

### ANTI-2: Don't `splice` events out of a buffer before knowing the send succeeded

```typescript
// ❌ BUG-2 (P1) — analytics events lost on transient network failure
const events = eventBuffer.splice(0, eventBuffer.length);
await fetch("/api/...", { body: JSON.stringify({ events }) });
// network blip → events gone forever

// ✅ Correct: move to pending, only clear pending on success
const events = eventBuffer.splice(0, eventBuffer.length);
pendingBuffer.push(...events);
const ok = await send(payload);
if (ok) pendingBuffer.length = 0;
else eventBuffer.unshift(...pendingBuffer);
```

**Why**: Network failures are common during `beforeunload` / `visibilitychange`. The pattern must be "commit-on-success".

### ANTI-3: Don't `createMany` unvalidated client payloads

```typescript
// ❌ BUG-4 (P2) — invalid events silently written, telemetry blind spot
await prisma.analyticsEvent.createMany({ data: body.events });

// ✅ Correct: split valid/invalid, log the dropped ones, return invalidCount
const valid = [], invalid = [];
for (const e of body.events) {
  if (validTypes.has(e.type) && e.pathname) valid.push(e);
  else invalid.push(e);
}
if (invalid.length) console.warn("dropped", invalid.length, "events", { sample: invalid[0] });
const result = await prisma.analyticsEvent.createMany({ data: valid });
return Response.json({ success: true, count: result.count, invalidCount: invalid.length });
```

**Why**: Silent data loss makes bugs invisible. The client needs `invalidCount` to know something was wrong.

### ANTI-4: Don't trust `x-forwarded-for` alone for rate limiting

```typescript
// ❌ BUG-5 (P2) — rate limit bypassed when proxy stripped the header
const ip = headers.get("x-forwarded-for");
if (!ip) { /* no rate limit applied */ }

// ✅ Correct: chain of fallbacks, then validate format, then bucket by userAgent for "unknown"
const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  || headers.get("x-vercel-forwarded-for")
  || headers.get("cf-connecting-ip")
  || headers.get("x-real-ip")
  || "unknown";
const isValid = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip) || /^[0-9a-fA-F:]+$/.test(ip);
const rateLimitKey = isValid ? ip : `unknown-${userAgent ?? "no-ua"}`;
```

**Why**: Vercel/CF/nginx all use different header names. The proxy in front may strip `x-forwarded-for`. Naive extraction causes either false 429s (collide all "unknown" into one bucket) or zero rate limit.

## When to Use Prisma Query API vs Raw SQL

**Default to Prisma Query API** — it gives you type safety, relation loading, and Prisma Client extensions.

Use `$queryRaw` / `$executeRaw` only when:
1. The Prisma Query API can't express the query (window functions, recursive CTEs, `DATE_TRUNC` aggregates with dynamic granularity, etc.)
2. You need a result shape the type generator can't infer (e.g., dynamic group-by return type)
3. You're doing performance-critical bulk operations (e.g., 10k+ rows) and Prisma's overhead is too high

**Never** use raw SQL for basic CRUD — that defeats the ORM.

## When to Use Transactions

Use `prisma.$transaction([...])` (array form) when:
- Multiple writes must be atomic (all-or-nothing)
- You need to batch N+1 round trips into one DB roundtrip (even on a single read)

Use `prisma.$transaction(async (tx) => {...})` (interactive form) when:
- A later write depends on the result of an earlier one inside the same transaction
- You need conditional logic (try create, if duplicate then update)

**Don't** use transactions for a single write — it adds overhead with no benefit.

**Don't** wrap independent reads in a transaction — `Promise.all` is faster.

## Pagination

Two patterns, pick by use case:

**Offset pagination** (simple, used in admin tables):
```typescript
const [items, total] = await Promise.all([
  prisma.x.findMany({ skip: (page - 1) * limit, take: limit }),
  prisma.x.count({ where }),
]);
```

**Cursor pagination** (used in infinite-scroll public lists):
```typescript
const items = await prisma.x.findMany({
  take: limit + 1,  // fetch one extra to detect "has more"
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  orderBy: { id: "asc" },
});
const hasMore = items.length > limit;
const nextCursor = hasMore ? items[limit - 1].id : null;
```

Full details: `references/pagination.md`.

## Soft Delete / Status Filter

This project doesn't use Prisma's `@@softDelete` middleware. Instead, every model has an `isActive: Boolean @default(true)` field, and queries add `where: { isActive: true }` explicitly.

**When you add a new model**, remember to:
1. Add `isActive Boolean @default(true)` to the schema
2. Add `@@index([isActive])` for filter performance
3. Add `where: { isActive: true }` to all read queries in route handlers and `src/lib/data.ts`
4. In admin endpoints, allow listing inactive items: `where: isAdmin ? {} : { isActive: true }`

## Type-safety Tips

- **Don't** use `as any` or `// @ts-expect-error` to silence Prisma errors — fix the schema or the query.
- For `createMany` with complex nested data, define a Zod schema first, then `z.infer` it. Don't hand-roll the `data` type.
- For raw query results, declare an explicit return type generic: `prisma.$queryRaw<Array<{ date: string; count: number }>>`...

## Resources

- Official Prisma Skills (compatible with Claude Code): `https://github.com/prisma/skills`
  - `prisma-client-api` — comprehensive API reference
  - `prisma-upgrade-v7` — v6→v7 migration (ESM, driver adapters, no middleware)
  - `prisma-database-setup` — provider-specific setup
  - `prisma-cli` — CLI command reference
- Local docs: `prisma/schema.prisma`, `src/lib/prisma.ts`, `src/lib/validations/*.ts`
- Past bug reports with raw SQL lessons: `docs/test-reports/ANALYTICS_TEST_2026-06-11.md`

## How to Use This Skill

1. Check "When to Apply" — if your task matches, read the relevant reference file.
2. For a quick check, scan the "Quick Reference" table.
3. Before writing a new query, scan the 4 anti-patterns — we paid for each in production.
4. If you're unsure between Prisma Query API vs raw SQL, the rule is: Prisma API first, raw only when Prisma can't express it.
5. If you're writing a route handler, copy the skeleton from "Route Handler Conventions" — don't reinvent.
