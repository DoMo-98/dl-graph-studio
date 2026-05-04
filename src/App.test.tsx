import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

const originalGetBoundingClientRect =
  HTMLElement.prototype.getBoundingClientRect;

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function getBoundingClientRect(this: HTMLElement) {
      if (this.classList.contains("graph-canvas")) {
        return {
          width: 960,
          height: 960,
          top: 0,
          right: 960,
          bottom: 960,
          left: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      }

      return originalGetBoundingClientRect.call(this);
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("App shell", () => {
  it("renders the graph studio workspace shell", () => {
    render(<App />);

    expect(screen.getByText(/dl-graph-studio/i)).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAccessibleName(/workspace/i);
    expect(screen.getAllByText(/local workspace/i).length).toBeGreaterThan(0);
  });

  it("shows future topbar actions as disabled and exposes real project actions from the menu", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /undo coming soon/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /redo coming soon/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /run graph coming soon/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /native save coming soon/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /project actions/i }));

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
    expect(
      screen.getByText("Role: lowest exposed primitive"),
    ).toBeInTheDocument();
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
      within(inspector).getByText("Role: lowest exposed primitive"),
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

  it("updates the Tensor shape text parameter in the inspector and node card", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/tensor primitive node/i));
    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });
    const shapeInput = within(inspector).getByRole("textbox", {
      name: /shape/i,
    });

    fireEvent.change(shapeInput, {
      target: { value: "batch, sequence, features" },
    });

    expect(shapeInput).toHaveValue("batch, sequence, features");
    expect(
      within(inspector).getByText("Shape: batch, sequence, features"),
    ).toBeInTheDocument();
    expect(
      within(screen.getByLabelText(/tensor primitive node/i)).getByText(
        "Shape: batch, sequence, features",
      ),
    ).toBeInTheDocument();
  });

  it("updates the Neuron bias boolean parameter in the inspector and node card", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/neuron primitive node/i));
    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });
    const biasCheckbox = within(inspector).getByRole("checkbox", {
      name: /bias/i,
    });

    fireEvent.click(biasCheckbox);

    expect(biasCheckbox).not.toBeChecked();
    expect(within(inspector).getByText("Bias: disabled")).toBeInTheDocument();
    expect(
      within(screen.getByLabelText(/neuron primitive node/i)).getByText(
        "Bias: disabled",
      ),
    ).toBeInTheDocument();
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

  it("deletes one chosen connection while preserving nodes and other connections", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
    fireEvent.click(screen.getByLabelText(/start connection from neuron/i));
    fireEvent.click(screen.getByLabelText(/connect neuron to activation/i));

    fireEvent.click(
      screen.getByLabelText(/delete connection tensor to neuron/i),
    );

    const connectionList = screen.getByLabelText(/graph connections/i);

    expect(
      within(connectionList).queryByText("Tensor -> Neuron"),
    ).not.toBeInTheDocument();
    expect(
      within(connectionList).getByText("Neuron -> Activation"),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      /tensor -> neuron deleted/i,
    );
    expect(screen.getByLabelText(/tensor primitive node/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/neuron primitive node/i)).toBeInTheDocument();
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

  it("keeps remaining connections after deleting one connection", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    fireEvent.change(screen.getByRole("spinbutton", { name: /units/i }), {
      target: { value: "256" },
    });
    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
    fireEvent.click(screen.getByLabelText(/start connection from neuron/i));
    fireEvent.click(screen.getByLabelText(/connect neuron to activation/i));
    fireEvent.click(
      screen.getByLabelText(/delete connection tensor to neuron/i),
    );

    const connectionList = screen.getByLabelText(/graph connections/i);
    expect(
      within(connectionList).getByText("Neuron -> Activation"),
    ).toBeInTheDocument();
    expect(
      within(connectionList).queryByText("Tensor -> Neuron"),
    ).not.toBeInTheDocument();
  });

  it("preserves node state and connections after creating multiple connections", () => {
    render(<App />);

    // Create connections and verify all nodes remain intact
    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));
    fireEvent.click(screen.getByLabelText(/start connection from neuron/i));
    fireEvent.click(screen.getByLabelText(/connect neuron to activation/i));

    // Select neuron and verify inspector state
    fireEvent.click(screen.getByLabelText(/neuron primitive node/i));
    const inspector = screen.getByRole("complementary", {
      name: /node inspector/i,
    });

    expect(
      within(inspector).getByRole("spinbutton", { name: /units/i }),
    ).toHaveValue(1);

    // Verify both connections exist
    const connectionList = screen.getByLabelText(/graph connections/i);
    expect(
      within(connectionList).getByText("Tensor -> Neuron"),
    ).toBeInTheDocument();
    expect(
      within(connectionList).getByText("Neuron -> Activation"),
    ).toBeInTheDocument();
  });

  it("updates parameter values correctly across different node selections", () => {
    render(<App />);

    // Select dense-linear and change units
    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    fireEvent.change(screen.getByRole("spinbutton", { name: /units/i }), {
      target: { value: "384" },
    });

    // Verify the parameter value persists
    expect(screen.getByRole("spinbutton", { name: /units/i })).toHaveValue(384);

    // Switch to neuron and back to verify values are node-specific
    fireEvent.click(screen.getByLabelText(/neuron primitive node/i));
    expect(screen.getByRole("spinbutton", { name: /units/i })).toHaveValue(1);

    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    expect(screen.getByRole("spinbutton", { name: /units/i })).toHaveValue(384);
  });

  it("resets the project from the project actions menu", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    fireEvent.change(screen.getByRole("spinbutton", { name: /units/i }), {
      target: { value: "384" },
    });
    fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
    fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));

    fireEvent.click(screen.getByRole("button", { name: /project actions/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /reset project/i }));

    expect(
      screen.queryByLabelText(/graph connections/i),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/project reset/i);
    expect(screen.getByText("Ready")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/dense \/ linear primitive node/i));
    expect(screen.getByRole("spinbutton", { name: /units/i })).toHaveValue(128);
  });

  it("imports a project file from the project actions menu", async () => {
    render(<App />);

    const projectFile = new File(
      [
        JSON.stringify({
          version: 1,
          nodes: [
            {
              id: "imported-tensor",
              type: "primitive",
              label: "Imported Tensor",
              kind: "Data",
              metadata: ["Role: imported data carrier"],
              parameters: [
                {
                  id: "shape",
                  label: "Shape",
                  type: "text",
                  value: "batch, features",
                },
              ],
              position: { x: 40, y: 40 },
            },
          ],
          connections: [],
        }),
      ],
      "imported-project.json",
      { type: "application/json" },
    );

    fireEvent.click(screen.getByRole("button", { name: /project actions/i }));
    fireEvent.change(screen.getByLabelText(/import project file/i), {
      target: { files: [projectFile] },
    });

    expect(await screen.findByText("Imported Tensor")).toBeInTheDocument();
    expect(screen.queryByText("Dense / Linear")).not.toBeInTheDocument();
  });

  it("exports the current project from the project actions menu", () => {
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

      render(<App />);

      fireEvent.click(screen.getByLabelText(/tensor primitive node/i));
      fireEvent.change(screen.getByRole("textbox", { name: /shape/i }), {
        target: { value: "batch, features" },
      });
      fireEvent.click(screen.getByLabelText(/neuron primitive node/i));
      fireEvent.click(screen.getByRole("checkbox", { name: /bias/i }));
      fireEvent.click(screen.getByLabelText(/start connection from tensor/i));
      fireEvent.click(screen.getByLabelText(/connect tensor to neuron/i));

      fireEvent.click(screen.getByRole("button", { name: /project actions/i }));
      fireEvent.click(
        screen.getByRole("menuitem", { name: /export project/i }),
      );

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:project-file");
      expect(blobParts).toHaveLength(1);

      const [serializedProject] = blobParts[0];
      expect(typeof serializedProject).toBe("string");

      const exportedProject = JSON.parse(serializedProject as string);
      const exportedTensor = exportedProject.nodes.find(
        (node: { id: string }) => node.id === "tensor",
      );
      const exportedNeuron = exportedProject.nodes.find(
        (node: { id: string }) => node.id === "neuron",
      );

      expect(exportedTensor.parameters).toContainEqual({
        id: "shape",
        label: "Shape",
        type: "text",
        value: "batch, features",
      });
      expect(exportedNeuron.parameters).toContainEqual({
        id: "bias",
        label: "Bias",
        type: "boolean",
        value: false,
      });
      expect(exportedProject.connections).toContainEqual({
        id: "connection-tensor-neuron",
        source: "tensor",
        target: "neuron",
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
});
