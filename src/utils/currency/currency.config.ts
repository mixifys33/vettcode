/**
 * Currency Configuration for vettcode Frontend
 *
 * This file contains all supported currencies, their configurations,
 * and default settings for the currency system on the frontend.
 *
 * Base Currency: UGX (Ugandan Shilling)
 * All prices are stored in UGX and converted at display time.
 */

// Supported currency codes
export type CurrencyCode =
  | "UGX" // Ugandan Shilling (Base Currency)
  | "USD" // US Dollar
  | "EUR" // Euro
  | "GBP" // British Pound
  | "KES" // Kenyan Shilling
  | "TZS" // Tanzanian Shilling
  | "RWF" // Rwandan Franc
  | "NGN" // Nigerian Naira
  | "ZAR" // South African Rand
  | "INR" // Indian Rupee
  | "CNY" // Chinese Yuan
  | "JPY" // Japanese Yen
  | "AED" // UAE Dirham
  | "SAR" // Saudi Riyal
  | "CAD" // Canadian Dollar
  | "AUD"; // Australian Dollar

// Currency configuration interface
export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  symbolPosition: "before" | "after";
  decimals: number;
  locale: string;
  thousandsSeparator: string;
  decimalSeparator: string;
  flag?: string; // Emoji flag for display
}

// All supported currencies configuration
export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  UGX: {
    code: "UGX",
    name: "Ugandan Shilling",
    symbol: "UGX",
    symbolPosition: "before",
    decimals: 0,
    locale: "en-UG",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇺🇬",
  },
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    symbolPosition: "before",
    decimals: 2,
    locale: "en-US",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇺🇸",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    symbolPosition: "after",
    decimals: 2,
    locale: "de-DE",
    thousandsSeparator: ".",
    decimalSeparator: ",",
    flag: "🇪🇺",
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    symbolPosition: "before",
    decimals: 2,
    locale: "en-GB",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇬🇧",
  },
  KES: {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    symbolPosition: "before",
    decimals: 0,
    locale: "sw-KE",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇰🇪",
  },
  TZS: {
    code: "TZS",
    name: "Tanzanian Shilling",
    symbol: "TSh",
    symbolPosition: "before",
    decimals: 0,
    locale: "sw-TZ",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇹🇿",
  },
  RWF: {
    code: "RWF",
    name: "Rwandan Franc",
    symbol: "FRw",
    symbolPosition: "before",
    decimals: 0,
    locale: "rw-RW",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇷🇼",
  },
  NGN: {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    symbolPosition: "before",
    decimals: 2,
    locale: "en-NG",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇳🇬",
  },
  ZAR: {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    symbolPosition: "before",
    decimals: 2,
    locale: "en-ZA",
    thousandsSeparator: " ",
    decimalSeparator: ",",
    flag: "🇿🇦",
  },
  INR: {
    code: "INR",
    name: "Indian Rupee",
    symbol: "₹",
    symbolPosition: "before",
    decimals: 2,
    locale: "en-IN",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇮🇳",
  },
  CNY: {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    symbolPosition: "before",
    decimals: 2,
    locale: "zh-CN",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇨🇳",
  },
  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    symbolPosition: "before",
    decimals: 0,
    locale: "ja-JP",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇯🇵",
  },
  AED: {
    code: "AED",
    name: "UAE Dirham",
    symbol: "AED",
    symbolPosition: "before",
    decimals: 2,
    locale: "ar-AE",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇦🇪",
  },
  SAR: {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "SAR",
    symbolPosition: "before",
    decimals: 2,
    locale: "ar-SA",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇸🇦",
  },
  CAD: {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "CA$",
    symbolPosition: "before",
    decimals: 2,
    locale: "en-CA",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇨🇦",
  },
  AUD: {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    symbolPosition: "before",
    decimals: 2,
    locale: "en-AU",
    thousandsSeparator: ",",
    decimalSeparator: ".",
    flag: "🇦🇺",
  },
};

// Base currency constant
export const BASE_CURRENCY: CurrencyCode = "UGX";

// Default currency for fallback
export const DEFAULT_CURRENCY: CurrencyCode = "UGX";

// Local storage keys
export const CURRENCY_STORAGE_KEYS = {
  userCurrency: "easy_shop_currency",
  exchangeRates: "easy_shop_exchange_rates",
  lastRatesUpdate: "easy_shop_rates_updated",
  detectedCountry: "easy_shop_detected_country",
};

// Country to currency mapping for auto-detection
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  UG: "UGX",
  US: "USD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
  GR: "EUR",
  GB: "GBP",
  UK: "GBP",
  KE: "KES",
  TZ: "TZS",
  RW: "RWF",
  NG: "NGN",
  ZA: "ZAR",
  IN: "INR",
  CN: "CNY",
  JP: "JPY",
  AE: "AED",
  SA: "SAR",
  CA: "CAD",
  AU: "AUD",
  EC: "USD",
  SV: "USD",
  PA: "USD",
  PR: "USD",
};

// Get currency config by code
export const getCurrencyConfig = (code: CurrencyCode): CurrencyConfig => {
  return SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES[DEFAULT_CURRENCY];
};

// Check if currency is supported
export const isCurrencySupported = (code: string): code is CurrencyCode => {
  return code in SUPPORTED_CURRENCIES;
};

// Get currency for country (for auto-detection)
export const getCurrencyForCountry = (countryCode: string): CurrencyCode => {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
};

// Get all active currencies as array (for dropdowns)
export const getCurrencyList = (): CurrencyConfig[] => {
  return Object.values(SUPPORTED_CURRENCIES);
};

// Exchange rate interface
export interface ExchangeRate {
  currency: CurrencyCode;
  rateToUGX: number;
  rateFromUGX: number;
  lastUpdated: string;
}

// Converted price result interface
export interface ConvertedPrice {
  originalAmount: number;
  originalCurrency: CurrencyCode;
  convertedAmount: number;
  targetCurrency: CurrencyCode;
  formattedPrice: string;
  rate: number;
}

// API response interfaces
export interface CurrencyRatesResponse {
  success: boolean;
  data: {
    rates: Record<string, ExchangeRate>;
    baseCurrency: CurrencyCode;
    lastUpdated: string;
    source: string;
    isStale: boolean;
  };
  message?: string;
}

export interface SupportedCurrenciesResponse {
  success: boolean;
  data: {
    currencies: Array<{
      code: CurrencyCode;
      name: string;
      symbol: string;
      decimals: number;
      locale: string;
      isBase: boolean;
    }>;
    baseCurrency: CurrencyCode;
    defaultCurrency: CurrencyCode;
    count: number;
  };
}

export interface ConvertResponse {
  success: boolean;
  data: {
    originalAmount: number;
    originalCurrency: CurrencyCode;
    convertedAmount: number;
    targetCurrency: CurrencyCode;
    formattedPrice: string;
    rate: number;
  };
}

export default SUPPORTED_CURRENCIES;
