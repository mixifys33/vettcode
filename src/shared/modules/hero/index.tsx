"use client";

import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";

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
    <>
      {/* Hero-specific Header - Clean and minimal */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center justify-between">
            
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300 shadow-lg" />
                <div className="relative w-full h-full bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-lg sm:text-xl" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>VC</span>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-white font-black text-xl sm:text-2xl tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  VETTCODE
                </span>
                <span className="text-purple-300/80 text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold">Marketplace</span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link href="/products" className="text-white/80 hover:text-white font-semibold text-sm transition-colors">
                Browse Apps
              </Link>
              <Link href="/products?filter=free" className="text-white/80 hover:text-white font-semibold text-sm transition-colors flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Free Apps
              </Link>
              <Link href="/become-seller" className="text-white/80 hover:text-white font-semibold text-sm transition-colors">
                Sell Your App
              </Link>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link 
                href="/login"
                className="hidden sm:block px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl font-bold text-white/90 hover:text-white text-sm border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl font-bold text-white text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
        </div>

        {/* Content - Bottom positioned */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 md:pb-28">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            
            {/* Main Hook - Attention grabbing */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Try Our <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">Free Codebases</span>
                <br />
                <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white/90">No Credit Card. No Risk.</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 font-semibold max-w-3xl mx-auto leading-relaxed">
                If our <span className="text-purple-300 font-bold">free codebases</span> are this great, imagine how powerful our <span className="text-purple-300 font-bold">premium ones</span> must be.
              </p>
            </div>

            {/* Value Props - Quick scan */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm sm:text-base">
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">Tested & Verified</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="font-semibold">Production Ready</span>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-semibold">Free Forever</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
              <button
                onClick={() => router.push("/products?filter=free")}
                className="group relative px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-white text-base sm:text-lg overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 w-full sm:w-auto"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              >
                <Sparkles className="w-5 sm:w-6 h-5 sm:h-6" />
                Explore Free Apps
                <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>
              
              <button
                onClick={() => router.push("/products")}
                className="group px-8 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-white text-base sm:text-lg border-2 border-white/30 hover:border-purple-400/60 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3 backdrop-blur-md w-full sm:w-auto"
              >
                <Zap className="w-5 sm:w-6 h-5 sm:h-6" />
                View Premium Apps
              </button>
            </div>

            {/* Trust Signal */}
            <p className="text-white/50 text-xs sm:text-sm font-medium">
              Join 1,000+ founders who trust VETTCODE • No registration required for free apps
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
