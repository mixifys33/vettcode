import { useState, useEffect } from "react";
import axios from "axios";

interface ProductOffer {
  id: string;
  title: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  endDate: string;
  hoursRemaining: number;
  isExpiringSoon: boolean;
  discountedPrice: number;
  discountAmount: number;
  requiresCode: boolean;
  offerCode: string | null;
  minPurchaseAmount: number | null;
  minQuantity: number | null;
  userRedemptionLimit: number | null;
}

interface UseProductOfferResult {
  bestOffer: ProductOffer | null;
  allOffers: ProductOffer[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProductOffer(productId: string | undefined): UseProductOfferResult {
  const [bestOffer, setBestOffer] = useState<ProductOffer | null>(null);
  const [allOffers, setAllOffers] = useState<ProductOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = async () => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/offers/public/product/${productId}`
      );

      if (response.data.success) {
        setAllOffers(response.data.offers || []);
        setBestOffer(response.data.bestOffer || null);
      }
    } catch (err: any) {
      console.error("Failed to fetch product offers:", err);
      setError(err?.message || "Failed to fetch offers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [productId]);

  return {
    bestOffer,
    allOffers,
    isLoading,
    error,
    refetch: fetchOffers,
  };
}

// Hook to validate and apply offer code at checkout
interface ValidateCodeResult {
  isValid: boolean;
  offer: ProductOffer | null;
  error: string | null;
  isValidating: boolean;
  validate: (code: string, productIds: string[], userId?: string, cartTotal?: number) => Promise<void>;
}

export function useOfferCode(): ValidateCodeResult {
  const [isValid, setIsValid] = useState(false);
  const [offer, setOffer] = useState<ProductOffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validate = async (code: string, productIds: string[], userId?: string, cartTotal?: number) => {
    if (!code.trim()) {
      setError("Please enter a code");
      return;
    }

    setIsValidating(true);
    setError(null);
    setIsValid(false);
    setOffer(null);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/product/api/offers/public/validate-code`,
        { code: code.trim().toUpperCase(), productIds, userId, cartTotal }
      );

      if (response.data.success) {
        setIsValid(true);
        setOffer(response.data.offer);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid offer code");
      setIsValid(false);
      setOffer(null);
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValid,
    offer,
    error,
    isValidating,
    validate,
  };
}

// Calculate discounted price utility
export function calculateOfferPrice(originalPrice: number, offer: ProductOffer | null): {
  finalPrice: number;
  savings: number;
  discountDisplay: string;
} {
  if (!offer) {
    return { finalPrice: originalPrice, savings: 0, discountDisplay: "" };
  }

  let discount = 0;
  let discountDisplay = "";

  if (offer.discountType === "Percentage") {
    discount = (originalPrice * offer.discountValue) / 100;
    if (offer.maxDiscountAmount && discount > offer.maxDiscountAmount) {
      discount = offer.maxDiscountAmount;
    }
    discountDisplay = `-${offer.discountValue}%`;
  } else if (offer.discountType === "FixedAmount") {
    discount = offer.discountValue;
    discountDisplay = `UGX ${offer.discountValue.toLocaleString()} OFF`;
  } else if (offer.discountType === "BuyOneGetOne") {
    discount = originalPrice; // Second item free
    discountDisplay = "BOGO";
  }

  const finalPrice = Math.max(0, originalPrice - discount);
  return { finalPrice, savings: discount, discountDisplay };
}

export default useProductOffer;

