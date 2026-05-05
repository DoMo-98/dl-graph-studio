# Free Canvas Node Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow graph nodes to be dragged and persisted at free React Flow coordinates instead of clamping them to the visible canvas rectangle.

**Architecture:** Keep `src/App.tsx` as the React Flow adapter boundary. Remove the measured-canvas position boundary from the adapter: no `nodeExtent`, no per-node `extent`, no resize-time clamp, and no canvas-size-gated React Flow render. Preserve viewport navigation props, controls, fit-view, and zoom limits.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, React Flow (`@xyflow/react`).

---

## File Structure

- Modify `src/App.nodeDrag.test.tsx`: update the React Flow adapter tests so they assert free node placement and continued viewport navigation configuration.
- Modify `src/App.tsx`: remove canvas extent measurement/clamping helpers and stop passing React Flow node bounds.
- Modify `docs/superpowers/plans/2026-05-05-canvas-viewport-navigation-hardening.md`: align the existing PR implementation plan with the approved free-placement scope so future readers do not see conflicting instructions.

No new runtime files, dependencies, graph model fields, or CSS changes are needed.

### Task 1: Update Adapter Tests For Free Node Placement

**Files:**
- Modify: `src/App.nodeDrag.test.tsx`

- [ ] **Step 1: Replace bounded-drag assertions with free-placement assertions**

In `src/App.nodeDrag.test.tsx`, replace the two tests named:

- `passes a visual-safe canvas extent to React Flow and persists clamped node positions from drag changes`
- `keeps controlled node state aligned with React Flow clamp semantics on tiny canvases`

with this code:

```tsx
  it("passes viewport controls to React Flow and persists free node positions from drag changes", async () => {
    render(<App />);

    const reactFlow = await screen.findByTestId("react-flow");

    expect(reactFlow).toHaveAttribute("data-nodes-draggable", "true");
    expect(reactFlow).toHaveAttribute("data-has-node-extent", "false");
    expect(reactFlow).not.toHaveAttribute("data-node-extent");
    expect(reactFlow).not.toHaveAttribute("data-initial-node-extent");
    expect(reactFlow).toHaveAttribute("data-auto-pan-on-node-drag", "false");
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
    expect(screen.getByTestId("flow-node-tensor")).not.toHaveAttribute(
      "data-node-extent",
    );
    expect(screen.getByTestId("flow-node-dense-block")).not.toHaveAttribute(
      "data-node-extent",
    );

    fireEvent.click(screen.getByRole("button", { name: "Move Tensor" }));

    const tensorFlowNode = screen.getByTestId("flow-node-tensor");
    expect(tensorFlowNode).toHaveAttribute("data-x", "128");
    expect(tensorFlowNode).toHaveAttribute("data-y", "112");

    fireEvent.click(screen.getByRole("button", { name: "Move Dense Block" }));

    const denseBlockFlowNode = screen.getByTestId("flow-node-dense-block");
    expect(denseBlockFlowNode).toHaveAttribute("data-x", "1500");
    expect(denseBlockFlowNode).toHaveAttribute("data-y", "1500");
  });

  it("does not rewrite controlled node positions when the canvas is tiny", async () => {
    graphCanvasSize = { width: 10, height: 10 };

    render(<App />);

    const reactFlow = await screen.findByTestId("react-flow");

    expect(reactFlow).toHaveAttribute("data-has-node-extent", "false");
    expect(reactFlow).not.toHaveAttribute("data-node-extent");
    expect(screen.getByTestId("flow-node-tensor")).not.toHaveAttribute(
      "data-node-extent",
    );
    expect(screen.getByTestId("flow-node-tensor")).toHaveAttribute(
      "data-x",
      "96",
    );
    expect(screen.getByTestId("flow-node-tensor")).toHaveAttribute(
      "data-y",
      "64",
    );
  });
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm test -- src/App.nodeDrag.test.tsx
```

Expected: FAIL. The current implementation still passes `nodeExtent`, still renders per-node extents, and still clamps the oversized Dense Block drag to the visible canvas bounds instead of persisting `1500,1500`.

- [ ] **Step 3: Commit the failing test**

Run:

```bash
git add src/App.nodeDrag.test.tsx
git commit -m "test: cover free canvas node placement"
```

### Task 2: Remove Canvas Position Bounds From App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Remove unused React and React Flow types/imports**

In `src/App.tsx`, remove `useLayoutEffect` and `useRef` from the React import, and remove `CoordinateExtent` from the React Flow type import.

The imports should become:

```ts
import {
  useCallback,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
```

- [ ] **Step 2: Delete canvas extent and clamp helpers**

In `src/App.tsx`, delete these helper functions entirely:

```ts
function getCanvasNodeExtent(size: {
  width: number;
  height: number;
}): CoordinateExtent {
  return [
    [0, 0],
    [size.width, size.height],
  ];
}

function getCanvasElementNodeExtent(
  graphCanvasElement: HTMLElement,
): CoordinateExtent | null {
  const { width: rectWidth, height: rectHeight } =
    graphCanvasElement.getBoundingClientRect();
  const width = graphCanvasElement.clientWidth || rectWidth;
  const height = graphCanvasElement.clientHeight || rectHeight;

  if (width <= 0 || height <= 0) {
    return null;
  }

  return getCanvasNodeExtent({ width, height });
}

function areCanvasNodeExtentsEqual(
  firstExtent: CoordinateExtent | null,
  secondExtent: CoordinateExtent,
) {
  return Boolean(
    firstExtent &&
    firstExtent[0][0] === secondExtent[0][0] &&
    firstExtent[0][1] === secondExtent[0][1] &&
    firstExtent[1][0] === secondExtent[1][0] &&
    firstExtent[1][1] === secondExtent[1][1],
  );
}

function getCanvasNodeExtentKey(canvasNodeExtent: CoordinateExtent) {
  return `${canvasNodeExtent[0][0]}:${canvasNodeExtent[0][1]}:${canvasNodeExtent[1][0]}:${canvasNodeExtent[1][1]}`;
}

function getGraphNodeVisualOverflow(node: GraphNode) {
  return node.type === "composite"
    ? compositeNodeVisualOverflow
    : primitiveNodeVisualOverflow;
}

function getGraphNodeExtent(
  node: GraphNode,
  canvasNodeExtent: CoordinateExtent,
): CoordinateExtent {
  const [[minX, minY], [maxX, maxY]] = canvasNodeExtent;
  const overflow = getGraphNodeVisualOverflow(node);

  // React Flow clamps the measured node body; reserve only each node type's visible overflow.
  return [
    [minX + overflow.left, minY],
    [maxX - overflow.right, maxY - overflow.bottom],
  ];
}

function clampCanvasNodePosition(
  position: GraphNode["position"],
  node: GraphNode,
  canvasNodeExtent: CoordinateExtent,
): GraphNode["position"] {
  const [[minX, minY], [maxX, maxY]] = getGraphNodeExtent(
    node,
    canvasNodeExtent,
  );
  const nodeSize = getFlowNodeSize(node);
  const maxPositionX = maxX - nodeSize.width;
  const maxPositionY = maxY - nodeSize.height;

  return {
    x: Math.min(Math.max(position.x, minX), maxPositionX),
    y: Math.min(Math.max(position.y, minY), maxPositionY),
  };
}

function clampGraphNodesToCanvas(
  nodes: GraphNode[],
  canvasNodeExtent: CoordinateExtent,
) {
  const positionUpdates = nodes.map((node) => ({
    id: node.id,
    position: clampCanvasNodePosition(node.position, node, canvasNodeExtent),
  }));
  const hasChangedPosition = positionUpdates.some((update) => {
    const currentNode = nodes.find((node) => node.id === update.id);

    return (
      currentNode?.position.x !== update.position.x ||
      currentNode.position.y !== update.position.y
    );
  });

  return hasChangedPosition
    ? updateGraphNodePositions(nodes, positionUpdates)
    : nodes;
}
```

Also delete these constants if TypeScript reports they are unused after the helper removal:

```ts
const primitiveNodeVisualOverflow = {
  left: 6,
  right: 12,
  bottom: 12,
};

const compositeNodeVisualOverflow = {
  left: 0,
  right: 0,
  bottom: 0,
};
```

- [ ] **Step 3: Remove canvas extent state and resize effects**

In `App`, delete:

```ts
  const graphCanvasRef = useRef<HTMLElement | null>(null);
  const [canvasNodeExtent, setCanvasNodeExtent] =
    useState<CoordinateExtent | null>(null);
```

Delete both `useLayoutEffect` blocks that start with:

```ts
  useLayoutEffect(() => {
    const graphCanvasElement = graphCanvasRef.current;
```

and:

```ts
  useLayoutEffect(() => {
    if (!canvasNodeExtent || graphNodes.length === 0) {
```

- [ ] **Step 4: Stop assigning per-node extents**

In the `canvasNodes` `useMemo`, replace the `commonNode` object with:

```ts
        const commonNode = {
          id: node.id,
          position: node.position,
          width: nodeSize.width,
          height: nodeSize.height,
          initialWidth: nodeSize.width,
          initialHeight: nodeSize.height,
          measured: nodeSize,
          selected: selectedNodeId === node.id,
          selectable: true,
          draggable: true,
        };
```

In the dependency array for the same `useMemo`, remove `canvasNodeExtent` so it becomes:

```ts
    [
      completeGraphConnection,
      connectionSource?.label,
      connectionSourceId,
      draggedNodeId,
      graphNodes,
      selectedNodeId,
    ],
```

- [ ] **Step 5: Render React Flow without canvas extent gating**

In the canvas section, replace the current conditional render:

```tsx
            {canvasNodeExtent ? (
              <ReactFlow
                key={getCanvasNodeExtentKey(canvasNodeExtent)}
                nodes={canvasNodes}
                edges={canvasEdges}
                nodeTypes={nodeTypes}
                nodeExtent={canvasNodeExtent}
```

with:

```tsx
            <ReactFlow
              nodes={canvasNodes}
              edges={canvasEdges}
              nodeTypes={nodeTypes}
```

Keep the existing viewport and interaction props:

```tsx
              onConnect={handleReactFlowConnect}
              onNodesChange={handleCanvasNodesChange}
              onNodeDragStart={(_, node) => setDraggedNodeId(node.id)}
              onNodeDragStop={() => setDraggedNodeId(null)}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={false}
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
            >
              <Background color="var(--canvas-grid)" gap={24} size={2} />
              <Controls
                fitViewOptions={{ padding: 0.18 }}
                showInteractive={false}
                position="bottom-left"
              />
            </ReactFlow>
```

Remove the matching `) : null}` or equivalent closing conditional that belonged to `canvasNodeExtent`.

Remove the `ref` prop from the surrounding `<section>` so it remains:

```tsx
          <section className="graph-canvas" aria-label="Graph canvas">
```

- [ ] **Step 6: Run the focused test and verify it passes**

Run:

```bash
pnpm test -- src/App.nodeDrag.test.tsx
```

Expected: PASS. The test should confirm no React Flow node bounds are configured, free drag positions persist, viewport props remain enabled, and tiny canvas sizing does not rewrite saved node positions.

- [ ] **Step 7: Commit the implementation**

Run:

```bash
git add src/App.tsx
git commit -m "feat: allow free canvas node placement"
```

### Task 3: Mark The Existing PR Plan As Superseded For Placement Bounds

**Files:**
- Modify: `docs/superpowers/plans/2026-05-05-canvas-viewport-navigation-hardening.md`

- [ ] **Step 1: Add a scope update notice to the existing plan**

In `docs/superpowers/plans/2026-05-05-canvas-viewport-navigation-hardening.md`, add this block immediately after the introductory header section and before the first task:

```markdown
> **Scope update:** The bounded node placement parts of this original plan were
> superseded after the PR added viewport navigation. Use
> `docs/superpowers/plans/2026-05-05-free-canvas-node-placement.md` for the
> follow-up implementation that removes `nodeExtent`, per-node `extent`, and
> resize-time position clamping while preserving pan, zoom, controls, and
> fit-view.
```

- [ ] **Step 2: Verify the scope update is present**

Run:

```bash
rg -n "Scope update|free-canvas-node-placement|resize-time position clamping" docs/superpowers/plans/2026-05-05-canvas-viewport-navigation-hardening.md
```

Expected: PASS with three matching lines from the inserted scope update block.

- [ ] **Step 3: Commit the plan alignment**

Run:

```bash
git add docs/superpowers/plans/2026-05-05-canvas-viewport-navigation-hardening.md
git commit -m "docs: align viewport plan with free placement"
```

### Task 4: Full Verification

**Files:**
- Verify: `src/App.tsx`
- Verify: `src/App.nodeDrag.test.tsx`
- Verify: `docs/superpowers/specs/2026-05-05-canvas-viewport-navigation-hardening-design.md`
- Verify: `docs/superpowers/plans/2026-05-05-canvas-viewport-navigation-hardening.md`

- [ ] **Step 1: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS with no ESLint errors.

- [ ] **Step 2: Run tests**

Run:

```bash
pnpm test
```

Expected: PASS for the full Vitest suite.

- [ ] **Step 3: Run build**

Run:

```bash
pnpm build
```

Expected: PASS with a production build generated by Vite.

- [ ] **Step 4: Commit any verification-only fixes**

If lint, test, or build exposes a scoped issue caused by this change, fix only that issue and commit it:

```bash
git add src/App.tsx src/App.nodeDrag.test.tsx docs/superpowers/plans/2026-05-05-canvas-viewport-navigation-hardening.md
git commit -m "fix: stabilize free canvas placement"
```

Expected: no commit is needed if all verification commands pass without additional edits.
