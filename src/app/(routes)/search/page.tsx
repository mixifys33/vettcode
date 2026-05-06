"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from "lucide-react";
import useSearch, { SearchFilters, SortOption, useTrending } from "@/hooks/useSearch";
import ProductCard from "@/shared/components/cards/Product-card";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

const PRICE_RANGES = [
  { label: "Under 50K", value: "Under 50K" },
  { label: "50K - 100K", value: "50K - 100K" },
  { label: "100K - 250K", value: "100K - 250K" },
  { label: "250K - 500K", value: "250K - 500K" },
  { label: "500K - 1M", value: "500K - 1M" },
  { label: "Above 1M", value: "Above 1M" },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const initialCategory = searchParams.get("category") || "";

  const {
    query,
    filters,
    sort,
    page,
    results,
    loading,
    error,
    search,
    updateQuery,
    updateFilters,
    clearFilters,
    updateSort,
    goToPage,
  } = useSearch({
    initialQuery,
    initialFilters: initialCategory ? { category: initialCategory } : {},
  });

  const { popularSearches, trendingProducts, fetchPopularSearches, fetchTrendingProducts } = useTrending();
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(initialQuery);

  // Fetch results on mount and when params change
  useEffect(() => {
    search(initialQuery, initialCategory ? { category: initialCategory } : filters, sort, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, initialCategory, page, sort]);

  // Fetch trending data when no query
  useEffect(() => {
    if (!initialQuery) {
      fetchPopularSearches();
      fetchTrendingProducts();
    }
  }, [initialQuery, fetchPopularSearches, fetchTrendingProducts]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      updateQuery(trimmed);
      search(trimmed, filters, sort, 1);
    }
  }, [searchInput, filters, sort, router, updateQuery, search]);

  const handleFilterChange = useCallback((newFilters: Partial<SearchFilters>) => {
    updateFilters(newFilters);
    search(query, { ...filters, ...newFilters }, sort, 1);
  }, [query, filters, sort, updateFilters, search]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    updateSort(newSort);
    search(query, filters, newSort, 1);
  }, [query, filters, updateSort, search]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
    search(query, {}, sort, 1);
  }, [query, sort, clearFilters, search]);

  const handlePageChange = useCallback((newPage: number) => {
    goToPage(newPage);
    search(query, filters, sort, newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [query, filters, sort, goToPage, search]);

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== undefined && v !== null && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for products..."
              className="w-full rounded-lg border border-gray-300 py-3 pl-4 pr-12 text-lg focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-blue-500 p-2 text-white hover:bg-blue-600"
            >
              <Search size={20} />
            </button>
          </div>
        </form>

        {/* Results Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            {results && (
              <p className="text-gray-600">
                {results.totalHits > 0 ? (
                  <>
                    <span className="font-semibold">{results.totalHits.toLocaleString()}</span> results
                    {query && <> for "<span className="font-semibold">{query}</span>"</>}
                    <span className="text-sm text-gray-400 ml-2">
                      ({results.processingTimeMs}ms)
                    </span>
                  </>
                ) : (
                  query && <>No results found for "<span className="font-semibold">{query}</span>"</>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-blue-500 px-1.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {/* Category Filter */}
              {results?.facetDistribution?.category && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) => handleFilterChange({ category: e.target.value || undefined })}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">All Categories</option>
                    {Object.entries(results.facetDistribution.category).map(([cat, count]) => (
                      <option key={cat} value={cat}>
                        {cat} ({count})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand Filter */}
              {results?.facetDistribution?.brand && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                  <select
                    value={filters.brand || ""}
                    onChange={(e) => handleFilterChange({ brand: e.target.value || undefined })}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">All Brands</option>
                    {Object.entries(results.facetDistribution.brand).map(([brand, count]) => (
                      <option key={brand} value={brand}>
                        {brand} ({count})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Range Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price Range</label>
                <select
                  value={filters.priceRange || ""}
                  onChange={(e) => handleFilterChange({ priceRange: e.target.value || undefined })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="">Any Price</option>
                  {PRICE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Filter */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={(e) => handleFilterChange({ inStock: e.target.checked || undefined })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  In Stock Only
                </label>
              </div>

              {/* Discount Filter */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.hasDiscount || false}
                    onChange={(e) => handleFilterChange({ hasDiscount: e.target.checked || undefined })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  On Sale
                </label>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Min Rating</label>
                <select
                  value={filters.minRating || ""}
                  onChange={(e) => handleFilterChange({ minRating: e.target.value ? parseFloat(e.target.value) : undefined })}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>
            </div>

            {/* Active Filters Tags */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    {filters.category}
                    <button onClick={() => handleFilterChange({ category: undefined })}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.brand && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    {filters.brand}
                    <button onClick={() => handleFilterChange({ brand: undefined })}>
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filters.priceRange && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    {filters.priceRange}
                    <button onClick={() => handleFilterChange({ priceRange: undefined })}>
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {/* Results Grid */}
        {!loading && results && results.hits.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.hits.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                    sale_price: product.sale_price,
                    regular_price: product.regular_price,
                    images: product.imageUrl ? [{ url: product.imageUrl }] : [],
                    ratings: product.ratings,
                    category: product.category,
                    stock: product.stock,
                    Shop: {
                      id: product.shopId,
                      name: product.shopName,
                    },
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {results.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>

                {Array.from({ length: Math.min(5, results.totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (results.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= results.totalPages - 2) {
                    pageNum = results.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`min-w-[40px] rounded-lg border px-3 py-2 ${
                        page === pageNum
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === results.totalPages}
                  className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results - Show Trending */}
        {!loading && results && results.hits.length === 0 && (
          <div className="py-12 text-center">
            <p className="mb-4 text-lg text-gray-600">No products found</p>
            {results.suggestions && results.suggestions.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-500">Did you mean:</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {results.suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setSearchInput(suggestion);
                        router.push(`/search?q=${encodeURIComponent(suggestion)}`);
                      }}
                      className="rounded-full border border-blue-300 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State - Show Popular Searches */}
        {!loading && !query && (
          <div className="space-y-8">
            {/* Popular Searches */}
            {popularSearches.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Popular Searches</h2>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item) => (
                    <button
                      key={item.query}
                      onClick={() => {
                        setSearchInput(item.query);
                        router.push(`/search?q=${encodeURIComponent(item.query)}`);
                      }}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm hover:border-blue-400 hover:bg-blue-50"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Products */}
            {trendingProducts.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Trending Products</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {trendingProducts.slice(0, 12).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={{
                        id: product.id,
                        title: product.title,
                        slug: product.slug,
                        sale_price: product.sale_price,
                        regular_price: product.regular_price,
                        images: product.imageUrl ? [{ url: product.imageUrl }] : [],
                        ratings: product.ratings,
                        category: product.category,
                        stock: product.stock,
                        Shop: {
                          id: product.shopId,
                          name: product.shopName,
                        },
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}

