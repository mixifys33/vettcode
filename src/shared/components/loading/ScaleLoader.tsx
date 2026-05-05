"use client";

import React from "react";
import { Code2 } from "lucide-react";

interface ScaleLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const ScaleLoader: React.FC<ScaleLoaderProps> = ({ 
  message = "Loading amazing codebases...",
  fullScreen = false 
}) => {
  const containerClass = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
    : "flex items-center justify-center py-20";

  // Generate multiple scale patterns across the entire background
  const generateBackgroundScales = () => {
    const scales = [];
    const rows = 8;
    const cols = 12;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const delay = (row * cols + col) * 0.05;
        scales.push(
          <div
            key={`bg-scale-${row}-${col}`}
            className="absolute"
            style={{
              left: `${(col / cols) * 100}%`,
              top: `${(row / rows) * 100}%`,
              animationDelay: `${delay}s`,
            }}
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 animate-scale-rotate-1 opacity-20">
                {[0, 120, 240].map((rotation, i) => (
                  <div
                    key={`inner-${i}`}
                    className="absolute top-1/2 left-1/2 w-3 h-3 -ml-1.5 -mt-1.5"
                    style={{
                      transform: `rotate(${rotation}deg) translateY(-12px)`,
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 backdrop-blur-sm border border-purple-400/20 animate-scale-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
    }
    return scales;
  };

  return (
    <div className={containerClass}>
      {/* Full Page Background Scales Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {generateBackgroundScales()}
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Main Animated Scales Pattern */}
        <div className="relative w-32 h-32">
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-2xl animate-pulse">
              <Code2 className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Animated Scales - Layer 1 (Inner) */}
          <div className="absolute inset-0 animate-scale-rotate-1">
            {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
              <div
                key={`scale-1-${i}`}
                className="absolute top-1/2 left-1/2 w-6 h-6 -ml-3 -mt-3"
                style={{
                  transform: `rotate(${rotation}deg) translateY(-24px)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 backdrop-blur-sm border border-purple-400/30 animate-scale-pulse" />
              </div>
            ))}
          </div>

          {/* Animated Scales - Layer 2 (Middle) */}
          <div className="absolute inset-0 animate-scale-rotate-2">
            {[30, 90, 150, 210, 270, 330].map((rotation, i) => (
              <div
                key={`scale-2-${i}`}
                className="absolute top-1/2 left-1/2 w-5 h-5 -ml-2.5 -mt-2.5"
                style={{
                  transform: `rotate(${rotation}deg) translateY(-36px)`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500/30 to-violet-500/30 backdrop-blur-sm border border-blue-400/20 animate-scale-pulse" />
              </div>
            ))}
          </div>

          {/* Animated Scales - Layer 3 (Outer) */}
          <div className="absolute inset-0 animate-scale-rotate-3">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, i) => (
              <div
                key={`scale-3-${i}`}
                className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2"
                style={{
                  transform: `rotate(${rotation}deg) translateY(-48px)`,
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 backdrop-blur-sm border border-violet-400/10 animate-scale-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg animate-pulse" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {message}
          </p>
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScaleLoader;
