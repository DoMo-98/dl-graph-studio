import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import type { ComponentType, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

type MockFlowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  extent?: unknown;
  width?: number;
  height?: number;
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
  panOnDrag?: boolean;
  zoomOnScroll?: boolean;
  zoomOnPinch?: boolean;
  zoomOnDoubleClick?: boolean;
  preventScrolling?: boolean;
  fitView?: boolean;
  fitViewOptions?: unknown;
  minZoom?: number;
  maxZoom?: number;
  onNodesChange?: (
    changes: Array<{
      id: string;
      type: "position";
      positionAbsolute: { x: number; y: number };
    }>,
  ) => void;
  onConnect?: (connection: { source: string; target: string }) => void;
  children: ReactNode;
};

let graphCanvasSize = { width: 640, height: 520 };

vi.mock("@xyflow/react", () => ({
  Background: () => <div data-testid="flow-background" />,
  Controls: ({ fitViewOptions }: { fitViewOptions?: unknown }) => (
    <div
      data-testid="flow-controls"
      data-fit-view-options={JSON.stringify(fitViewOptions)}
    >
      React Flow controls
    </div>
  ),
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
    panOnDrag,
    zoomOnScroll,
    zoomOnPinch,
    zoomOnDoubleClick,
    preventScrolling,
    fitView,
    fitViewOptions,
    minZoom,
    maxZoom,
    onNodesChange,
    onConnect,
    children,
  }: MockReactFlowProps) => {
    const initialNodeExtent = useRef(nodeExtent);
    const dragNodeExtent = initialNodeExtent.current;

    return (
      <div
        data-testid="react-flow"
        data-nodes-draggable={nodesDraggable}
        data-has-node-extent={nodeExtent !== undefined}
        data-node-extent={JSON.stringify(nodeExtent)}
        data-initial-node-extent={JSON.stringify(initialNodeExtent.current)}
        data-auto-pan-on-node-drag={autoPanOnNodeDrag}
        data-pan-on-drag={panOnDrag}
        data-zoom-on-scroll={zoomOnScroll}
        data-zoom-on-pinch={zoomOnPinch}
        data-zoom-on-double-click={zoomOnDoubleClick}
        data-prevent-scrolling={preventScrolling}
        data-fit-view={fitView}
        data-fit-view-options={JSON.stringify(fitViewOptions)}
        data-min-zoom={minZoom}
        data-max-zoom={maxZoom}
      >
        {nodes.map((node) => {
          const FlowNode = nodeTypes[node.type];
          const nodeDragExtent = node.extent ?? dragNodeExtent;
          const rawNextPosition =
            node.id === "dense-block"
              ? { x: 1500, y: 1500 }
              : {
                  x: node.position.x + 32,
                  y: node.position.y + 48,
                };
          const nextPosition =
            Array.isArray(nodeDragExtent) &&
            Array.isArray(nodeDragExtent[0]) &&
            Array.isArray(nodeDragExtent[1])
              ? {
                  x: Math.min(
                    Math.max(rawNextPosition.x, nodeDragExtent[0][0]),
                    nodeDragExtent[1][0] - (node.width ?? 0),
                  ),
                  y: Math.min(
                    Math.max(rawNextPosition.y, nodeDragExtent[0][1]),
                    nodeDragExtent[1][1] - (node.height ?? 0),
                  ),
                }
              : rawNextPosition;

          return (
            <div
              data-testid={`flow-node-${node.id}`}
              data-x={node.position.x}
              data-y={node.position.y}
              data-node-extent={JSON.stringify(node.extent)}
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
        <button
          type="button"
          onClick={() => onConnect?.({ source: "tensor", target: "neuron" })}
        >
          Connect Tensor to Neuron through React Flow
        </button>
        {children}
      </div>
    );
  },
}));

describe("App node dragging", () => {
  beforeEach(() => {
    graphCanvasSize = { width: 640, height: 520 };
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRect(this: HTMLElement) {
        if (this.classList.contains("graph-canvas")) {
          return {
            width: graphCanvasSize.width,
            height: graphCanvasSize.height,
            top: 0,
            right: graphCanvasSize.width,
            bottom: graphCanvasSize.height,
            left: 0,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          };
        }

        return {
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes a visual-safe canvas extent to React Flow and persists clamped node positions from drag changes", async () => {
    render(<App />);

    const reactFlow = await screen.findByTestId("react-flow");

    expect(reactFlow).toHaveAttribute("data-nodes-draggable", "true");
    await waitFor(() =>
      expect(reactFlow).toHaveAttribute(
        "data-node-extent",
        JSON.stringify([
          [0, 0],
          [640, 520],
        ]),
      ),
    );
    expect(reactFlow).toHaveAttribute(
      "data-initial-node-extent",
      JSON.stringify([
        [0, 0],
        [640, 520],
      ]),
    );
    expect(reactFlow).toHaveAttribute("data-has-node-extent", "true");
    expect(reactFlow).toHaveAttribute("data-auto-pan-on-node-drag", "false");
    expect(reactFlow).toHaveAttribute("data-pan-on-drag", "true");
    expect(reactFlow).toHaveAttribute("data-zoom-on-scroll", "true");
    expect(reactFlow).toHaveAttribute("data-zoom-on-pinch", "true");
    expect(reactFlow).toHaveAttribute("data-zoom-on-double-click", "false");
    expect(reactFlow).toHaveAttribute("data-prevent-scrolling", "true");
    expect(reactFlow).toHaveAttribute("data-fit-view", "true");
    expect(reactFlow).toHaveAttribute("data-min-zoom", "0.6");
    expect(reactFlow).toHaveAttribute("data-max-zoom", "1.5");
    expect(reactFlow).toHaveAttribute(
      "data-fit-view-options",
      JSON.stringify({ padding: 0.18 }),
    );
    expect(screen.getByTestId("flow-controls")).toHaveAttribute(
      "data-fit-view-options",
      JSON.stringify({ padding: 0.18 }),
    );
    expect(screen.getByTestId("flow-node-tensor")).toHaveAttribute(
      "data-node-extent",
      JSON.stringify([
        [6, 0],
        [628, 508],
      ]),
    );
    expect(screen.getByTestId("flow-node-dense-block")).toHaveAttribute(
      "data-node-extent",
      JSON.stringify([
        [0, 0],
        [640, 520],
      ]),
    );
    await waitFor(() =>
      expect(screen.getByTestId("flow-node-activation")).toHaveAttribute(
        "data-y",
        "352",
      ),
    );
    expect(screen.getByTestId("flow-node-dense-linear")).toHaveAttribute(
      "data-y",
      "352",
    );

    // Move Tensor node (position x+32, y+48 per mock)
    fireEvent.click(screen.getByRole("button", { name: "Move Tensor" }));

    // Verify position changed in the flow node data attributes
    const tensorFlowNode = screen.getByTestId("flow-node-tensor");
    expect(tensorFlowNode).toHaveAttribute("data-x", "128");
    expect(tensorFlowNode).toHaveAttribute("data-y", "112");

    // Move Dense Block to the oversized mock position and let React Flow own bounds.
    fireEvent.click(screen.getByRole("button", { name: "Move Dense Block" }));

    const denseBlockFlowNode = screen.getByTestId("flow-node-dense-block");
    expect(denseBlockFlowNode).toHaveAttribute("data-x", "420");
    expect(denseBlockFlowNode).toHaveAttribute("data-y", "340");
  });

  it("keeps controlled node state aligned with React Flow clamp semantics on tiny canvases", async () => {
    graphCanvasSize = { width: 10, height: 10 };

    render(<App />);

    await waitFor(() =>
      expect(screen.getByTestId("react-flow")).toHaveAttribute(
        "data-node-extent",
        JSON.stringify([
          [0, 0],
          [10, 10],
        ]),
      ),
    );
    expect(screen.getByTestId("flow-node-tensor")).toHaveAttribute(
      "data-node-extent",
      JSON.stringify([
        [6, 0],
        [-2, -2],
      ]),
    );
    await waitFor(() =>
      expect(screen.getByTestId("flow-node-tensor")).toHaveAttribute(
        "data-x",
        "-230",
      ),
    );
    expect(screen.getByTestId("flow-node-tensor")).toHaveAttribute(
      "data-y",
      "-158",
    );
  });

  it("creates a visible connection from the React Flow onConnect adapter path", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /connect tensor to neuron through react flow/i,
      }),
    );

    expect(screen.getAllByText("Tensor -> Neuron").length).toBeGreaterThan(0);
  });
});
