# Product Owner Idea Intake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the product-owner idea intake convention in the repository's agent instructions and human roadmap process.

**Architecture:** This is a documentation-only workflow change. `AGENTS.md` becomes the operative instruction surface for agents, while `docs/roadmap/roadmap-process.md` becomes the human-readable reference for the same intake flow.

**Tech Stack:** Markdown documentation, existing roadmap issue template, existing `pnpm validate:roadmap-issue` command referenced by the workflow.

---

## File Structure

- Modify `AGENTS.md`: add the idea intake design spec to the source-of-truth list and add a `Product Owner Idea Intake` operating section after `Task Selection`.
- Modify `docs/roadmap/roadmap-process.md`: add a `Product Owner Idea Intake` section after `Issue Rules`, before milestone closeout sections.
- Reference `docs/superpowers/specs/2026-05-03-product-owner-idea-intake-design.md`: this approved spec is the implementation source of truth.

## Scope Check

The approved spec covers one subsystem: repository workflow documentation for idea intake. It does not require code changes, GitHub Actions, Project automation, or changes to issue/PR templates.

### Task 1: Update Agent Operating Instructions

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Add the idea intake spec to Source Of Truth**

In `AGENTS.md`, add this bullet after the existing milestone technical audit spec bullet:

```md
- `docs/superpowers/specs/2026-05-03-product-owner-idea-intake-design.md` defines the product-owner idea intake convention.
```

- [ ] **Step 2: Add the product-owner idea intake operating section**

In `AGENTS.md`, insert this section after the `Task Selection` section and before `Milestone UX/UI Hardening`:

```md
## Product Owner Idea Intake

- When the product owner proposes a new idea, treat it as idea intake by default, not as authorization to implement.
- The default goal of intake is to convert the idea into a roadmap issue that is ready to execute.
- Classify the idea before drafting work: UX/UI finding, technical audit finding, new roadmap task, or PRD-level idea.
- If the idea is a small UX/UI finding in the current milestone, record it in `[Roadmap]: Phase N UX/UI hardening` when it fits that issue's scope.
- If the idea is a milestone-local technical quality finding, record it in `[Roadmap]: Phase N technical audit` when it fits that issue's scope.
- If the idea is a new roadmap task, draft a roadmap issue using `.github/ISSUE_TEMPLATE/roadmap-task.md`.
- If the idea changes high-level product direction, treat it as a PRD or planning discussion before creating executable issues.
- Ask focused clarifying questions until the issue has objective, scope, out-of-scope, acceptance criteria, verification, milestone, labels, and an expected PR size that fits the normal 15-30 minute review window.
- If the idea is too large for one reviewable PR, propose a split and recommend the first issue to create.
- Before creating or updating a live roadmap issue outside GitHub's issue-template UI, run `pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>`.
- Ask the product owner to confirm issue creation, readiness, and priority before applying `ready`, adding the issue to the Project as ready, or starting implementation.
```

- [ ] **Step 3: Review for duplicate or conflicting instructions**

Run:

```bash
rg -n "Product Owner Idea Intake|idea intake|Do not start a new roadmap task|validate:roadmap-issue" AGENTS.md
```

Expected: the new section appears once, existing task-selection validation remains, and there is no instruction that allows implementation before product-owner confirmation.

- [ ] **Step 4: Commit the AGENTS.md change**

Run:

```bash
git add AGENTS.md
git commit -m "docs: add agent idea intake rules"
```

Expected: commit succeeds with only `AGENTS.md` staged.

### Task 2: Update Human Roadmap Process

**Files:**
- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Add the human-readable intake section**

In `docs/roadmap/roadmap-process.md`, insert this section after `Issue Rules` and before `Milestone Technical Audit`:

```md
## Product Owner Idea Intake

When the product owner proposes a new idea in conversation, treat it as intake for executable roadmap work unless it is clearly a PRD-level product direction discussion.

The default outcome is a roadmap issue that can enter `Ready` once the issue contract is clear. The agent should not start implementation during intake.

Use this intake sequence:

1. Classify the idea as a UX/UI finding, technical audit finding, new roadmap task, or PRD-level idea.
2. If it fits the current milestone hardening or technical audit issue, record it there with enough context to evaluate later.
3. If it is a standalone roadmap task, ask only the clarifying questions needed to define objective, scope, out-of-scope, acceptance criteria, verification, milestone, labels, and expected PR size.
4. If the idea is too large for one 15-30 minute reviewable PR, split it before issue creation and recommend the first issue to create.
5. Draft the issue using `.github/ISSUE_TEMPLATE/roadmap-task.md`.
6. Validate the draft before applying `ready` or adding it to the Project as ready:

   ```bash
   pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>
   ```

7. Ask the product owner to confirm issue creation, readiness, and priority.

Ideas do not become implementation work until the product owner confirms the issue. Clear ideas should move toward `Ready`; unclear ideas should stay blocked by named decisions rather than relying on hidden assumptions.
```

- [ ] **Step 2: Review section placement and terminology**

Run:

```bash
rg -n "Product Owner Idea Intake|Milestone Technical Audit|Milestone UX/UI Hardening|Agent Cycle|ready|Ready" docs/roadmap/roadmap-process.md
```

Expected: the new intake section appears once after issue rules, uses the same `Ready`/`ready` terminology as the rest of the document, and does not conflict with milestone closeout rules.

- [ ] **Step 3: Commit the roadmap process change**

Run:

```bash
git add docs/roadmap/roadmap-process.md
git commit -m "docs: document roadmap idea intake"
```

Expected: commit succeeds with only `docs/roadmap/roadmap-process.md` staged.

### Task 3: Verify Documentation Consistency

**Files:**
- Inspect: `AGENTS.md`
- Inspect: `docs/roadmap/roadmap-process.md`
- Inspect: `docs/superpowers/specs/2026-05-03-product-owner-idea-intake-design.md`

- [ ] **Step 1: Confirm all source-of-truth references exist**

Run:

```bash
rg -n "product-owner idea intake|Product Owner Idea Intake|2026-05-03-product-owner-idea-intake-design" AGENTS.md docs/roadmap/roadmap-process.md docs/superpowers/specs/2026-05-03-product-owner-idea-intake-design.md
```

Expected: matches appear in the approved spec, in the new `AGENTS.md` source-of-truth bullet and section, and in the new roadmap process section.

- [ ] **Step 2: Confirm no implementation automation was added**

Run:

```bash
rg --files .github
```

Expected: no new GitHub Actions workflow files are present as part of this plan.

- [ ] **Step 3: Confirm the working tree only contains intended commits**

Run:

```bash
git status --short --branch
git log --oneline -3
```

Expected: working tree is clean; latest commits include the design spec commit and the two documentation implementation commits.

- [ ] **Step 4: Prepare manual verification notes**

Use this manual verification summary in the PR or handoff:

```md
Manual verification:

- Reviewed `AGENTS.md` and confirmed product-owner ideas are now treated as intake, not implementation authorization.
- Reviewed `docs/roadmap/roadmap-process.md` and confirmed the human roadmap process describes the same intake sequence.
- Confirmed both documents preserve product-owner confirmation before issue readiness or implementation.
- Confirmed the initial version does not add GitHub Actions or Project automation.
```
