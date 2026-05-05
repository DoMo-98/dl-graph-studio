# Canvas Viewport Navigation Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible pan, zoom, and fit-view support to the Phase 1 graph canvas while preserving existing graph editing, bounded dragging, and project state behavior.

**Architecture:** Keep `src/App.tsx` as the React Flow adapter boundary. Use React Flow's built-in viewport props and `Controls` component instead of custom viewport state. Keep canvas extent measurement, node extents, graph model state, connection behavior, and persistence unchanged.

**Tech Stack:** React 19, TypeScript, Vite, React Flow (`@xyflow/react`), lucide-react, Vitest, React Testing Library, CSS.

---

> **Scope update:** The bounded node placement parts of this original plan were
> superseded after the PR added viewport navigation. Use
> `docs/superpowers/plans/2026-05-05-free-canvas-node-placement.md` for the
> follow-up implementation that removes `nodeExtent`, per-node `extent`, and
> resize-time position clamping while preserving pan, zoom, controls, and
> fit-view.

## File Structure

- Modify `src/App.tsx`
  - Import `Controls` from `@xyflow/react`.
  - Configure React Flow viewport navigation props on the existing `<ReactFlow>`.
  - Render React Flow `Controls` inside the existing canvas.
- Modify `src/styles.css`
  - Style React Flow controls to match the existing canvas-first lab UI.
  - Keep controls reachable and legible over the canvas.
- Modify `src/App.nodeDrag.test.tsx`
  - Extend the React Flow mock to expose viewport props.
  - Mock and assert `Controls` rendering.
  - Add focused adapter assertions for pan, zoom, fit-view, and zoom bounds.

No new files, dependencies, provider components, minimap, custom toolbar, graph model fields, or persistence changes are needed.

## Task 1: Cover Viewport Controls In The React Flow Adapter Test

**Files:**

- Modify: `src/App.nodeDrag.test.tsx`

- [ ] **Step 1: Extend the test mock types before changing app code**

In `src/App.nodeDrag.test.tsx`, update `MockReactFlowProps` so the mock captures the viewport props the app will pass:

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

In the `vi.mock("@xyflow/react", () => ({ ... }))` object, add a `Controls` mock:

```tsx
Controls: ({ fitViewOptions }: { fitViewOptions?: unknown }) => (
  <div data-testid="flow-controls" data-fit-view-options={JSON.stringify(fitViewOptions)}>
    React Flow controls
  </div>
),
```

In the mocked `ReactFlow` parameter list, add the new props:

```tsx
ReactFlow: ({
  nodes,
  edges,
  nodeTypes,
  nodesDraggable,
  nodeExtent,
  autoPanOnNodeDrag,
  panOnDrag,
  zoomOnScroll,
  zoomOnPinch,
  zoomOnDoubleClick,
  preventScrolling,
  fitView,
  fitViewOptions,
  minZoom,
  maxZoom,
  onNodesChange,
  onConnect,
  children,
}: MockReactFlowProps) => {
```

Add these data attributes to the mocked React Flow wrapper `<div data-testid="react-flow" ...>`:

```tsx
data-pan-on-drag={panOnDrag}
data-zoom-on-scroll={zoomOnScroll}
data-zoom-on-pinch={zoomOnPinch}
data-zoom-on-double-click={zoomOnDoubleClick}
data-prevent-scrolling={preventScrolling}
data-fit-view={fitView}
data-fit-view-options={JSON.stringify(fitViewOptions)}
data-min-zoom={minZoom}
data-max-zoom={maxZoom}
```

- [ ] **Step 2: Add the failing adapter assertions**

In the existing test named `passes a visual-safe canvas extent to React Flow and persists clamped node positions from drag changes`, add these assertions immediately after the existing `data-auto-pan-on-node-drag` assertion:

```tsx
expect(reactFlow).toHaveAttribute("data-pan-on-drag", "true");
expect(reactFlow).toHaveAttribute("data-zoom-on-scroll", "true");
expect(reactFlow).toHaveAttribute("data-zoom-on-pinch", "true");
expect(reactFlow).toHaveAttribute("data-zoom-on-double-click", "false");
expect(reactFlow).toHaveAttribute("data-prevent-scrolling", "true");
expect(reactFlow).toHaveAttribute("data-fit-view", "true");
expect(reactFlow).toHaveAttribute("data-min-zoom", "0.6");
expect(reactFlow).toHaveAttribute("data-max-zoom", "1.5");
expect(reactFlow).toHaveAttribute(
  "data-fit-view-options",
  JSON.stringify({ padding: 0.18 }),
);
expect(screen.getByTestId("flow-controls")).toHaveAttribute(
  "data-fit-view-options",
  JSON.stringify({ padding: 0.18 }),
);
```

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
pnpm test -- src/App.nodeDrag.test.tsx
```

Expected: FAIL because `Controls` is not imported or rendered yet and the React Flow viewport props still have the old disabled values.

- [ ] **Step 4: Commit the failing test**

```bash
git add src/App.nodeDrag.test.tsx
git commit -m "test: cover canvas viewport navigation controls"
```

## Task 2: Enable React Flow Viewport Navigation

**Files:**

- Modify: `src/App.tsx`

- [ ] **Step 1: Import React Flow Controls**

In `src/App.tsx`, update the `@xyflow/react` import:

```tsx
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
} from "@xyflow/react";
```

- [ ] **Step 2: Configure viewport props on the existing ReactFlow instance**

In `src/App.tsx`, replace the current viewport prop block:

```tsx
panOnDrag={false}
zoomOnScroll={false}
zoomOnPinch={false}
zoomOnDoubleClick={false}
autoPanOnNodeDrag={false}
preventScrolling={false}
defaultViewport={{ x: 0, y: 0, zoom: 1 }}
```

with:

```tsx
panOnDrag={true}
zoomOnScroll={true}
zoomOnPinch={true}
zoomOnDoubleClick={false}
autoPanOnNodeDrag={false}
preventScrolling={true}
fitView={true}
fitViewOptions={{ padding: 0.18 }}
minZoom={0.6}
maxZoom={1.5}
```

Rationale:

- `panOnDrag={true}` lets the canvas viewport move without changing project node positions.
- `zoomOnScroll={true}` and `zoomOnPinch={true}` provide direct zoom interactions.
- `zoomOnDoubleClick={false}` avoids accidental viewport jumps during node selection.
- `autoPanOnNodeDrag={false}` preserves the existing bounded node-drag contract.
- `preventScrolling={true}` keeps wheel gestures focused on the graph surface.
- `fitView` and `fitViewOptions` make the initial graph visible with padding.
- `minZoom` and `maxZoom` match the approved spec.

- [ ] **Step 3: Render standard React Flow controls**

In the same `<ReactFlow>` children, keep `Background` and add `Controls` after it:

```tsx
<Background color="var(--canvas-grid)" gap={24} size={2} />
<Controls
  fitViewOptions={{ padding: 0.18 }}
  showInteractive={false}
  position="bottom-left"
/>
```

Rationale:

- `showInteractive={false}` keeps the controls limited to zoom in, zoom out, and fit view.
- `position="bottom-left"` keeps controls inside the canvas and away from the inspector.

- [ ] **Step 4: Run the focused test and verify it passes**

Run:

```bash
pnpm test -- src/App.nodeDrag.test.tsx
```

Expected: PASS. The existing node extent, drag clamp, and React Flow connection adapter assertions should still pass.

- [ ] **Step 5: Commit the viewport behavior**

```bash
git add src/App.tsx src/App.nodeDrag.test.tsx
git commit -m "feat: enable canvas viewport navigation"
```

## Task 3: Style React Flow Controls For The Existing Canvas

**Files:**

- Modify: `src/styles.css`

- [ ] **Step 1: Add control styles**

In `src/styles.css`, add the following block after the existing `.graph-canvas .react-flow__attribution` rule:

```css
.graph-canvas .react-flow__controls {
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: var(--shadow-soft);
}

.graph-canvas .react-flow__controls-button {
  width: 34px;
  height: 34px;
  color: var(--ink);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
}

.graph-canvas .react-flow__controls-button:last-child {
  border-bottom: 0;
}

.graph-canvas .react-flow__controls-button:hover,
.graph-canvas .react-flow__controls-button:focus-visible {
  color: #ffffff;
  background: var(--teal-strong);
  outline: none;
}

.graph-canvas .react-flow__controls-button svg {
  max-width: 16px;
  max-height: 16px;
  fill: currentColor;
}
```

Rationale: these styles use existing tokens and make the controls visible without introducing a new toolbar or redesigning the canvas.

- [ ] **Step 2: Run formatting and focused test**

Run:

```bash
pnpm format:check
pnpm test -- src/App.nodeDrag.test.tsx
```

Expected: both commands PASS.

- [ ] **Step 3: Commit the control styling**

```bash
git add src/styles.css
git commit -m "style: align canvas viewport controls"
```

## Task 4: Run Full Automated Verification

**Files:**

- No planned file changes.

- [ ] **Step 1: Run the issue verification commands**

Run:

```bash
pnpm lint
pnpm test
pnpm build
```

Expected: all commands PASS.

- [ ] **Step 2: Fix only failures caused by this branch**

If a failure points to the viewport changes, make the smallest scoped fix. Do not refactor unrelated App behavior.

Examples of scoped fixes:

- If TypeScript rejects a `Controls` prop name, adjust only the `Controls` JSX to a valid React Flow prop while preserving zoom in, zoom out, and fit-view controls.
- If a mock assertion fails because React serializes a boolean attribute differently, adjust the mock data attribute conversion in `src/App.nodeDrag.test.tsx` to a stable string.
- If formatting fails in touched files, run the repository formatter or manually match the existing formatting.

- [ ] **Step 3: Commit verification fixes if any were needed**

If files changed during this task:

```bash
git add src/App.tsx src/App.nodeDrag.test.tsx src/styles.css
git commit -m "fix: stabilize canvas viewport verification"
```

If no files changed, do not create an empty commit.

## Task 5: Manual Browser Verification And PR Evidence

**Files:**

- Create screenshots or video/GIF under an issue-specific verification path only if the project convention requires storing them in-repo for the PR.

- [ ] **Step 1: Start the dev server**

Run:

```bash
pnpm dev
```

Expected: Vite starts and prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 2: Verify canvas controls and navigation manually**

Open the Vite URL and verify:

- The graph editor canvas renders with the existing primitive and composite nodes.
- React Flow controls are visible inside the canvas.
- Zoom in and zoom out controls change the viewport scale.
- Fit view brings the default graph back into the visible canvas after panning or zooming away.
- Dragging nodes still moves nodes within the bounded canvas area.
- Connection creation and visible connection rendering still work.
- The connection drawer and validation feedback do not make the viewport controls unreachable in normal desktop layout.

- [ ] **Step 3: Verify narrower responsive width**

Resize the browser to a narrower editor width and verify:

- The canvas remains visible.
- React Flow controls remain reachable.
- Fit view still returns graph elements to the visible canvas.
- Node labels remain readable at practical zoom levels.

- [ ] **Step 4: Capture PR evidence**

Capture screenshots or a short video/GIF showing:

- the visible controls,
- a panned or zoomed canvas,
- fit view returning the graph to view,
- a narrower viewport with controls still reachable.

- [ ] **Step 5: Stop the dev server**

Stop the running `pnpm dev` process with `Ctrl-C` after verification is complete.

## Self-Review Notes

Spec coverage:

- Visible pan/zoom/fit-view controls: Task 2 adds `Controls`, pan, zoom, and fit-view props; Task 1 tests them.
- Recoverability: Task 2 enables `fitView` and a fit-view control; Task 5 manually verifies recovery after panning/zooming away.
- Readability: Task 2 sets `minZoom={0.6}` and `maxZoom={1.5}`; Task 5 checks practical readability.
- Responsive usability: Task 3 keeps controls compact and in-canvas; Task 5 verifies narrower widths.
- Scope control: No graph model, persistence, connection, dependency, minimap, or custom toolbar work appears in the plan.

Placeholder scan:

- No incomplete placeholders or deferred implementation notes are present.
- The only conditional step is verification repair, scoped to failures caused by this branch.

Type consistency:

- The plan uses existing `src/App.tsx` React Flow prop names plus `Controls`.
- Test mock props match the planned JSX prop names.
