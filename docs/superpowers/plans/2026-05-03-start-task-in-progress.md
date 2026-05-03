# Start Task In Progress Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Document that a confirmed roadmap issue moves to `In Progress` immediately after the agent creates the local task branch.

**Architecture:** This is a documentation-only workflow change. The repository keeps the design in `docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md`, then encodes the operating rule in `AGENTS.md`, the human workflow reference, and the original roadmap workflow design.

**Tech Stack:** Markdown, Git, `rg`, `pnpm format:check`.

---

## File Structure

- Modify `AGENTS.md`
  - Add the new start-task design spec to the source-of-truth list.
  - Add the operational rule that branch creation triggers an attempted GitHub Project move to `In Progress`.
  - Add the manual fallback when the Project update cannot be performed.
- Modify `docs/roadmap/roadmap-process.md`
  - Update the `Agent Cycle` so `In Progress` happens after branch creation, not directly at owner confirmation.
  - Document the fallback for missing permissions, missing tooling, unresolved Project metadata, or GitHub unavailability.
- Modify `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md`
  - Update the original `Execution Cycle` to match the approved timing and fallback.
- Existing design input:
  - `docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md`

## Scope Boundaries

- Do not add GitHub Actions, scripts, dependencies, issue template changes, PR template changes, or Project automation.
- Do not change product behavior or application code.
- Do not move issues to `In Progress` during idea intake, design brainstorming, implementation planning, or next-task proposal.

### Task 1: Update Agent Operating Rules

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Verify the current file does not yet encode the branch-created trigger**

Run:

```bash
rg -n "start-task-in-progress|branch creation|before implementation edits|Project mismatch|confirmed issue from `Ready` to `In Progress`" AGENTS.md
```

Expected: no output.

- [ ] **Step 2: Add the new design spec to `Source Of Truth`**

In `AGENTS.md`, add this bullet after the product-owner idea intake design bullet:

```md
- `docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md` defines when a confirmed local task moves to `In Progress`.
```

- [ ] **Step 3: Add the startup transition rule to `Task Selection`**

In `AGENTS.md`, add these bullets after the existing bullet that starts with `Before creating or updating a live roadmap issue`:

```md
- After the product owner confirms a ready issue and the agent creates the local branch `codex/<issue-number>-<short-name>`, immediately attempt to move the confirmed issue from `Ready` to `In Progress` in the `dl-graph-studio Roadmap` GitHub Project before making implementation edits.
- If the GitHub Project update cannot be performed because of permissions, missing tooling, unresolved Project metadata, or GitHub availability, report the limitation and request the manual move of issue `#<issue-number>` to `In Progress`, or get explicit product-owner approval to continue despite the temporary Project mismatch.
```

- [ ] **Step 4: Verify the new operating rule appears exactly once in `AGENTS.md`**

Run:

```bash
rg -n "start-task-in-progress|local branch `codex/<issue-number>-<short-name>`|temporary Project mismatch" AGENTS.md
```

Expected output includes:

```text
docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md
local branch `codex/<issue-number>-<short-name>`
temporary Project mismatch
```

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add AGENTS.md
git commit -m "docs: document task startup project transition"
```

Expected: commit succeeds with only `AGENTS.md` changed.

### Task 2: Update Human Roadmap Process

**Files:**
- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Verify the current Agent Cycle still moves to `In Progress` at confirmation time**

Run:

```bash
rg -n "confirms the issue or selects another one, and the issue moves from `Ready` to `In Progress`" docs/roadmap/roadmap-process.md
```

Expected output includes the current Agent Cycle step.

- [ ] **Step 2: Replace the `Agent Cycle` list**

In `docs/roadmap/roadmap-process.md`, replace the numbered list under `## Agent Cycle` with this exact list:

```md
1. The product owner asks for the next task.
2. The agent reviews the GitHub Project.
3. The agent proposes one issue with the `ready` label and explains the recommendation.
4. The product owner confirms the issue or selects another one.
5. The agent creates a branch named `codex/<issue-number>-<short-name>`.
6. Immediately after branch creation, before implementation edits, the agent attempts to move the confirmed issue from `Ready` to `In Progress` in the GitHub Project.
7. If the Project update cannot be performed because of permissions, missing tooling, unresolved Project metadata, or GitHub availability, the agent reports the limitation and requests the manual move of issue `#<issue-number>` to `In Progress`, or gets explicit product-owner approval to continue despite the temporary Project mismatch.
8. The agent implements only the issue scope.
9. The agent runs the required verification.
10. The agent opens a PR linked with `Closes #<issue-number>`, and the issue moves to `In Review`.
11. The product owner reviews the result.
12. If changes are needed, the issue moves to `Needs Iteration` and the agent updates the same PR.
13. When the update is ready for review, the issue moves back to `In Review`.
14. When accepted and merged, the issue moves to `Done`.
15. The next issue starts only after product-owner confirmation.
```

- [ ] **Step 3: Verify the old timing is gone and the new timing is present**

Run:

```bash
rg -n "confirms the issue or selects another one, and the issue moves|Immediately after branch creation|temporary Project mismatch" docs/roadmap/roadmap-process.md
```

Expected:

```text
Immediately after branch creation
temporary Project mismatch
```

Expected not present:

```text
confirms the issue or selects another one, and the issue moves
```

- [ ] **Step 4: Commit Task 2**

Run:

```bash
git add docs/roadmap/roadmap-process.md
git commit -m "docs: align roadmap process in progress timing"
```

Expected: commit succeeds with only `docs/roadmap/roadmap-process.md` changed.

### Task 3: Update Original Workflow Design

**Files:**
- Modify: `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md`

- [ ] **Step 1: Verify the current Execution Cycle lacks the new explicit fallback**

Run:

```bash
rg -n "Immediately after branch creation|temporary Project mismatch|manual move of issue" docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md
```

Expected: no output.

- [ ] **Step 2: Replace the `Execution Cycle` list**

In `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md`, replace the numbered list under `## Execution Cycle` with this exact list:

```md
1. The product owner asks for the next task.
2. The agent reviews the GitHub Project.
3. The agent proposes one `ready` issue and explains why it is the best next task.
4. The product owner confirms or selects a different issue.
5. The agent creates a branch named `codex/<issue-number>-<short-name>`.
6. Immediately after branch creation, before implementation edits, the agent attempts to move the confirmed issue from `Ready` to `In Progress` in the GitHub Project.
7. If the Project update cannot be performed because of permissions, missing tooling, unresolved Project metadata, or GitHub availability, the agent reports the limitation and requests the manual move of issue `#<issue-number>` to `In Progress`, or gets explicit product-owner approval to continue despite the temporary Project mismatch.
8. The agent implements only the issue scope.
9. The agent runs the required verification.
10. The agent opens a PR linked to the issue with `Closes #<issue-number>`, and the issue moves to `In Review`.
11. The product owner reviews product behavior, UX, and functionality.
12. If changes are needed, the issue or PR moves to `Needs Iteration`.
13. The agent iterates in the same PR.
14. Once accepted, the PR is merged and the issue moves to `Done`.
15. The agent proposes the next ready issue only after being asked or after the owner confirms continuing.
```

- [ ] **Step 3: Update the open decision about Project transitions**

In `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md`, replace this open decision:

```md
- Whether project state transitions will be manual at first or assisted by the GitHub connector.
```

with:

```md
- Which exact command or connector workflow agents should prefer when updating GitHub Project status fields.
```

- [ ] **Step 4: Verify the original design is no longer ambiguous about timing**

Run:

```bash
rg -n "Immediately after branch creation|temporary Project mismatch|Which exact command or connector workflow" docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md
```

Expected output includes all three phrases.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md
git commit -m "docs: clarify roadmap in progress transition"
```

Expected: commit succeeds with only `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md` changed.

### Task 4: Final Verification

**Files:**
- Verify: `AGENTS.md`
- Verify: `docs/roadmap/roadmap-process.md`
- Verify: `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md`
- Verify: `docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md`

- [ ] **Step 1: Check cross-document terminology**

Run:

```bash
rg -n "Immediately after branch creation|temporary Project mismatch|before implementation edits|start-task-in-progress-design" AGENTS.md docs/roadmap/roadmap-process.md docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md
```

Expected:

```text
AGENTS.md includes start-task-in-progress-design and temporary Project mismatch.
docs/roadmap/roadmap-process.md includes Immediately after branch creation and before implementation edits.
docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md includes Immediately after branch creation and temporary Project mismatch.
docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md includes the same timing and fallback language.
```

- [ ] **Step 2: Confirm the old confirmation-time transition does not remain**

Run:

```bash
rg -n "confirms.*moves from `Ready` to `In Progress`|confirmation.*moves from `Ready` to `In Progress`" AGENTS.md docs/roadmap/roadmap-process.md docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md
```

Expected: no output.

- [ ] **Step 3: Run repository formatting check**

Run:

```bash
pnpm format:check
```

Expected: command exits `0`. If it reports Markdown formatting changes are needed, run `pnpm exec prettier --write AGENTS.md docs/roadmap/roadmap-process.md docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md docs/superpowers/plans/2026-05-03-start-task-in-progress.md`, then rerun `pnpm format:check`.

- [ ] **Step 4: Inspect final git state**

Run:

```bash
git status --short --branch
git log --oneline -4
```

Expected:

```text
The worktree is clean.
The latest commits include:
docs: clarify roadmap in progress transition
docs: align roadmap process in progress timing
docs: document task startup project transition
docs: plan task in progress transition
```
