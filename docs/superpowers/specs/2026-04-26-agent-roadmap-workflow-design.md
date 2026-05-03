# Agent Roadmap Workflow Design

## Context

`dl-graph-studio` is currently defined by an initial PRD and has not yet entered product implementation. The project needs an operating workflow that lets an AI coding agent execute roadmap work in small, reviewable increments while keeping the product owner in control of scope, quality, and merge decisions.

The desired loop is:

1. The agent takes one roadmap task.
2. The agent implements it and opens a pull request.
3. The product owner reviews the result and requests iteration if needed.
4. Once the expected result is reached, the PR is merged.
5. The cycle repeats with the next roadmap task.

## Goals

- Make GitHub the operational source of truth for executable roadmap work.
- Keep `PRD.md` as the high-level product source of truth.
- Ensure each agent task is small, scoped, reviewable, and tied to acceptance criteria.
- Use a semi-automatic cycle where the agent proposes the next task but the product owner confirms it.
- Leave room for stronger automation after the process has been validated with real PRs.

## Non-Goals

- Do not fully automate issue selection and implementation without owner confirmation.
- Do not create a heavy project-management process before implementation starts.
- Do not require all future roadmap tasks to be specified upfront.
- Do not introduce CI or GitHub automation before the baseline workflow is working.

## Recommended Approach

Use GitHub Project as the central execution system:

- Milestones represent product phases from `PRD.md`.
- Issues represent small vertical slices of work.
- Pull requests represent reviewable delivery units.
- Labels classify work and readiness.
- The agent proposes the next ready issue, and the product owner confirms before implementation starts.

This gives enough structure for reliable agent-driven development without prematurely adding complex automation.

## Roadmap Structure

### Milestones

Create one milestone per PRD phase:

- `Phase 1 - Core architecture editor`
- `Phase 2 - Reusable component system`
- `Phase 3 - Basic local execution`
- `Phase 4 - Practical architecture depth`
- `Phase 5 - Post-MVP extensions`

### GitHub Project States

Use these project statuses:

- `Backlog`: captured but not ready for execution.
- `Ready`: sufficiently defined for an agent to implement.
- `In Progress`: confirmed and actively being worked on.
- `In Review`: PR opened and awaiting review.
- `Needs Iteration`: reviewed, but changes are required before merge.
- `Done`: merged and accepted.

### Labels

Use a lightweight label set:

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

Labels should help filtering, not replace clear issue descriptions.

## Execution Cycle

The workflow is semi-automatic:

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

During early product development, the agent must not start the next issue without explicit owner confirmation.

## Issue Contract

Default rule:

- One issue equals one branch, one PR, and one reviewable unit.

Exceptions are allowed only when several issues are small, tightly coupled, and explicitly grouped before work starts.

Each roadmap issue should use this structure:

```md
# Title
[Roadmap]: <short task title>

## Objective
What user/product outcome this issue delivers.

## Scope
What must be included.

## Out of scope
What explicitly should not be done in this PR.

## Acceptance criteria
- [ ] Concrete behavior 1
- [ ] Concrete behavior 2

## Verification
Automated:

- [ ] Exact automated command, or not applicable with a reason.

Manual:

- [ ] Manual review step.

## Notes
Links, dependencies, implementation constraints, or design decisions.
```

`.github/ISSUE_TEMPLATE/roadmap-task.md` is the canonical format for roadmap issues, including the `[Roadmap]: ` title prefix. Before creating or updating a live roadmap issue outside GitHub's issue-template UI, agents should run `pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>`.

An issue can move to `Ready` only when the objective, scope, acceptance criteria, and verification sections are clear enough for an agent to work without inventing product behavior.

## Pull Request Contract

Each PR should use this structure:

```md
## Summary
What changed.

## Linked issue
Closes #

## Verification
- [ ] Automated checks:
- [ ] Manual checks:

## Screenshots / video
Required for UI changes.

## Notes
Known limitations, follow-ups, or review focus.
```

PRs should be small enough to review in about 15-30 minutes. If a planned PR cannot reasonably fit that review window, split the issue before implementation starts.

## Definition of Done

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

The product owner decides whether the PR is accepted, needs iteration, or should be split.

## First Executable Roadmap

Do not open the full roadmap upfront. Start with enough issues for roughly 2-4 weeks of work, focused on Phase 1.

Recommended initial issues:

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

PyTorch execution and training should wait until the graph representation is minimal, stable, and persistible.

## Repository Artifacts

Add these files before starting the first implementation task:

- `AGENTS.md`: agent operating rules for this repository.
- `.github/ISSUE_TEMPLATE/roadmap-task.md`: roadmap issue template.
- `.github/pull_request_template.md`: PR template.
- `docs/roadmap/roadmap-process.md`: human-readable process reference.

These files should encode the workflow described in this spec so future agent sessions can follow it consistently.

## Automation Path

Start with manual or agent-assisted project updates. After 5-10 real PRs have used the process, consider automation for repetitive checks:

- Move issues between project states automatically.
- Validate that each PR links a roadmap issue.
- Require completed PR checklist items.
- Require CI checks before merge.
- Generate issues from roadmap planning documents.
- Add a standard command for asking the agent to propose the next task.

Automation should follow observed workflow friction, not precede it.

## Open Decisions

- Which exact GitHub Project name to use.
- Which exact command or connector workflow agents should prefer when updating GitHub Project status fields.
- Which CI checks should become required once implementation starts.

These decisions do not block adopting the workflow.
