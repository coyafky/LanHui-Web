---
description: Implement the next approved LANHUI plan task incrementally
---

# /build - LANHUI Incremental Implementation

Use this command only after `/plan` has produced an approved implementation plan.

## Goal

Implement one vertical slice at a time, verify it, and keep the working tree clean enough for review.

## Modes

- `/build`: implement the next pending task only.
- `/build auto`: implement all approved tasks in order, stopping on ambiguity, failing verification, or high-risk changes.

## Process

1. Read `CLAUDE.md`, `AGENTS.md`, the approved PRD, and the approved plan.
2. Inspect `git status --short` and avoid unrelated user or agent changes.
3. Read relevant Next.js 16 docs before editing App Router, metadata, images, route handlers, or caching.
4. Implement the minimum change required for the current task.
5. For UI work, use the PRD and project design rules as instructions; use shadcn only as the component library.
6. Prefer installed shadcn components before custom markup when they fit the PRD.
7. If a required shadcn component is missing, use shadcn MCP or `npx shadcn@latest add <component>`, then review added files.
8. Prefer Server Components. Use the smallest possible Client Component for analytics or interaction.
9. Keep data structured in `src/lib/`; do not hardcode large product lists in JSX.
10. Keep frontend assets under `public/`; never render `.hermes`, `Downloads`, or local absolute paths.
11. Run the task's verification steps.
12. Mark only the current task complete in the plan, if the plan has checkboxes.

## Verification

At minimum for code changes:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

For frontend changes, also verify:

- 390px mobile.
- 768px tablet.
- 1440px desktop.
- No text overlap.
- Images load and keep stable dimensions.
- CTA links and analytics behave as the PRD requires.

## Stop Conditions

Stop and ask the orchestrator when:

- The PRD and code disagree.
- Required assets are missing.
- A production claim is unverified.
- A task touches auth, database migrations, destructive deletes, secrets, payments, or irreversible data.
- Tests or build fail and the fix is not obvious.

## Output

Return:

- Files changed.
- PRD acceptance criteria satisfied.
- Verification run and results.
- Screenshots or browser notes for frontend work.
- Remaining tasks.
