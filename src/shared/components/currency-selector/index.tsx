"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Globe, RefreshCw } from "lucide-react";
import { useCurrency } from "../../../utils/currency";
import { CurrencyCode, CurrencyConfig } from "../../../utils/currency/currency.config";

interface CurrencySelectorProps {
  variant?: "default" | "compact" | "minimal";
  showFlag?: boolean;
  showName?: boolean;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  variant = "default",
  showFlag = true,
  showName = true,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    currency,
    currencyConfig,
    setCurrency,
    getSupportedCurrencies,
    ratesLoading,
    isStale,
    refreshRates,
  } = useCurrency();

  const currencies = getSupportedCurrencies();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const handleSelect = async (currencyCode: CurrencyCode) => {
    await setCurrency(currencyCode);
    setIsOpen(false);
  };

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await refreshRates();
  };

  // Get flag emoji for currency
  const getFlag = (config: CurrencyConfig): string => {
    return (config as any).flag || "🌐";
  };

  // Render different variants
  const renderTrigger = () => {
    switch (variant) {
      case "compact":
        return (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors ${className}`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            {showFlag && <span className="text-sm">{getFlag(currencyConfig)}</span>}
            <span className="text-sm font-medium">{currency}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        );

      case "minimal":
        return (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <Globe size={16} />
            <span className="text-sm font-medium">{currency}</span>
            <ChevronDown
              size={12}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        );

      default:
        return (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all ${className}`}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            {showFlag && <span className="text-lg">{getFlag(currencyConfig)}</span>}
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-800">{currency}</span>
              {showName && (
                <span className="text-xs text-gray-500">{currencyConfig.name}</span>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`ml-1 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {renderTrigger()}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">Select Currency</h3>
              <button
                onClick={handleRefresh}
                disabled={ratesLoading}
                className="p-1 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                title="Refresh exchange rates"
              >
                <RefreshCw
                  size={14}
                  className={`text-gray-500 ${ratesLoading ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            {isStale && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Exchange rates may be outdated
              </p>
            )}
          </div>

          {/* Currency List */}
          <div className="max-h-72 overflow-y-auto">
            {currencies.map((config) => {
              const isSelected = config.code === currency;
              return (
                <button
                  key={config.code}
                  onClick={() => handleSelect(config.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {/* Flag */}
                  <span className="text-lg">{getFlag(config)}</span>

                  {/* Currency Info */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">
                        {config.code}
                      </span>
                      <span className="text-xs text-gray-400">{config.symbol}</span>
                    </div>
                    <span className="text-xs text-gray-500">{config.name}</span>
                  </div>

                  {/* Selected Check */}
                  {isSelected && (
                    <Check size={16} className="text-blue-600 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Prices shown in {currencyConfig.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;

