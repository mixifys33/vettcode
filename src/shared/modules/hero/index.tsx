"use client";

import { ArrowRight, Sparkles, Zap, Shield, CheckCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

// Background images array (15 images)
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
  '/background11.png',
  '/background12.png',
  '/background13.png',
  '/background14.png',
  '/background15.png.png',
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
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-5 md:space-y-6">
          
          {/* VETTCODE Branding Badge with Fire Emoji */}
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-purple-600/30 via-violet-600/30 to-purple-600/30 backdrop-blur-xl border border-purple-400/30 shadow-2xl">
              <span className="text-base sm:text-lg">🔥</span>
              <span className="text-xs sm:text-sm md:text-base font-black text-white tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Ship Faster with VettCode
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight text-white px-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Build Production-Ready Software <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">Faster</span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 font-medium max-w-3xl mx-auto leading-relaxed px-4">
              Launch SaaS apps, AI tools, and scalable systems using verified codebases built for real-world deployment.
            </p>
            
            <p className="text-xs sm:text-sm md:text-base text-white/70 font-semibold px-4">
              Start instantly. No setup required.
            </p>
            
            <p className="text-xs sm:text-sm md:text-base text-white/60 font-medium px-4 pt-1">
              Explore free systems or unlock full production codebases when you're ready to build.
            </p>
          </div>

          {/* Choose What You Need Label */}
          <div className="pt-2">
            <p className="text-xs sm:text-sm text-purple-300 font-bold tracking-wide uppercase">
              Choose what you need
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button
              onClick={() => router.push("/applications")}
              className="group relative px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base md:text-lg overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
            >
              <Sparkles className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6" />
              Explore Codebases
              <ArrowRight className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </button>
            
            <button
              onClick={() => router.push("/applications?filter=free")}
              className="group px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base md:text-lg border-2 border-emerald-400/50 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-md w-full sm:w-auto"
            >
              <Zap className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-emerald-400" />
              Start Building (Free Access)
            </button>
            
            <button
              onClick={() => router.push("/applications?sort=premium")}
              className="group px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base md:text-lg border-2 border-white/30 hover:border-purple-400/60 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-md w-full sm:w-auto"
            >
              View Premium Systems
            </button>
          </div>

          {/* Why Developers Use VettCode */}
          <div className="pt-4 space-y-3">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Why developers use VettCode
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto px-4">
              <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
                <span className="text-[10px] sm:text-xs text-white/80 font-semibold text-center leading-tight">Real production architecture</span>
                <span className="text-[9px] sm:text-[10px] text-white/50">(not demos)</span>
              </div>
              
              <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
                <span className="text-[10px] sm:text-xs text-white/80 font-semibold text-center leading-tight">Scalable backend & frontend</span>
              </div>
              
              <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <Star className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
                <span className="text-[10px] sm:text-xs text-white/80 font-semibold text-center leading-tight">Clean, reusable code</span>
              </div>
              
              <div className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-amber-400" />
                <span className="text-[10px] sm:text-xs text-white/80 font-semibold text-center leading-tight">Real startup deployment</span>
              </div>
            </div>
          </div>

          {/* Built for Builders */}
          <div className="pt-3 space-y-2">
            <h4 className="text-sm sm:text-base font-bold text-purple-300" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Built for builders
            </h4>
            <p className="text-xs sm:text-sm text-white/60 font-medium max-w-2xl mx-auto px-4">
              For developers, indie hackers, and founders shipping real products — not learning projects.
            </p>
          </div>

          {/* Final Trust Line */}
          <p className="text-white/50 text-[10px] xs:text-xs sm:text-sm font-medium px-4 pt-2">
            Thousands of developers use VettCode to accelerate development.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
