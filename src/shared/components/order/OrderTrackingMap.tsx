"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin, Package, Truck, CheckCircle, Clock, Navigation,
  Phone, MessageCircle, RefreshCw, AlertCircle
} from "lucide-react";

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  isCompleted: boolean;
  isCurrent: boolean;
}

interface DeliveryAgent {
  name: string;
  phone: string;
  photo?: string;
  vehicleType: string;
  vehicleNumber?: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

interface OrderTrackingMapProps {
  orderId: string;
  orderStatus: string;
  shippingAddress: {
    street: string;
    city: string;
    region: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  trackingHistory?: TrackingStep[];
  deliveryAgent?: DeliveryAgent;
  estimatedDelivery?: string;
}

export default function OrderTrackingMap({
  orderId,
  orderStatus,
  shippingAddress,
  trackingHistory = [],
  deliveryAgent,
  estimatedDelivery,
}: OrderTrackingMapProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Default tracking steps if none provided
  const defaultSteps: TrackingStep[] = [
    {
      status: "Pending",
      title: "Order Placed",
      description: "Your order has been received",
      timestamp: new Date().toISOString(),
      isCompleted: true,
      isCurrent: orderStatus === "Pending",
    },
    {
      status: "Processing",
      title: "Processing",
      description: "Seller is preparing your order",
      timestamp: "",
      isCompleted: ["Processing", "Shipped", "OutForDelivery", "Delivered", "Completed"].includes(orderStatus),
      isCurrent: orderStatus === "Processing",
    },
    {
      status: "Shipped",
      title: "Shipped",
      description: "Your order is on the way",
      timestamp: "",
      isCompleted: ["Shipped", "OutForDelivery", "Delivered", "Completed"].includes(orderStatus),
      isCurrent: orderStatus === "Shipped",
    },
    {
      status: "OutForDelivery",
      title: "Out for Delivery",
      description: "Your order is nearby",
      timestamp: "",
      isCompleted: ["OutForDelivery", "Delivered", "Completed"].includes(orderStatus),
      isCurrent: orderStatus === "OutForDelivery",
    },
    {
      status: "Delivered",
      title: "Delivered",
      description: "Order has been delivered",
      timestamp: "",
      isCompleted: ["Delivered", "Completed"].includes(orderStatus),
      isCurrent: orderStatus === "Delivered" || orderStatus === "Completed",
    },
  ];

  const steps = trackingHistory.length > 0 ? trackingHistory : defaultSteps;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh - in real app, this would fetch latest tracking data
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted && !isCurrent) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    if (isCurrent) {
      switch (status) {
        case "OutForDelivery":
          return <Truck className="w-6 h-6 text-blue-500 animate-pulse" />;
        case "Shipped":
          return <Package className="w-6 h-6 text-blue-500 animate-pulse" />;
        default:
          return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      }
    }
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Track Your Order</h2>
            <p className="text-blue-100 text-sm">Order #{orderId.slice(-8).toUpperCase()}</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Estimated Delivery */}
        {estimatedDelivery && orderStatus !== "Delivered" && orderStatus !== "Completed" && (
          <div className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
            <Clock className="w-5 h-5" />
            <div>
              <p className="text-xs text-blue-100">Estimated Delivery</p>
              <p className="font-semibold">{estimatedDelivery}</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Placeholder - In production, integrate with Google Maps or Mapbox */}
      <div className="relative h-48 sm:h-64 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Navigation className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm">Live tracking map</p>
            <p className="text-gray-400 text-xs mt-1">
              {shippingAddress.city}, {shippingAddress.region}
            </p>
          </div>
        </div>

        {/* Delivery Location Pin */}
        <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-[200px]">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500">Delivery Address</p>
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {shippingAddress.street}, {shippingAddress.city}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Agent Info */}
      {deliveryAgent && (orderStatus === "OutForDelivery" || orderStatus === "Shipped") && (
        <div className="p-4 border-b bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                {deliveryAgent.photo ? (
                  <img
                    src={deliveryAgent.photo}
                    alt={deliveryAgent.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Truck className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{deliveryAgent.name}</p>
                <p className="text-sm text-gray-500">
                  {deliveryAgent.vehicleType}
                  {deliveryAgent.vehicleNumber && ` • ${deliveryAgent.vehicleNumber}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${deliveryAgent.phone}`}
                className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button className="p-2 bg-white border border-green-600 text-green-600 rounded-full hover:bg-green-50 transition">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Timeline */}
      <div className="p-4 sm:p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Tracking History</h3>
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.status} className="relative flex gap-4">
              {/* Vertical Line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-3 top-8 w-0.5 h-full ${
                    step.isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {getStatusIcon(step.status, step.isCompleted, step.isCurrent)}
              </div>

              {/* Content */}
              <div className={`pb-6 ${step.isCurrent ? "" : ""}`}>
                <div className="flex items-center gap-2">
                  <h4
                    className={`font-medium ${
                      step.isCurrent
                        ? "text-blue-600"
                        : step.isCompleted
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </h4>
                  {step.isCurrent && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                {step.timestamp && (
                  <p className="text-xs text-gray-400 mt-1">{formatTime(step.timestamp)}</p>
                )}
                {step.location && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {step.location.address}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Help Section */}
      {orderStatus !== "Delivered" && orderStatus !== "Completed" && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <p className="text-gray-600">
              Having issues with your delivery?{" "}
              <a href="/support" className="text-blue-600 hover:underline font-medium">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

