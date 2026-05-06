"use client";

import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search, Store, MapPin, Star, X, ChevronDown,
  Grid3X3, List, Loader2, Package, CheckCircle, SlidersHorizontal, RefreshCw
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";

interface Shop {
  id: string;
  name: string;
  bio?: string;
  category: string;
  address: string;
  ratings: number;
  reviewCount?: number;
  productCount?: number;
  coverBanner?: string;
  avatar?: string;
  images?: { url: string }[];
  isVerified?: boolean;
  createdAt: string;
}

interface FilterState {
  category: string;
  rating: number;
  sortBy: string;
  search: string;
}

const CATEGORIES = [
  "All Categories", "Electronics", "Fashion", "Home & Garden",
  "Health & Beauty", "Sports & Outdoors", "Automotive", "Other"
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" },
  { value: "name_asc", label: "Name (A-Z)" },
];

// Shop Card Component
const ShopCard = ({ shop, viewMode }: { shop: Shop; viewMode: "grid" | "list" }) => {
  const [avatarError, setAvatarError] = React.useState(false);
  const shopAvatar = (!avatarError && shop.avatar && shop.avatar.startsWith('http')) ? shop.avatar : (shop.images?.[0]?.url || null);
  const coverBanner = shop.coverBanner || null;
  const initials = shop.name?.slice(0, 2).toUpperCase() || "ES";
  const showInitials = !shopAvatar || avatarError;

  if (viewMode === "list") {
    return (
      <Link href={`/shop/${shop.id}`} className="block group">
        <div className="bg-white rounded-2xl border hover:border-blue-200 hover:shadow-xl transition-all p-4 flex gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 shrink-0 ring-4 ring-white shadow-lg">
            {!showInitials ? (
              <Image src={shopAvatar!} alt={shop.name} fill className="object-cover" unoptimized onError={() => setAvatarError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-xl">{initials}</div>
            )}
            {shop.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600">
                  {shop.name}
                </h3>
                <p className="text-sm text-blue-600 font-medium">{shop.category}</p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">{shop.ratings?.toFixed(1) || "5.0"}</span>
              </div>
            </div>
            {shop.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{shop.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5" />{shop.address || "Worldwide"}
              </span>
              <span className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-full text-blue-600">
                <Package className="w-3.5 h-3.5" />{shop.productCount || 0} products
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/shop/${shop.id}`} className="block group">
      <div className="bg-white rounded-2xl border hover:border-blue-200 hover:shadow-2xl transition-all overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
          {coverBanner && <Image src={coverBanner} alt="" fill className="object-cover" unoptimized />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 px-2.5 py-1 rounded-full shadow-lg">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold">{shop.ratings?.toFixed(1) || "5.0"}</span>
          </div>
          {shop.isVerified && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <CheckCircle className="w-3 h-3" /><span className="text-xs font-medium">Verified</span>
            </div>
          )}
        </div>
        {/* Avatar positioned at bottom center of cover */}
        <div className="relative px-4 pb-4">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-blue-100 to-purple-100 shadow-xl overflow-hidden">
            {!showInitials ? (
              <Image src={shopAvatar!} alt={shop.name} fill className="object-cover" unoptimized onError={() => setAvatarError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-600 font-black text-xl">{initials}</div>
            )}
          </div>
          <div className="pt-12 text-center">
            <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-blue-600 px-2">{shop.name}</h3>
            <p className="text-sm text-blue-600 font-medium">{shop.category}</p>
            {shop.bio && <p className="text-xs text-gray-500 mt-2 line-clamp-2 px-2">{shop.bio}</p>}
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{shop.productCount || 0}</span> items
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin className="w-4 h-4 text-pink-500" />
                <span className="truncate max-w-[80px]">{shop.address?.split(",")[0] || "Worldwide"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};


// Main Shops Page Component
function ShopsContent() {
  const searchParams = useSearchParams();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get("category") || "All Categories",
    rating: parseFloat(searchParams.get("rating") || "0"),
    sortBy: searchParams.get("sort") || "popular",
    search: searchParams.get("search") || "",
  });

  const [searchInput, setSearchInput] = useState(filters.search);

  // Fetch shops
  const fetchShops = useCallback(async (cursor?: string | null, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams();
      if (filters.category !== "All Categories") params.set("category", filters.category);
      if (filters.rating > 0) params.set("minRating", filters.rating.toString());
      if (filters.sortBy) params.set("sort", filters.sortBy);
      if (filters.search) params.set("search", filters.search);
      params.set("limit", "12");
      if (cursor) params.set("cursor", cursor);

      const response = await axiosInstance.get(`/api/shops?${params.toString()}`);
      const data = response.data;

      if (data.success) {
        if (append) {
          setShops((prev) => [...prev, ...data.shops]);
        } else {
          setShops(data.shops);
        }
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setError(data.message || "Failed to fetch shops");
      }
    } catch (err: any) {
      console.error("Error fetching shops:", err);
      setError(err.response?.data?.message || "Failed to fetch shops");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    setNextCursor(null);
    setHasMore(true);
    fetchShops(null, false);
  }, [filters.category, filters.rating, filters.sortBy, filters.search]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && nextCursor) {
          fetchShops(nextCursor, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, nextCursor, fetchShops]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: "All Categories",
      rating: 0,
      sortBy: "popular",
      search: "",
    });
    setSearchInput("");
  };

  const hasActiveFilters = filters.category !== "All Categories" || filters.rating > 0 || filters.search;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
              <Store className="w-5 h-5" />
              <span className="text-sm font-medium">Discover Amazing Shops</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Explore Our Marketplace
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Find unique products from verified sellers across Worldwide
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search shops by name, category, or location..."
                  className="w-full pl-12 pr-24 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>


      {/* Filters & Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                  className="appearance-none bg-gray-50 border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="appearance-none bg-gray-50 border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters((prev) => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="appearance-none bg-gray-50 border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              {shops.length > 0 ? (
                <>Showing <span className="font-semibold text-gray-900">{shops.length}</span> shops</>
              ) : (
                "No shops found"
              )}
            </p>
            <button
              onClick={() => fetchShops(null, false)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading shops...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl inline-block">
              <p className="font-medium">{error}</p>
              <button
                onClick={() => fetchShops(null, false)}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Shops Grid/List */}
        {!loading && !error && shops.length > 0 && (
          <>
            <div className={viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "flex flex-col gap-4"
            }>
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} viewMode={viewMode} />
              ))}
            </div>

            {/* Load More Trigger */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more shops...</span>
                </div>
              )}
              {!hasMore && shops.length > 0 && (
                <p className="text-gray-400 text-sm">You&apos;ve seen all shops</p>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && shops.length === 0 && (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shops found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ShopsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#115061]/20 border-t-[#115061] rounded-full animate-spin" /></div>}>
      <ShopsContent />
    </Suspense>
  );
}

