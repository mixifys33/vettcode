"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { ProductSort } from "@/types/product";

interface SortOption {
  label: string;
  value: ProductSort | null;
}

// Default sort options for products
const productSortOptions: SortOption[] = [
  { label: "Newest First", value: { field: "createdAt", order: "desc" } },
  { label: "Price: Low to High", value: { field: "price", order: "asc" } },
  { label: "Price: High to Low", value: { field: "price", order: "desc" } },
  { label: "Best Selling", value: { field: "totalSales", order: "desc" } },
  { label: "Top Rated", value: { field: "ratings", order: "desc" } },
];

// Sort options for applications
const applicationSortOptions: SortOption[] = [
  { label: "Newest First", value: { field: "createdAt", order: "desc" } as any },
  { label: "Price: Low to High", value: { field: "price", order: "asc" } as any },
  { label: "Price: High to Low", value: { field: "price", order: "desc" } as any },
  { label: "Most Downloads", value: { field: "downloads", order: "desc" } as any },
  { label: "Most Views", value: { field: "views", order: "desc" } as any },
  { label: "Top Rated", value: { field: "rating", order: "desc" } as any },
];

interface SortDropdownProps {
  value: any;
  onChange: (sort: any) => void;
  mode?: "product" | "application";
}

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange, mode = "product" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = mode === "application" ? applicationSortOptions : productSortOptions;

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
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:border-gray-400 dark:hover:border-slate-500 transition-colors"
      >
        <span>{currentLabel}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
          {sortOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleSelect(option)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                isSelected(option)
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
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

