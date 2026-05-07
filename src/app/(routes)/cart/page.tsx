"use client";

import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/store";
import Image from "next/image";
import axiosInstance from "@/utils/axiosInstance";
import { 
  Loader2, Trash2, ShoppingBag, Tag, X,
  Heart, Share2, ExternalLink, Save, ShoppingCart, Info,
  Package, Code, Download, CheckCircle, Sparkles, Zap,
  Shield, Award, Star, Clock, ChevronRight
} from "lucide-react";

interface AppliedCoupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discountAmount: number;
  message: string;
  scope: "cart" | "application";
  applicationId?: string;
  createdBy: "admin" | "seller";
}

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const clearCart = useStore((state: any) => state.clearCart);
  
  // States
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [applicationCouponInputs, setApplicationCouponInputs] = useState<Record<string, string>>({});

  // Calculate subtotal (before discounts)
  const subtotal = useMemo(() => {
    return cart.reduce((total: number, item: any) => {
      const price = Number(item.price) || 0;
      return total + price;
    }, 0);
  }, [cart]);

  // Calculate total discount from all coupons
  const totalDiscount = useMemo(() => {
    return appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);
  }, [appliedCoupons]);

  // Final total (no shipping for digital applications)
  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - totalDiscount);
  }, [subtotal, totalDiscount]);

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
    // Remove any application-specific coupons for this item
    setAppliedCoupons(prev => prev.filter(c => c.applicationId !== id));
  };

  // Apply coupon (cart-wide or application-specific)
  const applyCoupon = async (code: string, applicationId?: string) => {
    if (!code.trim()) {
      if (!applicationId) setCouponError("Please enter a coupon code");
      return;
    }

    // Check if coupon already applied
    const alreadyApplied = appliedCoupons.find(
      c => c.code.toUpperCase() === code.trim().toUpperCase() && 
      ((!applicationId && c.scope === "cart") || c.applicationId === applicationId)
    );
    
    if (alreadyApplied) {
      if (!applicationId) setCouponError("This coupon is already applied");
      return;
    }

    setApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          total: subtotal,
          applicationId,
          cartItems: cart.map((item: any) => ({
            id: item.id,
            shopId: item.shopId || item.sellerId,
            price: Number(item.price) || 0,
          }))
        }),
      });
      const data = await response.json();

      if (!data.valid) {
        if (!applicationId) setCouponError(data.message || "Invalid coupon code");
        return;
      }

      const newCoupon: AppliedCoupon = {
        code: code.trim().toUpperCase(),
        type: data.type || "percentage",
        value: data.value || data.discountPercent || 0,
        discountAmount: data.discountAmount || 0,
        message: data.message || "Coupon applied",
        scope: applicationId ? "application" : "cart",
        applicationId,
        createdBy: data.createdBy || "seller"
      };

      setAppliedCoupons(prev => [...prev, newCoupon]);
      
      if (!applicationId) {
        setCouponSuccess(data.message || "Coupon applied successfully!");
        setCouponCode("");
      } else {
        setApplicationCouponInputs(prev => ({ ...prev, [applicationId]: "" }));
      }
    } catch (error: any) {
      console.error("Coupon apply error", error);
      if (!applicationId) {
        setCouponError(error.response?.data?.message || "Failed to apply coupon");
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = (couponCode: string, applicationId?: string) => {
    setAppliedCoupons(prev => 
      prev.filter(c => !(c.code === couponCode && c.applicationId === applicationId))
    );
    setCouponSuccess("");
  };

  // Get item price after application-specific discounts
  const getItemDiscountedPrice = (item: any) => {
    const basePrice = Number(item.price) || 0;
    const applicationCoupon = appliedCoupons.find(c => c.applicationId === item.id);
    
    if (!applicationCoupon) return basePrice;
    
    if (applicationCoupon.type === "percentage") {
      return basePrice * (1 - applicationCoupon.value / 100);
    }
    return Math.max(0, basePrice - applicationCoupon.value);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }

    setLoading(true);
    setCouponError("");
    
    try {
      // Transform cart items for order
      const orderItems = cart.map((item: any) => ({
        productId: item.id,
        name: item.appName || item.title || "Application",
        price: getItemDiscountedPrice(item),
        quantity: 1,
        image: item?.image || item?.screenshots?.[0]?.url || "",
        currency: item.currency || "USD", // Preserve currency from cart item
      }));

      // Create order in backend
      const orderResponse = await axiosInstance.post("/api/orders", {
        userId: user.id,
        items: orderItems,
        subtotal: subtotal,
        total: finalTotal,
        totalDiscount: totalDiscount,
        deliveryFee: 0,
        paymentMethod: "",
        paymentStatus: "pending",
        status: "pending",
        shippingAddress: {
          fullName: user.name || "",
          phone: user.phone || "",
          email: user.email || "",
          street: "",
          city: "",
          region: "",
        },
        customerInfo: {
          fullName: user.name || "",
          phone: user.phone || "",
          email: user.email || "",
          address: "",
          city: "",
        },
        buyerInfo: {
          userId: user.id,
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        },
      });

      console.log("Order response:", orderResponse.data);

      // Check multiple possible response formats
      const orderId = orderResponse.data.orderId || 
                     orderResponse.data.order?._id || 
                     orderResponse.data._id ||
                     orderResponse.data.data?._id;

      console.log("Extracted orderId:", orderId);

      if (!orderId) {
        console.error("Full response:", JSON.stringify(orderResponse.data));
        throw new Error("Failed to create order - no orderId returned. Response: " + JSON.stringify(orderResponse.data));
      }

      // Clear cart after successful order creation
      clearCart();

      // Redirect to checkout with orderId
      router.push(`/checkout?orderId=${orderId}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Checkout failed. Please try again.";
      setCouponError(errorMessage);
      alert(`Checkout failed: ${errorMessage}`);
    } finally {
      setLoading(false);
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Application Cart
              </h1>
              <p className="text-sm text-slate-600">Secure your production-ready applications</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-purple-600 transition">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">Cart ({cart.length} {cart.length === 1 ? 'application' : 'applications'})</span>
          </div>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-center text-slate-600 mb-8 max-w-md">
              Discover production-ready applications and verified codebases to power your projects
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
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-[65%] space-y-4">
              {cart.map((item: any) => {
                const hasApplicationCoupon = appliedCoupons.some(c => c.applicationId === item.id);
                const discountedPrice = getItemDiscountedPrice(item);
                const originalPrice = Number(item.price) || 0;
                const isFree = item.isFree || originalPrice === 0;
                
                return (
                  <div key={item.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition-all duration-300 border border-slate-200 group">
                    <div className="flex gap-4">
                      {/* Application Image - Clickable */}
                      <Link 
                        href={`/product/${item.id}`}
                        className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 group-hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Image
                          src={item?.image || item?.screenshots?.[0]?.url || item?.screenshots?.[0]?.thumbnailUrl || "/placeholder.jpg"}
                          alt={item.appName || item.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                        {isFree && (
                          <span className="absolute top-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                            FREE
                          </span>
                        )}
                        {item.verificationStatus === 'verified' && (
                          <span className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle className="w-4 h-4" />
                          </span>
                        )}
                      </Link>

                      {/* Application Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 line-clamp-2 mb-1 text-lg group-hover:text-purple-600 transition">
                              {item.appName || item.title}
                            </h3>
                            <p className="text-sm text-slate-600 line-clamp-1">
                              {item.appCategory || "Application"}
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Remove from cart"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Tech Stack */}
                        {item.technologyStack && item.technologyStack.length > 0 && (
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {item.technologyStack.slice(0, 3).map((tech: string, idx: number) => (
                              <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                                {tech}
                              </span>
                            ))}
                            {item.technologyStack.length > 3 && (
                              <span className="text-xs text-slate-500">
                                +{item.technologyStack.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-3 mb-4">
                          {isFree ? (
                            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              FREE
                            </span>
                          ) : hasApplicationCoupon ? (
                            <>
                              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                {formatPrice(discountedPrice, item.currency)}
                              </span>
                              <span className="text-sm text-slate-400 line-through">
                                {formatPrice(originalPrice, item.currency)}
                              </span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                Discount Applied
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-slate-900">
                              {formatPrice(originalPrice, item.currency)}
                            </span>
                          )}
                        </div>

                        {/* Features/Benefits */}
                        <div className="flex items-center gap-4 text-xs text-slate-600 mb-4">
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-purple-600" />
                            Instant Access
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-blue-600" />
                            Verified Code
                          </span>
                          {item.licenseType && (
                            <span className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-green-600" />
                              {item.licenseType}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/product/${item.id}`}
                            className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 transition px-3 py-2 border border-purple-200 rounded-lg hover:bg-purple-50 font-medium"
                          >
                            <Info className="w-4 h-4" />
                            <span>View Details</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              const itemToSave = { ...item };
                              localStorage.setItem(`saved_${item.id}`, JSON.stringify(itemToSave));
                              removeItem(item.id);
                              alert("Application saved for later!");
                            }}
                            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-700 transition px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
                            title="Save for later"
                          >
                            <Heart className="w-4 h-4" />
                            <span className="hidden sm:inline">Save</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/product/${item.id}`;
                              if (navigator.share) {
                                navigator.share({
                                  title: item.appName || item.title,
                                  text: `Check out ${item.appName || item.title} on VETTCODE!`,
                                  url: shareUrl
                                }).catch(() => {});
                              } else {
                                navigator.clipboard.writeText(shareUrl);
                                alert("Link copied to clipboard!");
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-700 transition px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
                            title="Share"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Application-specific coupon */}
                        {!isFree && !hasApplicationCoupon && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Application coupon code"
                                value={applicationCouponInputs[item.id] || ""}
                                onChange={(e) => setApplicationCouponInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              <button
                                onClick={() => applyCoupon(applicationCouponInputs[item.id] || "", item.id)}
                                disabled={applyingCoupon || !applicationCouponInputs[item.id]?.trim()}
                                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Show applied coupon */}
                        {hasApplicationCoupon && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            {appliedCoupons.filter(c => c.applicationId === item.id).map(coupon => (
                              <div key={coupon.code} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-green-600" />
                                  <div>
                                    <p className="text-sm font-semibold text-green-900">{coupon.code}</p>
                                    <p className="text-xs text-green-700">{coupon.message}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeCoupon(coupon.code, item.id)}
                                  className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[35%]">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-200 sticky top-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-600" />
                  Order Summary
                </h2>

                {/* Cart-wide Coupon */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                    <button
                      onClick={() => applyCoupon(couponCode)}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                    >
                      {applyingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {couponSuccess}
                    </p>
                  )}
                </div>

                {/* Applied Cart Coupons */}
                {appliedCoupons.filter(c => c.scope === "cart").map(coupon => (
                  <div key={coupon.code} className="mb-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">{coupon.code}</p>
                        <p className="text-xs text-green-700">{coupon.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCoupon(coupon.code)}
                      className="p-1 text-green-600 hover:text-green-700 hover:bg-green-100 rounded transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
                    <span className="font-semibold">{formatPrice(subtotal, cart[0]?.currency)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        Discount
                      </span>
                      <span className="font-semibold">-{formatPrice(totalDiscount, cart[0]?.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 text-sm">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-purple-600" />
                      Instant Digital Delivery
                    </span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {formatPrice(finalTotal, cart[0]?.currency)}
                  </span>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Proceed to Checkout
                    </>
                  )}
                </button>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Secure checkout powered by VETTCODE</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Verified Code
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="w-4 h-4 text-purple-600" />
                      Instant Access
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
