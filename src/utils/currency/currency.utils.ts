/**
 * Currency Utilities for vettcode Frontend
 *
 * This file provides utility functions for:
 * - Formatting prices for display using Intl.NumberFormat
 * - Converting prices between currencies (client-side)
 * - Rounding amounts according to currency rules
 * - Parsing formatted prices back to numbers
 *
 * Base Currency: UGX (Worldwiden Shilling)
 */

import {
  CurrencyCode,
  CurrencyConfig,
  BASE_CURRENCY,
  DEFAULT_CURRENCY,
  getCurrencyConfig,
  isCurrencySupported,
  ExchangeRate,
  CURRENCY_STORAGE_KEYS,
} from "./currency.config";

// ============================================
// FALLBACK EXCHANGE RATES
// ============================================

// Fallback rates (UGX as base) - used when API rates aren't available
const FALLBACK_RATES: Record<string, { rateToUGX: number; rateFromUGX: number }> = {
  UGX: { rateToUGX: 1, rateFromUGX: 1 },
  USD: { rateToUGX: 3750, rateFromUGX: 1 / 3750 },
  EUR: { rateToUGX: 4050, rateFromUGX: 1 / 4050 },
  GBP: { rateToUGX: 4700, rateFromUGX: 1 / 4700 },
  KES: { rateToUGX: 29, rateFromUGX: 1 / 29 },
  TZS: { rateToUGX: 1.5, rateFromUGX: 1 / 1.5 },
  RWF: { rateToUGX: 3, rateFromUGX: 1 / 3 },
  NGN: { rateToUGX: 2.5, rateFromUGX: 1 / 2.5 },
  ZAR: { rateToUGX: 200, rateFromUGX: 1 / 200 },
  INR: { rateToUGX: 45, rateFromUGX: 1 / 45 },
  CNY: { rateToUGX: 520, rateFromUGX: 1 / 520 },
  JPY: { rateToUGX: 25, rateFromUGX: 1 / 25 },
  AED: { rateToUGX: 1020, rateFromUGX: 1 / 1020 },
  SAR: { rateToUGX: 1000, rateFromUGX: 1 / 1000 },
  CAD: { rateToUGX: 2750, rateFromUGX: 1 / 2750 },
  AUD: { rateToUGX: 2450, rateFromUGX: 1 / 2450 },
};

// ============================================
// PRICE FORMATTING
// ============================================

/**
 * Format a price for display using Intl.NumberFormat
 */
export function formatPrice(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY
): string {
  const config = getCurrencyConfig(currency);

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  } catch (error) {
    return formatPriceFallback(amount, config);
  }
}

function formatPriceFallback(amount: number, config: CurrencyConfig): string {
  const fixed = amount.toFixed(config.decimals);
  const [intPart, decPart] = fixed.split(".");
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
  const formattedNumber = decPart ? `${withSeparators}${config.decimalSeparator}${decPart}` : withSeparators;
  return config.symbolPosition === "before" ? `${config.symbol} ${formattedNumber}` : `${formattedNumber} ${config.symbol}`;
}

/**
 * Format a price with compact notation (e.g., 1.5M, 2.3K)
 */
export function formatPriceCompact(
  amount: number,
  currency: CurrencyCode = DEFAULT_CURRENCY
): string {
  const config = getCurrencyConfig(currency);

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(amount);
  } catch (error) {
    if (amount >= 1000000) return `${config.symbol}${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${config.symbol}${(amount / 1000).toFixed(1)}K`;
    return formatPrice(amount, currency);
  }
}

export function formatNumber(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  const config = getCurrencyConfig(currency);
  try {
    return new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  } catch (error) {
    return amount.toFixed(config.decimals);
  }
}

export function getCurrencySymbol(currency: CurrencyCode = DEFAULT_CURRENCY): string {
  return getCurrencyConfig(currency).symbol;
}


// ============================================
// PRICE CONVERSION (CLIENT-SIDE)
// ============================================

export function getStoredExchangeRates(): Record<string, ExchangeRate> | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEYS.exchangeRates);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to get stored exchange rates:", error);
  }
  return null;
}

export function storeExchangeRates(rates: Record<string, ExchangeRate>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEYS.exchangeRates, JSON.stringify(rates));
    localStorage.setItem(CURRENCY_STORAGE_KEYS.lastRatesUpdate, new Date().toISOString());
  } catch (error) {
    console.error("Failed to store exchange rates:", error);
  }
}

export function getExchangeRate(currency: CurrencyCode): ExchangeRate | null {
  // First try stored rates
  const rates = getStoredExchangeRates();
  if (rates && rates[currency]) {
    return rates[currency];
  }
  
  // Fall back to hardcoded rates
  const fallback = FALLBACK_RATES[currency];
  if (fallback) {
    return {
      currency,
      rateToUGX: fallback.rateToUGX,
      rateFromUGX: fallback.rateFromUGX,
      lastUpdated: new Date().toISOString(),
    };
  }
  
  return null;
}

/**
 * Convert amount from UGX to target currency
 */
export function convertFromUGX(amountUGX: number, targetCurrency: CurrencyCode): number {
  if (targetCurrency === BASE_CURRENCY) return amountUGX;

  const rate = getExchangeRate(targetCurrency);
  if (!rate) {
    console.warn(`No exchange rate found for ${targetCurrency}, returning UGX amount`);
    return amountUGX;
  }

  const converted = amountUGX * rate.rateFromUGX;
  return roundAmount(converted, getCurrencyConfig(targetCurrency).decimals);
}

/**
 * Convert amount to UGX from source currency
 */
export function convertToUGX(amount: number, sourceCurrency: CurrencyCode): number {
  if (sourceCurrency === BASE_CURRENCY) return amount;

  const rate = getExchangeRate(sourceCurrency);
  if (!rate) {
    console.warn(`No exchange rate found for ${sourceCurrency}, returning original amount`);
    return amount;
  }

  return Math.round(amount * rate.rateToUGX);
}

export function convertAndFormat(amountUGX: number, targetCurrency: CurrencyCode = DEFAULT_CURRENCY): string {
  const converted = convertFromUGX(amountUGX, targetCurrency);
  return formatPrice(converted, targetCurrency);
}


// ============================================
// ROUNDING UTILITIES
// ============================================

export function roundAmount(amount: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(amount * multiplier) / multiplier;
}

export function roundForCurrency(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): number {
  return roundAmount(amount, getCurrencyConfig(currency).decimals);
}

// ============================================
// PARSING UTILITIES
// ============================================

export function parseFormattedPrice(formattedPrice: string, currency: CurrencyCode = DEFAULT_CURRENCY): number {
  const config = getCurrencyConfig(currency);
  let cleaned = formattedPrice.replace(config.symbol, "").replace(/\s/g, "").trim();
  
  if (config.decimalSeparator === ",") {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else {
    cleaned = cleaned.replace(/,/g, "");
  }
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ============================================
// USER CURRENCY PREFERENCE
// ============================================

export function getUserCurrency(): CurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEYS.userCurrency);
    if (stored && isCurrencySupported(stored)) return stored as CurrencyCode;
  } catch (error) {
    console.error("Failed to get user currency:", error);
  }
  return DEFAULT_CURRENCY;
}

export function setUserCurrency(currency: CurrencyCode): void {
  if (typeof window === "undefined") return;
  try {
    if (isCurrencySupported(currency)) {
      localStorage.setItem(CURRENCY_STORAGE_KEYS.userCurrency, currency);
    }
  } catch (error) {
    console.error("Failed to set user currency:", error);
  }
}

export function clearUserCurrency(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CURRENCY_STORAGE_KEYS.userCurrency);
  } catch (error) {
    console.error("Failed to clear user currency:", error);
  }
}


// ============================================
// VALIDATION UTILITIES
// ============================================

export function areRatesStale(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const lastUpdate = localStorage.getItem(CURRENCY_STORAGE_KEYS.lastRatesUpdate);
    if (!lastUpdate) return true;
    const lastUpdateTime = new Date(lastUpdate).getTime();
    const staleThreshold = 48 * 60 * 60 * 1000; // 48 hours
    return Date.now() - lastUpdateTime > staleThreshold;
  } catch (error) {
    return true;
  }
}

export function isValidPrice(price: unknown): price is number {
  return typeof price === "number" && !isNaN(price) && price >= 0;
}

// ============================================
// DISPLAY UTILITIES
// ============================================

export interface PriceDisplay {
  formatted: string;
  rawValue: number;
  currency: CurrencyCode;
  symbol: string;
  originalUGX: number;
  rate: number;
}

export function getPriceDisplay(amountUGX: number, targetCurrency: CurrencyCode = DEFAULT_CURRENCY): PriceDisplay {
  const config = getCurrencyConfig(targetCurrency);
  const rate = getExchangeRate(targetCurrency);
  const converted = convertFromUGX(amountUGX, targetCurrency);

  return {
    formatted: formatPrice(converted, targetCurrency),
    rawValue: converted,
    currency: targetCurrency,
    symbol: config.symbol,
    originalUGX: amountUGX,
    rate: rate?.rateFromUGX || 1,
  };
}

export function formatPriceRange(minAmount: number, maxAmount: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  return `${formatPrice(minAmount, currency)} - ${formatPrice(maxAmount, currency)}`;
}

export function formatDiscount(originalPrice: number, salePrice: number): string {
  if (originalPrice <= 0 || salePrice >= originalPrice) return "";
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  return `-${discount}%`;
}

export function calculateSavings(originalPrice: number, salePrice: number, currency: CurrencyCode = DEFAULT_CURRENCY): string {
  if (originalPrice <= salePrice) return "";
  const savings = originalPrice - salePrice;
  return `Save ${formatPrice(savings, currency)}`;
}

export default {
  formatPrice,
  formatPriceCompact,
  formatNumber,
  getCurrencySymbol,
  convertFromUGX,
  convertToUGX,
  convertAndFormat,
  roundAmount,
  roundForCurrency,
  parseFormattedPrice,
  getUserCurrency,
  setUserCurrency,
  clearUserCurrency,
  areRatesStale,
  isValidPrice,
  getPriceDisplay,
  formatPriceRange,
  formatDiscount,
  calculateSavings,
  getStoredExchangeRates,
  storeExchangeRates,
  getExchangeRate,
};

