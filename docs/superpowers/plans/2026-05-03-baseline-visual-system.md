# Baseline Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Direction B, Canvas-first Lab, to the Phase 1 editor without changing graph-editing behavior.

**Architecture:** Keep the React component structure intact and concentrate the visual system in `src/styles.css`. Touch `src/App.tsx` only for inline React Flow edge styling that cannot be expressed through CSS variables.

**Tech Stack:** React 19, TypeScript, Vite, React Flow, Tailwind CSS import, Vitest, Testing Library, browser verification through the in-app browser.

---

## File Structure

- Modify `src/styles.css`: design tokens, shell layout, panels, canvas, nodes, buttons, inspector, connection list, feedback, responsive behavior.
- Modify `src/App.tsx`: only if edge color and label background need to align with the new visual tokens.
- Keep `src/projectFile.ts` unchanged.
- Keep existing tests unless a visual-system change intentionally affects accessible labels or DOM contracts.
- Use `docs/verification/issue-17/visual-direction-board.png` as the approved visual exploration artifact.

## Task 1: Preserve Behavior Before Visual Edits

**Files:**

- Read: `src/App.test.tsx`
- Read: `src/App.nodeDrag.test.tsx`
- No production edits in this task.

- [ ] **Step 1: Run the current behavior tests before changing UI code**

Run:

```bash
pnpm run test
```

Expected: tests pass. If they fail before implementation, inspect the failure and stop to resolve the baseline before changing visual code.

- [ ] **Step 2: Capture a before screenshot**

Use the running dev server at `http://127.0.0.1:5173/` and capture:

```text
docs/verification/issue-17/before-editor.png
```

Expected: screenshot shows the current Phase 1 editor with sidebar, session panel, inspector, canvas, primitive nodes, and composite node.

## Task 2: Apply Canvas-First Visual System

**Files:**

- Modify: `src/styles.css`
- Modify: `src/App.tsx` only for React Flow edge colors and label backgrounds.

- [ ] **Step 1: Update visual tokens in `src/styles.css`**

Replace the existing `:root` token set with tokens for Direction B:

```css
:root {
  color-scheme: light;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  color: #111827;
  background: #f4f6f8;
  --surface: #ffffff;
  --surface-raised: #f9fafb;
  --surface-muted: #eef2f5;
  --canvas: #fbfcfd;
  --canvas-grid: #d7dee6;
  --ink: #111827;
  --ink-muted: #5f6b7a;
  --ink-soft: #7a8696;
  --border: #d8e0e7;
  --border-strong: #b8c4cf;
  --sidebar: #111827;
  --sidebar-muted: #a8b3c2;
  --accent: #ff6d2d;
  --accent-strong: #d84f12;
  --accent-soft: #fff0e8;
  --teal: #13a89e;
  --teal-strong: #087c75;
  --teal-soft: #e7f8f6;
  --danger: #b42318;
  --danger-soft: #fff0ee;
  --shadow-soft: 0 10px 30px rgb(17 24 39 / 8%);
  --shadow-node: 0 12px 28px rgb(17 24 39 / 12%);
  --focus-ring: 0 0 0 3px rgb(255 109 45 / 22%);
}
```

- [ ] **Step 2: Make the layout canvas-first**

Update shell/workspace/panel styles so the canvas is primary:

```css
.app-shell {
  display: grid;
  min-height: 100vh;
  grid-template-columns: 236px minmax(0, 1fr);
  background: var(--surface-muted);
}

.sidebar {
  gap: 22px;
  padding: 20px 14px;
  color: #f8fafc;
  background: var(--sidebar);
  border-right: 1px solid rgb(255 255 255 / 8%);
}

.workspace {
  gap: 16px;
  padding: 20px;
}

.workbench {
  grid-template-columns: minmax(220px, 284px) minmax(0, 1fr);
  align-items: start;
  gap: 14px;
}

.workspace-panel,
.graph-canvas {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow-soft);
}

.graph-canvas {
  min-height: 960px;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 80%);
}
```

- [ ] **Step 3: Restyle controls and panels as compact workflow tooling**

Apply compact button, status, session, inspector, and nav treatment with 6-8px radii, clear focus states, and no oversized cards. Preserve existing text labels and roles.

- [ ] **Step 4: Restyle primitive and composite nodes**

Keep fixed node dimensions and class names, but restyle:

```css
.architecture-node {
  background: #ffffff;
  border: 1px solid var(--border-strong);
  border-left: 4px solid var(--teal);
  border-radius: 8px;
  box-shadow: var(--shadow-node);
}

.architecture-node.composite-node {
  background: linear-gradient(180deg, #fffaf6, #ffffff);
  border-color: rgb(255 109 45 / 48%);
  border-left-color: var(--accent);
}

.architecture-node:hover,
.architecture-node:focus-visible,
.architecture-node.selected {
  border-color: var(--accent);
  box-shadow: var(--focus-ring), var(--shadow-node);
}
```

Preserve source, target, selected, moving, and composite state distinctions.

- [ ] **Step 5: Align React Flow edge styling in `src/App.tsx`**

If needed, change the inline edge styling to use the Direction B teal/orange system:

```ts
markerEnd: {
  type: MarkerType.ArrowClosed,
  width: 16,
  height: 16,
  color: "#087c75",
},
style: {
  stroke: "#087c75",
  strokeWidth: 2,
},
labelBgStyle: {
  fill: "#ffffff",
  fillOpacity: 0.96,
},
```

Do not change edge IDs, labels, connection behavior, or validation behavior.

## Task 3: Verify And Capture After State

**Files:**

- Read: `src/App.test.tsx`
- Read: `src/App.nodeDrag.test.tsx`
- Create: `docs/verification/issue-17/after-editor.png`

- [ ] **Step 1: Run automated checks**

Run:

```bash
pnpm run test
pnpm run lint
pnpm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Manually verify core editor flow in browser**

At `http://127.0.0.1:5173/`:

```text
1. Select Tensor, Neuron, Activation, Dense / Linear, and Dense Block.
2. Edit Dense / Linear units.
3. Create Tensor -> Neuron and Neuron -> Activation.
4. Try a duplicate connection and a connection into Tensor.
5. Delete one connection.
6. Export, reset, and import a saved project if practical.
7. Drag one primitive node and the composite node.
```

Expected: behavior remains stable and the visual treatment follows Direction B.

- [ ] **Step 3: Capture after screenshot**

Save:

```text
docs/verification/issue-17/after-editor.png
```

Expected: screenshot shows the implemented Direction B surface with visible canvas, nodes, inspector/session controls, and status/feedback styling.

## Self-Review Checklist

- [ ] No new product capability was added.
- [ ] No dependency change was introduced.
- [ ] Labels, roles, test ids, and connection label format remain stable.
- [ ] Primitive and composite nodes remain visually distinct.
- [ ] Selection, hover/focus, dragging, connection, validation, empty, and project status states are visually consistent.
- [ ] Before/after screenshots and the generated direction board are available under `docs/verification/issue-17/`.
