---
description: Review LANHUI changes for correctness, maintainability, security, performance, and PRD fit
---

# /review - LANHUI Code Review Gate

Use this command before merging agent work or after a completed implementation slice.

## Review Stance

Prioritize issues that could cause wrong behavior, broken UX, production risk, security problems, performance regressions, or PRD mismatch.

## Axes

1. Correctness: Does it satisfy the PRD? Are edge cases handled?
2. Maintainability: Does it follow local patterns and keep boundaries clear?
3. Next.js 16 Fit: Are App Router, Server Component, metadata, image, and caching patterns correct?
4. UX and Accessibility: Does it work on mobile and desktop? Are links, alt text, focus, and text layout sound?
5. Security and Content Claims: Does it avoid unverified business claims and unsafe data handling?
6. Performance: Are images optimized? Any unnecessary client components or large bundles?
7. Tests and Verification: Are checks sufficient and actually run?

## Process

1. Read `CLAUDE.md`, target PRD, and plan.
2. Inspect `git diff` and relevant files.
3. Check for unrelated changes.
4. Produce findings first, ordered by severity.
5. Include file and line references where possible.
6. Do not rewrite the implementation during review unless explicitly asked.

## Finding Severity

- Critical: must fix before merge or launch.
- Important: should fix before merge.
- Suggestion: improvement, not blocking.

## Output

Return:

- Findings first.
- Open questions.
- Verification gaps.
- Short summary only after findings.
