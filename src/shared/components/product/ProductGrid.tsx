"use client";
import React from "react";
import { Product } from "@/types/product";
import ProductCard from "../cards/Product-card";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

const ProductGridSkeleton = () => (
  <>
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse"
      >
        <div className="aspect-square bg-gray-200" />
        <div className="p-3 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/5" />
          </div>
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    ))}
  </>
);

const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductGridSkeleton />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 mb-6 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-12 h-12 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
          No applications found
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
          Try adjusting your filters or search terms to discover production-ready applications.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;

