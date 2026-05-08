# Managed Dropdown Primitive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom project actions popover with a Radix dropdown menu while separating menu UI ownership from project file workflow logic.

**Architecture:** Add a focused `ProjectActionsMenu` component that encapsulates Radix dropdown markup, icons, accessible menu behavior, and dropdown classes. Keep `useProjectFileWorkflow` focused on file import/export/reset side effects and editor cleanup, with no dropdown open state. Keep `App.tsx` as the composition point that wires the workflow callbacks into the topbar menu.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, `@testing-library/user-event`, `@radix-ui/react-dropdown-menu`, lucide-react, CSS.

---

## File Structure

- Create `src/ProjectActionsMenu.tsx`: focused topbar project actions dropdown component built with Radix.
- Create `src/ProjectActionsMenu.test.tsx`: focused component tests for opening, dismissing, keyboard activation, and callback invocation.
- Modify `src/App.tsx`: import and render `ProjectActionsMenu`, remove custom popover JSX, remove dropdown icon imports now owned by the component, and stop consuming dropdown open state from the hook.
- Modify `src/useProjectFileWorkflow.ts`: remove dropdown open state from the hook contract and remove menu-closing side effects from workflow actions.
- Modify `src/useProjectFileWorkflow.test.tsx`: remove menu state harness and assertions; keep workflow behavior coverage.
- Modify `src/App.test.tsx`: keep integration coverage for import/export/reset through the topbar menu and add coverage for import failure leaving the Radix menu closed.
- Modify `src/styles.css`: replace custom popover selectors with explicit Radix dropdown classes.
- Modify `package.json` and `pnpm-lock.yaml`: add `@radix-ui/react-dropdown-menu` and `@testing-library/user-event`.

---

### Task 1: Add Dependencies

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add the Radix dropdown runtime dependency**

Run:

```bash
pnpm add @radix-ui/react-dropdown-menu
```

Expected: `package.json` includes `@radix-ui/react-dropdown-menu` under `dependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Add the user-event test dependency**

Run:

```bash
pnpm add -D @testing-library/user-event
```

Expected: `package.json` includes `@testing-library/user-event` under `devDependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 3: Verify dependency metadata**

Run:

```bash
pnpm install --lockfile-only
```

Expected: command exits 0 and reports the lockfile is up to date or already current.

- [ ] **Step 4: Commit dependency metadata**

Run:

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add dropdown menu dependencies"
```

Expected: commit succeeds with only dependency metadata staged.

---

### Task 2: Write Failing Component Tests For The Menu

**Files:**

- Create: `src/ProjectActionsMenu.test.tsx`

- [ ] **Step 1: Create `ProjectActionsMenu.test.tsx` with expected menu behavior**

Create `src/ProjectActionsMenu.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectActionsMenu } from "./ProjectActionsMenu";

function renderProjectActionsMenu() {
  const onImportProject = vi.fn();
  const onExportProject = vi.fn();
  const onResetProject = vi.fn();

  render(
    <div>
      <ProjectActionsMenu
        onImportProject={onImportProject}
        onExportProject={onExportProject}
        onResetProject={onResetProject}
      />
      <button type="button">Outside target</button>
    </div>,
  );

  return {
    onImportProject,
    onExportProject,
    onResetProject,
  };
}

describe("ProjectActionsMenu", () => {
  it("opens from the project actions button and exposes all project actions", async () => {
    const user = userEvent.setup();

    renderProjectActionsMenu();

    await user.click(screen.getByRole("button", { name: /project actions/i }));

    expect(
      screen.getByRole("menuitem", { name: /import project/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /export project/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /reset project/i }),
    ).toBeInTheDocument();
  });

  it("dismisses the menu with Escape", async () => {
    const user = userEvent.setup();

    renderProjectActionsMenu();

    await user.click(screen.getByRole("button", { name: /project actions/i }));
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("menuitem", { name: /import project/i }),
    ).not.toBeInTheDocument();
  });

  it("dismisses the menu when focus moves outside", async () => {
    const user = userEvent.setup();

    renderProjectActionsMenu();

    await user.click(screen.getByRole("button", { name: /project actions/i }));
    await user.click(screen.getByRole("button", { name: /outside target/i }));

    expect(
      screen.queryByRole("menuitem", { name: /export project/i }),
    ).not.toBeInTheDocument();
  });

  it("calls import and closes the menu when Import project is selected", async () => {
    const user = userEvent.setup();
    const { onImportProject } = renderProjectActionsMenu();

    await user.click(screen.getByRole("button", { name: /project actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /import project/i }));

    expect(onImportProject).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("menuitem", { name: /import project/i }),
    ).not.toBeInTheDocument();
  });

  it("calls export and closes the menu when Export project is selected", async () => {
    const user = userEvent.setup();
    const { onExportProject } = renderProjectActionsMenu();

    await user.click(screen.getByRole("button", { name: /project actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /export project/i }));

    expect(onExportProject).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("menuitem", { name: /export project/i }),
    ).not.toBeInTheDocument();
  });

  it("calls reset and closes the menu when Reset project is selected", async () => {
    const user = userEvent.setup();
    const { onResetProject } = renderProjectActionsMenu();

    await user.click(screen.getByRole("button", { name: /project actions/i }));
    await user.click(screen.getByRole("menuitem", { name: /reset project/i }));

    expect(onResetProject).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("menuitem", { name: /reset project/i }),
    ).not.toBeInTheDocument();
  });

  it("supports keyboard navigation and keyboard activation", async () => {
    const user = userEvent.setup();
    const { onExportProject } = renderProjectActionsMenu();

    screen.getByRole("button", { name: /project actions/i }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onExportProject).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("menuitem", { name: /export project/i }),
    ).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the new tests and verify they fail because the component does not exist**

Run:

```bash
pnpm test -- src/ProjectActionsMenu.test.tsx
```

Expected: FAIL with an import resolution error for `./ProjectActionsMenu`.

---

### Task 3: Implement `ProjectActionsMenu`

**Files:**

- Create: `src/ProjectActionsMenu.tsx`
- Modify: `src/ProjectActionsMenu.test.tsx`

- [ ] **Step 1: Create the Radix-backed component**

Create `src/ProjectActionsMenu.tsx`:

```tsx
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download, MoreVertical, RotateCcw, Upload } from "lucide-react";

type ProjectActionsMenuProps = {
  onImportProject: () => void;
  onExportProject: () => void;
  onResetProject: () => void;
};

export function ProjectActionsMenu({
  onImportProject,
  onExportProject,
  onResetProject,
}: ProjectActionsMenuProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Project actions"
          title="Project actions"
        >
          <MoreVertical size={18} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="project-actions-content"
          align="end"
          sideOffset={8}
        >
          <DropdownMenu.Item
            className="project-actions-item"
            onSelect={onImportProject}
          >
            <Upload size={15} aria-hidden="true" />
            <span>Import project</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="project-actions-item"
            onSelect={onExportProject}
          >
            <Download size={15} aria-hidden="true" />
            <span>Export project</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="project-actions-item danger"
            onSelect={onResetProject}
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span>Reset project</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

- [ ] **Step 2: Run the component tests**

Run:

```bash
pnpm test -- src/ProjectActionsMenu.test.tsx
```

Expected: most tests pass. If the keyboard navigation test activates `Import project` instead of `Export project`, update the test to use two ArrowDown presses after opening:

```tsx
await user.keyboard("{Enter}");
await user.keyboard("{ArrowDown}");
await user.keyboard("{ArrowDown}");
await user.keyboard("{Enter}");
```

Expected after the update: all tests in `src/ProjectActionsMenu.test.tsx` pass.

- [ ] **Step 3: Commit the component and tests**

Run:

```bash
git add src/ProjectActionsMenu.tsx src/ProjectActionsMenu.test.tsx
git commit -m "feat: add project actions dropdown component"
```

Expected: commit succeeds with the new component and its tests.

---

### Task 4: Move Dropdown Ownership Out Of The Workflow Hook

**Files:**

- Modify: `src/useProjectFileWorkflow.ts`
- Modify: `src/useProjectFileWorkflow.test.tsx`

- [ ] **Step 1: Remove menu state from the hook implementation**

In `src/useProjectFileWorkflow.ts`, change the React import to remove `useState`:

```ts
import {
  useCallback,
  useRef,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
```

Remove this state declaration:

```ts
const [isProjectActionsOpen, setIsProjectActionsOpen] = useState(false);
```

Remove this callback:

```ts
const toggleProjectActions = useCallback(() => {
  setIsProjectActionsOpen((isOpen) => !isOpen);
}, []);
```

Remove menu-closing calls from `exportProjectFile`, successful `importProjectFile`, and `resetProject`:

```ts
setIsProjectActionsOpen(false);
```

Update the return object to:

```ts
return {
  fileInputRef,
  openProjectImportPicker,
  exportProjectFile,
  importProjectFile,
  resetProject,
};
```

- [ ] **Step 2: Update the hook test harness**

In `src/useProjectFileWorkflow.test.tsx`, remove the `Toggle menu` button and menu state output from `WorkflowHarness`.

Delete this JSX:

```tsx
<button type="button" onClick={workflow.toggleProjectActions}>
  Toggle menu
</button>
```

Delete this JSX:

```tsx
<output aria-label="menu state">
  {workflow.isProjectActionsOpen ? "open" : "closed"}
</output>
```

- [ ] **Step 3: Remove menu-state setup and assertions from workflow tests**

In `src/useProjectFileWorkflow.test.tsx`, remove all lines that click the deleted toggle button:

```tsx
fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
```

Remove assertions that read:

```tsx
expect(screen.getByLabelText("menu state")).toHaveTextContent(/^closed$/);
```

Remove assertions that read:

```tsx
expect(screen.getByLabelText("menu state")).toHaveTextContent(/^open$/);
```

Update the invalid import test name from:

```tsx
it("keeps the menu open and preserves editor workflow state after invalid import", async () => {
```

to:

```tsx
it("preserves editor workflow state after invalid import", async () => {
```

Update the read failure test name from:

```tsx
it("shows a read failure toast without closing the menu or clearing dragged state", async () => {
```

to:

```tsx
it("shows a read failure toast without clearing dragged state", async () => {
```

Update the reset test name from:

```tsx
it("resets the project, closes the menu, and clears editor workflow state", () => {
```

to:

```tsx
it("resets the project and clears editor workflow state", () => {
```

- [ ] **Step 4: Run hook tests**

Run:

```bash
pnpm test -- src/useProjectFileWorkflow.test.tsx
```

Expected: all tests in `src/useProjectFileWorkflow.test.tsx` pass.

- [ ] **Step 5: Commit the hook boundary change**

Run:

```bash
git add src/useProjectFileWorkflow.ts src/useProjectFileWorkflow.test.tsx
git commit -m "refactor: remove dropdown state from project workflow"
```

Expected: commit succeeds with hook and hook-test changes only.

---

### Task 5: Wire The Menu Into `App`

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Import the menu component in `App.tsx`**

Add this import near the local imports in `src/App.tsx`:

```tsx
import { ProjectActionsMenu } from "./ProjectActionsMenu";
```

Remove these icons from the lucide import in `src/App.tsx` because they now belong to `ProjectActionsMenu`:

```tsx
RotateCcw,
MoreVertical,
Download,
Upload,
```

- [ ] **Step 2: Stop consuming dropdown state from the hook**

Change the workflow destructuring in `src/App.tsx` from:

```tsx
const {
  isProjectActionsOpen,
  setIsProjectActionsOpen,
  fileInputRef,
  openProjectImportPicker,
  exportProjectFile,
  importProjectFile,
  resetProject,
} = useProjectFileWorkflow({
```

to:

```tsx
const {
  fileInputRef,
  openProjectImportPicker,
  exportProjectFile,
  importProjectFile,
  resetProject,
} = useProjectFileWorkflow({
```

- [ ] **Step 3: Replace the custom popover JSX**

In `src/App.tsx`, replace the entire block from the opening:

```tsx
<div className="project-actions-menu">
```

through its matching closing `</div>` before the hidden file input with:

```tsx
<div className="project-actions-menu">
  <ProjectActionsMenu
    onImportProject={openProjectImportPicker}
    onExportProject={exportProjectFile}
    onResetProject={resetProject}
  />
</div>
```

The hidden file input should remain after the menu wrapper:

```tsx
<input
  ref={fileInputRef}
  className="visually-hidden"
  type="file"
  accept="application/json,.json"
  aria-label="Import project file"
  onChange={importProjectFile}
/>
```

- [ ] **Step 4: Add an App integration test for invalid import closing the menu**

In `src/App.test.tsx`, add `waitFor` and `userEvent` imports.

Change the first import from:

```tsx
import { fireEvent, render, screen, within } from "@testing-library/react";
```

to:

```tsx
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

Add this test after `imports a project file from the project actions menu`:

```tsx
it("keeps the project actions menu closed after an invalid project import", async () => {
  const user = userEvent.setup();

  render(<App />);

  const invalidProjectFile = new File(["not-json"], "invalid-project.json", {
    type: "application/json",
  });

  await user.click(screen.getByRole("button", { name: /project actions/i }));
  await user.click(screen.getByRole("menuitem", { name: /import project/i }));

  expect(
    screen.queryByRole("menuitem", { name: /import project/i }),
  ).not.toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/import project file/i), {
    target: { files: [invalidProjectFile] },
  });

  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      /project file must be valid json/i,
    ),
  );
  expect(
    screen.queryByRole("menuitem", { name: /import project/i }),
  ).not.toBeInTheDocument();
});
```

- [ ] **Step 5: Run App tests**

Run:

```bash
pnpm test -- src/App.test.tsx
```

Expected: all tests in `src/App.test.tsx` pass.

- [ ] **Step 6: Commit App wiring**

Run:

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "refactor: wire project actions menu into app"
```

Expected: commit succeeds with App integration changes.

---

### Task 6: Update Dropdown Styling

**Files:**

- Modify: `src/styles.css`

- [ ] **Step 1: Replace the old popover selectors**

In `src/styles.css`, replace the block from `.project-actions-popover {` through the final `.project-actions-popover button.danger:focus-visible { ... }` rule with:

```css
.project-actions-content {
  z-index: 40;
  display: grid;
  width: 210px;
  overflow: hidden;
  padding: 6px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 18px 40px rgb(0 0 0 / 35%);
}

.project-actions-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 9px;
  color: var(--ink);
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 7px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  outline: none;
}

.project-actions-item:hover,
.project-actions-item:focus-visible,
.project-actions-item[data-highlighted] {
  color: var(--teal-strong);
  background: var(--teal-soft);
  border-color: rgb(59 130 246 / 20%);
}

.project-actions-item.danger {
  color: var(--danger);
}

.project-actions-item.danger:hover,
.project-actions-item.danger:focus-visible,
.project-actions-item.danger[data-highlighted] {
  color: #ffffff;
  background: var(--danger);
  border-color: rgb(239 68 68 / 40%);
}
```

Keep the existing `.project-actions-menu { position: relative; }` rule for the topbar layout wrapper.

- [ ] **Step 2: Run component and App tests**

Run:

```bash
pnpm test -- src/ProjectActionsMenu.test.tsx src/App.test.tsx
```

Expected: all tests in both files pass.

- [ ] **Step 3: Commit styling changes**

Run:

```bash
git add src/styles.css
git commit -m "style: preserve project actions dropdown appearance"
```

Expected: commit succeeds with CSS changes only.

---

### Task 7: Run Full Automated Verification

**Files:**

- No source edits expected unless verification identifies a concrete failure.

- [ ] **Step 1: Run tests**

Run:

```bash
pnpm test
```

Expected: all Vitest suites pass.

- [ ] **Step 2: Run build**

Run:

```bash
pnpm build
```

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: ESLint exits 0.

- [ ] **Step 4: Run format check**

Run:

```bash
pnpm format:check
```

Expected: Prettier exits 0.

- [ ] **Step 5: Inspect final diff**

Run:

```bash
git status --short
git diff --stat origin/main...HEAD
```

Expected: working tree is clean after commits, and the branch diff contains the design doc, plan doc, dependency metadata, dropdown component, focused tests, hook boundary cleanup, App wiring, and CSS updates.

---

### Task 8: Manual Browser Verification

**Files:**

- No source edits expected unless manual verification identifies a concrete failure.

- [ ] **Step 1: Start the dev server**

Run:

```bash
pnpm dev
```

Expected: Vite starts and prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 2: Verify menu opening and visual treatment**

Open the local URL in the browser. Activate the `Project actions` three-dot button.

Expected:

- the dropdown opens below the trigger and aligned to the right;
- width, surface, border, shadow, item spacing, icon placement, and danger styling match the prior topbar popover closely;
- the items read `Import project`, `Export project`, and `Reset project`.

- [ ] **Step 3: Verify dismissals**

With the dropdown open:

- press Escape;
- open it again and click outside the menu.

Expected: the dropdown closes in both cases.

- [ ] **Step 4: Verify keyboard operation**

Focus the `Project actions` button and use keyboard interaction to open the menu, move between items, and activate `Export project`.

Expected: the focused menu item is visibly highlighted, activation closes the menu, and export shows `Project exported.`.

- [ ] **Step 5: Verify import success and import failure**

Use `Export project` to download a valid project file. Open the menu again, select `Import project`, choose the downloaded file, and confirm the canvas still renders. Then open the menu, select `Import project`, choose an invalid JSON file, and observe the error toast.

Expected:

- selecting import closes the dropdown immediately;
- valid import shows `Project imported.`;
- invalid import shows the existing invalid JSON error toast;
- the dropdown remains closed after both outcomes.

- [ ] **Step 6: Verify reset**

Change a visible graph state, such as selecting a node or creating a connection. Open the menu and select `Reset project`.

Expected: the graph returns to the default state, editor interaction state clears, `Project reset.` appears, and the dropdown closes.

- [ ] **Step 7: Capture PR evidence**

Capture screenshots or a short recording showing:

- the dropdown open with current visual treatment;
- Escape or outside-click dismissal;
- import/export/reset behavior evidence.

Expected: screenshots or recording are available for the PR description.
