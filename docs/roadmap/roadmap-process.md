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
- `.github/ISSUE_TEMPLATE/roadmap-task.md` is the canonical roadmap issue format, including the `[Roadmap]: ` title prefix and verification section shape.
- Before creating or updating a live roadmap issue through the CLI, API, or any path outside GitHub's issue-template UI, run `pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>`.
- An issue enters `Ready` only when objective, scope, out-of-scope, acceptance criteria, and verification are clear.
- Do not apply the `ready` label or add the issue to the Project as ready until the roadmap issue validator passes.
- Keep issues small enough for a PR review of about 15-30 minutes.

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

Intake confirmation can create or update the issue, mark it `Ready`, and set its priority, but it does not authorize implementation. Ideas become implementation work only when the product owner explicitly selects or confirms a ready issue for work under the Agent Cycle. Clear ideas should move toward `Ready`; unclear ideas should stay blocked by named decisions rather than relying on hidden assumptions.

## Milestone Technical Audit

Each product milestone should include one roadmap issue with the live title `[Roadmap]: Phase N technical audit` unless the product owner explicitly decides to skip it. Conceptually, this is the `Phase N technical audit` issue, and it should usually run before `[Roadmap]: Phase N UX/UI hardening`.

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

## Milestone UX/UI Hardening

Each product milestone should end with one roadmap issue with the live title `[Roadmap]: Phase N UX/UI hardening` unless the product owner explicitly decides to skip it.

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

## Agent Cycle

The GitHub Project tracks roadmap issues as the status owner. Pull requests are linked delivery artifacts that move the issue through Project statuses.

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
11. `[Roadmap]: Phase 1 technical audit`.
12. `[Roadmap]: Phase 1 UX/UI hardening`.

Do not start PyTorch execution or training until the graph representation is minimal, stable, and persistible.

## Later Automation

After 5-10 real PRs use this process, consider automating repeated checks:

- Move issues between project states automatically.
- Validate that each PR links a roadmap issue.
- Require completed PR checklist items.
- Require CI checks before merge.
- Generate issues from roadmap planning documents.
- Add a standard command for asking the agent to propose the next task.
