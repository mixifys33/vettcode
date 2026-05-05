"use client";

import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

// Background images array (10 images)
const BACKGROUND_IMAGES = [
  '/background1.png',
  '/background2.png',
  '/background3.png',
  '/background4.png',
  '/background5.png',
  '/background6.png',
  '/background7.png',
  '/background8.png',
  '/background9.png',
  '/background10.png',
];

export const Hero = () => {
  const router = useRouter();
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  // Background rotation effect - smooth crossfade every 6 seconds
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000);

    return () => clearInterval(bgInterval);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-end">
      
      {/* Background Images Slideshow with Ken Burns Effect - Mobile Responsive */}
      <div className="absolute inset-0">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${
              index === currentBgIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url('${image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              transform: index === currentBgIndex ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
        
        {/* Gradient Overlay - lighter for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
      </div>

      {/* Content - Bottom positioned */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 lg:pb-28">
        <div className="max-w-4xl mx-auto text-center space-y-5 sm:space-y-6 md:space-y-8">
          
          {/* Main Hook - Attention grabbing */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-white px-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Try Our <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">Free Codebases</span>
              <br />
              <span className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white/90">No Credit Card. No Risk.</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/80 font-semibold max-w-3xl mx-auto leading-relaxed px-4">
              If our <span className="text-purple-300 font-bold">free codebases</span> are this great, imagine how powerful our <span className="text-purple-300 font-bold">premium ones</span> must be.
            </p>
          </div>

          {/* Value Props - Quick scan */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm md:text-base px-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/70">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Tested & Verified</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/70">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="font-semibold">Production Ready</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-white/70">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-semibold">Free Forever</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 px-4">
            <button
              onClick={() => router.push("/products?filter=free")}
              className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base md:text-lg overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
            >
              <Sparkles className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
              Explore Free Apps
              <ArrowRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </button>
            
            <button
              onClick={() => router.push("/products")}
              className="group px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base md:text-lg border-2 border-white/30 hover:border-purple-400/60 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-md w-full sm:w-auto"
            >
              <Zap className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
              View Premium Apps
            </button>
          </div>

          {/* Trust Signal */}
          <p className="text-white/50 text-[10px] xs:text-xs sm:text-sm font-medium px-4">
            Join 1,000+ founders who trust VETTCODE • No registration required for free apps
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
