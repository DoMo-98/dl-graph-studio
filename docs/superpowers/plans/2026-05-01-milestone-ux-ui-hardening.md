# Milestone UX/UI Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the approved milestone UX/UI hardening convention into the repository roadmap process and agent operating rules.

**Architecture:** This is a documentation and process update. The approved design spec remains the detailed source for the convention, while `docs/roadmap/roadmap-process.md` explains the human workflow and `AGENTS.md` gives agents the operating rule. Existing generic issue and pull request templates already support this task shape, so no new template is required.

**Tech Stack:** Markdown documentation, Git roadmap workflow, existing repository process files.

---

## File Structure

- Modify `AGENTS.md`
  - Add the approved UX/UI hardening spec as a process source of truth.
  - Add a short milestone closeout rule so future agents know to propose hardening as the final milestone issue when appropriate.
- Modify `docs/roadmap/roadmap-process.md`
  - Add a `Milestone UX/UI Hardening` section with issue naming, labels, scope, out-of-scope, acceptance criteria, and verification guidance.
  - Add the Phase 1 hardening issue to the first executable roadmap list.
- Modify `README.md`
  - Link the new hardening design spec so the process decision is discoverable from the repository entry point.

No changes are planned for `.github/ISSUE_TEMPLATE/roadmap-task.md` or `.github/pull_request_template.md` because the current templates already require scope, out-of-scope, acceptance criteria, verification, and UI evidence.

## Task 1: Add Agent Rule For Milestone Hardening

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Read the current agent operating rules**

Run:

```bash
sed -n '1,180p' AGENTS.md
```

Expected: output includes `Source Of Truth`, `Task Selection`, `Scope Control`, and `Verification` sections.

- [ ] **Step 2: Update `AGENTS.md`**

Add this source-of-truth bullet after the existing workflow design spec bullet:

```md
- `docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md` defines the milestone UX/UI hardening convention.
```

Add this section after `Task Selection`:

```md
## Milestone UX/UI Hardening

- Treat `Phase N UX/UI hardening` as the default final issue for each product milestone, especially Phase 1 and Phase 2.
- The hardening issue may include small UX/UI corrections only when they stay within the issue scope.
- Do not use hardening issues for new product capabilities, large redesigns, broad refactors, dependency changes, or future milestone behavior.
- If hardening reveals larger UX or product problems, create follow-up roadmap issues instead of bundling them into the hardening PR.
```

- [ ] **Step 3: Verify the agent rule is present**

Run:

```bash
rg -n "milestone UX/UI hardening|Phase N UX/UI hardening|larger UX or product problems" AGENTS.md
```

Expected: output shows the new source-of-truth bullet and milestone hardening rules.

- [ ] **Step 4: Commit the agent rule**

Run:

```bash
git add AGENTS.md
git commit -m "docs: add milestone hardening agent rule"
```

Expected: commit succeeds with only `AGENTS.md` changed.

## Task 2: Update Roadmap Process

**Files:**
- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Read the current roadmap process**

Run:

```bash
sed -n '1,140p' docs/roadmap/roadmap-process.md
```

Expected: output includes `Issue Rules`, `Agent Cycle`, and `First Executable Roadmap`.

- [ ] **Step 2: Add milestone hardening process section**

Add this section after `Issue Rules`:

```md
## Milestone UX/UI Hardening

Each product milestone should end with one roadmap issue named `Phase N UX/UI hardening` unless the product owner explicitly decides to skip it.

Use this issue as a milestone closeout pass, not as a redesign bucket. It may include small UX/UI corrections across the milestone flow:

- spacing, sizing, alignment, and layout consistency,
- visual hierarchy and density,
- label, empty-state, and validation-message clarity,
- selection, disabled-state, invalid-action, and transition feedback,
- consistency between canvas, inspector, toolbar, navigation, and validation surfaces,
- layout stability across supported viewport sizes.

Use `ux`, `frontend`, and `ready` labels when the issue is ready for selection.

The hardening issue must not include new product capabilities, large redesigns, broad refactors, dependency changes, or future milestone behavior. Larger UX or product findings should become follow-up roadmap issues.

Default acceptance criteria:

- [ ] The primary milestone flow has been reviewed end-to-end.
- [ ] Small UX/UI inconsistencies found during review have been fixed or explicitly deferred.
- [ ] Larger issues discovered during review have follow-up issues instead of being bundled into the hardening PR.
- [ ] The PR includes screenshots or a short recording for the reviewed flow.
- [ ] Manual verification describes the flow that was tested.
- [ ] No new product capabilities were added.
```

- [ ] **Step 3: Add Phase 1 hardening to the first executable roadmap**

Change the final item in `First Executable Roadmap` from:

```md
10. Create the first composite node representation.
```

to:

```md
10. Create the first composite node representation.
11. Phase 1 UX/UI hardening.
```

- [ ] **Step 4: Verify roadmap process includes the convention**

Run:

```bash
rg -n "Milestone UX/UI Hardening|Phase N UX/UI hardening|Phase 1 UX/UI hardening|No new product capabilities" docs/roadmap/roadmap-process.md
```

Expected: output shows the new section and Phase 1 roadmap item.

- [ ] **Step 5: Commit the roadmap process update**

Run:

```bash
git add docs/roadmap/roadmap-process.md
git commit -m "docs: add milestone hardening roadmap step"
```

Expected: commit succeeds with only `docs/roadmap/roadmap-process.md` changed.

## Task 3: Link The Hardening Spec From README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read the documentation links section**

Run:

```bash
sed -n '1,90p' README.md
```

Expected: output includes links to the agent roadmap workflow design and roadmap process.

- [ ] **Step 2: Add the hardening design link**

Add this bullet beside the existing workflow documentation links:

```md
- [Milestone UX/UI hardening design](docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md)
```

- [ ] **Step 3: Verify README link is present**

Run:

```bash
rg -n "Milestone UX/UI hardening design" README.md
```

Expected: output shows the new link.

- [ ] **Step 4: Commit the README update**

Run:

```bash
git add README.md
git commit -m "docs: link milestone hardening design"
```

Expected: commit succeeds with only `README.md` changed.

## Task 4: Final Verification

**Files:**
- Verify: `AGENTS.md`
- Verify: `docs/roadmap/roadmap-process.md`
- Verify: `README.md`
- Verify: `docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md`

- [ ] **Step 1: Check all expected references exist**

Run:

```bash
test -f docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md
test -f docs/roadmap/roadmap-process.md
rg -n "2026-05-01-milestone-ux-ui-hardening-design|Milestone UX/UI Hardening|Phase 1 UX/UI hardening" AGENTS.md docs/roadmap/roadmap-process.md README.md
```

Expected: both `test` commands exit successfully and `rg` shows matching lines in all three operational documentation files.

- [ ] **Step 2: Scan for placeholders**

Run:

```bash
rg -n "T[B]D|T[O]DO|PLACE[H]OLDER|UNFINIS[H]ED|REPLACE_[M]E" AGENTS.md docs/roadmap/roadmap-process.md README.md docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md
```

Expected: no output.

- [ ] **Step 3: Confirm working tree state**

Run:

```bash
git status --short
```

Expected: no output after all commits.

## Self-Review

- Spec coverage: The plan encodes the hardening convention in agent rules, the human roadmap process, and README discoverability. It preserves the existing issue and PR templates because they already support hardening issues without adding a special template.
- Scope control: The plan does not add runtime behavior, dependencies, automation, or product features.
- Placeholder scan: The plan avoids unresolved marker words and uses escaped search patterns in verification commands.
- Consistency: Naming uses `Phase N UX/UI hardening` for the general convention and `Phase 1 UX/UI hardening` for the first roadmap.
