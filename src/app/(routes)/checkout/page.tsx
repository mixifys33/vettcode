"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useUser from "@/hooks/useUser";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import { 
  CreditCard, Wallet, CheckCircle, Loader2, MapPin, Phone, Mail, 
  Package, Shield, ArrowLeft, Smartphone, Truck, AlertCircle,
  Copy, Check
} from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const orderId = searchParams.get("orderId");

  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileProvider, setMobileProvider] = useState("mtn");
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setOrderLoading(false);
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setOrderLoading(true);
    try {
      const res = await axiosInstance.get(`/api/orders/${orderId}`);
      const data = res.data;
      
      console.log("Fetched order data:", data);
      
      // Handle different response formats
      const order = data.order || data.data || data;
      
      if (!order || !order._id) {
        throw new Error("Invalid order data received");
      }
      
      setOrderDetails(order);
      
      // Set payment method from order if available
      if (order.paymentMethod) {
        setPaymentMethod(order.paymentMethod);
      }
      
      // Pre-fill mobile number if available
      if (user?.phone) {
        setMobileNumber(user.phone);
      } else if (order.shippingAddress?.phone) {
        setMobileNumber(order.shippingAddress.phone);
      }
    } catch (error: any) {
      console.error("Failed to fetch order", error);
      setPaymentError(error?.response?.data?.error || error?.message || "Failed to load order details");
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderId || !orderDetails) {
      setPaymentError("Order not found. Please try again.");
      return;
    }

    // Validate mobile number for mobile money
    if (paymentMethod === "flutterwave_mobilemoney" && !mobileNumber) {
      setPaymentError("Please enter your mobile money number");
      return;
    }

    setLoading(true);
    setPaymentError("");
    
    try {
      const res = await axiosInstance.post("/api/payment/process", {
        orderId,
        paymentMethod,
        paymentGateway: "flutterwave",
        amount: orderDetails.total || orderDetails.subtotal,
        currency: orderDetails.currency || "UGX",
        customerEmail: user?.email || orderDetails.shippingAddress?.email,
        customerPhone: mobileNumber || orderDetails.shippingAddress?.phone,
        customerName: user?.name || orderDetails.shippingAddress?.fullName,
        mobileProvider: paymentMethod === "flutterwave_mobilemoney" ? mobileProvider : undefined,
        redirectUrl: `${window.location.origin}/orders/${orderId}?payment=success`,
      });

      const data = res.data;

      if (data.success) {
        // If Flutterwave returns a payment link, redirect to it
        if (data.paymentLink || data.link) {
          window.location.href = data.paymentLink || data.link;
          return;
        }
        
        // For direct success (like test mode)
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 3000);
      } else {
        setPaymentError(data.message || "Payment initialization failed");
      }
    } catch (error: any) {
      console.error("Payment error", error);
      setPaymentError(error.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDeliveryConfirm = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      await axiosInstance.patch(`/api/orders/${orderId}/status`, {
        status: "confirmed",
        paymentStatus: "pending",
        paymentMethod: "cash_on_delivery"
      });
      
      setPaymentSuccess(true);
      setTimeout(() => {
        router.push(`/orders/${orderId}`);
      }, 3000);
    } catch (error: any) {
      setPaymentError(error.response?.data?.message || "Failed to confirm order");
    } finally {
      setLoading(false);
    }
  };

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  const formatPrice = (amount: number) => {
    return `UGX ${(amount || 0).toLocaleString()}`;
  };

  // Payment Success Screen
  if (paymentSuccess) {
    const isCOD = paymentMethod === "cash_on_delivery";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-md w-full">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {isCOD ? "Order Confirmed!" : "Payment Successful!"}
          </h2>
          <p className="text-gray-600 mb-6">
            {isCOD 
              ? "Your order has been placed. You'll pay when it's delivered."
              : "Your payment has been processed successfully."
            }
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <div className="flex items-center justify-center gap-2">
              <p className="font-mono font-bold text-gray-900">{orderId?.slice(-8)?.toUpperCase()}</p>
              <button onClick={copyOrderId} className="text-gray-400 hover:text-gray-600">
                {copiedOrderId ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            View Order Details
          </button>
          <Link href="/" className="block mt-4 text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Loading State
  if (orderLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // No Order Found
  if (!orderId || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Order Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find your order. Please go back to cart and try again.
          </p>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  const isCashOnDelivery = orderDetails.paymentMethod === "cash_on_delivery" || paymentMethod === "cash_on_delivery";
  const total = orderDetails.total || (orderDetails.subtotal + (orderDetails.shippingCost || 0) - (orderDetails.totalDiscount || 0));

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12 pb-24 md:pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Link href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
          {isCashOnDelivery ? "Confirm Your Order" : "Complete Payment"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Shipping Address
              </h2>
              <div className="space-y-2 text-gray-700">
                <p className="font-medium text-lg">{orderDetails.shippingAddress?.fullName || user?.name}</p>
                <p className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  {orderDetails.shippingAddress?.phone || user?.phone || "N/A"}
                </p>
                {(orderDetails.shippingAddress?.email || user?.email) && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {orderDetails.shippingAddress?.email || user?.email}
                  </p>
                )}
                <p className="text-gray-600">
                  {orderDetails.shippingAddress?.street}
                  {orderDetails.shippingAddress?.apartment && `, ${orderDetails.shippingAddress.apartment}`}
                </p>
                <p className="text-gray-600">
                  {orderDetails.shippingAddress?.city}, {orderDetails.shippingAddress?.region}
                </p>
              </div>
            </div>

            {/* Payment Method Selection */}
            {!isCashOnDelivery && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
                <div className="space-y-3">
                  {/* Card Payment */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    paymentMethod === "flutterwave_card" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="flutterwave_card"
                      checked={paymentMethod === "flutterwave_card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Pay securely with Visa, Mastercard via Flutterwave</p>
                    </div>
                    <img src="/flutterwave-logo.png" alt="Flutterwave" className="h-6 opacity-60" onError={(e) => e.currentTarget.style.display = 'none'} />
                  </label>

                  {/* Mobile Money */}
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
                    paymentMethod === "flutterwave_mobilemoney" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="flutterwave_mobilemoney"
                      checked={paymentMethod === "flutterwave_mobilemoney"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <Smartphone className="w-8 h-8 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Mobile Money</p>
                      <p className="text-sm text-gray-500">MTN MoMo, Airtel Money via Flutterwave</p>
                    </div>
                  </label>

                  {/* Mobile Money Details */}
                  {paymentMethod === "flutterwave_mobilemoney" && (
                    <div className="ml-12 p-4 bg-gray-50 rounded-lg space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                        <div className="flex gap-4">
                          <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${
                            mobileProvider === "mtn" ? "border-yellow-500 bg-yellow-50" : "border-gray-200"
                          }`}>
                            <input
                              type="radio"
                              name="provider"
                              value="mtn"
                              checked={mobileProvider === "mtn"}
                              onChange={(e) => setMobileProvider(e.target.value)}
                              className="w-4 h-4"
                            />
                            <span className="font-medium">MTN MoMo</span>
                          </label>
                          <label className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer ${
                            mobileProvider === "airtel" ? "border-red-500 bg-red-50" : "border-gray-200"
                          }`}>
                            <input
                              type="radio"
                              name="provider"
                              value="airtel"
                              checked={mobileProvider === "airtel"}
                              onChange={(e) => setMobileProvider(e.target.value)}
                              className="w-4 h-4"
                            />
                            <span className="font-medium">Airtel Money</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <input
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="e.g., 0771234567"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {paymentError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {paymentError}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading || !paymentMethod}
                  className="w-full mt-6 flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Processing..." : `Pay ${formatPrice(total)}`}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  Secured by Flutterwave
                </div>
              </div>
            )}

            {/* Cash on Delivery Confirmation */}
            {isCashOnDelivery && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Truck className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Cash on Delivery</h2>
                    <p className="text-gray-600">Pay when your order arrives</p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Please have the exact amount ready ({formatPrice(total)}) when the delivery arrives. 
                    Our delivery partner will collect the payment.
                  </p>
                </div>

                {paymentError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    {paymentError}
                  </div>
                )}

                <button
                  onClick={handleCashOnDeliveryConfirm}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold text-lg transition"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? "Confirming..." : "Confirm Order"}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto">
                {orderDetails.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {(item.images?.[0] || item.image) ? (
                        <Image 
                          src={item.images?.[0]?.url || item.images?.[0] || item.image} 
                          alt={item.productName || item.title} 
                          width={64}
                          height={64}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.productName || item.title}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderDetails.subtotal)}</span>
                </div>
                
                {orderDetails.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(orderDetails.totalDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{(orderDetails.shippingCost || 0) === 0 ? "Free" : formatPrice(orderDetails.shippingCost)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">Need Help?</p>
                <p className="text-xs text-blue-700 mb-2">
                  For order-related queries, contact our support:
                </p>
                <a 
                  href="tel:+256761819885" 
                  className="text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  +256 761 819 885
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense as SuspenseBoundary } from "react";

export default function CheckoutPage() {
  return (
    <SuspenseBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    }>
      <CheckoutContent />
    </SuspenseBoundary>
  );
}

