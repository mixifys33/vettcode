"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin, Package, Truck, CheckCircle, Clock, Phone, MessageCircle,
  Navigation, RefreshCw
} from "lucide-react";
import axios from "axios";

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  latitude?: number;
  longitude?: number;
  description: string;
  timestamp: string;
}

interface OrderTrackingMapProps {
  orderId: string;
  orderNumber: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6003";

export default function OrderTrackingMap({ orderId, orderNumber }: OrderTrackingMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["order-tracking", orderId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/orders/${orderId}/tracking`);
      return res.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const trackingEvents: TrackingEvent[] = data?.events || [];
  const currentStatus = data?.currentStatus || "Processing";
  const estimatedDelivery = data?.estimatedDelivery;
  const driverInfo = data?.driver;

  // Get the latest location
  const latestLocation = trackingEvents.find(e => e.latitude && e.longitude);

  const statusSteps = [
    { key: "Pending", label: "Order Placed", icon: Package },
    { key: "Processing", label: "Processing", icon: Clock },
    { key: "Shipped", label: "Shipped", icon: Truck },
    { key: "OutForDelivery", label: "Out for Delivery", icon: Navigation },
    { key: "Delivered", label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === currentStatus);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Track Order</h2>
            <p className="text-sm text-gray-500">Order #{orderNumber}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {estimatedDelivery && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-600">Estimated Delivery</p>
            <p className="text-lg font-bold text-blue-900">
              {new Date(estimatedDelivery).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    } ${isCurrent ? "ring-4 ring-green-100" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      isCompleted ? "text-green-600 font-medium" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded ${
                      index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Map View */}
      <div className="relative h-64 bg-gray-100">
        {latestLocation ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* In production, integrate with Google Maps or Mapbox */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900">{latestLocation.location}</p>
              <p className="text-sm text-gray-500">
                Last updated: {new Date(latestLocation.timestamp).toLocaleTimeString()}
              </p>
              <a
                href={`https://www.google.com/maps?q=${latestLocation.latitude},${latestLocation.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <Navigation className="w-4 h-4" />
                Open in Maps
              </a>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Location tracking will be available when order is shipped</p>
            </div>
          </div>
        )}
      </div>

      {/* Driver Info */}
      {driverInfo && currentStatus === "OutForDelivery" && (
        <div className="p-6 border-t bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-3">Delivery Partner</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-600">
                  {driverInfo.name?.charAt(0) || "D"}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{driverInfo.name}</p>
                <p className="text-sm text-gray-500">{driverInfo.vehicle}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${driverInfo.phone}`}
                className="p-3 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
              >
                <Phone className="w-5 h-5" />
              </a>
              <button className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracking History */}
      <div className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Tracking History</h3>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-3 h-3 bg-gray-200 rounded-full mt-1" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : trackingEvents.length > 0 ? (
            trackingEvents.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                <div className="relative">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 ${
                      index === 0 ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  {index < trackingEvents.length - 1 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">{event.description}</p>
                  <p className="text-sm text-gray-500">{event.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No tracking updates yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

