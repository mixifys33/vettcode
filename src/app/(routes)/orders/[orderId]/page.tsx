"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import {
  Package, Clock, Truck, CheckCircle, XCircle, ArrowLeft, Loader2,
  MapPin, Phone, CreditCard, Calendar, Download, HelpCircle,
  Copy, Check, Shield, AlertTriangle, ShieldCheck, RefreshCw,
  User, Store, Tag, MessageCircle, Mail, FileText, Info,
} from "lucide-react";

const fmt = (n: number) => n?.toLocaleString("en-UG") ?? "0";

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    refund_in_progress: "bg-orange-100 text-orange-700",
    refunded: "bg-teal-100 text-teal-700",
  };
  const cls = map[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>{status?.replace(/_/g, " ") || "—"}</span>;
};

const Row = ({ label, value, mono = false }: { label: string; value?: any; mono?: boolean }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 flex-shrink-0 w-28">{label}</span>
      <span className={`text-sm text-gray-800 text-right min-w-0 ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>{value}</span>
    </div>
  );
};

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    if (user && orderId) fetchOrder();
  }, [user, orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/orders/${orderId}`);
      const d = res.data?.order || res.data?.data || res.data;
      setOrder(d);
    } catch (e) {
      console.error("Failed to fetch order:", e);
    } finally {
      setLoading(false);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(orderId as string);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadInvoice = () => {
    setDownloadingInvoice(true);
    try {
      const addr = order.customerInfo || {};
      const delivery = order.delivery || {};
      const total = (order.subtotal || 0) + (order.deliveryFee || 0);
      const shortId = (orderId as string).slice(-8).toUpperCase();
      const date = new Date(order.createdAt).toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric" });

      const itemRows = (order.items || []).map((item: any) =>
        `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb">${item.name || item.productName || "Product"}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right">UGX ${fmt(item.price)}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600">UGX ${fmt((item.price || 0) * (item.quantity || 1))}</td>
        </tr>`
      ).join("");

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice #${shortId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;color:#111;background:#fff;padding:40px;max-width:800px;margin:auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #0f766e}
    .brand{font-size:24px;font-weight:900;color:#0f766e}
    .brand span{color:#f59e0b}
    .invoice-meta{text-align:right;font-size:13px;color:#555}
    .invoice-meta h2{font-size:20px;color:#111;margin-bottom:4px}
    .section{margin-bottom:24px}
    .section h3{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#6b7280;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #e5e7eb}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:24px}
    .info-row{display:flex;gap:8px;margin-bottom:6px;font-size:13px}
    .info-label{color:#6b7280;min-width:90px;flex-shrink:0}
    .info-value{color:#111;font-weight:500}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th{background:#f3f4f6;padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#6b7280}
    th:last-child,td:last-child{text-align:right}
    th:nth-child(2),td:nth-child(2){text-align:center}
    .totals{margin-left:auto;width:280px;margin-top:16px}
    .totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6}
    .totals-row.grand{font-size:16px;font-weight:700;color:#0f766e;border-top:2px solid #0f766e;border-bottom:none;padding-top:10px;margin-top:4px}
    .badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:capitalize}
    .badge-paid{background:#d1fae5;color:#065f46}
    .badge-pending{background:#fef3c7;color:#92400e}
    .badge-cancelled{background:#fee2e2;color:#991b1b}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center}
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Easy<span>Shop</span><div style="font-size:11px;color:#6b7280;font-weight:400;margin-top:2px">Uganda's #1 Marketplace</div></div>
    <div class="invoice-meta">
      <h2>INVOICE</h2>
      <div>#${shortId}</div>
      <div>${date}</div>
    </div>
  </div>

  <div class="grid2" style="margin-bottom:24px">
    <div class="section">
      <h3>Bill To</h3>
      <div class="info-row"><span class="info-label">Name</span><span class="info-value">${addr.fullName || "—"}</span></div>
      <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${addr.phone || "—"}</span></div>
      <div class="info-row"><span class="info-label">Address</span><span class="info-value">${[addr.address, addr.city].filter(Boolean).join(", ") || "—"}</span></div>
      ${addr.notes ? `<div class="info-row"><span class="info-label">Notes</span><span class="info-value">${addr.notes}</span></div>` : ""}
    </div>
    <div class="section">
      <h3>Order Details</h3>
      <div class="info-row"><span class="info-label">Order ID</span><span class="info-value" style="font-family:monospace">${shortId}</span></div>
      <div class="info-row"><span class="info-label">Date</span><span class="info-value">${date}</span></div>
      <div class="info-row"><span class="info-label">Payment</span><span class="info-value">${order.paymentMethod?.replace(/_/g, " ") || "N/A"}</span></div>
      <div class="info-row"><span class="info-label">Status</span><span class="info-value"><span class="badge badge-${order.paymentStatus === "paid" ? "paid" : order.paymentStatus === "cancelled" ? "cancelled" : "pending"}">${order.paymentStatus || "pending"}</span></span></div>
      ${delivery.name ? `<div class="info-row"><span class="info-label">Delivery</span><span class="info-value">${delivery.name}${delivery.estimatedDays ? " · " + delivery.estimatedDays + " days" : ""}</span></div>` : ""}
    </div>
  </div>

  <div class="section">
    <h3>Items</h3>
    <table>
      <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Total</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>UGX ${fmt(order.subtotal)}</span></div>
      <div class="totals-row"><span>Delivery</span><span>${(order.deliveryFee || 0) > 0 ? "UGX " + fmt(order.deliveryFee) : "Free"}</span></div>
      <div class="totals-row grand"><span>Total</span><span>UGX ${fmt(total)}</span></div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for shopping with vettcode Uganda! &nbsp;|&nbsp; support@vettcode.ug &nbsp;|&nbsp; +256 700 000 000</p>
    <p style="margin-top:4px">This is a computer-generated invoice and does not require a signature.</p>
  </div>
</body>
</html>`;

      // Download as .html file — opens cleanly in any browser, no print dialog
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vettcode-Invoice-${shortId}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const getStatusStep = (status: string) => {
    const s = status?.toLowerCase().replace(/_/g, "");
    return Math.max(["pending", "processing", "shipped", "outfordelivery", "delivered"].indexOf(s) + 1, 1);
  };

  const statusSteps = [
    { key: "pending", label: "Placed", icon: Clock },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "outfordelivery", label: "Delivering", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  if (userLoading || loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  if (!user) return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><h2 className="text-xl font-semibold">Please login</h2><Link href="/login" className="bg-teal-600 text-white px-6 py-2 rounded-lg">Login</Link></div>;
  if (!order) return <div className="flex flex-col items-center justify-center min-h-screen gap-4"><h2 className="text-xl font-semibold">Order not found</h2><button onClick={() => router.back()} className="text-teal-600 hover:underline">Go back</button></div>;

  const isCancelled = order.status?.toLowerCase() === "cancelled";
  const currentStep = getStatusStep(order.status);
  const addr = order.customerInfo || {};
  const delivery = order.delivery || {};
  const total = (order.subtotal || 0) + (order.deliveryFee || 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-xl transition"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">Order #{(orderId as string)?.slice(-8)?.toUpperCase()}</h1>
              <button onClick={copyId} className="p-1 hover:bg-gray-100 rounded" title="Copy order ID">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleDateString("en-UG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button onClick={fetchOrder} className="p-2 hover:bg-white rounded-xl transition" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-5 flex items-center gap-2"><Package className="w-4 h-4 text-teal-600" />Order Status</h2>
          {isCancelled ? (
            <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl">
              <XCircle className="w-10 h-10 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-700">Order Cancelled</p>
                {order.refundDetails?.notes && <p className="text-sm text-red-600 mt-0.5">{order.refundDetails.notes}</p>}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex justify-between">
                {statusSteps.map((step, i) => {
                  const done = currentStep > i + 1, curr = currentStep === i + 1;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${done || curr ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className={`mt-1.5 text-[10px] sm:text-xs font-medium text-center ${done || curr ? "text-teal-600" : "text-gray-400"}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-gray-100 -z-10 mx-5">
                <div className="h-full bg-teal-600 transition-all" style={{ width: `${((currentStep - 1) / 4) * 100}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT — Items + full details */}
          <div className="lg:col-span-2 space-y-4">

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-teal-600" />Items ({order.items?.length || 0})
              </h2>
              <div className="space-y-3">
                {(order.items || []).map((item: any, i: number) => (
                  <div key={i} className="flex gap-3 pb-3 border-b last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative">
                      {(item.image || item.productImage) ? (
                        <Image src={item.image || item.productImage} alt={item.name || "Product"} fill className="object-cover" unoptimized
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-gray-300" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-2">{item.name || item.productName || item.title || "Product"}</p>
                      {item.productId && <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {item.productId}</p>}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-500">Qty: <strong>{item.quantity}</strong> × UGX {fmt(item.price)}</span>
                        <span className="text-sm font-bold text-teal-700">UGX {fmt((item.price || 0) * (item.quantity || 1))}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-600" />Delivery Details</h2>
              <Row label="Recipient" value={addr.fullName} />
              <Row label="Phone" value={addr.phone} />
              <Row label="Address" value={[addr.address, addr.city].filter(Boolean).join(", ") || addr.notes} />
              <Row label="City" value={addr.city} />
              <Row label="Notes" value={addr.notes} />
              <Row label="Method" value={delivery.name} />
              <Row label="Type" value={delivery.type} />
              <Row label="Est. Days" value={delivery.estimatedDays ? `${delivery.estimatedDays} days` : undefined} />
              <Row label="Delivery Fee" value={delivery.fee ? `UGX ${fmt(delivery.fee)}` : undefined} />
            </div>

            {/* Buyer Info */}
            {order.buyerInfo && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-teal-600" />Buyer Info</h2>
                <Row label="Name" value={order.buyerInfo.name} />
                <Row label="Email" value={order.buyerInfo.email} />
                <Row label="Phone" value={order.buyerInfo.phone} />
                <Row label="User ID" value={order.buyerInfo.userId} mono />
              </div>
            )}

            {/* Refund Details */}
            {order.refundDetails && (order.refundDetails.method || order.refundDetails.notes) && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <h2 className="font-semibold text-orange-800 mb-3 flex items-center gap-2"><RefreshCw className="w-4 h-4" />Refund Details</h2>
                <Row label="Method" value={order.refundDetails.method} />
                <Row label="Reference" value={order.refundDetails.reference} mono />
                <Row label="Refund #" value={order.refundDetails.refundNumber} mono />
                <Row label="Notes" value={order.refundDetails.notes} />
                {order.refundDetails.completedAt && <Row label="Completed" value={new Date(order.refundDetails.completedAt).toLocaleDateString("en-UG")} />}
              </div>
            )}

            {/* Proof Images */}
            {order.proofImages?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-teal-600" />Payment Proof</h2>
                <div className="flex gap-2 flex-wrap">
                  {order.proofImages.map((img: any, i: number) => (
                    <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                        <Image src={img.url} alt={`Proof ${i + 1}`} fill className="object-cover" unoptimized />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Payment + IDs + Actions */}
          <div className="space-y-4">

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-teal-600" />Payment</h2>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600 capitalize">{order.paymentMethod?.replace(/_/g, " ") || "N/A"}</span>
                <StatusBadge status={order.paymentStatus || "pending"} />
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>UGX {fmt(order.subtotal)}</span></div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>{(order.deliveryFee || 0) > 0 ? `UGX ${fmt(order.deliveryFee)}` : "Free"}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                  <span>Total</span>
                  <span className="text-teal-700">UGX {fmt(total)}</span>
                </div>
              </div>
            </div>

            {/* Order IDs */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-teal-600" />Order Info</h2>
              <Row label="Order ID" value={(orderId as string)?.slice(-8).toUpperCase()} mono />
              <Row label="Full ID" value={(orderId as string)} mono />
              <Row label="Seller ID" value={order.sellerId} mono />
              <Row label="User ID" value={order.userId} mono />
              <Row label="Created" value={new Date(order.createdAt).toLocaleString("en-UG")} />
              {order.updatedAt && <Row label="Updated" value={new Date(order.updatedAt).toLocaleString("en-UG")} />}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={downloadInvoice}
                disabled={downloadingInvoice}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition disabled:opacity-50"
              >
                {downloadingInvoice ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download Invoice
              </button>

              <button
                onClick={() => setShowHelp(!showHelp)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl font-medium text-gray-700 transition"
              >
                <HelpCircle className="w-4 h-4" />Need Help?
              </button>

              {showHelp && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2.5 text-sm">
                  <p className="font-semibold text-blue-800">Contact Support</p>
                  <a href="mailto:dwightkim12@gmail.com" className="flex items-center gap-2 text-blue-700 hover:underline">
                    <Mail className="w-4 h-4 flex-shrink-0" />dwightkim12@gmail.com
                  </a>
                  <a href="mailto:shopeasy352@gmail.com" className="flex items-center gap-2 text-blue-700 hover:underline">
                    <Mail className="w-4 h-4 flex-shrink-0" />shopeasy352@gmail.com
                  </a>
                  <a href="tel:+256761819885" className="flex items-center gap-2 text-blue-700 hover:underline">
                    <Phone className="w-4 h-4 flex-shrink-0" />+256 761 819 885
                  </a>
                  <a href="https://wa.me/256761819885" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-700 hover:underline">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />WhatsApp: +256 761 819 885
                  </a>
                  <p className="text-xs text-blue-600 pt-1">Mon–Sat 8AM–8PM · Sun 10AM–6PM</p>
                  <p className="text-xs text-gray-500 font-mono">Ref: {(orderId as string)?.slice(-8).toUpperCase()}</p>
                </div>
              )}

              <Link href="/profile?tab=orders" className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl font-medium text-gray-700 transition">
                <ArrowLeft className="w-4 h-4" />Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
