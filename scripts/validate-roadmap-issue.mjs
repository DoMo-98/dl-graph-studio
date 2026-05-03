/* global console, process */

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const REQUIRED_HEADINGS = [
  "## Objective",
  "## Scope",
  "## Out of scope",
  "## Acceptance criteria",
  "## Verification",
  "## Notes",
];

const USAGE = `Usage: pnpm validate:roadmap-issue -- --title "<title>" --body <path>

Validates a roadmap issue title and body before creating it through the CLI or API.

Required arguments:
  --title <title>  Issue title. Must start with "[Roadmap]: ".
  --body <path>    Path to a Markdown body file.`;

export function validateRoadmapIssue({ title, body }) {
  const errors = [];
  const lines = String(body ?? "").split(/\r?\n/);

  if (!String(title ?? "").startsWith("[Roadmap]: ")) {
    errors.push('Title must start with "[Roadmap]: ".');
  }

  for (const heading of REQUIRED_HEADINGS) {
    if (!lines.includes(heading)) {
      errors.push(`Body must contain heading "${heading}".`);
    }
  }

  const verificationLines = getSectionLines(lines, "## Verification");
  if (verificationLines.length === 0 && !lines.includes("## Verification")) {
    return errors;
  }

  validateVerificationLabel({
    errors,
    lines: verificationLines,
    label: "Automated:",
  });
  validateVerificationLabel({
    errors,
    lines: verificationLines,
    label: "Manual:",
  });

  return errors;
}

function getSectionLines(lines, heading) {
  const start = lines.indexOf(heading);
  if (start === -1) {
    return [];
  }

  const sectionLines = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (lines[index].startsWith("## ")) {
      break;
    }

    sectionLines.push(lines[index]);
  }

  return sectionLines;
}

function validateVerificationLabel({ errors, lines, label }) {
  const nestedLabelPattern = new RegExp(
    `^\\s*-\\s*${escapeRegExp(label)}\\s*$`,
  );
  if (lines.some((line) => nestedLabelPattern.test(line))) {
    errors.push(
      `Verification label "${label}" must be top-level, not a list item.`,
    );
  }

  const labelIndex = lines.findIndex((line) => line === label);
  if (labelIndex === -1) {
    errors.push(`Verification must contain top-level label "${label}".`);
    return;
  }

  const subsectionLines = [];
  for (let index = labelIndex + 1; index < lines.length; index += 1) {
    if (lines[index] === "Automated:" || lines[index] === "Manual:") {
      break;
    }

    subsectionLines.push(lines[index]);
  }

  if (!subsectionLines.some((line) => /^- \[ \] .+/.test(line))) {
    errors.push(
      `Verification subsection "${label}" must include at least one unchecked checklist item.`,
    );
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseArgs(args) {
  const parsed = {
    title: undefined,
    bodyPath: undefined,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--") {
      continue;
    } else if (arg === "--title") {
      parsed.title = args[index + 1];
      index += 1;
    } else if (arg === "--body") {
      parsed.bodyPath = args[index + 1];
      index += 1;
    } else {
      parsed.unknownArg = arg;
    }
  }

  return parsed;
}

function runCli() {
  const { title, bodyPath, unknownArg } = parseArgs(process.argv.slice(2));

  if (!title || !bodyPath || unknownArg) {
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }

  let body;
  try {
    body = readFileSync(bodyPath, "utf8");
  } catch (error) {
    console.error(`Unable to read body file "${bodyPath}": ${error.message}`);
    process.exitCode = 2;
    return;
  }

  const errors = validateRoadmapIssue({ title, body });
  if (errors.length > 0) {
    console.error("Roadmap issue format is invalid:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Roadmap issue format is valid.");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCli();
}
