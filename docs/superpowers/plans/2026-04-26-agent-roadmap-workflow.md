# Agent Roadmap Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the approved agent roadmap workflow in repository files so future agent sessions, issues, and pull requests follow the same process.

**Architecture:** This is a documentation and process setup. `AGENTS.md` defines the operating contract for agents, GitHub templates enforce issue and PR structure, and `docs/roadmap/roadmap-process.md` gives the human-readable process reference. No application runtime code is introduced.

**Tech Stack:** Markdown, GitHub Issues, GitHub Projects, GitHub Pull Requests, Git.

---

## File Structure

- Create `AGENTS.md`
  - Repository-level instructions for coding agents.
  - Defines source-of-truth hierarchy, issue selection, branch naming, scope control, verification, and PR expectations.
- Create `.github/ISSUE_TEMPLATE/roadmap-task.md`
  - Markdown issue template for roadmap tasks.
  - Encodes objective, scope, out-of-scope, acceptance criteria, verification, and notes.
- Create `.github/pull_request_template.md`
  - Pull request template aligned with the Definition of Done.
  - Requires summary, linked issue, verification, UI evidence when relevant, and reviewer notes.
- Create `docs/roadmap/roadmap-process.md`
  - Human-readable workflow guide.
  - Defines milestones, project states, labels, cycle, first executable roadmap, and later automation path.
- Modify `README.md`
  - Add links to the workflow spec and roadmap process document so the process is discoverable from the repo entry point.

## Task 1: Add Agent Operating Rules

**Files:**
- Create: `AGENTS.md`

- [ ] **Step 1: Create `AGENTS.md`**

Create `AGENTS.md` with this exact content:

```md
# AGENTS.md

## Purpose

This repository uses an agent-assisted roadmap workflow. Agents must work from explicit GitHub issues, keep pull requests small, and preserve product-owner control over task selection and merge decisions.

## Source Of Truth

- `PRD.md` is the high-level product source of truth.
- `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md` is the workflow design source of truth.
- GitHub Issues and the GitHub Project are the operational source of truth for executable roadmap work.
- Pull requests are delivery and review artifacts, not planning documents.

## Task Selection

- Do not start a new roadmap task without product-owner confirmation.
- When asked for the next task, inspect the GitHub Project and propose one issue with the `ready` label.
- Explain why the proposed issue is the best next task.
- If multiple issues are plausible, present the tradeoff and recommend one.
- Do not implement an issue that lacks objective, scope, acceptance criteria, and verification details.

## Branches

- Use `codex/<issue-number>-<short-name>` for agent-created branches.
- Keep one issue per branch by default.
- Group multiple issues in one branch only when the issues explicitly allow grouping before work starts.

## Scope Control

- Implement only the issue scope.
- Treat the issue's `Out of scope` section as binding.
- Do not include unrelated refactors, dependency changes, or formatting churn.
- If implementation reveals missing scope, stop and ask for clarification or update the issue before continuing.

## Verification

- Run the verification listed in the issue.
- Run relevant automated tests when tests exist.
- For UI changes, capture screenshots or a short video/GIF for the PR.
- Document manual verification steps in the PR.
- If a requested verification cannot be run, state why in the PR.

## Pull Requests

- Link the issue with `Closes #<issue-number>`.
- Fill in the repository pull request template.
- Explain what changed and how to verify it.
- Keep PRs reviewable in about 15-30 minutes.
- Iterate in the same PR when review requests changes.
- Do not start the next roadmap issue until the product owner confirms continuing.

## Definition Of Done

A PR is ready for review when:

- It addresses exactly one roadmap issue, unless the issue explicitly allows grouping.
- The PR description explains what changed and how to verify it.
- Acceptance criteria from the issue are satisfied or explicitly explained.
- Automated tests pass where tests exist.
- New behavior has suitable test coverage when practical.
- UI changes include screenshots or a short video/GIF.
- Manual verification steps have been run and documented.
- No unrelated refactors or scope creep are included.
- Documentation is updated when behavior, architecture, or workflow changes.
```

- [ ] **Step 2: Verify `AGENTS.md` contains the core constraints**

Run:

```bash
rg -n "Do not start a new roadmap task|codex/<issue-number>-<short-name>|Definition Of Done|Closes #<issue-number>" AGENTS.md
```

Expected output includes four matching lines.

- [ ] **Step 3: Commit Task 1**

Run:

```bash
git add AGENTS.md
git commit -m "docs: add agent operating rules"
```

Expected: commit succeeds with `AGENTS.md` created.

## Task 2: Add Roadmap Issue Template

**Files:**
- Create: `.github/ISSUE_TEMPLATE/roadmap-task.md`

- [ ] **Step 1: Create the issue template directory**

Run:

```bash
mkdir -p .github/ISSUE_TEMPLATE
```

Expected: command exits successfully.

- [ ] **Step 2: Create `.github/ISSUE_TEMPLATE/roadmap-task.md`**

Create `.github/ISSUE_TEMPLATE/roadmap-task.md` with this exact content:

```md
---
name: Roadmap task
about: Define a small, reviewable unit of roadmap work
title: "[Roadmap]: "
labels: ""
assignees: ""
---

## Objective

Describe the user or product outcome this issue delivers.

## Scope

- Include the specific behavior, documentation, or workflow change required by this issue.

## Out of scope

- List work that must not be included in this PR.

## Acceptance criteria

- [ ] The expected behavior is observable or reviewable.
- [ ] The implementation stays within the issue scope.
- [ ] The reviewer can verify the result using the steps below.

## Verification

Automated:

- [ ] List the exact automated command to run, or mark as not applicable with a reason.

Manual:

- [ ] List the manual review steps required for this issue.

## Notes

Add links, dependencies, implementation constraints, or design decisions that affect this task.
```

- [ ] **Step 3: Verify required sections exist**

Run:

```bash
rg -n "## Objective|## Scope|## Out of scope|## Acceptance criteria|## Verification|## Notes" .github/ISSUE_TEMPLATE/roadmap-task.md
```

Expected output includes six matching section headings.

- [ ] **Step 4: Commit Task 2**

Run:

```bash
git add .github/ISSUE_TEMPLATE/roadmap-task.md
git commit -m "docs: add roadmap issue template"
```

Expected: commit succeeds with the issue template created.

## Task 3: Add Pull Request Template

**Files:**
- Create: `.github/pull_request_template.md`

- [ ] **Step 1: Create `.github/pull_request_template.md`**

Create `.github/pull_request_template.md` with this exact content:

```md
## Summary

- Describe what changed.

## Linked issue

Closes #

## Verification

Automated:

- [ ] List each command run and its result.

Manual:

- [ ] List each manual verification step and its result.

## Screenshots / video

Required for UI changes. Add screenshots, a short video/GIF, or write `Not applicable` with a reason.

## Definition of Done

- [ ] This PR addresses exactly one roadmap issue, unless the issue explicitly allows grouping.
- [ ] The PR description explains what changed and how to verify it.
- [ ] Acceptance criteria from the issue are satisfied or explicitly explained.
- [ ] Automated tests pass where tests exist.
- [ ] New behavior has suitable test coverage when practical.
- [ ] UI changes include screenshots or a short video/GIF.
- [ ] Manual verification steps have been run and documented.
- [ ] No unrelated refactors or scope creep are included.
- [ ] Documentation is updated when behavior, architecture, or workflow changes.

## Notes

Add known limitations, follow-ups, or review focus.
```

- [ ] **Step 2: Verify PR template contains review gates**

Run:

```bash
rg -n "Closes #|Definition of Done|Screenshots / video|No unrelated refactors" .github/pull_request_template.md
```

Expected output includes four matching lines.

- [ ] **Step 3: Commit Task 3**

Run:

```bash
git add .github/pull_request_template.md
git commit -m "docs: add pull request template"
```

Expected: commit succeeds with the PR template created.

## Task 4: Add Human Roadmap Process Guide

**Files:**
- Create: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Create the roadmap docs directory**

Run:

```bash
mkdir -p docs/roadmap
```

Expected: command exits successfully.

- [ ] **Step 2: Create `docs/roadmap/roadmap-process.md`**

Create `docs/roadmap/roadmap-process.md` with this exact content:

```md
# Roadmap Process

## Purpose

This process turns the product roadmap into small GitHub issues that an AI coding agent can implement through reviewable pull requests.

`PRD.md` remains the product source of truth. GitHub Issues and the GitHub Project are the operational source of truth for executable work.

## GitHub Setup

Create these milestones:

- `Phase 1 - Core architecture editor`
- `Phase 2 - Reusable component system`
- `Phase 3 - Basic local execution`
- `Phase 4 - Practical architecture depth`
- `Phase 5 - Post-MVP extensions`

Create a GitHub Project with these statuses:

- `Backlog`
- `Ready`
- `In Progress`
- `In Review`
- `Needs Iteration`
- `Done`

Create these labels:

- `product`
- `ux`
- `frontend`
- `runtime`
- `validation`
- `persistence`
- `infra`
- `docs`
- `blocked`
- `ready`

## Issue Rules

- One issue should map to one branch and one pull request by default.
- A PR can close multiple issues only when the issues explicitly allow grouping before work starts.
- An issue enters `Ready` only when objective, scope, out-of-scope, acceptance criteria, and verification are clear.
- Keep issues small enough for a PR review of about 15-30 minutes.

## Agent Cycle

1. The product owner asks for the next task.
2. The agent reviews the GitHub Project.
3. The agent proposes one issue with the `ready` label and explains the recommendation.
4. The product owner confirms the issue or selects another one.
5. The agent creates a branch named `codex/<issue-number>-<short-name>`.
6. The agent implements only the issue scope.
7. The agent runs the required verification.
8. The agent opens a PR linked with `Closes #<issue-number>`.
9. The product owner reviews the result.
10. If changes are needed, the PR moves to `Needs Iteration` and the agent updates the same PR.
11. When accepted and merged, the issue moves to `Done`.
12. The next issue starts only after product-owner confirmation.

## First Executable Roadmap

Start with enough Phase 1 issues for roughly 2-4 weeks of work:

1. Decide and document the initial technical stack.
2. Create an executable app shell.
3. Create a basic canvas.
4. Render static primitive nodes.
5. Select a node and open the inspector.
6. Edit basic node parameters.
7. Connect nodes.
8. Validate basic invalid connections.
9. Save and load a minimal project.
10. Create the first composite node representation.

Do not start PyTorch execution or training until the graph representation is minimal, stable, and persistible.

## Later Automation

After 5-10 real PRs use this process, consider automating repeated checks:

- Move issues between project states automatically.
- Validate that each PR links a roadmap issue.
- Require completed PR checklist items.
- Require CI checks before merge.
- Generate issues from roadmap planning documents.
- Add a standard command for asking the agent to propose the next task.
```

- [ ] **Step 3: Verify roadmap process covers setup and cycle**

Run:

```bash
rg -n "GitHub Setup|Agent Cycle|First Executable Roadmap|Later Automation|Phase 1 - Core architecture editor" docs/roadmap/roadmap-process.md
```

Expected output includes five matching lines.

- [ ] **Step 4: Commit Task 4**

Run:

```bash
git add docs/roadmap/roadmap-process.md
git commit -m "docs: add roadmap process guide"
```

Expected: commit succeeds with the roadmap guide created.

## Task 5: Link Workflow Documents From README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md` with the updated entry point**

Replace the current `README.md` content with:

```md
# dl-graph-studio

A local-first desktop application for visually prototyping, composing, and training deep learning architectures through hierarchical neural graphs.

## Product Definition

See [PRD.md](PRD.md) for the official product requirements document.

## Roadmap Workflow

- [Agent roadmap workflow design](docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md)
- [Roadmap process](docs/roadmap/roadmap-process.md)
```

- [ ] **Step 2: Verify README links resolve to tracked files**

Run:

```bash
test -f PRD.md
test -f docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md
test -f docs/roadmap/roadmap-process.md
rg -n "Agent roadmap workflow design|Roadmap process" README.md
```

Expected: all `test -f` commands exit successfully and `rg` prints two matching lines.

- [ ] **Step 3: Commit Task 5**

Run:

```bash
git add README.md
git commit -m "docs: link roadmap workflow from readme"
```

Expected: commit succeeds with the README updated.

## Task 6: Final Workflow Verification

**Files:**
- Verify: `AGENTS.md`
- Verify: `.github/ISSUE_TEMPLATE/roadmap-task.md`
- Verify: `.github/pull_request_template.md`
- Verify: `docs/roadmap/roadmap-process.md`
- Verify: `README.md`

- [ ] **Step 1: Verify all required files exist**

Run:

```bash
test -f AGENTS.md
test -f .github/ISSUE_TEMPLATE/roadmap-task.md
test -f .github/pull_request_template.md
test -f docs/roadmap/roadmap-process.md
test -f docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md
test -f README.md
```

Expected: all commands exit successfully.

- [ ] **Step 2: Scan for unfinished markers**

Run:

```bash
rg -n "PLACEHOLDER|UNFINISHED|REPLACE_ME" AGENTS.md .github docs README.md
```

Expected: no matches and exit code `1`.

- [ ] **Step 3: Verify the Definition of Done is encoded**

Run:

```bash
rg -n "Definition Of Done|Definition of Done|No unrelated refactors|Manual verification" AGENTS.md .github/pull_request_template.md docs/roadmap/roadmap-process.md
```

Expected: output includes matches from `AGENTS.md` and `.github/pull_request_template.md`.

- [ ] **Step 4: Verify git is clean**

Run:

```bash
git status --short
```

Expected: no output.

## Self-Review

- Spec coverage: The plan implements all repository artifacts requested by the approved spec: `AGENTS.md`, issue template, PR template, roadmap process guide, and README discoverability.
- Scope control: The plan does not add CI, issue automation, GitHub Actions, or application runtime code because the spec defers automation until after 5-10 real PRs.
- Unfinished-marker scan: The plan avoids incomplete work markers and includes a final `rg` scan for common replacement markers.
- Type and naming consistency: Branch pattern, labels, statuses, milestones, issue structure, PR structure, and Definition of Done match the approved spec.
