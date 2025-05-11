import React from "react";

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
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">0%</span>
          <input
            id="opacity"
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            className="w-full h-2 bg-[#3A3A3A] rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-400">100%</span>
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
