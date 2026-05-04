import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";

import { useProjectFileWorkflow } from "./useProjectFileWorkflow";
import type { GraphConnection, GraphNode } from "./projectFile";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const initialNodes: GraphNode[] = [
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
];

const editedNodes: GraphNode[] = [
  {
    id: "dense",
    type: "primitive",
    label: "Dense",
    kind: "Layer",
    metadata: ["Role: transform"],
    parameters: [
      { id: "units", label: "Units", type: "number", value: 128 },
    ],
    position: { x: 320, y: 96 },
  },
];

const editedConnections: GraphConnection[] = [
  { id: "connection-tensor-dense", source: "tensor", target: "dense" },
];

const editedProjectNodes: GraphNode[] = [initialNodes[0], editedNodes[0]];

function createProjectContent(
  nodes: GraphNode[] = editedProjectNodes,
  connections: GraphConnection[] = editedConnections,
) {
  return JSON.stringify({
    version: 1,
    nodes,
    connections,
  });
}

function WorkflowHarness({
  initialGraphNodes = initialNodes,
  initialGraphConnections = [],
}: {
  initialGraphNodes?: GraphNode[];
  initialGraphConnections?: GraphConnection[];
}) {
  const [graphNodes, setGraphNodes] = useState(initialGraphNodes);
  const [graphConnections, setGraphConnections] = useState(
    initialGraphConnections,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("tensor");
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(
    "tensor",
  );
  const [connectionFeedback, setConnectionFeedback] = useState<string | null>(
    "Existing feedback",
  );
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>("tensor");
  const workflow = useProjectFileWorkflow({
    graphNodes,
    graphConnections,
    setGraphNodes,
    setGraphConnections,
    createInitialGraphNodes: () =>
      initialNodes.map((node) => ({ ...node, position: { ...node.position } })),
    clearSelectedNode: () => setSelectedNodeId(null),
    clearConnectionSource: () => setConnectionSourceId(null),
    clearConnectionFeedback: () => setConnectionFeedback(null),
    clearDraggedNode: () => setDraggedNodeId(null),
  });

  return (
    <div>
      <button type="button" onClick={workflow.toggleProjectActions}>
        Toggle menu
      </button>
      <button type="button" onClick={workflow.openProjectImportPicker}>
        Open import
      </button>
      <button type="button" onClick={workflow.exportProjectFile}>
        Export
      </button>
      <button type="button" onClick={workflow.resetProject}>
        Reset
      </button>
      <input
        aria-label="Import project file"
        ref={workflow.fileInputRef}
        type="file"
        onChange={workflow.importProjectFile}
      />
      <output aria-label="menu state">
        {workflow.isProjectActionsOpen ? "open" : "closed"}
      </output>
      <output aria-label="toast">{workflow.projectToast ?? "none"}</output>
      <output aria-label="nodes">
        {graphNodes.map((node) => node.id).join(",")}
      </output>
      <output aria-label="connections">
        {graphConnections.map((connection) => connection.id).join(",")}
      </output>
      <output aria-label="selected">{selectedNodeId ?? "none"}</output>
      <output aria-label="connection source">
        {connectionSourceId ?? "none"}
      </output>
      <output aria-label="connection feedback">
        {connectionFeedback ?? "none"}
      </output>
      <output aria-label="dragged">{draggedNodeId ?? "none"}</output>
    </div>
  );
}

describe("useProjectFileWorkflow", () => {
  it("exports the current project and closes the project actions menu", () => {
    const OriginalBlob = globalThis.Blob;
    const blobParts: BlobPart[][] = [];
    const createObjectURLDescriptor = Object.getOwnPropertyDescriptor(
      URL,
      "createObjectURL",
    );
    const revokeObjectURLDescriptor = Object.getOwnPropertyDescriptor(
      URL,
      "revokeObjectURL",
    );
    const createObjectURL = vi.fn(() => "blob:project-file");
    const revokeObjectURL = vi.fn();

    vi.stubGlobal(
      "Blob",
      vi.fn((parts?: BlobPart[], options?: BlobPropertyBag) => {
        blobParts.push(parts ?? []);
        return new OriginalBlob(parts, options);
      }),
    );
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    try {
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
        () => undefined,
      );

      render(
        <WorkflowHarness
          initialGraphNodes={editedProjectNodes}
          initialGraphConnections={editedConnections}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
      fireEvent.click(screen.getByRole("button", { name: /export/i }));

      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:project-file");
      expect(screen.getByLabelText("toast")).toHaveTextContent(
        "Project exported.",
      );
      expect(screen.getByLabelText("menu state")).toHaveTextContent("closed");
      expect(blobParts).toHaveLength(1);

      const [serializedProject] = blobParts[0];
      expect(JSON.parse(serializedProject as string)).toEqual({
        version: 1,
        nodes: editedProjectNodes,
        connections: editedConnections,
      });
    } finally {
      if (createObjectURLDescriptor) {
        Object.defineProperty(
          URL,
          "createObjectURL",
          createObjectURLDescriptor,
        );
      } else {
        Reflect.deleteProperty(URL, "createObjectURL");
      }

      if (revokeObjectURLDescriptor) {
        Object.defineProperty(
          URL,
          "revokeObjectURL",
          revokeObjectURLDescriptor,
        );
      } else {
        Reflect.deleteProperty(URL, "revokeObjectURL");
      }
    }
  });

  it("imports a valid project, closes the menu, clears editor workflow state, and clears the input", async () => {
    render(<WorkflowHarness />);

    const fileInput = screen.getByLabelText<HTMLInputElement>(
      /import project file/i,
    );
    const projectFile = new File([createProjectContent()], "project.json", {
      type: "application/json",
    });

    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
    fireEvent.change(fileInput, { target: { files: [projectFile] } });

    await waitFor(() =>
      expect(screen.getByLabelText("nodes")).toHaveTextContent("dense"),
    );
    expect(screen.getByLabelText("connections")).toHaveTextContent(
      "connection-tensor-dense",
    );
    expect(screen.getByLabelText("toast")).toHaveTextContent(
      "Project imported.",
    );
    expect(screen.getByLabelText("menu state")).toHaveTextContent("closed");
    expect(screen.getByLabelText("selected")).toHaveTextContent("none");
    expect(screen.getByLabelText("connection source")).toHaveTextContent(
      "none",
    );
    expect(screen.getByLabelText("connection feedback")).toHaveTextContent(
      "none",
    );
    expect(screen.getByLabelText("dragged")).toHaveTextContent("none");
    expect(fileInput).toHaveValue("");
  });

  it("keeps the menu open and preserves editor workflow state after invalid import", async () => {
    render(<WorkflowHarness />);

    const fileInput = screen.getByLabelText<HTMLInputElement>(
      /import project file/i,
    );
    const invalidFile = new File(["not-json"], "project.json", {
      type: "application/json",
    });

    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() =>
      expect(screen.getByLabelText("toast")).toHaveTextContent(
        "Project file is not valid JSON.",
      ),
    );
    expect(screen.getByLabelText("menu state")).toHaveTextContent("open");
    expect(screen.getByLabelText("nodes")).toHaveTextContent("tensor");
    expect(screen.getByLabelText("selected")).toHaveTextContent("tensor");
    expect(screen.getByLabelText("connection source")).toHaveTextContent(
      "tensor",
    );
    expect(screen.getByLabelText("connection feedback")).toHaveTextContent(
      "Existing feedback",
    );
    expect(screen.getByLabelText("dragged")).toHaveTextContent("tensor");
    expect(fileInput).toHaveValue("");
  });

  it("shows a read failure toast without closing the menu or clearing dragged state", async () => {
    const unreadableFile = {
      text: vi.fn().mockRejectedValue(new Error("read failed")),
    } as unknown as File;

    render(<WorkflowHarness />);

    const fileInput = screen.getByLabelText<HTMLInputElement>(
      /import project file/i,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
    fireEvent.change(fileInput, { target: { files: [unreadableFile] } });

    await waitFor(() =>
      expect(screen.getByLabelText("toast")).toHaveTextContent(
        "Project file could not be read.",
      ),
    );
    expect(screen.getByLabelText("menu state")).toHaveTextContent("open");
    expect(screen.getByLabelText("dragged")).toHaveTextContent("tensor");
    expect(fileInput).toHaveValue("");
  });

  it("resets the project, closes the menu, and clears editor workflow state", () => {
    render(
      <WorkflowHarness
        initialGraphNodes={editedProjectNodes}
        initialGraphConnections={editedConnections}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByLabelText("nodes")).toHaveTextContent("tensor");
    expect(screen.getByLabelText("connections")).toHaveTextContent("");
    expect(screen.getByLabelText("toast")).toHaveTextContent("Project reset.");
    expect(screen.getByLabelText("menu state")).toHaveTextContent("closed");
    expect(screen.getByLabelText("selected")).toHaveTextContent("none");
    expect(screen.getByLabelText("connection source")).toHaveTextContent(
      "none",
    );
    expect(screen.getByLabelText("connection feedback")).toHaveTextContent(
      "none",
    );
    expect(screen.getByLabelText("dragged")).toHaveTextContent("none");
  });

  it("clears project toasts after three seconds", () => {
    vi.useFakeTimers();

    render(<WorkflowHarness />);

    fireEvent.click(screen.getByRole("button", { name: /reset/i }));

    expect(screen.getByLabelText("toast")).toHaveTextContent("Project reset.");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByLabelText("toast")).toHaveTextContent("none");

    vi.useRealTimers();
  });
});
