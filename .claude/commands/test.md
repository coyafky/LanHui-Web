---
description: Verify LANHUI changes against the PRD and project gates
---

# /test - LANHUI Verification Workflow

Use this command after implementation or when validating another agent's work.

## Goal

Prove the change works according to the PRD, not just that the code compiles.

## Process

1. Read the PRD and implementation plan.
2. Inspect the diff or recent commits.
3. Build a verification matrix from PRD acceptance criteria.
4. Run automated checks.
5. Run browser checks for frontend work.
6. Record failures with file paths, reproduction steps, and expected behavior.

## Required Checks

For code changes:

- `npm run lint`
- `npm run typecheck`
- `npm run build`

When tests exist or logic changed:

- `npm run test`

For browser UI:

- Desktop 1440px screenshot or inspection.
- Tablet 768px screenshot or inspection.
- Mobile 390px screenshot or inspection.
- Verify no overlap, clipped text, blank images, broken links, or layout jumps.

For analytics:

- Verify event name.
- Verify metadata shape.
- Verify no personal data is sent.
- Verify analytics does not block user actions.

For image-heavy pages:

- Confirm images load from `public` paths.
- Confirm page source does not include `.hermes`, `Downloads`, or absolute local paths.

## Output

Return:

- PRD checklist with pass/fail.
- Commands run.
- Browser viewports checked.
- Bugs found, ordered by severity.
- Screenshots or artifact paths when available.
