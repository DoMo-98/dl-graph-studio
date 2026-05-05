# Canvas Viewport Navigation Hardening Design

## Context

Issue #33 improves the Phase 1 graph canvas viewport so graph elements remain
visible, readable, and recoverable while users navigate the editor at common
desktop and responsive viewport sizes.

The current editor uses React Flow through `src/App.tsx`. The app already
supports primitive and composite nodes, selection, inspector details, parameter
editing, connection creation and deletion, validation feedback, save/load,
reset, and node dragging. The current viewport is intentionally fixed:
pan and zoom interactions are disabled, `defaultViewport` is `{ x: 0, y: 0,
zoom: 1 }`, there are no visible React Flow controls, and there is no fit-view
affordance.

This design keeps the work inside the issue scope. It hardens viewport
navigation without changing the graph data model, edge behavior, connection
rules, persistence format, or broader editor layout. Because viewport navigation
now lets users pan, zoom, and recover the graph, node placement should no longer
be limited to the currently visible canvas rectangle.

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

Node dragging should continue to update project-owned positions, but those
positions should be free-form React Flow coordinates. The implementation should
remove the measured-canvas position boundary: no global `nodeExtent`, no
per-node `extent`, and no resize-time clamping of saved node positions.

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
default graph starts visible and readable. It must not hide existing nodes or
create a blank starting canvas.

Panning should apply to the viewport, not to the project model. Zoom and
fit-view should never mutate saved node positions or connection data.

## Node Placement Behavior

The canvas should behave like an open workspace. Users may drag nodes to any
React Flow coordinate, including negative coordinates or positions outside the
currently visible viewport. The app should persist the positions emitted by
React Flow without clamping them to the measured canvas.

This keeps the model consistent with the new navigation behavior: if users can
pan and fit the viewport, the visible rectangle should not define where the
graph is allowed to exist. `fitView` is the recovery mechanism when nodes end up
outside the visible area.

The implementation should not introduce a new hidden technical boundary such as
a large arbitrary coordinate range. A broad invisible limit would be harder to
explain than either bounded dragging or a genuinely free canvas.

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

Responsive layout changes should not rewrite saved node positions. When the
canvas becomes narrower or wider, existing nodes should keep their stored
coordinates, and fit-view should remain available to recover visibility.

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
- node positions emitted by React Flow are persisted without clamping,
- `nodeExtent` and per-node extents are not configured,
- resize behavior does not clamp saved node positions,
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
- Drag at least one node partially or fully outside the visible viewport, then
  pan or use fit view and confirm the node can be recovered.
- Confirm the out-of-view node position remains where the user placed it rather
  than being snapped back into the visible canvas rectangle.
- Resize the browser/editor viewport to a narrower width and confirm canvas
  controls remain reachable, the canvas remains usable, and saved node
  positions are not rewritten by the resize.
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
