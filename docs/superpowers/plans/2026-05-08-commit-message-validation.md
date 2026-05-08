# Commit Message Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repository-owned commit-message validator and document the agent rule so every commit can follow a consistent Conventional Commit subset now and be validated by CI later.

**Architecture:** Add one focused Node.js ESM validator under `scripts/` that exports pure validation helpers and a small CLI. The CLI supports either direct message validation or range validation through `git log --format=%s`, matching the existing `validate-roadmap-issue` script style. Documentation updates make the rule operational without adding hooks or CI yet.

**Tech Stack:** Node.js ESM scripts, Vitest, Git CLI, pnpm scripts, Markdown documentation.

---

### File Structure

- Create `scripts/validate-commit-message.mjs`: owns allowed commit types, vague summary blocking, message validation, argument parsing, range subject collection, and CLI behavior.
- Create `scripts/validate-commit-message.test.mjs`: covers pure validation and CLI/range behavior with Vitest.
- Modify `package.json`: adds `validate:commit-message`.
- Modify `AGENTS.md`: adds an operational rule requiring agents to validate intended commit messages before committing.
- Modify `docs/roadmap/roadmap-process.md`: documents the repository-wide commit message convention and future per-commit CI intent.

### Task 1: Add Commit Message Validator Tests

**Files:**

- Create: `scripts/validate-commit-message.test.mjs`

- [ ] **Step 1: Write the failing tests**

Create `scripts/validate-commit-message.test.mjs`:

```js
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  collectCommitSubjects,
  parseArgs,
  validateCommitMessage,
} from "./validate-commit-message.mjs";

describe("validateCommitMessage", () => {
  it.each(["feat", "fix", "docs", "test", "refactor", "style", "chore"])(
    "accepts %s commit messages",
    (type) => {
      expect(validateCommitMessage(`${type}: add validation rules`)).toEqual(
        [],
      );
    },
  );

  it("validates only the first line of a multi-line commit message", () => {
    expect(
      validateCommitMessage(`docs: add commit message rules

Additional body text can explain context.`),
    ).toEqual([]);
  });

  it("rejects messages without a conventional type and summary", () => {
    expect(validateCommitMessage("update")).toContain(
      'Commit subject must match "type: summary".',
    );
  });

  it("rejects unknown commit types", () => {
    expect(validateCommitMessage("build: add validator")).toContain(
      'Commit type "build" is not allowed. Allowed types: feat, fix, docs, test, refactor, style, chore.',
    );
  });

  it("rejects an empty summary", () => {
    expect(validateCommitMessage("feat: ")).toContain(
      "Commit summary must not be empty.",
    );
  });

  it("rejects a summary ending with a period", () => {
    expect(validateCommitMessage("docs: add commit rules.")).toContain(
      "Commit summary must not end with a period.",
    );
  });

  it.each(["update", "changes", "fix stuff", "misc"])(
    "rejects vague summary %s",
    (summary) => {
      expect(validateCommitMessage(`chore: ${summary}`)).toContain(
        `Commit summary "${summary}" is too vague.`,
      );
    },
  );
});

describe("parseArgs", () => {
  it("parses message mode", () => {
    expect(parseArgs(["--message", "docs: add rules"])).toEqual({
      message: "docs: add rules",
      range: undefined,
      unknownArg: undefined,
    });
  });

  it("parses range mode", () => {
    expect(parseArgs(["--range", "origin/main..HEAD"])).toEqual({
      message: undefined,
      range: "origin/main..HEAD",
      unknownArg: undefined,
    });
  });

  it("captures unknown arguments", () => {
    expect(parseArgs(["--bad"])).toEqual({
      message: undefined,
      range: undefined,
      unknownArg: "--bad",
    });
  });
});

describe("collectCommitSubjects", () => {
  it("returns every commit subject in the provided range", () => {
    const repoDir = mkdtempSync(join(tmpdir(), "commit-message-validator-"));

    try {
      execFileSync("git", ["init"], { cwd: repoDir, stdio: "ignore" });
      execFileSync("git", ["config", "user.name", "Validator Test"], {
        cwd: repoDir,
      });
      execFileSync("git", ["config", "user.email", "validator@example.test"], {
        cwd: repoDir,
      });
      execFileSync("git", ["commit", "--allow-empty", "-m", "docs: seed"], {
        cwd: repoDir,
        stdio: "ignore",
      });
      const base = execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: repoDir,
        encoding: "utf8",
      }).trim();
      execFileSync("git", ["commit", "--allow-empty", "-m", "feat: add one"], {
        cwd: repoDir,
        stdio: "ignore",
      });
      execFileSync("git", ["commit", "--allow-empty", "-m", "fix: add two"], {
        cwd: repoDir,
        stdio: "ignore",
      });

      expect(collectCommitSubjects(`${base}..HEAD`, { cwd: repoDir })).toEqual([
        "fix: add two",
        "feat: add one",
      ]);
    } finally {
      rmSync(repoDir, { recursive: true, force: true });
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail for the missing module**

Run:

```bash
pnpm test -- scripts/validate-commit-message.test.mjs
```

Expected: FAIL with an import error for `./validate-commit-message.mjs`.

### Task 2: Implement The Validator CLI

**Files:**

- Create: `scripts/validate-commit-message.mjs`

- [ ] **Step 1: Add the validator implementation**

Create `scripts/validate-commit-message.mjs`:

```js
/* global console, process */

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ALLOWED_TYPES = [
  "feat",
  "fix",
  "docs",
  "test",
  "refactor",
  "style",
  "chore",
];

const VAGUE_SUMMARIES = new Set(["update", "changes", "fix stuff", "misc"]);

const USAGE = `Usage: pnpm validate:commit-message -- (--message "<message>" | --range <revision-range>)

Validates commit subjects against the repository Conventional Commit subset.

Required arguments:
  --message <message>       Validate one commit message. Only the first line is checked.
  --range <revision-range>  Validate every commit subject from git log --format=%s <revision-range>.`;

export function validateCommitMessage(message) {
  const errors = [];
  const subject = String(message ?? "").split(/\r?\n/, 1)[0];
  const match = subject.match(/^([a-z]+):\s*(.*)$/);

  if (!match) {
    errors.push('Commit subject must match "type: summary".');
    return errors;
  }

  const [, type, summary] = match;

  if (!ALLOWED_TYPES.includes(type)) {
    errors.push(
      `Commit type "${type}" is not allowed. Allowed types: ${ALLOWED_TYPES.join(", ")}.`,
    );
  }

  const normalizedSummary = summary.trim();

  if (normalizedSummary.length === 0) {
    errors.push("Commit summary must not be empty.");
    return errors;
  }

  if (normalizedSummary.endsWith(".")) {
    errors.push("Commit summary must not end with a period.");
  }

  if (VAGUE_SUMMARIES.has(normalizedSummary.toLowerCase())) {
    errors.push(`Commit summary "${normalizedSummary}" is too vague.`);
  }

  return errors;
}

export function collectCommitSubjects(range, { cwd = process.cwd() } = {}) {
  const output = execFileSync("git", ["log", "--format=%s", range], {
    cwd,
    encoding: "utf8",
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseArgs(args) {
  const parsed = {
    message: undefined,
    range: undefined,
    unknownArg: undefined,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") {
      continue;
    } else if (arg === "--message") {
      parsed.message = args[index + 1];
      index += 1;
    } else if (arg === "--range") {
      parsed.range = args[index + 1];
      index += 1;
    } else {
      parsed.unknownArg = arg;
    }
  }

  return parsed;
}

function validateSubjects(subjects) {
  const errors = [];

  for (const subject of subjects) {
    const subjectErrors = validateCommitMessage(subject);
    for (const error of subjectErrors) {
      errors.push(`${subject}: ${error}`);
    }
  }

  return errors;
}

function runCli() {
  const { message, range, unknownArg } = parseArgs(process.argv.slice(2));

  if (unknownArg || (!message && !range) || (message && range)) {
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }

  let errors;
  if (message) {
    errors = validateSubjects([message]);
  } else {
    let subjects;
    try {
      subjects = collectCommitSubjects(range);
    } catch (error) {
      console.error(`Unable to read commit range "${range}": ${error.message}`);
      process.exitCode = 2;
      return;
    }

    errors = validateSubjects(subjects);
  }

  if (errors.length > 0) {
    console.error("Commit message format is invalid:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Commit message format is valid.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCli();
}
```

- [ ] **Step 2: Run focused tests**

Run:

```bash
pnpm test -- scripts/validate-commit-message.test.mjs
```

Expected: PASS for all tests in `scripts/validate-commit-message.test.mjs`.

- [ ] **Step 3: Commit validator and tests**

Before committing, validate the intended commit message:

```bash
node scripts/validate-commit-message.mjs --message "test: add commit message validator"
```

Expected: `Commit message format is valid.`

Commit:

```bash
git add scripts/validate-commit-message.mjs scripts/validate-commit-message.test.mjs
git commit -m "test: add commit message validator"
```

### Task 3: Wire The Package Script

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Add the pnpm script**

Modify the `scripts` object in `package.json` so it includes:

```json
{
  "validate:commit-message": "node scripts/validate-commit-message.mjs"
}
```

Keep the existing script names unchanged.

- [ ] **Step 2: Verify the new command accepts a valid message**

Run:

```bash
pnpm validate:commit-message -- --message "chore: wire commit message validator"
```

Expected: `Commit message format is valid.`

- [ ] **Step 3: Verify the new command rejects an invalid message**

Run:

```bash
pnpm validate:commit-message -- --message "update"
```

Expected: exit code `1` and output containing `Commit subject must match "type: summary".`

- [ ] **Step 4: Commit package script**

Before committing, validate the intended commit message:

```bash
pnpm validate:commit-message -- --message "chore: add commit message validation script"
```

Expected: `Commit message format is valid.`

Commit:

```bash
git add package.json
git commit -m "chore: add commit message validation script"
```

### Task 4: Document The Commit Rule

**Files:**

- Modify: `AGENTS.md`
- Modify: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Add the agent operating rule**

Add this section to `AGENTS.md` before `## Pull Requests`:

```md
## Commit Messages

- Agents must use Conventional Commit-style messages for every commit they create: `type: summary`.
- Allowed types are `feat`, `fix`, `docs`, `test`, `refactor`, `style`, and `chore`.
- The summary must describe the actual change, must not be empty, must not end with a period, and must not be a vague placeholder such as `update`, `changes`, `fix stuff`, or `misc`.
- Before running `git commit`, validate the intended message with `pnpm validate:commit-message -- --message "<type>: <summary>"`.
- Do not rely on the pull request title to fix unclear commit history. Future CI is expected to validate each commit individually.
```

- [ ] **Step 2: Add the roadmap process rule**

Add this section to `docs/roadmap/roadmap-process.md` before `## Pull Request Contract` or, if that heading is not present, before `## Agent Cycle`:

```md
## Commit Message Rules

All commits should use the repository Conventional Commit subset:

```text
type: summary
```

Allowed types are `feat`, `fix`, `docs`, `test`, `refactor`, `style`, and `chore`.
The summary should be concrete, should describe the actual change, should not
end with a period, and should not be a vague placeholder such as `update`,
`changes`, `fix stuff`, or `misc`.

Before creating a commit, agents should validate the intended message:

```bash
pnpm validate:commit-message -- --message "docs: add commit message rules"
```

The validator also supports revision ranges for the future CI pass:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

The future CI policy should validate each commit individually rather than only
the pull request title or final squash commit.
```

- [ ] **Step 3: Run documentation format check**

Run:

```bash
pnpm format:check
```

Expected: PASS. If `node_modules` is missing, install dependencies or report that the check could not run because `prettier` is unavailable.

- [ ] **Step 4: Commit documentation**

Before committing, validate the intended commit message:

```bash
pnpm validate:commit-message -- --message "docs: document commit message rules"
```

Expected: `Commit message format is valid.`

Commit:

```bash
git add AGENTS.md docs/roadmap/roadmap-process.md
git commit -m "docs: document commit message rules"
```

### Task 5: Final Verification

**Files:**

- Inspect: `scripts/validate-commit-message.mjs`
- Inspect: `scripts/validate-commit-message.test.mjs`
- Inspect: `package.json`
- Inspect: `AGENTS.md`
- Inspect: `docs/roadmap/roadmap-process.md`

- [ ] **Step 1: Run focused validator tests**

Run:

```bash
pnpm test -- scripts/validate-commit-message.test.mjs
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Run build**

Run:

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Run documentation formatting check**

Run:

```bash
pnpm format:check
```

Expected: PASS.

- [ ] **Step 6: Validate good and bad example messages**

Run:

```bash
pnpm validate:commit-message -- --message "docs: add commit message rules"
```

Expected: PASS with `Commit message format is valid.`

Run:

```bash
pnpm validate:commit-message -- --message "update"
```

Expected: FAIL with `Commit subject must match "type: summary".`

- [ ] **Step 7: Validate the branch commit range**

Run:

```bash
pnpm validate:commit-message -- --range origin/main..HEAD
```

Expected: PASS for all implementation branch commits. If this range includes the design commit, it should also pass because `docs: design commit message validation` follows the rule.

- [ ] **Step 8: Confirm final Git state**

Run:

```bash
git status --short
git log --oneline --max-count=6
```

Expected: working tree is clean, and recent commits include the design spec plus validator, package script, and documentation commits.

## Self-Review

- Spec coverage: the plan covers the validator script, package command, agent docs, roadmap docs, message mode, range mode, blocked vague summaries, no hooks, no CI, no dependencies, and future per-commit CI usage.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: the planned exported names are `validateCommitMessage`, `collectCommitSubjects`, and `parseArgs`, and tests import those exact names.
