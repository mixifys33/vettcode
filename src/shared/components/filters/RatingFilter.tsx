"use client";
import React from "react";
import { Star } from "lucide-react";

interface RatingFilterProps {
  selectedRating: number | undefined;
  onRatingChange: (rating: number | undefined) => void;
}

const RatingFilter: React.FC<RatingFilterProps> = ({
  selectedRating,
  onRatingChange,
}) => {
  const ratings = [4, 3, 2, 1];

  const handleRatingClick = (rating: number) => {
    if (selectedRating === rating) {
      onRatingChange(undefined);
    } else {
      onRatingChange(rating);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">Customer Rating</h3>
      <div className="space-y-2">
        {ratings.map((rating) => {
          const isSelected = selectedRating === rating;
          
          return (
            <button
              key={rating}
              onClick={() => handleRatingClick(rating)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                isSelected
                  ? "bg-[#115061]/10 border border-[#115061]"
                  : "bg-gray-50 border border-transparent hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-sm ${isSelected ? "text-[#115061] font-medium" : "text-gray-600"}`}>
                & Up
              </span>
              {isSelected && (
                <span className="ml-auto text-xs text-[#115061]">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RatingFilter;

