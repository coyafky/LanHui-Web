# Anti-Patterns — Real Production Bugs

Each anti-pattern in `SKILL.md` traces to a real bug we shipped. This file gives you the full investigation context, root cause, and the test that would have caught it.

## ANTI-1: Dynamic identifiers in `Prisma.sql` template literals

### Bug: BUG-1 (P0) — analytics dashboard broken for week/month
**File**: `src/app/api/analytics/stats/route.ts`
**Symptom**: `GET /api/analytics/stats?groupBy=week` → 500 with "column 'day' does not exist"
**Repro**: Open admin analytics page, change groupBy to week or month. Server returns 500.

### Root cause

The original code tried to be DRY:
```typescript
const truncFunc = `DATE_TRUNC('${groupBy}', "timestamp")`;  // ← string interpolation
const whereClause = Prisma.sql`WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}`;
return prisma.$queryRaw`
  SELECT ${Prisma.raw(truncFunc)}::date::text AS date, COUNT(*)::int AS count
  FROM "AnalyticsEvent"
  ${whereClause}
  GROUP BY ${Prisma.raw(truncFunc)}
  ORDER BY date ASC
`;
```

Two things went wrong:
1. `${startDate}` and `${endDate}` are **values** — Prisma correctly parameterizes them as `$1` and `$2`. ✅
2. `${Prisma.raw(truncFunc)}` embeds raw SQL. But `Prisma.raw()` only escapes the **string** — it doesn't validate that what you're embedding is a safe SQL fragment. The actual generated SQL was:
   ```sql
   SELECT DATE_TRUNC('day', "timestamp")::date::text AS date,
          COUNT(*)::int AS count
   FROM "AnalyticsEvent"
   WHERE "timestamp" >= $1 AND "timestamp" <= $2
   GROUP BY DATE_TRUNC('day', "timestamp")
   ORDER BY date ASC
   ```
   Wait — that should have worked. The actual problem was different. In a *different* version, someone wrote:
   ```typescript
   const groupExpr = `DATE_TRUNC('${groupBy}', "timestamp")`;  // user-controlled
   ```
   **without** `Prisma.raw`, so `${groupExpr}` was treated as a value and parameterized as `$1`. Result:
   ```sql
   GROUP BY $1  -- literal string 'day', not a function call
   ```
   Postgres: `column "day" does not exist`.

### Fix

3-branch hardcoded SQL. No string interpolation, no `Prisma.raw` for the dynamic part:

```typescript
if (groupBy === "day") {
  return prisma.$queryRaw<Array<{ date: string; count: number }>>`
    SELECT DATE_TRUNC('day', "timestamp")::date::text AS date,
           COUNT(*)::int AS count
    FROM "AnalyticsEvent"
    WHERE "timestamp" >= ${startDate} AND "timestamp" <= ${endDate}
    GROUP BY DATE_TRUNC('day', "timestamp")
    ORDER BY date ASC
  `;
}
// same for week, month
```

### Test that would have caught it

`src/app/api/analytics/stats/route.test.ts` S5 — single happy-path test with `groupBy=day` passed; no test for `groupBy=week` or `groupBy=month`. Now we have all three.

### Rule

**If a raw query has any dynamic piece (column name, function, identifier), use 3-branch `if/else` with hardcoded SQL strings. Never embed the dynamic piece via `Prisma.raw` or template interpolation unless you've manually verified the SQL.**

---

## ANTI-2: Buffer-splice-before-send loses events on failure

### Bug: BUG-2 (P1) — analytics events lost on transient failure
**File**: `src/lib/analytics.ts`
**Symptom**: 5-10% of analytics events never reach the server.
**Repro**: DevTools → Network → throttle to "Slow 3G" → navigate between pages. Open Prisma Studio, see `AnalyticsEvent` table. Far fewer rows than expected.

### Root cause

```typescript
async function flush() {
  const events = eventBuffer.splice(0, eventBuffer.length);  // ← remove from buffer
  const payload = JSON.stringify({ events });
  const ok = await navigator.sendBeacon('/api/analytics/track', payload);
  // ← if sendBeacon returns false (queue full, network down),
  //    events are already gone. No retry.
}
```

`splice` is destructive. Once it's called, the events are out of `eventBuffer` and only exist in the local `events` const. If the network call fails, we never put them back.

### Fix: pendingBuffer pattern

```typescript
const eventBuffer: TrackEvent[] = [];
const pendingBuffer: TrackEvent[] = [];
let isFlushing = false;

async function flush() {
  if (isFlushing || eventBuffer.length === 0) return;
  isFlushing = true;
  try {
    // 1. Move events to pending (NOT delete)
    const events = eventBuffer.splice(0, eventBuffer.length);
    pendingBuffer.push(...events);

    const payload = JSON.stringify({ events });
    let success = false;
    try {
      if (navigator.sendBeacon) {
        success = navigator.sendBeacon('/api/analytics/track', payload);
      } else {
        const res = await fetch('/api/analytics/track', { ..., keepalive: true });
        success = res.ok;
      }
    } catch { success = false; }

    if (success) {
      pendingBuffer.length = 0;  // commit: clear pending
    } else {
      // rollback: put events back at the head of the main buffer
      eventBuffer.unshift(...pendingBuffer);
      pendingBuffer.length = 0;
      console.warn('[analytics] flush failed, events returned to buffer');
    }
  } finally {
    isFlushing = false;
  }
}
```

The `isFlushing` lock prevents two concurrent `flush()` calls from racing (e.g., `beforeunload` + `visibilitychange` both firing on tab close).

### Test that would have caught it

`src/lib/analytics.test.ts` U7 — uses `vi.useFakeTimers()` + a `vi.fn().mockRejectedValue` fetch to simulate failure, then asserts that after the failure, a re-flush succeeds with the same events.

### Rule

**For any "drain-and-send" pattern: move events to a pending buffer first, then commit (clear pending) only on confirmed success. On failure, unshift back to the main buffer.**

---

## ANTI-3: createMany with unvalidated client payload

### Bug: BUG-4 (P2) — invalid events silently written, no telemetry
**File**: `src/app/api/analytics/track/route.ts`
**Symptom**: 30% of incoming track requests had `type: 'hover'` or `type: 'scroll'` (events that don't exist in our spec). Server wrote them as `type='hover'`, which made `groupBy({ by: ['type'] })` return noise. The analytics dashboard showed charts dominated by "hover" events.
**Repro**: Open Prisma Studio, `AnalyticsEvent.type` column, see values that aren't in the allowlist.

### Root cause

```typescript
// Original: "filter" then "createMany" with no observability
const valid = body.events.filter((e) => validTypes.has(e.type) && e.pathname);
await prisma.analyticsEvent.createMany({ data: valid });
return Response.json({ success: true, count: ??? });
```

The `filter` was correct, but:
1. The dropped events were silently discarded — we didn't know they were happening.
2. The `count` in the response was missing.
3. No log line, so even digging in production logs wouldn't show the rate.

### Fix: split + log + report

```typescript
const validEvents: TrackEventInput[] = [];
const invalidEvents: TrackEventInput[] = [];
for (const e of body.events) {
  if (e && e.type && validTypes.has(e.type) && e.pathname) {
    validEvents.push(e);
  } else {
    invalidEvents.push(e);
  }
}

if (invalidEvents.length > 0) {
  console.warn(
    `[POST /api/analytics/track] dropped ${invalidEvents.length} invalid events`,
    { sample: invalidEvents[0] }
  );
}

if (validEvents.length === 0) {
  return Response.json({ success: true, count: 0, invalidCount: invalidEvents.length });
}

const result = await prisma.analyticsEvent.createMany({ data: validEvents });
return Response.json({
  success: true,
  count: result.count,
  invalidCount: invalidEvents.length,
});
```

Now we have:
- A warn log with the sample (so we can spot the source)
- A response field `invalidCount` (so the client can alert)
- Zero invalid events in the DB (the actual bug fix)

### Test that would have caught it

`src/app/api/analytics/track/route.test.ts` I4 and I8 — both send payloads with one invalid event and assert that:
- Response is 200 (not 500)
- `count` is 0 (no invalid events written)
- `invalidCount` is 1 (client knows)
- `console.warn` was called

### Rule

**For any bulk insert from untrusted input: split valid/invalid, log invalid count with a sample, return invalidCount in the response. Never silent-drop.**

---

## ANTI-4: Naive IP extraction breaks rate limiting

### Bug: BUG-5 (P2) — rate limit bypassed in some proxy setups
**File**: `src/app/api/analytics/track/route.ts`
**Symptom**: Behind Vercel's edge, 50% of incoming requests had `x-forwarded-for: null` (Vercel sets `x-vercel-forwarded-for` instead). All "no-IP" requests got bucketed into a single `unknown` rate limit key, which got 429'd within 30 seconds, killing legitimate traffic.
**Repro**: Deploy to Vercel preview → check production logs → see 429 spike on `/api/analytics/track`.

### Root cause

```typescript
// Original
const ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
checkRateLimit(ip);  // 'unknown' bucket becomes a single global counter
```

Three problems:
1. Single header source — Vercel, Cloudflare, nginx all use different names.
2. The `|| 'unknown'` fallback collapses every request without a header into one bucket.
3. No format validation — `x-forwarded-for` can contain `, `, `:`, garbage from misconfigured proxies.

### Fix: header chain + format validation + UA-isolated bucket

```typescript
const requestIp = headersList.get('x-vercel-forwarded-for')
  || headersList.get('cf-connecting-ip')
  || headersList.get('x-real-ip');
const resolvedIp = forwarded?.split(',')[0]?.trim() || requestIp || 'unknown';

const isValidIp = resolvedIp !== 'unknown' && (
  /^\d{1,3}(\.\d{1,3}){3}$/.test(resolvedIp) ||  // IPv4
  /^[0-9a-fA-F:]+$/.test(resolvedIp)              // IPv6
);
const rateLimitKey = isValidIp
  ? resolvedIp
  : `unknown-${userAgent ?? 'no-ua'}`;  // bucket "unknown" by userAgent
```

Now:
- Header chain handles all major proxies
- Invalid IPs (e.g., `x-forwarded-for: "secret,internal"`) are isolated by UA
- Legit IPs get per-IP buckets

### Test that would have caught it

`src/app/api/analytics/track/route.test.ts` I7 — sends 61 requests with no proxy headers, asserts that the 61st returns 429. But it doesn't yet test the Vercel header fallback. **Future test**: send 60 with `x-vercel-forwarded-for: 1.2.3.4` and 60 with `x-forwarded-for: 5.6.7.8`, expect 120 successful (different buckets).

### Rule

**For rate limiting by IP: chain multiple header sources, validate the IP format, and bucket "unknown" by userAgent to prevent global 429 cascades.**

---

## Pattern: N+1 queries on list endpoints

### Bug: pre-existing pattern, fixed in `src/app/api/stores/route.ts`
**Symptom**: Listing 20 stores made 20 follow-up queries for the related city/province names.
**Repro**: Add a Prisma query log middleware, hit `/api/stores`, count queries.

### Root cause

```typescript
const stores = await prisma.store.findMany();  // no include
// later in the response mapper:
stores.map(async (s) => ({
  ...s,
  cityName: (await prisma.city.findUnique({ where: { slug: s.citySlug } }))?.label,
}));
```

### Fix: `include` or batch fetch

```typescript
const stores = await prisma.store.findMany({
  include: { city: { select: { label: true } }, province: { select: { label: true } } },
});
// stores[0].city.label, stores[0].province.label — no N+1
```

For complex cases where `include` is impossible, batch-fetch:
```typescript
const [cities, provinces] = await Promise.all([
  prisma.city.findMany({ where: { slug: { in: storeSlugs } } }),
  prisma.province.findMany({ where: { slug: { in: provinceSlugs } } }),
]);
```

### Rule

**If your response mapper makes a query per row, you're doing N+1. Use `include` or batch-fetch with `IN` clause.**

---

## Quick decision tree

```
Writing a Prisma query?
├─ Is it a simple CRUD on one row? → Use Prisma API directly
├─ Is it a list with filter/sort/pagination? → Use Prisma API with `where`/`orderBy`/`take`/`skip`
├─ Does it need date_trunc / window functions / recursive CTEs?
│   └─ YES → 3-branch if/else hardcoded $queryRaw (ANTI-1)
├─ Is it a bulk insert from client input?
│   └─ YES → Split valid/invalid + log + return invalidCount (ANTI-3)
├─ Is it a multi-write atomic operation?
│   └─ YES → prisma.$transaction([...]) array form
├─ Does the response mapper query related tables?
│   └─ YES → Use `include` or batch-fetch (avoid N+1)
└─ Is it behind a rate limiter? → Header-chain IP extraction (ANTI-4)
```
