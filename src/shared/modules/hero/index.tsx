"use client";

import { ArrowRight, Terminal, Users } from "lucide-react";
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
    }, 6000); // Change every 6 seconds

    return () => clearInterval(bgInterval);
  }, []);

  return (
    <section className="relative overflow-hidden h-screen flex items-end">
      
      {/* Background Images Slideshow with Ken Burns Effect */}
      <div className="absolute inset-0">
        {BACKGROUND_IMAGES.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${
              index === currentBgIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url('${image}')`,
              transform: index === currentBgIndex ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
        
        {/* Gradient Overlay - lighter for better image visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      </div>

      {/* Content - Bottom Center/Right positioned */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24">
        <div className="max-w-2xl lg:max-w-3xl mx-auto lg:ml-auto lg:mr-0 text-center lg:text-right">
          
          {/* Main headline - Clean and minimal */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
            <h1 className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-white">VETT</span>
              <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">CODE</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white/90 tracking-wide">
              Verified Codebases for Founders
            </p>
          </div>

          {/* CTA buttons - Minimal */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
            <button
              onClick={() => router.push("/products")}
              className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-white text-base sm:text-lg overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
            >
              <Terminal className="w-5 sm:w-6 h-5 sm:h-6" />
              Browse Applications
              <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </button>
            
            <button
              onClick={() => router.push("/become-seller")}
              className="px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-white text-base sm:text-lg border-2 border-white/30 hover:border-purple-400/60 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 backdrop-blur-md"
            >
              <Users className="w-5 sm:w-6 h-5 sm:h-6" />
              List Your App
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
