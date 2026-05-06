"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingCart, Trash2, Eye, Share2, Heart, 
  Loader2, Copy, Check, ArrowRight, Star, Package, 
  ExternalLink, Code, Download, CheckCircle, Sparkles,
  Shield, Award, ChevronRight, Info, Zap
} from "lucide-react";
import useUser from "@/hooks/useUser";
import { useLocationTracking, useDeviceTracking } from "@/hooks/useTracking";
import { useStore } from "@/store";
import { toast } from "sonner";

const WishlistPage = () => {
  const { user } = useUser();
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);
  const addToCart = useStore((state) => state.addToCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get cart item IDs for checking
  const cartItemIds = useMemo(() => {
    return new Set(cart.map((item: any) => item.id));
  }, [cart]);

  const handleAddToCart = async (item: any) => {
    if (cartItemIds.has(item.id)) {
      toast.info("Already in cart");
      return;
    }
    
    setAddingToCart(item.id);
    try {
      addToCart(item, user, location, deviceInfo);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id, user, location, deviceInfo);
    toast.success("Removed from wishlist");
  };

  const handleShare = async (item: any) => {
    const url = `${window.location.origin}/product/${item.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.appName || item.title,
          text: `Check out ${item.appName || item.title} on VETTCODE!`,
          url: url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback to copy
      handleCopyLink(item);
    }
  };

  const handleCopyLink = async (item: any) => {
    const url = `${window.location.origin}/product/${item.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      toast.success("Link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const formatPrice = (amount: number | undefined | null, currency: string = "USD") => {
    if (amount === undefined || amount === null || amount === 0) return "FREE";
    return `${currency} ${amount.toLocaleString()}`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      <div className="w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] mx-auto py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
                My Wishlist
              </h1>
              <p className="text-sm text-slate-600">
                {wishlist.length} {wishlist.length === 1 ? "application" : "applications"} saved
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-purple-600 transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Wishlist</span>
          </div>
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your wishlist is empty</h2>
            <p className="text-center text-slate-600 mb-8 max-w-md">
              Start saving production-ready applications and verified codebases you love!
            </p>
            <Link
              href="/products"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2 font-semibold"
            >
              <Code className="w-5 h-5" />
              Browse Applications
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item: any) => {
              const isInCart = cartItemIds.has(item.id);
              const isFree = item.isFree || item.price === 0;
              
              return (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200">
                    <Link href={`/product/${item.id}`}>
                      <Image
                        src={item?.image || item?.screenshots?.[0]?.url || item?.screenshots?.[0]?.thumbnailUrl || "/placeholder.jpg"}
                        alt={item.appName || item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {isFree && (
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                          FREE
                        </span>
                      )}
                      {item.verificationStatus === 'verified' && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Cart indicator */}
                    {isInCart && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                        <Check className="w-3 h-3" />
                        In Cart
                      </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link
                        href={`/product/${item.id}`}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-lg"
                        title="View Application"
                      >
                        <Eye className="w-5 h-5 text-slate-700" />
                      </Link>
                      <button
                        onClick={() => handleShare(item)}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-lg"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5 text-slate-700" />
                      </button>
                      <button
                        onClick={() => handleCopyLink(item)}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-lg"
                        title="Copy Link"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-slate-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="font-bold text-slate-900 line-clamp-2 hover:text-purple-600 transition mb-2 text-lg">
                        {item.appName || item.title}
                      </h3>
                    </Link>
                    
                    {item.appCategory && (
                      <p className="text-sm text-slate-600 mb-3">{item.appCategory}</p>
                    )}

                    {/* Tech Stack */}
                    {item.technologyStack && item.technologyStack.length > 0 && (
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {item.technologyStack.slice(0, 2).map((tech: string, idx: number) => (
                          <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                            {tech}
                          </span>
                        ))}
                        {item.technologyStack.length > 2 && (
                          <span className="text-xs text-slate-500">
                            +{item.technologyStack.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {item.rating && item.rating > 0 && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-slate-700">{item.rating.toFixed(1)}</span>
                        {item.reviewCount && (
                          <span className="text-sm text-slate-400">({item.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="mb-4">
                      {isFree ? (
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          FREE
                        </span>
                      ) : (
                        <span className="text-2xl font-bold text-slate-900">
                          {formatPrice(item.price, item.currency)}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 mb-4 pb-4 border-b border-slate-200">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4 text-purple-600" />
                        Instant
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-blue-600" />
                        Secure
                      </span>
                      {item.licenseType && (
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-green-600" />
                          {item.licenseType}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Primary Action */}
                      <button
                        onClick={() => handleAddToCart(item)}
                        disabled={addingToCart === item.id}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                          isInCart
                            ? "bg-green-50 text-green-600 border-2 border-green-200"
                            : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                        } disabled:opacity-50`}
                      >
                        {addingToCart === item.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isInCart ? (
                          <>
                            <Check className="w-5 h-5" />
                            In Cart
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Add to Cart
                          </>
                        )}
                      </button>

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/product/${item.id}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 text-slate-700 rounded-lg text-sm hover:bg-slate-100 transition font-medium border border-slate-200"
                          title="View Details"
                        >
                          <Info className="w-4 h-4" />
                          Details
                        </Link>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="flex items-center justify-center gap-1.5 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 transition font-medium border border-red-200"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {wishlist.length > 0 && (
          <div className="mt-8 p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-slate-700 text-lg">
                  <span className="font-bold text-slate-900">{wishlist.length}</span>{" "}
                  {wishlist.length === 1 ? "application" : "applications"} in your wishlist
                </p>
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <Zap className="w-4 h-4 text-purple-600" />
                  {wishlist.filter((item: any) => cartItemIds.has(item.id)).length} already in cart
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  <ShoppingCart className="w-5 h-5" />
                  View Cart
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Browse More
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

