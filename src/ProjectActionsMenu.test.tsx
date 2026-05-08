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
