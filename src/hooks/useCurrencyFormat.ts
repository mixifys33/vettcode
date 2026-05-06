/**
 * useCurrencyFormat Hook
 *
 * A convenient hook for formatting prices in components.
 * This hook provides memoized formatting functions that automatically
 * use the user's selected currency preference.
 *
 * @example
 * const { format, formatCompact, formatRange } = useCurrencyFormat();
 *
 * // Format a price
 * <span>{format(500000)}</span> // "UGX 500,000" or "$135.00" depending on user preference
 *
 * // Format with discount
 * <span>{format(400000)} <s>{format(500000)}</s></span>
 *
 * // Compact format for large numbers
 * <span>{formatCompact(1500000)}</span> // "UGX 1.5M" or "$405K"
 */

import { useCallback, useMemo } from "react";
import { useCurrency } from "../utils/currency";
import {
  CurrencyCode,
  BASE_CURRENCY,
  getCurrencyConfig,
} from "../utils/currency/currency.config";
import {
  formatPrice as formatPriceFn,
  formatPriceCompact as formatPriceCompactFn,
  formatPriceRange as formatPriceRangeFn,
  formatDiscount as formatDiscountFn,
  calculateSavings as calculateSavingsFn,
  convertFromUGX,
  roundForCurrency,
} from "../utils/currency/currency.utils";

// ============================================
// TYPES
// ============================================

interface UseCurrencyFormatReturn {
  /** Current user currency code */
  currency: CurrencyCode;

  /** Currency symbol (e.g., "$", "UGX", "€") */
  symbol: string;

  /** Format a price in UGX to user's currency */
  format: (amountUGX: number) => string;

  /** Format a price in UGX to user's currency (alias for format) */
  formatPrice: (amountUGX: number) => string;

  /** Format a price in compact notation (e.g., 1.5M, 2.3K) */
  formatCompact: (amountUGX: number) => string;

  /** Format a price range */
  formatRange: (minUGX: number, maxUGX: number) => string;

  /** Get discount percentage string (e.g., "-20%") */
  getDiscount: (originalUGX: number, saleUGX: number) => string;

  /** Get savings text (e.g., "Save UGX 100,000") */
  getSavings: (originalUGX: number, saleUGX: number) => string;

  /** Convert UGX amount to user's currency (raw number) */
  convert: (amountUGX: number) => number;

  /** Format a raw amount in the user's currency (no conversion) */
  formatRaw: (amount: number) => string;

  /** Check if rates are loading */
  isLoading: boolean;

  /** Check if rates are stale */
  isStale: boolean;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Hook for easy currency formatting in components
 *
 * All amounts passed to this hook should be in UGX (base currency).
 * The hook will automatically convert and format to the user's preferred currency.
 */
export function useCurrencyFormat(): UseCurrencyFormatReturn {
  const {
    currency,
    currencyConfig,
    ratesLoading,
    isStale,
    formatPrice: contextFormatPrice,
    formatPriceCompact: contextFormatCompact,
    convertFromUGX: contextConvert,
  } = useCurrency();

  // Get currency symbol
  const symbol = useMemo(() => currencyConfig.symbol, [currencyConfig]);

  // Format price (UGX to user currency)
  const format = useCallback(
    (amountUGX: number): string => {
      if (typeof amountUGX !== "number" || isNaN(amountUGX)) {
        return formatPriceFn(0, currency);
      }
      return contextFormatPrice(amountUGX);
    },
    [currency, contextFormatPrice]
  );

  // Format price in compact notation
  const formatCompact = useCallback(
    (amountUGX: number): string => {
      if (typeof amountUGX !== "number" || isNaN(amountUGX)) {
        return formatPriceCompactFn(0, currency);
      }
      return contextFormatCompact(amountUGX);
    },
    [currency, contextFormatCompact]
  );

  // Format price range
  const formatRange = useCallback(
    (minUGX: number, maxUGX: number): string => {
      const minConverted = convertFromUGX(minUGX, currency);
      const maxConverted = convertFromUGX(maxUGX, currency);

      if (minConverted === maxConverted) {
        return formatPriceFn(minConverted, currency);
      }

      return `${formatPriceFn(minConverted, currency)} - ${formatPriceFn(
        maxConverted,
        currency
      )}`;
    },
    [currency]
  );

  // Get discount percentage
  const getDiscount = useCallback(
    (originalUGX: number, saleUGX: number): string => {
      if (originalUGX <= 0 || saleUGX >= originalUGX) {
        return "";
      }
      const discount = Math.round(
        ((originalUGX - saleUGX) / originalUGX) * 100
      );
      return `-${discount}%`;
    },
    []
  );

  // Get savings text
  const getSavings = useCallback(
    (originalUGX: number, saleUGX: number): string => {
      if (originalUGX <= saleUGX) {
        return "";
      }
      const savingsUGX = originalUGX - saleUGX;
      const savingsConverted = convertFromUGX(savingsUGX, currency);
      return `Save ${formatPriceFn(savingsConverted, currency)}`;
    },
    [currency]
  );

  // Convert UGX to user currency (raw number)
  const convert = useCallback(
    (amountUGX: number): number => {
      if (typeof amountUGX !== "number" || isNaN(amountUGX)) {
        return 0;
      }
      return contextConvert(amountUGX);
    },
    [contextConvert]
  );

  // Format raw amount (no conversion)
  const formatRaw = useCallback(
    (amount: number): string => {
      if (typeof amount !== "number" || isNaN(amount)) {
        return formatPriceFn(0, currency);
      }
      return formatPriceFn(amount, currency);
    },
    [currency]
  );

  return {
    currency,
    symbol,
    format,
    formatPrice: format, // Alias for format
    formatCompact,
    formatRange,
    getDiscount,
    getSavings,
    convert,
    formatRaw,
    isLoading: ratesLoading,
    isStale,
  };
}

// ============================================
// STANDALONE FORMAT FUNCTIONS
// ============================================

/**
 * Format a price in UGX to a specific currency
 * Use this when you need to format without the context/hook
 *
 * @param amountUGX - Amount in UGX (base currency)
 * @param targetCurrency - Target currency code
 * @returns Formatted price string
 */
export function formatPriceUGX(
  amountUGX: number,
  targetCurrency: CurrencyCode = BASE_CURRENCY
): string {
  const converted = convertFromUGX(amountUGX, targetCurrency);
  return formatPriceFn(converted, targetCurrency);
}

/**
 * Format a price in UGX to a specific currency (compact)
 *
 * @param amountUGX - Amount in UGX (base currency)
 * @param targetCurrency - Target currency code
 * @returns Formatted price string in compact notation
 */
export function formatPriceUGXCompact(
  amountUGX: number,
  targetCurrency: CurrencyCode = BASE_CURRENCY
): string {
  const converted = convertFromUGX(amountUGX, targetCurrency);
  return formatPriceCompactFn(converted, targetCurrency);
}

// ============================================
// EXPORTS
// ============================================

export default useCurrencyFormat;

