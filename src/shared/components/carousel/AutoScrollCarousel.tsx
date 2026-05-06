"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface AutoScrollCarouselProps {
  children: React.ReactNode[];
  autoScrollInterval?: number;
  pauseOnHover?: boolean;
  showNavigation?: boolean;
  showDots?: boolean;
  className?: string;
  itemClassName?: string;
}

const AutoScrollCarousel: React.FC<AutoScrollCarouselProps> = ({
  children,
  autoScrollInterval = 4000,
  pauseOnHover = true,
  showNavigation = true,
  showDots = true,
  className = "",
  itemClassName = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const totalItems = children.length;

  const scrollToIndex = useCallback((index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const itemWidth = container.scrollWidth / totalItems;
    container.scrollTo({
      left: itemWidth * index,
      behavior: "smooth",
    });
    setCurrentIndex(index);
  }, [totalItems]);

  const nextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % totalItems;
    scrollToIndex(nextIndex);
  }, [currentIndex, totalItems, scrollToIndex]);

  const prevSlide = useCallback(() => {
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    scrollToIndex(prevIndex);
  }, [currentIndex, totalItems, scrollToIndex]);

  // Auto-scroll effect
  useEffect(() => {
    if (isPaused || (pauseOnHover && isHovered) || totalItems <= 1) return;

    const interval = setInterval(nextSlide, autoScrollInterval);
    return () => clearInterval(interval);
  }, [isPaused, isHovered, pauseOnHover, autoScrollInterval, nextSlide, totalItems]);

  // Handle scroll events to update current index
  const handleScroll = () => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const itemWidth = container.scrollWidth / totalItems;
    const newIndex = Math.round(container.scrollLeft / itemWidth);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalItems) {
      setCurrentIndex(newIndex);
    }
  };

  if (totalItems === 0) return null;

  return (
    <div
      className={`relative group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className={`flex-shrink-0 snap-center ${itemClassName}`}
            style={{ width: "100%" }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && totalItems > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-95"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots & Pause Control */}
      {(showDots || showNavigation) && totalItems > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3">
          {/* Pause/Play Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 sm:p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? (
              <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            ) : (
              <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            )}
          </button>

          {/* Dots */}
          {showDots && (
            <div className="flex gap-1.5 sm:gap-2">
              {children.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToIndex(index)}
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-white w-6 sm:w-8"
                      : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoScrollCarousel;

