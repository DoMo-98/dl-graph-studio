# Extract App Project File Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the browser project import/export/reset workflow from `src/App.tsx` into a focused hook while preserving current behavior and fixing dragged-node cleanup on successful import/reset.

**Architecture:** `src/projectFile.ts` remains the persisted project format and validation boundary. A new `src/useProjectFileWorkflow.ts` hook owns project action menu state, file input ref, project toast lifecycle, browser file reading, browser download side effects, and import/export/reset orchestration. `src/App.tsx` keeps graph/editor state, React Flow adapters, inspector behavior, drag behavior, connection behavior, and rendering.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Vite, existing browser `File`, `FileReader`, `Blob`, and `URL` APIs.

---

## File Structure

- Create `src/useProjectFileWorkflow.ts`
  - Owns project workflow state and side effects.
  - Exports `readTextFile` for focused unit coverage.
  - Exports `useProjectFileWorkflow`.
- Create `src/useProjectFileWorkflow.test.tsx`
  - Tests the new hook through a small React harness instead of unrelated `App.tsx` rendering.
- Modify `src/App.tsx`
  - Remove project workflow state/effects/helpers from `App`.
  - Import and call `useProjectFileWorkflow`.
  - Wire existing topbar/menu/input/toast JSX to the hook return values.
  - Pass `setDraggedNodeId(null)` cleanup into the hook for successful import/reset.
- Keep `src/projectFile.ts` unchanged.

---

### Task 1: Add Hook Boundary Tests

**Files:**
- Create: `src/useProjectFileWorkflow.test.tsx`
- Read: `src/projectFile.ts`

- [ ] **Step 1: Create the failing hook test file**

Create `src/useProjectFileWorkflow.test.tsx` with this content:

```tsx
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import { useProjectFileWorkflow } from "./useProjectFileWorkflow";
import type { GraphConnection, GraphNode } from "./projectFile";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const initialNodes: GraphNode[] = [
  {
    id: "tensor",
    type: "primitive",
    label: "Tensor",
    kind: "Data",
    metadata: ["Role: data carrier"],
    parameters: [
      { id: "shape", label: "Shape", type: "text", value: "dynamic" },
    ],
    position: { x: 96, y: 64 },
  },
];

const editedNodes: GraphNode[] = [
  {
    id: "dense",
    type: "primitive",
    label: "Dense",
    kind: "Layer",
    metadata: ["Role: transform"],
    parameters: [
      { id: "units", label: "Units", type: "number", value: 128 },
    ],
    position: { x: 320, y: 96 },
  },
];

const editedConnections: GraphConnection[] = [
  { id: "connection-tensor-dense", source: "tensor", target: "dense" },
];

function createProjectContent(
  nodes: GraphNode[] = editedNodes,
  connections: GraphConnection[] = editedConnections,
) {
  return JSON.stringify({
    version: 1,
    nodes,
    connections,
  });
}

function WorkflowHarness({
  initialGraphNodes = initialNodes,
  initialGraphConnections = [],
}: {
  initialGraphNodes?: GraphNode[];
  initialGraphConnections?: GraphConnection[];
}) {
  const [graphNodes, setGraphNodes] = useState(initialGraphNodes);
  const [graphConnections, setGraphConnections] = useState(
    initialGraphConnections,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("tensor");
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(
    "tensor",
  );
  const [connectionFeedback, setConnectionFeedback] = useState<string | null>(
    "Existing feedback",
  );
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>("tensor");
  const workflow = useProjectFileWorkflow({
    graphNodes,
    graphConnections,
    setGraphNodes,
    setGraphConnections,
    createInitialGraphNodes: () =>
      initialNodes.map((node) => ({ ...node, position: { ...node.position } })),
    clearSelectedNode: () => setSelectedNodeId(null),
    clearConnectionSource: () => setConnectionSourceId(null),
    clearConnectionFeedback: () => setConnectionFeedback(null),
    clearDraggedNode: () => setDraggedNodeId(null),
  });

  return (
    <div>
      <button type="button" onClick={workflow.toggleProjectActions}>
        Toggle menu
      </button>
      <button type="button" onClick={workflow.openProjectImportPicker}>
        Open import
      </button>
      <button type="button" onClick={workflow.exportProjectFile}>
        Export
      </button>
      <button type="button" onClick={workflow.resetProject}>
        Reset
      </button>
      <input
        aria-label="Import project file"
        ref={workflow.fileInputRef}
        type="file"
        onChange={workflow.importProjectFile}
      />
      <output aria-label="menu state">
        {workflow.isProjectActionsOpen ? "open" : "closed"}
      </output>
      <output aria-label="toast">{workflow.projectToast ?? "none"}</output>
      <output aria-label="nodes">
        {graphNodes.map((node) => node.id).join(",")}
      </output>
      <output aria-label="connections">
        {graphConnections.map((connection) => connection.id).join(",")}
      </output>
      <output aria-label="selected">{selectedNodeId ?? "none"}</output>
      <output aria-label="connection source">
        {connectionSourceId ?? "none"}
      </output>
      <output aria-label="connection feedback">
        {connectionFeedback ?? "none"}
      </output>
      <output aria-label="dragged">{draggedNodeId ?? "none"}</output>
    </div>
  );
}

describe("useProjectFileWorkflow", () => {});
```

- [ ] **Step 2: Add the export workflow test**

Replace the empty `describe("useProjectFileWorkflow", () => {});` block with this opening block and test:

```tsx
describe("useProjectFileWorkflow", () => {
  it("exports the current project and closes the project actions menu", () => {
    const OriginalBlob = globalThis.Blob;
    const blobParts: BlobPart[][] = [];
    const createObjectURLDescriptor = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const revokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    const createObjectURL = vi.fn(() => "blob:project-file");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal(
      "Blob",
      vi.fn((parts?: BlobPart[], options?: BlobPropertyBag) => {
        blobParts.push(parts ?? []);
        return new OriginalBlob(parts, options);
      }),
    );
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    try {
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        () => undefined,
      );

      render(
        <WorkflowHarness
          initialGraphNodes={editedNodes}
          initialGraphConnections={editedConnections}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
      fireEvent.click(screen.getByRole("button", { name: /export/i }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:project-file");
      expect(screen.getByLabelText("toast")).toHaveTextContent(
        "Project exported.",
      );
      expect(screen.getByLabelText("menu state")).toHaveTextContent("closed");
      expect(blobParts).toHaveLength(1);

      const [serializedProject] = blobParts[0];
      expect(JSON.parse(serializedProject as string)).toEqual({
        version: 1,
        nodes: editedNodes,
        connections: editedConnections,
      });
    } finally {
      if (createObjectURLDescriptor) {
        Object.defineProperty(
          URL,
          "createObjectURL",
          createObjectURLDescriptor,
        );
      } else {
        Reflect.deleteProperty(URL, "createObjectURL");
      }

      if (revokeObjectURLDescriptor) {
        Object.defineProperty(
          URL,
          "revokeObjectURL",
          revokeObjectURLDescriptor,
        );
      } else {
        Reflect.deleteProperty(URL, "revokeObjectURL");
      }
    }
  });
```

- [ ] **Step 3: Add import success, import failure, reset, and toast timeout tests**

Append these tests inside the same `describe` block after the export test, then close the `describe` block with the final `});` shown below:

```tsx
it("imports a valid project, closes the menu, clears editor workflow state, and clears the input", async () => {
  render(<WorkflowHarness />);

  const fileInput = screen.getByLabelText<HTMLInputElement>(
    /import project file/i,
  );
  const projectFile = new File([createProjectContent()], "project.json", {
    type: "application/json",
  });

  fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
  fireEvent.change(fileInput, { target: { files: [projectFile] } });

  await waitFor(() =>
    expect(screen.getByLabelText("nodes")).toHaveTextContent("dense"),
  );
  expect(screen.getByLabelText("connections")).toHaveTextContent(
    "connection-tensor-dense",
  );
  expect(screen.getByLabelText("toast")).toHaveTextContent(
    "Project imported.",
  );
  expect(screen.getByLabelText("menu state")).toHaveTextContent("closed");
  expect(screen.getByLabelText("selected")).toHaveTextContent("none");
  expect(screen.getByLabelText("connection source")).toHaveTextContent("none");
  expect(screen.getByLabelText("connection feedback")).toHaveTextContent(
    "none",
  );
  expect(screen.getByLabelText("dragged")).toHaveTextContent("none");
  expect(fileInput).toHaveValue("");
});

it("keeps the menu open and preserves editor workflow state after invalid import", async () => {
  render(<WorkflowHarness />);

  const fileInput = screen.getByLabelText<HTMLInputElement>(
    /import project file/i,
  );
  const invalidFile = new File(["not-json"], "project.json", {
    type: "application/json",
  });

  fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
  fireEvent.change(fileInput, { target: { files: [invalidFile] } });

  await waitFor(() =>
    expect(screen.getByLabelText("toast")).toHaveTextContent(
      "Project file is not valid JSON.",
    ),
  );
  expect(screen.getByLabelText("menu state")).toHaveTextContent("open");
  expect(screen.getByLabelText("nodes")).toHaveTextContent("tensor");
  expect(screen.getByLabelText("selected")).toHaveTextContent("tensor");
  expect(screen.getByLabelText("connection source")).toHaveTextContent(
    "tensor",
  );
  expect(screen.getByLabelText("connection feedback")).toHaveTextContent(
    "Existing feedback",
  );
  expect(screen.getByLabelText("dragged")).toHaveTextContent("tensor");
  expect(fileInput).toHaveValue("");
});

it("shows a read failure toast without closing the menu or clearing dragged state", async () => {
  const unreadableFile = {
    text: vi.fn().mockRejectedValue(new Error("read failed")),
  } as unknown as File;

  render(<WorkflowHarness />);

  const fileInput = screen.getByLabelText<HTMLInputElement>(
    /import project file/i,
  );

  fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
  fireEvent.change(fileInput, { target: { files: [unreadableFile] } });

  await waitFor(() =>
    expect(screen.getByLabelText("toast")).toHaveTextContent(
      "Project file could not be read.",
    ),
  );
  expect(screen.getByLabelText("menu state")).toHaveTextContent("open");
  expect(screen.getByLabelText("dragged")).toHaveTextContent("tensor");
  expect(fileInput).toHaveValue("");
});

it("resets the project, closes the menu, and clears editor workflow state", () => {
  render(
    <WorkflowHarness
      initialGraphNodes={editedNodes}
      initialGraphConnections={editedConnections}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
  fireEvent.click(screen.getByRole("button", { name: /reset/i }));

  expect(screen.getByLabelText("nodes")).toHaveTextContent("tensor");
  expect(screen.getByLabelText("connections")).toHaveTextContent("");
  expect(screen.getByLabelText("toast")).toHaveTextContent("Project reset.");
  expect(screen.getByLabelText("menu state")).toHaveTextContent("closed");
  expect(screen.getByLabelText("selected")).toHaveTextContent("none");
  expect(screen.getByLabelText("connection source")).toHaveTextContent("none");
  expect(screen.getByLabelText("connection feedback")).toHaveTextContent(
    "none",
  );
  expect(screen.getByLabelText("dragged")).toHaveTextContent("none");
});

it("clears project toasts after three seconds", () => {
  vi.useFakeTimers();

  render(<WorkflowHarness />);

  fireEvent.click(screen.getByRole("button", { name: /reset/i }));

  expect(screen.getByLabelText("toast")).toHaveTextContent("Project reset.");

  act(() => {
    vi.advanceTimersByTime(3000);
  });

  expect(screen.getByLabelText("toast")).toHaveTextContent("none");

  vi.useRealTimers();
});

});
```

- [ ] **Step 4: Run the new test file and confirm it fails for the missing hook**

Run:

```sh
pnpm test -- src/useProjectFileWorkflow.test.tsx
```

Expected: FAIL because `./useProjectFileWorkflow` does not exist yet.

- [ ] **Step 5: Commit failing tests**

Run:

```sh
git add src/useProjectFileWorkflow.test.tsx
git commit -m "test: cover project file workflow boundary"
```

Expected: commit succeeds with only the new test file staged.

---

### Task 2: Implement `useProjectFileWorkflow`

**Files:**
- Create: `src/useProjectFileWorkflow.ts`
- Test: `src/useProjectFileWorkflow.test.tsx`

- [ ] **Step 1: Create the hook implementation**

Create `src/useProjectFileWorkflow.ts` with this content:

```ts
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  createProjectFile,
  parseProjectFileContent,
  serializeProjectFile,
} from "./projectFile";
import type { GraphConnection, GraphNode } from "./projectFile";

type UseProjectFileWorkflowOptions = {
  graphNodes: GraphNode[];
  graphConnections: GraphConnection[];
  setGraphNodes: Dispatch<SetStateAction<GraphNode[]>>;
  setGraphConnections: Dispatch<SetStateAction<GraphConnection[]>>;
  createInitialGraphNodes: () => GraphNode[];
  clearSelectedNode: () => void;
  clearConnectionSource: () => void;
  clearConnectionFeedback: () => void;
  clearDraggedNode: () => void;
};

export function readTextFile(file: File) {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Project file could not be read as text."));
    });
    reader.addEventListener("error", () => {
      reject(new Error("Project file could not be read."));
    });
    reader.readAsText(file);
  });
}

export function useProjectFileWorkflow({
  graphNodes,
  graphConnections,
  setGraphNodes,
  setGraphConnections,
  createInitialGraphNodes,
  clearSelectedNode,
  clearConnectionSource,
  clearConnectionFeedback,
  clearDraggedNode,
}: UseProjectFileWorkflowOptions) {
  const [isProjectActionsOpen, setIsProjectActionsOpen] = useState(false);
  const [projectToast, setProjectToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!projectToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => setProjectToast(null), 3000);

    return () => window.clearTimeout(timeoutId);
  }, [projectToast]);

  const toggleProjectActions = useCallback(() => {
    setIsProjectActionsOpen((isOpen) => !isOpen);
  }, []);

  const openProjectImportPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const clearEditorProjectWorkflowState = useCallback(() => {
    clearSelectedNode();
    clearConnectionSource();
    clearConnectionFeedback();
    clearDraggedNode();
  }, [
    clearConnectionFeedback,
    clearConnectionSource,
    clearDraggedNode,
    clearSelectedNode,
  ]);

  const exportProjectFile = useCallback(() => {
    const project = createProjectFile(graphNodes, graphConnections);
    const blob = new Blob([serializeProjectFile(project)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = "dl-graph-studio-project.json";
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(url);

    setProjectToast("Project exported.");
    setIsProjectActionsOpen(false);
  }, [graphConnections, graphNodes]);

  const importProjectFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      let content: string;

      try {
        content = await readTextFile(file);
      } catch {
        setProjectToast("Project file could not be read.");
        event.target.value = "";
        return;
      }

      const result = parseProjectFileContent(content);

      if (!result.ok) {
        setProjectToast(result.message);
        event.target.value = "";
        return;
      }

      setGraphNodes(result.project.nodes);
      setGraphConnections(result.project.connections);
      clearEditorProjectWorkflowState();
      setProjectToast("Project imported.");
      setIsProjectActionsOpen(false);
      event.target.value = "";
    },
    [
      clearEditorProjectWorkflowState,
      setGraphConnections,
      setGraphNodes,
    ],
  );

  const resetProject = useCallback(() => {
    setGraphNodes(createInitialGraphNodes());
    setGraphConnections([]);
    clearEditorProjectWorkflowState();
    setProjectToast("Project reset.");
    setIsProjectActionsOpen(false);
  }, [
    clearEditorProjectWorkflowState,
    createInitialGraphNodes,
    setGraphConnections,
    setGraphNodes,
  ]);

  return {
    isProjectActionsOpen,
    setIsProjectActionsOpen,
    toggleProjectActions,
    projectToast,
    fileInputRef,
    openProjectImportPicker,
    exportProjectFile,
    importProjectFile,
    resetProject,
  };
}
```

- [ ] **Step 2: Run the hook tests**

Run:

```sh
pnpm test -- src/useProjectFileWorkflow.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Commit the hook implementation**

Run:

```sh
git add src/useProjectFileWorkflow.ts src/useProjectFileWorkflow.test.tsx
git commit -m "feat: extract project file workflow hook"
```

Expected: commit succeeds with hook and adjusted tests.

---

### Task 3: Wire `App.tsx` To The Hook

**Files:**
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`
- Test: `src/App.nodeDrag.test.tsx`

- [ ] **Step 1: Update imports in `src/App.tsx`**

Remove `useEffect`, `useRef`, and `ChangeEvent` from React imports if they are no longer used by `App.tsx`. Add:

```ts
import { useProjectFileWorkflow } from "./useProjectFileWorkflow";
```

Keep `KeyboardEvent` imported because node cards still use it.

- [ ] **Step 2: Remove project workflow imports from `src/App.tsx`**

Remove these imports from the `./projectFile` value import list:

```ts
createProjectFile,
parseProjectFileContent,
serializeProjectFile,
```

Keep:

```ts
updateGraphNodePositions,
```

- [ ] **Step 3: Delete the local `readTextFile` helper from `src/App.tsx`**

Remove the whole function that starts with:

```ts
function readTextFile(file: File) {
```

and ends after:

```ts
    reader.readAsText(file);
  });
}
```

- [ ] **Step 4: Replace local project workflow state with the hook call**

Delete these local state/ref declarations from `App`:

```ts
const [isProjectActionsOpen, setIsProjectActionsOpen] = useState(false);
const [projectToast, setProjectToast] = useState<string | null>(null);
const fileInputRef = useRef<HTMLInputElement | null>(null);
```

Add this hook call after `canvasNodeExtent` state is declared:

```ts
const {
  isProjectActionsOpen,
  setIsProjectActionsOpen,
  projectToast,
  fileInputRef,
  openProjectImportPicker,
  exportProjectFile,
  importProjectFile,
  resetProject,
} = useProjectFileWorkflow({
  graphNodes,
  graphConnections,
  setGraphNodes,
  setGraphConnections,
  createInitialGraphNodes,
  clearSelectedNode: () => setSelectedNodeId(null),
  clearConnectionSource: () => setConnectionSourceId(null),
  clearConnectionFeedback: () => setConnectionFeedback(null),
  clearDraggedNode: () => setDraggedNodeId(null),
});
```

- [ ] **Step 5: Delete toast timeout effect and local project handlers**

Remove the `useEffect` that auto-clears `projectToast`; the hook owns it now.

Remove these local functions from `App`:

```ts
const exportProjectFile = () => { ... };
const importProjectFile = async (event: ChangeEvent<HTMLInputElement>) => { ... };
const resetProject = () => { ... };
```

- [ ] **Step 6: Update import menu button wiring**

Find the import menu item in the project actions menu. Replace the existing inline click handler:

```tsx
onClick={() => fileInputRef.current?.click()}
```

with:

```tsx
onClick={openProjectImportPicker}
```

Keep the hidden input props unchanged except for using the hook-provided `fileInputRef` and `importProjectFile`.

- [ ] **Step 7: Run App integration tests**

Run:

```sh
pnpm test -- src/App.test.tsx src/App.nodeDrag.test.tsx
```

Expected: PASS. These tests prove import, export, reset, parameter editing, connection creation, deletion, and drag behavior still work from the app surface.

- [ ] **Step 8: Run TypeScript build**

Run:

```sh
pnpm build
```

Expected: PASS. Fix any unused imports or hook dependency typing errors before continuing.

- [ ] **Step 9: Commit App wiring**

Run:

```sh
git add src/App.tsx
git commit -m "refactor: delegate app project workflow"
```

Expected: commit succeeds with only `src/App.tsx` staged.

---

### Task 4: Full Verification And Cleanup

**Files:**
- Review: `src/App.tsx`
- Review: `src/useProjectFileWorkflow.ts`
- Review: `src/useProjectFileWorkflow.test.tsx`
- Review: `docs/superpowers/specs/2026-05-04-extract-app-project-file-workflow-design.md`

- [ ] **Step 1: Run full test suite**

Run:

```sh
pnpm test
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```sh
pnpm lint
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```sh
pnpm build
```

Expected: PASS.

- [ ] **Step 4: Run format check**

Run:

```sh
pnpm format:check
```

Expected: PASS.

- [ ] **Step 5: Inspect final diff for scope**

Run:

```sh
git diff --stat origin/main...HEAD
git diff -- src/App.tsx src/useProjectFileWorkflow.ts src/useProjectFileWorkflow.test.tsx
```

Expected:

- `src/App.tsx` delegates project workflow to the hook.
- `src/useProjectFileWorkflow.ts` owns only project workflow logic.
- Tests cover the extracted boundary.
- No project file format, styling, React Flow behavior, node rendering, inspector behavior, or validation rules changed.

- [ ] **Step 6: Commit final test or formatting fixes when changes exist**

Check for uncommitted changes:

```sh
git status --short
```

When the command shows modified files from verification fixes, run:

```sh
git add src/App.tsx src/useProjectFileWorkflow.ts src/useProjectFileWorkflow.test.tsx
git commit -m "test: stabilize project workflow extraction"
```

Expected with modified files: commit succeeds. Expected with no output from `git status --short`: no commit is created.

- [ ] **Step 7: Prepare manual verification notes**

Use these notes in the final implementation summary and future PR body:

```md
Manual verification to run before PR:

1. Open the app and confirm the workspace renders primitive and composite nodes.
2. Open the project actions menu and export the current project.
3. Import a valid project file and confirm the canvas updates.
4. Reset the project and confirm the default graph returns.
5. Edit a parameter and confirm the inspector/node card update.
6. Create a connection and confirm it renders.
```

Expected: notes match issue #35 manual verification and mention no new behavior except the dragged-state cleanup bug fix.
