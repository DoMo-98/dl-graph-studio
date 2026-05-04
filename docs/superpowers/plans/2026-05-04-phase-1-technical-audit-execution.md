# Phase 1 Technical Audit Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit Phase 1 code for architecture boundaries, maintainability, library usage, and test coverage, then apply only bounded corrective fixes tied to concrete findings from issue #31.

**Architecture:** The lead agent coordinates single-domain audit subagents and owns integration. Subagents produce focused findings only; shared files are edited serially by the lead unless one bounded fix has a clearly disjoint owner.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, React Flow, Tauri project shell.

---

## File Structure

- Inspect: `PRD.md`
- Inspect: `docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md`
- Inspect: `src/App.tsx`
- Inspect: `src/projectFile.ts`
- Inspect: `src/App.test.tsx`
- Inspect: `src/App.nodeDrag.test.tsx`
- Inspect: `src/projectFile.test.ts`
- Modify only when a concrete audit finding justifies it: `src/App.tsx`
- Modify only when a concrete audit finding justifies it: `src/projectFile.ts`
- Modify only when a concrete audit finding justifies it: `src/App.test.tsx`
- Modify only when a concrete audit finding justifies it: `src/projectFile.test.ts`
- Avoid unless required by verification: `src/styles.css`
- Do not modify for this issue: roadmap process docs, issue templates, PR templates, dependency manifests.

---

### Task 1: Baseline Verification

**Files:**

- Verify: `package.json`
- Verify: `pnpm-lock.yaml`

- [ ] **Step 1: Install dependencies**

Run:

```sh
pnpm install --frozen-lockfile
```

Expected: dependencies install without modifying `pnpm-lock.yaml`.

- [ ] **Step 2: Run baseline tests**

Run:

```sh
pnpm test
```

Expected: all existing tests pass before audit fixes.

- [ ] **Step 3: Run baseline lint**

Run:

```sh
pnpm lint
```

Expected: lint exits successfully before audit fixes.

- [ ] **Step 4: Run baseline build**

Run:

```sh
pnpm build
```

Expected: TypeScript and Vite production build complete successfully before audit fixes.

- [ ] **Step 5: Run baseline format check**

Run:

```sh
pnpm format:check
```

Expected: Prettier reports all matched files use configured style.

---

### Task 2: Architecture Boundaries Audit

**Files:**

- Inspect: `PRD.md`
- Inspect: `docs/superpowers/specs/2026-05-03-milestone-technical-audit-design.md`
- Inspect: `src/App.tsx`
- Inspect: `src/projectFile.ts`

- [ ] **Step 1: Dispatch `architecture-boundaries` subagent**

Ask the subagent to inspect module boundaries, ownership, data flow, coupling, domain models, adapter boundaries, and consistency with documented Phase 1 behavior.

- [ ] **Step 2: Record findings**

Require each finding to include:

```md
### Finding: <short title>

- Domain: architecture-boundaries
- Severity: low | medium | high
- Evidence:
- Recommended decision: fixed | deferred | converted to follow-up
- Suggested owner:
```

- [ ] **Step 3: Reject out-of-scope findings**

Reject findings that require new product capabilities, future milestone behavior, broad rewrites, speculative abstractions, dependency changes, or formatting churn.

---

### Task 3: Clean-Code Maintainability Audit

**Files:**

- Inspect: `src/App.tsx`
- Inspect: `src/projectFile.ts`
- Inspect: `src/App.test.tsx`
- Inspect: `src/App.nodeDrag.test.tsx`
- Inspect: `src/projectFile.test.ts`

- [ ] **Step 1: Dispatch `clean-code-maintainability` subagent**

Ask the subagent to inspect naming, duplication, function/component size, local API clarity, complexity, dead code, readability, and brittle implementation details.

- [ ] **Step 2: Record findings**

Require the same compact finding format with `Domain: clean-code-maintainability`.

- [ ] **Step 3: Reject out-of-scope findings**

Reject style-only formatting churn and broad rewrites that would make the audit pull request hard to review in 15-30 minutes.

---

### Task 4: Library-Use Audit

**Files:**

- Inspect: `package.json`
- Inspect: `src/App.tsx`
- Inspect: `src/projectFile.ts`
- Inspect: `src/App.test.tsx`
- Inspect: `src/App.nodeDrag.test.tsx`

- [ ] **Step 1: Dispatch `library-use` subagent**

Ask the subagent to inspect whether Phase 1 reinvents behavior already covered by existing dependencies, especially React Flow, React Testing Library, Vitest, browser APIs, and TypeScript.

- [ ] **Step 2: Record findings**

Require the same compact finding format with `Domain: library-use`.

- [ ] **Step 3: Reject unsupported dependency changes**

Reject any new dependency unless the finding proves a mature, well-understood problem is being solved poorly in project code and the dependency is robust, maintained, narrow in scope, and a clear fit.

---

### Task 5: Test Coverage Audit

**Files:**

- Inspect: `src/App.tsx`
- Inspect: `src/projectFile.ts`
- Inspect: `src/App.test.tsx`
- Inspect: `src/App.nodeDrag.test.tsx`
- Inspect: `src/projectFile.test.ts`

- [ ] **Step 1: Dispatch `test-coverage` subagent**

Ask the subagent to inspect missing tests for Phase 1 behavior, weak assertions, brittle mocks, import/export validation coverage, graph editing flows, parameter editing, connection validation, and node dragging.

- [ ] **Step 2: Record findings**

Require the same compact finding format with `Domain: test-coverage`.

- [ ] **Step 3: Prefer focused tests**

Accept coverage additions only when they test delivered Phase 1 behavior without adding new product capabilities or locking tests to incidental markup.

---

### Task 6: Lead Integration

**Files:**

- Modify only as justified: `src/App.tsx`
- Modify only as justified: `src/projectFile.ts`
- Modify only as justified: `src/App.test.tsx`
- Modify only as justified: `src/projectFile.test.ts`

- [ ] **Step 1: Classify subagent findings**

For every finding, choose one decision:

```md
- Decision: fixed
- Decision: deferred
- Decision: converted to follow-up
```

Use `fixed` only for bounded, milestone-local findings that can be reviewed in this pull request.

- [ ] **Step 2: Write failing tests first for behavior changes**

For every accepted behavior or coverage finding, add or update a focused Vitest or React Testing Library test before changing production code.

- [ ] **Step 3: Apply minimal corrective fixes**

Keep edits scoped to the accepted findings. Do not add dependencies, new product features, or broad architectural rewrites.

- [ ] **Step 4: Run targeted tests**

Run the narrowest test command covering touched behavior, for example:

```sh
pnpm test -- src/projectFile.test.ts
pnpm test -- src/App.test.tsx
```

Expected: targeted tests pass.

---

### Task 7: Final Verification and Review

**Files:**

- Verify: all changed files

- [ ] **Step 1: Run full automated verification**

Run:

```sh
pnpm test
pnpm lint
pnpm build
pnpm format:check
```

Expected: all commands pass.

- [ ] **Step 2: Request final code review**

Dispatch a reviewer with the issue objective, accepted findings, changed files, base SHA, and head SHA.

- [ ] **Step 3: Prepare manual verification instructions**

Manual verification must cover the primary Phase 1 flow:

```md
1. Open the app.
2. Confirm the workspace shell, primitive nodes, composite node, inspector, and connection controls render.
3. Select primitive and composite nodes and confirm inspector metadata and editable primitive parameters remain correct.
4. Create, reject duplicate, delete, export, import, reset, and drag graph nodes as applicable to touched areas.
```

- [ ] **Step 4: Confirm no scope creep**

Check that the diff contains no new product capabilities, future milestone behavior, dependency changes, broad rewrites, or formatting-only churn.

---

## Audit Findings And Decisions

### Finding: Imported graph identities are not enforced as unique

- Domain: architecture-boundaries
- Severity: high
- Owner: lead integration
- Evidence: `src/projectFile.ts` accepted duplicate node ids and connection ids before parsed data reached React Flow ids.
- Decision: fixed
- Follow-up issue: none

### Finding: Imported connections bypass editor validation rules

- Domain: architecture-boundaries
- Severity: medium
- Owner: lead integration
- Evidence: imported connections were only checked for existing endpoints, while editor-created connections reject self-connections, duplicate pairs, and targets whose node kind is `Data`.
- Decision: fixed
- Follow-up issue: none

### Finding: Composite member references are not validated at the project boundary

- Domain: architecture-boundaries
- Severity: medium
- Owner: lead integration
- Evidence: imported composite nodes accepted `memberNodeIds` that did not exist in the imported node set.
- Decision: fixed
- Follow-up issue: none

### Finding: Parameter updates bypass discriminated type safety

- Domain: clean-code-maintainability
- Severity: medium
- Owner: lead integration
- Evidence: `src/App.tsx` previously accepted any primitive parameter value type for every parameter and cast the result back to `PrimitiveNodeParameter`.
- Decision: fixed
- Follow-up issue: none

### Finding: Project-file parsing relies on post-validation casts

- Domain: clean-code-maintainability
- Severity: low
- Owner: lead integration
- Evidence: `src/projectFile.ts` validated arrays and then cast parsed arrays to project-file types.
- Decision: fixed
- Follow-up issue: none

### Finding: Primitive and composite node cards duplicate selectable-node behavior

- Domain: clean-code-maintainability
- Severity: low
- Owner: lead integration
- Evidence: primitive and composite node cards share selection and keyboard behavior, but composite and primitive controls still differ enough that extraction would be mostly structural churn in this PR.
- Decision: deferred
- Follow-up issue: none

### Finding: App component is too broad for reviewable maintenance

- Domain: clean-code-maintainability
- Severity: medium
- Owner: lead integration
- Evidence: `src/App.tsx` owns project import/export/reset, graph connection state, drag integration, React Flow mapping, inspector behavior, and layout rendering.
- Decision: converted to follow-up
- Follow-up issue: draft validated as `[Roadmap]: Extract App project file workflow`; live issue creation pending product-owner confirmation

### Finding: Use React Flow nodeExtent instead of custom drag bounds

- Domain: library-use
- Severity: medium
- Owner: lead integration
- Evidence: app code manually calculated and clamped drag bounds while React Flow already supports `nodeExtent`.
- Decision: fixed
- Follow-up issue: none

### Finding: Project file validation and serialized export are under-tested

- Domain: test-coverage
- Severity: high
- Owner: lead integration
- Evidence: parser validation had little direct coverage and export tests did not inspect serialized project contents.
- Decision: fixed
- Follow-up issue: none

### Finding: Text and boolean parameter edits are not covered

- Domain: test-coverage
- Severity: medium
- Owner: lead integration
- Evidence: existing parameter tests covered number and select edits but not Tensor text or Neuron boolean edits.
- Decision: fixed
- Follow-up issue: none

### Finding: React Flow connection adapter path is not exercised

- Domain: test-coverage
- Severity: medium
- Owner: lead integration
- Evidence: connection tests used custom node-card controls but did not exercise the React Flow `onConnect` adapter path.
- Decision: fixed
- Follow-up issue: none
