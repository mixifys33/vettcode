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
  Loader2, Minus, Plus, Trash2, ShoppingBag, MapPin, 
  CreditCard, Smartphone, Truck, Tag, ChevronDown, 
  CheckCircle, AlertCircle, Percent, X, Plus as PlusIcon,
  Heart, Share2, ExternalLink, Save, ShoppingCart, Info,
  Package, Navigation
} from "lucide-react";

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  region: string;
  country: string;
  isDefault: boolean;
}

interface AppliedCoupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  discountAmount: number;
  message: string;
  scope: "cart" | "product";
  productId?: string;
  createdBy: "admin" | "seller";
}

interface DeliveryZone {
  name: string;
  fee: number;
  estimatedDays: string;
  active: boolean;
}

interface SellerDelivery {
  sellerId: string;
  shopName: string;
  offersDelivery: boolean;
  offersPickup: boolean;
  freeDeliveryThreshold: number;
  zones: DeliveryZone[];
  matchedZone: DeliveryZone | null;
}

interface PickupStation {
  id: string;
  name: string;
  address: string;
  district: string;
  region: string;
  city: string;
  company: string;
  phone: string;
  deliveryFee: number;
  operatingHours?: string;
}

// Fuzzy match: check if two location strings are similar
function locationMatch(zoneName: string, userLocation: string): boolean {
  if (!zoneName || !userLocation) return false;
  const z = zoneName.toLowerCase().trim();
  const u = userLocation.toLowerCase().trim();
  if (z === u) return true;
  if (z.includes(u) || u.includes(z)) return true;
  // Check word overlap
  const zWords = z.split(/[\s,/-]+/).filter(w => w.length > 2);
  const uWords = u.split(/[\s,/-]+/).filter(w => w.length > 2);
  return zWords.some(w => uWords.includes(w));
}

// Safely extract a string ID from a value that may be an object or string
function extractId(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val?._id?.toString() || val?.id?.toString() || null;
  return String(val);
}

// Get the seller ID string from a cart item
function getCartItemSellerId(item: any): string | null {
  return extractId(item.sellerId) || extractId(item.shopId) || null;
}

const CartPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const cart = useStore((state: any) => state.cart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const updateCartQuantity = useStore((state: any) => state.updateCartQuantity);
  const clearCart = useStore((state: any) => state.clearCart);
  
  // States
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("flutterwave_card");
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [appliedCoupons, setAppliedCoupons] = useState<AppliedCoupon[]>([]);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [productCouponInputs, setProductCouponInputs] = useState<Record<string, string>>({});
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Delivery state
  const [defaultPickupStation, setDefaultPickupStation] = useState<PickupStation | null>(null);
  const [sellerDeliveries, setSellerDeliveries] = useState<SellerDelivery[]>([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Seller payment methods state
  const [sellerPayments, setSellerPayments] = useState<Record<string, any>>({});
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Load default pickup station from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("defaultPickupStationData");
      if (raw) setDefaultPickupStation(JSON.parse(raw));
    } catch {}
  }, []);

  // Fetch user addresses
  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  // Fetch seller delivery zones when cart or selected address changes
  useEffect(() => {
    if (cart.length > 0) fetchSellerDeliveryZones();
  }, [cart, selectedAddressId, addresses]);

  // Fetch seller payment methods when cart changes
  useEffect(() => {
    if (cart.length > 0) fetchSellerPayments();
  }, [cart]);

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await axiosInstance.get("/api/user/addresses");
      const addressList = res.data?.addresses || [];
      setAddresses(addressList);
      const defaultAddr = addressList.find((a: Address) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addressList.length > 0) setSelectedAddressId(addressList[0].id);
    } catch (error: any) {
      if (error?.response?.status !== 404) console.error("Failed to fetch addresses:", error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const fetchSellerDeliveryZones = async () => {
    const sellerIds = [...new Set(
      cart.map((item: any) => getCartItemSellerId(item)).filter(Boolean)
    )] as string[];
    if (sellerIds.length === 0) return;

    setDeliveryLoading(true);
    try {
      const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const results = await Promise.all(
        sellerIds.map(id =>
          fetch(`${SERVER}/api/sellers/${id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );

      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const userCity = selectedAddress?.city || "";
      const userRegion = selectedAddress?.region || "";

      const deliveries: SellerDelivery[] = sellerIds.map((id, i) => {
        const data = results[i];
        const seller = data?.seller || data;
        const delivery = seller?.delivery || {};
        const zones: DeliveryZone[] = (delivery.zones || []).filter((z: DeliveryZone) => z.active);
        const shopName = seller?.shop?.shopName || "Shop";

        // Find best matching zone for user's address
        let matchedZone: DeliveryZone | null = null;
        if (zones.length > 0 && (userCity || userRegion)) {
          matchedZone = zones.find(z =>
            locationMatch(z.name, userCity) || locationMatch(z.name, userRegion)
          ) || null;
        }

        return {
          sellerId: id,
          shopName,
          offersDelivery: delivery.offersDelivery || false,
          offersPickup: delivery.offersPickup || false,
          freeDeliveryThreshold: delivery.freeDeliveryThreshold || 0,
          zones,
          matchedZone,
        };
      });

      setSellerDeliveries(deliveries);
    } catch (e) {
      console.error("Failed to fetch seller delivery zones", e);
    } finally {
      setDeliveryLoading(false);
    }
  };

  const fetchSellerPayments = async () => {
    const sellerIds = [...new Set(
      cart.map((item: any) => getCartItemSellerId(item)).filter(Boolean)
    )] as string[];
    if (sellerIds.length === 0) return;
    setPaymentsLoading(true);
    try {
      const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
      const results = await Promise.all(
        sellerIds.map(id =>
          fetch(`${SERVER}/api/sellers/payment/${id}`)
            .then(r => r.ok ? r.json() : null)
            .catch(() => null)
        )
      );
      const map: Record<string, any> = {};
      sellerIds.forEach((id, i) => {
        if (results[i]?.payment) map[id] = results[i].payment;
      });
      setSellerPayments(map);

      // Auto-select best payment method
      const multiSeller = sellerIds.length > 1;
      if (multiSeller) {
        setPaymentMethod("mtn"); // default for multi-seller
      } else if (sellerIds.length === 1) {
        const p = map[sellerIds[0]] || {};
        if (p.preferredMethod && p.preferredMethod !== 'all' && p.preferredMethod !== '') {
          setPaymentMethod(p.preferredMethod);
        } else if (p.mtnNumber) setPaymentMethod("mtn");
        else if (p.airtelNumber) setPaymentMethod("airtel");
        else if (p.bankAccountNumber) setPaymentMethod("bank");
        else setPaymentMethod("mtn");
      }
    } catch (e) {
      console.error("Failed to fetch seller payments", e);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Calculate subtotal (before discounts)
  const subtotal = useMemo(() => {
    return cart.reduce((total: number, item: any) => {
      const price = Number(item.sale_price) || Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return total + (qty * price);
    }, 0);
  }, [cart]);

  // Calculate total discount from all coupons
  const totalDiscount = useMemo(() => {
    return appliedCoupons.reduce((sum, coupon) => sum + coupon.discountAmount, 0);
  }, [appliedCoupons]);

  // Check if ALL products support cash on delivery (only show COD if every item supports it)
  const allProductsSupportCOD = useMemo(() => {
    if (cart.length === 0) return false;
    return cart.every((item: any) => 
      item.cash_on_delivery === "Yes" || 
      item.cash_on_delivery === "yes" ||
      item.cash_on_delivery === true ||
      item.cashOnDelivery === "Yes" ||
      item.cashOnDelivery === "yes" ||
      item.cashOnDelivery === true
    );
  }, [cart]);

  // For display purposes - show which items support COD
  const codSupportedItems = useMemo(() => {
    return cart.filter((item: any) => 
      item.cash_on_delivery === "Yes" || 
      item.cash_on_delivery === "yes" ||
      item.cash_on_delivery === true ||
      item.cashOnDelivery === "Yes" ||
      item.cashOnDelivery === "yes" ||
      item.cashOnDelivery === true
    );
  }, [cart]);

  // Items that don't support COD (for showing warning)
  const nonCodItems = useMemo(() => {
    return cart.filter((item: any) => 
      !(item.cash_on_delivery === "Yes" || 
        item.cash_on_delivery === "yes" ||
        item.cash_on_delivery === true ||
        item.cashOnDelivery === "Yes" ||
        item.cashOnDelivery === "yes" ||
        item.cashOnDelivery === true)
    );
  }, [cart]);

  // Calculate shipping from matched seller zones (or fallback)
  const shippingCost = useMemo(() => {
    if (defaultPickupStation) {
      const totalQty = cart.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 1), 0);
      return (defaultPickupStation.deliveryFee || 0) * totalQty;
    }
    if (sellerDeliveries.length === 0) return 0;
    return sellerDeliveries.reduce((total, sd) => {
      if (!sd.offersDelivery) return total;
      const sellerItems = cart.filter((item: any) => getCartItemSellerId(item) === sd.sellerId);
      const sellerSubtotal = sellerItems.reduce((s: number, item: any) => s + (Number(item.sale_price) || Number(item.price) || 0) * (item.quantity || 1), 0);
      if (sd.freeDeliveryThreshold > 0 && sellerSubtotal >= sd.freeDeliveryThreshold) return total;
      if (sd.matchedZone) {
        const sellerQty = sellerItems.reduce((s: number, item: any) => s + (Number(item.quantity) || 1), 0);
        return total + sd.matchedZone.fee * sellerQty;
      }
      return total;
    }, 0);
  }, [sellerDeliveries, defaultPickupStation, cart]);

  // Final total
  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - totalDiscount + shippingCost);
  }, [subtotal, totalDiscount, shippingCost]);

  const decreaseQuantity = (id: string) => {
    const item = cart.find((item: any) => item.id === id);
    if (item && item.quantity > 1) {
      updateCartQuantity(id, item.quantity - 1, user, location, deviceInfo);
    }
  };

  const increaseQuantity = (id: string) => {
    const item = cart.find((item: any) => item.id === id);
    if (item) {
      updateCartQuantity(id, item.quantity + 1, user, location, deviceInfo);
    }
  };

  const removeItem = (id: string) => {
    removeFromCart(id, user, location, deviceInfo);
    // Remove any product-specific coupons for this item
    setAppliedCoupons(prev => prev.filter(c => c.productId !== id));
  };

  // Apply coupon (cart-wide or product-specific)
  const applyCoupon = async (code: string, productId?: string) => {
    if (!code.trim()) {
      if (productId) {
        return;
      }
      setCouponError("Please enter a coupon code");
      return;
    }

    // Check if coupon already applied
    const alreadyApplied = appliedCoupons.find(
      c => c.code.toUpperCase() === code.trim().toUpperCase() && 
      ((!productId && c.scope === "cart") || c.productId === productId)
    );
    
    if (alreadyApplied) {
      if (!productId) setCouponError("This coupon is already applied");
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
          productId,
          cartItems: cart.map((item: any) => ({
            id: item.id,
            shopId: item.shopId || item.sellerId,
            price: Number(item.sale_price) || Number(item.price) || 0,
            quantity: item.quantity || 1
          }))
        }),
      });
      const data = await response.json();

      if (!data.valid) {
        if (!productId) setCouponError(data.message || "Invalid coupon code");
        return;
      }

      const newCoupon: AppliedCoupon = {
        code: code.trim().toUpperCase(),
        type: data.type || "percentage",
        value: data.value || data.discountPercent || 0,
        discountAmount: data.discountAmount || 0,
        message: data.message || "Coupon applied",
        scope: productId ? "product" : "cart",
        productId,
        createdBy: data.createdBy || "seller"
      };

      setAppliedCoupons(prev => [...prev, newCoupon]);
      
      if (!productId) {
        setCouponSuccess(data.message || "Coupon applied successfully!");
        setCouponCode("");
      } else {
        setProductCouponInputs(prev => ({ ...prev, [productId]: "" }));
      }
    } catch (error: any) {
      console.error("Coupon apply error", error);
      if (!productId) {
        setCouponError(error.response?.data?.message || "Failed to apply coupon");
      }
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = (couponCode: string, productId?: string) => {
    setAppliedCoupons(prev => 
      prev.filter(c => !(c.code === couponCode && c.productId === productId))
    );
    setCouponSuccess("");
  };

  // Get item price after product-specific discounts
  const getItemDiscountedPrice = (item: any) => {
    const basePrice = Number(item.sale_price) || Number(item.price) || 0;
    const productCoupon = appliedCoupons.find(c => c.productId === item.id);
    
    if (!productCoupon) return basePrice;
    
    if (productCoupon.type === "percentage") {
      return basePrice * (1 - productCoupon.value / 100);
    }
    return Math.max(0, basePrice - productCoupon.value);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (!selectedAddressId && addresses.length > 0) {
      setCouponError("Please select a shipping address");
      return;
    }

    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }

    setLoading(true);
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      
      if (!selectedAddress) {
        setCouponError("Please select a valid shipping address");
        setLoading(false);
        return;
      }

      // Transform cart items to match order service expected format
      const orderItems = cart.map((item: any) => ({
        productId: item.id,
        productName: item.title || item.name || "Product",
        productImage: item?.image || item?.images?.[0]?.url || item?.images?.[0] || "",
        variantId: item.variantId || undefined,
        shopId: getCartItemSellerId(item), // always a clean string
        quantity: item.quantity || 1,
        price: getItemDiscountedPrice(item),
        discount: totalDiscount / cart.length,
      }));

      // Transform address to match order service format
      const shippingAddress = {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        addressLine1: selectedAddress.street,
        addressLine2: selectedAddress.apartment || undefined,
        city: selectedAddress.city,
        state: selectedAddress.region || undefined,
        country: selectedAddress.country,
        postalCode: undefined,
      };

      // Determine payment gateway
      const paymentGateway = paymentMethod.startsWith("flutterwave") 
        ? "flutterwave" 
        : paymentMethod === "cash_on_delivery" 
          ? undefined 
          : "flutterwave";
      
      // Store order data for the payment page and navigate there
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";

      // Build per-seller order payloads (matching mobile frontend pattern)
      const sellerIds = [...new Set(orderItems.map((i: any) => i.shopId).filter(Boolean))] as string[];
      const perSellerPayload = sellerIds.length > 0
        ? sellerIds.map((sid, idx) => {
            const items = orderItems.filter((i: any) => i.shopId === sid);
            const sellerSubtotal = items.reduce((s: number, i: any) => s + i.price * (i.quantity || 1), 0);
            const sellerQty = items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);

            let deliveryFee = 0;
            if (defaultPickupStation) {
              // Pickup station: fee × qty per seller; only add to first seller to avoid double-counting
              deliveryFee = idx === 0 ? (defaultPickupStation.deliveryFee || 0) * sellerQty : 0;
            } else {
              const sellerDelivery = sellerDeliveries.find(sd => sd.sellerId === sid);
              if (sellerDelivery?.offersDelivery && sellerDelivery.matchedZone) {
                deliveryFee = sellerDelivery.matchedZone.fee * sellerQty;
              }
            }

            return {
              sellerId: sid,
              items,
              subtotal: sellerSubtotal,
              deliveryFee,
              currency: "UGX",
            };
          })
        : [{ sellerId: null, items: orderItems, subtotal, deliveryFee: shippingCost, currency: "UGX" }];

      sessionStorage.setItem("pendingOrderData", JSON.stringify({
        orderPayload: perSellerPayload,
        sellerPayments,
        paymentMethod,
        total: finalTotal,
        shippingAddress,
      }));

      router.push("/payment");
    } catch (error: any) {
      console.error("Checkout error", error);
      setCouponError(error?.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20 md:pb-0">
      <div className="w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%] mx-auto py-6 md:py-10">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Shopping Cart
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900">Cart ({cart.length} items)</span>
          </div>
        </div>

        {/* Empty Cart */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mb-4" />
            <p className="text-center text-gray-600 text-lg md:text-xl mb-6">
              Your cart is empty!
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-[65%] space-y-4">
              {cart.map((item: any) => {
                const hasProductCoupon = appliedCoupons.some(c => c.productId === item.id);
                const discountedPrice = getItemDiscountedPrice(item);
                const originalPrice = Number(item.sale_price) || Number(item.price) || 0;
                const supportsCOD = item.cash_on_delivery === "Yes" || item.cash_on_delivery === true;
                
                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      {/* Product Image - Clickable */}
                      <Link 
                        href={`/product/${item.slug || item.id}`}
                        className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                      >
                        <Image
                          src={item?.image || item?.images?.[0]?.url || item?.images?.[0] || "/placeholder.jpg"}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                        {supportsCOD && (
                          <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
                            COD
                          </span>
                        )}
                        {item.stock <= 5 && item.stock > 0 && (
                          <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
                            Only {item.stock} left
                          </span>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                          {item.title}
                        </h3>
                        
                        {item?.selectedOptions && (
                          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                            {item.selectedOptions.color && (
                              <span className="flex items-center gap-1">
                                Color:
                                <span
                                  className="w-4 h-4 rounded-full border"
                                  style={{ backgroundColor: item.selectedOptions.color }}
                                />
                              </span>
                            )}
                            {item.selectedOptions.size && (
                              <span>Size: {item.selectedOptions.size}</span>
                            )}
                          </div>
                        )}

                        {/* Price */}
                        <div className="flex items-center gap-2 mb-3">
                          {hasProductCoupon ? (
                            <>
                              <span className="text-lg font-bold text-green-600">
                                {formatPrice(discountedPrice)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(originalPrice)}
                              </span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                Discount Applied
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls & Actions */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() => decreaseQuantity(item.id)}
                                disabled={item.quantity <= 1}
                                className="p-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 min-w-[40px] text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => increaseQuantity(item.id)}
                                disabled={item.stock && item.quantity >= item.stock}
                                className="p-2 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                title={item.stock && item.quantity >= item.stock ? "Max stock reached" : "Increase quantity"}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Total: <span className="font-semibold text-gray-900">
                                {formatPrice(discountedPrice * item.quantity)}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/product/${item.slug || item.id}`}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>View Details</span>
                            </Link>
                            
                            <button
                              onClick={() => {
                                // Save for later functionality
                                const itemToSave = { ...item };
                                localStorage.setItem(`saved_${item.id}`, JSON.stringify(itemToSave));
                                removeItem(item.id);
                                alert("Item saved for later! Check 'Saved Items' section.");
                              }}
                              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 transition px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                              title="Save for later"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Save Later</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/product/${item.id}`;
                                if (navigator.share) {
                                  navigator.share({
                                    title: item.title,
                                    text: `Check out ${item.title} on Easy Shop!`,
                                    url: shareUrl
                                  }).catch(() => {});
                                } else {
                                  navigator.clipboard.writeText(shareUrl);
                                  alert("Product link copied to clipboard!");
                                }
                              }}
                              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 transition px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50"
                              title="Share product"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Share</span>
                            </button>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 ml-auto"
                              title="Remove from cart"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Discount Code Input */}
                    {item.discountCodes?.length > 0 && !hasProductCoupon && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-600">Have a discount code for this product?</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={productCouponInputs[item.id] || ""}
                            onChange={(e) => setProductCouponInputs(prev => ({ 
                              ...prev, 
                              [item.id]: e.target.value 
                            }))}
                            placeholder="Enter code"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={() => applyCoupon(productCouponInputs[item.id] || "", item.id)}
                            disabled={applyingCoupon}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Applied Product Coupon */}
                    {hasProductCoupon && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {appliedCoupons.filter(c => c.productId === item.id).map(coupon => (
                          <div key={coupon.code} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-700">
                                {coupon.code} - {coupon.message}
                              </span>
                            </div>
                            <button
                              onClick={() => removeCoupon(coupon.code, item.id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[35%]">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>

                {/* Cart-wide Coupon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                        setCouponSuccess("");
                      }}
                      placeholder="Enter promo code"
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => applyCoupon(couponCode)}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applyingCoupon ? <Loader2 className="w-5 h-5 animate-spin" /> : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      {couponSuccess}
                    </p>
                  )}
                </div>

                {/* Applied Cart Coupons */}
                {appliedCoupons.filter(c => c.scope === "cart").length > 0 && (
                  <div className="space-y-2">
                    {appliedCoupons.filter(c => c.scope === "cart").map(coupon => (
                      <div key={coupon.code} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-700">{coupon.code}</span>
                          <span className="text-sm text-green-600">-{formatPrice(coupon.discountAmount)}</span>
                          {coupon.createdBy === "admin" && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 rounded">EasyShop</span>
                          )}
                        </div>
                        <button onClick={() => removeCoupon(coupon.code)} className="text-green-600 hover:text-green-800">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <hr className="border-gray-200" />

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#115061]" />
                    Delivery Address
                  </label>

                  {/* If user has a default pickup station — it overrides everything */}
                  {defaultPickupStation ? (
                    <div className="rounded-xl border border-[#115061]/30 bg-[#115061]/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#115061] flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{defaultPickupStation.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{defaultPickupStation.address}</p>
                          {(defaultPickupStation.district || defaultPickupStation.region) && (
                            <p className="text-xs text-gray-400">{[defaultPickupStation.district, defaultPickupStation.region].filter(Boolean).join(", ")}</p>
                          )}
                          {defaultPickupStation.phone && (
                            <p className="text-xs text-gray-400">{defaultPickupStation.phone}</p>
                          )}
                          <span className="inline-block mt-1.5 text-[10px] bg-[#115061] text-white px-2 py-0.5 rounded-full">
                            Default Pickup Station
                          </span>
                        </div>
                      </div>
                      <Link href="/profile?tab=addresses" className="block mt-3 text-xs text-[#115061] hover:underline text-right">
                        Change pickup station →
                      </Link>
                    </div>
                  ) : (
                    <>
                      {addressesLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading addresses...
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-gray-300 p-4 text-center">
                          <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm mb-1">No saved address</p>
                          <p className="text-gray-400 text-xs mb-3">Add a home address or set a pickup station</p>
                          <div className="flex flex-col gap-2">
                            <Link href="/profile?tab=addresses" className="text-sm text-white bg-[#115061] px-4 py-2 rounded-lg hover:bg-[#0d3f4d] transition text-center">
                              + Add Home Address
                            </Link>
                            <Link href="/profile?tab=addresses" className="text-sm text-[#115061] border border-[#115061] px-4 py-2 rounded-lg hover:bg-[#115061]/5 transition text-center">
                              Set Pickup Station
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <>
                          <select
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#115061]/30 focus:border-[#115061] text-sm"
                          >
                            {addresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.label || "Address"} — {addr.street}, {addr.city}
                                {addr.isDefault ? " (Default)" : ""}
                              </option>
                            ))}
                          </select>

                          {/* Delivery zones info per seller */}
                          {deliveryLoading ? (
                            <div className="flex items-center gap-2 text-gray-400 text-xs mt-3">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Checking delivery options...
                            </div>
                          ) : sellerDeliveries.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {sellerDeliveries.map(sd => {
                                const sellerSubtotal = cart
                                  .filter((item: any) => getCartItemSellerId(item) === sd.sellerId)
                                  .reduce((s: number, item: any) => s + (Number(item.sale_price) || Number(item.price) || 0) * (item.quantity || 1), 0);
                                const isFree = sd.freeDeliveryThreshold > 0 && sellerSubtotal >= sd.freeDeliveryThreshold;

                                return (
                                  <div key={sd.sellerId} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <Truck className="w-3.5 h-3.5 text-[#115061]" />
                                      <span className="text-xs font-semibold text-gray-700">{sd.shopName}</span>
                                    </div>
                                    {!sd.offersDelivery ? (
                                      <p className="text-xs text-orange-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        This seller doesn't offer home delivery
                                      </p>
                                    ) : isFree ? (
                                      <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Free delivery (order qualifies)
                                      </p>
                                    ) : sd.matchedZone ? (
                                      <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-600 flex items-center gap-1">
                                          <Navigation className="w-3 h-3 text-[#115061]" />
                                          {sd.matchedZone.name}
                                          {sd.matchedZone.estimatedDays && (
                                            <span className="text-gray-400"> · {sd.matchedZone.estimatedDays} days</span>
                                          )}
                                        </p>
                                        <span className="text-xs font-semibold text-gray-800">
                                          {(() => {
                                            const qty = cart.filter((item: any) => getCartItemSellerId(item) === sd.sellerId).reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
                                            const total = sd.matchedZone!.fee * qty;
                                            return total === 0 ? "Free" : `UGX ${total.toLocaleString()}`;
                                          })()}
                                        </span>
                                      </div>
                                    ) : sd.zones.length > 0 ? (
                                      <p className="text-xs text-amber-600 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        No delivery zone matches your address
                                      </p>
                                    ) : (
                                      <p className="text-xs text-gray-400">No delivery zones configured</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <Link href="/profile?tab=addresses" className="block mt-2 text-xs text-[#115061] hover:underline text-right">
                            Manage addresses →
                          </Link>
                        </>
                      )}
                    </>
                  )}
                </div>

                <hr className="border-gray-200" />

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Payment Method
                  </label>

                  {paymentsLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading payment options...
                    </div>
                  ) : (() => {
                    // Aggregate available methods across all sellers
                    const allPayments = Object.values(sellerPayments);
                    const multiSeller = Object.keys(sellerPayments).length > 1;

                    const hasMtn    = multiSeller || allPayments.some((p: any) => p.mtnNumber);
                    const hasAirtel = multiSeller || allPayments.some((p: any) => p.airtelNumber);
                    const hasBank   = !multiSeller && allPayments.some((p: any) => p.bankAccountNumber);
                    const hasCOD    = !multiSeller && allProductsSupportCOD;

                    // If no seller data yet, show all options as fallback
                    const showAll = allPayments.length === 0;

                    const mtnDetail   = !multiSeller && allPayments[0]?.mtnNumber   ? `${allPayments[0].mtnName ? allPayments[0].mtnName + ' · ' : ''}${allPayments[0].mtnNumber}` : null;
                    const airtelDetail = !multiSeller && allPayments[0]?.airtelNumber ? `${allPayments[0].airtelName ? allPayments[0].airtelName + ' · ' : ''}${allPayments[0].airtelNumber}` : null;
                    const bankDetail  = !multiSeller && allPayments[0]?.bankAccountNumber ? `${allPayments[0].bankName || ''} · ${allPayments[0].bankAccountNumber}` : null;

                    return (
                      <div className="space-y-2">
                        {multiSeller && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-2">
                            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700">Items from multiple sellers — MTN MoMo is the default. Each seller will be paid separately.</p>
                          </div>
                        )}

                        {(hasMtn || showAll) && (
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                            paymentMethod === "mtn" ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-gray-300"
                          }`}>
                            <input type="radio" name="payment" value="mtn" checked={paymentMethod === "mtn"} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-yellow-600" />
                            <Smartphone className="w-5 h-5 text-yellow-600" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">MTN Mobile Money</p>
                              {mtnDetail && <p className="text-xs text-gray-500">{mtnDetail}</p>}
                            </div>
                          </label>
                        )}

                        {(hasAirtel || showAll) && (
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                            paymentMethod === "airtel" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                          }`}>
                            <input type="radio" name="payment" value="airtel" checked={paymentMethod === "airtel"} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-red-600" />
                            <Smartphone className="w-5 h-5 text-red-500" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">Airtel Money</p>
                              {airtelDetail && <p className="text-xs text-gray-500">{airtelDetail}</p>}
                            </div>
                          </label>
                        )}

                        {(hasBank || showAll) && (
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                            paymentMethod === "bank" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                          }`}>
                            <input type="radio" name="payment" value="bank" checked={paymentMethod === "bank"} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-blue-600" />
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">Bank Transfer</p>
                              {bankDetail && <p className="text-xs text-gray-500">{bankDetail}</p>}
                            </div>
                          </label>
                        )}

                        {hasCOD && (
                          <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                            paymentMethod === "cash_on_delivery" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                          }`}>
                            <input type="radio" name="payment" value="cash_on_delivery" checked={paymentMethod === "cash_on_delivery"} onChange={e => setPaymentMethod(e.target.value)} className="w-4 h-4 text-green-600" />
                            <Truck className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 text-sm">Cash on Delivery</p>
                              <p className="text-xs text-gray-500">Pay when you receive</p>
                            </div>
                          </label>
                        )}

                        {!allProductsSupportCOD && codSupportedItems.length > 0 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-yellow-700">
                                <span className="font-medium">COD not available</span> — {nonCodItems.length} item(s) don't support it.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <hr className="border-gray-200" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal ({cart.length} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Discount</span>
                      <span>-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}

                  {/* Per-seller delivery fees */}
                  {!defaultPickupStation && sellerDeliveries.length > 0 && (
                    <div className="space-y-1.5">
                      {sellerDeliveries.map(sd => {
                        if (!sd.offersDelivery) return null;
                        const sellerSubtotal = cart
                          .filter((item: any) => getCartItemSellerId(item) === sd.sellerId)
                          .reduce((s: number, item: any) => s + (Number(item.sale_price) || Number(item.price) || 0) * (item.quantity || 1), 0);
                        const isFree = sd.freeDeliveryThreshold > 0 && sellerSubtotal >= sd.freeDeliveryThreshold;
                        const fee = isFree ? 0 : sd.matchedZone?.fee ?? null;

                        return (
                          <div key={sd.sellerId} className="flex justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3.5 h-3.5 text-gray-400" />
                              Delivery · {sd.shopName}
                            </span>
                            <span className={fee === 0 ? "text-green-600 font-medium" : fee === null ? "text-amber-500" : ""}>
                              {fee === null ? "N/A" : fee === 0 ? "Free" : (() => {
                                const qty = cart.filter((item: any) => getCartItemSellerId(item) === sd.sellerId).reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
                                return formatPrice(fee * qty);
                              })()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {defaultPickupStation && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-gray-400" />
                        Pickup delivery fee
                        {defaultPickupStation.deliveryFee > 0 && (
                          <span className="text-gray-400 text-xs">
                            × {cart.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0)} items
                          </span>
                        )}
                      </span>
                      <span className={defaultPickupStation.deliveryFee === 0 ? "text-green-600 font-medium" : "font-medium text-gray-800"}>
                        {defaultPickupStation.deliveryFee === 0 ? "Free" : formatPrice(defaultPickupStation.deliveryFee * cart.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0))}
                      </span>
                    </div>
                  )}

                  {!defaultPickupStation && sellerDeliveries.length === 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Delivery fee</span>
                      <span>—</span>
                    </div>
                  )}

                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || cart.length === 0 || (addresses.length > 0 && !selectedAddressId)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Processing..." : "Proceed to Payment"}
                </button>

                {paymentMethod === "cash_on_delivery" && (
                  <p className="text-xs text-center text-gray-500">
                    You'll pay {formatPrice(finalTotal)} when your order is delivered
                  </p>
                )}

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Secure Checkout
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Truck className="w-4 h-4 text-blue-500" />
                    Fast Delivery
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
