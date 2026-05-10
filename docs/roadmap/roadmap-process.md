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

Create a single-select Project field named `Milestone Focus` with these values:

- `Current`
- `Next`
- `Later`
- `Closed`

GitHub Milestones remain the canonical issue-level phase assignment. `Milestone Focus` controls which milestone appears in the daily Project board view.

Create these saved Project views:

- `Active Milestone`: board layout, filtered to `Milestone Focus:Current`, with columns grouped by `Status`.
- `Milestone Overview`: global view showing all roadmap items with GitHub Milestone, `Milestone Focus`, `Status`, labels, and linked pull requests visible.

## Issue Rules

- One issue should map to one branch and one pull request by default.
- A PR can close multiple issues only when the issues explicitly allow grouping before work starts.
- `.github/ISSUE_TEMPLATE/roadmap-task.md` is the canonical roadmap issue format, including the `[Roadmap]: ` title prefix, roadmap metadata, and verification section shape.
- Before creating or updating a live roadmap issue through the CLI, API, or any path outside GitHub's issue-template UI, run `pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>`.
- An issue enters `Ready` only when objective, scope, out-of-scope, acceptance criteria, and verification are clear.
- Do not apply the `ready` label or add the issue to the Project as ready until the roadmap issue validator passes.
- Keep issues small enough for a PR review of about 15-30 minutes.
- Each roadmap issue added to the Project must have both a GitHub Milestone and a `Milestone Focus` value. Use `Current` for active milestone work, `Next` for the next planned milestone, `Later` for future milestone work, and `Closed` for completed milestone work after closeout is accepted.
- Roadmap issues for product phase work must not be left without a GitHub Milestone. Unmilestoned roadmap issues are exceptional and must include a concrete `No GitHub Milestone reason` approved by the product owner, such as bootstrap work that predates the milestone system or global process work that intentionally sits outside phase delivery.

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

When all required work in the `Current` milestone is `Done`, first check that milestone UX/UI hardening and technical audit are `Done` or explicitly skipped, no milestone pull request remains open in review, and no blocking follow-up must be completed before closeout.

If closeout is complete, propose moving the completed milestone's Project items from `Current` to `Closed` and the next milestone's Project items from `Next` to `Current`. After product-owner confirmation, attempt to update the Project fields; if the update fails, report the blocker and ask for the concrete access, authorization, or Project metadata needed to complete the update.

A focus transition updates board visibility only. It does not authorize implementation of the next roadmap issue.

## Product Owner Idea Intake

When the product owner proposes a new idea in conversation, treat it as intake for executable roadmap work unless it is clearly a PRD-level product direction discussion.

The default outcome is a roadmap issue that can enter `Ready` once the issue contract is clear. The agent should not start implementation during intake.

Use this intake sequence:

1. Classify the idea as a UX/UI finding, technical audit finding, new roadmap task, or PRD-level idea.
2. If it fits the current milestone hardening or technical audit issue, record it there with enough context to evaluate later.
3. If it is a standalone roadmap task, ask only the clarifying questions needed to define objective, scope, out-of-scope, acceptance criteria, verification, milestone, `Milestone Focus`, labels, and expected PR size. If no milestone applies, ask for the explicit `No GitHub Milestone reason` that should be recorded in the issue body.
4. If the idea is too large for one 15-30 minute reviewable PR, split it before issue creation and recommend the first issue to create.
5. Draft the issue using `.github/ISSUE_TEMPLATE/roadmap-task.md`.
6. Validate the draft before applying `ready` or adding it to the Project as ready:

   ```bash
   pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>
   ```

7. Ask the product owner to confirm issue creation, readiness, and priority.

Intake confirmation can create or update the issue, mark it `Ready`, and set its priority, but it does not authorize implementation. Ideas become implementation work only when the product owner explicitly selects or confirms a ready issue for work under the Agent Cycle. Clear ideas should move toward `Ready`; unclear ideas should stay blocked by named decisions rather than relying on hidden assumptions.

Intake should recommend a GitHub Milestone and `Milestone Focus` value. Future-milestone ideas should usually receive `Later` unless the product owner explicitly promotes that milestone to `Next`. The agent should not propose a phase issue as ready while the GitHub Milestone is missing or only implied by title, label, or Project field.

## Milestone Technical Audit

Each product milestone should include one roadmap issue with the live title `[Roadmap]: Phase N technical audit` unless the product owner explicitly decides to skip it. Conceptually, this is the `Phase N technical audit` issue, and it should usually run after `[Roadmap]: Phase N UX/UI hardening` as the final milestone closeout.

Use this issue as a corrective milestone closeout pass for technical quality, not as an unbounded cleanup bucket. It may include bounded corrections across the milestone implementation:

- architecture boundaries, ownership, data flow, coupling, domain models, and adapter layers,
- clean-code maintainability, naming, duplication, component consolidation, complexity, local API clarity, and dead code,
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

When the audit finds duplicated or parallel components, centralize them only when the change is bounded and reviewable. If the correct consolidation requires product-owner feedback, an architecture decision, or a larger PR, ask for feedback or create a follow-up roadmap issue instead of bundling the decision into the audit.

New dependencies are allowed only when the audit finding shows that the project is solving a mature, well-understood problem itself and an industry-standard library is a better long-term choice. The PR must document why the dependency is robust, maintained, narrowly scoped, and preferable to the existing implementation.

Larger architecture, dependency, testing, or maintainability findings should become follow-up roadmap issues with their own objective, scope, acceptance criteria, and verification details.

Default acceptance criteria:

- [ ] The milestone code has been audited for architecture boundaries, maintainability, component consolidation opportunities, library usage, and test coverage.
- [ ] Audit work was split across single-responsibility subagents where parallel work was useful.
- [ ] Each subagent had a clear domain and did not mix unrelated responsibilities.
- [ ] Bounded corrective findings were fixed inside the audit pull request.
- [ ] Larger findings were converted into follow-up roadmap issues instead of being bundled into the audit pull request.
- [ ] Any new dependency is justified by a concrete finding and evaluated for maturity, maintenance, scope, and project fit.
- [ ] Relevant automated checks pass.
- [ ] Manual verification describes the milestone behavior that was checked after technical changes.
- [ ] No new product capabilities were added.

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

## Milestone UX/UI Hardening

Each product milestone should include one roadmap issue with the live title `[Roadmap]: Phase N UX/UI hardening` unless the product owner explicitly decides to skip it. This issue should usually run before `[Roadmap]: Phase N technical audit`, which remains the final milestone closeout.

Use this issue as a milestone closeout pass, not as a redesign bucket. It may include small UX/UI corrections across the milestone flow:

- spacing, sizing, alignment, and layout consistency,
- visual hierarchy and density,
- label, empty-state, and validation-message clarity,
- selection, disabled-state, invalid-action, and transition feedback,
- consistency between canvas, inspector, toolbar, navigation, and validation surfaces,
- layout stability across supported viewport sizes.

Use `ux`, `frontend`, and `ready` labels when the issue is ready for selection.

During a milestone, the product owner may report UX/UI findings informally
while reviewing work. Agents should record those findings in the current
milestone hardening issue under a clear `User-reported UX/UI findings` section.
Each entry should capture the affected flow or screen, the observed problem,
the expected experience when known, severity or impact, and whether the finding
looks like small polish, a UX bug, or a larger product/design issue.

The hardening issue must not include new product capabilities, large redesigns, broad refactors, dependency changes, or future milestone behavior. Larger UX or product findings should become follow-up roadmap issues.

Default acceptance criteria:

- [ ] The primary milestone flow has been reviewed end-to-end.
- [ ] Product-owner-reported UX/UI findings for the milestone have been triaged.
- [ ] Small UX/UI inconsistencies found during review have been fixed or explicitly deferred.
- [ ] Larger issues discovered during review have follow-up issues instead of being bundled into the hardening PR.
- [ ] The PR includes screenshots or a short recording for the reviewed flow.
- [ ] Manual verification describes the flow that was tested.
- [ ] No new product capabilities were added.

## Commit Message Rules

All commits should use the repository Conventional Commit subset:

```text
type: summary
```

Allowed types are `feat`, `fix`, `docs`, `test`, `refactor`, `style`, and `chore`.
The summary should be concrete, should describe the actual change, should not
end with a period, and should not be a vague placeholder such as `update`,
`changes`, `fix stuff`, or `misc`.

Before creating a commit, agents should validate the intended message:

```bash
pnpm validate:commit-message -- --message "docs: add commit message rules"
```

The validator also supports revision ranges for pull request CI and local
branch checks:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

The CI policy validates each pull request commit individually rather than only
the pull request title or final squash commit.

## Agent Cycle

The GitHub Project tracks roadmap issues as the status owner. Pull requests are linked delivery artifacts that move the issue through Project statuses.

1. The product owner asks for the next task.
2. The agent reviews the GitHub Project.
3. If the agent cannot review the GitHub Project because authentication, permissions, tooling, network access, or Project metadata is unavailable, the agent asks the product owner for the concrete access, re-authentication, authorization, or Project metadata needed to inspect it before recommending an executable task. When a CLI or app can start an interactive authorization flow, the agent starts that flow and gives the product owner the exact URL, code, or approval prompt to complete, instead of only describing commands for the product owner to run. Issue labels, issue sidebars, and public issue HTML are not substitutes for the Project status.
4. The agent proposes one issue whose Project status is `Ready` and whose labels include `ready`, then explains the recommendation.
5. The product owner confirms the issue or selects another one.
6. The agent creates a branch named `codex/<issue-number>-<short-name>`.
7. Immediately after branch creation, before implementation edits, the agent attempts to move the confirmed issue from `Ready` to `In Progress` in the GitHub Project.
8. If the Project update cannot be performed because of permissions, missing tooling, unresolved Project metadata, GitHub availability, or another blocker, the agent reports the limitation and asks the product owner for the permissions, authorization, or Project metadata needed to complete the update, or for explicit authorization to continue while the Project status remains temporarily unchanged. The agent does not request a manual Project move unless the product owner explicitly chooses that fallback.
9. The agent implements the issue scope using the maintainability and scope balance convention.
10. The agent runs the required verification.
11. The agent opens a PR linked with `Closes #<issue-number>`, and the issue moves to `In Review`.
12. The product owner reviews the result.
13. If changes are needed, the issue moves to `Needs Iteration` and the agent updates the same PR.
14. When the update is ready for review, the issue moves back to `In Review`.
15. When accepted and merged, the issue moves to `Done`.
16. The next issue starts only after product-owner confirmation.

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
11. `[Roadmap]: Phase 1 UX/UI hardening`.
12. `[Roadmap]: Phase 1 technical audit`.

Do not start PyTorch execution or training until the graph representation is minimal, stable, and persistible.

## Required CI Checks

Pull requests and pushes to `main` run the repository CI workflow. The workflow is limited to repository-owned commands so required checks stay auditable and reproducible within this repository.

Pull requests run these enforced checks:

```bash
pnpm install --frozen-lockfile
pnpm validate:commit-message -- --range <base>..HEAD
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Pushes to `main` run the same quality checks except pull request commit range validation:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

For local branch verification before opening a pull request, agents and contributors should use `origin/main` as the usual base:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

When reviewing a branch against a different base, replace `origin/main` with the actual base revision.

Agents should run the same commands locally before opening pull requests when the issue touches code, build configuration, tests, or documentation.

Coverage thresholds are a modest initial regression floor, not the final quality target for the product.

`pnpm test:e2e` runs the Playwright functional regression suite for the current core editor surface. It covers editor load, node selection, inspector updates, primitive parameter editing, valid and invalid connection behavior, connection panel behavior, connection deletion, and stable project file export/reset/import behavior. It is not visual snapshot testing, cross-browser coverage, Tauri desktop automation, or exhaustive future Phase 2 workflow coverage.

Pull request issue linkage, roadmap issue readiness, and GitHub Project status remain required process checks, but they are not enforced by repository CI. They depend on live GitHub metadata, Project permissions, and product-owner workflow state that are not reliably available to ordinary workflow runs. Agents must continue to verify those checks through the roadmap workflow before opening or updating pull requests.

## Later Automation

After more real PRs use this process, consider automating repeated checks that require live GitHub metadata or repository settings:

- Move issues between project states automatically.
- Validate that each PR links a roadmap issue.
- Validate that linked roadmap issues have the expected contract and readiness state.
- Require completed PR checklist items.
- Configure branch protection to require CI checks before merge.
- Generate issues from roadmap planning documents.
- Add a standard command for asking the agent to propose the next task.
