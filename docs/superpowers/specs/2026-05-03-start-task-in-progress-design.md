# Start Task In Progress Design

## Context

`dl-graph-studio` uses GitHub Issues and the `dl-graph-studio Roadmap`
GitHub Project as the operational source of truth for executable work. The
current agent cycle already says that, after the product owner confirms a ready
issue, the issue moves from `Ready` to `In Progress`.

The missing rule is the exact local trigger. Without a clear trigger, an agent
can create a local branch and start implementation while the GitHub Project
still shows the issue as `Ready`. That creates state drift: the roadmap appears
available even though an agent is already working on it.

## Goal

Make local task ownership visible in the GitHub Project as soon as implementation
work starts.

When an agent creates the local task branch for a confirmed roadmap issue, the
agent should treat that branch creation as the start of active work and move the
issue to `In Progress`.

## Non-Goals

- Do not add GitHub Actions or automatic branch-triggered Project automation.
- Do not move issues to `In Progress` during product-owner idea intake, design
  brainstorming, implementation planning, or next-task proposal.
- Do not let agents start implementation without product-owner confirmation.
- Do not change the existing `Ready`, `In Review`, `Needs Iteration`, or `Done`
  meanings.

## Recommended Workflow

Update the agent cycle so that `In Progress` is tied to local branch creation:

1. The agent proposes one `ready` issue.
2. The product owner confirms that issue for implementation.
3. The agent verifies the worktree state and synchronizes with `origin/main`
   according to the repository rules.
4. The agent creates the task branch named `codex/<issue-number>-<short-name>`.
5. Immediately after branch creation, before implementation edits, the agent
   attempts to move the confirmed issue from `Ready` to `In Progress` in the
   GitHub Project.
6. If the Project update succeeds, the agent continues with implementation.
7. If the Project update cannot be performed because of permissions, missing
   tooling, or unresolved Project metadata, the agent reports the blocker and
   gives a concrete manual action: move issue `#<issue-number>` to
   `In Progress` in `dl-graph-studio Roadmap`.

The key rule is that creating the local task branch is the point where the agent
claims the task. The Project should reflect that claim before code changes begin.

## Operational Rule

Agents should treat the Project status update as an attempted operating step,
not as best-effort background cleanup. The attempt belongs in the task startup
sequence after branch creation and before implementation.

The fallback is manual, not silent. If the agent cannot update the Project, it
must say so explicitly and identify the issue that needs to be moved. The agent
may continue only after the product owner confirms the manual state transition
or explicitly allows work to continue despite the temporary Project mismatch.

## Scope Of Documentation Changes

This design should be encoded in:

- `AGENTS.md`, because it is the instruction surface most likely to guide future
  agents.
- `docs/roadmap/roadmap-process.md`, because it is the human-readable workflow
  reference.
- `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md`, because
  it is the original workflow design source of truth.

The change should stay limited to the task startup transition. It should not add
new scripts, dependencies, issue templates, pull request template changes, or CI
checks.

## Error Handling

The Project update can fail for practical reasons:

- the GitHub connector or `gh` command is unavailable,
- the authenticated account cannot edit the Project,
- the agent cannot identify the Project item or status field,
- GitHub is unavailable.

In these cases, the agent should report the exact limitation when known and ask
for the manual move to `In Progress`. The failure should not be hidden in the
final PR notes only, because the purpose of the rule is to prevent live roadmap
state drift at task start.

## Verification

Verification is documentation-focused:

- `AGENTS.md` instructs agents to move a confirmed issue to `In Progress`
  immediately after creating the local task branch.
- `docs/roadmap/roadmap-process.md` describes the same startup order in the
  Agent Cycle.
- `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md` no longer
  leaves the timing ambiguous.
- The fallback behavior is clear: if automatic or assisted Project update is not
  possible, the agent must report the issue number and request manual movement
  before implementation continues.

## Rationale

`Ready` should mean available for work. Once a confirmed issue has a local task
branch, it is no longer merely ready; it is actively owned by that agent session.
Moving the issue to `In Progress` at branch creation keeps the roadmap accurate
without introducing premature automation.
