# Extract App Project File Workflow Design

## Context

Issue #35 follows the Phase 1 technical audit finding that `src/App.tsx`
owns too many responsibilities at once. The current component manages graph
state, React Flow adapter state, inspector behavior, connection validation,
node dragging, layout rendering, and the project file workflow.

The project file format and validation already live in `src/projectFile.ts`.
That module defines the persisted graph types and owns project cloning,
serialization, parsing, validation, and node position updates. The next
maintenance step is to move the browser import/export/reset workflow out of
`App.tsx` without changing the visible editor behavior or the persisted file
shape.

## Goal

Extract the project file workflow from `src/App.tsx` into a focused,
maintainable boundary that can grow with future project actions while keeping
this pull request limited to the current browser-based behavior.

The extraction should make `App.tsx` delegate project import, export, reset,
menu state, toast state, file input ownership, and file reading orchestration
through a clear interface. `App.tsx` should remain responsible for rendering the
editor shell, canvas, inspector, React Flow mapping, graph interaction, and
styling.

## Non-Goals

- Do not change the project file format.
- Do not add Tauri native file dialogs, native filesystem access, autosave, or
  additional persistence capabilities.
- Do not change graph editing behavior, React Flow integration, node rendering,
  inspector behavior, validation rules, or styling.
- Do not broadly decompose `App.tsx` beyond the project file workflow.
- Do not add dependencies.

## Recommended Approach

Create a focused hook, `useProjectFileWorkflow`, in
`src/useProjectFileWorkflow.ts`.

The hook should be the local API for current project actions. It should hide
browser file IO details and project workflow side effects from `App.tsx`, while
accepting the graph state and editor cleanup callbacks it needs from the app.

This boundary is intentionally more durable than a set of one-off helpers. A
future roadmap issue can change the hook internals to use Tauri-native file
dialogs or add more project actions without spreading file workflow details
back into `App.tsx`. This issue should not implement those future capabilities.

## Hook Interface

`useProjectFileWorkflow` should receive:

- `graphNodes`
- `graphConnections`
- `setGraphNodes`
- `setGraphConnections`
- `createInitialGraphNodes`
- cleanup callbacks for selected node, connection source, connection feedback,
  and dragged node state

It should return:

- `isProjectActionsOpen`
- a way to toggle or set the project actions menu state
- `projectToast`
- `fileInputRef`
- `openProjectImportPicker`
- `exportProjectFile`
- `importProjectFile`
- `resetProject`

The exact TypeScript names can follow the implementation if they stay clear and
small. The important contract is that `App.tsx` renders controls and passes
events through the hook instead of owning project workflow logic directly.

## Data Flow

`App.tsx` remains the owner of the canonical editor state:

- graph nodes
- graph connections
- selected node id
- dragged node id
- connection source id
- connection feedback
- canvas extent
- React Flow nodes and edges
- inspector rendering and parameter editing

`useProjectFileWorkflow` receives the current project state for export and
receives setter or cleanup callbacks for import and reset.

Export flow:

1. Build a project with `createProjectFile(graphNodes, graphConnections)`.
2. Serialize with `serializeProjectFile`.
3. Create a JSON `Blob`.
4. Create an object URL.
5. Click a temporary download anchor using the existing filename
   `dl-graph-studio-project.json`.
6. Remove the anchor and revoke the object URL.
7. Show `Project exported.`.
8. Close the project actions menu.

Import flow:

1. Read the first selected file.
2. If no file is selected, do nothing.
3. If reading fails, show `Project file could not be read.`, clear the file
   input, keep the menu state unchanged, and leave graph/editor state
   unchanged.
4. Parse with `parseProjectFileContent`.
5. If parsing fails, show the parser message, clear the file input, keep the
   menu state unchanged, and leave graph/editor state unchanged.
6. On success, replace nodes and connections with the imported project.
7. Clear selected node, connection source, connection feedback, and dragged
   node state.
8. Show `Project imported.`.
9. Close the project actions menu.
10. Clear the file input.

Reset flow:

1. Replace nodes with `createInitialGraphNodes()`.
2. Clear connections.
3. Clear selected node, connection source, connection feedback, and dragged
   node state.
4. Show `Project reset.`.
5. Close the project actions menu.

`src/projectFile.ts` should remain the project format boundary. It should not
start owning browser file input, toasts, menu state, or DOM download effects.

## Drag State Cleanup

The current implementation does not clear `draggedNodeId` during import or
reset. This is a small state consistency bug within the project workflow
boundary: after replacing or resetting the project, an old dragged node id no
longer describes the active graph interaction.

This issue should fix that bug only for successful import and reset by passing
a focused dragged-state cleanup callback into the hook. Failed imports should
not clear dragged state, because they do not change the active project.

## Error Handling

The extraction should preserve current user-facing messages and menu behavior:

- Import without a file does nothing.
- File read failure shows `Project file could not be read.`.
- Invalid project files show the exact message returned by
  `parseProjectFileContent`.
- Failed imports clear the file input but do not close the project actions
  menu.
- Successful imports clear the file input and close the menu.
- Export and reset close the menu.
- Project toasts auto-clear after 3000 milliseconds.

## Testing

Keep existing `App.test.tsx`, `App.nodeDrag.test.tsx`, and
`projectFile.test.ts` coverage passing.

Add focused coverage for the extracted boundary where practical. A small test
harness around `useProjectFileWorkflow` is preferred if it keeps assertions
direct and avoids over-coupling to unrelated `App.tsx` rendering.

Coverage should include:

- export still serializes current nodes and connections and performs the same
  browser download side effects;
- valid import replaces project state, closes the menu, clears the input, and
  clears selected node, connection source, connection feedback, and dragged
  node state;
- invalid import or read failure shows the correct toast, clears the input, and
  does not close the menu or clear dragged state;
- reset restores initial nodes, clears connections, closes the menu, and clears
  selected node, connection source, connection feedback, and dragged node state;
- existing integration tests still confirm import, export, reset, parameter
  editing, connection, and drag behavior remain stable.

The issue verification remains:

```sh
pnpm test
pnpm lint
pnpm build
pnpm format:check
```

## Review Boundaries

The pull request should stay reviewable in the normal 15-30 minute window. If
implementation reveals additional `App.tsx` responsibilities that should be
extracted, they should become follow-up roadmap issues unless they are directly
needed for this project file workflow boundary.
