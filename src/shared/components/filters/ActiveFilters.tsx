"use client";
import React from "react";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  filters: any;
  onRemoveFilter: (key: string, value?: string) => void;
  onClearAll: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
}) => {
  const activeFilters: { key: string; label: string; value: string }[] = [];

  if (filters.category) {
    activeFilters.push({
      key: "category",
      label: "Category",
      value: filters.category,
    });
  }

  if (filters.subCategory) {
    activeFilters.push({
      key: "subCategory",
      label: "Subcategory",
      value: filters.subCategory,
    });
  }

  // Product-specific filters
  if (filters.brand) {
    activeFilters.push({
      key: "brand",
      label: "Brand",
      value: filters.brand,
    });
  }

  if (filters.colors && filters.colors.length > 0) {
    filters.colors.forEach((color: string) => {
      activeFilters.push({
        key: "colors",
        label: "Color",
        value: color,
      });
    });
  }

  if (filters.sizes && filters.sizes.length > 0) {
    filters.sizes.forEach((size: string) => {
      activeFilters.push({
        key: "sizes",
        label: "Size",
        value: size,
      });
    });
  }

  // Application-specific filters
  if (filters.technologyStack && filters.technologyStack.length > 0) {
    filters.technologyStack.forEach((tech: string) => {
      activeFilters.push({
        key: "technologyStack",
        label: "Tech Stack",
        value: tech,
      });
    });
  }

  if (filters.platforms && filters.platforms.length > 0) {
    filters.platforms.forEach((platform: string) => {
      activeFilters.push({
        key: "platforms",
        label: "Platform",
        value: platform,
      });
    });
  }

  if (filters.isFree !== undefined) {
    activeFilters.push({
      key: "isFree",
      label: "Pricing",
      value: filters.isFree ? "Free Only" : "Paid Only",
    });
  }

  if (filters.verificationStatus) {
    activeFilters.push({
      key: "verificationStatus",
      label: "Status",
      value: "Verified Only",
    });
  }

  // Common filters
  if (filters.price_min !== undefined || filters.price_max !== undefined) {
    const priceLabel = `$${filters.price_min?.toLocaleString() || 0} - ${filters.price_max?.toLocaleString() || "Max"}`;
    activeFilters.push({
      key: "price_min",
      label: "Price",
      value: priceLabel,
    });
  }

  if (filters.rating_min !== undefined) {
    activeFilters.push({
      key: "rating_min",
      label: "Rating",
      value: `${filters.rating_min}+ Stars`,
    });
  }

  if (filters.q) {
    activeFilters.push({
      key: "q",
      label: "Search",
      value: filters.q,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="text-sm text-slate-500 dark:text-slate-400">Active Filters:</span>
      
      {activeFilters.map((filter, index) => (
        <span
          key={`${filter.key}-${filter.value}-${index}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm border border-purple-500/20"
        >
          <span className="text-xs text-slate-500 dark:text-slate-400">{filter.label}:</span>
          <span className="font-medium">{filter.value}</span>
          <button
            onClick={() => onRemoveFilter(filter.key, filter.value)}
            className="ml-1 p-0.5 hover:bg-purple-500/20 rounded-full transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-sm text-red-500 hover:text-red-600 font-medium ml-2"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilters;

