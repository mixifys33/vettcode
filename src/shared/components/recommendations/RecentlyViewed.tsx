"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, X, Trash2 } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

export default function RecentlyViewed() {
  const { recentlyViewed, removeProduct, clearAll, isLoaded } = useRecentlyViewed();

  if (!isLoaded || recentlyViewed.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
          </div>
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recentlyViewed.slice(0, 10).map((product) => (
            <div
              key={product.id}
              className="relative flex-shrink-0 w-48 bg-gray-50 rounded-xl p-3 group"
            >
              <button
                onClick={() => removeProduct(product.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
              >
                <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
              </button>

              <Link href={`/product/${product.slug}`}>
                <div className="relative w-full aspect-square mb-3 bg-white rounded-lg overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.png"}
                    alt={product.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 hover:text-blue-600">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2">
                  {product.salePrice && product.salePrice < product.price ? (
                    <>
                      <span className="text-sm font-bold text-green-600">
                        {product.salePrice.toLocaleString()} UGX
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {product.price.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-gray-900">
                      {product.price.toLocaleString()} UGX
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{product.shopName}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

