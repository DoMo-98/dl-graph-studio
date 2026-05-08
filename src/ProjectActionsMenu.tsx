import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Download, MoreVertical, RotateCcw, Upload } from "lucide-react";

type ProjectActionsMenuProps = {
  onImportProject: () => void;
  onExportProject: () => void;
  onResetProject: () => void;
};

export function ProjectActionsMenu({
  onImportProject,
  onExportProject,
  onResetProject,
}: ProjectActionsMenuProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="topbar-icon-button"
          aria-label="Project actions"
          title="Project actions"
        >
          <MoreVertical size={18} aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="project-actions-content"
          align="end"
          sideOffset={8}
        >
          <DropdownMenu.Item
            className="project-actions-item"
            onSelect={onImportProject}
          >
            <Upload size={16} aria-hidden="true" />
            <span>Import project</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="project-actions-item"
            onSelect={onExportProject}
          >
            <Download size={16} aria-hidden="true" />
            <span>Export project</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="project-actions-item danger"
            onSelect={onResetProject}
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Reset project</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
