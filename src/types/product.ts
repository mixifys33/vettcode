export interface ProductImage {
  id: string;
  file_id: string;
  url: string;
}

export interface Shop {
  id: string;
  name: string;
  ratings: number;
  address?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory: string;
  description: string;
  detailed_description?: string;
  images: ProductImage[];
  video_url?: string;
  tags: string[];
  brand?: string;
  colors: string[];
  sizes: string[];
  stock: number;
  sale_price: number;
  regular_price: number;
  totalSales: number;
  ratings: number;
  warranty?: string;
  custom_specifications?: Record<string, any>;
  customProperties?: Record<string, any>;
  cash_on_delivery?: string;
  createdAt: string;
  updatedAt: string;
  Shop?: Shop;
  shops?: Shop;
}

export interface ProductFilters {
  category?: string;
  subCategory?: string;
  brand?: string;
  colors?: string[];
  sizes?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  q?: string;
}

export interface ProductSort {
  field: 'price' | 'createdAt' | 'totalSales' | 'ratings';
  order: 'asc' | 'desc';
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  facets?: {
    categories: { name: string; count: number }[];
    brands: { name: string; count: number }[];
    colors: { name: string; count: number }[];
    sizes: { name: string; count: number }[];
    priceRange: { min: number; max: number };
  };
}

