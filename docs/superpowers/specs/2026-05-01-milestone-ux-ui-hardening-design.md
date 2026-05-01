# Milestone UX/UI Hardening Design

## Context

`dl-graph-studio` depends on a visual-first, low-noise editing experience. The
current roadmap workflow already requires UI evidence in pull requests, but it
does not define a deliberate UX/UI pass at the end of each milestone.

Reviewing UX only inside individual feature pull requests can miss issues that
appear when milestone features are used together. This is especially important
for Phase 1 and Phase 2, where the canvas, primitive nodes, inspector,
connections, validation feedback, and composite-node entry model establish the
product's interaction foundation.

## Goal

Add a lightweight milestone closeout task that validates and tightens the
user-facing experience delivered by a milestone without turning the closeout
into an unbounded redesign.

## Recommended Workflow

At the end of each product milestone, create one roadmap issue named:

```md
Phase N UX/UI hardening
```

The issue should use the normal roadmap task contract:

- one issue,
- one branch,
- one pull request,
- explicit objective, scope, out-of-scope, acceptance criteria, and
  verification.

The issue should usually carry these labels:

```md
ux, frontend, ready
```

## Scope

The hardening issue may include small UX/UI corrections that improve coherence
across the milestone flow:

- spacing, sizing, alignment, and layout consistency,
- visual hierarchy and density,
- copy clarity for labels, empty states, and validation messages,
- interaction feedback for selection, disabled states, invalid actions, and
  transitions,
- consistency between canvas, inspector, toolbar, navigation, and validation
  surfaces,
- layout stability across supported viewport sizes,
- screenshots or a short recording of the milestone flow.

## Out Of Scope

The hardening issue must not include:

- new product capabilities,
- large redesigns,
- broad refactors unrelated to the UX pass,
- dependency changes,
- changes to future milestone behavior,
- unresolved product decisions hidden inside visual polish.

If the review reveals a larger design or product problem, create a follow-up
roadmap issue with its own objective, scope, acceptance criteria, and
verification details.

## Acceptance Criteria Template

Each milestone hardening issue should adapt these criteria to the current
milestone:

- [ ] The primary milestone flow has been reviewed end-to-end.
- [ ] Small UX/UI inconsistencies found during review have been fixed or
      explicitly deferred.
- [ ] Larger issues discovered during review have follow-up issues instead of
      being bundled into the hardening PR.
- [ ] The PR includes screenshots or a short recording for the reviewed flow.
- [ ] Manual verification describes the flow that was tested.
- [ ] No new product capabilities were added.

## Verification Template

Use this verification shape unless a milestone has stronger requirements:

```md
## Verification

- Automated:
  - Run the relevant frontend test, lint, and build commands for the current
    app state.
- Manual:
  - Open the milestone flow end-to-end.
  - Verify canvas readability, inspector behavior, navigation, interaction
    feedback, and empty/error states relevant to the milestone.
  - Capture screenshots or a short video/GIF.
```

## Process Impact

This should become a roadmap convention, not an informal reminder. The milestone
hardening issue is the final issue in a milestone by default, especially for
Phase 1 and Phase 2.

The existing rule that each roadmap task needs product-owner confirmation still
applies. An agent should not start a hardening issue unless the product owner
confirms it like any other roadmap task.

## Rationale

This approach keeps the normal PR review loop focused while adding a deliberate
experience-quality checkpoint. It allows low-risk polish in the closeout PR, but
protects the roadmap from vague design churn by forcing larger UX findings into
separate issues.
