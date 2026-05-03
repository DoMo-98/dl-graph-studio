import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentType, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";

type MockFlowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  selected: boolean;
  data: {
    label: string;
  };
};

type MockFlowEdge = {
  id: string;
  label?: string;
};

type MockReactFlowProps = {
  nodes: MockFlowNode[];
  edges: MockFlowEdge[];
  nodeTypes: Record<string, ComponentType<{ data: MockFlowNode["data"] }>>;
  nodesDraggable?: boolean;
  nodeExtent?: unknown;
  autoPanOnNodeDrag?: boolean;
  onNodesChange?: (
    changes: Array<{
      id: string;
      type: "position";
      positionAbsolute: { x: number; y: number };
    }>,
  ) => void;
  children: ReactNode;
};

vi.mock("@xyflow/react", () => ({
  Background: () => <div data-testid="flow-background" />,
  Handle: () => null,
  MarkerType: { ArrowClosed: "arrowclosed" },
  Position: { Left: "left", Right: "right" },
  ReactFlow: ({
    nodes,
    edges,
    nodeTypes,
    nodesDraggable,
    nodeExtent,
    autoPanOnNodeDrag,
    onNodesChange,
    children,
  }: MockReactFlowProps) => (
    <div
      data-testid="react-flow"
      data-nodes-draggable={nodesDraggable}
      data-has-node-extent={nodeExtent !== undefined}
      data-auto-pan-on-node-drag={autoPanOnNodeDrag}
    >
      {nodes.map((node) => {
        const FlowNode = nodeTypes[node.type];
        const nextPosition =
          node.id === "dense-block"
            ? { x: 1500, y: 1500 }
            : {
                x: node.position.x + 32,
                y: node.position.y + 48,
              };

        return (
          <div
            data-testid={`flow-node-${node.id}`}
            data-x={node.position.x}
            data-y={node.position.y}
            key={node.id}
          >
            <button
              type="button"
              onClick={() =>
                onNodesChange?.([
                  {
                    id: node.id,
                    type: "position",
                    positionAbsolute: nextPosition,
                  },
                ])
              }
            >
              Move {node.data.label}
            </button>
            <FlowNode data={node.data} />
          </div>
        );
      })}
      {edges.map((edge) => (
        <span key={edge.id}>{edge.label}</span>
      ))}
      {children}
    </div>
  ),
}));

describe("App node dragging", () => {
  it("updates primitive and composite positions and exports the moved layout", async () => {
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

      expect(screen.getByTestId("react-flow")).toHaveAttribute(
        "data-nodes-draggable",
        "true",
      );
      expect(screen.getByTestId("react-flow")).toHaveAttribute(
        "data-has-node-extent",
        "false",
      );
      expect(screen.getByTestId("react-flow")).toHaveAttribute(
        "data-auto-pan-on-node-drag",
        "false",
      );

      fireEvent.click(screen.getByRole("button", { name: "Move Tensor" }));
      fireEvent.click(screen.getByRole("button", { name: "Move Dense Block" }));
      fireEvent.click(screen.getByRole("button", { name: /export project/i }));

      await waitFor(() => expect(exportedProject).not.toBe(""));

      const project = JSON.parse(exportedProject);

      expect(project.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: "tensor",
            position: { x: 128, y: 112 },
          }),
          expect.objectContaining({
            id: "dense-block",
            position: { x: 740, y: 780 },
          }),
        ]),
      );
    } finally {
      URL.createObjectURL = originalCreateObjectUrl;
      URL.revokeObjectURL = originalRevokeObjectUrl;
      HTMLAnchorElement.prototype.click = originalAnchorClick;
    }
  });
});
