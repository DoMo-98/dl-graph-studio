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
import type { ChangeEvent, KeyboardEvent } from "react";
import { Background, ReactFlow } from "@xyflow/react";
import type { Edge, Node, NodeProps, NodeTypes } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

type PrimitiveNodeParameter =
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

type PrimitiveNode = {
  id: string;
  label: string;
  kind: string;
  metadata: string[];
  parameters: PrimitiveNodeParameter[];
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
    metadata: ["Role: data carrier"],
    parameters: [
      { id: "shape", label: "Shape", type: "text", value: "dynamic" },
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
        value: 1,
        min: 1,
        step: 1,
      },
      { id: "bias", label: "Bias", type: "boolean", value: true },
    ],
    position: { x: 96, y: 244 },
  },
  {
    id: "activation",
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
    position: { x: 96, y: 424 },
  },
  {
    id: "dense-linear",
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
    position: { x: 96, y: 604 },
  },
];

type PrimitiveNodeData = Omit<PrimitiveNode, "position"> & {
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  displayMetadata: string[];
};
type PrimitiveFlowNode = Node<PrimitiveNodeData, "primitive">;

function formatParameterSummary(parameter: PrimitiveNodeParameter) {
  if (parameter.type === "boolean") {
    return `${parameter.label}: ${parameter.value ? "enabled" : "disabled"}`;
  }

  return `${parameter.label}: ${parameter.value}`;
}

function getDisplayMetadata(node: PrimitiveNode) {
  return [
    ...node.parameters.map((parameter) => formatParameterSummary(parameter)),
    ...node.metadata,
  ];
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
        {data.displayMetadata.map((item) => (
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
  const [graphNodes, setGraphNodes] = useState<PrimitiveNode[]>(primitiveNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode =
    graphNodes.find((node) => node.id === selectedNodeId) ?? null;

  const updateNodeParameter = (
    nodeId: string,
    parameterId: string,
    nextValue: string | number | boolean,
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
              ? ({ ...parameter, value: nextValue } as PrimitiveNodeParameter)
              : parameter,
          ),
        };
      }),
    );
  };

  const canvasNodes: PrimitiveFlowNode[] = useMemo(
    () =>
      graphNodes.map((node) => ({
        id: node.id,
        type: "primitive",
        position: node.position,
        data: {
          id: node.id,
          label: node.label,
          kind: node.kind,
          metadata: node.metadata,
          parameters: node.parameters,
          displayMetadata: getDisplayMetadata(node),
          isSelected: selectedNodeId === node.id,
          onSelect: setSelectedNodeId,
        },
        className: "architecture-flow-node",
        selected: selectedNodeId === node.id,
        selectable: true,
        draggable: false,
      })),
    [graphNodes, selectedNodeId],
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
                    {getDisplayMetadata(selectedNode).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
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

type ParameterControlProps = {
  nodeId: string;
  parameter: PrimitiveNodeParameter;
  onChange: (
    nodeId: string,
    parameterId: string,
    nextValue: string | number | boolean,
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
