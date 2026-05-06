import { useEffect } from "react";
import { useStore } from "@/store";

/**
 * Hook that automatically removes items from cart/wishlist when their associated event ends.
 * Should be used in the root layout or main page component.
 */
const useExpiredEventCleanup = () => {
  const removeExpiredEventItems = useStore((state) => state.removeExpiredEventItems);

  useEffect(() => {
    // Run cleanup on mount
    removeExpiredEventItems();

    // Run cleanup every minute to catch events that end while user is browsing
    const interval = setInterval(() => {
      removeExpiredEventItems();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [removeExpiredEventItems]);
};

export default useExpiredEventCleanup;

