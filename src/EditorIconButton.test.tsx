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

  it("preserves generic caller props and handles enabled clicks", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <EditorIconButton
        label="Run graph"
        icon={<MoreVertical />}
        data-testid="run-button"
        onClick={onClick}
      />,
    );

    const button = screen.getByTestId("run-button");

    expect(button).toHaveAttribute("data-testid", "run-button");

    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
