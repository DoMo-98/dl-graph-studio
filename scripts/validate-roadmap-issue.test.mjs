import { describe, expect, it } from "vitest";

import { validateRoadmapIssue } from "./validate-roadmap-issue.mjs";

const validBody = `## Objective

Describe the outcome.

## Scope

- Include the work.

## Out of scope

- Exclude unrelated work.

## Acceptance criteria

- [ ] Criteria can be reviewed.

## Verification

Automated:

- [ ] pnpm test

Manual:

- [ ] Review the created issue.

## Notes

Additional context.
`;

describe("validateRoadmapIssue", () => {
  it("passes a valid template-shaped roadmap issue", () => {
    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body: validBody,
      }),
    ).toEqual([]);
  });

  it("fails when the title is missing the roadmap prefix", () => {
    expect(
      validateRoadmapIssue({
        title: "Example",
        body: validBody,
      }),
    ).toContain('Title must start with "[Roadmap]: ".');
  });

  it("fails when verification labels are nested list items", () => {
    const body = validBody
      .replace("Automated:", "- Automated:")
      .replace("Manual:", "- Manual:");

    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body,
      }),
    ).toEqual(
      expect.arrayContaining([
        'Verification label "Automated:" must be top-level, not a list item.',
        'Verification label "Manual:" must be top-level, not a list item.',
      ]),
    );
  });

  it("fails when the manual verification checklist is missing", () => {
    const body = validBody.replace("- [ ] Review the created issue.", "");

    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body,
      }),
    ).toContain(
      'Verification subsection "Manual:" must include at least one unchecked checklist item.',
    );
  });
});
