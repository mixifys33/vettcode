"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, X, ArrowRight, Trash2 } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

interface RecentlyViewedSectionProps {
  maxItems?: number;
  showClearButton?: boolean;
}

export default function RecentlyViewedSection({
  maxItems = 10,
  showClearButton = true,
}: RecentlyViewedSectionProps) {
  const { recentlyViewed, removeProduct, clearAll, isLoaded } = useRecentlyViewed();
  const { formatPrice } = useCurrencyFormat();

  if (!isLoaded || recentlyViewed.length === 0) {
    return null;
  }

  const displayItems = recentlyViewed.slice(0, maxItems);

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-r from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Recently Viewed
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Continue where you left off
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showClearButton && recentlyViewed.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {displayItems.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[160px] sm:w-[200px] snap-start group"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <Link href={`/product/${product.slug}`}>
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="200px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </Link>
                    {/* Remove Button */}
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {/* Time Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                      {getTimeAgo(product.viewedAt)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {product.shopName}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(product.salePrice || product.price)}
                      </span>
                      {product.salePrice && product.salePrice < product.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* View All Card */}
            {recentlyViewed.length > maxItems && (
              <Link
                href="/recently-viewed"
                className="flex-shrink-0 w-[160px] sm:w-[200px] snap-start"
              >
                <div className="h-full bg-gradient-to-br from-slate-100 to-gray-200 rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-3 hover:from-slate-200 hover:to-gray-300 transition-all">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    View All ({recentlyViewed.length})
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

