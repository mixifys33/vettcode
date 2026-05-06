"use client";

import { Eye, Heart, Download, Star, Code2, GitFork, Shield, CheckCircle, Sparkles, Award } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import ProductDetailsCard from "./product-details.card";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

const ProductCard = ({ product, isEvent }: { product: any; isEvent?: boolean }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const { formatPrice } = useCurrencyFormat();

  const cart = useStore((s) => s.cart);
  const wishlist = useStore((s) => s.wishlist);
  const wishlistIds = useStore((s) => s.wishlistIds);
  const addToCart = useStore((s) => s.addToCart);
  const addToWishlist = useStore((s) => s.addToWishlist);
  const removeFromWishlist = useStore((s) => s.removeFromWishlist);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const syncWithServer = useStore((s) => s.syncWithServer);

  const isWishListed = wishlist.some((i: any) => i.id === product?.id) || wishlistIds.includes(product?.id);
  const isInCart = cart.some((i: any) => i.id === product?.id);

  useEffect(() => {
    if (user?.id) syncWithServer(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!isEvent || !product?.ending_date) return;
    const tick = () => {
      const diff = new Date(product.ending_date).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      setTimeLeft(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [isEvent, product?.ending_date]);

  if (!product) return null;

  // Map Application fields to display
  const appName = product?.appName || product?.title || "Untitled Application";
  const appCategory = product?.appCategory || product?.category || "";
  const techStack = product?.technologyStack?.join(", ") || product?.techStack || "";
  const appIcon = product?.appIcon?.url || product?.screenshots?.[0]?.url || product?.images?.[0]?.url || null;
  const sellerName = product?.Seller?.name || product?.Shop?.name || product?.seller?.name || "";
  const sellerId = product?.sellerId || product?.Seller?.id || product?.Shop?.id || "";
  const appRating = product?.rating ?? product?.ratings ?? 0;
  const appDownloads = product?.downloads ?? product?.totalSales ?? 0;
  const appPrice = product?.price ?? product?.sale_price ?? 0;
  const regularPrice = product?.regular_price ?? appPrice;
  const isFree = product?.isFree || appPrice === 0;
  const isVerified = product?.verificationStatus === 'verified' || product?.verified;
  const appBadges = product?.badges || [];
  // Use MongoDB _id for routing (applications don't have slugs)
  const appId = product?._id || product?.id;
  
  // Currency: Use product's currency or default to USD
  const productCurrency = product?.currency || "USD";
  const currencySymbol = productCurrency === "USD" ? "$" : productCurrency === "EUR" ? "€" : productCurrency === "GBP" ? "£" : productCurrency;
  
  // Format price with product's currency
  const formatProductPrice = (price: number) => {
    if (price === 0) return "FREE";
    // Format with proper currency symbol
    if (productCurrency === "USD" || productCurrency === "EUR" || productCurrency === "GBP") {
      return `${currencySymbol}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    // For other currencies, show symbol after amount
    return `${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${productCurrency}`;
  };

  const discount = regularPrice > appPrice && appPrice > 0
    ? Math.round(((regularPrice - appPrice) / regularPrice) * 100)
    : 0;

  const fullStars = Math.floor(appRating);
  const isImageKit = appIcon?.includes('ik.imagekit.io');
  const isPlaceholder = appIcon?.includes('example.com') || appIcon?.includes('placeholder');
  const safeImgSrc = isPlaceholder ? null : (!imgError && appIcon ? appIcon : null);

  // Calculate admin completion score if available
  const adminCompletionScore = product?.adminCompletionScore || product?.completionScore || null;

  return (
    <>
      <div className="group relative rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col backdrop-blur-sm" style={{ background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))" }}>

        {/* Image - Larger Area */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 aspect-[4/3]">
          <Link href={`/product/${appId}`}>
            {safeImgSrc ? (
              <Image
                src={safeImgSrc}
                alt={appName}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                unoptimized={!isImageKit}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Code2 className="w-16 h-16 text-gray-600" />
              </div>
            )}
          </Link>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Quick actions - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10 opacity-0 group-hover:opacity-100 translate-x-3 group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={() => isWishListed
                ? removeFromWishlist(product.id, user, location, deviceInfo)
                : addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo)}
              className={`w-9 h-9 rounded-xl shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md ${
                isWishListed
                  ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:text-rose-400 border border-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishListed ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => setOpen(true)}
              className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center text-gray-300 hover:text-purple-400 hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Rating Badge - Bottom Left on Image (Only Stars) */}
          {appRating > 0 && (
            <div className="absolute bottom-3 left-3 z-10">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 shadow-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white font-bold text-sm">{appRating.toFixed(1)}</span>
              </div>
            </div>
          )}

          {/* Event timer */}
          {isEvent && timeLeft && (
            <div className="absolute bottom-3 right-3 backdrop-blur-md bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-xl border border-white/20 shadow-lg z-10">
              ⏱ {timeLeft} left
            </div>
          )}
        </div>

        {/* Info Section - All Other Labels Here */}
        <div className="flex flex-col flex-1 p-4">
          {/* Badges Row */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {isFree && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                <Sparkles className="w-3 h-3" />
                FREE
              </span>
            )}
            {!isFree && discount >= 10 && (
              <span className="flex items-center gap-0.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                -{discount}% OFF
              </span>
            )}
            {isVerified && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                <Shield className="w-3 h-3" />
                VERIFIED
              </span>
            )}
            {appBadges.includes('Featured') && (
              <span className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                <Award className="w-3 h-3" />
                FEATURED
              </span>
            )}
            {isEvent && (
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                LIMITED
              </span>
            )}
          </div>

          {/* Category/Tech Stack */}
          {appCategory && (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                {appCategory}
              </span>
              {techStack && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-[10px] text-gray-400 font-medium truncate">
                    {techStack.split(',')[0]}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Title */}
          <Link href={`/product/${appId}`}>
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug hover:text-purple-400 transition-colors mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {appName}
            </h3>
          </Link>

          {/* Developer/Seller */}
          {sellerName && (
            <Link href={`/shop/${sellerId}`}
              className="text-[11px] text-gray-400 hover:text-purple-400 truncate mb-3 flex items-center gap-1 transition-colors">
              <Code2 className="w-3 h-3" />
              {sellerName}
            </Link>
          )}

          {/* Stats Row - Downloads, Views, Admin Score */}
          <div className="flex items-center gap-3 mb-3 text-[11px] flex-wrap">
            {appDownloads > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <Download className="w-3.5 h-3.5" />
                <span className="text-gray-300 font-medium">{appDownloads.toLocaleString()}</span>
              </div>
            )}
            {product?.views > 0 && (
              <div className="flex items-center gap-1 text-gray-400">
                <Eye className="w-3.5 h-3.5" />
                <span className="text-gray-300 font-medium">{product.views.toLocaleString()}</span>
              </div>
            )}
            {adminCompletionScore !== null && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-400 font-bold">{adminCompletionScore}%</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mt-auto mb-3">
            {isFree ? (
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-emerald-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  FREE
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            ) : (
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {formatProductPrice(appPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-xs text-gray-500 line-through font-medium">
                    {formatProductPrice(regularPrice)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (isFree) {
                // For free apps, go directly to download/view page
                router.push(`/product/${appId}`);
              } else {
                // For paid apps, add to cart
                isInCart
                  ? removeFromCart(product.id, user, location, deviceInfo)
                  : addToCart({ ...product, quantity: 1 }, user, location, deviceInfo);
              }
            }}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 shadow-lg ${
              isFree
                ? 'text-white hover:scale-[1.02]'
                : isInCart
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white'
                : 'text-white hover:scale-[1.02]'
            }`}
            style={!isInCart && !isFree ? { background: "linear-gradient(135deg, #8b5cf6, #6366f1)" } : isFree ? { background: "linear-gradient(135deg, #10b981, #059669)" } : {}}
          >
            {isFree ? (
              <>
                <Download className="w-4 h-4" />
                Get Free Access
              </>
            ) : isInCart ? (
              <>
                <Download className="w-4 h-4" />
                Remove from Cart
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {open && <ProductDetailsCard data={product} setOpen={setOpen} />}
    </>
  );
};

export default ProductCard;

