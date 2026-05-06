"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Check, AlertCircle } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface NotificationPromptProps {
  delay?: number; // Delay before showing prompt (ms)
  onDismiss?: () => void;
}

export default function NotificationPrompt({
  delay = 5000,
  onDismiss,
}: NotificationPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    requestPermission,
  } = usePushNotifications();

  useEffect(() => {
    // Check if user has already dismissed or subscribed
    const dismissed = localStorage.getItem("notification_prompt_dismissed");
    if (dismissed || !isSupported || permission === "denied" || isSubscribed) {
      return;
    }

    // Show prompt after delay
    const timer = setTimeout(() => {
      if (permission === "default") {
        setIsVisible(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, isSupported, permission, isSubscribed]);

  const handleEnable = async () => {
    const success = await requestPermission();
    if (success) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("notification_prompt_dismissed", "true");
    onDismiss?.();
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    // Show again after 24 hours
    localStorage.setItem(
      "notification_prompt_remind",
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    );
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">Stay Updated!</h3>
                <p className="text-sm text-blue-100">
                  Get notified about orders & deals
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              Order status updates
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              Exclusive deals & offers
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500" />
              Price drop alerts
            </li>
          </ul>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  Enable
                </>
              )}
            </button>
            <button
              onClick={handleRemindLater}
              className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Later
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-400 flex items-start gap-1">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            You can disable notifications anytime in settings
          </p>
        </div>
      </div>
    </div>
  );
}

