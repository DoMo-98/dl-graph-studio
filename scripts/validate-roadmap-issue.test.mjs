import { describe, expect, it } from "vitest";

import { validateRoadmapIssue } from "./validate-roadmap-issue.mjs";

const validBody = `## Objective

Describe the outcome.

## Roadmap metadata

GitHub Milestone: Phase 1 - Core architecture editor
No GitHub Milestone reason: N/A

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

  it("passes a justified no-milestone roadmap issue", () => {
    const body = validBody
      .replace(
        "GitHub Milestone: Phase 1 - Core architecture editor",
        "GitHub Milestone: N/A",
      )
      .replace(
        "No GitHub Milestone reason: N/A",
        "No GitHub Milestone reason: Bootstrap issue created before milestones existed.",
      );

    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body,
      }),
    ).toEqual([]);
  });

  it("fails when roadmap metadata is missing", () => {
    const body = validBody.replace(
      `## Roadmap metadata

GitHub Milestone: Phase 1 - Core architecture editor
No GitHub Milestone reason: N/A

`,
      "",
    );

    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body,
      }),
    ).toEqual(
      expect.arrayContaining([
        'Body must contain heading "## Roadmap metadata".',
      ]),
    );
  });

  it("fails when a milestone and no-milestone reason are both placeholders", () => {
    const body = validBody.replace(
      "GitHub Milestone: Phase 1 - Core architecture editor",
      "GitHub Milestone: N/A",
    );

    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body,
      }),
    ).toContain(
      'Roadmap metadata must include a GitHub Milestone or an explicit "No GitHub Milestone reason".',
    );
  });

  it("fails when the milestone still uses the template placeholder", () => {
    const body = validBody.replace(
      "GitHub Milestone: Phase 1 - Core architecture editor",
      "GitHub Milestone: Phase N - Milestone name",
    );

    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body,
      }),
    ).toContain(
      'Roadmap metadata must include a GitHub Milestone or an explicit "No GitHub Milestone reason".',
    );
  });

  it("fails when obsolete milestone focus metadata is present", () => {
    const body = validBody.replace(
      "GitHub Milestone: Phase 1 - Core architecture editor",
      `GitHub Milestone: Phase 1 - Core architecture editor
Milestone Focus: Current`,
    );

    expect(
      validateRoadmapIssue({
        title: "[Roadmap]: Example",
        body,
      }),
    ).toContain('Roadmap metadata must not contain "Milestone Focus:".');
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
