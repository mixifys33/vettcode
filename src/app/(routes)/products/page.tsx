"use client";
import React, { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutList } from "lucide-react";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { ProductFilters, ProductSort } from "@/types/product";
import {
  PriceRangeSlider,
  CategoryFilter,
  BrandFilter,
  ColorFilter,
  SizeFilter,
  RatingFilter,
  SortDropdown,
  ActiveFilters,
} from "@/shared/components/filters";
import ProductGrid from "@/shared/components/product/ProductGrid";
import Pagination from "@/shared/components/product/Pagination";

const DEFAULT_PRICE_RANGE: [number, number] = [0, 5000000];
const ITEMS_PER_PAGE = 12;

// Fallback data for filters (used when API doesn't return facets)
const defaultBrands = [
  { name: "Samsung", count: 45 },
  { name: "Apple", count: 38 },
  { name: "HP", count: 32 },
  { name: "Lenovo", count: 28 },
  { name: "Dell", count: 25 },
  { name: "Sony", count: 22 },
  { name: "LG", count: 18 },
  { name: "Nike", count: 15 },
  { name: "Adidas", count: 12 },
];

const defaultColors = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", 
  "Orange", "Purple", "Pink", "Gray", "Brown", "Navy", "Gold", "Silver"
];

const defaultSizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40", "42"];

const ProductsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const [filters, setFilters] = useState<ProductFilters>(() => ({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    subCategory: searchParams.get("subCategory") || undefined,
    brand: searchParams.get("brand") || undefined,
    colors: searchParams.get("colors")?.split(",").filter(Boolean) || [],
    sizes: searchParams.get("sizes")?.split(",").filter(Boolean) || [],
    price_min: searchParams.get("price_min") ? Number(searchParams.get("price_min")) : undefined,
    price_max: searchParams.get("price_max") ? Number(searchParams.get("price_max")) : undefined,
    rating_min: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
  }));

  const [sort, setSort] = useState<ProductSort | undefined>(() => {
    const sortBy = searchParams.get("sortBy") as ProductSort["field"] | null;
    const sortOrder = searchParams.get("sortOrder") as ProductSort["order"] | null;
    if (sortBy && sortOrder) {
      return { field: sortBy, order: sortOrder };
    }
    return undefined;
  });

  const [page, setPage] = useState(() => {
    return Number(searchParams.get("page")) || 1;
  });

  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.price_min ?? DEFAULT_PRICE_RANGE[0],
    filters.price_max ?? DEFAULT_PRICE_RANGE[1],
  ]);

  const [searchQuery, setSearchQuery] = useState(filters.q || "");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch products with React Query
  const { data, isLoading, isFetching } = useProducts({
    filters,
    sort,
    page,
    limit: ITEMS_PER_PAGE,
  });

  // Fetch categories
  const { data: categoriesData } = useCategories();

  const categories = useMemo(() => {
    if (!categoriesData?.categories) return [];
    return categoriesData.categories.map((cat: string) => ({
      name: cat,
      subCategories: categoriesData.subCategories?.[cat]?.map((sub: string) => ({ name: sub })) || [],
    }));
  }, [categoriesData]);

  // Use facets from API or fallback to defaults
  const availableBrands = useMemo(() => {
    if (data?.facets?.brands && data.facets.brands.length > 0) {
      return data.facets.brands;
    }
    return defaultBrands;
  }, [data?.facets?.brands]);

  const availableColors = useMemo((): string[] => {
    if (data?.facets?.colors && data.facets.colors.length > 0) {
      return data.facets.colors.map((c: any) => typeof c === 'string' ? c : c.name);
    }
    return defaultColors;
  }, [data?.facets?.colors]);

  const availableSizes = useMemo((): string[] => {
    if (data?.facets?.sizes && data.facets.sizes.length > 0) {
      return data.facets.sizes.map((s: any) => typeof s === 'string' ? s : s.name);
    }
    return defaultSizes;
  }, [data?.facets?.sizes]);

  const dynamicPriceRange = useMemo((): [number, number] => {
    if (data?.facets?.priceRange) {
      return [data.facets.priceRange.min || 0, data.facets.priceRange.max || DEFAULT_PRICE_RANGE[1]];
    }
    return DEFAULT_PRICE_RANGE;
  }, [data?.facets?.priceRange]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.subCategory) params.set("subCategory", filters.subCategory);
    if (filters.brand) params.set("brand", filters.brand);
    if (filters.colors && filters.colors.length > 0) params.set("colors", filters.colors.join(","));
    if (filters.sizes && filters.sizes.length > 0) params.set("sizes", filters.sizes.join(","));
    if (filters.price_min !== undefined) params.set("price_min", String(filters.price_min));
    if (filters.price_max !== undefined) params.set("price_max", String(filters.price_max));
    if (filters.rating_min !== undefined) params.set("rating", String(filters.rating_min));
    if (sort) {
      params.set("sortBy", sort.field);
      params.set("sortOrder", sort.order);
    }
    if (page > 1) params.set("page", String(page));

    const queryString = params.toString();
    router.replace(`/products${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }, [filters, sort, page, router]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.q) {
        setFilters((prev) => ({ ...prev, q: searchQuery || undefined }));
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters.q]);

  // Filter handlers
  const handleCategoryChange = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category: category || undefined, subCategory: undefined }));
    setPage(1);
  }, []);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setFilters((prev) => ({ ...prev, subCategory: subCategory || undefined }));
    setPage(1);
  }, []);

  const handleBrandChange = useCallback((brand: string) => {
    setFilters((prev) => ({ ...prev, brand: brand || undefined }));
    setPage(1);
  }, []);

  const handleColorChange = useCallback((colors: string[]) => {
    setFilters((prev) => ({ ...prev, colors }));
    setPage(1);
  }, []);

  const handleSizeChange = useCallback((sizes: string[]) => {
    setFilters((prev) => ({ ...prev, sizes }));
    setPage(1);
  }, []);

  const handlePriceChange = useCallback((value: [number, number]) => {
    setPriceRange(value);
    setFilters((prev) => ({
      ...prev,
      price_min: value[0] > DEFAULT_PRICE_RANGE[0] ? value[0] : undefined,
      price_max: value[1] < DEFAULT_PRICE_RANGE[1] ? value[1] : undefined,
    }));
    setPage(1);
  }, []);

  const handleRatingChange = useCallback((rating: number | undefined) => {
    setFilters((prev) => ({ ...prev, rating_min: rating }));
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: ProductSort | undefined) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof ProductFilters, value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (key === "colors" && value) {
        newFilters.colors = prev.colors?.filter((c) => c !== value);
      } else if (key === "sizes" && value) {
        newFilters.sizes = prev.sizes?.filter((s) => s !== value);
      } else if (key === "price_min") {
        newFilters.price_min = undefined;
        newFilters.price_max = undefined;
        setPriceRange(DEFAULT_PRICE_RANGE);
      } else {
        (newFilters as any)[key] = undefined;
      }

      return newFilters;
    });
    setPage(1);
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setPriceRange(DEFAULT_PRICE_RANGE);
    setSort(undefined);
    setPage(1);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.q ||
      filters.category ||
      filters.subCategory ||
      filters.brand ||
      (filters.colors && filters.colors.length > 0) ||
      (filters.sizes && filters.sizes.length > 0) ||
      filters.price_min !== undefined ||
      filters.price_max !== undefined ||
      filters.rating_min !== undefined
    );
  }, [filters]);

  // Sidebar filters component
  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={filters.category || ""}
        selectedSubCategory={filters.subCategory}
        onCategoryChange={handleCategoryChange}
        onSubCategoryChange={handleSubCategoryChange}
      />

      <hr className="border-gray-200" />

      {/* Price Range Filter */}
      <PriceRangeSlider
        min={dynamicPriceRange[0]}
        max={dynamicPriceRange[1]}
        value={priceRange}
        onChange={handlePriceChange}
        /// currency is dynamic and curence or default currency should be got from user locaton got from user tracking in platform so that even when user is not logged in hiis currency is used not foriegn and all products prices will be imediately converted to that currency
        currency="$"// default for now since we havent added the above 
      />

      <hr className="border-gray-200" />

      {/* Brand Filter */}
      <BrandFilter
        brands={availableBrands}
        selectedBrand={filters.brand || ""}
        onBrandChange={handleBrandChange}
      />

      <hr className="border-gray-200" />

      {/* Color Filter */}
      <ColorFilter
        colors={availableColors}
        selectedColors={filters.colors || []}
        onColorChange={handleColorChange}
      />

      <hr className="border-gray-200" />

      {/* Size Filter */}
      <SizeFilter
        sizes={availableSizes}
        selectedSizes={filters.sizes || []}
        onSizeChange={handleSizeChange}
      />

      <hr className="border-gray-200" />

      {/* Rating Filter */}
      <RatingFilter
        selectedRating={filters.rating_min}
        onRatingChange={handleRatingChange}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#115061] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Results info & Sort */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {data?.pagination?.total ? (
                  <>
                    <span className="font-semibold">{data.pagination.total}</span> products found
                  </>
                ) : isLoading ? (
                  "Loading..."
                ) : (
                  "No products found"
                )}
              </p>

              {/* View Mode Toggle (Desktop) */}
              <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-white/50"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-white/50"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <SortDropdown value={sort} onChange={handleSortChange} />
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-36">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FiltersPanel />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {/* Loading overlay */}
            <div className={`transition-opacity duration-200 ${isFetching && !isLoading ? "opacity-60" : ""}`}>
              <ProductGrid products={data?.products || []} isLoading={isLoading} />
            </div>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={data.pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <FiltersPanel />
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex gap-3">
              <button
                onClick={handleClearAllFilters}
                className="flex-1 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-[#115061] text-white rounded-lg text-sm font-medium hover:bg-[#0d3f4d]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#115061]/20 border-t-[#115061] rounded-full animate-spin" /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}

