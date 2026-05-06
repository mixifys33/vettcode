"use client";

import { useState, useEffect, useCallback } from "react";

interface NotificationPermissionState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSubscribed: boolean;
}

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: { action: string; title: string; icon?: string }[];
  requireInteraction?: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<NotificationPermissionState>({
    permission: "default",
    isSupported: false,
    isSubscribed: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = "Notification" in window && "serviceWorker" in navigator;
    
    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : "denied",
    }));

    // Check if already subscribed
    if (isSupported && Notification.permission === "granted") {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setState((prev) => ({ ...prev, isSubscribed: !!subscription }));
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.warn("Push notifications not supported");
      return false;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));
      
      if (permission === "granted") {
        await subscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error requesting permission:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state.isSupported]);

  const subscribe = async () => {
    try {
      // Register service worker if not already registered
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Get VAPID public key from server
      const response = await fetch("/api/notifications/vapid-key");
      const { publicKey } = await response.json();

      if (!publicKey) {
        console.warn("VAPID public key not configured");
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as BufferSource,
      });

      // Send subscription to server
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      setState((prev) => ({ ...prev, isSubscribed: true }));
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
    }
  };

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Notify server
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      }

      setState((prev) => ({ ...prev, isSubscribed: false }));
      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      return false;
    }
  }, []);

  const showNotification = useCallback(
    async (options: PushNotificationOptions): Promise<boolean> => {
      if (state.permission !== "granted") {
        console.warn("Notification permission not granted");
        return false;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || "/icons/notification-icon.png",
          badge: options.badge || "/icons/badge-icon.png",
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction,
          ...(options.actions ? { actions: options.actions } : {}),
        } as NotificationOptions);
        return true;
      } catch (error) {
        console.error("Error showing notification:", error);
        return false;
      }
    },
    [state.permission]
  );

  return {
    ...state,
    isLoading,
    requestPermission,
    unsubscribe,
    showNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default usePushNotifications;

