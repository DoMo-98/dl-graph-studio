# Phase 1 UX/UI Hardening Design

## Context

Issue #22 is the final Phase 1 UX/UI closeout pass for `dl-graph-studio`.
The Phase 1 implementation now includes the core architecture editor flow:
primitive and composite nodes, selection, inspector details, parameter editing,
connections, validation feedback, import/export/reset, node movement, a
collapsible connections panel, and canvas viewport navigation controls.

The hardening pass should tighten that delivered experience without becoming a
redesign bucket or a place to add new product capabilities. It should also keep
product-owner control over subjective visual polish.

## Goal

Review the complete Phase 1 editor experience, fix the already-approved small
UX/UI findings in issue #22, and produce a product-owner-approved list before
fixing any newly discovered visual or interaction details.

## Scope

The issue should include:

- An end-to-end visual review of the primary Phase 1 editor flow.
- Triage of all product-owner-reported UX/UI findings listed in issue #22.
- Implementation of the existing open #22 findings:
  - unify toast notifications across the Phase 1 editor flow,
  - remove the default React Flow attribution only if licensing and package
    configuration allow it,
  - clear the active component selection when clicking the empty canvas
    background without interfering with nodes, ports, edges, or controls.
- A visual findings list for small newly discovered issues, with each finding
  classified before implementation.
- Product-owner approval before correcting any newly discovered finding.
- Follow-up roadmap issue drafts or issue recommendations for findings that are
  too large, subjective, or capability-like for #22.
- Screenshots or a short recording for the reviewed flow.

## Out Of Scope

The issue must not include:

- New product capabilities.
- Large redesigns or broad layout rethinks.
- Broad refactors unrelated to the UX/UI hardening pass.
- Dependency changes unless required for a scoped hardening fix.
- Changes to future milestone behavior.
- Reopening completed follow-up work from #26, #32, or #33.
- Fixing newly discovered visual findings before product-owner approval.

## Visual Review Gate

The implementation should start with a visual review pass before making
subjective visual corrections. The agent should inspect the running app across
the primary Phase 1 flow and produce a concise table with:

- finding,
- affected screen or interaction,
- user impact,
- recommended decision: fix in #22, defer, or create follow-up issue,
- implementation risk or scope note.

The existing open findings in #22 are pre-approved for implementation because
they are already part of the issue contract. Newly discovered findings are not
pre-approved. The agent must present the table to the product owner and wait
for approval before fixing any of them.

If the product owner approves only some findings, #22 should fix only those.
Unapproved findings should be documented as deferred or converted into
follow-up issue recommendations.

## Implementation Boundaries

The implementation should stay close to the existing app structure and visual
system. Changes should favor small CSS adjustments, small interaction fixes, or
focused component behavior changes over broad decomposition.

Any fix that requires substantial state-model changes, new graph behavior,
new controls, new persistent data, or a large layout rewrite should be excluded
from #22 and proposed as follow-up roadmap work.

## Verification

Automated verification should run:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Manual verification should cover:

- opening the primary Phase 1 editor flow,
- selecting primitive and composite nodes,
- editing supported parameters,
- creating valid and invalid connections,
- deleting an individual connection,
- collapsing and expanding the connections panel,
- dragging nodes and using fit-view/canvas navigation,
- exporting, resetting, and importing a project,
- confirming toast behavior is consistent,
- confirming background canvas clicks clear active component selection without
  disrupting nodes, ports, edges, or controls,
- confirming the React Flow attribution outcome is documented,
- capturing screenshots or a short recording of the final reviewed flow.

## Acceptance Criteria

- The primary Phase 1 flow has been reviewed end-to-end.
- Product-owner-reported UX/UI findings in #22 have been triaged.
- Existing open #22 findings are fixed or explicitly deferred with rationale.
- Newly discovered findings are listed and not corrected until approved by the
  product owner.
- Approved small visual findings are fixed inside #22.
- Larger or unapproved findings are deferred or converted into follow-up issue
  recommendations.
- Automated verification passes or any skipped check is explained.
- Manual verification documents the reviewed flow.
- The pull request includes screenshots or a short recording.
- No new product capabilities are added.
