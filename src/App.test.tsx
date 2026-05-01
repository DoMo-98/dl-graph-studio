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

  it("shows readable metadata for each primitive node before selection", () => {
    render(<App />);

    expect(screen.queryByText(/canvas is empty/i)).not.toBeInTheDocument();
    expect(screen.getByText("Role: data carrier")).toBeInTheDocument();
    expect(screen.getByText("Lowest exposed primitive")).toBeInTheDocument();
    expect(screen.getByText("Function: GELU")).toBeInTheDocument();
    expect(
      screen.getByText("Derived from neuron primitives"),
    ).toBeInTheDocument();
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

  it("selects a primitive node and shows editable inspector details", () => {
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
    expect(
      within(inspector).getByRole("spinbutton", { name: /units/i }),
    ).toHaveValue(1);
    expect(
      within(inspector).getByRole("checkbox", { name: /bias/i }),
    ).toBeChecked();
  });

  it("updates selected node parameters and keeps values associated with each node", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });
    const unitsInput = within(inspector).getByRole("spinbutton", {
      name: /units/i,
    });

    fireEvent.change(unitsInput, { target: { value: "256" } });

    expect(unitsInput).toHaveValue(256);
    expect(within(inspector).getByText("Units: 256")).toBeInTheDocument();
    expect(
      within(
        screen.getByLabelText(/dense \/ linear primitive node/i),
      ).getByText("Units: 256"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/activation primitive node/i));
    const activationSelect = within(inspector).getByRole("combobox", {
      name: /function/i,
    });

    fireEvent.change(activationSelect, { target: { value: "ReLU" } });

    expect(activationSelect).toHaveValue("ReLU");
    expect(within(inspector).getByText("Function: ReLU")).toBeInTheDocument();
    expect(
      within(screen.getByLabelText(/activation primitive node/i)).getByText(
        "Function: ReLU",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));

    expect(
      within(inspector).getByRole("spinbutton", { name: /units/i }),
    ).toHaveValue(256);
  });

  it("creates visible in-memory connections between primitive nodes", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
    fireEvent.click(screen.getByLabelText(/start connection from neuron/i));
    fireEvent.click(screen.getByLabelText(/connect neuron to activation/i));

    expect(screen.getByText("Tensor -> Neuron")).toBeInTheDocument();
    expect(screen.getByText("Neuron -> Activation")).toBeInTheDocument();
  });

  it("rejects duplicate connections with clear feedback", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));

    const connectionList = screen.getByLabelText(/graph connections/i);

    expect(
      within(connectionList).getAllByText("Tensor -> Neuron"),
    ).toHaveLength(1);
    expect(
      screen.getByText(/that connection already exists/i),
    ).toBeInTheDocument();
  });

  it("rejects connections into the tensor input node with clear feedback", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/start connection from neuron/i));
    fireEvent.click(screen.getByLabelText(/connect neuron to tensor/i));

    expect(screen.queryByText("Neuron -> Tensor")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /tensor is an input node and cannot receive connections/i,
      ),
    ).toBeInTheDocument();
  });

  it("keeps node selection and inspector behavior after connections are created", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
    fireEvent.click(screen.getByLabelText(/neuron primitive node/i));

    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });

    expect(
      within(inspector).getByRole("heading", { name: /neuron/i }),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByRole("spinbutton", { name: /units/i }),
    ).toHaveValue(1);
  });
});
