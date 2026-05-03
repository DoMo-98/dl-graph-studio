# Product Owner Idea Intake Design

## Context

`dl-graph-studio` already uses an agent-assisted roadmap workflow where
GitHub Issues and the GitHub Project are the operational source of truth for
executable work. The existing process covers ready issue selection, branch and
pull request scope, milestone technical audit, and milestone UX/UI hardening.

The remaining gap is intake for new product-owner ideas that appear during
normal conversation. Without an explicit rule, an agent could treat an idea as
an informal note, jump straight to implementation, or place it in the wrong
roadmap container.

The desired default is to convert a new idea into a roadmap issue that is ready
to execute as soon as the objective, scope, acceptance criteria, and verification
are clear enough.

## Goal

Add a lightweight intake convention for product-owner ideas:

- preserve product-owner control over prioritization and readiness,
- avoid losing ideas in chat,
- avoid starting implementation before an issue exists,
- convert clear ideas into executable roadmap issues quickly,
- split broad ideas before they become oversized pull requests.

## Recommended Workflow

When the product owner says something like "se me ocurre..." or otherwise
proposes new product work, the agent should treat the message as idea intake by
default.

The agent's first goal is to convert the idea into a roadmap issue that can
enter `Ready`. The agent should not implement the idea during intake.

Use this sequence:

1. Classify the idea.
2. Check whether it belongs in an existing milestone closeout issue.
3. Ask only the clarifying questions needed to produce a complete issue.
4. Draft a roadmap issue using `.github/ISSUE_TEMPLATE/roadmap-task.md`.
5. Validate the issue with `pnpm validate:roadmap-issue -- --title
   "[Roadmap]: <title>" --body <body-file>` before applying `ready` or adding it
   to the Project as ready.
6. Ask the product owner to confirm creation, readiness, and priority.

The agent may create or update the live GitHub issue only after product-owner
confirmation, unless the product owner has explicitly delegated issue creation
for that specific intake.

## Classification

Classify the idea before drafting the issue:

- `UX/UI finding`: small product-owner-reported interface issue in the current
  milestone. Record it in `[Roadmap]: Phase N UX/UI hardening` when it fits that
  issue's scope.
- `Technical audit finding`: architecture, maintainability, library usage, test
  coverage, or milestone-local technical debt that belongs in
  `[Roadmap]: Phase N technical audit` when it fits that issue's scope.
- `New roadmap task`: a feature, behavior change, product correction, workflow
  change, documentation change, or technical task with its own objective and
  verification.
- `PRD-level idea`: a larger product direction that changes the high-level
  product intent. Capture it as a PRD or planning discussion before creating
  executable issues.

If an idea could fit more than one category, prefer the smallest container that
preserves scope clarity. Do not hide new product capabilities inside hardening
or audit issues.

## Readiness Gate

A new roadmap issue can be proposed as ready only when it has:

- a concrete objective,
- specific included scope,
- explicit out-of-scope boundaries,
- acceptance criteria that can be observed or reviewed,
- automated verification or a clear reason why automated verification is not
  applicable,
- manual verification steps,
- milestone and label recommendations,
- an expected pull request size that fits the normal 15-30 minute review window.

If any part is missing, the agent should ask a focused question instead of
inventing product behavior silently.

If the issue is too large, the agent should propose a split and recommend the
first issue to create. The first issue should deliver the smallest useful slice
that reduces uncertainty or unlocks later work.

## Draft Issue Shape

Intake output should use the roadmap task template:

```md
## Objective

## Scope

## Out of scope

## Acceptance criteria

## Verification

Automated:

Manual:

## Notes
```

The draft should also include:

- proposed title with the `[Roadmap]: ` prefix,
- recommended milestone,
- recommended labels,
- whether the issue should be `Ready` immediately or remain blocked by a named
  decision.

## Enforcement

This convention should be encoded in:

- `AGENTS.md`, as an operating rule for agent behavior,
- `docs/roadmap/roadmap-process.md`, as the human-readable workflow reference.

No GitHub Actions or project automation should be added yet. The process should
be used manually for several real ideas first. Automation should follow observed
friction, such as repeated issue format mistakes, missing `Closes #` links, or
manual project-state drift.

## Out Of Scope

This intake convention does not:

- allow agents to start implementation without a confirmed issue,
- make all ideas automatically high priority,
- require every idea to become `Ready` if scope or verification is unclear,
- replace `PRD.md` for high-level product direction,
- add CI, GitHub Actions, or Project automation in the initial version.

## Rationale

The repository already has strong execution rules once a roadmap issue exists.
The weak point is the moment before that, when a product-owner idea is still
informal. A mandatory intake checklist closes that gap while keeping the process
light enough for day-to-day use.

The recommended approach turns ideas into executable issues quickly, but keeps
the product owner in control of final creation, readiness, and priority.
