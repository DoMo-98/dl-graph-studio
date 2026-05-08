# Phase 1 UX/UI Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the Phase 1 UX/UI closeout pass with approved baseline fixes, a visual review gate for newly discovered findings, and documented verification evidence.

**Architecture:** Keep the hardening work inside the existing React app boundary. Use `src/App.tsx` for canvas interaction, React Flow adapter props, and connection feedback rendering; keep project import/export/reset toast behavior in `src/useProjectFileWorkflow.ts`; use `src/styles.css` only for small visual-system corrections approved for #22. Newly discovered visual findings must be listed and approved by the product owner before implementation.

**Tech Stack:** React 19, TypeScript, Vite, React Flow (`@xyflow/react`), lucide-react, Vitest, React Testing Library, CSS, GitHub CLI.

---

## File Structure

- Modify GitHub issue #22 before implementation:
  - Keep the current issue body structure.
  - Add the approved visual review gate from `docs/superpowers/specs/2026-05-05-phase-1-ux-ui-hardening-design.md`.
  - Add the `ready` label and move the Project status to `Ready` only after the roadmap validator passes.
- Modify `src/App.test.tsx`:
  - Add focused tests for clearing node selection on empty canvas clicks.
  - Add tests for unifying visible feedback surfaces where practical.
  - Add tests that React Flow attribution handling is explicit in the adapter.
- Modify `src/App.nodeDrag.test.tsx` only if React Flow mock coverage is needed for pane-click or attribution props.
- Modify `src/App.tsx`:
  - Add the empty-canvas click behavior through React Flow pane handling.
  - Keep node, edge, port, control, and connection interactions intact.
  - Add or adjust React Flow attribution configuration only if allowed by the installed package and license.
  - Unify connection feedback with the existing toast/status pattern without changing graph behavior.
- Modify `src/useProjectFileWorkflow.ts` only if toast timing, message naming, or shared toast semantics need a small focused adjustment.
- Modify `src/styles.css`:
  - Apply approved small visual corrections from the visual review list.
  - Keep existing color system, density, and layout structure intact.
- Create or update PR evidence files only if the repository already has an established local evidence path; otherwise attach screenshots or recording in the PR body instead of adding binary files.

Do not add dependencies, new graph model fields, new product controls, persistence changes, broad `App.tsx` decomposition, or unapproved visual polish.

---

### Task 1: Prepare Issue #22 For Ready Status

**Files:**

- Read: `.github/ISSUE_TEMPLATE/roadmap-task.md`
- Read: `docs/superpowers/specs/2026-05-05-phase-1-ux-ui-hardening-design.md`
- External: GitHub issue #22 and `dl-graph-studio Roadmap` Project

- [ ] **Step 1: Create a temporary issue body file from the approved design**

Create `/tmp/phase-1-ux-ui-hardening-issue.md` with this exact body:

```md
## Objective

Review and tighten the user-facing experience delivered by Phase 1 after the core architecture editor issues are complete, while keeping this issue as the Phase 1 UX/UI hardening umbrella, finding inbox, and final closeout pass.

This issue is not a redesign bucket. Larger UX changes, new product capabilities, or work that would make the pull request too broad should be converted into focused follow-up roadmap issues.

## Scope

- Review the primary Phase 1 editor flow end-to-end now that the planned functional Phase 1 issues are complete.
- Triage product-owner-reported UX/UI findings for Phase 1.
- Fix the existing open #22 findings:
  - unify toast notifications across the Phase 1 editor flow,
  - remove the default React Flow attribution only if licensing and package configuration allow it,
  - clear the active component selection when clicking the empty canvas background without interfering with nodes, ports, edges, or canvas controls.
- Run a complete visual review of the Phase 1 editor flow and list small newly discovered visual or interaction findings.
- Ask the product owner to approve newly discovered findings before correcting them.
- Fix only newly discovered findings approved by the product owner for this PR.
- Verify consistency between the canvas, inspector, toolbar, navigation, validation surfaces, and relevant empty/error states.
- Capture screenshots or a short recording of the reviewed flow.
- Create follow-up roadmap issue recommendations for larger UX or product problems found during review.

## Out of scope

- New product capabilities.
- Large redesigns.
- Broad refactors unrelated to the UX/UI hardening pass.
- Dependency changes unless required for a scoped hardening fix.
- Changes to future milestone behavior.
- Treating unresolved product decisions as visual polish.
- Reopening work already resolved in separate roadmap issues #26, #32, or #33.
- Fixing newly discovered visual findings before product-owner approval.

## Acceptance criteria

- [ ] The primary Phase 1 flow has been reviewed end-to-end.
- [ ] Product-owner-reported UX/UI findings for Phase 1 have been triaged.
- [ ] Existing open #22 findings are fixed or explicitly deferred with rationale.
- [ ] Newly discovered visual findings are listed before implementation.
- [ ] Newly discovered visual findings are not corrected until approved by the product owner.
- [ ] Approved small visual findings are fixed inside #22.
- [ ] Larger or unapproved findings are deferred or converted into follow-up issue recommendations.
- [ ] The PR includes screenshots or a short recording for the reviewed flow.
- [ ] Manual verification describes the flow that was tested.
- [ ] No new product capabilities were added.

## Verification

Automated:

- [ ] Run `pnpm lint`.
- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.

Manual:

- [ ] Open the Phase 1 editor flow end-to-end.
- [ ] Verify canvas readability, inspector behavior, navigation, interaction feedback, and empty/error states relevant to Phase 1.
- [ ] Verify toast behavior is consistent across affected actions.
- [ ] Verify the React Flow attribution text is removed only if licensing and package configuration allow it; otherwise document why it remains.
- [ ] Verify clicking the empty canvas background clears the active component selection without interfering with nodes, ports, edges, or canvas controls.
- [ ] Verify creating valid and invalid connections still works.
- [ ] Verify deleting one connection still preserves other connections.
- [ ] Verify collapsing and expanding the connections panel still works.
- [ ] Verify dragging nodes and fit-view/canvas navigation still work.
- [ ] Verify export, reset, and import still work.
- [ ] Capture screenshots or a short video/GIF.

## User-reported UX/UI findings

| Date       | Finding                                                                                                      | Classification                        | Status                                                             | Target |
| ---------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ------------------------------------------------------------------ | ------ |
| 2026-05-03 | Some UI elements can render outside the visible viewport, making them impossible to see or reach.            | UX bug / layout stability             | Converted and closed                                               | #33    |
| 2026-05-03 | Users need a way to delete one chosen existing connection individually.                                      | New graph editing capability          | Converted and closed                                               | #26    |
| 2026-05-04 | Toast notifications should be unified across the Phase 1 editor flow.                                        | Small UX/UI consistency polish        | Open in this issue                                                 | #22    |
| 2026-05-04 | Remove the default "React Flow" text shown on the canvas.                                                    | Visual polish / product presentation  | Open in this issue if licensing and package configuration allow it | #22    |
| 2026-05-04 | Components should be deselected when clicking the canvas background.                                         | Interaction polish                    | Open in this issue                                                 | #22    |
| 2026-05-04 | The bottom connections list should be collapsible so it does not take up editor space when it is not needed. | Layout density / workspace efficiency | Converted and closed                                               | #32    |
| 2026-05-04 | Improve canvas navigation with zoom, pan, and fit-view controls.                                             | Workspace navigation / visibility     | Converted and closed                                               | #33    |

## Visual review gate

Before fixing newly discovered visual findings, the agent must present a concise table to the product owner with:

- finding,
- affected screen or interaction,
- user impact,
- recommended decision: fix in #22, defer, or create follow-up issue,
- implementation risk or scope note.

The product owner must approve each newly discovered finding before it is corrected in this PR.

## Notes

- Design reference: `docs/superpowers/specs/2026-05-05-phase-1-ux-ui-hardening-design.md`.
- Process reference: `docs/superpowers/specs/2026-05-01-milestone-ux-ui-hardening-design.md`.
- Related closed follow-up: #33, `[Roadmap]: Phase 1 canvas viewport navigation hardening`.
- Related closed follow-up: #32, `[Roadmap]: Phase 1 connections panel space management`.
```

- [ ] **Step 2: Validate the issue body**

Run:

```bash
pnpm validate:roadmap-issue -- --title "[Roadmap]: Phase 1 UX/UI hardening" --body /tmp/phase-1-ux-ui-hardening-issue.md
```

Expected: PASS with no missing roadmap sections.

- [ ] **Step 3: Update issue #22**

Run:

```bash
gh issue edit 22 --repo DoMo-98/dl-graph-studio --body-file /tmp/phase-1-ux-ui-hardening-issue.md
```

Expected: GitHub updates the issue body.

- [ ] **Step 4: Apply the `ready` label**

Run:

```bash
gh issue edit 22 --repo DoMo-98/dl-graph-studio --add-label ready
```

Expected: issue #22 has labels `ux`, `frontend`, and `ready`.

- [ ] **Step 5: Move #22 to Project status `Ready`**

Run:

```bash
gh project item-list 5 --owner DoMo-98 --format json --limit 100
```

Then run:

```bash
gh project item-edit --id PVTI_lAHOA6Chp84BVxUjzgrlIZw --project-id PVT_kwHOA6Chp84BVxUj --field-id PVTSSF_lAHOA6Chp84BVxUjzhRKs98 --single-select-option-id 3888be8f
```

Expected: issue #22 status in `dl-graph-studio Roadmap` is `Ready`.

- [ ] **Step 6: Confirm the ready contract**

Run:

```bash
gh issue view 22 --repo DoMo-98/dl-graph-studio --json number,title,labels,projectItems,url
```

Expected: labels include `ready`; project item status is `Ready`.

---

### Task 2: Create The Implementation Branch And Move #22 To In Progress

**Files:**

- External: Git branch and GitHub Project status

- [ ] **Step 1: Confirm the local checkout is clean and current**

Run:

```bash
git status --short --branch
git fetch --prune origin main
git rev-list --left-right --count HEAD...origin/main
```

Expected: no local changes; ahead/behind is `0 0`. If the checkout is only behind `origin/main`, run `git merge --ff-only origin/main` and repeat the checks.

- [ ] **Step 2: Create the task branch**

Run:

```bash
git switch -c codex/22-phase-1-ux-ui-hardening
```

Expected: branch `codex/22-phase-1-ux-ui-hardening` is active.

- [ ] **Step 3: Move #22 from `Ready` to `In Progress`**

Run:

```bash
gh project item-list 5 --owner DoMo-98 --format json --limit 100
```

Then run:

```bash
gh project item-edit --id PVTI_lAHOA6Chp84BVxUjzgrlIZw --project-id PVT_kwHOA6Chp84BVxUj --field-id PVTSSF_lAHOA6Chp84BVxUjzhRKs98 --single-select-option-id f4184a44
```

Expected: issue #22 status in `dl-graph-studio Roadmap` is `In Progress`.

- [ ] **Step 4: Confirm branch and issue state**

Run:

```bash
git status --short --branch
gh issue view 22 --repo DoMo-98/dl-graph-studio --json projectItems,labels
```

Expected: on branch `codex/22-phase-1-ux-ui-hardening`, clean worktree, issue #22 has `ready` and Project status `In Progress`.

---

### Task 3: Run The Visual Review Gate Before New Visual Fixes

**Files:**

- Read: `src/App.tsx`
- Read: `src/styles.css`
- Output to user: visual findings table

- [ ] **Step 1: Start the app**

Run:

```bash
pnpm dev
```

Expected: Vite starts and prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 2: Inspect the default desktop editor flow**

Open the local app and exercise:

```md
- default app shell
- primitive node selection
- composite node selection
- inspector parameter editing
- valid connection creation
- invalid connection feedback
- connection deletion
- connection drawer collapse and expansion
- node dragging
- fit-view and zoom controls
- project export, reset, and import
```

Expected: each flow works; any visual or interaction issue is recorded, not fixed.

- [ ] **Step 3: Inspect responsive widths**

Repeat a lighter pass at these viewport widths:

```md
- 1440px wide desktop
- 1024px narrow desktop/tablet
- 390px mobile-width viewport
```

Expected: record visible overlap, unreachable controls, text clipping, broken hierarchy, unclear feedback, or density problems.

- [ ] **Step 4: Present findings and pause**

Send the product owner a table in this exact shape:

```md
| ID  | Finding | Affected screen/interaction | User impact | Recommendation | Risk/scope |
| --- | ------- | --------------------------- | ----------- | -------------- | ---------- |
```

Add one row per newly discovered finding. Use stable IDs in order: `V1`, `V2`, `V3`. If no newly discovered findings are found, send the table header followed by `No newly discovered visual findings.`.

Expected: stop implementation of newly discovered visual findings until the product owner approves specific IDs. Continue only with baseline #22 fixes while waiting if they do not overlap with the unapproved findings.

---

### Task 4: Cover Empty Canvas Click Deselection

**Files:**

- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing interaction test**

In `src/App.test.tsx`, add this test after `selects a composite node and shows basic inspector details`:

```tsx
it("clears node selection when the empty canvas background is clicked", () => {
  render(<App />);

  const neuronNode = screen.getByLabelText(/neuron primitive node/i);

  fireEvent.click(neuronNode);

  expect(neuronNode).toHaveAttribute("aria-pressed", "true");
  expect(
    within(
      screen.getByRole("complementary", { name: /node inspector/i }),
    ).getByRole("heading", { name: /neuron/i }),
  ).toBeInTheDocument();

  fireEvent.click(screen.getByRole("region", { name: /graph canvas/i }));

  expect(neuronNode).toHaveAttribute("aria-pressed", "false");
  expect(
    within(
      screen.getByRole("complementary", { name: /node inspector/i }),
    ).getByText(/no node selected/i),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Write the non-regression test for node clicks**

In `src/App.test.tsx`, add this test immediately after the previous one:

```tsx
it("does not clear selection when another canvas node is clicked", () => {
  render(<App />);

  const neuronNode = screen.getByLabelText(/neuron primitive node/i);
  const activationNode = screen.getByLabelText(/activation primitive node/i);

  fireEvent.click(neuronNode);
  fireEvent.click(activationNode);

  expect(neuronNode).toHaveAttribute("aria-pressed", "false");
  expect(activationNode).toHaveAttribute("aria-pressed", "true");
  expect(
    within(
      screen.getByRole("complementary", { name: /node inspector/i }),
    ).getByRole("heading", { name: /activation/i }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 3: Run the focused tests and verify the first one fails**

Run:

```bash
pnpm test -- src/App.test.tsx -t "clears node selection|does not clear selection"
```

Expected: the empty-canvas click test fails because the canvas section does not clear `selectedNodeId` yet.

- [ ] **Step 4: Implement minimal canvas background deselection**

In `src/App.tsx`, add this callback near the existing React Flow callbacks:

```tsx
const clearCanvasSelection = useCallback(() => {
  setSelectedNodeId(null);
}, []);
```

Then add the callback to the existing `<ReactFlow>` props:

```tsx
onPaneClick = { clearCanvasSelection };
```

If the React Testing Library test clicks the wrapper section and React Flow does not receive pane events in jsdom, add this guarded click handler to `<section className="graph-canvas" aria-label="Graph canvas">` instead:

```tsx
onClick={(event) => {
  if (event.target === event.currentTarget) {
    clearCanvasSelection();
  }
}}
```

Expected behavior: clicks on empty canvas clear selection; clicks inside nodes, ports, edges, controls, and drawers keep their existing handlers.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run:

```bash
pnpm test -- src/App.test.tsx -t "clears node selection|does not clear selection"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.test.tsx src/App.tsx
git commit -m "fix: clear canvas selection from empty background"
```

---

### Task 5: Make React Flow Attribution Handling Explicit

**Files:**

- Modify: `src/App.nodeDrag.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Confirm package support and license constraints**

Run:

```bash
rg -n "attribution|proOptions|hideAttribution" node_modules/@xyflow/react node_modules/@xyflow/system node_modules/@xyflow/core package.json
```

Expected: confirm whether `proOptions={{ hideAttribution: true }}` is supported and allowed by the installed React Flow package. If no supported option exists, do not implement a hidden workaround; document that attribution remains.

- [ ] **Step 2: Extend the React Flow mock if the supported option exists**

If `proOptions.hideAttribution` is supported, update `MockReactFlowProps` in `src/App.nodeDrag.test.tsx`:

```tsx
type MockReactFlowProps = {
  nodes: MockFlowNode[];
  edges: MockFlowEdge[];
  nodeTypes: Record<string, ComponentType<{ data: MockFlowNode["data"] }>>;
  nodesDraggable?: boolean;
  nodeExtent?: unknown;
  autoPanOnNodeDrag?: boolean;
  panOnDrag?: boolean;
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  zoomOnDoubleClick?: boolean;
  preventScrolling?: boolean;
  fitView?: boolean;
  fitViewOptions?: unknown;
  minZoom?: number;
  maxZoom?: number;
  proOptions?: { hideAttribution?: boolean };
  onNodesChange?: (
    changes: Array<{
      id: string;
      type: "position";
      positionAbsolute: { x: number; y: number };
    }>,
  ) => void;
  onConnect?: (connection: { source: string; target: string }) => void;
  children: ReactNode;
};
```

Add `proOptions` to the mocked ReactFlow argument list and expose it:

```tsx
data-hide-attribution={proOptions?.hideAttribution}
```

- [ ] **Step 3: Add the failing adapter assertion if the supported option exists**

In the existing viewport adapter test in `src/App.nodeDrag.test.tsx`, add:

```tsx
expect(reactFlow).toHaveAttribute("data-hide-attribution", "true");
```

- [ ] **Step 4: Implement the supported option**

In `src/App.tsx`, add this prop to `<ReactFlow>` only if Step 1 confirmed support:

```tsx
proOptions={{ hideAttribution: true }}
```

- [ ] **Step 5: Run the focused adapter test**

Run:

```bash
pnpm test -- src/App.nodeDrag.test.tsx
```

Expected: PASS if the option is implemented. If the package does not support a permitted attribution removal option, skip code changes for this task and record the reason in the PR verification.

- [ ] **Step 6: Commit if code changed**

```bash
git add src/App.nodeDrag.test.tsx src/App.tsx
git commit -m "fix: hide react flow attribution when allowed"
```

---

### Task 6: Unify Editor Feedback Toast Behavior

**Files:**

- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Optional Modify: `src/useProjectFileWorkflow.ts`

- [ ] **Step 1: Define the unified feedback contract in tests**

In `src/App.test.tsx`, add this test after `rejects duplicate connections with clear feedback`:

```tsx
it("uses one editor toast surface for connection feedback", () => {
  render(<App />);

  fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
  fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
  fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
  fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));

  const alert = screen.getByRole("alert");

  expect(alert).toHaveClass("editor-toast");
  expect(alert).toHaveTextContent(/that connection already exists/i);
  expect(screen.queryByText(/^Project exported\\.$/i)).not.toBeInTheDocument();
});
```

Add this test after `deletes one chosen connection while preserving nodes and other connections`:

```tsx
it("uses the same editor toast surface for connection deletion", () => {
  render(<App />);

  fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
  fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
  fireEvent.click(screen.getByLabelText(/delete connection tensor to neuron/i));

  const alert = screen.getByRole("alert");

  expect(alert).toHaveClass("editor-toast");
  expect(alert).toHaveTextContent(/tensor -> neuron deleted/i);
});
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
pnpm test -- src/App.test.tsx -t "editor toast surface|connection feedback"
```

Expected: FAIL because connection feedback currently uses `connection-feedback`, not the unified toast class.

- [ ] **Step 3: Update connection feedback markup**

In `src/App.tsx`, replace the current connection feedback block:

```tsx
{
  connectionFeedback ? (
    <div className="connection-feedback" role="alert">
      <AlertTriangle size={16} aria-hidden="true" />
      <span>{connectionFeedback}</span>
    </div>
  ) : null;
}
```

with:

```tsx
{
  connectionFeedback ? (
    <div className="editor-toast connection-feedback" role="alert">
      <AlertTriangle size={16} aria-hidden="true" />
      <span>{connectionFeedback}</span>
    </div>
  ) : null;
}
```

In the project toast block, keep `role="status"` and add the shared class:

```tsx
{
  projectToast ? (
    <div className="editor-toast project-toast" role="status">
      {projectToast}
    </div>
  ) : null;
}
```

- [ ] **Step 4: Add shared toast styling without changing placement semantics**

In `src/styles.css`, add or adjust shared toast styles so `.editor-toast` owns common visual treatment and `.project-toast` / `.connection-feedback` keep their existing placement:

```css
.editor-toast {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
  background: rgb(15 23 42 / 94%);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: var(--shadow-node);
  font-size: 0.82rem;
  font-weight: 700;
}
```

Remove duplicated visual declarations from `.project-toast` and `.connection-feedback` only when `.editor-toast` now supplies them. Keep coordinates, z-index, and max-width declarations on the specific classes.

- [ ] **Step 5: Run the focused tests and verify they pass**

Run:

```bash
pnpm test -- src/App.test.tsx -t "editor toast surface|connection feedback"
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/App.test.tsx src/App.tsx src/styles.css
git commit -m "fix: unify editor toast surfaces"
```

---

### Task 7: Implement Product-Owner-Approved Visual Findings

**Files:**

- Modify only files required by approved findings, usually `src/styles.css`, `src/App.tsx`, or focused tests.

- [ ] **Step 1: Record approved finding IDs**

Create a short local note in the PR draft or working notes with exactly the IDs approved by the product owner:

```md
Approved for #22:

- V1: use the exact approved finding title from the visual review table
- V3: use the exact approved finding title from the visual review table
```

Expected: no unapproved finding is implemented.

- [ ] **Step 2: For each approved finding, write or update a focused test when behavior can regress**

For an approved interaction finding, add a React Testing Library test in `src/App.test.tsx` near related behavior. Example shape:

```tsx
it("keeps the approved visual or interaction behavior stable", () => {
  render(<App />);

  fireEvent.click(screen.getByLabelText(/tensor primitive node/i));

  expect(
    within(
      screen.getByRole("complementary", { name: /node inspector/i }),
    ).getByRole("heading", { name: /tensor/i }),
  ).toBeInTheDocument();
});
```

Use a real assertion tied to the approved finding. Do not add tests for purely visual color or spacing choices unless the behavior is observable through DOM structure, classes, ARIA, visibility, or text.

- [ ] **Step 3: Apply the smallest approved CSS or markup changes**

For each approved small visual finding, prefer one of these bounded change shapes:

```css
.topbar-project {
  min-width: 0;
}
```

```css
.connection-list-item span {
  overflow-wrap: anywhere;
}
```

```tsx
<button
  type="button"
  className="connection-drawer-toggle"
  aria-label={connectionsPanelToggleLabel}
  title={connectionsPanelToggleLabel}
>
  <ChevronDown size={16} aria-hidden="true" />
</button>
```

Expected: changes are small, local, and tied to approved findings.

- [ ] **Step 4: Run focused tests for approved behavior**

Run the focused tests touched for approved findings:

```bash
pnpm test -- src/App.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit approved findings**

```bash
git add src/App.test.tsx src/App.tsx src/styles.css
git commit -m "fix: apply approved phase 1 visual hardening"
```

If no newly discovered findings are approved, skip this task and document that no additional visual fixes were approved.

---

### Task 8: Full Verification And PR Evidence

**Files:**

- Read/verify: whole app
- External: screenshots or short recording for PR body

- [ ] **Step 1: Run full automated checks**

Run:

```bash
pnpm lint
pnpm test
pnpm build
```

Expected: all commands pass.

- [ ] **Step 2: Run manual verification**

Start the app:

```bash
pnpm dev
```

Verify:

```md
- Open the Phase 1 editor flow.
- Select primitive and composite nodes.
- Edit Tensor shape, Neuron bias, Activation function, and Dense / Linear units.
- Create a valid Tensor -> Neuron connection.
- Attempt a duplicate Tensor -> Neuron connection and confirm feedback appears in the unified editor toast style.
- Attempt Neuron -> Tensor and confirm invalid-connection feedback appears.
- Delete one connection and confirm remaining connections persist.
- Collapse and expand the connections panel.
- Drag at least one primitive node and the composite node.
- Use pan, zoom, and fit-view controls.
- Export the current project.
- Reset the project.
- Import the exported project and confirm state returns.
- Select a node, click the empty canvas background, and confirm the inspector returns to "No node selected".
- Confirm node clicks, port clicks, edge interactions, and canvas controls do not accidentally clear selection.
- Confirm the React Flow attribution outcome matches the implementation decision.
```

Expected: each manual step behaves as described.

- [ ] **Step 3: Capture PR evidence**

Capture screenshots or a short recording showing:

```md
- default editor surface,
- selected node and inspector,
- connection feedback toast,
- collapsed and expanded connection drawer,
- canvas controls/fit-view,
- no node selected after empty canvas click.
```

Expected: evidence is ready to attach or link in the PR description.

- [ ] **Step 4: Update Project status and open PR**

Push the branch:

```bash
git push -u origin codex/22-phase-1-ux-ui-hardening
```

Open a draft PR that includes:

```md
Closes #22

## Summary

- Fixed baseline Phase 1 hardening findings from #22.
- Applied only product-owner-approved visual review findings, or state that no newly discovered findings were approved.
- Documented deferred findings and follow-up recommendations where applicable.

## Verification

- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] Manual Phase 1 flow verified
- [ ] Screenshots or recording attached

## Visual review gate

| ID  | Finding | Decision |
| --- | ------- | -------- |
```

Add one row per visual review finding using the same IDs from Task 3.

Expected: PR links #22 with `Closes #22`; issue #22 Project status moves to `In Review`.

---

## Plan Self-Review

- Spec coverage: Tasks cover issue readiness, visual review gate, pre-approved #22 fixes, product-owner approval for new findings, follow-up recommendations, automated checks, manual verification, and PR evidence.
- Placeholder scan: no `TBD`, `TODO`, `FIXME`, or unresolved placeholders are present. Runtime-specific visual finding rows are intentionally generated during Task 3 after inspecting the app.
- Type consistency: planned React changes use existing state names (`selectedNodeId`, `connectionFeedback`, `projectToast`), existing test files, existing React Flow props, and existing CSS classes.
- Scope check: the plan excludes new capabilities, broad redesign, dependencies, persistence changes, and unapproved visual fixes.
