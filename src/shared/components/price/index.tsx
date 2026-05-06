"use client";

import React, { useMemo } from "react";
import { useCurrency } from "../../../utils/currency";
import { CurrencyCode } from "../../../utils/currency/currency.config";

// ============================================
// TYPES
// ============================================

interface PriceProps {
  /** Amount in UGX (base currency) - this is the stored price */
  amount: number;
  /** Original/regular price in UGX for showing discounts */
  originalAmount?: number;
  /** Override the user's currency preference */
  currency?: CurrencyCode;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Show discount badge */
  showDiscount?: boolean;
  /** Show savings text */
  showSavings?: boolean;
  /** Use compact notation for large numbers */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** CSS classes for the main price */
  priceClassName?: string;
  /** CSS classes for the original price (strikethrough) */
  originalPriceClassName?: string;
  /** CSS classes for the discount badge */
  discountClassName?: string;
  /** Layout direction */
  layout?: "horizontal" | "vertical";
}

interface PriceDisplayProps {
  /** Amount in UGX (base currency) */
  amount: number;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Use compact notation */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================
// SIZE CONFIGURATIONS
// ============================================

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-2xl",
};

const originalPriceSizeClasses = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

const discountBadgeSizeClasses = {
  xs: "text-[9px] px-1 py-0.5",
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2 py-0.5",
  lg: "text-sm px-2 py-1",
  xl: "text-base px-3 py-1",
};

// ============================================
// SIMPLE PRICE DISPLAY COMPONENT
// ============================================

/**
 * Simple price display - just shows the formatted price
 */
export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  size = "md",
  compact = false,
  className = "",
}) => {
  const { formatPrice, formatPriceCompact } = useCurrency();

  const formattedPrice = useMemo(() => {
    if (compact) {
      return formatPriceCompact(amount);
    }
    return formatPrice(amount);
  }, [amount, compact, formatPrice, formatPriceCompact]);

  return (
    <span className={`font-semibold ${sizeClasses[size]} ${className}`}>
      {formattedPrice}
    </span>
  );
};

// ============================================
// MAIN PRICE COMPONENT
// ============================================

/**
 * Full-featured Price component with discount display
 *
 * @example
 * // Basic usage
 * <Price amount={500000} />
 *
 * @example
 * // With discount
 * <Price amount={400000} originalAmount={500000} showDiscount />
 *
 * @example
 * // Large size with savings
 * <Price amount={400000} originalAmount={500000} size="lg" showSavings />
 */
const Price: React.FC<PriceProps> = ({
  amount,
  originalAmount,
  currency,
  size = "md",
  showDiscount = false,
  showSavings = false,
  compact = false,
  className = "",
  priceClassName = "",
  originalPriceClassName = "",
  discountClassName = "",
  layout = "horizontal",
}) => {
  const {
    formatPrice,
    formatPriceCompact,
    currency: userCurrency,
    convertFromUGX,
  } = useCurrency();

  // Calculate discount percentage
  const discountPercent = useMemo(() => {
    if (!originalAmount || originalAmount <= amount) return 0;
    return Math.round(((originalAmount - amount) / originalAmount) * 100);
  }, [amount, originalAmount]);

  // Calculate savings
  const savings = useMemo(() => {
    if (!originalAmount || originalAmount <= amount) return 0;
    return originalAmount - amount;
  }, [amount, originalAmount]);

  // Format prices
  const formattedPrice = useMemo(() => {
    const formatter = compact ? formatPriceCompact : formatPrice;
    return formatter(amount);
  }, [amount, compact, formatPrice, formatPriceCompact]);

  const formattedOriginalPrice = useMemo(() => {
    if (!originalAmount) return null;
    const formatter = compact ? formatPriceCompact : formatPrice;
    return formatter(originalAmount);
  }, [originalAmount, compact, formatPrice, formatPriceCompact]);

  const formattedSavings = useMemo(() => {
    if (!savings) return null;
    return formatPrice(savings);
  }, [savings, formatPrice]);

  // Has discount?
  const hasDiscount = originalAmount && originalAmount > amount;

  // Layout classes
  const layoutClasses =
    layout === "vertical"
      ? "flex flex-col items-start gap-1"
      : "flex flex-wrap items-center gap-2";

  return (
    <div className={`${layoutClasses} ${className}`}>
      {/* Main Price */}
      <span
        className={`font-bold text-gray-900 ${sizeClasses[size]} ${priceClassName}`}
      >
        {formattedPrice}
      </span>

      {/* Original Price (strikethrough) */}
      {hasDiscount && formattedOriginalPrice && (
        <span
          className={`line-through text-gray-400 ${originalPriceSizeClasses[size]} ${originalPriceClassName}`}
        >
          {formattedOriginalPrice}
        </span>
      )}

      {/* Discount Badge */}
      {hasDiscount && showDiscount && discountPercent > 0 && (
        <span
          className={`bg-red-500 text-white font-semibold rounded ${discountBadgeSizeClasses[size]} ${discountClassName}`}
        >
          -{discountPercent}%
        </span>
      )}

      {/* Savings Text */}
      {hasDiscount && showSavings && formattedSavings && (
        <span
          className={`text-green-600 font-medium ${originalPriceSizeClasses[size]}`}
        >
          Save {formattedSavings}
        </span>
      )}
    </div>
  );
};

// ============================================
// PRICE RANGE COMPONENT
// ============================================

interface PriceRangeProps {
  /** Minimum price in UGX */
  minAmount: number;
  /** Maximum price in UGX */
  maxAmount: number;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Display a price range (e.g., "UGX 10,000 - UGX 50,000")
 */
export const PriceRange: React.FC<PriceRangeProps> = ({
  minAmount,
  maxAmount,
  size = "md",
  className = "",
}) => {
  const { formatPrice } = useCurrency();

  const formattedMin = useMemo(() => formatPrice(minAmount), [minAmount, formatPrice]);
  const formattedMax = useMemo(() => formatPrice(maxAmount), [maxAmount, formatPrice]);

  // If min and max are the same, just show one price
  if (minAmount === maxAmount) {
    return (
      <span className={`font-semibold ${sizeClasses[size]} ${className}`}>
        {formattedMin}
      </span>
    );
  }

  return (
    <span className={`font-semibold ${sizeClasses[size]} ${className}`}>
      {formattedMin} - {formattedMax}
    </span>
  );
};

// ============================================
// PRICE WITH LABEL COMPONENT
// ============================================

interface PriceWithLabelProps {
  /** Label text */
  label: string;
  /** Amount in UGX */
  amount: number;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Display a price with a label (e.g., "Subtotal: UGX 500,000")
 */
export const PriceWithLabel: React.FC<PriceWithLabelProps> = ({
  label,
  amount,
  size = "md",
  className = "",
}) => {
  const { formatPrice } = useCurrency();

  const formattedPrice = useMemo(() => formatPrice(amount), [amount, formatPrice]);

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className={`text-gray-600 ${sizeClasses[size]}`}>{label}</span>
      <span className={`font-semibold text-gray-900 ${sizeClasses[size]}`}>
        {formattedPrice}
      </span>
    </div>
  );
};

// ============================================
// FREE PRICE COMPONENT
// ============================================

interface FreePriceProps {
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Additional CSS classes */
  className?: string;
}

/**
 * Display "Free" text for zero-price items
 */
export const FreePrice: React.FC<FreePriceProps> = ({
  size = "md",
  className = "",
}) => {
  return (
    <span
      className={`font-bold text-green-600 ${sizeClasses[size]} ${className}`}
    >
      Free
    </span>
  );
};

// ============================================
// SMART PRICE COMPONENT
// ============================================

interface SmartPriceProps extends Omit<PriceProps, "amount"> {
  /** Amount in UGX - if 0 or undefined, shows "Free" */
  amount?: number;
}

/**
 * Smart price that handles zero/undefined amounts by showing "Free"
 */
export const SmartPrice: React.FC<SmartPriceProps> = ({
  amount,
  size = "md",
  className = "",
  ...props
}) => {
  if (!amount || amount === 0) {
    return <FreePrice size={size} className={className} />;
  }

  return <Price amount={amount} size={size} className={className} {...props} />;
};

// ============================================
// EXPORTS
// ============================================

export default Price;

