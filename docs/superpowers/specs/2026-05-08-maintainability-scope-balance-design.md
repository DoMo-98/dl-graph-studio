# Maintainability Scope Balance Design

## Context

`dl-graph-studio` uses a roadmap workflow where each implementation task is
driven by a confirmed GitHub issue, one branch, and one reviewable pull request.
That workflow protects product-owner control and keeps pull requests small, but
it can create a false tension during implementation: an agent may interpret
"stay within scope" as "make the smallest literal edit", even when the touched
code clearly needs a local structural improvement to remain maintainable.

The repository already has milestone technical audits for broader corrective
work. This design adds a day-to-day implementation rule for the smaller quality
decisions that appear inside normal issues.

## Goal

Formalize how agents should balance issue scope with code maintainability and
scalability:

- preserve the one-issue, one-reviewable-PR workflow,
- allow bounded local improvements when they directly support the current task,
- prevent brittle minimal edits that make future work harder,
- avoid speculative abstractions and broad refactors,
- create follow-up roadmap issues when the right improvement is larger than the
  current issue can responsibly contain.

## Recommended Approach

Encode this as an operating convention in `AGENTS.md` and the human roadmap
process. Do not change the issue or pull request templates yet.

Every implementation should treat maintainability and scalability as part of
doing the issue well, not as optional polish. When the agent touches an area of
code, it may include local structural improvements in the same pull request if
all of these conditions are true:

- the improvement is directly connected to the current issue,
- it reduces real complexity, duplication, coupling, fragility, or unclear local
  ownership,
- it does not change product behavior outside the issue acceptance criteria,
- it does not introduce abstractions for hypothetical future requirements,
- it keeps the pull request reviewable in the normal 15-30 minute window,
- it has verification proportional to the behavioral and architectural risk.

This convention should guide implementation judgment without weakening scope
control. The issue remains the delivery contract, but the agent is expected to
leave touched code in a shape that can support the next roadmap task.

## Decision Rules

Use this classification while implementing an issue:

### Local Quality Improvement

Allowed inside the issue when the improvement is necessary or clearly helpful
for the touched code.

Examples:

- extract a focused helper from code being modified for the issue,
- remove duplication introduced or exercised by the issue,
- clarify naming in a touched local module when the old name obscures the new
  behavior,
- tighten types where weak types would make the new behavior fragile,
- move code behind an existing local boundary when the current edit would
  otherwise increase coupling.

### Follow-Up Roadmap Work

Create or propose a follow-up issue when the improvement is valid but too large,
cross-cutting, or dependent on product-owner or architecture decisions.

Examples:

- broad component or module consolidation,
- persistence shape changes beyond the current issue,
- dependency adoption or migration,
- state-management changes that affect unrelated flows,
- refactors that would make the pull request hard to review in 15-30 minutes.

### Out Of Scope

Do not include the change when it is speculative, unrelated, or mostly aesthetic.

Examples:

- abstractions created only because future work might need them,
- formatting churn unrelated to touched lines,
- renaming across unrelated modules,
- framework, tooling, or dependency migrations without a concrete current need,
- product behavior changes not covered by the confirmed issue.

## Agent Workflow

During implementation, the agent should:

1. Read the issue objective, scope, out-of-scope, acceptance criteria, and
   verification before editing.
2. Inspect the touched code's existing ownership boundaries and local patterns.
3. Identify whether a literal minimal edit would add meaningful technical debt.
4. Include bounded local quality improvements only when they satisfy the
   decision rules above.
5. Stop and ask for product-owner confirmation when the correct improvement
   would change behavior, exceed the review window, or require an architecture
   tradeoff.
6. Record deferred quality findings as follow-up roadmap candidates or route
   them to the milestone technical audit when that is the better container.
7. Explain any included quality improvement in the pull request summary and
   verification notes.

## Relationship To Existing Scope Control

This convention does not replace issue scope. It clarifies that scope should be
interpreted as the product and review boundary, not as a ban on responsible
local engineering.

The agent must still obey explicit `Out of scope` sections. If an issue says a
particular refactor, dependency change, or behavior is out of scope, that
boundary wins unless the product owner confirms an update to the issue.

Milestone technical audits remain the default container for broader architecture
boundaries, component consolidation, library usage, test coverage, and
maintainability work that is not necessary for a specific implementation issue.

## Verification

Verification should scale with the quality change:

- pure local extraction with unchanged behavior should run the existing relevant
  checks,
- type or state-boundary changes should include targeted tests when practical,
- UI-adjacent refactors should include the issue's manual UI verification,
- deferred quality findings should be documented clearly enough to become a
  roadmap issue later.

The agent should not claim a quality improvement is complete without verifying
that the issue behavior still works and that the refactor did not alter
unrelated behavior.

## Out Of Scope

This design does not:

- authorize agents to implement unconfirmed roadmap work,
- allow broad refactors inside normal feature issues,
- weaken explicit issue out-of-scope boundaries,
- require a new checkbox in every issue or pull request template,
- replace milestone technical audits,
- introduce automation or CI enforcement.

## Rationale

The existing roadmap workflow optimizes for reviewability and product-owner
control. That remains correct, but long-term product speed also depends on the
quality of the code left behind by each small task.

The recommended rule gives agents permission to improve code they are already
touching when the improvement is concrete and bounded. It also gives them a
clear stopping rule when the right technical move is larger than the current
issue. This keeps the project from accumulating avoidable local debt without
opening the door to overengineering or hidden scope creep.
