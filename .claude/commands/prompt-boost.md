---
description: Translate a rough LANHUI request into a precise implementation prompt
---

# /prompt-boost - LANHUI Prompt Refinement

Use this command before `/spec` or `/dispatch` when the user's request is vague,
broad, or missing project-specific context.

## Role In The Workflow

`/prompt-boost` is the discovery and translation layer:

```text
rough request -> /prompt-boost -> precise prompt -> /spec or /dispatch
```

It does not replace PRDs. It makes the next step clearer.

## Process

1. Read `CLAUDE.md` and `AGENTS.md`.
2. Scan project context relevant to the request:
   - `package.json`
   - `src/app/`
   - `src/components/`
   - `src/lib/`
   - `docs/PRD/`
   - existing assets under `public/`
3. Identify intent, affected routes, data, components, APIs, assets, and risks.
4. Resolve obvious defaults from project conventions.
5. Mark unresolved product decisions explicitly.
6. Produce a structured Markdown prompt that can feed `/spec`, `/plan`, or `/dispatch`.

## Output Format

Return:

- Requirement title.
- User goal and business result.
- Relevant project context.
- Affected files and modules.
- Proposed implementation boundaries.
- Acceptance criteria.
- Ambiguities and recommended defaults.
- Recommended next command:
  - `/spec` if a PRD is missing.
  - `/plan` if a PRD already exists and only implementation planning is needed.
  - `/dispatch` if the work is approved and ready for agent-team execution.

## Rules

- Do not edit code.
- Do not invent business facts.
- Prefer PRD creation over direct implementation when product intent is not settled.
