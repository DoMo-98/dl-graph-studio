# AGENTS.md

## Purpose

This repository uses an agent-assisted roadmap workflow. Agents must work from explicit GitHub issues, keep pull requests small, and preserve product-owner control over task selection and merge decisions.

## Source Of Truth

- `PRD.md` is the high-level product source of truth.
- `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md` is the workflow design source of truth.
- `docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md` defines the milestone UX/UI hardening convention.
- The GitHub Project for this repository is `dl-graph-studio Roadmap`.
- GitHub Issues and the GitHub Project are the operational source of truth for executable roadmap work.
- Pull requests are delivery and review artifacts, not planning documents.

## Task Selection

- Before starting any task, run `git pull --ff-only` or an equivalent safe sync command so the local workspace is up to date with the remote.
- If the workspace has local changes or `git pull --ff-only` cannot complete safely, stop and report the state before making task changes.
- Do not start a new roadmap task without product-owner confirmation.
- When asked for the next task, inspect the GitHub Project and propose one issue with the `ready` label.
- Explain why the proposed issue is the best next task.
- If multiple issues are plausible, present the tradeoff and recommend one.
- Do not implement an issue that lacks objective, scope, acceptance criteria, and verification details.

## Milestone UX/UI Hardening

- Treat `Phase N UX/UI hardening` as the default final issue for each product milestone, especially Phase 1 and Phase 2.
- Use the milestone hardening issue as the organized inbox for product-owner-reported UX/UI findings during the milestone.
- When the product owner reports a UX/UI issue, record it in the current milestone hardening issue with enough context to reproduce or evaluate it.
- The hardening issue may include small UX/UI corrections only when they stay within the issue scope.
- Do not use hardening issues for new product capabilities, large redesigns, broad refactors, dependency changes, or future milestone behavior.
- If hardening reveals larger UX or product problems, create follow-up roadmap issues instead of bundling them into the hardening PR.

## Branches

- Use `codex/<issue-number>-<short-name>` for agent-created branches.
- Keep one issue per branch by default.
- Group multiple issues in one branch only when the issues explicitly allow grouping before work starts.

## Scope Control

- Implement only the issue scope.
- Treat the issue's `Out of scope` section as binding.
- Do not include unrelated refactors, dependency changes, or formatting churn.
- If implementation reveals missing scope, stop and ask for clarification or update the issue before continuing.

## Verification

- Run the verification listed in the issue.
- Run relevant automated tests when tests exist.
- For UI changes, capture screenshots or a short video/GIF for the PR.
- Before opening the PR, give the product owner concise manual verification instructions so they can corroborate that the implementation succeeded.
- Product-owner verification instructions must explain what to test, where to test it, the expected result, and any known limitations or skipped checks.
- Document manual verification steps in the PR.
- If a requested verification cannot be run, state why in the PR.

## Pull Requests

- Link the issue with `Closes #<issue-number>`.
- Fill in the repository pull request template.
- Explain what changed and how to verify it.
- Keep PRs reviewable in about 15-30 minutes.
- Iterate in the same PR when review requests changes.
- Do not start the next roadmap issue until the product owner confirms continuing.

## Definition Of Done

A PR is ready for review when:

- It addresses exactly one roadmap issue, unless the issue explicitly allows grouping.
- The PR description explains what changed and how to verify it.
- Acceptance criteria from the issue are satisfied or explicitly explained.
- Automated tests pass where tests exist.
- New behavior has suitable test coverage when practical.
- UI changes include screenshots or a short video/GIF.
- Product-owner manual verification instructions were provided before opening the PR.
- Manual verification steps have been run and documented.
- No unrelated refactors or scope creep are included.
- Documentation is updated when behavior, architecture, or workflow changes.
