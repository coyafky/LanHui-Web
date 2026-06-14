---
description: Define a LANHUI feature PRD before implementation
---

# /spec - LANHUI PRD Workflow

Use this command when a feature, page, flow, or substantial behavior change is not yet specified.

## Goal

Turn a rough request into a PRD that Claude Code architects, coders, and testers can execute without guessing.

## Inputs

- User request and attached assets.
- Existing docs in `docs/`.
- Existing PRDs in `docs/PRD/`.
- Relevant data and code under `src/`, `public/`, and `prisma/`.

## Process

1. Read `CLAUDE.md` and `AGENTS.md`.
2. Discover project context before asking questions.
3. Ask one clarifying question at a time when product intent is unclear.
4. Define the target users, business result, scope, non-goals, data sources, UI requirements, analytics, SEO, risks, and verification.
5. Write the PRD to `docs/PRD/<TOPIC>_PRD_<YYYY-MM-DD>.md`.
6. Do not write implementation code during `/spec`.

## Required PRD Sections

- Document information.
- Background and objective.
- Target users and business results.
- Scope and non-goals.
- Information architecture or user flow.
- Data and asset requirements.
- UI and responsive requirements.
- Analytics and conversion requirements, when applicable.
- SEO, accessibility, and content-claim rules.
- Architect execution rules.
- Coder execution rules.
- Tester execution rules.
- Acceptance criteria.
- Risks and follow-up loop.

## LANHUI Rules

- Do not invent phone numbers, addresses, ICP records, certificates, prices, warranty periods, or official partnerships.
- For Xiaomi pages, do not imply Xiaomi official authorization unless the business provides proof.
- If assets come from local knowledge folders, the PRD must require copying them into `public/` before frontend use.

## Output

Return:

- PRD file path.
- Summary of the decision.
- Open questions, if any.
- Clear statement that implementation must wait for PRD approval.
