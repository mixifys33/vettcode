"use client";

import { useEffect, useState } from "react";

const LOCATION_STORAGE_KEY = "user_location";
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = () => {
  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!storedData) return null;

  try {
    const parsedData = JSON.parse(storedData);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 20 days
    const isExpired = Date.now() - parsedData.timestamp > expiryTime;
    return isExpired ? null : parsedData;
  } catch (error) {
    console.error("Error parsing stored location:", error);
    return null;
  }
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{ country: string; city: string; timestamp?: number } | null>(null);

  useEffect(() => {
    const storedLocation = getStoredLocation();
    if (storedLocation) {
      setLocation(storedLocation);
      return;
    }

    const fetchLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();
        
        if (data.country_name && data.city) {
          const newLocation = {
            country: data.country_name,
            city: data.city,
            timestamp: Date.now(),
          };
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
          setLocation(newLocation);
        }
      } catch (error) {
        console.error("Failed to get location:", error);
      }
    };

    fetchLocation();
  }, []);

  return location;
};

export default useLocationTracking;