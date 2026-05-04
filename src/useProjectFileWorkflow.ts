import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  createProjectFile,
  parseProjectFileContent,
  serializeProjectFile,
} from "./projectFile";
import type { GraphConnection, GraphNode } from "./projectFile";

type UseProjectFileWorkflowOptions = {
  graphNodes: GraphNode[];
  graphConnections: GraphConnection[];
  setGraphNodes: Dispatch<SetStateAction<GraphNode[]>>;
  setGraphConnections: Dispatch<SetStateAction<GraphConnection[]>>;
  createInitialGraphNodes: () => GraphNode[];
  clearSelectedNode: () => void;
  clearConnectionSource: () => void;
  clearConnectionFeedback: () => void;
  clearDraggedNode: () => void;
};

export function readTextFile(file: File) {
  if (file.text) {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Project file could not be read as text."));
    });

    reader.addEventListener("error", () => {
      reject(new Error("Project file could not be read."));
    });

    reader.readAsText(file);
  });
}

export function useProjectFileWorkflow({
  graphNodes,
  graphConnections,
  setGraphNodes,
  setGraphConnections,
  createInitialGraphNodes,
  clearSelectedNode,
  clearConnectionSource,
  clearConnectionFeedback,
  clearDraggedNode,
}: UseProjectFileWorkflowOptions) {
  const [isProjectActionsOpen, setIsProjectActionsOpen] = useState(false);
  const [projectToast, setProjectToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!projectToast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setProjectToast(null);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [projectToast]);

  const clearEditorWorkflowState = useCallback(() => {
    clearSelectedNode();
    clearConnectionSource();
    clearConnectionFeedback();
    clearDraggedNode();
  }, [
    clearSelectedNode,
    clearConnectionSource,
    clearConnectionFeedback,
    clearDraggedNode,
  ]);

  const toggleProjectActions = useCallback(() => {
    setIsProjectActionsOpen((isOpen) => !isOpen);
  }, []);

  const openProjectImportPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const exportProjectFile = useCallback(() => {
    const project = createProjectFile(graphNodes, graphConnections);
    const serializedProject = serializeProjectFile(project);
    const projectBlob = new Blob([serializedProject], {
      type: "application/json",
    });
    const projectUrl = URL.createObjectURL(projectBlob);
    const projectLink = document.createElement("a");

    projectLink.href = projectUrl;
    projectLink.download = "dl-graph-studio-project.json";
    document.body.append(projectLink);
    projectLink.click();
    projectLink.remove();
    URL.revokeObjectURL(projectUrl);
    setProjectToast("Project exported.");
    setIsProjectActionsOpen(false);
  }, [graphNodes, graphConnections]);

  const importProjectFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];

      if (!selectedFile) {
        return;
      }

      let projectFileContent: string;

      try {
        projectFileContent = await readTextFile(selectedFile);
      } catch {
        setProjectToast("Project file could not be read.");
        event.target.value = "";
        return;
      }

      const parsedProject = parseProjectFileContent(projectFileContent);

      if (!parsedProject.ok) {
        setProjectToast(parsedProject.message);
        event.target.value = "";
        return;
      }

      setGraphNodes(parsedProject.project.nodes);
      setGraphConnections(parsedProject.project.connections);
      clearEditorWorkflowState();
      setProjectToast("Project imported.");
      setIsProjectActionsOpen(false);
      event.target.value = "";
    },
    [setGraphNodes, setGraphConnections, clearEditorWorkflowState],
  );

  const resetProject = useCallback(() => {
    setGraphNodes(createInitialGraphNodes());
    setGraphConnections([]);
    clearEditorWorkflowState();
    setProjectToast("Project reset.");
    setIsProjectActionsOpen(false);
  }, [
    setGraphNodes,
    setGraphConnections,
    createInitialGraphNodes,
    clearEditorWorkflowState,
  ]);

  return {
    isProjectActionsOpen,
    setIsProjectActionsOpen,
    toggleProjectActions,
    projectToast,
    fileInputRef,
    openProjectImportPicker,
    exportProjectFile,
    importProjectFile,
    resetProject,
  };
}
