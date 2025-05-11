import React, { useState } from "react";
import Canvas from "./Canvas";
import ColorPicker from "./ColorPicker";
import BrushControls from "./BrushControls";
import ToolBar from "./ToolBar";
import PdfAsHtmlViewer from "./PdfAsHtmlViewer";
import { DrawingHistory } from "../types/drawing";
import { ChevronDown } from "lucide-react";

const DrawingApp: React.FC = () => {
  const [color, setColor] = useState<string>("#000000");
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [opacity, setOpacity] = useState<number>(1);
  const [mode, setMode] = useState<"pencil" | "eraser" | "cursor">("pencil");
  const [history, setHistory] = useState<DrawingHistory>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(-1);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleClearCanvas = () => {
    setHistory([]);
    setCurrentHistoryIndex(-1);
  };

  const handleUndo = () => {
    if (currentHistoryIndex >= 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
    }
  };

  const handleRedo = () => {
    if (currentHistoryIndex < history.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
    }
  };

  const handleModeChange = (newMode: "pencil" | "eraser" | "cursor") => {
    setMode(newMode);
  };

  const toggleDropdown = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const handleDropdownContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const getEffectiveOpacity = () => {
    return mode === "eraser" ? 1 : opacity;
  };

  const getCursorStyle = () => {
    if (mode === "cursor") {
      return "cursor-default";
    }
    return "cursor-crosshair";
  };

  return (
    <div className="h-screen flex flex-col bg-transparent absolute w-full">
      <header className="bg-[#2A2A2A] text-white z-50">
        <div className="flex items-center h-12 px-4">
          <h1 className="text-lg font-semibold mr-8">TBiB PDF</h1>

          <nav className="flex items-center space-x-1 flex-1">
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown("brush", e)}
                className={`flex items-center px-3 py-1.5 rounded hover:bg-[#3A3A3A] ${
                  activeDropdown === "brush" ? "bg-[#3A3A3A]" : ""
                } ${mode === "cursor" ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={mode === "cursor"}
              >
                <span className="mr-1">Brush</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === "brush" && (
                <div
                  className="absolute z-10 top-full left-0 mt-1 w-72 bg-[#2A2A2A] rounded-lg shadow-xl border border-[#3A3A3A] p-4"
                  onClick={handleDropdownContentClick}
                >
                  <BrushControls
                    lineWidth={lineWidth}
                    opacity={opacity}
                    color={mode === "eraser" ? "transparent" : color}
                    onLineWidthChange={setLineWidth}
                    onOpacityChange={setOpacity}
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={(e) => toggleDropdown("color", e)}
                className={`flex items-center px-3 py-1.5 rounded hover:bg-[#3A3A3A] ${
                  activeDropdown === "color" ? "bg-[#3A3A3A]" : ""
                } ${
                  mode === "cursor" || mode === "eraser"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={mode === "cursor" || mode === "eraser"}
              >
                <div
                  className="w-4 h-4 rounded-sm mr-2"
                  style={{
                    backgroundColor: color,
                    border: color === "#FFFFFF" ? "1px solid #666" : "none",
                  }}
                />
                <span className="mr-1">Color</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === "color" && (
                <div
                  className="absolute z-10 top-full left-0 mt-1 bg-[#2A2A2A] rounded-lg shadow-xl border border-[#3A3A3A] p-4"
                  onClick={handleDropdownContentClick}
                >
                  <ColorPicker color={color} onChange={setColor} />
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center">
            <ToolBar
              onClear={handleClearCanvas}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={currentHistoryIndex >= 0}
              canRedo={currentHistoryIndex < history.length - 1}
              mode={mode}
              onModeChange={handleModeChange}
            />
          </div>
        </div>
      </header>

      <main
        className="flex-1 relative overflow-hidden"
        onClick={() => setActiveDropdown(null)}
      >
        {/* PDF Content Layer */}
        <div className="absolute inset-0">
          <PdfAsHtmlViewer url="./Document.html" />
        </div>

        {/* Canvas Layer */}
        <div className="absolute inset-0 pointer-events-none">
          <Canvas
            settings={{
              color,
              lineWidth,
              opacity: getEffectiveOpacity(),
              isEraser: mode === "eraser",
            }}
            history={history}
            setHistory={setHistory}
            currentHistoryIndex={currentHistoryIndex}
            setCurrentHistoryIndex={setCurrentHistoryIndex}
            isDrawingEnabled={mode !== "cursor"}
            cursorStyle={getCursorStyle()}
          />
        </div>
      </main>
    </div>
  );
};

export default DrawingApp;
