"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingCart, Heart, TrendingUp, Sparkles, Clock, Tag } from "lucide-react";
import axios from "axios";

interface Product {
  id: string;
  slug: string;
  title: string;
  images: { url: string }[];
  sale_price: number;
  regular_price: number;
  ratings: number;
  stock: number;
  shops: { name: string; id: string };
}

interface RecommendationsProps {
  type?: "trending" | "personalized" | "new-arrivals" | "deals";
  userId?: string;
  limit?: number;
  title?: string;
  icon?: React.ReactNode;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6002";

export default function ProductRecommendations({
  type = "trending",
  userId,
  limit = 8,
  title,
  icon,
}: RecommendationsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", type, userId, limit],
    queryFn: async () => {
      let endpoint = `${API_URL}/api/recommendations`;
      
      switch (type) {
        case "personalized":
          endpoint += userId ? `/personalized/${userId}?limit=${limit}` : `/trending?limit=${limit}`;
          break;
        case "new-arrivals":
          endpoint += `/new-arrivals?limit=${limit}`;
          break;
        case "deals":
          endpoint += `/deals?limit=${limit}`;
          break;
        default:
          endpoint += `/trending?limit=${limit}`;
      }

      const res = await axios.get(endpoint);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const products: Product[] = data?.products || [];

  const defaultTitles: Record<string, { title: string; icon: React.ReactNode }> = {
    trending: { title: "Trending Now", icon: <TrendingUp className="w-5 h-5 text-orange-500" /> },
    personalized: { title: "Recommended for You", icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
    "new-arrivals": { title: "New Arrivals", icon: <Clock className="w-5 h-5 text-blue-500" /> },
    deals: { title: "Hot Deals", icon: <Tag className="w-5 h-5 text-red-500" /> },
  };

  const displayTitle = title || defaultTitles[type]?.title || "Products";
  const displayIcon = icon || defaultTitles[type]?.icon;

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            {displayIcon}
            <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {displayIcon}
            <h2 className="text-xl font-bold text-gray-900">{displayTitle}</h2>
          </div>
          <Link
            href={`/products?sort=${type}`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const discount = product.sale_price < product.regular_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border hover:shadow-lg transition group">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square p-4">
          {discount > 0 && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
              -{discount}%
            </span>
          )}
          <Image
            src={product.images?.[0]?.url || "/placeholder.png"}
            alt={product.title}
            fill
            className="object-contain p-2"
          />
          
          {/* Quick actions */}
          <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-blue-50">
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
            <button className="w-8 h-8 bg-blue-600 rounded-full shadow flex items-center justify-center hover:bg-blue-700">
              <ShoppingCart className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-0">
        <Link href={`/product/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 hover:text-blue-600">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm text-gray-600">{product.ratings.toFixed(1)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {product.sale_price.toLocaleString()} UGX
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              {product.regular_price.toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 mt-1">{product.shops?.name}</p>
      </div>
    </div>
  );
}

