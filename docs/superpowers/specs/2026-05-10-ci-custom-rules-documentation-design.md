# CI Custom Rules And Documentation Design

## Context

Issue #56 completes the CI regression-control sequence before Phase 2 work
expands the shared editor surface. The repository already has a GitHub Actions
workflow that runs dependency installation, formatting, linting, Vitest,
coverage, Playwright functional regression, failure artifact upload, and build
checks.

The repository also already owns a commit message validator at
`scripts/validate-commit-message.mjs`. The validator supports two modes:

- `--message "<message>"` for a single subject, used before creating commits.
- `--range <base>..HEAD` for validating each subject in a git revision range.

Roadmap issue validation is also repository-owned, but it validates a local
issue title and body file. It does not validate live GitHub labels, Project
status, linked pull requests, issue readiness, or permissions-backed metadata.

## Goal

Add the reliable repository-specific CI rule that is ready for enforcement now:
commit message validation for pull request commits. Update roadmap process
documentation so contributors and agents can reproduce the required checks
locally and understand which metadata-dependent automation remains manual or
deferred.

## Recommended Approach

Use a narrow CI change that keeps validation logic in repository-owned scripts.
The workflow should calculate the pull request commit range, then call:

```bash
pnpm validate:commit-message -- --range <base>..HEAD
```

The workflow should not embed Conventional Commit parsing or policy rules in
YAML. If range setup needs minor GitHub Actions configuration, the workflow may
handle checkout depth and ref selection, but rule evaluation remains inside the
existing Node script.

Metadata-dependent checks should be documented instead of enforced in this PR.
That includes pull request body linkage, issue contract completeness, issue
readiness labels, and GitHub Project status. Those rules require live GitHub
metadata or Project permissions that are not guaranteed to be reliable from
ordinary repository CI.

## CI Behavior

The custom validation step should run on pull request events targeting `main`,
where GitHub provides a meaningful base SHA for the proposed change. The step
should validate the commits introduced by the pull request rather than the pull
request title or a future squash commit.

Pushes to `main` should continue to run the existing quality checks. Commit
range validation does not need to run for `push` events in this issue because
the roadmap process uses pull requests as the review boundary, and the
acceptance criteria call for pull request commit validation when the range is
reliable.

The workflow should keep step names explicit. A failed commit validation step
should make it clear that the contributor needs to fix commit subjects to match
the repository's Conventional Commit subset.

## Documentation

`docs/roadmap/roadmap-process.md` should describe the final required CI checks
as two groups:

- Enforced repository CI checks:
  - `pnpm install --frozen-lockfile`
  - `pnpm format:check`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm test:coverage`
  - `pnpm test:e2e`
  - `pnpm build`
  - pull request commit message validation with
    `pnpm validate:commit-message -- --range <base>..HEAD`
- Manual or deferred metadata checks:
  - pull requests should still link the roadmap issue with `Closes #<issue>`,
    but CI will not validate that linkage in this issue,
  - roadmap issue readiness and Project status remain operational checks owned
    by the agent workflow and product owner review,
  - GitHub Project automation remains deferred because it depends on Project
    permissions and live GitHub metadata.

The documentation should explain local reproduction commands. For local branch
work, the normal range is:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

When reviewing a different base, contributors can replace `origin/main` with the
actual base revision.

## Error Handling

The existing validator already prints actionable failure output:

- invalid commit subjects are listed under `Commit message format is invalid:`,
- each range failure includes the offending subject,
- unreadable ranges exit separately with an error explaining that the range
  could not be read.

The CI step should rely on that output rather than adding a second layer of
formatting in YAML.

## Testing And Verification

Automated verification should include the issue-required checks:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
pnpm validate:commit-message -- --range <base>..HEAD
```

Manual verification should inspect a pull request or test branch Actions run
and confirm that the custom commit validation step is visible, passes for valid
commit subjects, and reports actionable guidance for invalid subjects.

Documentation verification should confirm that enforced CI checks are separated
from manual or deferred GitHub metadata automation.

## Out Of Scope

This design does not add:

- GitHub Project status automation,
- branch protection configuration,
- PR body or linked-issue validation in CI,
- live roadmap issue readiness validation in CI,
- Playwright setup changes,
- coverage threshold changes,
- Tauri desktop packaging or release builds.

## Acceptance Criteria

- CI validates pull request commit subjects using the existing repository-owned
  commit message validator when the pull request range is reliable.
- Workflow YAML delegates policy evaluation to repository-owned scripts.
- Required checks and local reproduction commands are documented.
- Metadata-dependent checks are explicitly documented as manual or deferred, not
  hidden as missing implementation.
- The implementation stays focused on issue #56 and remains reviewable as a
  small PR.
