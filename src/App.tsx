import {
  Activity,
  Boxes,
  CircuitBoard,
  FlaskConical,
  Folder,
  PanelLeft,
} from "lucide-react";
import { Background, ReactFlow } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";

import "@xyflow/react/dist/style.css";

const workspaceItems = [
  { label: "Project", value: "Untitled graph" },
  { label: "Mode", value: "Local workspace" },
  { label: "Runtime", value: "Not configured" },
];

const canvasNodes: Node[] = [];
const canvasEdges: Edge[] = [];

export function App() {
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

          <section className="graph-canvas" aria-label="Graph canvas">
            <ReactFlow
              nodes={canvasNodes}
              edges={canvasEdges}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={false}
              zoomOnScroll={false}
              zoomOnPinch={false}
              zoomOnDoubleClick={false}
              preventScrolling={false}
            >
              <Background color="#c2d0ca" gap={28} size={1.25} />
            </ReactFlow>

            <div className="canvas-empty-state">
              <CircuitBoard size={38} strokeWidth={1.6} aria-hidden="true" />
              <div>
                <p>Canvas is empty</p>
                <span>Ready for architecture layout</span>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
