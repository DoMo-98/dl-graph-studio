# Centralize Editor Icon Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize existing icon-only editor buttons behind one focused primitive while preserving current accessibility labels, titles, visual variants, and interactions.

**Architecture:** Add a small `EditorIconButton` component that owns the repeated `<button type="button">`, `aria-label`, default `title`, icon-only rendering, ref forwarding for Radix `asChild`, and shared class composition. Keep all behavior in callers and all visual variants in existing CSS class names so the PR stays a local cleanup.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Radix DropdownMenu, lucide-react, plain CSS.

---

### Task 1: Add The Icon-Only Button Primitive

**Files:**

- Create: `src/EditorIconButton.tsx`
- Create: `src/EditorIconButton.test.tsx`

- [ ] **Step 1: Write the failing primitive contract tests**

Create `src/EditorIconButton.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoreVertical } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { EditorIconButton } from "./EditorIconButton";

describe("EditorIconButton", () => {
  it("renders an icon-only button with a label and default title", () => {
    render(
      <EditorIconButton label="Project actions" icon={<MoreVertical />} />,
    );

    const button = screen.getByRole("button", { name: "Project actions" });

    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("title", "Project actions");
    expect(button).toHaveClass("editor-icon-button");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("preserves caller props, custom title, classes, disabled state, and clicks", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <EditorIconButton
        label="Run graph coming soon"
        title="Custom run title"
        icon={<MoreVertical />}
        className="future-action"
        disabled
        aria-expanded={false}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole("button", {
      name: "Run graph coming soon",
    });

    expect(button).toHaveAttribute("title", "Custom run title");
    expect(button).toHaveClass("editor-icon-button", "future-action");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm test -- src/EditorIconButton.test.tsx`

Expected: FAIL because `src/EditorIconButton.tsx` does not exist yet.

- [ ] **Step 3: Implement the primitive**

Create `src/EditorIconButton.tsx`:

```tsx
import { forwardRef } from "react";

type EditorIconButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "aria-label"
> & {
  icon: React.ReactNode;
  label: string;
};

export const EditorIconButton = forwardRef<
  HTMLButtonElement,
  EditorIconButtonProps
>(function EditorIconButton(
  { className, icon, label, title = label, type = "button", ...buttonProps },
  ref,
) {
  const buttonClassName = className
    ? `editor-icon-button ${className}`
    : "editor-icon-button";

  return (
    <button
      {...buttonProps}
      ref={ref}
      type={type}
      className={buttonClassName}
      aria-label={label}
      title={title}
    >
      {icon}
    </button>
  );
});
```

- [ ] **Step 4: Run the primitive test and verify it passes**

Run: `pnpm test -- src/EditorIconButton.test.tsx`

Expected: PASS.

### Task 2: Migrate Existing Editor Icon Buttons

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/ProjectActionsMenu.tsx`
- Modify: `src/styles.css`
- Test: `src/App.test.tsx`
- Test: `src/ProjectActionsMenu.test.tsx`
- Test: `src/EditorIconButton.test.tsx`

- [ ] **Step 1: Import and use the primitive in app/editor controls**

In `src/App.tsx`, import the primitive:

```tsx
import { EditorIconButton } from "./EditorIconButton";
```

Replace:

- connection cancel button with `EditorIconButton` using `className="connection-button cancel nodrag"`, label/title `Cancel connection from ${data.label}`, icon `<X size={15} aria-hidden="true" />`, and existing click handler.
- connection start/complete button with `EditorIconButton` using `className="connection-button nodrag"`, the existing dynamic label as both label and title, icon `<Link2 size={15} aria-hidden="true" />`, and existing click handler.
- each disabled topbar future action button with `EditorIconButton` using `className="topbar-icon-button future-action"`, existing label/title, existing icon, and `disabled`.
- connections drawer toggle with `EditorIconButton` using `className="connection-drawer-toggle"`, `aria-expanded={!isConnectionsPanelCollapsed}`, label/title `connectionsPanelToggleLabel`, icon `<ChevronDown size={16} aria-hidden="true" />`, and existing click handler.
- connection delete button with `EditorIconButton` using `className="connection-delete-button"`, label/title `getDeleteConnectionLabel(connectionLabel)`, icon `<Trash2 size={13} aria-hidden="true" />`, and existing click handler.

- [ ] **Step 2: Use the primitive as the Radix trigger child**

In `src/ProjectActionsMenu.tsx`, import the primitive:

```tsx
import { EditorIconButton } from "./EditorIconButton";
```

Replace the trigger `<button>` with:

```tsx
<EditorIconButton
  className="topbar-icon-button"
  label="Project actions"
  icon={<MoreVertical size={18} aria-hidden="true" />}
/>
```

- [ ] **Step 3: Centralize the CSS base without visual changes**

In `src/styles.css`, add a base selector named `.editor-icon-button` with the common icon-only button declarations:

```css
.editor-icon-button {
  display: inline-grid;
  place-items: center;
  border-radius: 8px;
  cursor: pointer;
}
```

Then remove only the duplicated `display: inline-grid`, `place-items: center`, and `cursor: pointer` declarations from `.topbar-icon-button`, `.connection-button`, `.connection-drawer-toggle`, and `.connection-delete-button`. Keep all existing sizes, colors, borders, transitions, hover/focus states, disabled/future-action rules, and per-control radii.

- [ ] **Step 4: Run focused behavior tests**

Run: `pnpm test -- src/EditorIconButton.test.tsx src/ProjectActionsMenu.test.tsx src/App.test.tsx`

Expected: PASS. Existing tests should continue to prove project actions, connection controls, drawer toggle, delete behavior, and topbar labels still work.

- [ ] **Step 5: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm build
```

Expected: all PASS.
