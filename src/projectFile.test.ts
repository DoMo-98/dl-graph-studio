import { describe, expect, it } from "vitest";

import {
  cloneGraphNode,
  parseProjectFileContent,
  updateGraphNodePositions,
  validateGraphConnectionRules,
} from "./projectFile";
import type { GraphConnection, GraphNode, ProjectFile } from "./projectFile";

function createValidProjectFile(
  overrides: Partial<ProjectFile> = {},
): ProjectFile {
  return {
    version: 1,
    nodes: [
      {
        id: "input",
        type: "primitive",
        label: "Input Tensor",
        kind: "Data",
        metadata: ["Role: model input"],
        parameters: [
          { id: "shape", label: "Shape", type: "text", value: "dynamic" },
        ],
        position: { x: 80, y: 96 },
      },
      {
        id: "dense",
        type: "primitive",
        label: "Dense Layer",
        kind: "Layer",
        metadata: ["Role: transform"],
        parameters: [
          { id: "units", label: "Units", type: "number", value: 64 },
        ],
        position: { x: 320, y: 96 },
      },
      {
        id: "block",
        type: "composite",
        label: "Feature Block",
        kind: "Composite",
        metadata: ["Role: reusable block"],
        parameters: [],
        memberNodeIds: ["input", "dense"],
        position: { x: 560, y: 160 },
      },
    ],
    connections: [{ id: "input-to-dense", source: "input", target: "dense" }],
    ...overrides,
  };
}

function parseProject(project: ProjectFile) {
  return parseProjectFileContent(JSON.stringify(project));
}

function duplicateConnection(
  overrides: Partial<GraphConnection>,
): GraphConnection {
  return {
    id: "second-connection",
    source: "dense",
    target: "block",
    ...overrides,
  };
}

describe("parseProjectFileContent", () => {
  it("rejects duplicate node ids", () => {
    const project = createValidProjectFile({
      nodes: [
        ...createValidProjectFile().nodes,
        {
          id: "input",
          type: "primitive",
          label: "Duplicate Input",
          kind: "Data",
          metadata: [],
          parameters: [],
          position: { x: 100, y: 100 },
        },
      ],
    });

    expect(parseProject(project)).toEqual({
      ok: false,
      message: "Project file contains invalid nodes.",
    });
  });

  it("rejects duplicate connection ids", () => {
    const project = createValidProjectFile({
      connections: [
        ...createValidProjectFile().connections,
        duplicateConnection({ id: "input-to-dense" }),
      ],
    });

    expect(parseProject(project)).toEqual({
      ok: false,
      message: "Project file contains invalid connections.",
    });
  });

  it("rejects self-connections", () => {
    const project = createValidProjectFile({
      connections: [duplicateConnection({ source: "dense", target: "dense" })],
    });

    expect(parseProject(project)).toEqual({
      ok: false,
      message: "Project file contains invalid connections.",
    });
  });

  it("rejects duplicate source-target connection pairs", () => {
    const project = createValidProjectFile({
      connections: [
        ...createValidProjectFile().connections,
        duplicateConnection({
          id: "duplicate-input-to-dense",
          source: "input",
          target: "dense",
        }),
      ],
    });

    expect(parseProject(project)).toEqual({
      ok: false,
      message: "Project file contains invalid connections.",
    });
  });

  it("rejects imported connections into a Data node", () => {
    const project = createValidProjectFile({
      connections: [duplicateConnection({ source: "dense", target: "input" })],
    });

    expect(parseProject(project)).toEqual({
      ok: false,
      message: "Project file contains invalid connections.",
    });
  });

  it("rejects composite nodes that reference missing member node ids", () => {
    const project = createValidProjectFile({
      nodes: createValidProjectFile().nodes.map((node) =>
        node.id === "block" && node.type === "composite"
          ? { ...node, memberNodeIds: ["input", "missing-node"] }
          : node,
      ),
    });

    expect(parseProject(project)).toEqual({
      ok: false,
      message: "Project file contains invalid nodes.",
    });
  });

  it("parses a valid primitive and composite project with a valid connection", () => {
    const project = createValidProjectFile();

    expect(parseProject(project)).toEqual({
      ok: true,
      project,
    });
  });
});

describe("cloneGraphNode", () => {
  it("clones primitive and composite node data without sharing nested references", () => {
    const project = createValidProjectFile();

    const primitiveClone = cloneGraphNode(project.nodes[0]);
    const compositeClone = cloneGraphNode(project.nodes[2]);

    expect(primitiveClone).toEqual(project.nodes[0]);
    expect(compositeClone).toEqual(project.nodes[2]);
    expect(primitiveClone).not.toBe(project.nodes[0]);
    expect(compositeClone).not.toBe(project.nodes[2]);
    expect(primitiveClone.metadata).not.toBe(project.nodes[0].metadata);
    expect(primitiveClone.parameters).not.toBe(project.nodes[0].parameters);
    expect(primitiveClone.parameters[0]).not.toBe(
      project.nodes[0].parameters[0],
    );
    expect(primitiveClone.position).not.toBe(project.nodes[0].position);

    if (compositeClone.type !== "composite") {
      throw new Error("Expected composite clone");
    }

    expect(compositeClone.memberNodeIds).not.toBe(
      project.nodes[2].type === "composite"
        ? project.nodes[2].memberNodeIds
        : undefined,
    );
  });
});

describe("validateGraphConnectionRules", () => {
  it("rejects missing endpoint nodes", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "input", target: "missing" },
        project.nodes,
        [],
      ),
    ).toEqual({ isValid: false, reason: "missing-node" });
  });

  it("rejects self-connections", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "dense", target: "dense" },
        project.nodes,
        [],
      ),
    ).toEqual({
      isValid: false,
      reason: "self-connection",
      sourceNode: project.nodes[1],
    });
  });

  it("rejects duplicate source-target connection pairs", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "input", target: "dense" },
        project.nodes,
        project.connections,
      ),
    ).toEqual({ isValid: false, reason: "duplicate-connection" });
  });

  it("rejects connections into Data nodes", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "dense", target: "input" },
        project.nodes,
        [],
      ),
    ).toEqual({
      isValid: false,
      reason: "data-target",
      targetNode: project.nodes[0],
    });
  });

  it("accepts valid connections", () => {
    const project = createValidProjectFile();

    expect(
      validateGraphConnectionRules(
        { source: "dense", target: "block" },
        project.nodes,
        project.connections,
      ),
    ).toEqual({
      isValid: true,
      sourceNode: project.nodes[1],
      targetNode: project.nodes[2],
    });
  });
});

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
