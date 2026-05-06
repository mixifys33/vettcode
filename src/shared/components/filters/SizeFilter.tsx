"use client";
import React from "react";

interface SizeFilterProps {
  sizes: string[];
  selectedSizes: string[];
  onSizeChange: (sizes: string[]) => void;
}

const SizeFilter: React.FC<SizeFilterProps> = ({
  sizes,
  selectedSizes,
  onSizeChange,
}) => {
  const handleSizeClick = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizeChange(selectedSizes.filter((s) => s !== size));
    } else {
      onSizeChange([...selectedSizes, size]);
    }
  };

  if (!sizes || sizes.length === 0) return null;

  // Sort sizes in a logical order
  const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "2XL", "3XL", "4XL"];
  const sortedSizes = [...sizes].sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a.toUpperCase());
    const bIndex = sizeOrder.indexOf(b.toUpperCase());
    
    // If both are in the order array, sort by that order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // Otherwise, sort alphabetically/numerically
    return a.localeCompare(b, undefined, { numeric: true });
  });

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Sizes</h3>
      <div className="flex flex-wrap gap-2">
        {sortedSizes.map((size) => {
          const isSelected = selectedSizes.includes(size);
          
          return (
            <button
              key={size}
              onClick={() => handleSizeClick(size)}
              className={`min-w-[40px] px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                isSelected
                  ? "bg-[#115061] text-white border-[#115061]"
                  : "bg-white text-gray-700 border-gray-300 hover:border-[#115061] hover:text-[#115061]"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeFilter;

