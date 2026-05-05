# Connections Panel Space Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bottom graph connections drawer collapsible and expandable while preserving existing connection behavior.

**Architecture:** Keep the panel state local to `src/App.tsx` because the collapse state is session-only UI state and does not belong in the graph project model. Extend the existing drawer markup with a semantic toggle button, hide only the list body when collapsed, and let the current grid layout reclaim vertical space. Add focused tests around default expanded state, collapse persistence while adding connections, re-expansion, and delete behavior.

**Tech Stack:** React, TypeScript, Vite, Vitest, React Testing Library, lucide-react, CSS.

---

## File Structure

- Modify `src/App.test.tsx`: add focused tests for the connections drawer toggle behavior near the existing connection tests.
- Modify `src/App.tsx`: add local collapse state, accessible toggle labels, conditional list rendering, and one lucide icon import.
- Modify `src/styles.css`: update drawer header layout and add compact toggle button styles.

No new runtime files, hooks, dependencies, or project-model changes are needed.

---

### Task 1: Add Failing Tests For Collapse Behavior

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Add the collapse behavior test after `creates visible in-memory connections between primitive nodes`**

Insert this test immediately after the existing test that starts at `src/App.test.tsx:291`:

```tsx
  it("collapses and expands the connections panel without losing existing connections", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));

    const connectionPanel = screen.getByLabelText(/graph connections/i);
    const collapseButton = within(connectionPanel).getByRole("button", {
      name: /collapse connections panel/i,
    });

    expect(collapseButton).toHaveAttribute("aria-expanded", "true");
    expect(within(connectionPanel).getByText("Tensor -> Neuron")).toBeInTheDocument();

    fireEvent.click(collapseButton);

    const expandButton = within(connectionPanel).getByRole("button", {
      name: /expand connections panel/i,
    });

    expect(expandButton).toHaveAttribute("aria-expanded", "false");
    expect(
      within(connectionPanel).queryByText("Tensor -> Neuron"),
    ).not.toBeInTheDocument();

    fireEvent.click(expandButton);

    expect(
      within(connectionPanel).getByText("Tensor -> Neuron"),
    ).toBeInTheDocument();
    expect(
      within(connectionPanel).getByRole("button", {
        name: /delete connection tensor to neuron/i,
      }),
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Add the collapsed-state persistence test after the test from Step 1**

Insert this second test immediately after the first new test:

```tsx
  it("keeps the connections panel collapsed when new connections are added", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));

    const connectionPanel = screen.getByLabelText(/graph connections/i);
    fireEvent.click(
      within(connectionPanel).getByRole("button", {
        name: /collapse connections panel/i,
      }),
    );

    fireEvent.click(screen.getByLabelText(/start connection from neuron/i));
    fireEvent.click(screen.getByLabelText(/connect neuron to activation/i));

    expect(
      within(connectionPanel).getByRole("button", {
        name: /expand connections panel/i,
      }),
    ).toHaveAttribute("aria-expanded", "false");
    expect(within(connectionPanel).getByText("2")).toBeInTheDocument();
    expect(
      within(connectionPanel).queryByText("Tensor -> Neuron"),
    ).not.toBeInTheDocument();
    expect(
      within(connectionPanel).queryByText("Neuron -> Activation"),
    ).not.toBeInTheDocument();
  });
```

- [ ] **Step 3: Run the focused tests and verify they fail for the missing toggle**

Run:

```bash
pnpm test -- src/App.test.tsx -t "connections panel"
```

Expected: FAIL because no button named `Collapse connections panel` exists yet.

---

### Task 2: Implement The Connections Drawer Toggle

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Import a compact expand/collapse icon**

Update the lucide import in `src/App.tsx` so it includes `ChevronDown`.

Expected import excerpt:

```tsx
import {
  AlertTriangle,
  BookOpen,
  Box,
  ChevronDown,
  ChevronsRight,
  CircuitBoard,
  Grid,
  Hand,
  Info,
  Link2,
  MousePointer2,
  Play,
  RotateCcw,
  Save,
  Settings,
  Share2,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Redo2,
  X,
  MoreVertical,
  Download,
  Upload,
} from "lucide-react";
```

- [ ] **Step 2: Add local UI state in `App`**

Add this state after the existing `connectionSourceId` state in `src/App.tsx`:

```tsx
  const [isConnectionsPanelCollapsed, setIsConnectionsPanelCollapsed] =
    useState(false);
```

The surrounding state block should read:

```tsx
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(
    null,
  );
  const [isConnectionsPanelCollapsed, setIsConnectionsPanelCollapsed] =
    useState(false);
  const graphCanvasRef = useRef<HTMLElement | null>(null);
```

- [ ] **Step 3: Add a toggle label constant before the JSX return**

Add this constant after `canvasEdges` is computed and before `return (`. If `canvasEdges` is already near the JSX return, keep this local to the render preparation area:

```tsx
  const connectionsPanelToggleLabel = isConnectionsPanelCollapsed
    ? "Expand connections panel"
    : "Collapse connections panel";
```

- [ ] **Step 4: Replace the connections drawer markup**

Replace the current block that starts with `{canvasEdges.length > 0 ? (` and renders `<section className="connection-drawer" aria-label="Graph connections">` with this markup:

```tsx
          {canvasEdges.length > 0 ? (
            <section
              className={`connection-drawer${isConnectionsPanelCollapsed ? " collapsed" : ""}`}
              aria-label="Graph connections"
            >
              <header className="connection-drawer-header">
                <div className="connection-drawer-summary">
                  <h3>Connections</h3>
                  <span>{graphConnections.length}</span>
                </div>
                <button
                  type="button"
                  className="connection-drawer-toggle"
                  aria-expanded={!isConnectionsPanelCollapsed}
                  aria-label={connectionsPanelToggleLabel}
                  title={connectionsPanelToggleLabel}
                  onClick={() =>
                    setIsConnectionsPanelCollapsed(
                      (currentIsCollapsed) => !currentIsCollapsed,
                    )
                  }
                >
                  <ChevronDown size={16} aria-hidden="true" />
                </button>
              </header>
              {!isConnectionsPanelCollapsed ? (
                <div className="connection-list">
                  {graphConnections.map((connection) => {
                    const connectionLabel = getGraphConnectionLabel(
                      connection,
                      graphNodes,
                    );

                    return (
                      <div className="connection-list-item" key={connection.id}>
                        <span>{connectionLabel}</span>
                        <button
                          type="button"
                          className="connection-delete-button"
                          aria-label={getDeleteConnectionLabel(connectionLabel)}
                          title={getDeleteConnectionLabel(connectionLabel)}
                          onClick={() => deleteGraphConnection(connection.id)}
                        >
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          ) : null}
```

- [ ] **Step 5: Run the focused tests**

Run:

```bash
pnpm test -- src/App.test.tsx -t "connections panel"
```

Expected: PASS for the two new tests. If the command also runs unrelated tests whose names match the filter, they should remain PASS.

---

### Task 3: Style The Compact Drawer State

**Files:**
- Modify: `src/styles.css`

- [ ] **Step 1: Update the drawer header styles**

Replace the existing `.connection-drawer-header` block and `.connection-drawer-header span` block with:

```css
.connection-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 38px;
  padding: 0 8px 0 12px;
  border-bottom: 1px solid var(--surface-muted);
}

.connection-drawer.collapsed .connection-drawer-header {
  border-bottom: 0;
}

.connection-drawer-summary {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.connection-drawer-summary h3 {
  margin: 0;
}

.connection-drawer-summary span {
  display: inline-grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  color: #ffffff;
  background: var(--teal-strong);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}
```

- [ ] **Step 2: Add toggle button styles before `.connection-list`**

Insert this CSS before the existing `.connection-list` block:

```css
.connection-drawer-toggle {
  display: inline-grid;
  width: 28px;
  height: 28px;
  flex: 0 0 auto;
  place-items: center;
  color: var(--teal-strong);
  background: var(--teal-soft);
  border: 1px solid rgba(19, 168, 158, 0.25);
  border-radius: 7px;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.connection-drawer-toggle:hover,
.connection-drawer-toggle:focus-visible {
  color: #ffffff;
  background: var(--teal);
  outline: none;
  box-shadow: 0 0 0 3px rgb(19 168 158 / 20%);
}

.connection-drawer.collapsed .connection-drawer-toggle svg {
  transform: rotate(180deg);
}
```

- [ ] **Step 3: Run the focused tests again**

Run:

```bash
pnpm test -- src/App.test.tsx -t "connections panel"
```

Expected: PASS.

---

### Task 4: Run Full Verification

**Files:**
- Verify: `src/App.test.tsx`
- Verify: `src/App.tsx`
- Verify: `src/styles.css`

- [ ] **Step 1: Run the full test suite**

Run:

```bash
pnpm test
```

Expected: PASS.

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm lint
```

Expected: PASS.

- [ ] **Step 3: Run build**

Run:

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 4: Run formatting check if available**

Run:

```bash
pnpm format:check
```

Expected: PASS if the script exists. If the script does not exist, record the exact package manager error and continue with the issue-required checks from Steps 1-3.

- [ ] **Step 5: Inspect the final diff**

Run:

```bash
git diff -- src/App.test.tsx src/App.tsx src/styles.css
```

Expected: diff only covers the connections drawer tests, local collapsed state, drawer toggle markup, and drawer styles.

- [ ] **Step 6: Commit the implementation**

Run:

```bash
git add src/App.test.tsx src/App.tsx src/styles.css
git commit -m "feat: collapse connections panel"
```

Expected: commit succeeds with only the implementation files staged.

---

## Manual Verification Notes For The PR

After implementation, run `pnpm dev`, open the editor, and verify:

1. Create `Tensor -> Neuron`; the connections drawer appears expanded.
2. Collapse the drawer; only the compact header remains and the canvas has more vertical room.
3. Add `Neuron -> Activation`; the drawer remains collapsed and the count changes to `2`.
4. Expand the drawer; both connection rows are visible.
5. Delete one connection; the remaining row stays visible and existing delete feedback still appears.
6. Resize to a narrower viewport; the toggle remains reachable.

Capture screenshots or a short recording of expanded and collapsed states for the pull request.

---

## Self-Review

- Spec coverage: The plan covers default expanded behavior, session-only collapsed state, no persistence, no model changes, accessible toggle state, compact styling, tests, and issue-required verification.
- Placeholder scan: No placeholder tokens, deferred-work markers, or vague edge-case instructions remain.
- Type consistency: The plan uses one boolean state, `isConnectionsPanelCollapsed`, one setter, `setIsConnectionsPanelCollapsed`, and one render-local label constant, `connectionsPanelToggleLabel`, consistently across code and tests.
