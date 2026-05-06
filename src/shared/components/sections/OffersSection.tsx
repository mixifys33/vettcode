"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Tag, Clock, ChevronLeft, ChevronRight, Percent, ArrowRight, Pause, Play, Gift } from "lucide-react";

interface Offer {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  banners: string[];
  schedule: { start: string; end: string };
  analytics?: { views: number; sales: number };
  rules?: { minDiscountPct: number };
}

interface OffersSectionProps {
  minOffersToShow?: number;
}

const OffersSection: React.FC<OffersSectionProps> = ({ minOffersToShow = 5 }) => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      // Fetch events that have discount offers
      const res = await fetch("/api/events/active");
      const data = await res.json();
      if (data.success && data.data) {
        // Filter events that have discounts (offers)
        const offersData = data.data.filter((e: Offer) => 
          e.rules?.minDiscountPct > 0 || 
          e.type === "flash_sale" || 
          e.type === "clearance" ||
          e.type === "coupon_festival"
        );
        setOffers(offersData);
      }
    } catch (error) {
      console.error("Failed to fetch offers", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
  }, [offers.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
  }, [offers.length]);

  // Auto-scroll
  useEffect(() => {
    if (isPaused || offers.length <= 1) return;
    const interval = setInterval(nextSlide, 4500);
    return () => clearInterval(interval);
  }, [isPaused, offers.length, nextSlide]);

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return { text: "Ended", urgent: false };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return { text: `${days}d ${hours}h`, urgent: days < 2 };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, urgent: true };
    return { text: `${minutes}m`, urgent: true };
  };

  // Don't render if less than minimum offers
  if (loading || offers.length < minOffersToShow) return null;

  const currentOffer = offers[currentIndex];
  const timeLeft = getTimeRemaining(currentOffer?.schedule?.end);

  return (
    <section className="w-full py-6 sm:py-8 md:py-10 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Special Offers</h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Exclusive discounts just for you</p>
            </div>
          </div>
          <Link
            href="/offers"
            className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium text-red-600 hover:text-red-700 transition"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
          {/* Main Banner */}
          <Link href={`/events/${currentOffer?.slug}`} className="block">
            <div className="relative h-[180px] sm:h-[250px] md:h-[320px] lg:h-[380px]">
              {currentOffer?.banners?.[0] ? (
                <img
                  src={currentOffer.banners[0]}
                  alt={currentOffer.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500">
                  <Tag className="w-16 h-16 sm:w-24 sm:h-24 text-white/50" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-12">
                <div className="max-w-xl">
                  {/* Discount Badge */}
                  {currentOffer?.rules?.minDiscountPct > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-400 text-yellow-900 rounded-full mb-3 sm:mb-4 animate-bounce">
                      <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-lg font-bold">
                        UP TO {currentOffer.rules.minDiscountPct}% OFF
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 line-clamp-2">
                    {currentOffer?.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 line-clamp-2 hidden sm:block">
                    {currentOffer?.description}
                  </p>

                  {/* CTA & Timer */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-gray-900 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-gray-100 transition shadow-lg">
                      Shop Now →
                    </span>
                    
                    <div className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl ${
                      timeLeft.urgent ? "bg-red-600 animate-pulse" : "bg-white/20 backdrop-blur-sm"
                    }`}>
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      <span className="text-sm sm:text-base font-semibold text-white">
                        Ends in {timeLeft.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation Arrows */}
          {offers.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
              </button>
            </>
          )}

          {/* Dots & Controls */}
          {offers.length > 1 && (
            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-20 flex items-center gap-2">
              <button
                onClick={(e) => { e.preventDefault(); setIsPaused(!isPaused); }}
                className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                {isPaused ? (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                ) : (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                )}
              </button>
              <div className="flex gap-1.5">
                {offers.slice(0, 8).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      idx === currentIndex ? "w-6 sm:w-8 bg-white" : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Offer Cards Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
          {offers.slice(0, 5).map((offer, idx) => {
            const offerTimeLeft = getTimeRemaining(offer.schedule?.end);
            return (
              <Link
                key={offer._id}
                href={`/events/${offer.slug}`}
                onClick={() => setCurrentIndex(idx)}
                className={`relative rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 group/card ${
                  idx === currentIndex ? "ring-2 ring-red-500 ring-offset-2" : "hover:shadow-lg"
                }`}
              >
                <div className="aspect-[4/3] relative">
                  {offer.banners?.[0] ? (
                    <img src={offer.banners[0]} alt="" className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-red-400 to-orange-400" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {/* Discount Badge */}
                  {offer.rules?.minDiscountPct > 0 && (
                    <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded">
                      -{offer.rules.minDiscountPct}%
                    </div>
                  )}
                  
                  {/* Timer */}
                  <div className={`absolute bottom-1.5 sm:bottom-2 left-1.5 sm:left-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium text-white ${
                    offerTimeLeft.urgent ? "bg-red-500/90" : "bg-black/60"
                  }`}>
                    <span className="flex items-center gap-1 justify-center">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {offerTimeLeft.text}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OffersSection;

