# Milestone Technical Audit Design

## Context

`dl-graph-studio` uses an agent-assisted roadmap workflow where each roadmap
task is intentionally small, scoped, and reviewable. The workflow already
includes a milestone UX/UI hardening pass, but it does not define an equivalent
technical closeout pass for architecture, clean code, maintainability, test
coverage, and library usage.

Reviewing technical quality only inside individual feature pull requests can
miss problems that appear when milestone features are combined. This is
especially important for early milestones, where the graph model, React Flow
adapter boundary, inspector state, validation logic, persistence shape, and
future runtime boundary become the foundation for later work.

## Goal

Add a corrective milestone closeout task that audits and improves technical
quality before the milestone is considered complete.

The audit should catch and fix bounded problems in the delivered milestone,
while converting larger findings into explicit follow-up roadmap issues instead
of hiding broad refactors inside the closeout pull request.

## Recommended Workflow

Near the end of each product milestone, create one roadmap issue named:

```md
[Roadmap]: Phase N technical audit
```

This issue should usually run before:

```md
[Roadmap]: Phase N UX/UI hardening
```

The technical audit should stabilize implementation quality first. The UX/UI
hardening pass can then validate the user-facing flow on top of the corrected
technical base.

The issue should use the normal roadmap task contract:

- one issue,
- one branch,
- one pull request,
- explicit objective, scope, out-of-scope, acceptance criteria, and
  verification.

The issue should usually carry these labels:

```md
infra, ready
```

Add domain labels such as `frontend`, `runtime`, `validation`, or `persistence`
when the milestone work makes them relevant. Add `docs` only when the audit
includes documentation corrections.

## Subagent Model

The audit should be coordinated by one lead agent and split across subagents
with one responsibility each. A subagent must not own multiple audit domains.

Recommended subagent responsibilities:

- `architecture-boundaries`: module boundaries, ownership, data flow,
  coupling, domain models, adapter layers, and whether implementation matches
  documented architecture.
- `clean-code-maintainability`: naming, duplication, function and component
  size, local API clarity, complexity, dead code, and readability.
- `library-use`: places where the code reinvents solved problems, checks
  whether existing project dependencies already provide the needed behavior,
  and evaluates any proposed new dependency for maturity, maintenance, bundle
  cost, fit, and long-term risk.
- `test-coverage`: missing tests for behavior delivered in the milestone,
  brittle tests, weak assertions, and practical additions to unit, component,
  integration, or end-to-end coverage.
- `performance-rendering`: rendering cost, avoidable recomputation, state
  shape, large-list or canvas behavior, and interaction latency. Use this
  subagent only when the milestone includes behavior where performance or
  rendering cost is a real concern.

Each subagent should report findings in its own domain, implement only fixes in
its owned files or responsibility area, and flag cross-domain findings for the
lead agent to route to the correct owner. For example, the `library-use`
subagent may identify that custom graph traversal should use a robust existing
utility, but it should not also redesign graph module boundaries unless that is
explicitly assigned to `architecture-boundaries`.

When several subagents edit code in parallel, each one needs a disjoint write
scope. If two findings require touching the same module, the lead agent should
serialize those edits or assign the module to a single owner.

## Scope

The technical audit issue may include corrective changes when they are bounded,
milestone-local, and directly tied to an audit finding:

- clarify module boundaries without changing product behavior,
- extract focused helpers or components when existing code is doing too much,
- remove duplication introduced during the milestone,
- simplify overly complex conditionals, data mapping, or state transitions,
- replace hand-rolled code with project-approved, robust library behavior,
- add missing tests for milestone behavior,
- improve type safety where weak types hide real maintenance risk,
- update documentation when actual architecture or workflow differs from the
  documented design,
- create follow-up roadmap issues for findings that are too large for the
  audit pull request.

New dependencies are allowed only when the audit finding shows that the project
is solving a mature, well-understood problem itself and an industry-standard
library is a better long-term choice. The pull request must document why the
dependency is robust, maintained, appropriately scoped, and preferable to the
existing implementation.

## Out Of Scope

The technical audit issue must not include:

- new product capabilities,
- changes to future milestone behavior,
- broad rewrites of working milestone features,
- speculative abstractions,
- dependency changes without a concrete audit finding,
- style-only formatting churn,
- large migrations of framework, state management, build tooling, or testing
  tooling,
- unresolved architecture decisions hidden inside refactoring,
- fixes that make the pull request too large to review in the normal
  15-30 minute review window.

If a finding requires a broad refactor, architecture decision, dependency
migration, or product clarification, create a follow-up roadmap issue with its
own objective, scope, acceptance criteria, and verification details.

## Finding Format

Audit findings should be recorded in the issue or pull request using a compact,
actionable format:

```md
### Finding: <short title>

- Domain:
- Severity: low | medium | high
- Owner:
- Evidence:
- Decision: fixed | deferred | converted to follow-up
- Follow-up issue:
```

Severity should reflect maintenance or delivery risk, not personal preference.
A high-severity finding should describe a concrete risk such as incorrect data
flow, fragile persistence shape, missing test coverage for critical behavior, or
a custom implementation of a hard problem that should rely on a proven library.

## Acceptance Criteria Template

Each milestone technical audit issue should adapt these criteria to the current
milestone:

- [ ] The milestone code has been audited for architecture boundaries,
      maintainability, library usage, and test coverage.
- [ ] Audit work was split across single-responsibility subagents where
      parallel work was useful.
- [ ] Each subagent had a clear domain and did not mix unrelated
      responsibilities.
- [ ] Bounded corrective findings were fixed inside the audit pull request.
- [ ] Larger findings were converted into follow-up roadmap issues instead of
      being bundled into the audit pull request.
- [ ] Any new dependency is justified by a concrete finding and evaluated for
      maturity, maintenance, scope, and project fit.
- [ ] Relevant automated checks pass.
- [ ] Manual verification describes the milestone behavior that was checked
      after technical changes.
- [ ] No new product capabilities were added.

## Verification Template

Use this verification shape unless a milestone has stronger requirements:

```md
## Verification

Automated:

- [ ] Run the relevant typecheck, lint, test, and build commands for the
      current app state.
- [ ] Run targeted tests added or changed by audit fixes.

Manual:

- [ ] Open the primary milestone flow.
- [ ] Verify the flow still behaves as it did before the technical audit.
- [ ] Check any touched area where refactoring could affect user-visible
      behavior.
```

When the milestone includes UI behavior, the audit pull request should include
screenshots or a short recording only for areas affected by technical changes.
The dedicated UX/UI hardening issue remains responsible for the full
milestone-flow visual review.

## Process Impact

This should become a roadmap convention, not an informal reminder. The
technical audit issue is the default penultimate issue in a milestone, followed
by UX/UI hardening as the final issue, unless the product owner explicitly
decides to skip or reorder either closeout task.

The existing rule that each roadmap task needs product-owner confirmation still
applies. An agent should not start the technical audit unless the product owner
confirms it like any other roadmap task.

The audit should reduce local technical debt before the next milestone starts,
but it should not turn milestone closeout into an unbounded cleanup phase. The
lead agent is responsible for keeping fixes reviewable and pushing large work
into follow-up issues.

## Rationale

A corrective technical audit gives the project a regular quality checkpoint
without weakening scope control. Splitting the audit by responsibility lets
subagents inspect and fix focused areas in parallel while avoiding the common
failure mode where one broad "cleanup" task mixes architecture, style,
dependencies, and tests into a hard-to-review pull request.

Running the technical audit before UX/UI hardening also keeps closeout ordered:
first make the implementation foundation maintainable, then validate the
complete user-facing experience.
