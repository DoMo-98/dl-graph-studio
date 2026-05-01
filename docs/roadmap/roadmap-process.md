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

## Agent Cycle

The GitHub Project tracks roadmap issues as the status owner. Pull requests are linked delivery artifacts that move the issue through Project statuses.

1. The product owner asks for the next task.
2. The agent reviews the GitHub Project.
3. The agent proposes one issue with the `ready` label and explains the recommendation.
4. The product owner confirms the issue or selects another one, and the issue moves from `Ready` to `In Progress`.
5. The agent creates a branch named `codex/<issue-number>-<short-name>`.
6. The agent implements only the issue scope.
7. The agent runs the required verification.
8. The agent opens a PR linked with `Closes #<issue-number>`, and the issue moves to `In Review`.
9. The product owner reviews the result.
10. If changes are needed, the issue moves to `Needs Iteration` and the agent updates the same PR.
11. When the update is ready for review, the issue moves back to `In Review`.
12. When accepted and merged, the issue moves to `Done`.
13. The next issue starts only after product-owner confirmation.

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
11. Phase 1 UX/UI hardening.

Do not start PyTorch execution or training until the graph representation is minimal, stable, and persistible.

## Later Automation

After 5-10 real PRs use this process, consider automating repeated checks:

- Move issues between project states automatically.
- Validate that each PR links a roadmap issue.
- Require completed PR checklist items.
- Require CI checks before merge.
- Generate issues from roadmap planning documents.
- Add a standard command for asking the agent to propose the next task.
