import { fireEvent, render, screen, within } from "@testing-library/react";
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

  it("renders deterministic primitive architecture nodes on the canvas", () => {
    render(<App />);

    expect(
      screen.getByRole("region", { name: /graph canvas/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("architecture-node")).toHaveLength(4);
    expect(screen.getByText("Tensor")).toBeInTheDocument();
    expect(screen.getByText("Neuron")).toBeInTheDocument();
    expect(screen.getByText("Activation")).toBeInTheDocument();
    expect(screen.getByText("Dense / Linear")).toBeInTheDocument();
    expect(screen.queryByText("Convolution")).not.toBeInTheDocument();
  });

  it("shows readable metadata for each primitive node without editing controls", () => {
    render(<App />);

    expect(screen.queryByText(/canvas is empty/i)).not.toBeInTheDocument();
    expect(screen.getByText("Role: data carrier")).toBeInTheDocument();
    expect(screen.getByText("Lowest exposed primitive")).toBeInTheDocument();
    expect(screen.getByText("Function: GELU")).toBeInTheDocument();
    expect(
      screen.getByText("Derived from neuron primitives"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows a clear inspector state when no node is selected", () => {
    render(<App />);

    expect(
      screen.getByRole("complementary", { name: /node inspector/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /inspector/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no node selected/i)).toBeInTheDocument();
    expect(screen.getByText(/select a primitive node/i)).toBeInTheDocument();
  });

  it("selects a primitive node and shows its read-only inspector details", () => {
    render(<App />);

    const neuronNode = screen.getByLabelText(/neuron primitive node/i);
    const tensorNode = screen.getByLabelText(/tensor primitive node/i);

    fireEvent.click(neuronNode);

    expect(neuronNode).toHaveAttribute("aria-pressed", "true");
    expect(tensorNode).toHaveAttribute("aria-pressed", "false");
    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });
    expect(
      within(inspector).getByRole("heading", { name: /neuron/i }),
    ).toBeInTheDocument();
    expect(within(inspector).getByText("Foundation")).toBeInTheDocument();
    expect(
      within(inspector).getByText("Lowest exposed primitive"),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByText("Parameters: weights + bias"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
