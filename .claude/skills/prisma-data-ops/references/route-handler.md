# Route Handler Conventions

Every `src/app/api/**/route.ts` file in this project follows a strict skeleton. Deviating is allowed only with a code-review comment explaining why.

## The Skeleton

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SomeZodSchema } from "@/lib/validations/some";

/** GET /api/{resource} — short description */
export async function GET(request: NextRequest) {
  try {
    // ── 1. Auth (only if endpoint requires it) ──
    const session = await auth();
    if (!session?.user) {
      return Response.json({ success: false, error: "未认证" }, { status: 401 });
    }
    const isAdmin = session.user.role === "admin";
    const isEditor = session.user.role === "editor" || isAdmin;

    // ── 2. Parse + validate query params ──
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const status = searchParams.get("status");

    // ── 3. Build where clause ──
    const where: Record<string, unknown> = {};
    if (!isAdmin) {
      where.status = "published";     // public endpoints: only published
    } else if (status) {
      where.status = status;          // admin can filter
    }
    // ... more filters

    // ── 4. Query (parallel where possible) ──
    const [items, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy: [{ isSticky: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: { author: { select: { name: true } } },
      }),
      prisma.resource.count({ where }),
    ]);

    // ── 5. Uniform response ──
    return Response.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/resource]", error);
    return Response.json({ success: false, error: "服务器内部错误" }, { status: 500 });
  }
}
```

## Conventions

### Response shape
**Success**: `{ success: true, data: T, pagination?: {...} }`
**Failure**: `{ success: false, error: string, details?: Record<string, string[]> }` (Zod validation errors go in `details`)

Never return raw objects/arrays at the top level — always wrap in `{ success, data }` so the client can uniformly check `json.success`.

### Auth check
- Public endpoints: skip auth.
- User-content endpoints (e.g., user's own articles): `if (!session?.user) return 401`.
- Admin-only: `if (session.user.role !== "admin") return 403`.
- Editor+admin: check role and grant accordingly.

### Zod validation
Use Zod for **every** request body that touches the DB. Inline validation is not allowed in route handlers.

```typescript
const body = await request.json();
const parsed = SomeZodSchema.safeParse(body);
if (!parsed.success) {
  return Response.json(
    { success: false, error: "请求数据无效", details: parsed.error.flatten().fieldErrors },
    { status: 400 }
  );
}
const data = parsed.data;  // fully typed
```

For PUT/PATCH, use a partial schema: `SomeUpdateSchema = SomeCreateSchema.partial()`.

### Pagination
Always `Math.min(MAX, Math.max(1, ...))` to prevent abuse. Default 20, max 100.

### Parallel queries
`Promise.all([findMany, count])` is the standard. Don't sequence them — it doubles the latency.

### Error logging
Always `console.error("[VERB /path]", error)` with the verb and path as a prefix, so grep in production logs is easy.

### Status codes
| Code | When |
|------|------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) — or use 200 with `{ success: true, data: null }` for consistency |
| 400 | Bad input (Zod failed, query param invalid) |
| 401 | Not authenticated |
| 403 | Authenticated but lacks role |
| 404 | Resource not found |
| 409 | Conflict (unique constraint, e.g., duplicate slug) |
| 429 | Rate limited |
| 500 | Server error (caught exception) |

## Anti-Patterns

### ❌ Inline validation
```typescript
if (!body.name || body.name.length < 1) {
  return Response.json({ error: "name required" }, { status: 400 });
}
```
→ Use Zod. Inline validation drifts and doesn't compose.

### ❌ Sequential await
```typescript
const items = await prisma.x.findMany(...);
const total = await prisma.x.count(...);  // sequential!
```
→ `Promise.all` them.

### ❌ Top-level array response
```typescript
return Response.json(items);
```
→ Wrap in `{ success, data }`. The client needs to know if it succeeded.

### ❌ Catch and return raw error
```typescript
catch (e) { return Response.json({ error: e.message }, { status: 500 }); }
```
→ Log the error, return a generic message. `e.message` can leak internals (table names, SQL fragments).

## Examples in the codebase

- `src/app/api/articles/route.ts` — list with auth-aware status filter, parallel `findMany`+`count`, cursor pagination
- `src/app/api/articles/[id]/route.ts` — single GET + PUT + DELETE
- `src/app/api/analytics/stats/route.ts` — admin-only, date-range filtering, 3-branch raw SQL
- `src/app/api/analytics/track/route.ts` — public POST, bulk insert, rate limit, IP extraction
- `src/app/api/stores/route.ts` — public GET, includes for N+1 prevention
