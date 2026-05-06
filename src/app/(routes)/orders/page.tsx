"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import {
  Package, Clock, Truck, CheckCircle, XCircle, Search,
  Loader2, RefreshCw, ShoppingBag, ArrowLeft, Calendar,
  ChevronDown, ChevronUp, MapPin, CreditCard, Phone,
  Eye, RotateCcw, Inbox, ShieldCheck,
} from "lucide-react";

interface OrderItem {
  productId?: string;
  name?: string;
  productName?: string;
  image?: string;
  productImage?: string;
  price?: number;
  quantity?: number;
  category?: string;
}

interface Order {
  _id: string;
  id?: string;
  orderNumber?: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  createdAt: string;
  items: OrderItem[];
  subtotal?: number;
  deliveryFee?: number;
  total?: number;
  buyerInfo?: { name: string; email: string; phone: string };
  customerInfo?: { fullName: string; phone: string; address: string; city: string };
  shippingAddress?: { fullName: string; phone: string; addressLine1: string; city: string; country: string };
  proofImages?: { url: string }[];
  delivery?: { name: string; fee: number; estimatedDays: string };
  refundDetails?: { method: string; reference: string; completedAt: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pending:            { label: "Pending",          color: "text-amber-700",  bg: "bg-amber-50 border-amber-200",   icon: <Clock className="w-4 h-4 text-amber-500" /> },
  processing:         { label: "Processing",       color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     icon: <Package className="w-4 h-4 text-blue-500" /> },
  shipped:            { label: "Shipped",          color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <Truck className="w-4 h-4 text-purple-500" /> },
  out_for_delivery:   { label: "Out for Delivery", color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: <Truck className="w-4 h-4 text-orange-500" /> },
  delivered:          { label: "Delivered",        color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  completed:          { label: "Completed",        color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  cancelled:          { label: "Cancelled",        color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: <XCircle className="w-4 h-4 text-red-500" /> },
  refund_in_progress: { label: "Refund Pending",   color: "text-rose-700",   bg: "bg-rose-50 border-rose-200",     icon: <RotateCcw className="w-4 h-4 text-rose-500" /> },
  refunded:           { label: "Refunded",         color: "text-teal-700",   bg: "bg-teal-50 border-teal-200",     icon: <ShieldCheck className="w-4 h-4 text-teal-500" /> },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:        { label: "Awaiting Payment", color: "text-amber-600" },
  submitted:      { label: "Proof Submitted",  color: "text-blue-600" },
  paid:           { label: "Paid ✓",           color: "text-green-600" },
  refund_pending: { label: "Refund Pending",   color: "text-rose-600" },
  refunded:       { label: "Refunded",         color: "text-teal-600" },
};

const FILTERS = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

function getStatus(s: string) {
  const key = s?.toLowerCase().replace(/ /g, "_") || "pending";
  return STATUS_CONFIG[key] || { label: s, color: "text-gray-700", bg: "bg-gray-50 border-gray-200", icon: <Package className="w-4 h-4 text-gray-500" /> };
}

function canCancel(status: string) {
  return ["pending", "processing"].includes(status?.toLowerCase());
}

function getTotal(o: Order) {
  return (o.subtotal || 0) + (o.deliveryFee || 0) || o.total || 0;
}

function getItemImage(item: OrderItem) { return item.productImage || item.image || ""; }
function getItemName(item: OrderItem)  { return item.productName  || item.name  || item.productId || "Product"; }

// ── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onCancel }: { order: Order; onCancel: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const st = getStatus(order.status);
  const orderId = order._id || order.id || "";
  const orderNum = order.orderNumber || orderId.slice(-8).toUpperCase();
  const total = getTotal(order);
  const ps = PAYMENT_STATUS[order.paymentStatus] || { label: order.paymentStatus, color: "text-gray-500" };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await axiosInstance.post(`/api/orders/${orderId}/cancel`);
      onCancel(orderId);
      setShowConfirm(false);
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${st.bg}`}>{st.icon}</div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Order #{orderNum}</p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              {new Date(order.createdAt).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${st.bg} ${st.color}`}>{st.label}</span>
          <span className={`text-xs font-medium ${ps.color}`}>{ps.label}</span>
        </div>
      </div>

      {/* Items preview */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 flex-shrink-0">
            {order.items.slice(0, 3).map((item, i) => (
              <div key={i} className="w-12 h-12 rounded-xl border-2 border-white bg-gray-100 overflow-hidden shadow-sm flex-shrink-0">
                {getItemImage(item)
                  ? <Image src={getItemImage(item)} alt={getItemName(item)} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                  : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                }
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-xl border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                +{order.items.length - 3}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 truncate">
              {order.items.slice(0, 2).map(i => getItemName(i)).join(", ")}
              {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-black text-gray-900">UGX {total.toLocaleString()}</p>
            {order.deliveryFee ? <p className="text-xs text-gray-400">+UGX {order.deliveryFee.toLocaleString()} delivery</p> : null}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            {canCancel(order.status) && !showConfirm && (
              <button onClick={() => setShowConfirm(true)} className="flex items-center gap-1.5 text-xs text-red-600 font-semibold px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 transition">
                <XCircle className="w-3.5 h-3.5" /> Cancel Order
              </button>
            )}
            {showConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Confirm cancel?</span>
                <button onClick={handleCancel} disabled={cancelling} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition disabled:opacity-60 flex items-center gap-1">
                  {cancelling && <Loader2 className="w-3 h-3 animate-spin" />} Yes, Cancel
                </button>
                <button onClick={() => setShowConfirm(false)} className="text-xs text-gray-500 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition">No</button>
              </div>
            )}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs text-[#115061] font-semibold px-3 py-1.5 border border-[#115061]/20 rounded-lg hover:bg-[#115061]/5 transition">
            <Eye className="w-3.5 h-3.5" />
            {expanded ? "Hide" : "Details"}
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50/50">
          {/* Items */}
          <div className="px-5 py-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items Ordered</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {getItemImage(item)
                      ? <Image src={getItemImage(item)} alt={getItemName(item)} width={56} height={56} className="object-cover w-full h-full" unoptimized />
                      : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{getItemName(item)}</p>
                    {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                    <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">UGX {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
                    {(item.quantity || 1) > 1 && <p className="text-xs text-gray-400">UGX {(item.price || 0).toLocaleString()} each</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="px-5 pb-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>UGX {(order.subtotal || 0).toLocaleString()}</span></div>
              {order.deliveryFee ? (
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                  <span>UGX {order.deliveryFee.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-gray-100 text-base">
                <span>Total</span><span className="text-[#115061]">UGX {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Address + Payment */}
          <div className="px-5 pb-4 grid sm:grid-cols-2 gap-3">
            {(order.shippingAddress?.fullName || order.customerInfo?.fullName) && (
              <div className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-pink-500" /> Delivery Address
                </p>
                <p className="font-semibold text-gray-800 text-sm">{order.shippingAddress?.fullName || order.customerInfo?.fullName}</p>
                <p className="text-xs text-gray-500">{order.shippingAddress?.addressLine1 || order.customerInfo?.address}</p>
                <p className="text-xs text-gray-500">{order.shippingAddress?.city || order.customerInfo?.city}</p>
                {(order.shippingAddress?.phone || order.customerInfo?.phone) && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3" />{order.shippingAddress?.phone || order.customerInfo?.phone}</p>
                )}
              </div>
            )}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-purple-500" /> Payment
              </p>
              <p className="font-semibold text-gray-800 text-sm capitalize">{order.paymentMethod?.replace(/_/g, " ") || "—"}</p>
              <span className={`text-xs font-semibold ${ps.color}`}>{ps.label}</span>
              {order.delivery?.name && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Truck className="w-3 h-3" />{order.delivery.name} · {order.delivery.estimatedDays} days</p>
              )}
            </div>
          </div>

          {/* Proof images */}
          {order.proofImages && order.proofImages.length > 0 && (
            <div className="px-5 pb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Proof</p>
              <div className="flex gap-2">
                {order.proofImages.map((img, i) => (
                  <a key={i} href={img.url} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 hover:opacity-80 transition">
                    <Image src={img.url} alt={`Proof ${i + 1}`} fill className="object-cover" unoptimized />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Refund details */}
          {order.refundDetails?.reference && (
            <div className="px-5 pb-4">
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-1 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Refund Details</p>
                <p className="text-sm text-teal-800">Method: {order.refundDetails.method}</p>
                <p className="text-sm text-teal-800">Reference: {order.refundDetails.reference}</p>
                {order.refundDetails.completedAt && <p className="text-xs text-teal-600 mt-1">{new Date(order.refundDetails.completedAt).toLocaleDateString()}</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const uid = (user as any).id || (user as any)._id;
      const res = await axiosInstance.get(`/api/orders?userId=${uid}`);
      const raw = res.data?.orders || res.data?.data?.orders || res.data || [];
      setOrders(Array.isArray(raw) ? raw : []);
    } catch { setOrders([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, [user]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = (id: string) => {
    setOrders(prev => prev.map(o =>
      (o._id === id || o.id === id) ? { ...o, status: "refund_in_progress", paymentStatus: "refund_pending" } : o
    ));
  };

  const filtered = orders.filter(o => {
    const matchFilter = filter === "all" || o.status?.toLowerCase() === filter;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || (o._id || o.id || "").toLowerCase().includes(q)
      || (o.orderNumber || "").toLowerCase().includes(q)
      || o.items?.some(i => getItemName(i).toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "all" ? orders.length : orders.filter(o => o.status?.toLowerCase() === f).length;
    return acc;
  }, {} as Record<string, number>);

  if (userLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 animate-spin text-[#115061]" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <ShoppingBag className="w-16 h-16 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-800">Please log in to view your orders</h2>
      <Link href="/login" className="bg-[#115061] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0d3f4d] transition">Log In</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900">My Orders</h1>
              <p className="text-xs text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
            </div>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-[#115061] font-semibold px-3 py-2 border border-[#115061]/20 rounded-xl hover:bg-[#115061]/5 transition disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or product name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#115061]/30 focus:border-[#115061] transition"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                filter === f
                  ? "bg-[#115061] text-white shadow-md shadow-[#115061]/20"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#115061]/30 hover:text-[#115061]"
              }`}
            >
              {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              {counts[f] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${filter === f ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 border-4 border-[#115061]/20 border-t-[#115061] rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading your orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Inbox className="w-10 h-10 text-gray-400" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-1">{filter !== "all" ? `No ${filter} orders` : "No orders yet"}</h3>
              <p className="text-gray-500 text-sm">{filter !== "all" ? "Try a different filter" : "Your orders will appear here once you shop"}</p>
            </div>
            <Link href="/" className="flex items-center gap-2 bg-[#115061] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0d3f4d] transition">
              <ShoppingBag className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard key={order._id || order.id} order={order} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

