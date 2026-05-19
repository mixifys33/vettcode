"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import {
  CurrencyCode,
  CurrencyConfig,
  DEFAULT_CURRENCY,
  BASE_CURRENCY,
  getCurrencyConfig,
  getCurrencyList,
  isCurrencySupported,
  ExchangeRate,
} from "./currency.config";
import {
  formatPrice,
  formatPriceCompact,
  convertFromUGX,
  convertToUGX,
  getPriceDisplay,
  PriceDisplay,
} from "./currency.utils";

// ============================================
// TYPES
// ============================================

interface CurrencyContextValue {
  currency: CurrencyCode;
  currencyConfig: CurrencyConfig;
  exchangeRates: Record<string, ExchangeRate> | null;
  ratesLoading: boolean;
  ratesError: string | null;
  isStale: boolean;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  refreshRates: () => Promise<void>;
  detectAndSetCurrency: (countryCode: string, city?: string) => Promise<void>;
  formatPrice: (amountUGX: number) => string;
  formatPriceCompact: (amountUGX: number) => string;
  formatPriceInCurrency: (amount: number, currencyCode: CurrencyCode) => string;
  convertFromUGX: (amountUGX: number) => number;
  convertToUGX: (amount: number, fromCurrency: CurrencyCode) => number;
  getPriceDisplay: (amountUGX: number) => PriceDisplay;
  getSupportedCurrencies: () => CurrencyConfig[];
  isCurrencySupported: (code: string) => boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const currency: CurrencyCode = DEFAULT_CURRENCY;
  const currencyConfig = getCurrencyConfig(currency);

  const setCurrency = useCallback(async (_currency: CurrencyCode) => {
    // Marketplace display is USD-only for now
  }, []);

  const refreshRates = useCallback(async () => {
    // No-op: USD base, no live conversion required on browse/checkout
  }, []);

  const detectAndSetCurrency = useCallback(async (_countryCode: string, _city?: string) => {
    // No-op: always USD for VettCode
  }, []);

  const formatPriceHelper = useCallback(
    (amount: number) => formatPrice(amount, currency),
    [currency]
  );

  const formatPriceCompactHelper = useCallback(
    (amount: number) => formatPriceCompact(amount, currency),
    [currency]
  );

  const formatPriceInCurrency = useCallback(
    (amount: number, currencyCode: CurrencyCode) => formatPrice(amount, currencyCode),
    []
  );

  const convertFromUGXHelper = useCallback(
    (amountUGX: number) => convertFromUGX(amountUGX, currency),
    [currency]
  );

  const convertToUGXHelper = useCallback(
    (amount: number, fromCurrency: CurrencyCode) => convertToUGX(amount, fromCurrency),
    []
  );

  const getPriceDisplayHelper = useCallback(
    (amountUGX: number) => getPriceDisplay(amountUGX, currency),
    [currency]
  );

  const getSupportedCurrencies = useCallback(() => getCurrencyList(), []);
  const isCurrencySupportedHelper = useCallback((code: string) => isCurrencySupported(code), []);

  const contextValue: CurrencyContextValue = useMemo(
    () => ({
      currency,
      currencyConfig,
      exchangeRates: null,
      ratesLoading: false,
      ratesError: null,
      isStale: false,
      setCurrency,
      refreshRates,
      detectAndSetCurrency,
      formatPrice: formatPriceHelper,
      formatPriceCompact: formatPriceCompactHelper,
      formatPriceInCurrency,
      convertFromUGX: convertFromUGXHelper,
      convertToUGX: convertToUGXHelper,
      getPriceDisplay: getPriceDisplayHelper,
      getSupportedCurrencies,
      isCurrencySupported: isCurrencySupportedHelper,
    }),
    [
      currency,
      currencyConfig,
      setCurrency,
      refreshRates,
      detectAndSetCurrency,
      formatPriceHelper,
      formatPriceCompactHelper,
      formatPriceInCurrency,
      convertFromUGXHelper,
      convertToUGXHelper,
      getPriceDisplayHelper,
      getSupportedCurrencies,
      isCurrencySupportedHelper,
    ]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useCurrency(): CurrencyContextValue {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

export default CurrencyContext;

