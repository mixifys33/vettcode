/**
 * Currency Module for vettcode Frontend
 *
 * This module provides comprehensive currency handling including:
 * - Currency formatting for display
 * - Price conversion between currencies
 * - User currency preference management
 * - GeoIP-based currency auto-detection
 * - React context and hooks for currency state
 *
 * Base Currency: USD — VettCode application prices are stored and shown in USD.
 */

// ============================================
// CONFIGURATION EXPORTS
// ============================================

export {
  SUPPORTED_CURRENCIES,
  BASE_CURRENCY,
  DEFAULT_CURRENCY,
  CURRENCY_STORAGE_KEYS,
  COUNTRY_TO_CURRENCY,
  getCurrencyConfig,
  isCurrencySupported,
  getCurrencyForCountry,
  getCurrencyList,
} from "./currency.config";

// Export types from config
export type {
  CurrencyCode,
  CurrencyConfig,
  ExchangeRate,
  ConvertedPrice,
  CurrencyRatesResponse,
  SupportedCurrenciesResponse,
  ConvertResponse,
} from "./currency.config";

// ============================================
// UTILITY EXPORTS
// ============================================

export {
  // Formatting
  formatMoney,
  formatPrice,
  formatPriceCompact,
  formatNumber,
  getCurrencySymbol,
  formatPriceRange,
  formatDiscount,
  calculateSavings,

  // Conversion
  convertFromUGX,
  convertToUGX,
  convertAndFormat,

  // Rounding
  roundAmount,
  roundForCurrency,

  // Parsing
  parseFormattedPrice,

  // User preference
  getUserCurrency,
  setUserCurrency,
  clearUserCurrency,

  // Exchange rates storage
  getStoredExchangeRates,
  storeExchangeRates,
  getExchangeRate,

  // Validation
  areRatesStale,
  isValidPrice,

  // Display helpers
  getPriceDisplay,
} from "./currency.utils";

// Export types from utils
export type { PriceDisplay } from "./currency.utils";

// ============================================
// REACT CONTEXT EXPORTS
// ============================================

export {
  CurrencyProvider,
  useCurrency,
  default as CurrencyContext,
} from "./CurrencyContext";

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

import { formatPrice as formatPriceFn, convertFromUGX as convertFromUGXFn } from "./currency.utils";
import { CurrencyCode, DEFAULT_CURRENCY } from "./currency.config";

/**
 * Quick helper to format a price from base currency (USD) to display currency
 * @param amount - Amount in base currency (USD)
 * @param currency - Target currency code (defaults to USD)
 * @returns Formatted price string
 *
 * @example
 * formatUGXPrice(99, "USD") // "$99.00"
 */
export function formatUGXPrice(
  amountUGX: number,
  currency: CurrencyCode = DEFAULT_CURRENCY
): string {
  const converted = convertFromUGXFn(amountUGX, currency);
  return formatPriceFn(converted, currency);
}

/**
 * Quick helper to get just the numeric converted value
 * @param amountUGX - Amount in UGX (base currency)
 * @param currency - Target currency code
 * @returns Converted numeric amount
 *
 * @example
 * getConvertedPrice(500000, "USD") // 135
 */
export function getConvertedPrice(
  amountUGX: number,
  currency: CurrencyCode = DEFAULT_CURRENCY
): number {
  return convertFromUGXFn(amountUGX, currency);
}

