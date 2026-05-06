"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import { 
  Clock, Zap, TrendingUp, ArrowRight, Package, Star, 
  ShoppingCart, Heart, ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";

interface FlashProduct {
  _id: string;
  productId: string;
  discountPct: number;
  price: number;
  rating: number;
  deliveryDays: number;
  flashSlotStart: string;
  flashSlotEnd: string;
  inventoryLock: boolean;
  product?: {
    name: string;
    images: string[];
    originalPrice: number;
    stock: number;
  };
}

interface FlashSale {
  _id: string;
  title: string;
  slug: string;
  banners: string[];
  schedule: { start: string; end: string };
  analytics: { views: number; sales: number };
  products: FlashProduct[];
}

export default function FlashSalesPage() {
  const { user } = useUser();
  const addToCart = useStore((state: any) => state.addToCart);
  
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdowns, setCountdowns] = useState<Record<string, { hours: number; minutes: number; seconds: number }>>({});

  useEffect(() => {
    fetchFlashSales();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const newCountdowns: Record<string, any> = {};
      
      flashSales.forEach((sale) => {
        const now = new Date().getTime();
        const end = new Date(sale.schedule.end).getTime();
        const diff = end - now;

        if (diff > 0) {
          newCountdowns[sale._id] = {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
          };
        } else {
          newCountdowns[sale._id] = { hours: 0, minutes: 0, seconds: 0 };
        }
      });
      
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSales]);

  const fetchFlashSales = async () => {
    try {
      const res = await fetch("/api/events/active");
      const data = await res.json();
      if (data.success) {
        const flash = data.data.filter((e: any) => e.type === "flash_sale");
        
        // Fetch products for each flash sale
        const salesWithProducts = await Promise.all(
          flash.map(async (sale: any) => {
            try {
              const productRes = await fetch(`/api/events/slug/${sale.slug}`);
              const productData = await productRes.json();
              return { ...sale, products: productData.data?.products || [] };
            } catch {
              return { ...sale, products: [] };
            }
          })
        );
        
        setFlashSales(salesWithProducts);
      }
    } catch (error) {
      console.error("Failed to fetch flash sales", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: FlashProduct, eventId: string) => {
    if (!product.product) return;
    
    addToCart({
      id: product.productId,
      name: product.product.name,
      sale_price: product.price,
      original_price: product.product.originalPrice,
      images: product.product.images,
      quantity: 1,
      discount: product.discountPct,
      eventId,
    }, user);
  };

  const formatCountdown = (c: { hours: number; minutes: number; seconds: number }) => {
    if (!c) return "00:00:00";
    return `${String(c.hours).padStart(2, "0")}:${String(c.minutes).padStart(2, "0")}:${String(c.seconds).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500">
        <div className="text-center text-white">
          <Zap className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-xl">Loading Flash Sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-white">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-pulse" />
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold">Flash Sales</h1>
            <Zap className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 animate-pulse" />
          </div>
          <p className="text-center text-sm sm:text-lg md:text-2xl opacity-90 max-w-2xl mx-auto px-4">
            Limited time offers with massive discounts. Grab them before they're gone!
          </p>
          
          {flashSales.length > 0 && (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl px-4 sm:px-8 py-3 sm:py-4 flex items-center gap-3 sm:gap-6">
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold">{flashSales.length}</p>
                  <p className="text-[10px] sm:text-sm opacity-80">Active Sales</p>
                </div>
                <div className="w-px h-8 sm:h-12 bg-white/30" />
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold">
                    {flashSales.reduce((acc, s) => acc + (s.products?.length || 0), 0)}
                  </p>
                  <p className="text-[10px] sm:text-sm opacity-80">Products</p>
                </div>
                <div className="w-px h-8 sm:h-12 bg-white/30" />
                <div className="text-center">
                  <p className="text-2xl sm:text-4xl font-bold">
                    {Math.max(...flashSales.flatMap((s) => s.products?.map((p) => p.discountPct) || [0]))}%
                  </p>
                  <p className="text-[10px] sm:text-sm opacity-80">Max Discount</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Wave decoration */}
        <div className="h-8 sm:h-12 md:h-16 bg-gray-50" style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }} />
      </div>

      {/* Flash Sales List */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 -mt-4 sm:-mt-6 md:-mt-8">
        {flashSales.length > 0 ? (
          <div className="space-y-6 sm:space-y-8 md:space-y-12">
            {flashSales.map((sale) => {
              const countdown = countdowns[sale._id];
              const isEnded = countdown && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0;
              const isUrgent = countdown && countdown.hours < 2;
              
              return (
                <div key={sale._id} className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
                  {/* Sale Header */}
                  <div className={`p-3 sm:p-4 md:p-6 ${isEnded ? "bg-gray-500" : "bg-gradient-to-r from-red-500 to-orange-500"}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="relative">
                          <img 
                            src={sale.banners[0]} 
                            alt="" 
                            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl object-cover border-2 sm:border-4 border-white/30"
                          />
                          {isUrgent && !isEnded && (
                            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 p-0.5 sm:p-1 bg-yellow-400 rounded-full animate-bounce">
                              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div className="text-white">
                          <h2 className="text-base sm:text-lg md:text-2xl font-bold line-clamp-1">{sale.title}</h2>
                          <p className="opacity-80 text-xs sm:text-sm">{sale.products?.length || 0} products</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6">
                        {!isEnded && (
                          <div className="text-white text-center">
                            <p className="text-[10px] sm:text-sm opacity-80 mb-0.5 sm:mb-1">Ends in</p>
                            <div className="flex items-center gap-1 sm:gap-2">
                              {["hours", "minutes", "seconds"].map((unit, idx) => (
                                <div key={unit} className="flex items-center gap-1 sm:gap-2">
                                  <div className="bg-white/20 backdrop-blur-sm rounded-md sm:rounded-lg px-2 sm:px-3 py-1 sm:py-2 min-w-[36px] sm:min-w-[50px]">
                                    <span className="text-lg sm:text-2xl font-bold font-mono">
                                      {String(countdown?.[unit as keyof typeof countdown] || 0).padStart(2, "0")}
                                    </span>
                                  </div>
                                  {idx < 2 && <span className="text-lg sm:text-2xl font-bold">:</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Link
                          href={`/events/${sale.slug}`}
                          className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-white text-red-600 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-gray-100 transition flex items-center gap-1.5 sm:gap-2 active:scale-95"
                        >
                          View All
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="p-6">
                    {sale.products && sale.products.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {sale.products.slice(0, 10).map((product) => (
                          <div
                            key={product._id}
                            className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition"
                          >
                            {/* Product Image */}
                            <div className="relative aspect-square overflow-hidden">
                              {product.product?.images?.[0] ? (
                                <img
                                  src={product.product.images[0]}
                                  alt={product.product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Package className="w-10 h-10 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Discount Badge */}
                              <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                                -{product.discountPct}%
                              </div>
                              
                              {/* Stock Warning */}
                              {product.product?.stock && product.product.stock < 10 && (
                                <div className="absolute bottom-2 left-2 right-2 bg-orange-500 text-white text-xs font-medium py-1 px-2 rounded text-center">
                                  Only {product.product.stock} left!
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="p-3">
                              <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2 min-h-[40px]">
                                {product.product?.name || "Product"}
                              </h3>
                              
                              <div className="flex items-center gap-1 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-3 h-3 ${
                                      star <= product.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>

                              <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-lg font-bold text-red-600">
                                  UGX {product.price.toLocaleString()}
                                </span>
                                {product.product?.originalPrice && (
                                  <span className="text-xs text-gray-500 line-through">
                                    {product.product.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => handleAddToCart(product, sale._id)}
                                disabled={isEnded}
                                className="w-full py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                {isEnded ? "Ended" : "Add to Cart"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>No products available for this flash sale yet</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <Zap className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No Flash Sales Right Now</h2>
            <p className="text-gray-500 mb-6">Check back soon for exciting flash deals!</p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
            >
              Browse All Events
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* How Flash Sales Work */}
      <div className="bg-white border-t border-gray-200 py-10 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center mb-8 sm:mb-10 md:mb-12">How Flash Sales Work</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[
              { icon: Clock, title: "Limited Time", desc: "Sales last only a few hours" },
              { icon: Zap, title: "Huge Discounts", desc: "Up to 80% off selected items" },
              { icon: Package, title: "Limited Stock", desc: "First come, first served" },
              { icon: ShoppingCart, title: "Quick Checkout", desc: "Buy fast before it's gone" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-red-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

