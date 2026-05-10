# Milestone Project Board Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document and apply a GitHub Project milestone focus convention so the roadmap board has one active milestone view and one global milestone overview.

**Architecture:** Keep GitHub Milestones as canonical issue metadata and add a Project-only `Milestone Focus` field for board visibility. Update repository workflow docs so future agents assign and advance milestone focus consistently, then manually verify the live GitHub Project views.

**Tech Stack:** Markdown documentation, GitHub Issues, GitHub Projects, `pnpm format:check`, `pnpm validate:commit-message`.

---

## File Structure

- Modify `AGENTS.md`: add the board focus design source of truth and agent operating rules for `Milestone Focus`, issue intake, and milestone advancement.
- Modify `docs/roadmap/roadmap-process.md`: document the Project field, required views, issue intake impact, and milestone transition workflow for humans.
- External manual configuration: update the live `dl-graph-studio Roadmap` GitHub Project with the `Milestone Focus` field and two saved views.

## Task 1: Update Agent Operating Instructions

**Files:**

- Modify: `AGENTS.md`

- [ ] **Step 1: Add the design spec to Source Of Truth**

  In `AGENTS.md`, add this bullet after the existing `2026-05-08-maintainability-scope-balance-design.md` bullet:

  ```md
  - `docs/superpowers/specs/2026-05-10-milestone-project-board-focus-design.md` defines the GitHub Project milestone focus field, active milestone view, global milestone overview, and milestone focus advancement convention.
  ```

- [ ] **Step 2: Add the milestone board focus section**

  In `AGENTS.md`, add this section after the `Product Owner Idea Intake` section and before `Milestone UX/UI Hardening`:

  ```md
  ## Milestone Project Board Focus

  - The `dl-graph-studio Roadmap` GitHub Project must use a single-select Project field named `Milestone Focus` with values `Current`, `Next`, `Later`, and `Closed`.
  - GitHub Milestones remain the canonical phase assignment for issues. `Milestone Focus` controls Project-board visibility and does not replace the issue milestone.
  - The Project should have an `Active Milestone` board view filtered to `Milestone Focus:Current` and grouped by the existing `Status` field.
  - The Project should have a `Milestone Overview` global view that shows all roadmap items with GitHub Milestone, `Milestone Focus`, `Status`, labels, and linked pull requests visible.
  - When creating or updating a roadmap issue, set both the issue's GitHub Milestone and the Project item's `Milestone Focus` value.
  - Use `Current` for the active milestone, `Next` for the next planned milestone, `Later` for future milestone work, and `Closed` for completed milestone work after closeout is accepted.
  - `Milestone Focus` must not change the executable task rule: an executable issue still requires Project status `Ready` and the `ready` label.
  - When every issue in the `Current` milestone is `Done`, first check that milestone UX/UI hardening and technical audit are `Done` or explicitly skipped, no milestone pull request remains open in review, and no blocking follow-up must be completed before closeout.
  - If closeout is complete, propose moving the completed milestone's Project items from `Current` to `Closed` and the next milestone's Project items from `Next` to `Current`. After product-owner confirmation, update the Project fields if tooling and permissions allow.
  - A milestone focus transition updates board focus only. It does not authorize implementation of the next roadmap issue.
  - If Project field updates fail because of permissions, missing tooling, unresolved Project metadata, GitHub availability, or another blocker, report the limitation and ask for the concrete access, authorization, or Project metadata needed to complete the update.
  ```

- [ ] **Step 3: Extend idea intake rules with focus metadata**

  In `AGENTS.md`, add this bullet after:

  ```md
  - Ask focused clarifying questions until the issue has objective, scope, out-of-scope, acceptance criteria, verification, milestone, labels, and an expected PR size that fits the normal 15-30 minute review window.
  ```

  Add:

  ```md
  - Recommend a `Milestone Focus` value for each drafted roadmap issue: normally `Current` for active milestone work, `Next` for prepared next-milestone work, and `Later` for future milestone work.
  ```

- [ ] **Step 4: Review the updated `AGENTS.md` section placement**

  Run:

  ```bash
  rg -n 'milestone-project-board-focus|Milestone Project Board Focus|Milestone Focus|Recommend a `Milestone Focus`' AGENTS.md
  ```

  Expected:

  ```text
  AGENTS.md:<line>:- `docs/superpowers/specs/2026-05-10-milestone-project-board-focus-design.md` defines the GitHub Project milestone focus field, active milestone view, global milestone overview, and milestone focus advancement convention.
  AGENTS.md:<line>:## Milestone Project Board Focus
  AGENTS.md:<line>:- The `dl-graph-studio Roadmap` GitHub Project must use a single-select Project field named `Milestone Focus` with values `Current`, `Next`, `Later`, and `Closed`.
  AGENTS.md:<line>:- Recommend a `Milestone Focus` value for each drafted roadmap issue: normally `Current` for active milestone work, `Next` for prepared next-milestone work, and `Later` for future milestone work.
  ```

- [ ] **Step 5: Commit `AGENTS.md` changes**

  Validate the commit message:

  ```bash
  pnpm validate:commit-message -- --message "docs: document milestone focus agent rules"
  ```

  Expected:

  ```text
  Commit message format is valid.
  ```

  Commit:

  ```bash
  git add AGENTS.md
  git commit -m "docs: document milestone focus agent rules"
  ```

## Task 2: Update The Human Roadmap Process

**Files:**

- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Add Project field setup**

  In `docs/roadmap/roadmap-process.md`, add this section after the label list in `## GitHub Setup`:

  ```md
  Create a single-select Project field named `Milestone Focus` with these values:

  - `Current`
  - `Next`
  - `Later`
  - `Closed`

  GitHub Milestones remain the canonical issue-level phase assignment. `Milestone Focus` controls which milestone appears in the daily Project board view.

  Create these saved Project views:

  - `Active Milestone`: board layout, filtered to `Milestone Focus:Current`, with columns grouped by `Status`.
  - `Milestone Overview`: global view showing all roadmap items with GitHub Milestone, `Milestone Focus`, `Status`, labels, and linked pull requests visible.
  ```

- [ ] **Step 2: Add issue focus assignment rule**

  In `docs/roadmap/roadmap-process.md`, add this bullet after:

  ```md
  - Keep issues small enough for a PR review of about 15-30 minutes.
  ```

  Add:

  ```md
  - Each roadmap issue added to the Project should have both a GitHub Milestone and a `Milestone Focus` value. Use `Current` for active milestone work, `Next` for the next planned milestone, `Later` for future milestone work, and `Closed` for completed milestone work after closeout is accepted.
  ```

- [ ] **Step 3: Extend product-owner idea intake**

  In `docs/roadmap/roadmap-process.md`, replace this list item:

  ```md
  3. If it is a standalone roadmap task, ask only the clarifying questions needed to define objective, scope, out-of-scope, acceptance criteria, verification, milestone, labels, and expected PR size.
  ```

  With:

  ```md
  3. If it is a standalone roadmap task, ask only the clarifying questions needed to define objective, scope, out-of-scope, acceptance criteria, verification, milestone, `Milestone Focus`, labels, and expected PR size.
  ```

  After this paragraph:

  ```md
  Intake confirmation can create or update the issue, mark it `Ready`, and set its priority, but it does not authorize implementation. Ideas become implementation work only when the product owner explicitly selects or confirms a ready issue for work under the Agent Cycle. Clear ideas should move toward `Ready`; unclear ideas should stay blocked by named decisions rather than relying on hidden assumptions.
  ```

  Add:

  ```md
  Intake should recommend a `Milestone Focus` value. Future-milestone ideas should usually receive `Later` unless the product owner explicitly promotes that milestone to `Next`.
  ```

- [ ] **Step 4: Add Milestone Project Board Focus section**

  In `docs/roadmap/roadmap-process.md`, add this section after `## Issue Rules` and before `## Product Owner Idea Intake`:

  ```md
  ## Milestone Project Board Focus

  The Project board should make the active milestone clear without requiring the product owner to inspect the separate Issues milestone page.

  Use `Milestone Focus` as operational Project metadata:

  - `Current`: issues in the milestone that should be visible in the daily board.
  - `Next`: issues in the next planned milestone.
  - `Later`: future milestone work that should remain out of the daily board.
  - `Closed`: completed milestone work that remains visible in the global view.

  The `Active Milestone` view is the default daily execution board. It filters to `Milestone Focus:Current` and keeps the existing `Status` columns.

  The `Milestone Overview` view is the planning and review view. It shows all roadmap items and should make GitHub Milestone and `Milestone Focus` visible so work can be compared across phases.

  `Milestone Focus` does not change readiness or task selection. An executable task still requires Project status `Ready`, the `ready` label, and product-owner confirmation.

  When every issue in the `Current` milestone is `Done`, the agent should check milestone closeout before changing focus:

  - the milestone UX/UI hardening issue is `Done` or explicitly skipped,
  - the milestone technical audit issue is `Done` or explicitly skipped,
  - no pull request for the milestone remains open in review,
  - no blocking follow-up issue must be completed before closing the milestone.

  If closeout is complete, the agent should propose moving the completed milestone from `Current` to `Closed` and the next milestone from `Next` to `Current`. After product-owner confirmation, the agent may update the Project field values if permissions and tooling allow.

  A focus transition updates board visibility only. It does not authorize implementation of the next roadmap issue.
  ```

- [ ] **Step 5: Review roadmap-process references**

  Run:

  ```bash
  rg -n "Milestone Project Board Focus|Milestone Focus|Active Milestone|Milestone Overview|milestone closeout" docs/roadmap/roadmap-process.md
  ```

  Expected: output includes the new setup, issue rules, intake, and focus-transition references.

- [ ] **Step 6: Commit roadmap process changes**

  Validate the commit message:

  ```bash
  pnpm validate:commit-message -- --message "docs: describe milestone focus roadmap views"
  ```

  Expected:

  ```text
  Commit message format is valid.
  ```

  Commit:

  ```bash
  git add docs/roadmap/roadmap-process.md
  git commit -m "docs: describe milestone focus roadmap views"
  ```

## Task 3: Verify Documentation And Live Project Configuration

**Files:**

- Verify: `AGENTS.md`
- Verify: `docs/roadmap/roadmap-process.md`
- External: `dl-graph-studio Roadmap` GitHub Project

- [ ] **Step 1: Run documentation formatting**

  Run:

  ```bash
  pnpm format:check
  ```

  Expected:

  ```text
  All matched files use Prettier code style!
  ```

- [ ] **Step 2: Verify no executable task rule changed**

  Run:

  ```bash
  rg -n 'Project status `Ready`|ready` label|Milestone Focus.*does not change|executable task' AGENTS.md docs/roadmap/roadmap-process.md
  ```

  Expected: output shows both the original `Ready` plus `ready` rule and the new statement that `Milestone Focus` does not change task selection.

- [ ] **Step 3: Configure the live Project field**

  In the `dl-graph-studio Roadmap` GitHub Project, create a single-select field:

  ```text
  Milestone Focus
  ```

  Add exactly these options:

  ```text
  Current
  Next
  Later
  Closed
  ```

  Expected: the Project table can show and edit `Milestone Focus` for roadmap items.

- [ ] **Step 4: Create the `Active Milestone` view**

  In the GitHub Project, create or update a saved view named:

  ```text
  Active Milestone
  ```

  Configure it as:

  ```text
  Layout: Board
  Filter: Milestone Focus:Current
  Columns/grouping: Status
  Visible fields/cards: Milestone, labels, linked pull requests, assignee when available
  ```

  Expected: the board shows only items with `Milestone Focus` set to `Current` and keeps the normal status columns.

- [ ] **Step 5: Create the `Milestone Overview` view**

  In the GitHub Project, create or update a saved view named:

  ```text
  Milestone Overview
  ```

  Configure it as:

  ```text
  Layout: Table or Board, whichever makes milestone comparison clearer in GitHub's current UI
  Filter: no milestone-focus filter
  Visible fields: Milestone, Milestone Focus, Status, labels, linked pull requests
  Group/sort: by Milestone and Milestone Focus when available
  ```

  Expected: the view shows active, next, later, and closed milestone work together without hiding completed milestones.

- [ ] **Step 6: Assign initial focus values**

  Set current Project items as follows unless the product owner gives different roadmap direction:

  ```text
  Current: all issues in the currently active milestone
  Next: prepared issues in the next planned milestone
  Later: future milestone issues
  Closed: issues in completed milestones
  ```

  Expected: `Active Milestone` becomes the daily board and no longer mixes cards from unrelated milestones.

- [ ] **Step 7: Validate final commit message and commit any remaining doc changes**

  If Task 3 required documentation corrections, validate:

  ```bash
  pnpm validate:commit-message -- --message "docs: verify milestone focus workflow"
  ```

  Expected:

  ```text
  Commit message format is valid.
  ```

  Commit only if files changed:

  ```bash
  git add AGENTS.md docs/roadmap/roadmap-process.md
  git commit -m "docs: verify milestone focus workflow"
  ```

  If no files changed, do not create an empty commit.

## Self-Review

- Spec coverage: Task 1 updates agent instructions; Task 2 updates the human roadmap process; Task 3 covers formatting and live GitHub Project manual verification.
- Completeness scan: every task names exact files, exact inserted text, commands,
  and expected results.
- Scope check: the plan does not add automation, does not change product code, and does not start next-milestone implementation.
- Rule consistency: the `Ready` plus `ready` executable task rule remains explicit and unchanged.
