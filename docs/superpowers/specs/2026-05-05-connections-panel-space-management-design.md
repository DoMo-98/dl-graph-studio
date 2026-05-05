# Connections Panel Space Management Design

## Context

Issue #32 covers a Phase 1 UX improvement for the graph editor: the bottom
connections list should be collapsible so it does not permanently consume
editor space when the user does not need to inspect individual connections.

The current editor renders the connections drawer only when at least one
connection exists. When rendered, the drawer is always expanded and shows a
header, connection count, scrollable list, and per-connection delete buttons.
The surrounding editor layout already uses a grid where the bottom drawer
occupies an `auto` row, so reducing the drawer to a compact header lets the
canvas row reclaim vertical space without a broad layout rewrite.

## Goal

Add a small, explicit collapse and expand interaction to the bottom connections
drawer while preserving all existing connection behavior when the drawer is
expanded.

The drawer should be expanded by default when it first appears in a session. If
the user collapses it, that manual choice should remain in effect while the app
session continues, including when new connections are added.

## Non-Goals

- Do not change connection creation, deletion, validation, persistence, labels,
  sorting, filtering, or editing behavior.
- Do not change the graph data model or saved project shape.
- Do not persist the collapsed state across reloads.
- Do not redesign the full editor layout or replace the existing drawer pattern.
- Do not add new dependencies.

## Recommended Design

Use local UI state in `src/App.tsx` to track whether the connections drawer is
collapsed. The state should initialize to expanded and only change when the user
activates the drawer toggle.

The drawer should continue to render only when there is at least one connection.
Its header remains visible in both states and includes:

- the existing `Connections` title,
- the current connection count,
- a real button for expanding or collapsing the drawer.

When expanded, the drawer shows the existing connection list and delete buttons
with the current behavior unchanged. When collapsed, the drawer hides the list
body and keeps only the compact header visible. Adding a connection while the
drawer is collapsed updates the count but does not automatically expand the
drawer.

## Accessibility

The toggle should be a semantic button, not a styled non-interactive element.
It should expose the drawer state with `aria-expanded` and use a clear
accessible label such as `Collapse connections panel` when expanded and
`Expand connections panel` when collapsed.

The existing `Graph connections` accessible region should remain stable so
current tests and assistive navigation continue to have a predictable target.
When collapsed, the list content should not remain exposed as visible
connection rows.

## Styling

The implementation should extend the current drawer styles instead of creating a
new panel system. The collapsed state should reduce the drawer to its header so
the editor grid can allocate the reclaimed space to the canvas area.

The toggle affordance should fit the existing Phase 1 visual system: compact,
clear, and reachable at desktop and narrower responsive widths. The change
should avoid nested cards, broad palette changes, or decorative layout work.

## Testing

Add focused tests in `src/App.test.tsx` for the new panel behavior:

- a connection makes the drawer appear expanded by default and the connection
  row is visible,
- activating the toggle collapses the drawer and sets `aria-expanded` to
  `false`,
- adding another connection while collapsed keeps the drawer collapsed while the
  count updates,
- expanding again reveals the connection rows and preserves existing delete
  behavior.

Existing tests for connection creation, deletion, reset, import/export,
parameter editing, and node dragging should continue to pass without requiring
behavioral changes outside the panel surface.

## Verification

Automated verification should follow issue #32:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Manual verification should start the app with `pnpm dev`, open the graph
editor, create at least one connection, collapse the drawer, confirm the canvas
area gains usable space, add another connection while the drawer remains
collapsed, expand the drawer, and confirm the connection rows and delete action
still behave as before.

The pull request should include screenshots or a short recording showing the
expanded and collapsed states.
