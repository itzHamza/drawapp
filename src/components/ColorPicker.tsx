import React from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const colors = [
    "#000000",
    "#FFFFFF",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#A52A2A",
    "#808080",
    "#FFB6C1",
    "#98FB98",
    "#87CEEB",
  ];

  return (
    <div className="w-64">
      <div className="grid grid-cols-5 gap-2">
        {colors.map((c) => (
          <button
            key={c}
            className={`w-8 h-8 rounded transition-transform hover:scale-110 ${
              color === c ? "ring-2 ring-blue-500" : ""
            }`}
            style={{
              backgroundColor: c,
              border: c === "#FFFFFF" ? "1px solid #666" : "none",
            }}
            onClick={() => onChange(c)}
            aria-label={`Select color ${c}`}
          />
        ))}
        <label className="w-8 h-8 z-10 rounded flex items-center justify-center border border-gray-600 cursor-pointer hover:bg-[#3A3A3A] transition-colors">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
            aria-label="Custom color picker"
          />
          <span className="text-xs text-white">+</span>
        </label>
      </div>
    </div>
  );
};

export default ColorPicker;
