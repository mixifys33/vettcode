"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar, TrendingUp, Clock, Tag, ArrowRight, Search, 
  Zap, Gift, ShoppingBag, Percent, Store, Sparkles,
  ChevronLeft, ChevronRight, Filter, Grid, List
} from "lucide-react";

interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  visibility: string;
  banners: string[];
  schedule: { start: string; end: string };
  analytics: { views: number; sales: number; addToCart: number };
  rules: { minDiscountPct: number };
  target?: { regions: string[]; categories: string[] };
}

const EVENT_TYPE_CONFIG: Record<string, { icon: any; color: string; bgColor: string; label: string; description: string }> = {
  seasonal: { 
    icon: Calendar, 
    color: "text-blue-600", 
    bgColor: "bg-blue-50 border-blue-200", 
    label: "Seasonal", 
    description: "Holiday & seasonal promotions" 
  },
  flash_sale: { 
    icon: Zap, 
    color: "text-red-600", 
    bgColor: "bg-red-50 border-red-200", 
    label: "Flash Sale", 
    description: "Limited time, huge discounts" 
  },
  coupon_festival: { 
    icon: Gift, 
    color: "text-purple-600", 
    bgColor: "bg-purple-50 border-purple-200", 
    label: "Coupon Festival", 
    description: "Exclusive coupons & deals" 
  },
  bulk_deal: { 
    icon: ShoppingBag, 
    color: "text-green-600", 
    bgColor: "bg-green-50 border-green-200", 
    label: "Bulk Deal", 
    description: "Buy more, save more" 
  },
  category_sale: { 
    icon: Grid, 
    color: "text-indigo-600", 
    bgColor: "bg-indigo-50 border-indigo-200", 
    label: "Category Sale", 
    description: "Category-wide discounts" 
  },
  brand_sale: { 
    icon: Store, 
    color: "text-amber-600", 
    bgColor: "bg-amber-50 border-amber-200", 
    label: "Brand Sale", 
    description: "Featured brand deals" 
  },
  clearance: { 
    icon: Percent, 
    color: "text-orange-600", 
    bgColor: "bg-orange-50 border-orange-200", 
    label: "Clearance", 
    description: "Final sale prices" 
  },
  seller_private: { 
    icon: Sparkles, 
    color: "text-pink-600", 
    bgColor: "bg-pink-50 border-pink-200", 
    label: "Exclusive", 
    description: "Shop exclusive offers" 
  },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    // Auto-rotate featured banners
    if (featuredEvents.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % featuredEvents.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredEvents]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events/active");
      const data = await res.json();
      if (data.success) {
        const allEvents = data.data || [];
        setEvents(allEvents);
        // Featured = flash sales or seasonal with most views
        const featured = allEvents
          .filter((e: Event) => e.type === "flash_sale" || e.type === "seasonal")
          .sort((a: Event, b: Event) => (b.analytics?.views || 0) - (a.analytics?.views || 0))
          .slice(0, 5);
        setFeaturedEvents(featured);
      }
    } catch (error) {
      console.error("Failed to fetch events", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                        e.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || e.type === filter;
    return matchSearch && matchFilter;
  });

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return { ended: true, text: "Ended", urgent: false };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { ended: false, text: `${days}d ${hours}h left`, urgent: days < 2 };
    if (hours > 0) return { ended: false, text: `${hours}h ${minutes}m left`, urgent: true };
    return { ended: false, text: `${minutes}m left`, urgent: true };
  };

  // Group events by type
  const eventsByType = events.reduce((acc, event) => {
    if (!acc[event.type]) acc[event.type] = [];
    acc[event.type].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Featured Events Banner Carousel */}
      {featuredEvents.length > 0 && (
        <div className="relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden">
          {featuredEvents.map((event, idx) => (
            <Link
              key={event._id}
              href={`/events/${event.slug}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                idx === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="relative w-full h-full">
                <img
                  src={event.banners[0]}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 lg:p-12">
                  <div className="container mx-auto">
                    <div className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full ${EVENT_TYPE_CONFIG[event.type]?.bgColor || "bg-gray-100"} mb-2 sm:mb-4`}>
                      {EVENT_TYPE_CONFIG[event.type]?.icon && (
                        <span className={EVENT_TYPE_CONFIG[event.type].color}>
                          {(() => { const Icon = EVENT_TYPE_CONFIG[event.type].icon; return <Icon className="w-3 h-3 sm:w-4 sm:h-4" />; })()}
                        </span>
                      )}
                      <span className={`text-xs sm:text-sm font-medium ${EVENT_TYPE_CONFIG[event.type]?.color || "text-gray-700"}`}>
                        {EVENT_TYPE_CONFIG[event.type]?.label || event.type}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-1.5 sm:mb-3 line-clamp-2">{event.title}</h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mb-3 sm:mb-4 line-clamp-2 hidden sm:block">{event.description}</p>
                    <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-white">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm sm:text-base font-medium">{getTimeRemaining(event.schedule.end).text}</span>
                      </div>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-900 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-100 transition">
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {/* Banner Navigation */}
          {featuredEvents.length > 1 && (
            <>
              <button
                onClick={() => setCurrentBanner((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition active:scale-95"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <button
                onClick={() => setCurrentBanner((prev) => (prev + 1) % featuredEvents.length)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition active:scale-95"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
                {featuredEvents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBanner(idx)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition ${
                      idx === currentBanner ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Event Type Quick Links */}
      <div className="bg-white border-b border-gray-200 py-3 sm:py-4 md:py-6 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            <button
              onClick={() => setFilter("all")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition font-medium text-sm sm:text-base active:scale-95 ${
                filter === "all" 
                  ? "bg-gray-900 text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              All Events
            </button>
            {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
              const Icon = config.icon;
              const count = eventsByType[type]?.length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap transition font-medium border text-sm sm:text-base active:scale-95 ${
                    filter === type 
                      ? `${config.bgColor} ${config.color} border-current` 
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">{config.label}</span>
                  <span className="xs:hidden">{config.label.split(' ')[0]}</span>
                  <span className="text-xs bg-gray-200 px-1.5 sm:px-2 py-0.5 rounded-full">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
          <div className="flex-1 max-w-xl w-full relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs sm:text-sm text-gray-500">{filteredEvents.length} events</span>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 active:scale-95 transition ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                <Grid className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 active:scale-95 transition ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"}`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sales Section (if any active) */}
      {eventsByType["flash_sale"]?.length > 0 && filter === "all" && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 py-6 sm:py-8 mb-6 sm:mb-8">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">Flash Sales</h2>
                  <p className="text-white/80 text-xs sm:text-base hidden sm:block">Limited time offers ending soon!</p>
                </div>
              </div>
              <Link 
                href="/events/flash-sales"
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-red-600 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100 transition active:scale-95"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {eventsByType["flash_sale"].slice(0, 4).map((event) => {
                const timeLeft = getTimeRemaining(event.schedule.end);
                return (
                  <Link
                    key={event._id}
                    href={`/events/${event.slug}`}
                    className="bg-white rounded-lg sm:rounded-xl overflow-hidden hover:shadow-xl transition group active:scale-[0.98]"
                  >
                    <div className="relative h-24 sm:h-32">
                      <img src={event.banners[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                        timeLeft.urgent ? "bg-red-600 text-white animate-pulse" : "bg-black/70 text-white"
                      }`}>
                        {timeLeft.text}
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1 text-sm sm:text-base">{event.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Up to {event.rules?.minDiscountPct || 50}% off</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredEvents.map((event) => {
              const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.seasonal;
              const Icon = config.icon;
              const timeLeft = getTimeRemaining(event.schedule.end);
              
              return (
                <Link
                  key={event._id}
                  href={`/events/${event.slug}`}
                  className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:scale-[0.98]"
                >
                  <div className="relative h-36 sm:h-44 md:h-48 overflow-hidden">
                    <img
                      src={event.banners[0]}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Type Badge */}
                    <div className={`absolute top-2 sm:top-3 left-2 sm:left-3 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${config.bgColor} border`}>
                      <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${config.color}`} />
                      <span className={`text-[10px] sm:text-xs font-medium ${config.color}`}>{config.label}</span>
                    </div>
                    
                    {/* Time Badge */}
                    <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium ${
                      timeLeft.urgent 
                        ? "bg-red-500 text-white animate-pulse" 
                        : timeLeft.ended 
                        ? "bg-gray-500 text-white"
                        : "bg-black/70 text-white"
                    }`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {timeLeft.text}
                      </span>
                    </div>

                    {/* Discount Badge */}
                    {event.rules?.minDiscountPct > 0 && (
                      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white text-xs sm:text-sm font-bold rounded-full">
                        Up to {event.rules.minDiscountPct}% OFF
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-5">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4 hidden sm:block">{event.description}</p>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 pt-2 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                          {event.analytics?.sales || 0} sales
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredEvents.map((event) => {
              const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.seasonal;
              const Icon = config.icon;
              const timeLeft = getTimeRemaining(event.schedule.end);
              
              return (
                <Link
                  key={event._id}
                  href={`/events/${event.slug}`}
                  className="group flex bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-md hover:shadow-lg transition active:scale-[0.99]"
                >
                  <div className="relative w-28 sm:w-40 md:w-56 flex-shrink-0">
                    <img src={event.banners[0]} alt="" className="w-full h-full object-cover" />
                    <div className={`absolute top-1.5 sm:top-2 left-1.5 sm:left-2 flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${config.bgColor}`}>
                      <Icon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${config.color}`} />
                      <span className={`text-[10px] sm:text-xs font-medium ${config.color} hidden sm:inline`}>{config.label}</span>
                    </div>
                  </div>
                  <div className="flex-1 p-3 sm:p-4 md:p-5 flex flex-col justify-between min-w-0">
                    <div>
                      <h3 className="text-sm sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 hidden sm:block">{event.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2 sm:mt-4 gap-2">
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 flex-wrap">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${timeLeft.urgent ? "bg-red-100 text-red-600" : "bg-gray-100"}`}>
                          {timeLeft.text}
                        </span>
                        <span className="hidden sm:inline">{event.analytics?.sales || 0} sales</span>
                      </div>
                      <span className="text-blue-600 text-xs sm:text-sm font-medium group-hover:underline whitespace-nowrap">View →</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {filteredEvents.length === 0 && (
          <div className="text-center py-12 sm:py-16 px-4">
            <Calendar className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Try adjusting your search or filter</p>
            <button
              onClick={() => { setSearch(""); setFilter("all"); }}
              className="px-5 sm:px-6 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition active:scale-95"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

