import React from "react";
import { PenTool, Pen, pencil, Highlighter, Pencil } from "lucide-react";

interface BrushControlsProps {
  lineWidth: number;
  opacity: number;
  color: string; // Added color prop
  onLineWidthChange: (width: number) => void;
  onOpacityChange: (opacity: number) => void;
}

const BrushControls: React.FC<BrushControlsProps> = ({
  lineWidth,
  opacity,
  color,
  onLineWidthChange,
  onOpacityChange,
}) => {
  return (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <label htmlFor="line-width" className="text-sm">
            Size
          </label>
          <span className="text-sm text-gray-400">{lineWidth}px</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">1</span>
          <input
            id="line-width"
            type="range"
            min="1"
            max="30"
            value={lineWidth}
            onChange={(e) => onLineWidthChange(Number(e.target.value))}
            className="w-full h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400">30</span>
        </div>
        <div className="mt-1 h-6 flex items-center justify-center">
          <div
            className="rounded-full transition-all"
            style={{
              width: `${Math.min(30, Math.max(lineWidth, 4))}px`,
              height: `${Math.min(30, Math.max(lineWidth, 4))}px`,
              backgroundColor: color,
              opacity: opacity,
              border: color === "#FFFFFF" ? "1px solid #666" : "none",
            }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <label htmlFor="opacity" className="text-sm">
            Opacity
          </label>
          <span className="text-sm text-gray-400">
            {Math.round(opacity * 100)}%
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <div className="flex justify-between gap-2">
            <button
              onClick={() => onOpacityChange(1)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm text-white hover:bg-[#4A4A4A] ${
          opacity === 1 ? "bg-[#5A5A5A]" : "bg-[#3A3A3A]"
              }`}
            >
              <PenTool className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpacityChange(0.8)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm text-white hover:bg-[#4A4A4A] ${
          opacity === 0.8 ? "bg-[#5A5A5A]" : "bg-[#3A3A3A]"
              }`}
            >
              <Pen className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpacityChange(0.65)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm text-white hover:bg-[#4A4A4A] ${
          opacity === 0.65 ? "bg-[#5A5A5A]" : "bg-[#3A3A3A]"
              }`}
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              onClick={() => onOpacityChange(0.3)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm text-white hover:bg-[#4A4A4A] ${
          opacity === 0.3 ? "bg-[#5A5A5A]" : "bg-[#3A3A3A]"
              }`}
            >
              <Highlighter className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-center h-6">
          <div
            className="w-16 h-4 rounded-sm"
            style={{
              backgroundColor: color,
              opacity,
              border: color === "#FFFFFF" ? "1px solid #666" : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BrushControls;
