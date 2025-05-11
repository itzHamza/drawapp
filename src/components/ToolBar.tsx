import React from "react";
import {
  Undo2,
  Redo2,
  Trash2,
  Pencil,
  Eraser,
  MousePointer,
} from "lucide-react";

interface ToolBarProps {
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  mode: "pencil" | "eraser" | "cursor";
  onModeChange: (mode: "pencil" | "eraser" | "cursor") => void;
}

const ToolBar: React.FC<ToolBarProps> = ({
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  mode,
  onModeChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center p-1 bg-[#3A3A3A] rounded mr-2">
        <button
          onClick={() => onModeChange("pencil")}
          className={`p-1.5 rounded transition-colors ${
            mode === "pencil"
              ? "bg-[#4A4A4A] text-blue-400"
              : "text-white hover:bg-[#4A4A4A]"
          }`}
          aria-label="Pencil mode"
          title="Pencil mode"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={() => onModeChange("eraser")}
          className={`p-1.5 rounded transition-colors ${
            mode === "eraser"
              ? "bg-[#4A4A4A] text-blue-400"
              : "text-white hover:bg-[#4A4A4A]"
          }`}
          aria-label="Eraser mode"
          title="Eraser mode"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <button
          onClick={() => onModeChange("cursor")}
          className={`p-1.5 rounded transition-colors ${
            mode === "cursor"
              ? "bg-[#4A4A4A] text-blue-400"
              : "text-white hover:bg-[#4A4A4A]"
          }`}
          aria-label="Cursor mode (disable drawing)"
          title="Cursor mode (disable drawing)"
        >
          <MousePointer className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded transition-colors ${
          canUndo
            ? "text-white hover:bg-[#3A3A3A]"
            : "text-gray-500 cursor-not-allowed"
        }`}
        aria-label="Undo"
      >
        <Undo2 className="w-5 h-5" />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded transition-colors ${
          canRedo
            ? "text-white hover:bg-[#3A3A3A]"
            : "text-gray-500 cursor-not-allowed"
        }`}
        aria-label="Redo"
      >
        <Redo2 className="w-5 h-5" />
      </button>

      <div className="h-6 border-l border-[#3A3A3A] mx-1"></div>

      <button
        onClick={onClear}
        className="p-2 text-red-400 rounded hover:bg-[#3A3A3A] transition-colors"
        aria-label="Clear canvas"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ToolBar;
