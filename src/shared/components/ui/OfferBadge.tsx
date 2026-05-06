"use client";

import React, { useState, useEffect } from "react";
import { Clock, Zap, Tag, Percent } from "lucide-react";

interface Offer {
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
}

interface OfferBadgeProps {
  offer: Offer | null;
  variant?: "card" | "detail" | "minimal";
  originalPrice?: number;
}

const OfferBadge: React.FC<OfferBadgeProps> = ({ offer, variant = "card", originalPrice }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!offer) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(offer.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [offer]);

  if (!offer) return null;

  const getDiscountLabel = () => {
    if (offer.discountType === "Percentage") {
      return `-${offer.discountValue}%`;
    } else if (offer.discountType === "FixedAmount") {
      return `${offer.discountValue.toLocaleString()} OFF`;
    } else if (offer.discountType === "BuyOneGetOne") {
      return "BOGO";
    }
    return "DEAL";
  };

  // Minimal variant - just the discount badge
  if (variant === "minimal") {
    return (
      <div className="absolute top-2 right-2 z-10">
        <span className={`px-2 py-1 text-xs font-bold rounded ${
          offer.isExpiringSoon ? "bg-red-600" : "bg-green-600"
        } text-white`}>
          {getDiscountLabel()}
        </span>
      </div>
    );
  }

  // Card variant - badge on product card
  if (variant === "card") {
    return (
      <div className="absolute top-0 left-0 right-0 z-10">
        {/* Main discount badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-lg ${
          offer.isExpiringSoon ? "bg-red-600 animate-pulse" : "bg-green-600"
        } text-white shadow-lg`}>
          {getDiscountLabel()}
        </div>

        {/* Flash deal indicator */}
        {offer.isExpiringSoon && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded-lg">
            <Zap size={12} />
            <span>Flash</span>
          </div>
        )}

        {/* Countdown timer bar */}
        {offer.hoursRemaining < 48 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600/90 to-orange-600/90 px-3 py-1.5 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Ends in {timeLeft}</span>
            </div>
            {offer.requiresCode && (
              <div className="flex items-center gap-1">
                <Tag size={12} />
                <span>Code needed</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Detail variant - full offer display for product detail page
  return (
    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {offer.isExpiringSoon ? (
            <Zap className="text-yellow-400" size={20} />
          ) : (
            <Percent className="text-green-400" size={20} />
          )}
          <span className="font-semibold text-green-400">{offer.title}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
          offer.isExpiringSoon ? "bg-red-600" : "bg-green-600"
        } text-white`}>
          {getDiscountLabel()}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          {originalPrice && (
            <div className="flex items-center gap-3">
              <span className="text-gray-400 line-through text-sm">
                UGX {originalPrice.toLocaleString()}
              </span>
              <span className="text-2xl font-bold text-green-400">
                UGX {offer.discountedPrice.toLocaleString()}
              </span>
            </div>
          )}
          <p className="text-sm text-yellow-400 mt-1">
            You save UGX {offer.discountAmount.toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 text-orange-400 text-sm">
            <Clock size={14} />
            <span>Ends in {timeLeft}</span>
          </div>
          {offer.requiresCode && (
            <p className="text-xs text-gray-400 mt-1">
              <Tag size={12} className="inline" /> Code required at checkout
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferBadge;

