"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, Clock, ChevronLeft, ChevronRight, Zap, ArrowRight, Pause, Play } from "lucide-react";

interface Event {
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

interface EventsSectionProps {
  minEventsToShow?: number;
}

const EVENT_TYPE_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
  flash_sale: { bg: "from-red-500 to-orange-500", text: "text-white", badge: "bg-red-600" },
  seasonal: { bg: "from-blue-500 to-indigo-500", text: "text-white", badge: "bg-blue-600" },
  coupon_festival: { bg: "from-purple-500 to-pink-500", text: "text-white", badge: "bg-purple-600" },
  bulk_deal: { bg: "from-green-500 to-teal-500", text: "text-white", badge: "bg-green-600" },
  category_sale: { bg: "from-indigo-500 to-blue-500", text: "text-white", badge: "bg-indigo-600" },
  brand_sale: { bg: "from-amber-500 to-orange-500", text: "text-white", badge: "bg-amber-600" },
  clearance: { bg: "from-orange-500 to-red-500", text: "text-white", badge: "bg-orange-600" },
  default: { bg: "from-gray-600 to-gray-800", text: "text-white", badge: "bg-gray-600" },
};

const EventsSection: React.FC<EventsSectionProps> = ({ minEventsToShow = 5 }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events/active");
      const data = await res.json();
      if (data.success && data.data) {
        setEvents(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  }, [events.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  }, [events.length]);

  // Auto-scroll
  useEffect(() => {
    if (isPaused || events.length <= 1) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, events.length, nextSlide]);

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;
    if (diff <= 0) return { text: "Ended", urgent: false };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return { text: `${days}d ${hours}h left`, urgent: days < 2 };
    return { text: `${hours}h left`, urgent: true };
  };

  // Don't render if less than minimum events
  if (loading || events.length < minEventsToShow) return null;

  const currentEvent = events[currentIndex];
  const colors = EVENT_TYPE_COLORS[currentEvent?.type] || EVENT_TYPE_COLORS.default;
  const timeLeft = getTimeRemaining(currentEvent?.schedule?.end);

  return (
    <section className="w-full py-6 sm:py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Hot Events</h2>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Don't miss out on amazing deals</p>
            </div>
          </div>
          <Link
            href="/events"
            className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium text-blue-600 hover:text-blue-700 transition"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl">
          {/* Main Banner */}
          <Link href={`/events/${currentEvent?.slug}`} className="block">
            <div className={`relative h-[200px] sm:h-[280px] md:h-[350px] lg:h-[400px] bg-gradient-to-r ${colors.bg}`}>
              {currentEvent?.banners?.[0] ? (
                <img
                  src={currentEvent.banners[0]}
                  alt={currentEvent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-16 h-16 sm:w-24 sm:h-24 text-white/50" />
                </div>
              )}
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                {/* Event Type Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 ${colors.badge} rounded-full mb-2 sm:mb-3`}>
                  {currentEvent?.type === "flash_sale" && <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                  <span className="text-xs sm:text-sm font-medium text-white capitalize">
                    {currentEvent?.type?.replace("_", " ")}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 sm:mb-2 line-clamp-2">
                  {currentEvent?.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-white/80 mb-3 sm:mb-4 line-clamp-2 max-w-2xl hidden sm:block">
                  {currentEvent?.description}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${
                    timeLeft.urgent ? "bg-red-500 animate-pulse" : "bg-white/20"
                  }`}>
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white">{timeLeft.text}</span>
                  </div>
                  
                  {currentEvent?.rules?.minDiscountPct > 0 && (
                    <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-500 rounded-full">
                      <span className="text-xs sm:text-sm font-bold text-white">
                        Up to {currentEvent.rules.minDiscountPct}% OFF
                      </span>
                    </div>
                  )}

                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-900 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 transition">
                    Shop Now →
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Navigation Arrows */}
          {events.length > 1 && (
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
          {events.length > 1 && (
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
                {events.slice(0, 8).map((_, idx) => (
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

        {/* Event Thumbnails */}
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
          {events.slice(0, 8).map((event, idx) => (
            <button
              key={event._id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-square rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 ${
                idx === currentIndex ? "ring-2 ring-blue-500 ring-offset-2" : "opacity-70 hover:opacity-100"
              }`}
            >
              {event.banners?.[0] ? (
                <img src={event.banners[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-r ${EVENT_TYPE_COLORS[event.type]?.bg || EVENT_TYPE_COLORS.default.bg}`} />
              )}
              <div className="absolute inset-0 bg-black/30" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;

