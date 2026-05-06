"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import ProductCard from "@/shared/components/cards/Product-card";

interface RecommendationsSectionProps {
  type?: "personalized" | "trending" | "bestselling" | "latest" | "similar";
  category?: string;
  productId?: string;
  limit?: number;
  title?: string;
  subtitle?: string;
}

export default function RecommendationsSection({
  type = "personalized",
  category,
  productId,
  limit = 10,
  title = "Recommended For You",
  subtitle = "Products you might like",
}: RecommendationsSectionProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["recommendations", type, category, productId, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("type", type);
      params.append("limit", limit.toString());
      if (category) params.append("category", category);
      if (productId) params.append("productId", productId);

      const res = await fetch(`/api/recommendations?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !data?.recommendations?.length) {
    return null;
  }

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {title}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                {subtitle}
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium text-indigo-600 hover:text-indigo-700 transition"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {data.recommendations.map((product: { id: string }) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

