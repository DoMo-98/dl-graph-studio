# AGENTS.md

## Purpose

This repository uses an agent-assisted roadmap workflow. Agents must work from explicit GitHub issues, keep pull requests small, and preserve product-owner control over task selection and merge decisions.

## Source Of Truth

- `PRD.md` is the high-level product source of truth.
- `docs/superpowers/specs/2026-04-26-agent-roadmap-workflow-design.md` is the workflow design source of truth.
- `docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md` defines the milestone UX/UI hardening convention.
- `docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md` defines the milestone technical audit convention.
- `docs/superpowers/specs/2026-05-03-product-owner-idea-intake-design.md` defines the product-owner idea intake convention.
- `docs/superpowers/specs/2026-05-03-start-task-in-progress-design.md` defines when a confirmed local task moves to `In Progress`.
- The GitHub Project for this repository is `dl-graph-studio Roadmap`.
- GitHub Issues and the GitHub Project are the operational source of truth for executable roadmap work.
- Pull requests are delivery and review artifacts, not planning documents.

## Task Selection

- Before starting any task, first confirm the current worktree is clean. Then fetch the remote base branch with `git fetch --prune origin main` and verify that the current branch is synchronized with `origin/main`.
- If the current branch has no task commits and is only behind `origin/main`, fast-forward the current branch to `origin/main`.
- If the current branch has local changes, local commits, or has diverged from `origin/main`, stop and report the state before making task changes. Do not switch this worktree to `main` just to synchronize, because the harness may already be operating in a generated worktree.
- For traditional single-worktree workflows, switching to `main` and running `git pull --ff-only` is still acceptable when it can be done safely.
- Do not start a new roadmap task without product-owner confirmation.
- When asked for the next task, inspect the GitHub Project and propose one open issue whose `dl-graph-studio Roadmap` Project status is exactly `Ready` and whose issue labels include `ready`. Do not treat the `ready` label alone as sufficient, because labels can be stale after a Project status change.
- Explain why the proposed issue is the best next task.
- If multiple issues are plausible, present the tradeoff and recommend one.
- Do not implement an issue that lacks objective, scope, acceptance criteria, and verification details.
- Before creating or updating a live roadmap issue outside GitHub's issue-template UI, use `.github/ISSUE_TEMPLATE/roadmap-task.md` as the canonical format and run `pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>` before applying `ready` or adding it to the Project as ready.
- After the product owner confirms a ready issue and the agent creates the local branch `codex/<issue-number>-<short-name>`, immediately attempt to move the confirmed issue from `Ready` to `In Progress` in the `dl-graph-studio Roadmap` GitHub Project before making implementation edits.
- If the GitHub Project update cannot be performed because of permissions, missing tooling, unresolved Project metadata, or GitHub availability, report the limitation and request the manual move of issue `#<issue-number>` to `In Progress`, or get explicit product-owner approval to continue despite the temporary Project mismatch.

## Product Owner Idea Intake

- When the product owner proposes a new idea, treat it as idea intake by default, not as authorization to implement.
- Messages phrased as ideas, preferences, or wishes, such as "I would like...", "it would be nice if...", or "we should...", must always be treated as idea intake and never as implementation authorization.
- The default goal of intake is to convert the idea into a roadmap issue that is ready to execute.
- Classify the idea before drafting work: UX/UI finding, technical audit finding, new roadmap task, or PRD-level idea.
- If the idea is a small UX/UI finding in the current milestone, record it in `[Roadmap]: Phase N UX/UI hardening` when it fits that issue's scope.
- If the idea is a milestone-local technical quality finding, record it in `[Roadmap]: Phase N technical audit` when it fits that issue's scope.
- If the idea is a new roadmap task, draft a roadmap issue using `.github/ISSUE_TEMPLATE/roadmap-task.md`.
- If the idea changes high-level product direction, treat it as a PRD or planning discussion before creating executable issues.
- Ask focused clarifying questions until the issue has objective, scope, out-of-scope, acceptance criteria, verification, milestone, labels, and an expected PR size that fits the normal 15-30 minute review window.
- If the idea is too large for one reviewable PR, propose a split and recommend the first issue to create.
- Before creating or updating a live roadmap issue outside GitHub's issue-template UI, run `pnpm validate:roadmap-issue -- --title "[Roadmap]: <title>" --body <body-file>`.
- Ask the product owner to confirm issue creation, readiness, and priority before applying `ready`, adding the issue to the Project as ready, or starting implementation.

## Milestone UX/UI Hardening

- Treat `[Roadmap]: Phase N UX/UI hardening` as the default final live issue title for each product milestone, especially Phase 1 and Phase 2.
- Use the milestone hardening issue as the organized inbox for product-owner-reported UX/UI findings during the milestone.
- When the product owner reports a UX/UI issue, record it in the current milestone hardening issue with enough context to reproduce or evaluate it.
- The hardening issue may include small UX/UI corrections only when they stay within the issue scope.
- Do not use hardening issues for new product capabilities, large redesigns, broad refactors, dependency changes, or future milestone behavior.
- If hardening reveals larger UX or product problems, create follow-up roadmap issues instead of bundling them into the hardening PR.

## Milestone Technical Audit

- Treat `[Roadmap]: Phase N technical audit` as the default penultimate live issue title for each product milestone, followed by `[Roadmap]: Phase N UX/UI hardening` as the final issue, unless the product owner explicitly decides to skip or reorder either closeout task.
- Use the technical audit issue as a corrective closeout pass for architecture boundaries, clean code, maintainability, library usage, test coverage, and milestone-local technical debt.
- Split technical audit work across subagents with one responsibility each, such as architecture boundaries, clean-code maintainability, library use, test coverage, and performance/rendering only when applicable.
- Do not let one subagent own multiple unrelated audit domains. Cross-domain findings should be reported to the lead agent and routed to the correct owner.
- The technical audit issue may include bounded corrective changes directly tied to audit findings.
- Do not use technical audit issues for new product capabilities, future milestone behavior, broad rewrites, speculative abstractions, dependency changes without a concrete finding, or formatting churn.
- If the audit reveals larger architecture, dependency, testing, or maintainability work, create follow-up roadmap issues instead of bundling that work into the audit PR.

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
