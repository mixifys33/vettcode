"use client";
import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, Code2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ProductCard from "@/shared/components/cards/Product-card";
import ScaleLoader from "@/shared/components/loading/ScaleLoader";

const ITEMS_PER_PAGE = 12;

const ApplicationsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [isFree, setIsFree] = useState(searchParams.get("filter") === "free");

  // Fetch applications
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["applications", searchQuery, category, page, isFree],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));
      
      if (searchQuery) params.set("search", searchQuery);
      if (category) params.set("category", category);
      if (isFree) params.set("isFree", "true");
      
      const res = await axiosInstance.get(`/api/applications?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category) params.set("category", category);
    if (page > 1) params.set("page", String(page));
    if (isFree) params.set("filter", "free");

    const queryString = params.toString();
    router.replace(`/applications${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [searchQuery, category, page, isFree, router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const applications = data?.applications || [];
  const pagination = data?.pagination || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-purple-900/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Applications Marketplace
              </h1>
              <p className="text-sm text-white/60 font-medium">Verified codebases for developers</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search applications, categories, developers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
            <button
              onClick={() => setIsFree(!isFree)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                isFree
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1.5" />
              Free Apps
            </button>
            
            {["Web Apps", "Mobile Apps", "SaaS", "APIs", "Templates"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(category === cat ? "" : cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  category === cat
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results info */}
          <div className="mt-4">
            <p className="text-sm text-white/60">
              {pagination?.total ? (
                <>
                  <span className="font-semibold text-white">{pagination.total}</span> applications found
                </>
              ) : isLoading ? (
                "Loading..."
              ) : (
                "No applications found"
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {isLoading && (
          <ScaleLoader message="Discovering amazing codebases..." />
        )}

        {/* Applications Grid */}
        {!isLoading && applications.length > 0 && (
          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
            {applications.map((app: any) => (
              <ProductCard key={app._id || app.id} product={app} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-3xl bg-white/5 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 border border-white/10">
              <Code2 className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No applications found</h3>
            <p className="text-white/60 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategory("");
                setIsFree(false);
                setPage(1);
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors border border-white/10"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors border ${
                      page === pageNum
                        ? "bg-purple-600 text-white border-purple-500"
                        : "bg-white/10 text-white/70 hover:bg-white/20 border-white/10"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors border border-white/10"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<ScaleLoader fullScreen message="Loading applications marketplace..." />}>
      <ApplicationsPageContent />
    </Suspense>
  );
}

