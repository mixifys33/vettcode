"use client";
import React, { Suspense, useState, useCallback, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutList, Code2, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import {
  PriceRangeSlider,
  CategoryFilter,
  RatingFilter,
  SortDropdown,
  ActiveFilters,
} from "@/shared/components/filters";
import ProductGrid from "@/shared/components/product/ProductGrid";
import Pagination from "@/shared/components/product/Pagination";

const DEFAULT_PRICE_RANGE: [number, number] = [0, 5000000];
const ITEMS_PER_PAGE = 12;

interface ApplicationFilters {
  q?: string;
  category?: string;
  subCategory?: string;
  technologyStack?: string[];
  platforms?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  isFree?: boolean;
  verificationStatus?: string;
}

interface ApplicationSort {
  field: "price" | "rating" | "downloads" | "createdAt" | "views";
  order: "asc" | "desc";
}

// Extended tech stacks
const defaultTechStacks = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte", "Nuxt.js",
  "Node.js", "Express.js", "Fastify", "Koa.js",
  "Python", "Django", "Flask", "FastAPI",
  "PHP", "Laravel", "Symfony", "CodeIgniter",
  "Java", "Spring Boot", "Hibernate",
  "C#", ".NET Core", "ASP.NET",
  "Ruby", "Ruby on Rails",
  "Go", "Gin", "Echo",
  "Rust", "Actix", "Rocket",
  "MongoDB", "PostgreSQL", "MySQL", "SQLite", "Redis",
  "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure",
  "React Native", "Flutter", "Ionic", "Xamarin",
  "Electron", "Tauri", "Qt",
  "TypeScript", "JavaScript", "HTML5", "CSS3", "SASS/SCSS",
  "GraphQL", "REST API", "WebSocket", "gRPC"
];

const defaultPlatforms = [
  "Web", "Mobile", "Desktop", "iOS", "Android", "Cross-platform",
  "Windows", "macOS", "Linux", "Browser Extension", "PWA"
];

const ProductsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const [filters, setFilters] = useState<ApplicationFilters>(() => ({
    q: searchParams.get("q") || undefined,
    category: searchParams.get("category") || undefined,
    subCategory: searchParams.get("subCategory") || undefined,
    technologyStack: searchParams.get("technologyStack")?.split(",").filter(Boolean) || [],
    platforms: searchParams.get("platforms")?.split(",").filter(Boolean) || [],
    price_min: searchParams.get("price_min") ? Number(searchParams.get("price_min")) : undefined,
    price_max: searchParams.get("price_max") ? Number(searchParams.get("price_max")) : undefined,
    rating_min: searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined,
    isFree: searchParams.get("isFree") === "true" ? true : searchParams.get("isFree") === "false" ? false : undefined,
    verificationStatus: searchParams.get("verified") === "true" ? "verified" : undefined,
  }));

  const [sort, setSort] = useState<ApplicationSort | undefined>(() => {
    const sortBy = searchParams.get("sortBy") as ApplicationSort["field"] | null;
    const sortOrder = searchParams.get("sortOrder") as ApplicationSort["order"] | null;
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

  // Fetch ALL applications once and cache (reduces DB queries)
  const { data: allApplicationsData, isLoading } = useQuery({
    queryKey: ["all-applications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/applications?page=1&limit=1000");
      return res.data.applications || [];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["application-categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/applications/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const categories = useMemo(() => {
    if (!categoriesData?.categories) return [];
    return categoriesData.categories.map((cat: any) => ({
      name: cat.name,
      subCategories: cat.subCategories?.map((sub: string) => ({ name: sub })) || [],
    }));
  }, [categoriesData]);

  // CLIENT-SIDE FILTERING (reduces DB load)
  const filteredAndSortedApplications = useMemo(() => {
    if (!allApplicationsData) return [];

    let filtered = [...allApplicationsData];

    // Search filter
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filtered = filtered.filter((app: any) =>
        app.appName?.toLowerCase().includes(query) ||
        app.shortDescription?.toLowerCase().includes(query) ||
        app.detailedDescription?.toLowerCase().includes(query) ||
        app.tags?.toLowerCase().includes(query) ||
        app.appCategory?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((app: any) => app.appCategory === filters.category);
    }

    // SubCategory filter
    if (filters.subCategory) {
      filtered = filtered.filter((app: any) => app.subCategory === filters.subCategory);
    }

    // Technology Stack filter
    if (filters.technologyStack && filters.technologyStack.length > 0) {
      filtered = filtered.filter((app: any) => {
        const appTech = app.technologyStack || [];
        return filters.technologyStack!.some((tech) =>
          appTech.some((t: string) => t.toLowerCase().includes(tech.toLowerCase()))
        );
      });
    }

    // Platforms filter
    if (filters.platforms && filters.platforms.length > 0) {
      filtered = filtered.filter((app: any) => {
        const appPlatforms = app.supportedPlatforms || [];
        return filters.platforms!.some((platform) =>
          appPlatforms.some((p: string) => p.toLowerCase().includes(platform.toLowerCase()))
        );
      });
    }

    // Price range filter
    if (filters.price_min !== undefined || filters.price_max !== undefined) {
      filtered = filtered.filter((app: any) => {
        const price = app.price || 0;
        const min = filters.price_min ?? 0;
        const max = filters.price_max ?? Infinity;
        return price >= min && price <= max;
      });
    }

    // Free/Paid filter
    if (filters.isFree !== undefined) {
      filtered = filtered.filter((app: any) => {
        const isFree = app.isFree || app.price === 0;
        return filters.isFree ? isFree : !isFree;
      });
    }

    // Rating filter
    if (filters.rating_min !== undefined) {
      filtered = filtered.filter((app: any) => {
        const rating = app.rating || app.ratings || 0;
        return rating >= filters.rating_min!;
      });
    }

    // Verification status filter
    if (filters.verificationStatus) {
      filtered = filtered.filter((app: any) => app.verificationStatus === filters.verificationStatus);
    }

    // Sorting
    if (sort) {
      filtered.sort((a: any, b: any) => {
        let aVal, bVal;

        switch (sort.field) {
          case "price":
            aVal = a.price || 0;
            bVal = b.price || 0;
            break;
          case "rating":
            aVal = a.rating || a.ratings || 0;
            bVal = b.rating || b.ratings || 0;
            break;
          case "downloads":
            aVal = a.downloads || 0;
            bVal = b.downloads || 0;
            break;
          case "views":
            aVal = a.views || 0;
            bVal = b.views || 0;
            break;
          case "createdAt":
          default:
            aVal = new Date(a.createdAt || 0).getTime();
            bVal = new Date(b.createdAt || 0).getTime();
            break;
        }

        return sort.order === "asc" ? aVal - bVal : bVal - aVal;
      });
    } else {
      // Default sort by createdAt desc
      filtered.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      });
    }

    return filtered;
  }, [allApplicationsData, filters, sort]);

  // Pagination
  const paginatedApplications = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredAndSortedApplications.slice(start, end);
  }, [filteredAndSortedApplications, page]);

  const totalPages = Math.ceil(filteredAndSortedApplications.length / ITEMS_PER_PAGE);

  // Extract unique tech stacks and platforms from actual data
  const availableTechStacks = useMemo(() => {
    if (!allApplicationsData) return defaultTechStacks;
    const techSet = new Set<string>();
    allApplicationsData.forEach((app: any) => {
      if (app.technologyStack && Array.isArray(app.technologyStack)) {
        app.technologyStack.forEach((tech: string) => techSet.add(tech));
      }
    });
    const fromData = Array.from(techSet).sort();
    // Merge with defaults and remove duplicates
    return Array.from(new Set([...fromData, ...defaultTechStacks])).sort();
  }, [allApplicationsData]);

  const availablePlatforms = useMemo(() => {
    if (!allApplicationsData) return defaultPlatforms;
    const platformSet = new Set<string>();
    allApplicationsData.forEach((app: any) => {
      if (app.supportedPlatforms && Array.isArray(app.supportedPlatforms)) {
        app.supportedPlatforms.forEach((platform: string) => platformSet.add(platform));
      }
    });
    const fromData = Array.from(platformSet).sort();
    return Array.from(new Set([...fromData, ...defaultPlatforms])).sort();
  }, [allApplicationsData]);

  const dynamicPriceRange = useMemo((): [number, number] => {
    if (!allApplicationsData || allApplicationsData.length === 0) return DEFAULT_PRICE_RANGE;
    const prices = allApplicationsData.map((app: any) => app.price || 0).filter((p: number) => p > 0);
    if (prices.length === 0) return DEFAULT_PRICE_RANGE;
    return [Math.min(...prices), Math.max(...prices)];
  }, [allApplicationsData]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.subCategory) params.set("subCategory", filters.subCategory);
    if (filters.technologyStack && filters.technologyStack.length > 0) params.set("technologyStack", filters.technologyStack.join(","));
    if (filters.platforms && filters.platforms.length > 0) params.set("platforms", filters.platforms.join(","));
    if (filters.price_min !== undefined) params.set("price_min", String(filters.price_min));
    if (filters.price_max !== undefined) params.set("price_max", String(filters.price_max));
    if (filters.rating_min !== undefined) params.set("rating", String(filters.rating_min));
    if (filters.isFree !== undefined) params.set("isFree", String(filters.isFree));
    if (filters.verificationStatus) params.set("verified", "true");
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

  const handleTechStackChange = useCallback((techStack: string[]) => {
    setFilters((prev) => ({ ...prev, technologyStack: techStack }));
    setPage(1);
  }, []);

  const handlePlatformChange = useCallback((platforms: string[]) => {
    setFilters((prev) => ({ ...prev, platforms }));
    setPage(1);
  }, []);

  const handlePriceChange = useCallback((value: [number, number]) => {
    setPriceRange(value);
    setFilters((prev) => ({
      ...prev,
      price_min: value[0] > dynamicPriceRange[0] ? value[0] : undefined,
      price_max: value[1] < dynamicPriceRange[1] ? value[1] : undefined,
    }));
    setPage(1);
  }, [dynamicPriceRange]);

  const handleRatingChange = useCallback((rating: number | undefined) => {
    setFilters((prev) => ({ ...prev, rating_min: rating }));
    setPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: ApplicationSort | undefined) => {
    setSort(newSort);
    setPage(1);
  }, []);

  const handleRemoveFilter = useCallback((key: keyof ApplicationFilters, value?: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (key === "technologyStack" && value) {
        newFilters.technologyStack = prev.technologyStack?.filter((t) => t !== value);
      } else if (key === "platforms" && value) {
        newFilters.platforms = prev.platforms?.filter((p) => p !== value);
      } else if (key === "price_min") {
        newFilters.price_min = undefined;
        newFilters.price_max = undefined;
        setPriceRange(dynamicPriceRange);
      } else {
        (newFilters as any)[key] = undefined;
      }

      return newFilters;
    });
    setPage(1);
  }, [dynamicPriceRange]);

  const handleClearAllFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setPriceRange(dynamicPriceRange);
    setSort(undefined);
    setPage(1);
  }, [dynamicPriceRange]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.q ||
      filters.category ||
      filters.subCategory ||
      (filters.technologyStack && filters.technologyStack.length > 0) ||
      (filters.platforms && filters.platforms.length > 0) ||
      filters.price_min !== undefined ||
      filters.price_max !== undefined ||
      filters.rating_min !== undefined ||
      filters.isFree !== undefined ||
      filters.verificationStatus !== undefined
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

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Price Range Filter */}
      <PriceRangeSlider
        min={dynamicPriceRange[0]}
        max={dynamicPriceRange[1]}
        value={priceRange}
        onChange={handlePriceChange}
        currency="$"
      />

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Technology Stack Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Technology Stack</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {availableTechStacks.map((tech) => (
            <label key={tech} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.technologyStack?.includes(tech) || false}
                onChange={(e) => {
                  const newTechStack = e.target.checked
                    ? [...(filters.technologyStack || []), tech]
                    : filters.technologyStack?.filter((t) => t !== tech) || [];
                  handleTechStackChange(newTechStack);
                }}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {tech}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Platform Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Platforms</h3>
        <div className="space-y-2">
          {availablePlatforms.map((platform) => (
            <label key={platform} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.platforms?.includes(platform) || false}
                onChange={(e) => {
                  const newPlatforms = e.target.checked
                    ? [...(filters.platforms || []), platform]
                    : filters.platforms?.filter((p) => p !== platform) || [];
                  handlePlatformChange(newPlatforms);
                }}
                className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                {platform}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Free/Paid Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Pricing</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              checked={filters.isFree === undefined}
              onChange={() => {
                setFilters((prev) => ({ ...prev, isFree: undefined }));
                setPage(1);
              }}
              className="w-4 h-4 border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
              All Applications
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              checked={filters.isFree === true}
              onChange={() => {
                setFilters((prev) => ({ ...prev, isFree: true }));
                setPage(1);
              }}
              className="w-4 h-4 border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
              Free Only
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              checked={filters.isFree === false}
              onChange={() => {
                setFilters((prev) => ({ ...prev, isFree: false }));
                setPage(1);
              }}
              className="w-4 h-4 border-slate-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
              Paid Only
            </span>
          </label>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Verification Status */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.verificationStatus === "verified"}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, verificationStatus: e.target.checked ? "verified" : undefined }));
              setPage(1);
            }}
            className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            Verified Only
          </span>
        </label>
      </div>

      <hr className="border-slate-200 dark:border-slate-700" />

      {/* Rating Filter */}
      <RatingFilter
        selectedRating={filters.rating_min}
        onRatingChange={handleRatingChange}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] pb-20 md:pb-0">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Explore Applications</h1>
              <p className="text-purple-100 text-sm mt-1">Production-ready, verified applications for your projects</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search applications by name, category, or tech stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Results info & Sort */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {filteredAndSortedApplications.length > 0 ? (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{filteredAndSortedApplications.length}</span> applications found
                    </p>
                  </>
                ) : isLoading ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">Loading applications...</p>
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">No applications found</p>
                )}
              </div>

              {/* View Mode Toggle (Desktop) */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid" 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list" 
                      ? "bg-white dark:bg-slate-700 shadow-sm text-purple-600" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>
            </div>

            <SortDropdown value={sort} onChange={handleSortChange} mode="application" />
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
            <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 p-5 sticky top-36">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FiltersPanel />
            </div>
          </aside>

          {/* Application Grid */}
          <main className="flex-1 min-w-0">
            <ProductGrid products={paginatedApplications} isLoading={isLoading} />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />

          {/* Drawer */}
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white dark:bg-[#1e293b] shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-4">
              <FiltersPanel />
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-[#1e293b] border-t border-slate-200 dark:border-slate-700 p-4 flex gap-3">
              <button
                onClick={handleClearAllFilters}
                className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors shadow-lg"
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0f172a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Loading applications...</p>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
