# CI Base And Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first CI gate for pull requests and `main` pushes, including existing repo checks and a modest Vitest coverage baseline.

**Architecture:** Keep CI behavior thin and repository-owned: GitHub Actions installs with the locked `pnpm` version and calls package scripts instead of embedding validation logic in YAML. Coverage is configured in the existing Vite/Vitest config and exposed through a `test:coverage` script so local and remote verification use the same command. Documentation records the required checks and explicitly leaves Playwright and custom PR metadata rules to later issues.

**Tech Stack:** GitHub Actions, Node.js 22, pnpm 10.27.0, Vite, Vitest coverage with V8, ESLint, Prettier, TypeScript.

---

### File Structure

- Modify `package.json`: add `test:coverage` and the Vitest V8 coverage provider dev dependency.
- Modify `pnpm-lock.yaml`: update automatically through `pnpm add -D @vitest/coverage-v8@^3.0.0`.
- Modify `vite.config.ts`: configure Vitest coverage with explicit low initial thresholds.
- Modify `.gitignore`: ignore generated coverage output.
- Create `.github/workflows/ci.yml`: run the CI checks on pull requests and pushes to `main`.
- Modify `docs/roadmap/roadmap-process.md`: document the required CI checks and local reproduction commands.

### Execution Prerequisite

Before implementing this plan, confirm there is a ready roadmap issue for "CI base and coverage", create a branch named with that issue number and the suffix `ci-base-coverage`, and move that issue to `In Progress` according to `AGENTS.md`. For issue 123, the branch name would be `codex/123-ci-base-coverage`.

### Task 1: Add Vitest Coverage Script And Config

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `vite.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Confirm coverage is not available yet**

Run:

```bash
pnpm test:coverage
```

Expected: FAIL with a pnpm message that `test:coverage` is missing.

- [ ] **Step 2: Add the coverage provider dependency**

Run:

```bash
pnpm add -D @vitest/coverage-v8@^3.0.0
```

Expected: `package.json` and `pnpm-lock.yaml` are updated, and `@vitest/coverage-v8` appears under `devDependencies`.

- [ ] **Step 3: Add the coverage script**

Update the `scripts` block in `package.json` to exactly this order:

```json
"scripts": {
  "dev": "vite",
  "tauri": "tauri",
  "build": "tsc --noEmit && vite build",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "validate:commit-message": "node scripts/validate-commit-message.mjs",
  "validate:roadmap-issue": "node scripts/validate-roadmap-issue.mjs",
  "lint": "eslint .",
  "format:check": "prettier --check ."
}
```

- [ ] **Step 4: Configure coverage in Vite**

Replace the `test` section in `vite.config.ts` with this block:

```ts
  test: {
    environment: "jsdom",
    exclude: ["node_modules/**", "dist/**", ".pnpm-store/**", "src-tauri/**"],
    globals: true,
    setupFiles: "./src/test/setup.ts",
    coverage: {
      all: true,
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "vite.config.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        branches: 10,
        functions: 10,
        lines: 10,
        statements: 10,
      },
    },
  },
```

Expected: coverage includes production `src` TypeScript and TSX files, excludes tests and test helpers, and starts with intentionally low 10% global thresholds.

- [ ] **Step 5: Ignore generated coverage output**

Add `coverage/` to `.gitignore` directly after `dist/`:

```gitignore
node_modules/
dist/
coverage/
.pnpm-store/
.playwright-cli/
output/playwright/

src-tauri/target/
src-tauri/gen/

.DS_Store
```

- [ ] **Step 6: Run coverage**

Run:

```bash
pnpm test:coverage
```

Expected: PASS. The output includes a coverage table and no threshold failure below 10%.

If this fails because the current baseline is under 10%, add focused tests for the lowest-covered existing Phase 1 behavior until the 10% threshold passes. Do not lower the threshold below 10%.

- [ ] **Step 7: Run unit tests**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 8: Commit coverage setup**

Run:

```bash
pnpm validate:commit-message -- --message "test: add vitest coverage baseline"
git add package.json pnpm-lock.yaml vite.config.ts .gitignore
git commit -m "test: add vitest coverage baseline"
```

Expected: commit succeeds.

### Task 2: Add GitHub Actions CI Workflow

**Files:**

- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Confirm there is no CI workflow**

Run:

```bash
test ! -e .github/workflows/ci.yml
```

Expected: PASS with no output.

- [ ] **Step 2: Create the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  contents: read

concurrency:
  group: ci-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  checks:
    name: Quality checks
    runs-on: ubuntu-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10.27.0

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Check formatting
        run: pnpm format:check

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

      - name: Coverage
        run: pnpm test:coverage

      - name: Build
        run: pnpm build
```

- [ ] **Step 3: Validate workflow YAML formatting through Prettier**

Run:

```bash
pnpm format:check
```

Expected: PASS. Prettier accepts `.github/workflows/ci.yml`.

- [ ] **Step 4: Run the CI commands locally in workflow order**

Run:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 5: Commit the workflow**

Run:

```bash
pnpm validate:commit-message -- --message "ci: add base quality workflow"
git add .github/workflows/ci.yml
git commit -m "ci: add base quality workflow"
```

Expected: commit succeeds.

### Task 3: Document Required CI Checks

**Files:**

- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Add the CI section**

Insert this section before `## Later Automation` in `docs/roadmap/roadmap-process.md`:

```md
## Required CI Checks

Pull requests and pushes to `main` run the base CI workflow.

The base workflow is intentionally limited to checks that are reproducible from
repository-owned commands:

- `pnpm install --frozen-lockfile`
- `pnpm format:check`
- `pnpm lint`
- `pnpm test`
- `pnpm test:coverage`
- `pnpm build`

Agents should run the same commands locally before opening a pull request when
the current issue touches code, build configuration, tests, or documentation.

The initial coverage thresholds are deliberately modest. They create a floor for
regression control before Phase 2, not a final quality target. Raise thresholds
through explicit roadmap work when the test suite has enough breadth to support
stricter gates.

Playwright smoke checks, custom pull request metadata validation, and GitHub
Project automation are separate roadmap issues. Do not hide those changes inside
the base CI pull request.
```

- [ ] **Step 2: Run documentation formatting check**

Run:

```bash
pnpm format:check
```

Expected: PASS.

- [ ] **Step 3: Commit documentation**

Run:

```bash
pnpm validate:commit-message -- --message "docs: document required ci checks"
git add docs/roadmap/roadmap-process.md
git commit -m "docs: document required ci checks"
```

Expected: commit succeeds.

### Task 4: Final Verification And PR Handoff

**Files:**

- No file edits expected.

- [ ] **Step 1: Run full automated verification**

Run:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 2: Inspect changed files**

Run:

```bash
git status --short
git log --oneline origin/main..HEAD
```

Expected: working tree is clean. The branch contains the coverage, workflow, and documentation commits.

- [ ] **Step 3: Prepare product-owner manual verification instructions**

Use this text in the implementation closeout before opening the PR:

```md
Manual verification:

- Open the pull request's Actions run.
- Confirm the `CI / Quality checks` job appears.
- Confirm the job has clearly named steps for install, format, lint, test, coverage, and build.
- Confirm the coverage step prints a coverage table and enforces the configured 10% global thresholds.
- Confirm no Playwright or custom PR metadata checks are expected in this PR; those are follow-up roadmap scope.
```

- [ ] **Step 4: Fill the PR template**

Use this PR body:

```md
## Summary

- Added the base GitHub Actions CI workflow for PRs and pushes to `main`.
- Added a `test:coverage` script with a modest Vitest coverage baseline.
- Documented the required base CI checks and deferred Playwright/custom metadata gates.

## Linked issue

Use `Closes #` followed by the confirmed roadmap issue number.

## Verification

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm test:coverage`
- [ ] `pnpm build`

## Screenshots / video

Not applicable; this PR adds CI and coverage infrastructure without UI changes.

## Notes

Playwright smoke checks and custom pull request metadata validation remain follow-up roadmap work.
```

Do not open the PR until the linked issue line contains the confirmed roadmap issue number.
