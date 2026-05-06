import { HalfStar, StarFilled, StarOutline } from "../../../../svg/ratings";
import React, { FC } from "react";

type Props = {
    rating?: number;
    showNumber?: boolean;
    size?: "sm" | "md" | "lg";
};

const Ratings: FC<Props> = ({ rating = 0, showNumber = true, size = "sm" }) => {
    // Ensure rating is a valid number between 0 and 5
    const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));
    
    const stars = [];
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    // Size mapping
    const sizeMap = {
        sm: 14,
        md: 18,
        lg: 22,
    };
    const starSize = sizeMap[size];

    // Add filled stars
    for (let i = 0; i < fullStars; i++) {
        stars.push(<StarFilled key={`star-filled-${i}`} size={starSize} />);
    }

    // Add half star if needed
    if (hasHalfStar) {
        stars.push(<HalfStar key="star-half" size={starSize} />);
    }

    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<StarOutline key={`star-outline-${i}`} size={starSize} />);
    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex gap-0.5">
                {stars}
            </div>
            {showNumber && (
                <span className={`text-gray-600 font-medium ${
                    size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"
                }`}>
                    ({safeRating.toFixed(1)})
                </span>
            )}
        </div>
    );
};

export default Ratings;
