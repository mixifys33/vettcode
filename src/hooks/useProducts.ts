import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import { ProductFilters, ProductSort, ProductsResponse } from "@/types/product";

interface UseProductsOptions {
  filters?: ProductFilters;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { filters = {}, sort, page = 1, limit = 12 } = options;

  const queryKey = ["products", filters, sort, page, limit];

  const fetchProducts = async (): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (filters.q)          params.append("q", filters.q);
    if (filters.category)   params.append("category", filters.category);
    if (filters.subCategory) params.append("subCategory", filters.subCategory);
    if (filters.brand)      params.append("brand", filters.brand);
    if (filters.colors?.length)  params.append("colors", filters.colors.join(","));
    if (filters.sizes?.length)   params.append("sizes", filters.sizes.join(","));
    if (filters.price_min !== undefined) params.append("price_gte", String(filters.price_min));
    if (filters.price_max !== undefined) params.append("price_lte", String(filters.price_max));
    if (filters.rating_min !== undefined) params.append("rating_gte", String(filters.rating_min));

    if (sort) {
      params.append("sortBy", sort.field);
      params.append("sortOrder", sort.order);
    }

    const res = await axiosInstance.get(`/api/products?${params.toString()}`);
    return res.data;
  };

  return useQuery({
    queryKey,
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/applications/categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });
};

