"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Upload, Camera, X, CheckCircle, XCircle,
  AlertCircle, Loader2, ShieldCheck, RefreshCw, CreditCard,
  Smartphone, Building2, ChevronDown, ChevronUp
} from "lucide-react";
import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { generateOrderRef } from "@/utils/generateOrderRef";

const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

const METHOD_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  mtn:    { label: "MTN Mobile Money", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  airtel: { label: "Airtel Money",     color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  bank:   { label: "Bank Transfer",    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
};

interface ProofImage {
  file: File;
  preview: string;
  uploading: boolean;
  url: string | null;
  fileId: string | null;
}

interface VerifyResult {
  verified: boolean | null;
  confidence: string;
  checks: Record<string, { pass: boolean; found?: string; expected?: string; note?: string }>;
  summary: string;
  rejectionReason?: string | null;
  perImageResults?: Array<{
    verified: boolean | null;
    imageIndex: number;
    summary: string;
    rejectionReason?: string | null;
    checks?: Record<string, any>;
  }>;
  duplicateWarning?: string | null;
}

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useUser();
  const clearCart = useStore((s: any) => s.clearCart);

  // Parse order data from URL
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingOrderData");
    if (!raw) { router.replace("/cart"); return; }
    try { setOrderData(JSON.parse(raw)); } catch { router.replace("/cart"); }
  }, []);

  const [proofImages, setProofImages] = useState<ProofImage[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [expandedSeller, setExpandedSeller] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate a short unique reference once per payment session
  const [orderRef] = useState<string>(() => generateOrderRef());

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#115061]" />
      </div>
    );
  }

  const { orderPayload, sellerPayments, paymentMethod, total, shippingAddress } = orderData;
  const allProductNames = orderPayload.flatMap((o: any) => o.items || []).map((i: any) => i.name || i.productName).filter(Boolean).join(", ");

  // Get payment details — try the exact sellerId, then fall back to first available entry
  const getPaymentDetail = (sellerId: string) => {
    const p = sellerPayments[sellerId]
      || sellerPayments[Object.keys(sellerPayments)[0]]
      || {};
    if (paymentMethod === "mtn")    return { number: p.mtnNumber,         name: p.mtnName,         extra: null };
    if (paymentMethod === "airtel") return { number: p.airtelNumber,      name: p.airtelName,      extra: null };
    if (paymentMethod === "bank")   return { number: p.bankAccountNumber, name: p.bankAccountName, extra: [p.bankName, p.bankBranch].filter(Boolean).join(" · ") };
    return {};
  };

  const getSellerPayment = (sellerId: string) =>
    sellerPayments[sellerId] || sellerPayments[Object.keys(sellerPayments)[0]] || {};

  const meta = METHOD_META[paymentMethod] || METHOD_META.mtn;
  const firstSellerId = orderPayload[0]?.sellerId;
  const detail = getPaymentDetail(firstSellerId);
  const amountDue = orderPayload.reduce((s: number, o: any) => s + (o.subtotal || 0) + (o.deliveryFee || 0), 0);

  // Upload a proof image to ImageKit
  const uploadImage = async (file: File): Promise<{ url: string; fileId: string } | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(",")[1];
        if (!base64) { resolve(null); return; }
        try {
          const res = await fetch(`${BACKEND}/api/imagekit/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64, fileName: `proof_${Date.now()}.jpg`, folder: "payment_proofs" }),
          });
          const data = await res.json();
          if (data.success && data.url) resolve({ url: data.url, fileId: data.fileId });
          else resolve(null);
        } catch { resolve(null); }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 2 - proofImages.length;
    const toProcess = Array.from(files).slice(0, remaining);

    for (const file of toProcess) {
      const preview = URL.createObjectURL(file);
      const entry: ProofImage = { file, preview, uploading: true, url: null, fileId: null };
      setProofImages(prev => [...prev, entry]);

      const result = await uploadImage(file);
      setProofImages(prev => prev.map(img =>
        img.preview === preview
          ? { ...img, uploading: false, url: result?.url || null, fileId: result?.fileId || null }
          : img
      ));

      // Auto-verify when 2nd image is uploaded
      setProofImages(prev => {
        const ready = prev.filter(i => i.url);
        if (ready.length >= 2) {
          setTimeout(() => verifyPayment(ready.map(i => i.url!)), 100);
        }
        return prev;
      });
    }
  };

  const removeImage = async (idx: number) => {
    const img = proofImages[idx];
    if (img.fileId) {
      fetch(`${BACKEND}/api/imagekit/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: img.fileId }),
      }).catch(() => {});
    }
    URL.revokeObjectURL(img.preview);
    setProofImages(prev => prev.filter((_, i) => i !== idx));
    setVerifyResult(null);
  };

  const verifyPayment = async (imageUrls: string[]) => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const p = getSellerPayment(firstSellerId);
      const expectedPhone = paymentMethod === "mtn" ? p.mtnNumber : paymentMethod === "airtel" ? p.airtelNumber : p.bankAccountNumber;
      const expectedName  = paymentMethod === "mtn" ? p.mtnName  : paymentMethod === "airtel" ? p.airtelName  : p.bankAccountName;

      const res = await fetch(`${BACKEND}/api/payment-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrls,
          expectedAmount: amountDue,
          expectedRecipientName: expectedName,
          expectedPhone,
          productNames: orderRef,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (data.success) setVerifyResult(data.result);
      else setVerifyResult({ verified: null, confidence: "low", checks: {}, summary: "Could not verify automatically. You can still proceed.", rejectionReason: null });
    } catch {
      setVerifyResult({ verified: null, confidence: "low", checks: {}, summary: "Verification unavailable. You can still proceed.", rejectionReason: null });
    } finally {
      setVerifying(false);
    }
  };

  const submitOrder = async () => {
    const uploaded = proofImages.filter(i => i.url);
    if (uploaded.length < 2) { setError("Please upload 2 payment proof screenshots."); return; }

    setPlacing(true);
    setError("");
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
      const proofPayload = uploaded.map(i => ({ url: i.url, fileId: i.fileId }));

      const results = await Promise.all(orderPayload.map(async (body: any) => {
        const uid = user?.id || user?._id || "";

        // Remap item fields to match the backend schema (name/image not productName/productImage)
        const normalisedItems = (body.items || []).map((item: any) => ({
          productId: item.productId,
          name: item.productName || item.name || "Product",
          image: item.productImage || item.image || "",
          price: item.price || 0,
          quantity: item.quantity || 1,
          category: item.category || "",
        }));

        const finalBody = {
          ...body,
          items: normalisedItems,
          userId: uid,
          shippingAddress,
          paymentMethod,
          proofImages: proofPayload,
          paymentStatus: "submitted",
          orderRef,
          buyerInfo: {
            userId: uid,
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
          },
        };
        const res = await fetch(`${BACKEND}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(finalBody),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.orderId || data._id || null;
      }));

      const placedIds = results.filter(Boolean) as string[];

      if (placedIds.length > 0) {
        sessionStorage.removeItem("pendingOrderData");
        clearCart();
        // Pass the first orderId so the success page can fetch details
        router.replace(`/order-success?orderId=${placedIds[0]}`);
      } else if (results.some(r => r !== null)) {
        sessionStorage.removeItem("pendingOrderData");
        clearCart();
        router.replace("/orders");
      } else {
        setError("Order could not be placed. Please try again.");
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  const uploadedCount = proofImages.filter(i => i.url).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Complete Payment</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">Follow the payment details below, then upload 2 screenshots of your payment confirmation. Our AI will verify them automatically.</p>
        </div>

        {/* Payment instructions per seller */}
        {orderPayload.map((order: any) => {
          const sid = order.sellerId;
          const d = getPaymentDetail(sid);
          const orderAmount = (order.subtotal || 0) + (order.deliveryFee || 0);
          const isExpanded = expandedSeller === sid;

          return (
            <div key={sid} className="bg-white rounded-xl border overflow-hidden">
              {/* Amount due */}
              <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50">
                <span className="text-sm text-gray-600">Amount Due</span>
                <span className="text-xl font-bold text-gray-900">UGX {orderAmount.toLocaleString()}</span>
              </div>

              {/* Method card */}
              <div className="p-5">
                <div className={`flex items-center gap-4 p-4 rounded-xl border-2`} style={{ borderColor: meta.border, backgroundColor: meta.bg }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: meta.color }}>
                    {paymentMethod === "bank" ? <Building2 className="w-6 h-6 text-white" /> : <Smartphone className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{meta.label}</p>
                    {d.name && <p className="text-sm text-gray-600">{d.name}</p>}
                    <p className="text-sm font-mono font-semibold" style={{ color: meta.color }}>{d.number || "Not configured"}</p>
                    {d.extra && <p className="text-xs text-gray-500">{d.extra}</p>}
                  </div>
                  <CheckCircle className="w-6 h-6 flex-shrink-0" style={{ color: meta.color }} />
                </div>

                {/* Step-by-step instructions */}
                <div className="mt-4 rounded-xl border-l-4 bg-gray-50 p-4" style={{ borderLeftColor: meta.color }}>
                  {paymentMethod !== "bank" ? (
                    <>
                      <p className="text-sm font-semibold text-gray-800 mb-3">How to pay via {meta.label}:</p>
                      {[
                        `Dial *165#`,
                        `Select "Send Money"`,
                        `Enter number: ${d.number || "—"}`,
                        `Enter amount: UGX ${orderAmount.toLocaleString()}`,
                        `Reference: ${orderRef}`,
                        `Confirm and send`,
                      ].map((step, i) => (
                        <p key={i} className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold text-gray-500">{i + 1}.</span> {step}
                        </p>
                      ))}
                      {d.name && (
                        <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg p-3">
                          <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-orange-700">Only confirm if recipient name shown is exactly: <strong>{d.name}</strong></p>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-gray-800 mb-3">Bank Transfer Details:</p>
                      {[
                        ["Bank", getSellerPayment(sid).bankName],
                        ["Account Name", d.name],
                        ["Account No", d.number],
                        ["Branch", getSellerPayment(sid).bankBranch],
                        ["Amount", `UGX ${orderAmount.toLocaleString()}`],
                        ["Reference", orderRef],
                      ].filter(([, v]) => v).map(([label, val]) => (
                        <p key={label} className="text-sm text-gray-700 mb-1">
                          <span className="font-semibold">{label}:</span> {val}
                        </p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Proof Upload Section */}
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Upload Payment Proof</h3>
            </div>
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${uploadedCount >= 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
              {uploadedCount}/2
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">Upload 2 screenshots of your payment confirmation. AI will verify them automatically.</p>

          {/* Thumbnails */}
          {proofImages.length > 0 && (
            <div className="flex gap-3 mb-4">
              {proofImages.map((img, idx) => (
                <div key={idx} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  <Image src={img.preview} alt={`Proof ${idx + 1}`} fill className="object-cover" unoptimized />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                      <span className="text-white text-xs">Uploading...</span>
                    </div>
                  )}
                  {!img.uploading && img.url && (
                    <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {!img.uploading && (
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload buttons */}
          {proofImages.length < 2 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleFileSelect(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={proofImages.some(i => i.uploading)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 transition disabled:opacity-50"
              >
                <Upload className="w-5 h-5" />
                {proofImages.length === 0 ? "Upload Screenshot 1 of 2" : "Upload Screenshot 2 of 2"}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">Click to choose from your files</p>
            </>
          )}

          {/* AI Verification result */}
          {verifying && (
            <div className="mt-4 flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin flex-shrink-0" />
              <p className="text-sm text-purple-700">AI is verifying each screenshot independently...</p>
            </div>
          )}

          {!verifying && verifyResult && (
            <div className={`mt-4 rounded-xl border p-4 ${
              verifyResult.verified === true ? "bg-green-50 border-green-200" :
              verifyResult.verified === false ? "bg-red-50 border-red-200" :
              "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {verifyResult.verified === true
                  ? <CheckCircle className="w-5 h-5 text-green-600" />
                  : verifyResult.verified === false
                  ? <XCircle className="w-5 h-5 text-red-600" />
                  : <AlertCircle className="w-5 h-5 text-yellow-600" />
                }
                <span className={`font-semibold text-sm ${
                  verifyResult.verified === true ? "text-green-700" :
                  verifyResult.verified === false ? "text-red-700" : "text-yellow-700"
                }`}>
                  {verifyResult.verified === true ? "Both Screenshots Verified" :
                   verifyResult.verified === false ? "Verification Failed" : "Could Not Verify"}
                </span>
                <span className="ml-auto text-xs bg-white/70 px-2 py-0.5 rounded-full text-gray-600 border">
                  {verifyResult.confidence} confidence
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{verifyResult.summary}</p>
              {verifyResult.rejectionReason && (
                <p className="text-sm text-red-600 mb-3">{verifyResult.rejectionReason}</p>
              )}

              {/* Per-image results */}
              {verifyResult.perImageResults && (
                <div className="space-y-2 mb-3">
                  {verifyResult.perImageResults.map((r: any, idx: number) => (
                    <div key={idx} className={`flex items-start gap-2 p-2.5 rounded-lg text-xs ${
                      r.verified === true ? "bg-green-100 text-green-800" :
                      r.verified === false ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {r.verified === true
                        ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        : r.verified === false
                        ? <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        : <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      }
                      <div>
                        <span className="font-semibold">Screenshot {r.imageIndex}:</span> {r.summary}
                        {r.rejectionReason && <p className="mt-0.5 opacity-80">{r.rejectionReason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {verifyResult.verified === false && (
                <button
                  onClick={() => { setProofImages([]); setVerifyResult(null); }}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Re-upload Screenshots
                </button>
              )}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="bg-white rounded-xl border px-5 py-4 flex items-center justify-between">
          <span className="text-gray-600">Total</span>
          <span className="text-2xl font-bold text-gray-900">UGX {total.toLocaleString()}</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Confirm button */}
        <button
          onClick={submitOrder}
          disabled={placing || verifying || uploadedCount < 2}
          className="w-full flex items-center justify-center gap-3 py-4 bg-[#115061] text-white rounded-xl font-bold text-lg hover:bg-[#0d3f4d] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {placing
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
            : uploadedCount < 2
            ? `Upload proof (${uploadedCount}/2) to confirm`
            : <><ShieldCheck className="w-5 h-5" /> I've Paid — Confirm Order</>
          }
        </button>

        <p className="text-xs text-center text-gray-400">
          Your order will be confirmed after payment verification. <Link href="/orders" className="underline">View orders</Link>
        </p>
      </div>
    </div>
  );
}
