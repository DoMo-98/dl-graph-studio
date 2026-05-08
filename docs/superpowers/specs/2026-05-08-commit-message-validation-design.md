# Commit Message Validation Design

## Context

`dl-graph-studio` uses an agent-assisted roadmap workflow where agents make
small commits and pull requests for reviewable roadmap work. Recent commit
history uses Conventional Commit-style messages, but that consistency currently
depends on manual correction by the product owner.

The repository does not currently include commitlint, a commit-message
validator, versioned Git hooks, GitHub Actions, or documented commit-message
rules. Phase 1 is still in progress, and broader CI work is expected after the
phase closes.

## Goal

Add a lightweight, versioned commit-message standard that agents can apply now
and future CI can reuse to validate every commit in a branch.

The first version should:

- make the expected commit format explicit for agents and contributors,
- provide a local validation command before creating commits,
- support validating each commit subject in a Git revision range,
- avoid adding hooks, CI, or third-party dependencies before the broader CI
  effort.

## Recommended Approach

Use a small repository-owned Node.js script:

```bash
pnpm validate:commit-message -- --message "feat: add commit message validator"
pnpm validate:commit-message -- --range origin/main..HEAD
```

The script should validate the first line of a commit message using an initial
Conventional Commit subset:

```text
type: summary
```

Allowed types:

- `feat`
- `fix`
- `docs`
- `test`
- `refactor`
- `style`
- `chore`

The summary must be present, concrete, and not end with a period. The validator
should reject vague summaries such as `update`, `changes`, `fix stuff`, and
`misc`.

Agents must validate the intended commit message before running `git commit`.
Future CI can call the same script with `--range` to validate each commit
individual subject in a pull request branch.

## Scope

Implement the rule through:

- `AGENTS.md`, documenting that agents must use and validate Conventional
  Commit-style messages before committing,
- `docs/roadmap/roadmap-process.md`, documenting the repository-wide commit
  message convention and future CI intent,
- `scripts/validate-commit-message.mjs`, validating one message or every commit
  subject in a provided revision range,
- `package.json`, adding `validate:commit-message`.

## Out Of Scope

This change should not:

- add Husky, commitlint, lefthook, or another hook framework,
- install a `commit-msg` hook,
- add GitHub Actions or required CI checks,
- rewrite existing commit history,
- require issue numbers in individual commit messages,
- change pull request linking rules. PRs should continue to use `Closes #...`
  for issue linkage.

## Command Behavior

The validator should support two mutually exclusive modes:

- `--message "<message>"`: validate the first line of the provided message.
- `--range "<base>..<head>"`: run `git log --format=%s <range>` and validate
  every commit subject returned.

Validation should fail with a non-zero exit code and actionable error messages
when:

- no mode is provided,
- both modes are provided,
- the message does not match `type: summary`,
- the type is not in the allowed list,
- the summary is empty,
- the summary ends with `.`,
- the summary is one of the blocked vague summaries.

Merge commits produced by normal branch synchronization should not be special
cased in the first version. The roadmap workflow already prefers small,
intentional agent commits, and future CI policy can decide whether merge commits
need an exemption.

## Testing

Add focused automated coverage for the validator:

- accepts valid messages for each allowed type,
- rejects unknown types,
- rejects missing summaries,
- rejects period-terminated summaries,
- rejects vague summaries,
- rejects invalid CLI argument combinations,
- validates every subject returned by `--range` in a temporary Git repository.

Manual verification should include:

- running `pnpm validate:commit-message -- --message "docs: add commit message rules"`,
- running a failing message such as
  `pnpm validate:commit-message -- --message "update"`,
- running `pnpm validate:commit-message -- --range origin/main..HEAD` on the
  implementation branch.

## Rationale

A repository-owned validator gives the project an enforceable rule without
premature CI or hook infrastructure. It is simple enough for agents to use
before each commit now and stable enough to become a CI step later when Phase 1
closes.

Documenting the rule alone would still rely on manual correction. Adding hooks
or commitlint now would solve enforcement earlier, but it would introduce
tooling decisions before the planned CI pass. The local validator is the middle
ground: explicit, testable, and reusable.
