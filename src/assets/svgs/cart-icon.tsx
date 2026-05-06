"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";

interface CartIconProps {
  size?: number;
  mobileSize?: number;
  className?: string;
  isActive?: boolean; // External control of active state
  onClick?: () => void;
}

const CartIcon: React.FC<CartIconProps> = ({
  size = 28,
  mobileSize = 22,
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
      className={`flex items-center justify-center cursor-pointer p-2 rounded-full transition-transform duration-200 hover:scale-110 ${className}`}
      onClick={onClick}
    >
      <ShoppingCart
        size={iconSize}
        color={isActive ? "#f59e0b" : "#6b7280"}
        fill={isActive ? "#f59e0b" : "none"}
        strokeWidth={1.8}
      />
    </div>
  );
};

export default CartIcon;

