import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App shell", () => {
  it("renders the graph studio workspace shell", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /dl-graph-studio/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAccessibleName(/workspace/i);
    expect(screen.getAllByText(/local workspace/i).length).toBeGreaterThan(0);
  });
});
