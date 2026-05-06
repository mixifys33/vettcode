"use client";

import { useState, useEffect, useCallback } from "react";

interface RecentlyViewedProduct {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  salePrice?: number;
  category: string;
  shopName: string;
  viewedAt: number;
}

const STORAGE_KEY = "recently_viewed_products";
const MAX_ITEMS = 20;

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter(
          (item: RecentlyViewedProduct) => item.viewedAt > thirtyDaysAgo
        );
        setRecentlyViewed(filtered);
      }
    } catch (error) {
      console.error("Error loading recently viewed:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentlyViewed));
      } catch (error) {
        console.error("Error saving recently viewed:", error);
      }
    }
  }, [recentlyViewed, isLoaded]);

  const addProduct = useCallback((product: {
    id: string;
    slug: string;
    title: string;
    images?: { url: string }[];
    sale_price?: number;
    regular_price?: number;
    category?: string;
    shops?: { name: string };
  }) => {
    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== product.id);
      
      // Add to beginning
      const newItem: RecentlyViewedProduct = {
        id: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images?.[0]?.url || "",
        price: product.regular_price || 0,
        salePrice: product.sale_price,
        category: product.category || "",
        shopName: product.shops?.name || "",
        viewedAt: Date.now(),
      };

      // Keep only MAX_ITEMS
      return [newItem, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setRecentlyViewed((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearAll = useCallback(() => {
    setRecentlyViewed([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentlyViewed,
    addProduct,
    removeProduct,
    clearAll,
    isLoaded,
  };
}

export default useRecentlyViewed;

