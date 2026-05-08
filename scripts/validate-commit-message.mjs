/* global console, process */

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const ALLOWED_TYPES = [
  "feat",
  "fix",
  "docs",
  "test",
  "refactor",
  "style",
  "chore",
];

export const VAGUE_SUMMARIES = ["update", "changes", "fix stuff", "misc"];

const USAGE = `Usage: pnpm validate:commit-message -- (--message "<message>" | --range <revision-range>)

Validates Conventional Commit-style commit subjects.

Modes:
  --message <message>       Validate one commit message. Only the first line is checked.
  --range <revision-range>  Validate each subject from git log --format=%s <revision-range>.`;

export function validateCommitMessage(message) {
  const errors = [];
  const subject = String(message ?? "").split(/\r?\n/, 1)[0];
  const match = subject.match(/^([a-z]+):\s*(.*)$/);

  if (!match) {
    errors.push('Commit subject must match "type: summary".');
    return errors;
  }

  const [, type, rawSummary] = match;
  const summary = rawSummary.trim();

  if (!ALLOWED_TYPES.includes(type)) {
    errors.push(`Commit type must be one of: ${ALLOWED_TYPES.join(", ")}.`);
  }

  if (!summary) {
    errors.push("Commit summary must not be empty.");
    return errors;
  }

  if (summary.endsWith(".")) {
    errors.push("Commit summary must not end with a period.");
  }

  if (VAGUE_SUMMARIES.includes(summary.toLowerCase())) {
    errors.push(
      'Commit summary must be concrete, not "update", "changes", "fix stuff", or "misc".',
    );
  }

  return errors;
}

export function collectCommitSubjects(range, { cwd = process.cwd() } = {}) {
  const output = execFileSync("git", ["log", "--format=%s", range], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return output
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
}

export function parseArgs(args) {
  const parsed = {
    message: undefined,
    range: undefined,
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

function runCli() {
  const { message, range, unknownArg } = parseArgs(process.argv.slice(2));

  if (unknownArg || (!message && !range) || (message && range)) {
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }

  let errors;
  if (message) {
    errors = validateCommitMessage(message);
  } else {
    let subjects;
    try {
      subjects = collectCommitSubjects(range);
    } catch (error) {
      console.error(`Unable to collect commit subjects: ${error.message}`);
      process.exitCode = 2;
      return;
    }

    errors = subjects.flatMap((subject) =>
      validateCommitMessage(subject).map((error) => `${subject}: ${error}`),
    );
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
