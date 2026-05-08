# Managed Dropdown Primitive Design

## Context

Issue #40 replaces the custom project actions popover behind the topbar
three-dot button with a maintained dropdown/menu primitive. The current
implementation renders the menu directly in `src/App.tsx`, stores dropdown
open state in `useProjectFileWorkflow`, and uses bespoke `role="menu"` markup
and CSS for import, export, and reset actions.

No maintained dropdown primitive is currently installed. The issue names
`@radix-ui/react-dropdown-menu` as the expected choice unless discovery finds a
better existing fit. Discovery did not find an existing headless menu or Radix
dependency in the project, and the product owner confirmed that adding
`@radix-ui/react-dropdown-menu` is acceptable.

## Goal

Replace the custom project actions popover with a Radix dropdown menu while
improving the ownership boundary between topbar menu UI and project file
workflow logic.

The implementation should preserve the current visual treatment and project
actions while letting Radix own standard menu behavior: Escape dismissal,
outside interaction dismissal, focus handling, keyboard navigation, ARIA menu
semantics, and closing after item activation.

## Non-Goals

- Do not redesign the topbar or broader editor navigation.
- Do not add new project actions.
- Do not change the project file format.
- Do not change import, export, reset, graph editing, connection, node,
  inspector, persistence, or toast behavior beyond the menu lifecycle described
  below.
- Do not introduce a broad design-system migration or generic menu framework.
- Do not refactor unrelated `App.tsx` responsibilities.

## Recommended Design

Add `@radix-ui/react-dropdown-menu` and create a focused
`src/ProjectActionsMenu.tsx` component.

`ProjectActionsMenu` should own:

- the Radix dropdown root, trigger, content, and items;
- the existing `MoreVertical` trigger button;
- item labels, icons, danger styling for reset, and dropdown-specific class
  names;
- menu UI behavior and accessibility delegated to Radix.

`App.tsx` should own composition only. It should render `ProjectActionsMenu`
inside the existing topbar actions area and pass callbacks for:

- `onImportProject`
- `onExportProject`
- `onResetProject`

The hidden file input should remain near the app workflow wiring in `App.tsx`.
It is part of the file import workflow, not the visual dropdown.

`useProjectFileWorkflow` should remain the workflow boundary for project file
actions. It should no longer own dropdown open state or expose
`isProjectActionsOpen`, `setIsProjectActionsOpen`, or `toggleProjectActions`.
It should continue to expose:

- `fileInputRef`
- `openProjectImportPicker`
- `exportProjectFile`
- `importProjectFile`
- `resetProject`

This keeps Radix encapsulated in the menu component and keeps browser file IO,
serialization, parsing, toasts, and editor cleanup in the workflow hook.

## Behavior

The trigger remains a semantic button with accessible name `Project actions`
and the existing three-dot icon.

Selecting any dropdown item should close the menu immediately through Radix
menu item activation:

- `Import project` calls `openProjectImportPicker`, opens the hidden file
  input, and closes the menu.
- `Export project` serializes and downloads the current project, then shows
  `Project exported.`
- `Reset project` restores the initial graph, clears editor interaction state,
  and shows `Project reset.`

The deliberate behavior change is import failure handling. Today, invalid
project files and read failures keep the custom menu open because menu state
lives in the workflow hook. With a standard dropdown menu, selecting
`Import project` completes the menu action before the file picker returns. If a
selected file is invalid or unreadable, the existing error toast should appear
and the menu should stay closed.

Importing no file should still do nothing. Successful import should still
replace graph state, clear editor workflow state, show `Project imported.`, and
clear the file input. Invalid imports and read failures should still leave
graph/editor state unchanged and clear the file input.

## Styling

The menu should keep the current visual footprint:

- right-aligned to the topbar trigger;
- approximately `210px` wide;
- surface background, border, radius, and shadow matching the current popover;
- compact grid-style items with icon and text;
- teal hover/focus treatment for normal items;
- danger coloring and danger hover/focus treatment for `Reset project`.

The current selectors should be adapted from structural selectors such as
`.project-actions-popover button` to explicit menu classes such as:

- `.project-actions-content`
- `.project-actions-item`
- `.project-actions-item.danger`

The styling should not depend on the content being a direct child of the
topbar. If Radix portal rendering is used, styles must still apply correctly.

## Component Boundary

`ProjectActionsMenu` should be small and reusable only for this topbar menu. It
does not need to become a generic menu abstraction yet.

The component should accept callback props and not import project workflow
state directly. That keeps it testable and prevents file workflow details from
leaking into menu UI.

The hook tests should not assert dropdown open state after this change because
open state is no longer part of the hook contract. Menu lifecycle belongs to
`ProjectActionsMenu` and Radix.

## Testing

Add focused component coverage for `ProjectActionsMenu` where practical:

- the trigger opens the menu and exposes import, export, and reset items;
- Escape dismisses the menu;
- outside interaction dismisses the menu;
- selecting each item calls the expected callback and closes the menu;
- keyboard navigation and keyboard activation work according to Radix behavior
  as far as the current test tooling can verify reliably.

Update `useProjectFileWorkflow.test.tsx` to remove assertions about menu open
state and keep assertions focused on:

- export serialization and download side effects;
- valid import state replacement, file input clearing, toast, and editor
  cleanup;
- invalid import and read failure preserving graph/editor state, clearing the
  file input, and showing the current error toast;
- reset restoring the initial graph, clearing connections, toast, and editor
  cleanup.

Keep `App.test.tsx` as integration coverage for the topbar and project
workflows:

- disabled future actions still render;
- the project actions button exposes the real project actions;
- import, export, and reset still work through the app.

If keyboard interaction tests require `@testing-library/user-event`, prefer
adding it only if the existing `fireEvent` coverage cannot verify the expected
Radix behavior with enough confidence.

## Verification

Automated verification should include:

- `pnpm test`
- `pnpm build`
- `pnpm lint`
- `pnpm format:check`

Manual verification should include:

1. Start the app with `pnpm dev`.
2. Open the editor and activate the `Project actions` button.
3. Confirm the menu visually matches the current topbar popover treatment.
4. Confirm Escape dismisses the menu.
5. Confirm clicking or focusing outside the menu dismisses it.
6. Confirm keyboard navigation can reach and activate each item.
7. Confirm import still opens the file picker and valid import updates the
   canvas.
8. Confirm invalid import shows the existing error toast while the menu remains
   closed.
9. Confirm export downloads the project file and reset restores the default
   graph.

## Risks

Radix content may render in a portal. CSS and tests should query by accessible
roles and explicit classes rather than assuming DOM nesting under the topbar.

Radix menu items commonly use `onSelect` rather than button `onClick`.
Importing through the hidden file input should be tested because opening a file
picker from a menu item can be sensitive to event timing.

The current hook tests encode dropdown open state. Removing that state from
the hook is intentional, but tests must move lifecycle expectations to the menu
component instead of dropping coverage.
