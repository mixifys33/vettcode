"use client";
import React from "react";
import { Check } from "lucide-react";

interface ColorFilterProps {
  colors: string[];
  selectedColors: string[];
  onColorChange: (colors: string[]) => void;
}

const colorMap: Record<string, string> = {
  black: "#000000",
  white: "#FFFFFF",
  red: "#EF4444",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
  orange: "#F97316",
  purple: "#A855F7",
  pink: "#EC4899",
  gray: "#6B7280",
  grey: "#6B7280",
  brown: "#92400E",
  navy: "#1E3A5F",
  gold: "#D4AF37",
  silver: "#C0C0C0",
  beige: "#F5F5DC",
  maroon: "#800000",
  teal: "#008080",
  cyan: "#00BCD4",
  olive: "#808000",
};

const ColorFilter: React.FC<ColorFilterProps> = ({
  colors,
  selectedColors,
  onColorChange,
}) => {
  const handleColorClick = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter((c) => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  const getColorHex = (colorName: string): string => {
    const lowerColor = colorName.toLowerCase();
    return colorMap[lowerColor] || "#9CA3AF";
  };

  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  if (!colors || colors.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Colors</h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const colorHex = getColorHex(color);
          const isLight = isLightColor(colorHex);
          const isSelected = selectedColors.includes(color);

          return (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              title={color}
              className={`relative w-8 h-8 rounded-full transition-all ${
                isSelected
                  ? "ring-2 ring-offset-2 ring-[#115061]"
                  : "hover:scale-110"
              } ${colorHex === "#FFFFFF" ? "border border-gray-300" : ""}`}
              style={{ backgroundColor: colorHex }}
            >
              {isSelected && (
                <Check
                  className={`absolute inset-0 m-auto w-4 h-4 ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Selected colors display */}
      {selectedColors.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedColors.map((color) => (
            <span
              key={color}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600"
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getColorHex(color) }}
              />
              {color}
              <button
                onClick={() => handleColorClick(color)}
                className="ml-0.5 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorFilter;

