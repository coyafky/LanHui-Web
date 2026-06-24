<!-- AUTO-GENERATED from AGENTS.md — do not edit directly.
     Run `bash scripts/sync-agent-rules.sh` to regenerate. -->

---
description: Project conventions for AI Website Clone Template
alwaysApply: true
---
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 蓝辉轻改 LANHUI — Agent Guide

Public brand site + `/admin` CMS for 汽车轻改装 / 车身膜（顺德大良店）. Next.js 16.2.1 (App Router) · React 19.2.4 · TS strict · Tailwind v4 (oklch) · Prisma 7.8 (`adapter-pg`) · NextAuth v5 beta · shadcn/ui (**Base UI** primitives, not Radix) · vitest + Playwright. Node **24** (`.nvmrc`).
Full product/architecture context: `README.md`, `docs/ARCHITECTURE.md`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | dev server → :3000 (needs Postgres) |
| `npm run build` | production build + SSG (**works without Postgres**) |
| `npm run lint` | `eslint` (flat config) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check` | lint → typecheck → `verify:zeekr-images` → build (full gate) |
| `npm test` / `test:watch` / `test:coverage` | vitest (happy-dom) |
| `npm run test:e2e` | Playwright (`e2e/`, boots dev server) |
| `npx vitest run src/lib/x.test.ts` / `-t "name"` | single file / by name |
| `npx prisma migrate dev --name X` · `npx prisma db seed` · `npx prisma studio` | DB ops |
| `npx tsx scripts/create-admin.ts --username X --email Y --password Z [--role admin\|editor]` | CLI admin user |

## Quality gates — current verified state

- `npm run typecheck` has **9 pre-existing errors in 2 test files only** — `src/app/api/analytics/stats/route.test.ts` (BigInt literals need ES2020, but `tsconfig.target` is ES2017) and `src/lib/analytics.test.ts` (tuple casts). **Business code is clean.** Do not report these as regressions; do not "fix" them by lowering/raising target without checking tests. Until resolved, `npm run check` stops at the typecheck step.
- `npm run build` succeeds **without a running Postgres**: SSG falls back to static data in `src/lib/data.ts` (API-first, static-data fallback). CI (`.github/workflows/ci.yml`) runs build with no DB. `npm run dev`, `/admin`, and API writes DO require a live Postgres.

## Environment gotchas (hard-earned)

- **Postgres port is 5433, not 5432.** Container `lanhui-postgres`, user/db `lanhui`. Canonical URL: `postgresql://lanhui:lanhui_password@localhost:5433/lanhui`. (`.env.example` wrongly says 5432 — trust the docker run command in `README.md`.)
- **Env loading differs by command.** `npx prisma *` auto-loads `.env` via `prisma.config.ts` (`dotenv/config`). Direct `npx tsx scripts/*.ts` and `npx tsx prisma/seed.ts` do **not** — run `set -a && source .env && set +a` first (they read `process.env.DATABASE_URL` with no dotenv import).
- **Image upload is LOCAL storage, not OSS.** `ali-oss` is an installed-but-unused dependency; `/api/upload` writes `public/images/stores/<id>.webp` via `sharp` (q80). The OSS env vars in `.env.example`/`README.md` are not wired. Do not "fix" ali-oss — local storage is the current implementation (admin-only; entity currently limited to `store`).
- **macOS APFS is case-insensitive.** `zeekr/` and `ZEEKR/` are the same inode; rename via `mv A _tmp && mv _tmp B` to force a case change.
- Default dev admin (from `prisma/seed.ts`): `admin` / `admin@lanhui.com` / `admin123`. Change in prod.

## Architecture

- **Three route layers:** public site (`src/app/`) SSG-first, dynamic pages enumerate via `generateStaticParams`; CMS `src/app/admin/(dashboard)/*` is `force-dynamic` with `auth()` guard in `layout.tsx`; API `src/app/api/*` route handlers.
- **API response shape is unified:** `{ success, data?, error?, details? }`. Write handlers require `auth()` + role check + Zod validation.
- **Data access:** static data lives in `src/lib/{brand,products,store,news,certifications,history,china-regions}.ts`; DB access via `src/lib/prisma.ts` singleton (`PrismaPg` adapter) → `src/lib/data.ts` aggregates (API-first, static fallback). **Never call `prisma.*` directly in RSC** — writes go through API routes.
- **Auth:** NextAuth v5 beta, Credentials + JWT (no DB sessions). Roles `admin` / `editor`; type extension in `src/types/next-auth.d.ts`.
- **Client analytics:** `src/components/AnalyticsProvider.tsx` auto pageview on route change + `src/lib/analytics.ts` (buffers 5 events / 10s, `sendBeacon`); server `/api/analytics/track` is rate-limited 60/min/IP with a type whitelist.

## Topic-page pattern (wenjie / xiaomi / zeekr / flooring)

Each product topic shares this structure — follow it for new topics:
1. `src/lib/<topic>-products.ts` — static data + **literal types** for image specs (1448×1086, 4:3) to prevent spec drift.
2. `src/components/<topic>/` — 5 components: `AnchorNav`, `ProductCard` (3-state `imageStatus: matched | pending-review | missing`), `ProductGrid`, `ProductTable`, `TopicBanner`.
3. `src/app/product/<topic>/page.tsx` — RSC: Hero + anchor nav + per-model sections + service flow + CTA + `ItemList` JSON-LD.
4. Add `<XxxTopicBanner />` entry in `src/app/product/page.tsx`.
5. Add a CI verify script (e.g. `scripts/verify-zeekr-images.mjs`) and chain it into `npm run check`.

Theme colors: xiaomi=orange, wenjie=cyan, zeekr=orange, flooring=amber. Image containers: `aspect-[4/3] + object-contain + Next/Image sizes`.

## Testing & Prisma notes

- API route test pattern: `vi.hoisted` + `vi.mock('@/lib/prisma')` + `vi.resetModules` + dynamic `await import('./route')`.
- **Prisma 7 + Driver Adapter error shape:** `P2022` (ColumnNotFound) and `P2002` return `{ code, meta: { modelName, driverAdapterError: { cause } } }` — **not** the legacy `meta.target`. Check `meta.driverAdapterError.cause` for the real column/message.
- Migrations live in `prisma/migrations/`; use `npx prisma migrate deploy` for fresh DBs, then `npx prisma db seed` (writes admin + 27 provinces / 75 cities).

## Sync scripts (after editing source-of-truth files)

- **`AGENTS.md` is the single source of truth.** `CLAUDE.md` and `GEMINI.md` just `@AGENTS.md`. After editing it, run `bash scripts/sync-agent-rules.sh` to regenerate `.github/copilot-instructions.md`, `.clinerules`, `.continue/rules/project.md`, `.amazonq/rules/project.md`.
- After editing `.claude/skills/clone-website/SKILL.md`, run `node scripts/sync-skills.mjs`.

## AI workflow conventions

- `/prompt-boost` (natural language → spec) → `/dispatch` (architect → coder → tester → deployer pipeline).
- **Trellis is configured in `.trellis/`** with the `channel-driven-subagent-dispatch` workflow. Use it for non-trivial AI development tasks so requirements, plans, implementation notes, review output, and spec updates stay auditable.
- **Codex Desktop is skill-first.** Users should normally speak naturally or invoke `$lanhui-trellis-daily`, `$trellis-start`, `$trellis-continue`, or `$trellis-finish-work`; the agent runs the underlying `.trellis/scripts/*.py` commands. Do not make users memorize Python lifecycle commands.
- Natural-language routing: “开始/查看项目状态” → `trellis-start`; a new non-trivial feature or audit → request task-creation consent, then `trellis-brainstorm`; “继续当前任务” → `trellis-continue`; “完成/收尾” → `trellis-finish-work`; “回忆上次怎么做” → `trellis-session-insight`.
- Internal Trellis task flow: create task → fill `prd.md` (plus `design.md` / `implement.md` for complex tasks) → obtain implementation approval → start task → implement/check → update `.trellis/spec/*` when conventions change → finish/archive. Python commands are implementation details used by the agent and CI, not the primary user interface.
- Lightweight questions, small edits, or user-declined task tracking may skip Trellis for that turn; do not create Trellis tasks without user consent.
- `.trellis/spec/frontend/` captures this project's frontend conventions for future AI agents. Keep it factual and synced with real code patterns, not aspirational rewrites.
- Codex users: Trellis hooks need `features.hooks = true` in `~/.codex/config.toml` (Codex 0.129+) and one `/hooks` approval for the Trellis `UserPromptSubmit` hook.
- **Worktree isolation for parallel agents:** `git worktree add .claude/worktrees/agent-<id> -b worktree-agent-<id> master`; each coder commits in its own worktree; orchestrator merges with `--no-ff` and resolves conflicts.

## Code style

TS strict, `any` forbidden · named exports, PascalCase components, camelCase utils · Tailwind utilities only (no inline styles) · 2-space · mobile-first · shared client state via module-level emitter + hook (e.g. `src/lib/wechat-modal.ts`).
