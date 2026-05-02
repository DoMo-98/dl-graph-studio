import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

  it("renders a visually distinct composite architecture node on the canvas", () => {
    render(<App />);

    const compositeNode = screen.getByLabelText(/dense block composite node/i);

    expect(screen.getAllByTestId("architecture-node")).toHaveLength(4);
    expect(screen.getAllByTestId("composite-node")).toHaveLength(1);
    expect(compositeNode).toHaveClass("composite-node");
    expect(within(compositeNode).getByText("Composite")).toBeInTheDocument();
    expect(within(compositeNode).getByText("Dense Block")).toBeInTheDocument();
    expect(
      within(compositeNode).getByText(
        "Members: Neuron, Activation, Dense / Linear",
      ),
    ).toBeInTheDocument();
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
    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });

    expect(
      within(inspector).getByText(/no node selected/i),
    ).toBeInTheDocument();
    expect(within(inspector).getByText(/select a node/i)).toBeInTheDocument();
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

  it("selects a composite node and shows basic inspector details", () => {
    render(<App />);

    const compositeNode = screen.getByLabelText(/dense block composite node/i);

    fireEvent.click(compositeNode);

    expect(compositeNode).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText(/neuron primitive node/i)).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });

    expect(
      within(inspector).getByRole("heading", { name: /dense block/i }),
    ).toBeInTheDocument();
    expect(within(inspector).getByText("Composite")).toBeInTheDocument();
    expect(
      within(inspector).getByText(
        "Members: Neuron, Activation, Dense / Linear",
      ),
    ).toBeInTheDocument();
    expect(
      within(inspector).getByText("Role: reusable feed-forward block"),
    ).toBeInTheDocument();
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

  it("exports a minimal project with edited parameters and connections", async () => {
    const originalCreateObjectUrl = URL.createObjectURL;
    const originalRevokeObjectUrl = URL.revokeObjectURL;
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    let exportedProject = "";

    URL.createObjectURL = (object: Blob) => {
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        exportedProject = String(reader.result);
      });
      reader.readAsText(object);

      return "blob:dl-graph-studio-project";
    };
    URL.revokeObjectURL = () => {};
    HTMLAnchorElement.prototype.click = () => {};

    try {
      render(<App />);

      fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
      fireEvent.change(screen.getByRole("spinbutton", { name: /units/i }), {
        target: { value: "256" },
      });
      fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
      fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
      fireEvent.click(screen.getByRole("button", { name: /export project/i }));

      await waitFor(() => expect(exportedProject).not.toBe(""));

      const project = JSON.parse(exportedProject);

      expect(project).toMatchObject({
        version: 1,
        nodes: expect.arrayContaining([
          expect.objectContaining({
            id: "dense-linear",
            parameters: expect.arrayContaining([
              expect.objectContaining({ id: "units", value: 256 }),
            ]),
            position: { x: 96, y: 724 },
          }),
          expect.objectContaining({
            id: "dense-block",
            type: "composite",
            memberNodeIds: ["neuron", "activation", "dense-linear"],
          }),
        ]),
        connections: [
          {
            id: "connection-tensor-neuron",
            source: "tensor",
            target: "neuron",
          },
        ],
      });
    } finally {
      URL.createObjectURL = originalCreateObjectUrl;
      URL.revokeObjectURL = originalRevokeObjectUrl;
      HTMLAnchorElement.prototype.click = originalAnchorClick;
    }
  });

  it("imports a saved project after reset and restores parameters and connections", async () => {
    render(<App />);

    const savedProject = {
      version: 1,
      nodes: [
        {
          id: "tensor",
          label: "Tensor",
          kind: "Data",
          metadata: ["Role: data carrier"],
          parameters: [
            { id: "shape", label: "Shape", type: "text", value: "batch, 32" },
          ],
          position: { x: 96, y: 64 },
        },
        {
          id: "neuron",
          label: "Neuron",
          kind: "Foundation",
          metadata: ["Lowest exposed primitive", "Parameters: weights + bias"],
          parameters: [
            {
              id: "units",
              label: "Units",
              type: "number",
              value: 4,
              min: 1,
              step: 1,
            },
            { id: "bias", label: "Bias", type: "boolean", value: false },
          ],
          position: { x: 96, y: 284 },
        },
      ],
      connections: [
        {
          id: "connection-tensor-neuron",
          source: "tensor",
          target: "neuron",
        },
      ],
    };

    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    fireEvent.change(screen.getByRole("spinbutton", { name: /units/i }), {
      target: { value: "512" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reset project/i }));
    fireEvent.change(screen.getByLabelText(/import project/i), {
      target: {
        files: [
          new File([JSON.stringify(savedProject)], "saved.dlgraph.json", {
            type: "application/json",
          }),
        ],
      },
    });

    await waitFor(() =>
      expect(screen.getByText(/project loaded/i)).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByLabelText(/neuron primitive node/i));

    expect(screen.getByText("Tensor -> Neuron")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: /units/i })).toHaveValue(4);
    expect(screen.getByRole("checkbox", { name: /bias/i })).not.toBeChecked();
  });

  it("keeps the current graph when imported project data is invalid", async () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    fireEvent.change(screen.getByRole("spinbutton", { name: /units/i }), {
      target: { value: "384" },
    });
    fireEvent.change(screen.getByLabelText(/import project/i), {
      target: {
        files: [
          new File(["not valid json"], "broken.dlgraph.json", {
            type: "application/json",
          }),
        ],
      },
    });

    await waitFor(() =>
      expect(screen.getByText(/could not load project/i)).toBeInTheDocument(),
    );

    expect(screen.getByRole("spinbutton", { name: /units/i })).toHaveValue(384);
  });
});
