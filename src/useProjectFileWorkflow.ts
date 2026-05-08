import {
  useCallback,
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
import type { EditorToast } from "./useEditorToast";
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
  showToast: (toast: EditorToast) => void;
};

export function readTextFile(file: File) {
  if (typeof file.text === "function") {
    return file.text().then((result: unknown) => {
      if (typeof result === "string") {
        return result;
      }

      throw new Error("Project file could not be read as text.");
    });
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
  showToast,
}: UseProjectFileWorkflowOptions) {
  const [isProjectActionsOpen, setIsProjectActionsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    showToast({ message: "Project exported.", tone: "success" });
    setIsProjectActionsOpen(false);
  }, [graphNodes, graphConnections, showToast]);

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
        showToast({
          message: "Project file could not be read.",
          tone: "error",
        });
        event.target.value = "";
        return;
      }

      const parsedProject = parseProjectFileContent(projectFileContent);

      if (!parsedProject.ok) {
        showToast({ message: parsedProject.message, tone: "error" });
        event.target.value = "";
        return;
      }

      setGraphNodes(parsedProject.project.nodes);
      setGraphConnections(parsedProject.project.connections);
      clearEditorWorkflowState();
      showToast({ message: "Project imported.", tone: "success" });
      setIsProjectActionsOpen(false);
      event.target.value = "";
    },
    [setGraphNodes, setGraphConnections, clearEditorWorkflowState, showToast],
  );

  const resetProject = useCallback(() => {
    setGraphNodes(createInitialGraphNodes());
    setGraphConnections([]);
    clearEditorWorkflowState();
    showToast({ message: "Project reset.", tone: "success" });
    setIsProjectActionsOpen(false);
  }, [
    setGraphNodes,
    setGraphConnections,
    createInitialGraphNodes,
    clearEditorWorkflowState,
    showToast,
  ]);

  return {
    isProjectActionsOpen,
    setIsProjectActionsOpen,
    toggleProjectActions,
    fileInputRef,
    openProjectImportPicker,
    exportProjectFile,
    importProjectFile,
    resetProject,
  };
}
