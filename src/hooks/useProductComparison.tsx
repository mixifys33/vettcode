"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

interface CompareProduct {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  salePrice?: number;
  category: string;
  brand?: string;
  ratings: number;
  stock: number;
  shopName: string;
  specifications?: Record<string, string>;
  colors?: string[];
  sizes?: string[];
  warranty?: string;
}

interface ComparisonContextType {
  compareList: CompareProduct[];
  addToCompare: (product: CompareProduct) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  canAddMore: boolean;
  maxItems: number;
}

const STORAGE_KEY = "product_comparison";
const MAX_COMPARE_ITEMS = 4;

const ComparisonContext = createContext<ComparisonContextType | null>(null);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<CompareProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCompareList(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading comparison list:", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
      } catch (error) {
        console.error("Error saving comparison list:", error);
      }
    }
  }, [compareList, isLoaded]);

  const addToCompare = useCallback((product: CompareProduct): boolean => {
    if (compareList.length >= MAX_COMPARE_ITEMS) {
      return false;
    }
    if (compareList.some((p) => p.id === product.id)) {
      return false;
    }
    setCompareList((prev) => [...prev, product]);
    return true;
  }, [compareList]);

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback(
    (productId: string) => compareList.some((p) => p.id === productId),
    [compareList]
  );

  const value: ComparisonContextType = {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    canAddMore: compareList.length < MAX_COMPARE_ITEMS,
    maxItems: MAX_COMPARE_ITEMS,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useProductComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useProductComparison must be used within ComparisonProvider");
  }
  return context;
}

export default useProductComparison;

