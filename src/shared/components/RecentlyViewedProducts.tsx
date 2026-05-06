"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, X, ChevronRight, Trash2 } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

interface RecentlyViewedProductsProps {
  limit?: number;
  showClearAll?: boolean;
  compact?: boolean;
}

export default function RecentlyViewedProducts({
  limit = 6,
  showClearAll = true,
  compact = false,
}: RecentlyViewedProductsProps) {
  const { recentlyViewed, removeProduct, clearAll, isLoaded } = useRecentlyViewed();
  const { formatPrice } = useCurrencyFormat();

  if (!isLoaded || recentlyViewed.length === 0) return null;

  const displayProducts = recentlyViewed.slice(0, limit);

  if (compact) {
    return (
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Recently Viewed</span>
          </div>
          <Link href="/products" className="text-xs text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {displayProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="flex-shrink-0 w-16"
            >
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
          <span className="text-sm text-gray-400">({recentlyViewed.length})</span>
        </div>
        <div className="flex items-center gap-3">
          {showClearAll && recentlyViewed.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            Browse More <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
          >
            <button
              onClick={() => removeProduct(product.id)}
              className="absolute top-2 right-2 z-10 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
            </button>

            <Link href={`/product/${product.slug}`}>
              <div className="relative aspect-square bg-gray-50">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-900 line-clamp-2">
                  {product.title}
                </h3>
                <div className="mt-1">
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(product.salePrice || product.price)}
                  </span>
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="text-xs text-gray-400 line-through ml-1">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{product.shopName}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

