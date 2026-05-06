"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, GitCompare, Trash2 } from "lucide-react";
import { useProductComparison } from "@/hooks/useProductComparison";

export default function ProductComparisonBar() {
  const { compareList, removeFromCompare, clearCompare, maxItems } = useProductComparison();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-gray-900">
              Compare Products ({compareList.length}/{maxItems})
            </span>
          </div>
          <button
            onClick={clearCompare}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 flex gap-3 overflow-x-auto pb-2">
            {compareList.map((product) => (
              <div
                key={product.id}
                className="relative flex-shrink-0 w-24 bg-gray-50 rounded-lg p-2"
              >
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="relative w-full aspect-square mb-1">
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={product.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <p className="text-xs text-gray-700 truncate">{product.title}</p>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: maxItems - compareList.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex-shrink-0 w-24 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
              >
                <span className="text-xs text-gray-400">Add product</span>
              </div>
            ))}
          </div>

          <Link
            href="/compare"
            className={`px-6 py-3 rounded-lg font-medium transition ${
              compareList.length >= 2
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            onClick={(e) => compareList.length < 2 && e.preventDefault()}
          >
            Compare Now
          </Link>
        </div>
      </div>
    </div>
  );
}

