import {
  AlertTriangle,
  BookOpen,
  Box,
  ChevronsRight,
  CircuitBoard,
  Grid,
  Hand,
  Info,
  Link2,
  MousePointer2,
  Play,
  RotateCcw,
  Save,
  Settings,
  Share2,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Redo2,
  X,
  MoreVertical,
  Download,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { updateGraphNodePositions } from "./projectFile";
import type {
  CompositeNode,
  GraphNode,
  GraphConnection,
  GraphNodePositionUpdate,
  PrimitiveNode,
  PrimitiveNodeParameter,
} from "./projectFile";
import { useProjectFileWorkflow } from "./useProjectFileWorkflow";

type ConnectionValidationResult =
  | { isValid: true }
  | { isValid: false; message: string };

const primitiveFlowNodeSize = { width: 228, height: 156 };
const compositeFlowNodeSize = { width: 220, height: 180 };

const primitiveNodes: PrimitiveNode[] = [
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
    id: "neuron",
    type: "primitive",
    label: "Neuron",
    kind: "Foundation",
    metadata: ["Role: lowest exposed primitive", "Parameters: weights + bias"],
    parameters: [
      {
        id: "units",
        label: "Units",
        type: "number",
        value: 1,
        min: 1,
        step: 1,
      },
      { id: "bias", label: "Bias", type: "boolean", value: true },
    ],
    position: { x: 96, y: 284 },
  },
  {
    id: "activation",
    type: "primitive",
    label: "Activation",
    kind: "Primitive",
    metadata: ["Role: nonlinear transform"],
    parameters: [
      {
        id: "function",
        label: "Function",
        type: "select",
        value: "GELU",
        options: ["GELU", "ReLU", "SiLU", "Tanh"],
      },
    ],
    position: { x: 96, y: 504 },
  },
  {
    id: "dense-linear",
    type: "primitive",
    label: "Dense / Linear",
    kind: "Built-in",
    metadata: ["Derived from neuron primitives"],
    parameters: [
      {
        id: "units",
        label: "Units",
        type: "number",
        value: 128,
        min: 1,
        step: 1,
      },
    ],
    position: { x: 96, y: 724 },
  },
];

const compositeNodes: CompositeNode[] = [
  {
    id: "dense-block",
    type: "composite",
    label: "Dense Block",
    kind: "Composite",
    metadata: ["Role: reusable feed-forward block"],
    parameters: [],
    memberNodeIds: ["neuron", "activation", "dense-linear"],
    position: { x: 332, y: 344 },
  },
];

type PrimitiveNodeData = Omit<PrimitiveNode, "position"> & {
  isSelected: boolean;
  isDragging: boolean;
  connectionSourceId: string | null;
  connectionSourceLabel: string | null;
  onSelect: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
  onCancelConnection: () => void;
  onCompleteConnection: (targetNodeId: string) => void;
  displayMetadata: string[];
};
type PrimitiveFlowNode = Node<PrimitiveNodeData, "primitive">;
type CompositeNodeData = Omit<CompositeNode, "position"> & {
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (nodeId: string) => void;
  displayMetadata: string[];
};
type CompositeFlowNode = Node<CompositeNodeData, "composite">;
type GraphFlowNode = PrimitiveFlowNode | CompositeFlowNode;

function createInitialGraphNodes() {
  return [...primitiveNodes, ...compositeNodes].map((node) => ({
    ...node,
    metadata: [...node.metadata],
    parameters: node.parameters.map((parameter) => ({ ...parameter })),
    ...(node.type === "composite"
      ? { memberNodeIds: [...node.memberNodeIds] }
      : {}),
    position: { ...node.position },
  }));
}

function formatParameterSummary(parameter: PrimitiveNodeParameter) {
  if (parameter.type === "boolean") {
    return `${parameter.label}: ${parameter.value ? "enabled" : "disabled"}`;
  }

  return `${parameter.label}: ${parameter.value}`;
}

function getCompositeMemberSummary(node: CompositeNode, nodes: GraphNode[]) {
  const memberLabels = node.memberNodeIds.map(
    (memberNodeId) =>
      nodes.find((candidateNode) => candidateNode.id === memberNodeId)?.label ??
      memberNodeId,
  );

  return `Members: ${memberLabels.join(", ")}`;
}

function getDisplayMetadata(node: GraphNode, nodes: GraphNode[]) {
  if (node.type === "composite") {
    return [getCompositeMemberSummary(node, nodes), ...node.metadata];
  }

  return [
    ...node.parameters.map((parameter) => formatParameterSummary(parameter)),
    ...node.metadata,
  ];
}

function validateGraphConnection(
  sourceId: string,
  targetId: string,
  nodes: GraphNode[],
  connections: GraphConnection[],
): ConnectionValidationResult {
  const sourceNode = nodes.find((node) => node.id === sourceId);
  const targetNode = nodes.find((node) => node.id === targetId);

  if (!sourceNode || !targetNode) {
    return {
      isValid: false,
      message: "Choose two existing nodes before creating a connection.",
    };
  }

  if (sourceId === targetId) {
    return {
      isValid: false,
      message: `${sourceNode.label} cannot connect to itself.`,
    };
  }

  const connectionExists = connections.some(
    (connection) =>
      connection.source === sourceId && connection.target === targetId,
  );

  if (connectionExists) {
    return {
      isValid: false,
      message: "That connection already exists.",
    };
  }

  if (targetNode.kind === "Data") {
    return {
      isValid: false,
      message: `${targetNode.label} is an input node and cannot receive connections.`,
    };
  }

  return { isValid: true };
}

function getGraphConnectionLabel(
  connection: GraphConnection,
  nodes: GraphNode[],
) {
  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  return `${sourceNode?.label ?? connection.source} -> ${
    targetNode?.label ?? connection.target
  }`;
}

function getDeleteConnectionLabel(connectionLabel: string) {
  return `Delete connection ${connectionLabel.replace(" -> ", " to ")}`;
}

function getFlowNodeSize(node: GraphNode) {
  return node.type === "composite"
    ? compositeFlowNodeSize
    : primitiveFlowNodeSize;
}

function PrimitiveNodeCard({ data }: NodeProps<PrimitiveFlowNode>) {
  const selectNode = () => {
    data.onSelect(data.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectNode();
    }
  };

  const isConnectionSource = data.connectionSourceId === data.id;
  const isConnectionTarget =
    data.connectionSourceId !== null && data.connectionSourceId !== data.id;

  return (
    <div className="architecture-node-shell">
      <Handle
        type="target"
        position={Position.Left}
        className="architecture-node-handle"
      />
      <article
        className={`architecture-node${data.isSelected ? " selected" : ""}${
          data.isDragging ? " moving" : ""
        }${
          isConnectionSource ? " connection-source" : ""
        }${isConnectionTarget ? " connection-target" : ""}`}
        data-testid="architecture-node"
        role="button"
        tabIndex={0}
        aria-pressed={data.isSelected}
        aria-label={`${data.label} primitive node`}
        onClick={selectNode}
        onKeyDown={handleKeyDown}
      >
        <span className="architecture-node-kind">{data.kind}</span>
        <h4>{data.label}</h4>
        <ul>
          {data.displayMetadata.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
      <div className="connection-controls">
        {isConnectionSource ? (
          <button
            type="button"
            className="connection-button cancel nodrag"
            aria-label={`Cancel connection from ${data.label}`}
            title={`Cancel connection from ${data.label}`}
            onClick={data.onCancelConnection}
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            className="connection-button nodrag"
            aria-label={
              data.connectionSourceId
                ? `Connect ${data.connectionSourceLabel} to ${data.label}`
                : `Start connection from ${data.label}`
            }
            title={
              data.connectionSourceId
                ? `Connect ${data.connectionSourceLabel} to ${data.label}`
                : `Start connection from ${data.label}`
            }
            onClick={() =>
              data.connectionSourceId
                ? data.onCompleteConnection(data.id)
                : data.onStartConnection(data.id)
            }
          >
            <Link2 size={15} aria-hidden="true" />
          </button>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="architecture-node-handle"
      />
    </div>
  );
}

function CompositeNodeCard({ data }: NodeProps<CompositeFlowNode>) {
  const selectNode = () => {
    data.onSelect(data.id);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectNode();
    }
  };

  return (
    <article
      className={`architecture-node composite-node${
        data.isSelected ? " selected" : ""
      }${data.isDragging ? " moving" : ""}`}
      data-testid="composite-node"
      role="button"
      tabIndex={0}
      aria-pressed={data.isSelected}
      aria-label={`${data.label} composite node`}
      onClick={selectNode}
      onKeyDown={handleKeyDown}
    >
      <span className="architecture-node-kind">{data.kind}</span>
      <h4>{data.label}</h4>
      <ul>
        {data.displayMetadata.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

const nodeTypes = {
  primitive: PrimitiveNodeCard,
  composite: CompositeNodeCard,
};

function updatePrimitiveParameterValue(
  parameter: PrimitiveNodeParameter,
  nextValue: PrimitiveNodeParameter["value"],
): PrimitiveNodeParameter {
  switch (parameter.type) {
    case "boolean":
      return typeof nextValue === "boolean"
        ? { ...parameter, value: nextValue }
        : parameter;
    case "number":
      return typeof nextValue === "number"
        ? { ...parameter, value: nextValue }
        : parameter;
    case "select":
      return typeof nextValue === "string"
        ? { ...parameter, value: nextValue }
        : parameter;
    case "text":
      return typeof nextValue === "string"
        ? { ...parameter, value: nextValue }
        : parameter;
  }
}

export function App() {
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>(
    createInitialGraphNodes,
  );
  const [graphConnections, setGraphConnections] = useState<GraphConnection[]>(
    [],
  );
  const [connectionFeedback, setConnectionFeedback] = useState<string | null>(
    null,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(
    null,
  );
  const {
    isProjectActionsOpen,
    setIsProjectActionsOpen,
    projectToast,
    fileInputRef,
    openProjectImportPicker,
    exportProjectFile,
    importProjectFile,
    resetProject,
  } = useProjectFileWorkflow({
    graphNodes,
    graphConnections,
    setGraphNodes,
    setGraphConnections,
    createInitialGraphNodes,
    clearSelectedNode: () => setSelectedNodeId(null),
    clearConnectionSource: () => setConnectionSourceId(null),
    clearConnectionFeedback: () => setConnectionFeedback(null),
    clearDraggedNode: () => setDraggedNodeId(null),
  });
  const selectedNode =
    graphNodes.find((node) => node.id === selectedNodeId) ?? null;
  const connectionSource =
    graphNodes.find((node) => node.id === connectionSourceId) ?? null;

  const updateNodeParameter = (
    nodeId: string,
    parameterId: string,
    nextValue: PrimitiveNodeParameter["value"],
  ) => {
    setGraphNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id !== nodeId) {
          return node;
        }

        return {
          ...node,
          parameters: node.parameters.map((parameter) =>
            parameter.id === parameterId
              ? updatePrimitiveParameterValue(parameter, nextValue)
              : parameter,
          ),
        };
      }),
    );
  };

  const addGraphConnection = useCallback(
    (sourceId: string, targetId: string) => {
      const validation = validateGraphConnection(
        sourceId,
        targetId,
        graphNodes,
        graphConnections,
      );

      if (!validation.isValid) {
        setConnectionFeedback(validation.message);
        setConnectionSourceId(null);
        return;
      }

      setGraphConnections([
        ...graphConnections,
        {
          id: `connection-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
        },
      ]);
      setConnectionFeedback(null);
      setConnectionSourceId(null);
    },
    [graphConnections, graphNodes],
  );

  const completeGraphConnection = useCallback(
    (targetNodeId: string) => {
      if (!connectionSourceId || connectionSourceId === targetNodeId) {
        return;
      }

      addGraphConnection(connectionSourceId, targetNodeId);
    },
    [addGraphConnection, connectionSourceId],
  );

  const handleReactFlowConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      addGraphConnection(connection.source, connection.target);
    },
    [addGraphConnection],
  );

  const handleCanvasNodesChange = useCallback(
    (changes: NodeChange<GraphFlowNode>[]) => {
      const rawPositionUpdates = changes.flatMap(
        (change): GraphNodePositionUpdate[] => {
          if (change.type !== "position") {
            return [];
          }

          const nextPosition = change.position ?? change.positionAbsolute;

          if (nextPosition === undefined) {
            return [];
          }

          return [
            {
              id: change.id,
              position: nextPosition,
            },
          ];
        },
      );

      if (rawPositionUpdates.length === 0) {
        return;
      }

      setGraphNodes((currentNodes) => {
        const rawPositionsByNodeId = new Map(
          rawPositionUpdates.map((update) => [update.id, update.position]),
        );
        const positionUpdates = currentNodes.flatMap(
          (node): GraphNodePositionUpdate[] => {
            const nextPosition = rawPositionsByNodeId.get(node.id);

            if (!nextPosition) {
              return [];
            }

            return [
              {
                id: node.id,
                position: nextPosition,
              },
            ];
          },
        );

        return updateGraphNodePositions(currentNodes, positionUpdates);
      });
    },
    [],
  );

  const deleteGraphConnection = useCallback(
    (connectionId: string) => {
      const connection = graphConnections.find(
        (candidateConnection) => candidateConnection.id === connectionId,
      );

      if (!connection) {
        return;
      }

      const connectionLabel = getGraphConnectionLabel(connection, graphNodes);

      setGraphConnections(
        graphConnections.filter(
          (candidateConnection) => candidateConnection.id !== connectionId,
        ),
      );
      setConnectionSourceId(null);
      setConnectionFeedback(`${connectionLabel} deleted.`);
    },
    [graphConnections, graphNodes],
  );

  const canvasNodes: GraphFlowNode[] = useMemo(
    () =>
      graphNodes.map((node) => {
        const nodeSize = getFlowNodeSize(node);
        const commonNode = {
          id: node.id,
          position: node.position,
          width: nodeSize.width,
          height: nodeSize.height,
          initialWidth: nodeSize.width,
          initialHeight: nodeSize.height,
          measured: nodeSize,
          selected: selectedNodeId === node.id,
          selectable: true,
          draggable: true,
        };

        if (node.type === "composite") {
          return {
            ...commonNode,
            type: "composite",
            data: {
              id: node.id,
              type: node.type,
              label: node.label,
              kind: node.kind,
              metadata: node.metadata,
              parameters: node.parameters,
              memberNodeIds: node.memberNodeIds,
              displayMetadata: getDisplayMetadata(node, graphNodes),
              isSelected: selectedNodeId === node.id,
              isDragging: draggedNodeId === node.id,
              onSelect: setSelectedNodeId,
            },
            className: "architecture-flow-node composite-flow-node",
          };
        }

        return {
          ...commonNode,
          type: "primitive",
          data: {
            id: node.id,
            type: node.type,
            label: node.label,
            kind: node.kind,
            metadata: node.metadata,
            parameters: node.parameters,
            displayMetadata: getDisplayMetadata(node, graphNodes),
            isSelected: selectedNodeId === node.id,
            isDragging: draggedNodeId === node.id,
            connectionSourceId,
            connectionSourceLabel: connectionSource?.label ?? null,
            onSelect: setSelectedNodeId,
            onStartConnection: setConnectionSourceId,
            onCancelConnection: () => setConnectionSourceId(null),
            onCompleteConnection: completeGraphConnection,
          },
          className: "architecture-flow-node",
        };
      }),
    [
      completeGraphConnection,
      connectionSource?.label,
      connectionSourceId,
      draggedNodeId,
      graphNodes,
      selectedNodeId,
    ],
  );

  const canvasEdges: Edge[] = useMemo(
    () =>
      graphConnections.map((connection) => {
        const label = getGraphConnectionLabel(connection, graphNodes);

        return {
          id: connection.id,
          source: connection.source,
          target: connection.target,
          label,
          type: "smoothstep",
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: "#22d3ee",
          },
          style: {
            stroke: "#22d3ee",
            strokeWidth: 2,
            filter: "drop-shadow(0 0 5px rgba(34, 211, 238, 0.4))",
          },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 6,
          labelStyle: {
            fill: "#f8fafc",
            fontWeight: 600,
          },
          labelBgStyle: {
            fill: "#0f172a",
            stroke: "#334155",
            strokeWidth: 1,
            fillOpacity: 0.96,
          },
        };
      }),
    [graphConnections, graphNodes],
  );

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <CircuitBoard size={18} strokeWidth={2} />
            </div>
            <div className="topbar-project" aria-label="Current project">
              <span>dl-graph-studio</span>
              <span style={{ color: "#94a3b8", margin: "0 8px" }}>
                Untitled graph
              </span>
              <ChevronsRight size={14} color="#94a3b8" />
            </div>
          </div>

          <div
            className="status-pill"
            style={{
              background: "transparent",
              border: "none",
              color: "#10b981",
              padding: 0,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
              }}
            ></div>
            <span>Ready</span>
          </div>
        </div>

        <div className="topbar-actions" aria-label="Editor actions">
          <button
            type="button"
            className="topbar-icon-button future-action"
            disabled
            title="Undo coming soon"
            aria-label="Undo coming soon"
          >
            <Undo2 size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="topbar-icon-button future-action"
            disabled
            title="Redo coming soon"
            aria-label="Redo coming soon"
          >
            <Redo2 size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="topbar-icon-button future-action"
            disabled
            title="Run graph coming soon"
            aria-label="Run graph coming soon"
          >
            <Play size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="topbar-icon-button future-action"
            disabled
            title="Native save coming soon"
            aria-label="Native save coming soon"
          >
            <Save size={18} aria-hidden="true" />
          </button>
          <div className="project-actions-menu">
            <button
              type="button"
              className="topbar-icon-button"
              aria-label="Project actions"
              title="Project actions"
              aria-expanded={isProjectActionsOpen}
              aria-haspopup="menu"
              onClick={() =>
                setIsProjectActionsOpen((currentValue) => !currentValue)
              }
            >
              <MoreVertical size={18} aria-hidden="true" />
            </button>

            {isProjectActionsOpen ? (
              <div className="project-actions-popover" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={openProjectImportPicker}
                >
                  <Upload size={15} aria-hidden="true" />
                  <span>Import project</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={exportProjectFile}
                >
                  <Download size={15} aria-hidden="true" />
                  <span>Export project</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="danger"
                  onClick={resetProject}
                >
                  <RotateCcw size={15} aria-hidden="true" />
                  <span>Reset project</span>
                </button>
              </div>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept="application/json,.json"
            aria-label="Import project file"
            onChange={importProjectFile}
          />
        </div>
      </header>

      {projectToast ? (
        <div className="project-toast" role="status">
          {projectToast}
        </div>
      ) : null}

      <main id="workspace" className="editor-shell" aria-label="Workspace">
        <aside className="sidebar" aria-label="Primary">
          <nav className="nav-list" aria-label="Workspace sections">
            <a className="nav-item active" href="#select" aria-current="page">
              <MousePointer2 size={20} aria-hidden="true" />
            </a>
            <a className="nav-item" href="#pan">
              <Hand size={20} aria-hidden="true" />
            </a>
            <div className="nav-separator"></div>
            <a className="nav-item" href="#share">
              <Share2 size={20} aria-hidden="true" />
            </a>
            <a className="nav-item" href="#grid">
              <Grid size={20} aria-hidden="true" />
            </a>
            <a className="nav-item" href="#box">
              <Box size={20} aria-hidden="true" />
            </a>
            <a className="nav-item" href="#sliders">
              <SlidersHorizontal size={20} aria-hidden="true" />
            </a>
            <a className="nav-item" href="#book">
              <BookOpen size={20} aria-hidden="true" />
            </a>
          </nav>

          <nav
            className="nav-list"
            aria-label="Utility actions"
            style={{ marginTop: "auto" }}
          >
            <a className="nav-item" href="#settings">
              <Settings size={20} aria-hidden="true" />
            </a>
            <a className="nav-item" href="#collapse">
              <ChevronsRight size={20} aria-hidden="true" />
            </a>
          </nav>
        </aside>

        <section className="editor-main" aria-label="Project overview">
          <div className="workspace-context">
            <p className="eyebrow">local workspace</p>
            <h2>Graph studio workspace</h2>
          </div>

          <section className="graph-canvas" aria-label="Graph canvas">
            <ReactFlow
              nodes={canvasNodes}
              edges={canvasEdges}
              nodeTypes={nodeTypes}
              onConnect={handleReactFlowConnect}
              onNodesChange={handleCanvasNodesChange}
              onNodeDragStart={(_, node) => setDraggedNodeId(node.id)}
              onNodeDragStop={() => setDraggedNodeId(null)}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={false}
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              zoomOnDoubleClick={false}
              autoPanOnNodeDrag={false}
              preventScrolling={true}
              fitView={true}
              fitViewOptions={{ padding: 0.18 }}
              minZoom={0.6}
              maxZoom={1.5}
            >
              <Background color="var(--canvas-grid)" gap={24} size={2} />
              <Controls
                fitViewOptions={{ padding: 0.18 }}
                showInteractive={false}
                position="bottom-left"
              />
            </ReactFlow>

            {canvasNodes.length === 0 ? (
              <div className="canvas-empty-state">
                <CircuitBoard size={38} strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <p>Canvas is empty</p>
                  <span>Ready for architecture layout</span>
                </div>
              </div>
            ) : null}
          </section>

          {canvasEdges.length > 0 ? (
            <section
              className="connection-drawer"
              aria-label="Graph connections"
            >
              <header className="connection-drawer-header">
                <h3>Connections</h3>
                <span>{graphConnections.length}</span>
              </header>
              <div className="connection-list">
                {graphConnections.map((connection) => {
                  const connectionLabel = getGraphConnectionLabel(
                    connection,
                    graphNodes,
                  );

                  return (
                    <div className="connection-list-item" key={connection.id}>
                      <span>{connectionLabel}</span>
                      <button
                        type="button"
                        className="connection-delete-button"
                        aria-label={getDeleteConnectionLabel(connectionLabel)}
                        title={getDeleteConnectionLabel(connectionLabel)}
                        onClick={() => deleteGraphConnection(connection.id)}
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {connectionFeedback ? (
            <div className="connection-feedback" role="alert">
              <AlertTriangle size={16} aria-hidden="true" />
              <span>{connectionFeedback}</span>
            </div>
          ) : null}
        </section>

        <aside className="inspector-panel" aria-label="Node inspector">
          <div className="panel-heading">
            <Info size={18} aria-hidden="true" />
            <h3>Inspector</h3>
          </div>

          {selectedNode ? (
            <div className="inspector-details">
              <span
                className={`architecture-node-kind${selectedNode.type === "composite" ? " composite-inspector-tag" : ""}`}
              >
                {selectedNode.kind}
              </span>
              <h4>{selectedNode.label}</h4>
              <ul>
                {getDisplayMetadata(selectedNode, graphNodes).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              {selectedNode.parameters.length > 0 ? (
                <div
                  className="parameter-form"
                  aria-label={`${selectedNode.label} parameters`}
                >
                  {selectedNode.parameters.map((parameter) => (
                    <ParameterControl
                      key={parameter.id}
                      nodeId={selectedNode.id}
                      parameter={parameter}
                      onChange={updateNodeParameter}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="inspector-empty">
              <p>No node selected</p>
              <span>Select a node on the canvas.</span>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}

type ParameterControlProps = {
  nodeId: string;
  parameter: PrimitiveNodeParameter;
  onChange: (
    nodeId: string,
    parameterId: string,
    nextValue: PrimitiveNodeParameter["value"],
  ) => void;
};

function ParameterControl({
  nodeId,
  parameter,
  onChange,
}: ParameterControlProps) {
  if (parameter.type === "boolean") {
    return (
      <label className="parameter-control parameter-control-checkbox">
        <span>{parameter.label}</span>
        <input
          type="checkbox"
          checked={parameter.value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(nodeId, parameter.id, event.target.checked)
          }
        />
      </label>
    );
  }

  if (parameter.type === "number") {
    return (
      <label className="parameter-control">
        <span>{parameter.label}</span>
        <input
          type="number"
          min={parameter.min}
          step={parameter.step}
          value={parameter.value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const nextValue = Number(event.target.value);

            if (Number.isFinite(nextValue)) {
              onChange(nodeId, parameter.id, nextValue);
            }
          }}
        />
      </label>
    );
  }

  if (parameter.type === "select") {
    return (
      <label className="parameter-control">
        <span>{parameter.label}</span>
        <select
          value={parameter.value}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onChange(nodeId, parameter.id, event.target.value)
          }
        >
          {parameter.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="parameter-control">
      <span>{parameter.label}</span>
      <input
        type="text"
        value={parameter.value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(nodeId, parameter.id, event.target.value)
        }
      />
    </label>
  );
}
