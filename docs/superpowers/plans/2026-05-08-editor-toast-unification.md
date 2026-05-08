# Editor Toast Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace split project and connection feedback with one editor toast system that has consistent placement, lifecycle, ARIA semantics, and icon treatment.

**Architecture:** Add a small local `useEditorToast` hook that owns the active toast and severity-based timeout. `App.tsx` remains the composition boundary: project file workflow emits toast requests through a callback, and connection actions use the same callback. One JSX toast surface renders the active toast.

**Tech Stack:** React, TypeScript, Vitest, React Testing Library, lucide-react, CSS.

---

## File Structure

- Create `src/useEditorToast.ts`: owns toast state, severity-based timeout, `showToast`, and `clearToast`.
- Create `src/useEditorToast.test.tsx`: focused hook tests for replacement and timeout behavior.
- Modify `src/useProjectFileWorkflow.ts`: remove local `projectToast` state and emit project feedback through `showToast`.
- Modify `src/useProjectFileWorkflow.test.tsx`: update harness to assert emitted toast requests instead of hook-owned toast state.
- Modify `src/App.tsx`: use `useEditorToast`, replace `connectionFeedback`, render one editor toast surface, and choose severity/icons per message.
- Modify `src/App.test.tsx`: update app-level assertions for one toast surface, severity roles, icon behavior, and replacement behavior.
- Modify `src/styles.css`: keep `.editor-toast` as the shared surface, move shared placement onto it, remove separate placement classes, and add tone classes.

---

### Task 1: Add the Editor Toast Hook

**Files:**
- Create: `src/useEditorToast.ts`
- Create: `src/useEditorToast.test.tsx`

- [ ] **Step 1: Write failing hook tests**

Create `src/useEditorToast.test.tsx`:

```tsx
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useEditorToast } from "./useEditorToast";

afterEach(() => {
  vi.useRealTimers();
});

describe("useEditorToast", () => {
  it("shows one toast and replaces the previous toast", () => {
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({ message: "Project exported.", tone: "success" });
    });

    expect(result.current.toast).toEqual({
      message: "Project exported.",
      tone: "success",
    });

    act(() => {
      result.current.showToast({
        message: "That connection already exists.",
        tone: "error",
      });
    });

    expect(result.current.toast).toEqual({
      message: "That connection already exists.",
      tone: "error",
    });
  });

  it("clears success and info toasts after three seconds", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({ message: "Project reset.", tone: "success" });
    });

    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(result.current.toast?.message).toBe("Project reset.");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.toast).toBeNull();

    act(() => {
      result.current.showToast({ message: "Ready.", tone: "info" });
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toast).toBeNull();
  });

  it("keeps error toasts visible for five seconds", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({
        message: "Project file could not be read.",
        tone: "error",
      });
    });

    act(() => {
      vi.advanceTimersByTime(4999);
    });

    expect(result.current.toast?.message).toBe(
      "Project file could not be read.",
    );

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current.toast).toBeNull();
  });

  it("clears the active toast on demand", () => {
    const { result } = renderHook(() => useEditorToast());

    act(() => {
      result.current.showToast({ message: "Project imported.", tone: "success" });
    });
    act(() => {
      result.current.clearToast();
    });

    expect(result.current.toast).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
pnpm test -- src/useEditorToast.test.tsx
```

Expected: FAIL because `src/useEditorToast.ts` does not exist.

- [ ] **Step 3: Implement the hook**

Create `src/useEditorToast.ts`:

```ts
import { useCallback, useEffect, useState } from "react";

export type EditorToastTone = "success" | "info" | "error";

export type EditorToast = {
  message: string;
  tone: EditorToastTone;
};

const editorToastDurations: Record<EditorToastTone, number> = {
  success: 3000,
  info: 3000,
  error: 5000,
};

export function useEditorToast() {
  const [toast, setToast] = useState<EditorToast | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, editorToastDurations[toast.tone]);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const showToast = useCallback((nextToast: EditorToast) => {
    setToast(nextToast);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    toast,
    showToast,
    clearToast,
  };
}
```

- [ ] **Step 4: Run hook tests**

Run:

```bash
pnpm test -- src/useEditorToast.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/useEditorToast.ts src/useEditorToast.test.tsx
git commit -m "test: add editor toast lifecycle hook"
```

---

### Task 2: Move Project Workflow Toasts Onto the Shared API

**Files:**
- Modify: `src/useProjectFileWorkflow.ts`
- Modify: `src/useProjectFileWorkflow.test.tsx`

- [ ] **Step 1: Write failing project workflow expectations**

In `src/useProjectFileWorkflow.test.tsx`, import the toast type and replace the harness-owned toast output.

Add imports:

```tsx
import type { EditorToast } from "./useEditorToast";
```

Inside `WorkflowHarness`, replace the local connection feedback state with emitted toast state:

```tsx
const [lastToast, setLastToast] = useState<EditorToast | null>(null);
```

Pass `showToast` into `useProjectFileWorkflow`:

```tsx
showToast: setLastToast,
```

Replace the toast output with:

```tsx
<output aria-label="toast">
  {lastToast ? `${lastToast.tone}: ${lastToast.message}` : "none"}
</output>
```

Update assertions:

```tsx
expect(screen.getByLabelText("toast")).toHaveTextContent(
  "success: Project exported.",
);
expect(screen.getByLabelText("toast")).toHaveTextContent(
  "success: Project imported.",
);
expect(screen.getByLabelText("toast")).toHaveTextContent(
  "success: Project reset.",
);
expect(screen.getByLabelText("toast")).toHaveTextContent(
  "error: Project file could not be read.",
);
```

For parse failures, assert:

```tsx
expect(screen.getByLabelText("toast")).toHaveTextContent(/^error: /);
```

Delete the test named `clears project toasts after three seconds`; timeout behavior now belongs to `useEditorToast.test.tsx`.

- [ ] **Step 2: Run project workflow tests to verify failure**

Run:

```bash
pnpm test -- src/useProjectFileWorkflow.test.tsx
```

Expected: FAIL because `useProjectFileWorkflow` does not accept `showToast` and still returns `projectToast`.

- [ ] **Step 3: Update the project workflow hook**

In `src/useProjectFileWorkflow.ts`, add the import:

```ts
import type { EditorToast } from "./useEditorToast";
```

Add the option:

```ts
showToast: (toast: EditorToast) => void;
```

Remove:

```ts
useEffect,
const [projectToast, setProjectToast] = useState<string | null>(null);
```

Replace project toast writes:

```ts
showToast({ message: "Project exported.", tone: "success" });
showToast({ message: "Project file could not be read.", tone: "error" });
showToast({ message: parsedProject.message, tone: "error" });
showToast({ message: "Project imported.", tone: "success" });
showToast({ message: "Project reset.", tone: "success" });
```

Remove `projectToast` from the return value.

- [ ] **Step 4: Run project workflow tests**

Run:

```bash
pnpm test -- src/useProjectFileWorkflow.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/useProjectFileWorkflow.ts src/useProjectFileWorkflow.test.tsx
git commit -m "refactor: route project feedback through editor toasts"
```

---

### Task 3: Render One Toast Surface in the Editor

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing app-level tests**

In `src/App.test.tsx`, add tests in `describe("App shell", ...)` near existing toast assertions:

```tsx
it("renders project feedback through the editor toast surface", () => {
  const createObjectUrl = vi.fn(() => "blob:project");
  const revokeObjectUrl = vi.fn();
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: createObjectUrl,
    revokeObjectURL: revokeObjectUrl,
  });

  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: /project actions/i }));
  fireEvent.click(screen.getByRole("menuitem", { name: /export project/i }));

  const toast = screen.getByRole("status");

  expect(toast).toHaveClass("editor-toast");
  expect(toast).toHaveClass("success");
  expect(toast).toHaveTextContent("Project exported.");
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("renders invalid connection feedback as one error toast", () => {
  render(<App />);

  fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
  fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
  fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
  fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));

  const toast = screen.getByRole("alert");

  expect(toast).toHaveClass("editor-toast");
  expect(toast).toHaveClass("error");
  expect(toast).toHaveTextContent("That connection already exists.");
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
});

it("uses success treatment for connection deletion feedback", () => {
  render(<App />);

  fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
  fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
  fireEvent.click(screen.getByLabelText(/delete connection tensor to neuron/i));

  const toast = screen.getByRole("status");

  expect(toast).toHaveClass("editor-toast");
  expect(toast).toHaveClass("success");
  expect(toast).toHaveTextContent("Tensor -> Neuron deleted.");
  expect(within(toast).queryByTestId("toast-error-icon")).not.toBeInTheDocument();
});
```

Update existing tests that use `screen.getByRole("alert")` for deletion success to `screen.getByRole("status")`.

- [ ] **Step 2: Run app tests to verify failure**

Run:

```bash
pnpm test -- src/App.test.tsx -t "toast|connection feedback|connection deletion"
```

Expected: FAIL because `App` still renders separate `projectToast` and `connectionFeedback` surfaces.

- [ ] **Step 3: Update `App.tsx` to use the shared hook**

Add imports:

```tsx
import { CheckCircle2, InfoIcon, AlertTriangle } from "lucide-react";
import { useEditorToast } from "./useEditorToast";
import type { EditorToast } from "./useEditorToast";
```

Remove the `connectionFeedback` state. Add:

```tsx
const { toast, showToast, clearToast } = useEditorToast();
```

Pass `showToast` and `clearToast` into `useProjectFileWorkflow`:

```tsx
showToast,
clearConnectionFeedback: clearToast,
```

Replace invalid connection feedback:

```tsx
showToast({ message: validation.message, tone: "error" });
```

Replace valid connection cleanup:

```tsx
clearToast();
```

Replace deletion feedback:

```tsx
showToast({ message: `${connectionLabel} deleted.`, tone: "success" });
```

Add a local icon helper above `return`:

```tsx
const toastIconByTone: Record<EditorToast["tone"], JSX.Element> = {
  success: <CheckCircle2 size={16} aria-hidden="true" />,
  info: <InfoIcon size={16} aria-hidden="true" />,
  error: (
    <AlertTriangle
      size={16}
      aria-hidden="true"
      data-testid="toast-error-icon"
    />
  ),
};
```

Remove the separate project toast JSX and replace connection feedback JSX with one surface:

```tsx
{toast ? (
  <div
    className={`editor-toast ${toast.tone}`}
    role={toast.tone === "error" ? "alert" : "status"}
  >
    {toastIconByTone[toast.tone]}
    <span>{toast.message}</span>
  </div>
) : null}
```

- [ ] **Step 4: Update styles**

In `src/styles.css`, keep `.editor-toast` and move placement into it:

```css
.editor-toast {
  position: fixed;
  left: 50%;
  top: 60px;
  z-index: 60;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(420px, calc(100vw - 36px));
  padding: 10px 12px;
  color: var(--ink);
  background: rgb(15 23 42 / 94%);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: var(--shadow-node);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.3;
  pointer-events: none;
  transform: translateX(-50%);
}

.editor-toast.success {
  border-color: rgb(20 184 166 / 35%);
}

.editor-toast.info {
  border-color: rgb(59 130 246 / 35%);
}

.editor-toast.error {
  border-color: rgb(239 68 68 / 45%);
}

.editor-toast svg {
  flex: 0 0 auto;
}
```

Remove `.project-toast`, `.connection-feedback`, and `.connection-feedback svg`.

- [ ] **Step 5: Run app tests**

Run:

```bash
pnpm test -- src/App.test.tsx -t "toast|connection feedback|connection deletion"
```

Expected: PASS.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/App.tsx src/App.test.tsx src/styles.css
git commit -m "feat: render unified editor toast surface"
```

---

### Task 4: Full Verification

**Files:**
- Modify if needed: only files touched in Tasks 1-3.

- [ ] **Step 1: Run focused toast tests**

Run:

```bash
pnpm test -- src/useEditorToast.test.tsx src/useProjectFileWorkflow.test.tsx src/App.test.tsx -t "toast|connection feedback|connection deletion|project"
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 4: Run build**

Run:

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Manual verification checklist**

Start the app:

```bash
pnpm dev
```

Verify:

- Export project shows one success toast at the shared top-center placement and clears after about 3 seconds.
- Reset project shows one success toast at the same placement and clears after about 3 seconds.
- Importing invalid JSON shows one error toast at the same placement and clears after about 5 seconds.
- Creating a duplicate connection shows one error toast and replaces any previous project toast.
- Deleting a connection shows one success toast with success icon treatment, not warning imagery.

- [ ] **Step 6: Commit verification fixes if any**

If verification requires small fixes, commit only those fixes:

```bash
git add src/useEditorToast.ts src/useEditorToast.test.tsx src/useProjectFileWorkflow.ts src/useProjectFileWorkflow.test.tsx src/App.tsx src/App.test.tsx src/styles.css
git commit -m "fix: polish unified editor toast behavior"
```
