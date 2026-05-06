"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { ProductSort } from "@/types/product";

interface SortOption {
  label: string;
  value: ProductSort | null;
}

const sortOptions: SortOption[] = [
  { label: "Newest First", value: { field: "createdAt", order: "desc" } },
  { label: "Price: Low to High", value: { field: "price", order: "asc" } },
  { label: "Price: High to Low", value: { field: "price", order: "desc" } },
  { label: "Best Selling", value: { field: "totalSales", order: "desc" } },
  { label: "Top Rated", value: { field: "ratings", order: "desc" } },
];

interface SortDropdownProps {
  value: ProductSort | undefined;
  onChange: (sort: ProductSort | undefined) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel = value
    ? sortOptions.find(
        (opt) =>
          opt.value?.field === value.field && opt.value?.order === value.order
      )?.label || "Sort By"
    : "Sort By";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: SortOption) => {
    onChange(option.value || undefined);
    setIsOpen(false);
  };

  const isSelected = (option: SortOption) => {
    if (!value && !option.value) return true;
    if (!value || !option.value) return false;
    return value.field === option.value.field && value.order === option.value.order;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleSelect(option)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                isSelected(option)
                  ? "bg-[#115061]/10 text-[#115061]"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{option.label}</span>
              {isSelected(option) && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;

