# Maintainability Scope Balance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the approved maintainability scope balance convention into the repository's agent rules and human roadmap process.

**Architecture:** This is a documentation-only operating-rule change. `AGENTS.md` becomes the executable instruction source for future agents, while `docs/roadmap/roadmap-process.md` becomes the human-readable workflow reference. The approved design spec remains the detailed source of rationale.

**Tech Stack:** Markdown documentation, Git, `rg` verification.

---

## File Structure

- Modify: `AGENTS.md`
  - Add the new design spec to `Source Of Truth`.
  - Add a dedicated `Maintainability And Scope Balance` section between `Milestone Technical Audit` and `Branches`.
  - Keep the existing `Scope Control` section, but update its first bullet so it no longer implies a literal minimum edit when a bounded local quality improvement is needed.
- Modify: `docs/roadmap/roadmap-process.md`
  - Add a dedicated `Maintainability And Scope Balance` section between `Milestone Technical Audit` and `Milestone UX/UI Hardening`.
  - Keep the `Agent Cycle` implementation step scoped, but update its wording to reference the new convention.

Do not modify `.github/ISSUE_TEMPLATE/roadmap-task.md` or `.github/pull_request_template.md`; the approved spec explicitly leaves templates unchanged.

### Task 1: Update Agent Operating Rules

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add the source-of-truth bullet**

In `AGENTS.md`, in the `Source Of Truth` list, insert this bullet after the `start-task-in-progress` spec bullet:

```md
- `docs/superpowers/specs/2026-05-08-maintainability-scope-balance-design.md` defines how implementation work balances issue scope with maintainability and scalability.
```

- [ ] **Step 2: Add the maintainability scope balance section**

In `AGENTS.md`, insert this section after the `Milestone Technical Audit` section and before `Branches`:

```md
## Maintainability And Scope Balance

- Treat maintainability and scalability as part of implementing an issue well, not as optional polish.
- When touching code for a confirmed issue, include bounded local quality improvements when they are directly connected to the issue and reduce real complexity, duplication, coupling, fragility, or unclear ownership.
- Local quality improvements must not change product behavior outside the issue acceptance criteria, introduce abstractions for hypothetical future requirements, or make the pull request too large for the normal 15-30 minute review window.
- The issue's explicit `Out of scope` section still wins. If a needed quality improvement conflicts with that boundary, stop and ask the product owner to confirm an issue update before continuing.
- If the right maintainability or scalability improvement is valid but too large, cross-cutting, or dependent on product-owner or architecture decisions, create or propose a follow-up roadmap issue instead of bundling it into the current PR.
- Use milestone technical audits for broader architecture boundaries, component consolidation, library usage, test coverage, and maintainability work that is not necessary for a specific implementation issue.
- Explain any included local quality improvement in the PR summary and verify that the issue behavior still works.
```

- [ ] **Step 3: Update scope control wording**

In `AGENTS.md`, replace this bullet in `Scope Control`:

```md
- Implement only the issue scope.
```

with:

```md
- Implement only the issue scope, interpreted with the maintainability and scope balance convention above.
```

- [ ] **Step 4: Verify the agent rules text**

Run:

```bash
rg -n -F -e "2026-05-08-maintainability-scope-balance-design" -e "Maintainability And Scope Balance" -e "interpreted with the maintainability and scope balance convention" AGENTS.md
```

Expected: output includes the new source-of-truth bullet, the new section heading, and the updated scope control bullet.

- [ ] **Step 5: Commit the agent rules update**

Run:

```bash
git add AGENTS.md
git commit -m "docs: add maintainability scope agent rules"
```

Expected: commit succeeds with `AGENTS.md` changed.

### Task 2: Update Human Roadmap Process

**Files:**
- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Add the roadmap process section**

In `docs/roadmap/roadmap-process.md`, insert this section after `Milestone Technical Audit` and before `Milestone UX/UI Hardening`:

```md
## Maintainability And Scope Balance

Implementation issues should preserve the one-issue, one-reviewable-PR workflow while still leaving touched code maintainable and ready for later roadmap work.

Agents may include local quality improvements in the same pull request when all of these conditions are true:

- the improvement is directly connected to the current issue,
- it reduces real complexity, duplication, coupling, fragility, or unclear local ownership,
- it does not change product behavior outside the issue acceptance criteria,
- it does not introduce abstractions for hypothetical future requirements,
- it keeps the pull request reviewable in the normal 15-30 minute window,
- it has verification proportional to the behavioral and architectural risk.

If the improvement is valid but too large, cross-cutting, or dependent on product-owner or architecture decisions, it should become a follow-up roadmap issue or be routed to the milestone technical audit. If the issue explicitly marks the improvement out of scope, the agent should stop and ask the product owner to confirm an issue update before continuing.

This convention does not authorize broad refactors, dependency migrations, product behavior changes, or formatting churn inside normal implementation issues.
```

- [ ] **Step 2: Update the Agent Cycle implementation step**

In `docs/roadmap/roadmap-process.md`, replace this Agent Cycle item:

```md
8. The agent implements only the issue scope.
```

with:

```md
8. The agent implements the issue scope using the maintainability and scope balance convention.
```

- [ ] **Step 3: Verify the roadmap process text**

Run:

```bash
rg -n -F -e "Maintainability And Scope Balance" -e "one-issue, one-reviewable-PR" -e "using the maintainability and scope balance convention" docs/roadmap/roadmap-process.md
```

Expected: output includes the new section heading, the section's first paragraph, and the updated Agent Cycle item.

- [ ] **Step 4: Commit the roadmap process update**

Run:

```bash
git add docs/roadmap/roadmap-process.md
git commit -m "docs: document maintainability scope balance"
```

Expected: commit succeeds with `docs/roadmap/roadmap-process.md` changed.

### Task 3: Final Documentation Verification

**Files:**
- Inspect: `AGENTS.md`
- Inspect: `docs/roadmap/roadmap-process.md`
- Inspect: `docs/superpowers/specs/2026-05-08-maintainability-scope-balance-design.md`

- [ ] **Step 1: Verify no template changes are staged or present**

Run:

```bash
git diff --name-only HEAD
```

Expected: no output after the two documentation commits.

Run:

```bash
git show --name-only --oneline HEAD~2..HEAD
```

Expected: output lists only `AGENTS.md` and `docs/roadmap/roadmap-process.md` in the two implementation commits.

- [ ] **Step 2: Verify cross-document references**

Run:

```bash
rg -n -F -e "maintainability and scope balance" -e "Maintainability And Scope Balance" -e "2026-05-08-maintainability-scope-balance-design" AGENTS.md docs/roadmap/roadmap-process.md docs/superpowers/specs/2026-05-08-maintainability-scope-balance-design.md
```

Expected: output shows references in the agent rules, roadmap process, and approved design spec.

- [ ] **Step 3: Review final history**

Run:

```bash
git log --oneline -3
```

Expected: output includes:

```text
docs: document maintainability scope balance
docs: add maintainability scope agent rules
docs: add maintainability scope balance design
```

- [ ] **Step 4: Manual verification**

Open `AGENTS.md` and confirm:

- future agents are told to treat maintainability and scalability as part of implementing an issue well,
- bounded local improvements are allowed only when directly connected to the issue,
- broad or ambiguous improvements are routed to follow-up issues or milestone technical audit,
- explicit issue out-of-scope boundaries still win.

Open `docs/roadmap/roadmap-process.md` and confirm the same convention is documented for human readers without adding issue or PR template requirements.

## Self-Review

- Spec coverage: The plan implements the approved design by updating `AGENTS.md` and `docs/roadmap/roadmap-process.md`, leaves templates unchanged, keeps technical audits as the container for broader work, and preserves the 15-30 minute review window.
- Placeholder scan: The plan contains no placeholder markers or unspecified implementation steps.
- Type consistency: Not applicable; this is a Markdown documentation change.
