# CI Regression Control Design

## Context

`dl-graph-studio` is preparing to enter Phase 2, where the product will start
building a reusable component system on top of the Phase 1 editor foundation.
The repository already has local quality checks, but it does not yet have a
GitHub Actions workflow that runs them consistently for pull requests.

The current repo uses `pnpm@10.27.0`, Vite, React, TypeScript, Tauri, Vitest,
ESLint, and Prettier. Existing scripts cover format checking, linting, unit and
component tests, frontend build/typechecking, roadmap issue validation, and
commit message validation. There is no existing CI workflow, no coverage
threshold, and no Playwright setup.

The original roadmap workflow intentionally deferred CI until the team had used
the agent-assisted process on real pull requests. At this point, adding CI
before Phase 2 is appropriate because the next phase will increase shared UI
surface area and regression risk.

## Goal

Add a CI regression-control capability before Phase 2 that blocks basic quality
regressions on pull requests while keeping the first implementation reviewable.

The complete capability should cover:

- reproducible dependency installation,
- formatting,
- linting,
- unit and component tests,
- coverage with explicit initial thresholds,
- frontend build/typechecking,
- Playwright smoke or end-to-end checks,
- selected repository-specific validation rules,
- documentation for local and CI verification.

The goal is not to create an exhaustive end-to-end suite immediately. The goal
is to establish the correct CI harness and leave clear places to strengthen it
as Phase 2 adds behavior.

## Recommended Approach

Implement the CI capability in layers rather than one large pull request.

The first issue should add the GitHub Actions workflow and coverage baseline
using the existing local checks. A second issue should add Playwright smoke or
end-to-end coverage. A third issue may integrate custom PR, commit, or roadmap
rules that depend on GitHub metadata and document the required checks.

This approach gives the repository a complete CI direction while keeping each
pull request within the normal 15-30 minute review window.

## Issue Split

### Issue 1: CI Base And Coverage

Add the initial GitHub Actions workflow for pull requests and pushes to `main`.

Scope:

- create `.github/workflows/ci.yml`,
- set up Node and `pnpm@10.27.0`,
- install dependencies with the lockfile enforced,
- run `pnpm format:check`,
- run `pnpm lint`,
- run `pnpm test`,
- add and run a `pnpm test:coverage` script,
- run `pnpm build`,
- configure explicit initial coverage thresholds.

The coverage thresholds should be intentionally modest. They should catch large
coverage drops without pretending the current early-stage test suite is already
a mature standard. Future issues can raise thresholds when the test surface
grows.

Out of scope:

- Playwright,
- Tauri desktop packaging,
- branch protection configuration outside the repository,
- GitHub Project automation,
- complex PR metadata validation.

### Issue 2: Playwright Smoke Checks

Add Playwright for a small browser-level regression check against the Vite app.

Scope:

- install and configure Playwright,
- add a `pnpm test:e2e` script,
- start the Vite app in CI for Playwright,
- add at least one smoke test that opens the app and verifies the editor loads,
- include one basic representative interaction when practical,
- upload Playwright traces, screenshots, or reports on failure.

The first Playwright test should be deliberately narrow. Its job is to prove
that the app boots and that the main editor surface is not broken. Deeper
workflow coverage should be added as Phase 2 introduces reusable component
behavior.

Out of scope:

- exhaustive editor coverage,
- visual snapshot testing,
- cross-browser matrices unless a concrete need appears,
- Tauri desktop automation.

### Issue 3: Custom Rules And CI Documentation

Integrate repository-specific validation rules that are reliable in GitHub
Actions and document how the CI system should be used.

Scope:

- run the commit message validator against the pull request commit range when
  the range is available reliably,
- evaluate whether roadmap issue or pull request contract validation can run
  from repository-local scripts without brittle GitHub API assumptions,
- document all required checks in the roadmap process,
- document local reproduction commands,
- document which checks are intentionally deferred or external to CI.

Out of scope:

- requiring GitHub Project status changes from CI,
- implementing branch protection through repository code,
- adding broad automation that depends on permissions not already available to
  workflow runs.

## CI Behavior

The local and remote verification paths should use the same commands whenever
possible:

```sh
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm test:e2e
```

GitHub Actions should fail on dependency installation failures, formatting
issues, lint errors, test failures, coverage threshold failures, build errors,
and Playwright failures. Workflow step names should be clear enough that a
reviewer can understand which gate failed without opening every log section.

Playwright should run through a Vite server in CI with reasonable timeouts and
failure artifacts. The browser setup should optimize for reliability before
coverage breadth.

Repository-specific rules should live in versioned scripts where practical. The
workflow should call those scripts rather than embedding complex validation
logic directly in YAML.

## Error Handling

CI failures should be actionable:

- dependency failures point to lockfile or package manager problems,
- format failures tell the contributor to run `pnpm format:check` and format
  touched files as needed,
- lint failures point to ESLint output,
- test failures point to Vitest output,
- coverage failures report the threshold that failed,
- build failures report TypeScript or Vite errors,
- Playwright failures preserve enough artifact data to diagnose the broken
  page or interaction.

If a validation rule depends on GitHub metadata that is not reliably available,
the rule should stay documented as a follow-up instead of becoming a flaky CI
gate.

## Acceptance Criteria

The complete CI regression-control line is done when:

- CI runs for pull requests and pushes to `main`.
- Existing repository checks run in CI.
- Vitest coverage runs in CI and enforces explicit initial thresholds.
- Playwright runs at least one browser smoke test against the app.
- Selected repository-specific rules run from versioned scripts where reliable.
- CI checks are reproducible locally with documented commands.
- Documentation explains what is required, what is deferred, and why.
- Any work not included in the first issue is tracked as follow-up roadmap
  scope rather than hidden inside the initial PR.

## Verification

Automated verification should include the relevant commands for each issue:

```sh
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
pnpm test:e2e
```

Manual verification should confirm:

- a pull request or test branch shows clearly named CI checks,
- each failed check is understandable from the Actions UI,
- coverage output is visible in logs or artifacts,
- Playwright failure artifacts are available when an e2e run fails,
- local reproduction commands match the CI steps.

## Open Decisions

- The exact initial coverage thresholds should be chosen during Issue 1 after
  measuring the current baseline.
- The first Playwright smoke interaction should be chosen during Issue 2 based
  on the most stable Phase 1 user flow.
- The exact custom rules in Issue 3 should be limited to validations that can
  run reliably in GitHub Actions without fragile API or permissions
  assumptions.
