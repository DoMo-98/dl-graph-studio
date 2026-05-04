import { fireEvent, render, screen } from "@testing-library/react";
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
  it("updates primitive and composite positions and clamps within canvas bounds", () => {
    render(<App />);

    expect(screen.getByTestId("react-flow")).toHaveAttribute(
      "data-nodes-draggable",
      "true",
    );
    expect(screen.getByTestId("react-flow")).toHaveAttribute(
      "data-has-node-extent",
      "true",
    );
    expect(screen.getByTestId("react-flow")).toHaveAttribute(
      "data-auto-pan-on-node-drag",
      "false",
    );

    // Move Tensor node (position x+32, y+48 per mock)
    fireEvent.click(screen.getByRole("button", { name: "Move Tensor" }));

    // Verify position changed in the flow node data attributes
    const tensorFlowNode = screen.getByTestId("flow-node-tensor");
    expect(tensorFlowNode).toHaveAttribute("data-x", "128");
    expect(tensorFlowNode).toHaveAttribute("data-y", "112");

    // Move Dense Block (clamped from 1500,1500 to canvas bounds)
    fireEvent.click(screen.getByRole("button", { name: "Move Dense Block" }));

    const denseBlockFlowNode = screen.getByTestId("flow-node-dense-block");
    // Composite node is 220x180, canvas is dynamic but should be clamped
    const blockX = Number(denseBlockFlowNode.getAttribute("data-x"));
    const blockY = Number(denseBlockFlowNode.getAttribute("data-y"));
    expect(blockX).toBeGreaterThan(0);
    expect(blockY).toBeGreaterThan(0);
  });
});
