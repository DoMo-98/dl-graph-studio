import {
  Activity,
  Boxes,
  CircuitBoard,
  FlaskConical,
  Folder,
  Info,
  PanelLeft,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { Background, ReactFlow } from "@xyflow/react";
import type { Edge, Node, NodeProps, NodeTypes } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

type PrimitiveNode = {
  id: string;
  label: string;
  kind: string;
  metadata: string[];
  position: { x: number; y: number };
};

const workspaceItems = [
  { label: "Project", value: "Untitled graph" },
  { label: "Mode", value: "Local workspace" },
  { label: "Runtime", value: "Not configured" },
];

const primitiveNodes: PrimitiveNode[] = [
  {
    id: "tensor",
    label: "Tensor",
    kind: "Data",
    metadata: ["Role: data carrier", "Shape: dynamic"],
    position: { x: 96, y: 64 },
  },
  {
    id: "neuron",
    label: "Neuron",
    kind: "Foundation",
    metadata: ["Lowest exposed primitive", "Parameters: weights + bias"],
    position: { x: 96, y: 216 },
  },
  {
    id: "activation",
    label: "Activation",
    kind: "Primitive",
    metadata: ["Function: GELU", "Role: nonlinear transform"],
    position: { x: 96, y: 368 },
  },
  {
    id: "dense-linear",
    label: "Dense / Linear",
    kind: "Built-in",
    metadata: ["Units: 128", "Derived from neuron primitives"],
    position: { x: 96, y: 520 },
  },
];

type PrimitiveNodeData = Omit<PrimitiveNode, "position"> & {
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
};
type PrimitiveFlowNode = Node<PrimitiveNodeData, "primitive">;

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

  return (
    <article
      className={`architecture-node${data.isSelected ? " selected" : ""}`}
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
        {data.metadata.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

const nodeTypes: NodeTypes = {
  primitive: PrimitiveNodeCard,
};

const canvasEdges: Edge[] = [];

export function App() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode =
    primitiveNodes.find((node) => node.id === selectedNodeId) ?? null;

  const canvasNodes: PrimitiveFlowNode[] = useMemo(
    () =>
      primitiveNodes.map((node) => ({
        id: node.id,
        type: "primitive",
        position: node.position,
        data: {
          id: node.id,
          label: node.label,
          kind: node.kind,
          metadata: node.metadata,
          isSelected: selectedNodeId === node.id,
          onSelect: setSelectedNodeId,
        },
        className: "architecture-flow-node",
        selected: selectedNodeId === node.id,
        selectable: true,
        draggable: false,
      })),
    [selectedNodeId],
  );

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <CircuitBoard size={22} strokeWidth={1.8} />
          </div>
          <div>
            <p className="eyebrow">desktop lab</p>
            <h1>dl-graph-studio</h1>
          </div>
        </div>

        <nav className="nav-list" aria-label="Workspace sections">
          <a className="nav-item active" href="#workspace" aria-current="page">
            <PanelLeft size={18} aria-hidden="true" />
            <span>Workspace</span>
          </a>
          <a className="nav-item" href="#components">
            <Boxes size={18} aria-hidden="true" />
            <span>Components</span>
          </a>
          <a className="nav-item" href="#experiments">
            <FlaskConical size={18} aria-hidden="true" />
            <span>Experiments</span>
          </a>
        </nav>
      </aside>

      <main id="workspace" className="workspace" aria-label="Workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">local workspace</p>
            <h2>Graph studio workspace</h2>
          </div>
          <div className="status-pill">
            <Activity size={16} aria-hidden="true" />
            <span>Ready</span>
          </div>
        </header>

        <section className="workbench" aria-label="Project overview">
          <div className="workspace-panel-stack">
            <div className="workspace-panel">
              <div className="panel-heading">
                <Folder size={18} aria-hidden="true" />
                <h3>Session</h3>
              </div>
              <dl className="meta-list">
                {workspaceItems.map((item) => (
                  <div className="meta-row" key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <aside className="workspace-panel" aria-label="Node inspector">
              <div className="panel-heading">
                <Info size={18} aria-hidden="true" />
                <h3>Inspector</h3>
              </div>

              {selectedNode ? (
                <div className="inspector-details">
                  <span className="architecture-node-kind">
                    {selectedNode.kind}
                  </span>
                  <h4>{selectedNode.label}</h4>
                  <ul>
                    {selectedNode.metadata.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="inspector-empty">
                  <p>No node selected</p>
                  <span>Select a primitive node on the canvas.</span>
                </div>
              )}
            </aside>
          </div>

          <section className="graph-canvas" aria-label="Graph canvas">
            <ReactFlow
              nodes={canvasNodes}
              edges={canvasEdges}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            >
              <Background color="#c2d0ca" gap={28} size={1.25} />
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
        </section>
      </main>
    </div>
  );
}
