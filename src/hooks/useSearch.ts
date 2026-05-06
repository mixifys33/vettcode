import { useState, useCallback, useRef } from "react";
import axiosInstance from "@/utils/axiosInstance";

export interface ProductHit {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  subCategory: string;
  tags: string[];
  brand: string | null;
  colors: string[];
  sizes: string[];
  sale_price: number;
  regular_price: number;
  discount_percentage: number;
  stock: number;
  ratings: number;
  totalSales: number;
  shopId: string;
  shopName: string;
  shopRating: number;
  imageUrl: string | null;
  priceRange: string;
  stockStatus: string;
}

export interface SearchResult {
  hits: ProductHit[];
  totalHits: number;
  page: number;
  totalPages: number;
  processingTimeMs: number;
  facetDistribution?: Record<string, Record<string, number>>;
  query: string;
  suggestions?: string[];
}

export interface SearchFilters {
  category?: string;
  subCategory?: string;
  brand?: string;
  colors?: string[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  priceRange?: string;
  inStock?: boolean;
  minRating?: number;
  shopId?: string;
  hasDiscount?: boolean;
}

export type SortOption = "relevance" | "price_asc" | "price_desc" | "newest" | "popular" | "rating";

interface UseSearchOptions {
  initialQuery?: string;
  initialFilters?: SearchFilters;
  initialSort?: SortOption;
  limit?: number;
}

export const useSearch = (options: UseSearchOptions = {}) => {
  const { initialQuery = "", initialFilters = {}, initialSort = "relevance", limit = 20 } = options;

  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (
    searchQuery?: string,
    searchFilters?: SearchFilters,
    searchSort?: SortOption,
    searchPage?: number
  ) => {
    const q = searchQuery ?? query;
    const f = searchFilters ?? filters;
    const s = searchSort ?? sort;
    const p = searchPage ?? page;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, any> = {
        q,
        page: p,
        limit,
      };

      // Map sort option to backend params
      const sortMap: Record<SortOption, { sortBy: string; sortOrder: string }> = {
        relevance:  { sortBy: "createdAt", sortOrder: "desc" },
        price_asc:  { sortBy: "price",     sortOrder: "asc"  },
        price_desc: { sortBy: "price",     sortOrder: "desc" },
        newest:     { sortBy: "createdAt", sortOrder: "desc" },
        popular:    { sortBy: "stock",     sortOrder: "desc" },
        rating:     { sortBy: "createdAt", sortOrder: "desc" },
      };
      const { sortBy, sortOrder } = sortMap[s] || sortMap.relevance;
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;

      // Add filters
      if (f.category)    params.category = f.category;
      if (f.subCategory) params.subCategory = f.subCategory;
      if (f.brand)       params.brand = f.brand;
      if (f.colors?.length) params.colors = f.colors.join(",");
      if (f.sizes?.length)  params.sizes = f.sizes.join(",");
      if (f.priceMin !== undefined) params.price_gte = f.priceMin;
      if (f.priceMax !== undefined) params.price_lte = f.priceMax;
      if (f.minRating)   params.rating_gte = f.minRating;
      if (f.shopId)      params.sellerId = f.shopId;

      const { data } = await axiosInstance.get("/api/products", {
        params,
        signal: abortControllerRef.current.signal,
      });

      // Normalize response to SearchResult shape
      const normalized: SearchResult = {
        hits: (data.products || []).map((p: any) => ({
          ...p,
          id: p.id || p._id?.toString(),
          sale_price: p.sale_price ?? p.salePrice,
          regular_price: p.regular_price ?? p.regularPrice,
          imageUrl: p.imageUrl || p.images?.[0]?.url || null,
          shopId: p.Shop?.id || p.shopId || p.sellerId,
          shopName: p.Shop?.name || p.shopName || '',
        })),
        totalHits: data.total || data.count || 0,
        page: data.page || p,
        totalPages: data.totalPages || 1,
        processingTimeMs: 0,
        query: q,
      };
      setResults(normalized);
      return normalized;
    } catch (err: any) {
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
        return null;
      }
      const message = err.response?.data?.message || err.message || "Search failed";
      setError(message);
      console.error("[Search] Error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [query, filters, sort, page, limit]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const updateSort = useCallback((newSort: SortOption) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    if (results && page < results.totalPages) {
      setPage(prev => prev + 1);
    }
  }, [results, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && (!results || newPage <= results.totalPages)) {
      setPage(newPage);
    }
  }, [results]);

  return {
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
    nextPage,
    prevPage,
    goToPage,
    setPage,
  };
};

// Hook for autocomplete suggestions
export const useAutocomplete = () => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return [];
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      const { data } = await axiosInstance.get("/api/products", {
        params: { q: query, limit: 8 },
        signal: abortControllerRef.current.signal,
      });

      const results = (data?.products || []).map((p: any) => p.title).filter(Boolean);
      setSuggestions(results);
      return results;
    } catch (err: any) {
      if (err.name === "AbortError" || err.code === "ERR_CANCELED") {
        return suggestions;
      }
      console.error("[Autocomplete] Error:", err);
      setSuggestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [suggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loading,
    fetchSuggestions,
    clearSuggestions,
  };
};

// Hook for trending/popular data
export const useTrending = () => {
  const [popularSearches, setPopularSearches] = useState<{ query: string; count: number }[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPopularSearches = useCallback(async (limit = 10) => {
    // No dedicated endpoint — return empty (not critical)
    setPopularSearches([]);
    return [];
  }, []);

  const fetchTrendingProducts = useCallback(async (limit = 12) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/api/products", {
        params: { limit, sortBy: "stock", sortOrder: "desc" },
      });
      setTrendingProducts(data?.products || []);
      return data?.products || [];
    } catch (err) {
      console.error("[Trending] Failed to fetch trending products:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    popularSearches,
    trendingProducts,
    loading,
    fetchPopularSearches,
    fetchTrendingProducts,
  };
};

// Hook for related products
export const useRelatedProducts = (productId: string) => {
  const [products, setProducts] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRelated = useCallback(async (limit = 8) => {
    if (!productId) return [];

    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/api/products/${productId}/related`, {
        params: { limit },
      });
      setProducts(data?.products || []);
      return data?.products || [];
    } catch (err) {
      console.error("[Related] Failed to fetch related products:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return {
    products,
    loading,
    fetchRelated,
  };
};

export default useSearch;

