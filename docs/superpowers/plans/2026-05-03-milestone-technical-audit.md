# Milestone Technical Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encode the approved milestone technical audit convention into the repository roadmap process and agent operating rules.

**Architecture:** This is a documentation-only process change. The design spec is already committed at `docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md`; implementation makes that convention discoverable and operational from `AGENTS.md`, `docs/roadmap/roadmap-process.md`, and `README.md`.

**Tech Stack:** Markdown documentation, Git roadmap workflow, `rg` verification, git commits.

---

## File Structure

- Modify `AGENTS.md`: add the technical audit spec to source-of-truth rules and add a milestone technical audit section near UX/UI hardening.
- Modify `docs/roadmap/roadmap-process.md`: add the technical audit closeout convention, including subagent ownership, scope, out-of-scope, acceptance criteria, and Phase 1 ordering.
- Modify `README.md`: add a discoverability link to the approved technical audit design.
- No changes to `.github/ISSUE_TEMPLATE/roadmap-task.md`: the existing roadmap task template already supports this audit through objective, scope, out-of-scope, acceptance criteria, and verification.
- No changes to `.github/pull_request_template.md`: the existing PR template already supports verification, follow-ups, scope control, and docs updates.

---

### Task 1: Add Agent Operating Rules

**Files:**

- Modify: `AGENTS.md`

- [ ] **Step 1: Update the source-of-truth list**

Edit `AGENTS.md` and add this bullet immediately after the existing milestone UX/UI hardening spec bullet:

```md
- `docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md` defines the milestone technical audit convention.
```

- [ ] **Step 2: Add milestone technical audit rules**

Edit `AGENTS.md` and insert this section immediately after `## Milestone UX/UI Hardening`:

```md
## Milestone Technical Audit

- Treat `[Roadmap]: Phase N technical audit` as the default penultimate issue for each product milestone, followed by `[Roadmap]: Phase N UX/UI hardening` as the final issue, unless the product owner explicitly decides to skip or reorder either closeout task.
- Use the technical audit issue as a corrective closeout pass for architecture boundaries, clean code, maintainability, library usage, test coverage, and milestone-local technical debt.
- Split technical audit work across subagents with one responsibility each, such as architecture boundaries, clean-code maintainability, library use, test coverage, and performance/rendering only when applicable.
- Do not let one subagent own multiple unrelated audit domains. Cross-domain findings should be reported to the lead agent and routed to the correct owner.
- The technical audit issue may include bounded corrective changes directly tied to audit findings.
- Do not use technical audit issues for new product capabilities, future milestone behavior, broad rewrites, speculative abstractions, dependency changes without a concrete finding, or formatting churn.
- If the audit reveals larger architecture, dependency, testing, or maintainability work, create follow-up roadmap issues instead of bundling that work into the audit PR.
```

- [ ] **Step 3: Verify AGENTS rules are discoverable**

Run:

```sh
rg -n -F -e "milestone technical audit" -e "[Roadmap]: Phase N technical audit" -e "single responsibility" -e "technical audit issues" AGENTS.md
```

Expected: output includes the new source-of-truth bullet and the milestone technical audit rules.

- [ ] **Step 4: Commit**

Run:

```sh
git add AGENTS.md
git commit -m "docs: add technical audit agent rules"
```

Expected: git creates a commit containing only `AGENTS.md`.

---

### Task 2: Add Roadmap Closeout Process

**Files:**

- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Add the closeout section**

Edit `docs/roadmap/roadmap-process.md` and insert this section immediately before `## Milestone UX/UI Hardening`:

```md
## Milestone Technical Audit

Each product milestone should include one roadmap issue named `[Roadmap]: Phase N technical audit` unless the product owner explicitly decides to skip it. This issue should usually run before `[Roadmap]: Phase N UX/UI hardening`.

Use this issue as a corrective milestone closeout pass for technical quality, not as an unbounded cleanup bucket. It may include bounded corrections across the milestone implementation:

- architecture boundaries, ownership, data flow, coupling, domain models, and adapter layers,
- clean-code maintainability, naming, duplication, complexity, local API clarity, and dead code,
- library usage, including places where the code reinvents solved problems instead of using robust existing tools,
- test coverage gaps for milestone behavior,
- performance or rendering concerns when the milestone includes behavior where those costs are meaningful,
- documentation corrections when actual architecture or workflow differs from the documented design.

Use `infra` and `ready` labels when the issue is ready for selection. Add domain labels such as `frontend`, `runtime`, `validation`, `persistence`, or `docs` when the milestone work makes them relevant.

The technical audit should be coordinated by one lead agent and split across subagents with one responsibility each. Recommended subagent domains are:

- `architecture-boundaries`,
- `clean-code-maintainability`,
- `library-use`,
- `test-coverage`,
- `performance-rendering` when applicable.

Each subagent should report and fix only within its assigned domain. Cross-domain findings should be routed through the lead agent instead of letting one subagent mix unrelated responsibilities. When subagents edit in parallel, each one needs a disjoint write scope; shared modules should be serialized or assigned to one owner.

The technical audit issue may include bounded corrective changes directly tied to audit findings. It must not include new product capabilities, future milestone behavior, broad rewrites, speculative abstractions, dependency changes without a concrete finding, style-only formatting churn, or fixes that make the PR too large for the normal 15-30 minute review window.

New dependencies are allowed only when the audit finding shows that the project is solving a mature, well-understood problem itself and an industry-standard library is a better long-term choice. The PR must document why the dependency is robust, maintained, narrowly scoped, and preferable to the existing implementation.

Larger architecture, dependency, testing, or maintainability findings should become follow-up roadmap issues with their own objective, scope, acceptance criteria, and verification details.

Default acceptance criteria:

- [ ] The milestone code has been audited for architecture boundaries, maintainability, library usage, and test coverage.
- [ ] Audit work was split across single-responsibility subagents where parallel work was useful.
- [ ] Each subagent had a clear domain and did not mix unrelated responsibilities.
- [ ] Bounded corrective findings were fixed inside the audit pull request.
- [ ] Larger findings were converted into follow-up roadmap issues instead of being bundled into the audit pull request.
- [ ] Any new dependency is justified by a concrete finding and evaluated for maturity, maintenance, scope, and project fit.
- [ ] Relevant automated checks pass.
- [ ] Manual verification describes the milestone behavior that was checked after technical changes.
- [ ] No new product capabilities were added.
```

- [ ] **Step 2: Update the first executable roadmap**

In `docs/roadmap/roadmap-process.md`, replace:

```md
11. [Roadmap]: Phase 1 UX/UI hardening.
```

with:

```md
11. [Roadmap]: Phase 1 technical audit.
12. [Roadmap]: Phase 1 UX/UI hardening.
```

- [ ] **Step 3: Verify roadmap process references**

Run:

```sh
rg -n -F -e "Milestone Technical Audit" -e "[Roadmap]: Phase N technical audit" -e "[Roadmap]: Phase 1 technical audit" -e "architecture-boundaries" -e "library-use" docs/roadmap/roadmap-process.md
```

Expected: output shows the technical audit section, subagent domains, and Phase 1 ordering.

- [ ] **Step 4: Commit**

Run:

```sh
git add docs/roadmap/roadmap-process.md
git commit -m "docs: add technical audit roadmap process"
```

Expected: git creates a commit containing only `docs/roadmap/roadmap-process.md`.

---

### Task 3: Add README Discoverability Link

**Files:**

- Modify: `README.md`

- [ ] **Step 1: Add the spec link**

Edit `README.md` and add this bullet under `## Roadmap Workflow`, immediately after the milestone UX/UI hardening design link:

```md
- [Milestone technical audit design](docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md)
```

- [ ] **Step 2: Verify README link**

Run:

```sh
rg -n "Milestone technical audit design" README.md
```

Expected: output shows the new README roadmap workflow link.

- [ ] **Step 3: Commit**

Run:

```sh
git add README.md
git commit -m "docs: link milestone technical audit design"
```

Expected: git creates a commit containing only `README.md`.

---

### Task 4: Final Verification

**Files:**

- Verify: `AGENTS.md`
- Verify: `docs/roadmap/roadmap-process.md`
- Verify: `README.md`
- Verify: `docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md`

- [ ] **Step 1: Verify the design spec exists**

Run:

```sh
test -f docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md
```

Expected: command exits successfully with no output.

- [ ] **Step 2: Verify all operational references exist**

Run:

```sh
rg -n -F -e "2026-05-03-milestone-technical-audit-design" -e "Milestone Technical Audit" -e "[Roadmap]: Phase N technical audit" -e "[Roadmap]: Phase 1 technical audit" -e "Milestone technical audit design" AGENTS.md docs/roadmap/roadmap-process.md README.md
```

Expected: output includes:

```md
AGENTS.md
docs/roadmap/roadmap-process.md
README.md
```

- [ ] **Step 3: Scan for unfinished placeholders**

Run:

```sh
rg -n "T[B]D|T[O]DO|PLACE[H]OLDER|UNFINIS[H]ED|REPLACE_[M]E" AGENTS.md docs/roadmap/roadmap-process.md README.md docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md
```

Expected: no output.

- [ ] **Step 4: Review git history and working tree**

Run:

```sh
git status --short
git log --oneline -4
```

Expected: `git status --short` has no output. The latest commits include:

```md
docs: link milestone technical audit design
docs: add technical audit roadmap process
docs: add technical audit agent rules
docs: add milestone technical audit design
```

- [ ] **Step 5: Report manual verification instructions**

Tell the product owner:

```md
Manual verification:

1. Open AGENTS.md and confirm future agents are told to use `[Roadmap]: Phase N technical audit` as the default penultimate milestone issue.
2. Open docs/roadmap/roadmap-process.md and confirm the roadmap now places `[Roadmap]: Phase 1 technical audit` before `[Roadmap]: Phase 1 UX/UI hardening`.
3. Open README.md and confirm the roadmap workflow section links to the milestone technical audit design.
```

---

## Self-Review

- Spec coverage: The plan encodes the approved technical audit convention in agent rules, the human roadmap process, the first executable roadmap ordering, and README discoverability.
- Scope control: The plan does not change issue templates or PR templates because the existing templates already support the new convention.
- Placeholder scan: The plan avoids unresolved placeholders and gives exact text, commands, and expected results.
- Responsibility boundaries: The implementation remains documentation-only and does not introduce product behavior, dependencies, or formatting churn.
