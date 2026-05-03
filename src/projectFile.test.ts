import { describe, expect, it } from "vitest";

import { updateGraphNodePositions } from "./projectFile";
import type { GraphNode } from "./projectFile";

describe("updateGraphNodePositions", () => {
  it("updates primitive and composite node positions while preserving graph data", () => {
    const nodes: GraphNode[] = [
      {
        id: "tensor",
        type: "primitive",
        label: "Tensor",
        kind: "Data",
        metadata: ["Role: data carrier"],
        parameters: [
          { id: "shape", label: "Shape", type: "text", value: "dynamic" },
        ],
        position: { x: 96, y: 64 },
      },
      {
        id: "dense-block",
        type: "composite",
        label: "Dense Block",
        kind: "Composite",
        metadata: ["Role: reusable feed-forward block"],
        parameters: [],
        memberNodeIds: ["tensor"],
        position: { x: 332, y: 344 },
      },
    ];

    const updatedNodes = updateGraphNodePositions(nodes, [
      { id: "tensor", position: { x: 148, y: 112 } },
      { id: "dense-block", position: { x: 420, y: 372 } },
      { id: "missing-node", position: { x: 0, y: 0 } },
    ]);

    expect(updatedNodes).toEqual([
      {
        ...nodes[0],
        position: { x: 148, y: 112 },
      },
      {
        ...nodes[1],
        position: { x: 420, y: 372 },
      },
    ]);
    expect(nodes[0].position).toEqual({ x: 96, y: 64 });
    expect(nodes[1].position).toEqual({ x: 332, y: 344 });
  });
});
