export type PrimitiveNodeParameter =
  | {
      id: string;
      label: string;
      type: "number";
      value: number;
      min?: number;
      step?: number;
    }
  | {
      id: string;
      label: string;
      type: "select";
      value: string;
      options: string[];
    }
  | {
      id: string;
      label: string;
      type: "text";
      value: string;
    }
  | {
      id: string;
      label: string;
      type: "boolean";
      value: boolean;
    };

type BaseGraphNode = {
  id: string;
  label: string;
  kind: string;
  metadata: string[];
  parameters: PrimitiveNodeParameter[];
  position: { x: number; y: number };
};

export type PrimitiveNode = BaseGraphNode & {
  type: "primitive";
};

export type CompositeNode = BaseGraphNode & {
  type: "composite";
  memberNodeIds: string[];
};

export type GraphNode = PrimitiveNode | CompositeNode;

export type GraphConnection = {
  id: string;
  source: string;
  target: string;
};

export type ProjectFile = {
  version: 1;
  nodes: GraphNode[];
  connections: GraphConnection[];
};

export type GraphNodePositionUpdate = {
  id: string;
  position: GraphNode["position"];
};

type ParseProjectFileResult =
  | { ok: true; project: ProjectFile }
  | { ok: false; message: string };

const PROJECT_FILE_VERSION = 1;

export function createProjectFile(
  nodes: GraphNode[],
  connections: GraphConnection[],
): ProjectFile {
  return {
    version: PROJECT_FILE_VERSION,
    nodes: nodes.map(cloneNode),
    connections: connections.map((connection) => ({ ...connection })),
  };
}

export function serializeProjectFile(project: ProjectFile) {
  return `${JSON.stringify(project, null, 2)}\n`;
}

export function updateGraphNodePositions(
  nodes: GraphNode[],
  positionUpdates: GraphNodePositionUpdate[],
) {
  if (positionUpdates.length === 0) {
    return nodes;
  }

  const positionsByNodeId = new Map(
    positionUpdates.map((update) => [update.id, update.position]),
  );

  return nodes.map((node) => {
    const nextPosition = positionsByNodeId.get(node.id);

    if (!nextPosition) {
      return node;
    }

    return {
      ...node,
      position: { ...nextPosition },
    };
  });
}

export function parseProjectFileContent(
  content: string,
): ParseProjectFileResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    return { ok: false, message: "Project file is not valid JSON." };
  }

  if (!isRecord(parsed)) {
    return { ok: false, message: "Project file must be a JSON object." };
  }

  if (parsed.version !== PROJECT_FILE_VERSION) {
    return { ok: false, message: "Project file version is not supported." };
  }

  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.connections)) {
    return {
      ok: false,
      message: "Project file must include nodes and connections.",
    };
  }

  const parsedNodes = parseNodes(parsed.nodes);

  if (!parsedNodes) {
    return { ok: false, message: "Project file contains invalid nodes." };
  }

  const connections = parseConnections(parsed.connections, parsedNodes);

  if (!connections) {
    return {
      ok: false,
      message: "Project file contains invalid connections.",
    };
  }

  return {
    ok: true,
    project: {
      version: PROJECT_FILE_VERSION,
      nodes: parsedNodes,
      connections,
    },
  };
}

function cloneNode(node: GraphNode): GraphNode {
  const clonedNode = {
    ...node,
    metadata: [...node.metadata],
    parameters: node.parameters.map((parameter) => ({ ...parameter })),
    position: { ...node.position },
  };

  if (clonedNode.type === "composite") {
    return {
      ...clonedNode,
      memberNodeIds: [...clonedNode.memberNodeIds],
    };
  }

  return clonedNode;
}

function parseNodes(values: unknown[]): GraphNode[] | null {
  const nodes: GraphNode[] = [];
  const nodeIds = new Set<string>();

  for (const value of values) {
    const node = parseNode(value);

    if (!node || nodeIds.has(node.id)) {
      return null;
    }

    nodes.push(node);
    nodeIds.add(node.id);
  }

  if (!validateCompositeMemberReferences(nodes, nodeIds)) {
    return null;
  }

  return nodes;
}

function parseNode(value: unknown): GraphNode | null {
  if (!isRecord(value)) {
    return null;
  }

  const { id, label, kind, metadata, parameters, position } = value;

  if (
    !isString(id) ||
    !isString(label) ||
    !isString(kind) ||
    !isStringArray(metadata) ||
    !Array.isArray(parameters) ||
    !isPosition(position)
  ) {
    return null;
  }

  const parsedParameters = parseParameters(parameters);

  if (!parsedParameters) {
    return null;
  }

  const nodeType = value.type ?? "primitive";
  const baseNode = {
    id,
    label,
    kind,
    metadata,
    parameters: parsedParameters,
    position,
  };

  if (nodeType === "primitive") {
    return {
      ...baseNode,
      type: "primitive",
    };
  }

  if (nodeType === "composite" && isStringArray(value.memberNodeIds)) {
    return {
      ...baseNode,
      type: "composite",
      memberNodeIds: value.memberNodeIds,
    };
  }

  return null;
}

function parseParameters(values: unknown[]): PrimitiveNodeParameter[] | null {
  const parameters: PrimitiveNodeParameter[] = [];

  for (const value of values) {
    const parameter = parseParameter(value);

    if (!parameter) {
      return null;
    }

    parameters.push(parameter);
  }

  return parameters;
}

function parseParameter(value: unknown): PrimitiveNodeParameter | null {
  if (!isRecord(value) || !isString(value.id) || !isString(value.label)) {
    return null;
  }

  if (value.type === "number") {
    if (!isFiniteNumber(value.value)) {
      return null;
    }

    return {
      id: value.id,
      label: value.label,
      type: "number",
      value: value.value,
      min: isFiniteNumber(value.min) ? value.min : undefined,
      step: isFiniteNumber(value.step) ? value.step : undefined,
    };
  }

  if (value.type === "select") {
    if (!isString(value.value) || !isStringArray(value.options)) {
      return null;
    }

    return {
      id: value.id,
      label: value.label,
      type: "select",
      value: value.value,
      options: value.options,
    };
  }

  if (value.type === "text") {
    if (!isString(value.value)) {
      return null;
    }

    return {
      id: value.id,
      label: value.label,
      type: "text",
      value: value.value,
    };
  }

  if (value.type === "boolean") {
    if (typeof value.value !== "boolean") {
      return null;
    }

    return {
      id: value.id,
      label: value.label,
      type: "boolean",
      value: value.value,
    };
  }

  return null;
}

function validateCompositeMemberReferences(
  nodes: GraphNode[],
  nodeIds: Set<string>,
) {
  return nodes.every(
    (node) =>
      node.type !== "composite" ||
      node.memberNodeIds.every((memberNodeId) => nodeIds.has(memberNodeId)),
  );
}

function parseConnections(
  values: unknown[],
  nodes: GraphNode[],
): GraphConnection[] | null {
  const connections: GraphConnection[] = [];
  const connectionIds = new Set<string>();
  const targetsBySourceId = new Map<string, Set<string>>();
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  for (const value of values) {
    const connection = parseConnection(value, nodesById);

    if (!connection || connectionIds.has(connection.id)) {
      return null;
    }

    const targetsForSource =
      targetsBySourceId.get(connection.source) ?? new Set<string>();

    if (targetsForSource.has(connection.target)) {
      return null;
    }

    connectionIds.add(connection.id);
    targetsForSource.add(connection.target);
    targetsBySourceId.set(connection.source, targetsForSource);
    connections.push(connection);
  }

  return connections;
}

function parseConnection(
  value: unknown,
  nodesById: Map<string, GraphNode>,
): GraphConnection | null {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.source) ||
    !isString(value.target)
  ) {
    return null;
  }

  const sourceNode = nodesById.get(value.source);
  const targetNode = nodesById.get(value.target);

  if (
    !sourceNode ||
    !targetNode ||
    value.source === value.target ||
    targetNode.kind === "Data"
  ) {
    return null;
  }

  return {
    id: value.id,
    source: value.source,
    target: value.target,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPosition(value: unknown): value is GraphNode["position"] {
  return isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);
}
