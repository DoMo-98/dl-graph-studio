# CI Custom Rules And Documentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reliable pull request commit message validation to CI and document enforced versus deferred roadmap checks.

**Architecture:** Keep policy logic in repository-owned scripts. GitHub Actions should only check out the correct pull request head commit, provide enough git history for range validation, and call `pnpm validate:commit-message -- --range <base>..HEAD` on pull request events. Documentation owns the explanation of local reproduction commands and metadata-dependent checks that remain manual or deferred.

**Tech Stack:** GitHub Actions, `pnpm@10.27.0`, Node.js 22, existing `scripts/validate-commit-message.mjs`, Markdown documentation.

---

## File Structure

- Modify `.github/workflows/ci.yml`: configure checkout for pull request range validation and add a clearly named custom validation step that calls the existing commit message script only on pull request events.
- Modify `docs/roadmap/roadmap-process.md`: update the Required CI Checks and Later Automation sections to include commit range validation as enforced for PRs and metadata validation as deferred/manual.
- Use existing `scripts/validate-commit-message.mjs`: no code changes expected because `--range` behavior already exists and is tested.

## Task 1: Add Pull Request Commit Validation To CI

**Files:**

- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Inspect current workflow**

Run:

```bash
sed -n '1,220p' .github/workflows/ci.yml
```

Expected: workflow runs on `pull_request` and `push`, uses `actions/checkout@v6`, installs dependencies, runs format/lint/test/coverage/e2e/build, and does not yet call `pnpm validate:commit-message`.

- [ ] **Step 2: Update checkout to use full history and PR head SHA**

Change the checkout step in `.github/workflows/ci.yml` from:

```yaml
- name: Checkout repository
  uses: actions/checkout@v6
```

to:

```yaml
- name: Checkout repository
  uses: actions/checkout@v6
  with:
    fetch-depth: 0
    ref: ${{ github.event_name == 'pull_request' && github.event.pull_request.head.sha || github.sha }}
```

This avoids validating the synthetic pull request merge commit and ensures `github.event.pull_request.base.sha..HEAD` can be read.

- [ ] **Step 3: Add the custom validation step after dependency install**

Insert this step immediately after `Install dependencies` and before `Check formatting`:

```yaml
- name: Validate pull request commit messages
  if: github.event_name == 'pull_request'
  run: pnpm validate:commit-message -- --range ${{ github.event.pull_request.base.sha }}..HEAD
```

Expected: pull request runs validate each PR commit subject. Pushes to `main` skip this custom validation step while retaining the rest of the quality checks.

- [ ] **Step 4: Check the workflow diff**

Run:

```bash
git diff -- .github/workflows/ci.yml
```

Expected diff includes only the checkout `with:` block and the `Validate pull request commit messages` step.

- [ ] **Step 5: Run the local commit range validator**

Run:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

Expected: `Commit message format is valid.`

- [ ] **Step 6: Commit the CI workflow change**

Run:

```bash
pnpm validate:commit-message -- --message "chore: validate pull request commit messages"
git add .github/workflows/ci.yml
git commit -m "chore: validate pull request commit messages"
```

Expected: commit succeeds with only `.github/workflows/ci.yml` staged.

## Task 2: Document Enforced And Deferred CI Rules

**Files:**

- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Inspect the current CI documentation**

Run:

```bash
sed -n '230,290p' docs/roadmap/roadmap-process.md
```

Expected: Required CI Checks lists install, format, lint, test, coverage, e2e, build; it mentions custom PR metadata validation and GitHub Project automation as separate roadmap issues.

- [ ] **Step 2: Replace the Required CI Checks section body**

In `docs/roadmap/roadmap-process.md`, replace the body under `## Required CI Checks` up to but not including `## Later Automation` with:

````markdown
Pull requests and pushes to `main` run the repository CI workflow. The workflow is limited to repository-owned commands so required checks stay auditable and reproducible within this repository.

Pull requests run these enforced checks:

```bash
pnpm install --frozen-lockfile
pnpm validate:commit-message -- --range <base>..HEAD
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```
````

Pushes to `main` run the same quality checks except pull request commit range validation:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm test:e2e
pnpm build
```

For local branch verification before opening a pull request, agents and contributors should use `origin/main` as the usual base:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

When reviewing a branch against a different base, replace `origin/main` with the actual base revision.

Agents should run the same commands locally before opening pull requests when the issue touches code, build configuration, tests, or documentation.

Coverage thresholds are a modest initial regression floor, not the final quality target for the product.

`pnpm test:e2e` runs the Playwright functional regression suite for the current core editor surface. It covers editor load, node selection, inspector updates, primitive parameter editing, valid and invalid connection behavior, connection panel behavior, connection deletion, and stable project file export/reset/import behavior. It is not visual snapshot testing, cross-browser coverage, Tauri desktop automation, or exhaustive future Phase 2 workflow coverage.

Pull request issue linkage, roadmap issue readiness, and GitHub Project status remain required process checks, but they are not enforced by repository CI. They depend on live GitHub metadata, Project permissions, and product-owner workflow state that are not reliably available to ordinary workflow runs. Agents must continue to verify those checks through the roadmap workflow before opening or updating pull requests.

````

- [ ] **Step 3: Replace the Later Automation list**

In `docs/roadmap/roadmap-process.md`, replace the bullet list under `## Later Automation` with:

```markdown
After more real PRs use this process, consider automating repeated checks that require live GitHub metadata or repository settings:

- Move issues between project states automatically.
- Validate that each PR links a roadmap issue.
- Validate that linked roadmap issues have the expected contract and readiness state.
- Require completed PR checklist items.
- Configure branch protection to require CI checks before merge.
- Generate issues from roadmap planning documents.
- Add a standard command for asking the agent to propose the next task.
````

- [ ] **Step 4: Check the documentation diff**

Run:

```bash
git diff -- docs/roadmap/roadmap-process.md
```

Expected: docs now distinguish enforced PR CI, push CI, local commit range reproduction, and deferred metadata automation.

- [ ] **Step 5: Run documentation formatting check**

Run:

```bash
pnpm format:check
```

Expected: `All matched files use Prettier code style!`

- [ ] **Step 6: Commit the documentation change**

Run:

```bash
pnpm validate:commit-message -- --message "docs: document ci custom validation"
git add docs/roadmap/roadmap-process.md
git commit -m "docs: document ci custom validation"
```

Expected: commit succeeds with only `docs/roadmap/roadmap-process.md` staged.

## Task 3: Run Full Issue Verification

**Files:**

- No new file edits expected.

- [ ] **Step 1: Confirm working tree state before verification**

Run:

```bash
git status --short --branch
```

Expected: current branch is `codex/56-ci-custom-rules-docs` and there are no unstaged or staged changes.

- [ ] **Step 2: Run lockfile install**

Run:

```bash
pnpm install --frozen-lockfile
```

Expected: install completes without lockfile changes.

- [ ] **Step 3: Run format check**

Run:

```bash
pnpm format:check
```

Expected: Prettier reports all matched files use Prettier code style.

- [ ] **Step 4: Run lint**

Run:

```bash
pnpm lint
```

Expected: ESLint exits successfully.

- [ ] **Step 5: Run unit and component tests**

Run:

```bash
pnpm test
```

Expected: Vitest exits successfully.

- [ ] **Step 6: Run coverage**

Run:

```bash
pnpm test:coverage
```

Expected: Vitest coverage exits successfully and enforces configured thresholds.

- [ ] **Step 7: Run Playwright functional regression**

Run:

```bash
pnpm test:e2e
```

Expected: Playwright exits successfully.

- [ ] **Step 8: Run build**

Run:

```bash
pnpm build
```

Expected: TypeScript and Vite build exit successfully.

- [ ] **Step 9: Run commit range validation**

Run:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

Expected: `Commit message format is valid.`

- [ ] **Step 10: Record manual verification instructions for the PR**

Use these instructions in the PR body and in the product-owner closeout:

```markdown
Manual verification:

1. Open the GitHub Actions run for this pull request.
2. Confirm the `CI / Quality checks` job includes `Validate pull request commit messages`.
3. Confirm that step passes for this branch's valid Conventional Commit subjects.
4. To verify the failure path, inspect the validator output locally with an invalid subject:
   `pnpm validate:commit-message -- --message "bad commit subject"`.
5. Confirm `docs/roadmap/roadmap-process.md` separates enforced CI checks from deferred metadata automation for PR linkage, issue readiness, and GitHub Project status.
```

Expected: manual instructions describe what to test, where to test it, expected results, and known deferred metadata checks.

## Task 4: Final Readiness Check

**Files:**

- No new file edits expected.

- [ ] **Step 1: Review final diff from origin/main**

Run:

```bash
git diff --stat origin/main..HEAD
git diff origin/main..HEAD -- .github/workflows/ci.yml docs/roadmap/roadmap-process.md docs/superpowers/specs/2026-05-10-ci-custom-rules-documentation-design.md
```

Expected: diff contains the design spec commit, CI workflow custom validation, and roadmap process documentation updates. No unrelated files changed.

- [ ] **Step 2: Confirm commit history**

Run:

```bash
git log --oneline origin/main..HEAD
```

Expected commits include:

```text
docs: add ci custom rules design
chore: validate pull request commit messages
docs: document ci custom validation
```

- [ ] **Step 3: Prepare PR summary**

Use this summary structure when opening the PR:

```markdown
## Summary

- adds pull request commit message validation to CI using the existing repository validator
- documents required PR and push checks plus local reproduction commands
- documents PR linkage, issue readiness, and GitHub Project status as required process checks that remain outside repository CI

## Verification

- pnpm install --frozen-lockfile
- pnpm format:check
- pnpm lint
- pnpm test
- pnpm test:coverage
- pnpm test:e2e
- pnpm build
- pnpm validate:commit-message -- --range origin/main..HEAD

Manual verification:

- Open this PR's GitHub Actions run and confirm `Validate pull request commit messages` appears in `CI / Quality checks`.
- Confirm the custom validation step passes for this branch.
- Confirm the roadmap process docs distinguish enforced CI checks from deferred metadata automation.

Closes #56
```

Expected: PR summary links issue #56 and includes automated plus manual verification.
