"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingCart, Trash2, Eye, Share2, Heart, 
  Store, Tag, Loader2, Bell, Copy, Check,
  ArrowRight, Percent, Star, Package, ExternalLink
} from "lucide-react";
import useUser from "@/hooks/useUser";
import { useLocationTracking, useDeviceTracking } from "@/hooks/useTracking";
import { useStore } from "@/store";
import { toast } from "sonner";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

const WishlistPage = () => {
  const { user } = useUser();
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);
  const addToCart = useStore((state) => state.addToCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const { formatPrice } = useCurrencyFormat();
  
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get cart item IDs for checking
  const cartItemIds = useMemo(() => {
    return new Set(cart.map((item: any) => item.id));
  }, [cart]);

  // Get cart quantities
  const cartQuantities = useMemo(() => {
    const quantities: Record<string, number> = {};
    cart.forEach((item: any) => {
      quantities[item.id] = item.quantity || 1;
    });
    return quantities;
  }, [cart]);

  const handleAddToCart = async (item: any) => {
    if (cartItemIds.has(item.id)) {
      toast.info(`Already in cart (${cartQuantities[item.id]} items)`);
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
    const url = `${window.location.origin}/product/${item.slug || item.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `Check out ${item.title}`,
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
    const url = `${window.location.origin}/product/${item.slug || item.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      toast.success("Link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNotifyMe = (item: any) => {
    toast.success(`We'll notify you when "${item.title}" is back in stock!`);
  };

  const handleViewShop = (item: any) => {
    if (item.shopId) {
      window.open(`/shop/${item.shopId}`, '_blank');
    } else {
      toast.info("Shop information not available");
    }
  };

  const getDiscountPercent = (item: any) => {
    if (!item.regular_price || !item.sale_price || item.regular_price <= item.sale_price) return 0;
    return Math.round(((item.regular_price - item.sale_price) / item.regular_price) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              My Wishlist
            </h1>
            <p className="text-gray-500 mt-1">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
            </p>
          </div>
          {wishlist.length > 0 && (
            <Link
              href="/products"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <Heart className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Start adding products you love to your wishlist!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              <Package className="w-5 h-5" />
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item: any) => {
              const isInCart = cartItemIds.has(item.id);
              const cartQty = cartQuantities[item.id] || 0;
              const discount = getDiscountPercent(item);
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-100">
                    <Link href={`/product/${item.slug || item.id}`}>
                      <Image
                        src={item.images?.[0]?.url || "/placeholder.png"}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {discount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          -{discount}%
                        </span>
                      )}
                      {item.stock === 0 && (
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    {/* Cart indicator */}
                    {isInCart && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {cartQty} in cart
                      </div>
                    )}

                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Link
                        href={`/product/${item.slug || item.id}`}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                        title="View Product"
                      >
                        <Eye className="w-5 h-5 text-gray-700" />
                      </Link>
                      <button
                        onClick={() => handleShare(item)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                        title="Share"
                      >
                        <Share2 className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleCopyLink(item)}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition"
                        title="Copy Link"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-700" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <Link href={`/product/${item.slug || item.id}`}>
                      <h3 className="font-medium text-gray-800 line-clamp-2 hover:text-blue-600 transition mb-1">
                        {item.title}
                      </h3>
                    </Link>
                    
                    {item.brand && (
                      <p className="text-sm text-gray-500 mb-2">{item.brand}</p>
                    )}

                    {/* Rating */}
                    {item.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600">{item.rating.toFixed(1)}</span>
                        {item.reviewCount && (
                          <span className="text-sm text-gray-400">({item.reviewCount})</span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-gray-800">
                        {formatPrice(item.sale_price)}
                      </span>
                      {item.regular_price > item.sale_price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(item.regular_price)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Primary Action */}
                      {item.stock > 0 ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={addingToCart === item.id}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition ${
                            isInCart
                              ? "bg-green-50 text-green-600 border border-green-200"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                          } disabled:opacity-50`}
                        >
                          {addingToCart === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : isInCart ? (
                            <>
                              <Check className="w-4 h-4" />
                              In Cart ({cartQty})
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleNotifyMe(item)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                        >
                          <Bell className="w-4 h-4" />
                          Notify When Available
                        </button>
                      )}

                      {/* Secondary Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleViewShop(item)}
                          className="flex items-center justify-center gap-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition"
                          title="View Shop"
                        >
                          <Store className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/product/${item.slug || item.id}`}
                          className="flex items-center justify-center gap-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm hover:bg-gray-100 transition"
                          title="View Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="flex items-center justify-center gap-1 py-2 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
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
          <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-800">{wishlist.length}</span>{" "}
                  {wishlist.length === 1 ? "item" : "items"} in your wishlist
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {wishlist.filter((item: any) => cartItemIds.has(item.id)).length} already in cart
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  View Cart
                </Link>
                <Link
                  href="/products"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
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

