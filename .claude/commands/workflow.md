---
description: Explain the LANHUI Claude workflow and which command to run next
---

# /workflow - LANHUI Agent Workflow

Use this command to orient a Claude Code session.

## Lifecycle

```text
rough request
  ↓
/prompt-boost
  ↓  project-aware precise prompt
/spec
  ↓  PRD
/plan
  ↓  executable tasks
/dispatch or /build
  ↓  multi-agent execution or direct single-agent implementation
/test
  ↓
/review
  ↓
/ship
```

`shadcn` is not a lifecycle stage. It is the component library and MCP-backed
registry tooling that may be used inside `/plan` and `/build` for UI work.

## When To Use Each Command

- `/prompt-boost`: request is rough and needs project-aware translation.
- `/spec`: requirements are clear enough to write or refine a PRD.
- `/plan`: PRD exists and needs executable tasks.
- `/dispatch`: approved PRD or plan should be delegated to agent roles.
- `/build`: approved plan exists and the next task should be implemented directly.
- `/test`: implementation needs proof against the PRD.
- `/review`: changes need code review before merge.
- `/ship`: feature is ready for go/no-go.

## Project Anchors

- Global rules: `AGENTS.md`
- Claude project rules: `CLAUDE.md`
- PRDs: `docs/PRD/`
- Implementation plans: `docs/plans/`
- Next.js docs: `node_modules/next/dist/docs/`
- Skills: `.claude/skills/`

## Team Model

For multi-agent work:

- `/prompt-boost` prepares precise context when the request is vague.
- Architect runs `/plan`.
- UI-heavy tasks may consult shadcn MCP as a component library, but PRD and
  project rules remain the instruction source.
- Orchestrator runs `/dispatch` when multiple agents are needed.
- Coder runs `/build` for direct single-agent implementation or assigned slices.
- Tester runs `/test`.
- Orchestrator runs `/review` and `/ship`.

All teammates use separate worktree branches and the orchestrator merges.
