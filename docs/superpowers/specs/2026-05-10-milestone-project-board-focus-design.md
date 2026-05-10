# Milestone Project Board Focus Design

## Context

`dl-graph-studio` uses GitHub Issues and the `dl-graph-studio Roadmap`
GitHub Project as the operational source of truth for executable roadmap work.
The existing workflow already defines product milestones, roadmap issue
contracts, Project statuses, milestone UX/UI hardening, and milestone technical
audits.

The current Project board is status-oriented. That makes the execution state of
each issue visible, but it does not clearly separate issues from different
milestones inside the board itself. The product owner currently has to leave the
Project view and inspect the Issues milestone area to understand which cards
belong to one phase versus another.

## Goal

Make milestone focus visible directly in the GitHub Project while preserving
the existing issue, status, and product-owner confirmation workflow.

The daily board should show the active milestone without requiring manual view
filter edits when the project moves from one phase to the next. The global view
should still make all milestones visible for planning and review.

## Non-Goals

- Do not replace GitHub Milestones as the canonical issue-level phase metadata.
- Do not change the existing Project status values.
- Do not automatically start implementation of the next milestone.
- Do not add GitHub Actions or background automation for Project field updates.
- Do not create a separate GitHub Project per milestone.

## Recommended Project Field

Add a single-select Project field named:

```text
Milestone Focus
```

Use these values:

- `Current`: issues in the milestone that should be visible in the daily board.
- `Next`: issues in the next planned milestone.
- `Later`: future milestone work that should remain out of the daily board.
- `Closed`: completed milestone work that remains visible in the global view.

This field is operational Project metadata. The GitHub Milestone on each issue
remains the canonical milestone assignment, such as
`Phase 1 - Core architecture editor`.

## Required Project Views

### Active Milestone

Create a saved board view named:

```text
Active Milestone
```

This view should:

- use board layout,
- filter to `Milestone Focus:Current`,
- keep columns grouped by the existing `Status` field,
- show enough card metadata to reveal milestone, labels, linked pull requests,
  and assignee when available.

This is the default daily execution view. It should answer: "What is happening
in the active milestone right now?"

### Milestone Overview

Create a saved global view named:

```text
Milestone Overview
```

This view should:

- show all roadmap Project items,
- expose GitHub Milestone, `Milestone Focus`, `Status`, labels, and linked pull
  requests,
- group or sort by milestone and focus when GitHub's Project view options allow
  it,
- keep closed milestones visible without mixing them into the active board.

This is the planning and review view. It should answer: "How is work distributed
across milestones?"

## Agent Workflow

When an agent creates or updates a roadmap issue, it should set both:

- the issue's GitHub Milestone,
- the Project item's `Milestone Focus` value.

Default assignment rules:

- active milestone issues use `Current`,
- the next planned milestone's prepared issues use `Next`,
- future milestone issues use `Later`,
- completed milestone issues use `Closed` after milestone closeout is accepted.

The `ready` label and Project `Status` still control executable task selection.
`Milestone Focus` only controls milestone visibility and focus.

## Milestone Advancement

When every issue in the `Current` milestone is `Done`, the agent should not
silently advance the roadmap. It should first check whether milestone closeout is
complete:

- the milestone UX/UI hardening issue is `Done` or explicitly skipped,
- the milestone technical audit issue is `Done` or explicitly skipped,
- no pull request for the milestone remains open in review,
- no blocking follow-up issue must be completed before closing the milestone.

If the closeout check passes, the agent should propose the focus transition to
the product owner:

- move the completed milestone's Project items from `Current` to `Closed`,
- move the next milestone's Project items from `Next` to `Current`,
- keep later milestone work as `Later`.

After product-owner confirmation, the agent may update the Project fields. This
updates board focus only; it does not authorize implementation of the next
roadmap issue.

If the agent cannot update Project fields because of permissions, missing
tooling, unresolved Project metadata, or GitHub availability, it should report
the blocker and ask for the concrete access or authorization needed to complete
the update.

## Issue Intake Impact

Product-owner idea intake should recommend a GitHub Milestone and `Milestone
Focus` value for each drafted roadmap issue. The issue can be proposed as
`Ready` only when the normal roadmap issue contract is complete.

Ideas that belong to a future milestone should usually receive `Later` unless
the product owner explicitly promotes that milestone to `Next`.

## Acceptance Criteria

- [ ] The roadmap process documents the `Milestone Focus` field and required
      Project views.
- [ ] Agent operating instructions require milestone focus assignment when
      creating or updating roadmap issues.
- [ ] The milestone advancement rule is documented as product-owner confirmed,
      not silent automation.
- [ ] The existing `Ready` plus `ready` executable task rule remains unchanged.
- [ ] The design avoids requiring manual filter edits whenever the active
      milestone changes.

## Verification

Automated:

- [ ] Run `pnpm format:check` for documentation formatting.

Manual:

- [ ] In the GitHub Project, confirm an `Active Milestone` view can filter to
      `Milestone Focus:Current` and still show status columns.
- [ ] Confirm a `Milestone Overview` view can show all roadmap items with
      GitHub Milestone and `Milestone Focus` visible.
- [ ] Confirm the agent workflow explains when to propose moving focus from one
      milestone to the next.

## Rationale

Using a Project field separates board focus from issue identity. GitHub
Milestones remain the durable source for phase assignment, while `Milestone
Focus` gives the Project board a simple way to show the active phase without
editing saved filters for every milestone transition.

Requiring the agent to propose advancement after 100% `Done` preserves
product-owner control. A milestone may still need final review, hardening,
technical audit, or explicit deferral decisions before the next phase becomes
the active board focus.
