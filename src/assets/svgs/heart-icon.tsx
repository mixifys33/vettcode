"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

interface HeartIconProps {
  size?: number;
  mobileSize?: number;
  activeColor?: string;
  inactiveColor?: string;
  className?: string;
  isActive?: boolean; // External control of active state
  onClick?: () => void;
}

const HeartIcon: React.FC<HeartIconProps> = ({
  size = 26,
  mobileSize = 20,
  activeColor = "#ef4444",
  inactiveColor = "#6b7280",
  className = "",
  isActive = false,
  onClick,
}) => {
  const [iconSize, setIconSize] = useState(size);

  useEffect(() => {
    const handleResize = () => {
      setIconSize(window.innerWidth < 768 ? mobileSize : size);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size, mobileSize]);

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-gray-100 ${className}`}
    >
      <Heart
        size={iconSize}
        color={isActive ? activeColor : inactiveColor}
        fill={isActive ? activeColor : "none"}
        strokeWidth={1.8}
      />
    </div>
  );
};

export default HeartIcon;

