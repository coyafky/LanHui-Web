---
description: Run LANHUI pre-merge or pre-launch go/no-go checklist
---

# /ship - LANHUI Ship Gate

Use this command when a feature is ready for merge, staging, or production.

## Goal

Make a GO / NO-GO decision using PRD acceptance criteria, verification output, risk review, and rollback thinking.

## Process

1. Read `CLAUDE.md`, PRD, plan, and test report.
2. Inspect current diff or release commits.
3. Confirm all required checks ran:
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
   - relevant tests
   - browser checks for frontend work
4. Confirm PRD acceptance criteria are satisfied.
5. Confirm no unrelated files are staged.
6. Confirm no local absolute paths, fake business claims, or unsafe analytics payloads.
7. Define rollback procedure.

## GO Criteria

Ship only when:

- No Critical review findings remain.
- PRD acceptance criteria are met.
- Build and type gates pass.
- Frontend verification covers mobile, tablet, and desktop when UI changed.
- Known risks are documented and accepted.

## NO-GO Criteria

Default to NO-GO when:

- Build, lint, or typecheck fails.
- Required assets are missing.
- The page contains unverified official/authorization claims.
- Analytics sends personal data.
- There are broken critical user flows.
- Rollback path is unclear.

## Output

Return:

```markdown
## Ship Decision: GO | NO-GO

### Blockers

### Recommended Fixes

### Verified Acceptance Criteria

### Commands And Browser Checks

### Known Risks

### Rollback Plan
```
