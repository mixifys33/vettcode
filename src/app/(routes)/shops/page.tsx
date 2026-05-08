"use client";

import React, { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search, Code2, MapPin, Star, X, ChevronDown,
  Grid3X3, List, Loader2, Package, CheckCircle, SlidersHorizontal, RefreshCw,
  Users, Award, Zap, Terminal
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
  "All Categories", "Web Applications", "Mobile Apps", "SaaS Platforms",
  "APIs & Services", "Templates & Themes", "Dashboards", "E-Commerce", "Other"
];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest Sellers" },
  { value: "name_asc", label: "Name (A-Z)" },
];

// Seller Card Component
const ShopCard = ({ shop, viewMode }: { shop: Shop; viewMode: "grid" | "list" }) => {
  const [avatarError, setAvatarError] = React.useState(false);
  const shopAvatar = (!avatarError && shop.avatar && shop.avatar.startsWith('http')) ? shop.avatar : (shop.images?.[0]?.url || null);
  const coverBanner = shop.coverBanner || null;
  const initials = shop.name?.slice(0, 2).toUpperCase() || "DV";
  const showInitials = !shopAvatar || avatarError;

  if (viewMode === "list") {
    return (
      <Link href={`/shop/${shop.id}`} className="block group">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/50 hover:shadow-xl transition-all p-4 flex gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 shrink-0 ring-4 ring-slate-700/50 shadow-lg">
            {!showInitials ? (
              <Image src={shopAvatar!} alt={shop.name} fill className="object-cover" unoptimized onError={() => setAvatarError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">{initials}</div>
            )}
            {shop.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-lg">
                <CheckCircle className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-lg truncate group-hover:text-purple-400 transition">
                  {shop.name}
                </h3>
                <p className="text-sm text-purple-400 font-medium">{shop.category}</p>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-500/30">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-amber-300">{shop.ratings?.toFixed(1) || "5.0"}</span>
              </div>
            </div>
            {shop.bio && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{shop.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-700/50 px-2 py-1 rounded-full">
                <MapPin className="w-3.5 h-3.5" />{shop.address || "Global"}
              </span>
              <span className="flex items-center gap-1.5 bg-purple-500/20 px-2 py-1 rounded-full text-purple-300">
                <Package className="w-3.5 h-3.5" />{shop.productCount || 0} applications
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/shop/${shop.id}`} className="block group">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/50 hover:shadow-2xl transition-all overflow-hidden">
        {/* Cover Banner */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
          {coverBanner && <Image src={coverBanner} alt="" fill className="object-cover" unoptimized />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Code pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
            backgroundSize: "30px 30px"
          }} />
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg border border-amber-500/30">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-amber-300">{shop.ratings?.toFixed(1) || "5.0"}</span>
          </div>
          {shop.isVerified && (
            <div className="absolute top-3 left-3 bg-blue-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <CheckCircle className="w-3 h-3" /><span className="text-xs font-medium">Verified</span>
            </div>
          )}
        </div>
        {/* Avatar positioned at bottom center of cover */}
        <div className="relative px-4 pb-4">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-4 border-slate-800 bg-gradient-to-br from-purple-500 to-indigo-600 shadow-xl overflow-hidden">
            {!showInitials ? (
              <Image src={shopAvatar!} alt={shop.name} fill className="object-cover" unoptimized onError={() => setAvatarError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">{initials}</div>
            )}
          </div>
          <div className="pt-12 text-center">
            <h3 className="font-bold text-white text-lg truncate group-hover:text-purple-400 transition px-2">{shop.name}</h3>
            <p className="text-sm text-purple-400 font-medium">{shop.category}</p>
            {shop.bio && <p className="text-xs text-slate-400 mt-2 line-clamp-2 px-2">{shop.bio}</p>}
            <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Package className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-white">{shop.productCount || 0}</span> applications
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full" />
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-pink-400" />
                <span className="truncate max-w-[80px]">{shop.address?.split(",")[0] || "Global"}</span>
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
        setError(data.message || "Failed to fetch sellers");
      }
    } catch (err: any) {
      console.error("Error fetching sellers:", err);
      setError(err.response?.data?.message || "Failed to fetch sellers");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 md:pb-0">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-purple-400/30">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Discover Talented Developers</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Meet Our Developer Community
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Connect with verified developers and sellers offering production-ready applications
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search developers by name, category, or expertise..."
                  className="w-full pl-12 pr-24 py-4 rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg"
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
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700/50 p-4 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                  className="appearance-none bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="appearance-none bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Rating Filter */}
              <div className="relative">
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters((prev) => ({ ...prev, rating: parseFloat(e.target.value) }))}
                  className="appearance-none bg-slate-700/50 border border-slate-600 text-white rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="4.5">4.5+ Stars</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-slate-700/50 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-purple-600 shadow-lg text-white" : "text-slate-400 hover:text-white"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-purple-600 shadow-lg text-white" : "text-slate-400 hover:text-white"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-300">
              {shops.length > 0 ? (
                <>Showing <span className="font-semibold text-white">{shops.length}</span> sellers</>
              ) : (
                "No sellers found"
              )}
            </p>
            <button
              onClick={() => fetchShops(null, false)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
            <p className="text-slate-400">Loading sellers...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <div className="bg-red-500/20 text-red-300 px-6 py-4 rounded-2xl inline-block border border-red-500/30">
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

        {/* Sellers Grid/List */}
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
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more sellers...</span>
                </div>
              )}
              {!hasMore && shops.length > 0 && (
                <p className="text-slate-500 text-sm">You&apos;ve seen all sellers</p>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && shops.length === 0 && (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No sellers found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg"
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

