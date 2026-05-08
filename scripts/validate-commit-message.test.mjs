import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  collectCommitSubjects,
  parseCommitSubjects,
  parseArgs,
  validateCommitMessage,
} from "./validate-commit-message.mjs";

const cliScriptPath = fileURLToPath(
  new URL("./validate-commit-message.mjs", import.meta.url),
);

describe("validateCommitMessage", () => {
  it("accepts every allowed conventional commit type", () => {
    for (const type of [
      "feat",
      "fix",
      "docs",
      "test",
      "refactor",
      "style",
      "chore",
    ]) {
      expect(validateCommitMessage(`${type}: add useful behavior`)).toEqual([]);
    }
  });

  it("validates only the first line of a multiline message", () => {
    const message = `fix: handle saved graph names

build: this invalid body line is ignored.`;

    expect(validateCommitMessage(message)).toEqual([]);
  });

  it('rejects subjects without "type: summary"', () => {
    expect(validateCommitMessage("update graph editor")).toContain(
      'Commit subject must match "type: summary".',
    );
  });

  it("rejects subjects without a space after the colon", () => {
    expect(validateCommitMessage("feat:add missing space")).toContain(
      'Commit subject must match "type: summary".',
    );
  });

  it("rejects subjects with a tab after the colon", () => {
    expect(validateCommitMessage("feat:\tbad tab")).toContain(
      'Commit subject must match "type: summary".',
    );
  });

  it("rejects subjects with more than one space after the colon", () => {
    expect(validateCommitMessage("feat:  double space")).toContain(
      'Commit subject must match "type: summary".',
    );
  });

  it("rejects unknown conventional commit types", () => {
    expect(validateCommitMessage("build: add local validation")).toContain(
      "Commit type must be one of: feat, fix, docs, test, refactor, style, chore.",
    );
  });

  it("rejects empty summaries", () => {
    expect(validateCommitMessage("feat: ")).toContain(
      "Commit summary must not be empty.",
    );
  });

  it("rejects summaries ending with a period", () => {
    expect(validateCommitMessage("docs: add commit rules.")).toContain(
      "Commit summary must not end with a period.",
    );
  });

  it("rejects vague summaries", () => {
    for (const summary of ["update", "changes", "fix stuff", "misc"]) {
      expect(validateCommitMessage(`chore: ${summary}`)).toContain(
        'Commit summary must be concrete, not "update", "changes", "fix stuff", or "misc".',
      );
    }
  });
});

describe("parseArgs", () => {
  it("parses a message argument", () => {
    expect(parseArgs(["--message", "test: add validator"])).toEqual({
      message: "test: add validator",
      range: undefined,
    });
  });

  it("parses a range argument", () => {
    expect(parseArgs(["--range", "origin/main..HEAD"])).toEqual({
      message: undefined,
      range: "origin/main..HEAD",
    });
  });

  it("captures an unknown argument", () => {
    expect(parseArgs(["--unknown"])).toEqual({
      message: undefined,
      range: undefined,
      unknownArg: "--unknown",
    });
  });

  it("captures missing message values", () => {
    expect(parseArgs(["--message"])).toEqual({
      message: undefined,
      range: undefined,
      missingValueFor: "--message",
    });
  });

  it("captures flag-looking message values", () => {
    expect(parseArgs(["--message", "--unknown"])).toEqual({
      message: undefined,
      range: undefined,
      missingValueFor: "--message",
    });
  });

  it("captures missing range values", () => {
    expect(parseArgs(["--range"])).toEqual({
      message: undefined,
      range: undefined,
      missingValueFor: "--range",
    });
  });

  it("captures flag-looking range values", () => {
    expect(parseArgs(["--range", "--message"])).toEqual({
      message: undefined,
      range: undefined,
      missingValueFor: "--range",
    });
  });
});

describe("CLI", () => {
  it("exits 0 and prints a success message for a valid message", () => {
    const result = runCli("--message", "test: cover commit validator cli");

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Commit message format is valid.");
  });

  it("exits 1 and prints validation errors for an invalid message", () => {
    const result = runCli("--message", "update graph editor");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'Commit subject must match "type: summary".',
    );
  });

  it("exits 1 and prints validation errors for an empty message", () => {
    const result = runCli("--message", "");

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      'Commit subject must match "type: summary".',
    );
  });

  it("exits 2 and prints usage when no mode is provided", () => {
    const result = runCli();

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm validate:commit-message");
  });

  it("exits 2 and prints usage when both modes are provided", () => {
    const result = runCli(
      "--message",
      "test: cover commit validator cli",
      "--range",
      "origin/main..HEAD",
    );

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm validate:commit-message");
  });

  it("exits 2 and prints usage for an unknown argument", () => {
    const result = runCli("--unknown");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm validate:commit-message");
  });

  it("exits 2 and prints usage when a message value is missing", () => {
    const result = runCli("--message");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm validate:commit-message");
  });

  it("exits 2 and prints usage when a message value looks like a flag", () => {
    const result = runCli("--message", "--unknown");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm validate:commit-message");
  });

  it("exits 2 and prints usage when a range value is missing", () => {
    const result = runCli("--range");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm validate:commit-message");
  });

  it("exits 2 and prints usage when a range value looks like a flag", () => {
    const result = runCli("--range", "--message");

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("Usage: pnpm validate:commit-message");
  });

  it("exits 0 for a valid commit range", () => {
    const repo = createRepoWithBaseCommit();

    try {
      const base = git(repo, "rev-parse", "HEAD");
      commitFile(repo, "file.txt", "valid\n", "feat: add valid change");

      const result = runCliIn(repo, "--range", `${base}..HEAD`);

      expect(result.status).toBe(0);
      expect(result.stdout).toContain("Commit message format is valid.");
    } finally {
      rmSync(repo, { force: true, recursive: true });
    }
  });

  it("exits 1 with a subject-prefixed error for an invalid commit range", () => {
    const repo = createRepoWithBaseCommit();

    try {
      const base = git(repo, "rev-parse", "HEAD");
      commitFile(repo, "file.txt", "invalid\n", "update");

      const result = runCliIn(repo, "--range", `${base}..HEAD`);

      expect(result.status).toBe(1);
      expect(result.stderr).toContain(
        'update: Commit subject must match "type: summary".',
      );
    } finally {
      rmSync(repo, { force: true, recursive: true });
    }
  });

  it("exits 2 and prints an unreadable range error for an invalid range", () => {
    const repo = createRepoWithBaseCommit();

    try {
      const result = runCliIn(repo, "--range", "missing-ref..HEAD");

      expect(result.status).toBe(2);
      expect(result.stderr).toContain("Unable to read commit range");
    } finally {
      rmSync(repo, { force: true, recursive: true });
    }
  });
});

describe("collectCommitSubjects", () => {
  it("preserves empty subject lines while parsing git log output", () => {
    expect(
      parseCommitSubjects("fix: add second change\n\nfeat: add first change\n"),
    ).toEqual(["fix: add second change", "", "feat: add first change"]);
  });

  it("returns every commit subject in the provided range", () => {
    const repo = mkdtempSync(join(tmpdir(), "commit-message-validator-"));

    try {
      git(repo, "init");
      git(repo, "config", "user.email", "test@example.com");
      git(repo, "config", "user.name", "Test User");

      writeFileSync(join(repo, "file.txt"), "base\n");
      git(repo, "add", "file.txt");
      git(repo, "commit", "-m", "chore: base commit");

      const base = git(repo, "rev-parse", "HEAD");

      writeFileSync(join(repo, "file.txt"), "first\n");
      git(repo, "add", "file.txt");
      git(repo, "commit", "-m", "feat: add first change");

      writeFileSync(join(repo, "file.txt"), "second\n");
      git(repo, "add", "file.txt");
      git(repo, "commit", "-m", "fix: add second change");

      expect(collectCommitSubjects(`${base}..HEAD`, { cwd: repo })).toEqual([
        "fix: add second change",
        "feat: add first change",
      ]);
    } finally {
      rmSync(repo, { force: true, recursive: true });
    }
  });
});

function git(cwd, ...args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function runCli(...args) {
  return runCliIn(undefined, ...args);
}

function runCliIn(cwd, ...args) {
  return spawnSync(process.execPath, [cliScriptPath, ...args], {
    cwd,
    encoding: "utf8",
  });
}

function createRepoWithBaseCommit() {
  const repo = mkdtempSync(join(tmpdir(), "commit-message-validator-"));
  git(repo, "init");
  git(repo, "config", "user.email", "test@example.com");
  git(repo, "config", "user.name", "Test User");
  commitFile(repo, "file.txt", "base\n", "chore: base commit");
  return repo;
}

function commitFile(repo, filename, content, message) {
  writeFileSync(join(repo, filename), content);
  git(repo, "add", filename);
  git(repo, "commit", "-m", message);
}
