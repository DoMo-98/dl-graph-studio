# Canvas Viewport Navigation Hardening Design

## Context

Issue #33 improves the Phase 1 graph canvas viewport so graph elements remain
visible, readable, and recoverable while users navigate the editor at common
desktop and responsive viewport sizes.

The current editor uses React Flow through `src/App.tsx`. The app already
supports primitive and composite nodes, selection, inspector details, parameter
editing, connection creation and deletion, validation feedback, save/load,
reset, and bounded node dragging. The current viewport is intentionally fixed:
pan and zoom interactions are disabled, `defaultViewport` is `{ x: 0, y: 0,
zoom: 1 }`, there are no visible React Flow controls, and there is no fit-view
affordance.

This design keeps the work inside the issue scope. It hardens viewport
navigation without changing the graph data model, node/edge behavior,
connection rules, persistence format, or broader editor layout.

## Chosen Approach

Use React Flow's built-in viewport behavior and `Controls` component, with local
styling so the controls match the current canvas-first visual system.

This is preferred over custom controls because React Flow already owns the
viewport model, zoom controls, and fit-view behavior. Custom controls would add
manual adapter code and test surface without improving the issue outcome.

## Architecture

`src/App.tsx` remains the React Flow adapter boundary. It will continue to map
project-owned `GraphNode` and `GraphConnection` data into React Flow nodes and
edges.

The canvas implementation should add React Flow `Controls` alongside the
existing `Background`. The app should configure React Flow viewport props
directly on the existing `<ReactFlow>` instance:

- enable panning on the canvas,
- enable supported zoom interactions,
- provide visible zoom and fit-view controls,
- set practical minimum and maximum zoom values,
- use fit-view behavior to make existing graph elements recoverable.

The existing `canvasNodeExtent`, per-node `extent`, and clamping behavior should
remain. Node dragging should continue to update project-owned positions and
should not become a new way to move nodes outside the usable canvas area.

No `ReactFlowProvider`, custom viewport toolbar, minimap, new graph model field,
or dependency change is needed for this issue.

## Viewport Behavior

Users should be able to pan and zoom the canvas using visible React Flow
controls and supported direct interactions. Fit-view should bring existing graph
elements back into the available canvas viewport when users lose their place.

The viewport uses conservative zoom limits:

- `minZoom`: `0.6`, so the graph can be seen in context without making node
  text unusably small.
- `maxZoom`: `1.5`, so users can inspect details without making the canvas feel
  oversized or unstable.

The initial view should use React Flow fit-view behavior with padding so the
default graph starts visible and readable. It must not hide existing nodes,
create a blank starting canvas, or conflict with bounded node positions.

Panning should apply to the viewport, not to the project model. Zoom and
fit-view should never mutate saved node positions or connection data.

## UI Treatment

Use React Flow's standard controls for zoom in, zoom out, and fit view. Style
them in `src/styles.css` so they feel like compact tool controls in the current
canvas-first lab direction.

Controls should:

- stay inside the canvas surface,
- remain reachable at common desktop and narrower responsive widths,
- avoid covering node connection buttons, the connection drawer, or validation
  feedback in normal layouts,
- use the existing color, border, radius, shadow, hover, and focus vocabulary.

Do not add a minimap, fake tool buttons, mode switcher, or broader canvas
toolbar as part of this issue.

## Responsive Behavior

The existing `ResizeObserver`-based canvas measurement should remain the source
for canvas extents. On resize, bounded node positions should continue to be
clamped to the measured canvas, and fit-view should remain available to recover
visibility.

The implementation should verify narrower responsive widths manually. The goal
is not to redesign the editor layout; it is to make sure the canvas controls
remain visible and the graph remains navigable after the layout shrinks.

## Testing

Automated tests should focus on the React Flow adapter contract rather than on
React Flow internals.

Update the existing React Flow mock in `src/App.nodeDrag.test.tsx` to expose the
new viewport props and render a mock controls element. Add or adjust assertions
for:

- visible controls are present,
- panning is enabled,
- zoom interactions are configured,
- fit-view behavior is configured,
- min/max zoom values are passed,
- `nodeExtent` and per-node extents remain configured,
- `autoPanOnNodeDrag` remains intentionally disabled unless implementation
  proves it is needed for this issue.

Existing tests for node rendering, connection behavior, drag position updates,
and project file workflow should continue to pass.

## Verification

Automated:

- Run `pnpm lint`.
- Run `pnpm test`.
- Run `pnpm build`.

Manual:

- Start the app with `pnpm dev`.
- Open the graph editor canvas.
- Pan and zoom the canvas and confirm graph elements remain navigable.
- Move or navigate until elements are partially or fully out of view, then use
  fit view and confirm they return to the visible canvas area.
- Resize the browser/editor viewport to a narrower width and confirm canvas
  controls remain reachable and the canvas remains usable.
- Capture screenshots or a short video/GIF showing controls and fit-view
  behavior for the PR.

## Out Of Scope

- Broader canvas redesign.
- New graph editing features.
- New node, edge, or graph data model behavior.
- Changes to connection creation, deletion, validation, or persistence.
- Large layout refactors outside the canvas viewport and navigation surface.
- Dependency changes unless React Flow cannot support the scoped behavior.
- Minimap or custom viewport toolbar.
