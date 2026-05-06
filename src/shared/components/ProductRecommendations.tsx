"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingCart, Heart, ChevronRight, Sparkles } from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import useUser from "@/hooks/useUser";
import toast from "react-hot-toast";

interface Product {
  id: string;
  title: string;
  slug: string;
  image: string | null;
  price: number;
  regularPrice: number;
  category: string;
  ratings: number;
  totalSales: number;
  shop: { name: string; id: string };
}

interface ProductRecommendationsProps {
  productId?: string;
  category?: string;
  title?: string;
  limit?: number;
  showViewAll?: boolean;
}

export default function ProductRecommendations({
  productId,
  category,
  title = "Recommended for You",
  limit = 8,
  showViewAll = true,
}: ProductRecommendationsProps) {
  const { formatPrice } = useCurrencyFormat();
  const { user } = useUser();

  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", productId, category, user?.id],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (productId) params.append("productId", productId);
      if (category) params.append("category", category);
      if (user?.id) params.append("userId", user.id);
      params.append("limit", limit.toString());
      
      const res = await axiosInstance.get(`/product/api/analytics/recommendations?${params}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      await axiosInstance.post("/api/cart/sync", {
        items: [{ productId: product.id, quantity: 1 }],
      });
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const recommendations: Product[] = data?.recommendations || [];

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
        {showViewAll && (
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
          >
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
                {product.regularPrice > product.price && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
                    {Math.round((1 - product.price / product.regularPrice) * 100)}% OFF
                  </span>
                )}
              </div>
            </Link>

            <div className="p-3">
              <Link href={`/product/${product.slug}`}>
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-blue-600 transition">
                  {product.title}
                </h3>
              </Link>
              
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-600">{product.ratings?.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({product.totalSales} sold)</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div>
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.regularPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through ml-1">
                      {formatPrice(product.regularPrice)}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

