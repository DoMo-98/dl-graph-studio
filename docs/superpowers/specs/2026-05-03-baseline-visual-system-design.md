# Baseline Visual System Design

## Context

Issue #17 establishes the first coherent visual system for the Phase 1 editor after the core graph-editing surface is functional. The current editor already supports the required Phase 1 behavior: primitive and composite nodes, selection, inspector details, parameter editing, connections, validation feedback, import/export/reset, and node dragging.

The visual pass must preserve that behavior while making the product feel like a modern workflow editor for neural architecture prototyping.

## Approved Direction

The product owner selected Direction B from the generated visual exploration board: **Canvas-first Lab**.

The direction should feel modern and workflow-oriented like n8n, without copying n8n branding, exact colors, logos, or proprietary UI. The editor should read as a focused desktop research tool where the canvas is the primary workspace and supporting panels stay compact.

Generated direction artifact:

- `docs/verification/issue-17/visual-direction-board.png`

## Design Goals

- Make the graph canvas the strongest visual surface.
- Reduce visual weight in the sidebar and panels so the graph feels primary.
- Keep controls compact, scannable, and tool-like.
- Make primitive and composite nodes distinct without making the palette noisy.
- Strengthen selected, hover, focus, dragging, connection-source, connection-target, and validation states.
- Keep project actions and status feedback visible but secondary to graph editing.
- Preserve a light, modern interface with restrained technical accents.

## Surface Treatment

### App Shell

Use a compact modern shell:

- dark or near-charcoal navigation rail for contrast,
- light main work area,
- concise header with status and project context,
- restrained shadows and borders,
- 6-8px radii for controls and panels.

The shell should not become a marketing layout or a decorative hero surface.

### Canvas

The canvas should become the dominant workspace:

- light technical grid with subtle dots or crosshair marks,
- less panel-like framing,
- enough breathing room for node movement,
- clear connection paths and labels,
- no unnecessary background gradients or decorative blobs.

### Nodes

Primitive nodes should use clean white cards with:

- type badges,
- readable labels and metadata,
- clear connection handles,
- stable fixed dimensions,
- crisp hover/focus/selected/moving states.

Composite nodes should remain visually distinct through:

- a different accent color,
- slightly stronger surface treatment,
- grouped/block-like feel,
- preserved member summary and inspector behavior.

### Inspector And Project Actions

The inspector should be compact, dense enough for repeated use, and visually aligned with nodes. Empty, selected, and parameter-editing states must remain clear.

Export, import, and reset affordances should remain in the session panel, but styled as practical tool controls rather than large feature cards.

### Feedback

Validation and connection feedback should be easy to notice without covering core controls. Error, success, neutral, selected, and focus states should use consistent tokens instead of one-off colors.

## Behavioral Constraints

This issue must not add new graph-editing capabilities. It must preserve:

- node selection,
- parameter editing,
- connection creation,
- invalid connection rejection,
- individual connection deletion,
- save/load,
- reset,
- node dragging and clamped positions,
- composite-node representation,
- import/export project file schema.

Visible labels, roles, test ids, and connection label formats should stay stable unless a test is intentionally updated for a visual-system reason.

## Implementation Shape

The implementation should mostly change `src/styles.css`, with small `src/App.tsx` edits only where inline React Flow edge styling or class names need shared design tokens.

No dependency changes, theming engine, broad component migration, or large file split is needed for this issue.

## Verification

Automated:

- Run `pnpm run test`.
- Run `pnpm run lint`.
- Run `pnpm run build`.

Manual:

- Open the app and inspect the full Phase 1 editor surface.
- Confirm the implemented UI follows Direction B: canvas-first, modern workflow-editor feel, compact supporting panels.
- Select primitive and composite nodes and confirm selected states and inspector details remain clear.
- Edit node parameters and confirm node metadata and inspector values update.
- Create valid connections and confirm edges, labels, and connection list remain readable.
- Attempt invalid and duplicate connections and confirm feedback is visible.
- Export, reset, and import a project and confirm status feedback remains clear.
- Drag primitive and composite nodes and confirm movement feedback and connection rendering remain stable.
- Capture before/after screenshots for the PR.
