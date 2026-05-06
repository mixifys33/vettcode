"use client";
import React from "react";
import { Check } from "lucide-react";

interface Brand {
  name: string;
  count?: number;
}

interface BrandFilterProps {
  brands: Brand[];
  selectedBrand: string;
  onBrandChange: (brand: string) => void;
}

const BrandFilter: React.FC<BrandFilterProps> = ({
  brands,
  selectedBrand,
  onBrandChange,
}) => {
  const handleBrandClick = (brandName: string) => {
    if (selectedBrand === brandName) {
      onBrandChange("");
    } else {
      onBrandChange(brandName);
    }
  };

  if (!brands || brands.length === 0) return null;

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Brands</h3>
      <div className="flex flex-wrap gap-2">
        {brands.map((brand) => (
          <button
            key={brand.name}
            onClick={() => handleBrandClick(brand.name)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedBrand === brand.name
                ? "bg-[#115061] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {selectedBrand === brand.name && <Check className="w-3.5 h-3.5" />}
            <span>{brand.name}</span>
            {brand.count !== undefined && (
              <span className={`text-xs ${
                selectedBrand === brand.name ? "text-white/70" : "text-gray-400"
              }`}>
                ({brand.count})
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandFilter;

