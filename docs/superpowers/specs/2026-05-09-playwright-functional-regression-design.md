# Playwright Functional Regression Design

## Context

Issue #55 originally described a narrow Playwright smoke check for the Vite
editor. In the planning thread for #55, the product owner approved expanding
that issue on 2026-05-09 so the pull request covers a functional Playwright
regression suite for the core capabilities currently available in the app. The
live issue must record this scope change before implementation begins.

The repository already has the base CI workflow from #54. CI runs dependency
installation, formatting, linting, Vitest tests, Vitest coverage, and build
checks. The app is a Vite, React, TypeScript editor using React Flow for the
canvas. Existing Vitest coverage exercises editor state and project-file logic,
but there is no browser-level Playwright coverage yet.

## Goal

Add Playwright as a functional regression gate for the current Phase 1 editor
surface. The suite should verify that the real app boots in a browser and that
the main user-facing editor capabilities still work together.

This issue is no longer a minimum smoke-test issue. It should remain bounded
and reviewable, but it should cover the core functionality that exists today:
editor load, node selection, inspector behavior, parameter editing, valid and
invalid connections, connection panel behavior, connection deletion, and stable
project file workflows when practical.

## Scope

- Install and configure Playwright for the Vite app.
- Add a `pnpm test:e2e` script.
- Configure Playwright to start the Vite dev server for local and CI runs.
- Add Chromium Playwright coverage for the editor's core functional flows.
- Run the Playwright suite in CI after the build-independent quality checks.
- Preserve useful failure artifacts, including traces and screenshots.
- Document the local command, CI gate, coverage intent, and known limits.
- Update issue #55 so its live roadmap scope matches this approved design.

## Functional Coverage

The Playwright suite should cover these flows:

- Editor load: the workspace, graph canvas, primitive nodes, composite node, and
  empty inspector state render.
- Node selection: a primitive node and the composite node can be selected, and
  the inspector updates to the selected node.
- Inspector editing: editable primitive parameters can be changed and remain
  associated with the correct node while switching between nodes.
- Valid connections: a valid connection such as `Tensor -> Neuron` can be
  created and appears in the graph connections panel.
- Invalid connections: self-connections, duplicate connections, and connections
  into the input `Tensor` node are rejected with visible feedback.
- Connection panel: the panel can be expanded and collapsed when connections
  exist.
- Connection deletion: a created connection can be removed without breaking the
  remaining editor state.
- Project file workflows: export, reset, and import should be attempted with
  Playwright's download and file-upload APIs. They may be omitted from the
  required Playwright pass only if a concrete browser or CI limitation makes the
  flow unreliable after implementation attempts; the PR must document the error,
  the skipped assertion, and the existing Vitest fallback coverage.

## Test Architecture

Use a standard `playwright.config.ts` at the repository root. The config should
start the Vite dev server through Playwright `webServer`, reuse the server when
appropriate, and run against Chromium first for reliability. Cross-browser
matrices are intentionally out of scope unless a concrete bug requires them.

Place tests under a focused e2e directory such as `tests/e2e/`. Keep helpers
small and local to the Playwright tests. Good helper boundaries include:

- selecting an editor node by accessible name,
- starting or completing a connection,
- asserting visible toast or validation feedback,
- opening project actions,
- creating or uploading a project fixture if import/export is stable.

Tests should prefer accessible roles, labels, and user-visible text over
implementation-specific CSS selectors. `data-testid` may be used only where the
existing UI has no stable accessible surface or where React Flow rendering makes
accessible lookup impractical.

## CI Behavior

The CI workflow should install Playwright browsers and run `pnpm test:e2e` after
formatting, linting, Vitest tests, and Vitest coverage. `pnpm build` should run
after Playwright, matching the repository's current verification order for this
issue. The expected local and CI command set is:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

The Playwright step should fail the workflow when a core regression is detected
and should retain enough artifacts to diagnose the failure without reproducing
it locally first.

## Error Handling

Playwright failures should be actionable. Assertions should explain which user
flow broke rather than only checking incidental DOM structure. Failure artifacts
should include traces and screenshots on failure. Video can be enabled on
failure if it does not make the workflow too noisy.

If export, reset, and import cannot be automated reliably because of browser
download or file-picker constraints after using Playwright's download and
file-upload APIs, the implementation should:

- keep the unstable project-file assertions out of the mandatory Playwright pass,
- document the skipped browser-level coverage, error, and fallback in the
  roadmap docs or PR notes,
- rely on existing Vitest coverage for project-file behavior,
- avoid adding brittle Playwright workarounds.

## Out Of Scope

- Visual snapshot testing.
- Exhaustive coverage of every Phase 1 edge case.
- Cross-browser Playwright matrices without a concrete need.
- Tauri desktop automation.
- Custom pull request or commit metadata validation.
- Raising Vitest coverage thresholds.
- GitHub Project automation.
- New product behavior or UI redesign.

## Acceptance Criteria

- `pnpm test:e2e` runs the Playwright functional regression suite locally.
- CI installs required Playwright browser dependencies and runs `pnpm test:e2e`.
- The suite verifies editor load, node selection, inspector updates, and
  primitive parameter editing.
- The suite verifies valid connection creation and connection panel behavior.
- The suite verifies self-connection feedback, duplicate-connection feedback,
  and connection-into-`Tensor` feedback.
- The suite verifies connection deletion.
- Export, reset, and import are automated through Playwright download/upload APIs
  when stable, or the concrete browser/CI limitation and Vitest fallback are
  documented explicitly.
- Playwright failure artifacts are preserved in CI.
- Documentation explains the local command, CI gate, and intentionally bounded
  scope.
- Issue #55 reflects the approved expanded scope before implementation begins.

## Verification

Automated verification for the implementation should run:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

Manual verification should confirm:

- a pull request or test branch Actions run includes a clearly named Playwright
  step,
- a passing run exercises the core editor flows listed above,
- a failing run uploads useful Playwright artifacts,
- documentation distinguishes the functional regression suite from visual,
  cross-browser, Tauri, and future Phase 2 coverage.

## Follow-Up Candidates

Future roadmap issues can deepen coverage after this issue lands:

- visual regression testing for canvas and inspector layout,
- cross-browser Playwright coverage,
- broader project-file workflow coverage if it is not stable in this issue,
- Phase 2 reusable component workflows as those capabilities are built.
