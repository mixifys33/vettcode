"use client";
import React, { useState, useEffect, useCallback } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currency?: string;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  currency = "UGX",
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - 1);
    setLocalValue([newMin, localValue[1]]);
  }, [localValue]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + 1);
    setLocalValue([localValue[0], newMax]);
  }, [localValue]);

  const handleMouseUp = useCallback(() => {
    onChange(localValue);
  }, [localValue, onChange]);

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-UG").format(price);
  };

  return (
    <div className="w-full px-1">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700">Price Range</span>
      </div>

      {/* Price display */}
      <div className="flex justify-between items-center mb-4">
        <div className="bg-gray-100 rounded-lg px-3 py-1.5">
          <span className="text-xs text-gray-500">{currency}</span>
          <span className="text-sm font-semibold text-gray-800 ml-1">
            {formatPrice(localValue[0])}
          </span>
        </div>
        <span className="text-gray-400 mx-2">—</span>
        <div className="bg-gray-100 rounded-lg px-3 py-1.5">
          <span className="text-xs text-gray-500">{currency}</span>
          <span className="text-sm font-semibold text-gray-800 ml-1">
            {formatPrice(localValue[1])}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative h-2">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full" />
        
        {/* Active track */}
        <div
          className="absolute h-2 bg-[#115061] rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[0]}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#115061] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#115061] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue[1]}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#115061] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#115061] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      {/* Min/Max labels */}
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">{formatPrice(min)}</span>
        <span className="text-xs text-gray-400">{formatPrice(max)}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;

