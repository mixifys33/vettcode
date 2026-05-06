"use client";
import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Category {
  name: string;
  slug?: string;
  subCategories?: { name: string; slug?: string }[];
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  selectedSubCategory?: string;
  onCategoryChange: (category: string) => void;
  onSubCategoryChange?: (subCategory: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  selectedSubCategory,
  onCategoryChange,
  onSubCategoryChange,
}) => {
  const [expandedCategory, setExpandedCategory] = React.useState<string | null>(
    selectedCategory || null
  );

  const handleCategoryClick = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      onCategoryChange("");
      if (onSubCategoryChange) onSubCategoryChange("");
    } else {
      onCategoryChange(categoryName);
      if (onSubCategoryChange) onSubCategoryChange("");
    }
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleSubCategoryClick = (subCategoryName: string) => {
    if (onSubCategoryChange) {
      if (selectedSubCategory === subCategoryName) {
        onSubCategoryChange("");
      } else {
        onSubCategoryChange(subCategoryName);
      }
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Categories</h3>
      <ul className="space-y-1">
        {/* All Products option */}
        <li>
          <button
            onClick={() => {
              onCategoryChange("");
              if (onSubCategoryChange) onSubCategoryChange("");
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !selectedCategory
                ? "bg-[#115061] text-white font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            All Products
          </button>
        </li>

        {categories.map((category) => (
          <li key={category.name}>
            <button
              onClick={() => handleCategoryClick(category.name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedCategory === category.name
                  ? "bg-[#115061] text-white font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{category.name}</span>
              {category.subCategories && category.subCategories.length > 0 && (
                <span className="ml-2">
                  {expandedCategory === category.name ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </span>
              )}
            </button>

            {/* Subcategories */}
            {category.subCategories &&
              category.subCategories.length > 0 &&
              expandedCategory === category.name && (
                <ul className="ml-4 mt-1 space-y-1">
                  {category.subCategories.map((sub) => (
                    <li key={sub.name}>
                      <button
                        onClick={() => handleSubCategoryClick(sub.name)}
                        className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                          selectedSubCategory === sub.name
                            ? "bg-[#115061]/10 text-[#115061] font-medium"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter;

