---
description: Convert an approved LANHUI PRD into an implementation plan
---

# /plan - LANHUI Implementation Planning

Use this command after a PRD in `docs/PRD/` has been approved.

## Goal

Create a small, verifiable implementation plan that maps each PRD acceptance criterion to concrete files, tasks, and checks.

## Process

1. Read `CLAUDE.md`, `AGENTS.md`, and the target PRD.
2. Read relevant code and docs before proposing changes.
3. For Next.js work, read the relevant guide under `node_modules/next/dist/docs/`.
4. Identify the smallest vertical slices that can be built and verified independently.
5. For UI work, identify whether existing or shadcn-provided components can serve the PRD without becoming the instruction source.
6. Define task dependencies and acceptance criteria.
7. Identify risky areas: data model, auth, uploads, analytics, SEO, images, responsive UI, local absolute paths.
8. Present the plan for human approval before `/build`.

## Plan Format

Save the plan to:

`docs/plans/<topic>-implementation-plan-<YYYY-MM-DD>.md`

Include:

- PRD source path.
- Files expected to change.
- Task list in dependency order.
- Acceptance criteria per task.
- Verification commands.
- Browser viewport checks for frontend work.
- Component library assets to reuse or add, when UI is involved.
- Rollback notes.

## Agent Team Split

When using multiple Claude agents:

- Architect owns this plan.
- Coder implements one vertical slice at a time.
- Tester verifies against the PRD, not against coder intent.
- Orchestrator merges and resolves conflicts.

Each teammate must work in a separate worktree branch.

## Output

Return:

- Plan file path.
- Task sequence.
- Required approval checkpoint.
- Any unresolved product or technical decisions.
