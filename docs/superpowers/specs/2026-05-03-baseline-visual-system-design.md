# Baseline Visual System Design

## Context

Issue #17 establishes the first coherent visual system for the Phase 1 editor after the core graph-editing surface is functional. The current editor already supports the required Phase 1 behavior: primitive and composite nodes, selection, inspector details, parameter editing, connections, validation feedback, import/export/reset, and node dragging.

The visual pass must preserve that behavior while making the product feel like a modern workflow editor for neural architecture prototyping.

## Approved Direction

The product owner selected Direction B from the generated visual exploration board: **Canvas-first Lab**.

The direction should visually track Direction B closely, not merely take loose inspiration from it. The target is a desktop, canvas-first workflow editor that feels modern and n8n-like without copying n8n branding, exact colors, logos, or proprietary assets. Existing implemented functionality should be arranged and styled to match the Direction B composition as closely as practical. Do not add fake or non-functional controls just because they appear in the mockup.

Approved visual reference:

- `docs/verification/issue-17/visual-reference-direction-b.png`

The original comparison board remains available for context, but implementation should use the single Direction B reference above to avoid ambiguity.

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

Use a desktop workflow-editor shell that matches Direction B:

- dark teal top app bar with brand, current project name, and status,
- narrow left rail for existing navigation and project actions,
- center canvas as the dominant workbench,
- compact right inspector panel,
- bottom drawer for existing connection data and validation feedback,
- restrained shadows and borders,
- 6-8px radii for controls and panels.

The shell should not become a marketing layout or a decorative hero surface.

### Canvas

The canvas should become the dominant workspace:

- light technical grid with subtle dots or crosshair marks,
- minimal panel framing,
- enough breathing room for node movement,
- clear connection paths and labels,
- selected/composite states that visually resemble Direction B,
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

The inspector should live visually on the right side of the desktop workbench, matching Direction B's right panel. It should use only existing selected-node details and parameter editing.

Export, import, and reset affordances should move into the left rail/session area as compact existing project actions. They must remain real buttons/inputs wired to existing behavior.

The connection list should become a bottom drawer/table when connections exist. Use only existing connection source/target/label/delete behavior; do not add unimplemented rule browsers, fake validation rows, or new connection metadata.

### Feedback

Validation and connection feedback should be easy to notice without covering core controls. Error, success, neutral, selected, and focus states should use consistent tokens instead of one-off colors.

Connection feedback should map to the existing alert state and can be positioned in the lower workbench area like Direction B's validation strip. Do not display persistent fake issue counts.

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
