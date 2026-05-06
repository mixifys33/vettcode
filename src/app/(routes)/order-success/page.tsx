"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle, Package, Mail, Home, Clock, MapPin,
  CreditCard, Phone, Loader2, Star, ShoppingBag,
  ArrowRight, Sparkles, Gift, Heart,
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import { useStore } from "@/store";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  currency: string;
  subtotal: number;
  shippingCost: number;
  shippingFee?: number;
  tax: number;
  taxAmount?: number;
  total: number;
  totalAmount?: number;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    country: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    category?: string;
  }>;
}

interface RecommendedProduct {
  id: string;
  title: string;
  slug: string;
  images: Array<{ url: string }>;
  sale_price: number;
  regular_price: number;
  ratings: number;
  category: string;
}

// ── Confetti particle ─────────────────────────────────────────────────────────
const COLORS = ["#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#ef4444","#06b6d4","#84cc16"];
function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      r: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    let frame: number;
    let done = false;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        if (p.shape === "rect") ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
        p.x += p.vx; p.y += p.vy; p.angle += p.spin;
      });
      if (!done) frame = requestAnimationFrame(draw);
    };
    draw();
    const t = setTimeout(() => { done = true; cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height); }, 4000);
    return () => { done = true; cancelAnimationFrame(frame); clearTimeout(t); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />;
}

// ── Floating emoji decoration ─────────────────────────────────────────────────
const EMOJIS = ["🌸","🎉","🎉","🎉","✨","🌺","🎊","💐","⭐","🌟","🎁","💫"];
function FloatingEmojis() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {EMOJIS.map((e, i) => (
        <span
          key={i}
          className="absolute text-2xl select-none"
          style={{
            left: `${5 + (i * 9.5) % 90}%`,
            top: `${10 + (i * 13) % 70}%`,
            animation: `floatEmoji ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            opacity: 0.6,
          }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}

// ── Main content ──────────────────────────────────────────────────────────────
const OrderSuccessContent = () => {
  const searchParams = useSearchParams();
  const clearCart = useStore((state: any) => state.clearCart);
  const addToCart = useStore((state: any) => state.addToCart);

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    setMounted(true);
    setShowConfetti(true);
    clearCart();
    if (orderId) fetchOrderDetails();
    else setLoading(false);
  }, [orderId]);

  const fetchRecommendations = async (orderData: OrderDetails) => {
    try {
      const categories = [...new Set(orderData.items.map(i => i.category).filter(Boolean))];
      const excludeIds = orderData.items.map(i => i.productId).join(",");
      const res = await axiosInstance.get("/api/products/recommendations", {
        params: { categories: categories.join(","), excludeIds, limit: 8 },
      });
      if (res.data.success) setRecommendations(res.data.products || []);
    } catch {
      try {
        const fb = await axiosInstance.get("/api/products?limit=8&sort=popular");
        const ids = new Set(orderData.items.map(i => i.productId));
        setRecommendations((fb.data.products || []).filter((p: any) => !ids.has(p.id)).slice(0, 8));
      } catch { /* silent */ }
    }
  };

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/orders/${orderId}`);
      const raw = res.data?.order || res.data?.data || res.data;
      if (raw && (raw._id || raw.id)) {
        const o: OrderDetails = {
          id: raw._id || raw.id,
          orderNumber: raw.orderNumber || (raw._id || raw.id).toString().slice(-6).toUpperCase(),
          status: raw.status || "pending",
          paymentStatus: raw.paymentStatus || "submitted",
          paymentMethod: raw.paymentMethod || "",
          currency: raw.currency || "UGX",
          subtotal: raw.subtotal || 0,
          shippingCost: raw.deliveryFee || raw.shippingCost || raw.shippingFee || 0,
          tax: raw.tax || raw.taxAmount || 0,
          total: (raw.subtotal || 0) + (raw.deliveryFee || 0) || raw.total || raw.totalAmount || 0,
          createdAt: raw.createdAt || new Date().toISOString(),
          shippingAddress: {
            fullName: raw.shippingAddress?.fullName || raw.customerInfo?.fullName || "",
            phone: raw.shippingAddress?.phone || raw.customerInfo?.phone || "",
            addressLine1: raw.shippingAddress?.addressLine1 || raw.customerInfo?.address || "",
            city: raw.shippingAddress?.city || raw.customerInfo?.city || "",
            country: raw.shippingAddress?.country || "Worldwide",
          },
          items: (raw.items || []).map((item: any) => ({
            productId: item.productId || "",
            productName: item.productName || item.name || "Product",
            productImage: item.productImage || item.image || "",
            quantity: item.quantity || 1,
            price: item.price || 0,
            category: item.category || "",
          })),
        };
        setOrder(o);
        fetchRecommendations(o);
      } else {
        setError("Order details not found");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2e38] via-[#115061] to-[#0d3f4d]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg">Loading your order...</p>
        </div>
      </div>
    );
  }

  const orderTotal = order ? (order.subtotal + order.shippingCost) || order.total || 0 : 0;
  const orderShipping = order?.shippingCost || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {showConfetti && <Confetti />}

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-br from-[#0a2e38] via-[#115061] to-[#0d3f4d] overflow-hidden">
        <FloatingEmojis />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-400 rounded-full filter blur-[100px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-teal-400 rounded-full filter blur-[100px] opacity-15 animate-pulse" style={{ animationDelay: "1s" }} />

        <div className={`relative z-10 max-w-3xl mx-auto px-4 py-16 text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          {/* Animated checkmark */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center animate-bounce" style={{ animationDuration: "2s" }}>
              <CheckCircle className="w-12 h-12 text-green-400" strokeWidth={1.5} />
            </div>
            <span className="absolute -top-2 -right-2 text-3xl animate-spin" style={{ animationDuration: "4s" }}>✨</span>
            <span className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDuration: "3s" }}>🌸</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
            Thank You! 🎉
          </h1>
          <p className="text-white/80 text-lg mb-4">
            Your order has been placed successfully.
          </p>
          {order?.orderNumber && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-4">
              <Package className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-mono font-bold tracking-wider">Order #{order.orderNumber}</span>
            </div>
          )}
          <p className="text-white/60 text-sm">
            {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-UG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-12 text-gray-50" preserveAspectRatio="none">
            <path d="M0 60L60 50C120 40 240 20 360 18C480 16 600 26 720 30C840 34 960 32 1080 28C1200 24 1320 16 1380 12L1440 8V60H0Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Payment status banner ── */}
        <div className={`rounded-2xl p-5 flex items-start gap-4 transition-all duration-500 delay-100 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${
          order?.paymentStatus === "paid" ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${order?.paymentStatus === "paid" ? "bg-green-500" : "bg-amber-500"}`}>
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className={`font-bold text-sm ${order?.paymentStatus === "paid" ? "text-green-800" : "text-amber-800"}`}>
              {order?.paymentStatus === "paid" ? "Payment Confirmed ✓" : "Payment Proof Submitted — Under Review"}
            </p>
            <p className={`text-xs mt-0.5 ${order?.paymentStatus === "paid" ? "text-green-600" : "text-amber-600"}`}>
              {order?.paymentStatus === "paid"
                ? "Your payment has been verified and confirmed."
                : "Our team will review your proof within a few hours and notify you."}
            </p>
          </div>
        </div>

        {/* ── Items ordered ── */}
        {order && order.items.length > 0 && (
          <div className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-500 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="px-6 py-4 border-b bg-gradient-to-r from-[#115061]/5 to-transparent flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#115061]" />
              <h2 className="font-bold text-gray-900">Items Ordered ({order.items.length})</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                    {item.productImage ? (
                      <Image src={item.productImage} alt={item.productName} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Qty: {item.quantity}</span>
                      {item.category && <span className="text-xs text-gray-400">{item.category}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">UGX {(item.price * item.quantity).toLocaleString()}</p>
                    {item.quantity > 1 && <p className="text-xs text-gray-400">UGX {item.price.toLocaleString()} each</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="px-6 py-4 bg-gray-50 border-t space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>UGX {(order.subtotal || 0).toLocaleString()}</span>
              </div>
              {orderShipping > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Delivery</span>
                  <span>UGX {orderShipping.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Paid</span>
                <span className="text-[#115061]">UGX {orderTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Delivery + Payment row ── */}
        <div className={`grid sm:grid-cols-2 gap-4 transition-all duration-500 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          {order?.shippingAddress?.fullName && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Delivery Address</h3>
              </div>
              <p className="font-semibold text-gray-800 text-sm">{order.shippingAddress.fullName}</p>
              {order.shippingAddress.addressLine1 && <p className="text-gray-500 text-xs mt-0.5">{order.shippingAddress.addressLine1}</p>}
              <p className="text-gray-500 text-xs">{[order.shippingAddress.city, order.shippingAddress.country].filter(Boolean).join(", ")}</p>
              {order.shippingAddress.phone && (
                <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />{order.shippingAddress.phone}
                </p>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Payment Method</h3>
            </div>
            <p className="font-semibold text-gray-800 text-sm capitalize">{order?.paymentMethod?.replace(/_/g, " ") || "—"}</p>
            <span className={`inline-block mt-2 text-xs px-2.5 py-1 rounded-full font-semibold ${
              order?.paymentStatus === "paid" ? "bg-green-100 text-green-700" :
              order?.paymentStatus === "submitted" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {order?.paymentStatus === "submitted" ? "Under Review" : order?.paymentStatus || "Pending"}
            </span>
          </div>
        </div>

        {/* ── What happens next ── */}
        <div className={`bg-gradient-to-br from-[#115061] to-[#0d3f4d] rounded-2xl p-6 transition-all duration-500 delay-[400ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-white">What Happens Next</h2>
          </div>
          <div className="space-y-4">
            {[
              { icon: "🔍", title: "Payment Review", desc: "Our team reviews your proof within a few hours" },
              { icon: "📦", title: "Order Preparation", desc: "Seller is notified and starts preparing your items" },
              { icon: "🚚", title: "Shipping", desc: "Your order is packed and dispatched to you" },
              { icon: "🎁", title: "Delivery", desc: "Receive your order and enjoy!" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-lg">{step.icon}</div>
                <div>
                  <p className="text-white font-semibold text-sm">{step.title}</p>
                  <p className="text-white/60 text-xs mt-0.5">{step.desc}</p>
                </div>
                {i < 3 && <div className="absolute ml-4 mt-9 w-0.5 h-4 bg-white/20" />}
              </div>
            ))}
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className={`flex flex-col sm:flex-row gap-3 transition-all duration-500 delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <Link href="/orders" className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#115061] text-white rounded-2xl font-bold hover:bg-[#0d3f4d] transition-all hover:scale-[1.02] shadow-lg shadow-[#115061]/30">
            <Package className="w-5 h-5" />
            Track My Order
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-[#115061] hover:text-[#115061] transition-all hover:scale-[1.02]">
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        {/* ── You Might Also Like ── */}
        {recommendations.length > 0 && (
          <div className={`transition-all duration-500 delay-[600ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-black text-gray-900">You Might Also Like</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendations.slice(0, 8).map((product, i) => {
                const discount = product.regular_price > product.sale_price
                  ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
                  : 0;
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 hover:border-[#115061]/30 hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.jpg"}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">
                          -{discount}%
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2 mb-2 leading-tight">{product.title}</p>
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-2.5 h-2.5 ${j < Math.round(product.ratings || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-sm font-black text-[#115061]">UGX {product.sale_price?.toLocaleString()}</p>
                      {discount > 0 && (
                        <p className="text-[10px] text-gray-400 line-through">UGX {product.regular_price?.toLocaleString()}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-center text-gray-400 text-xs pb-4">
          Questions? <Link href="/contact" className="text-[#115061] underline">Contact support</Link> · <Link href="/orders" className="text-[#115061] underline">View all orders</Link>
        </p>
      </div>

      <style jsx global>{`
        @keyframes floatEmoji {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
};

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a2e38] to-[#115061]">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

