"use client";

import { Code, Shield, Zap, Users, ArrowRight, CheckCircle, Sparkles, Terminal, Database, Lock, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const CODE_SNIPPETS = [
  'import { NextResponse } from "next/server";',
  'const user = await getAuth(req);',
  'return NextResponse.json({ error: "Unauthorized" });',
  'export async function GET(req: NextRequest) {',
  'const params = searchParams.get("id");',
  'if (!params) return null;',
  'const data = await prisma.user.findUnique({',
  '  where: { id: params },',
  '});',
  'return data;',
];

const FEATURES = [
  { icon: CheckCircle, title: "VERIFIED", subtitle: "QUALITY", color: "from-emerald-400 to-teal-500" },
  { icon: Code, title: "PRODUCTION", subtitle: "READY", color: "from-blue-400 to-indigo-500" },
  { icon: Lock, title: "SECURE &", subtitle: "RELIABLE", color: "from-purple-400 to-pink-500" },
  { icon: Rocket, title: "BUILT FOR", subtitle: "FOUNDERS", color: "from-amber-400 to-orange-500" },
];

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
  const [codeLineIndex, setCodeLineIndex] = useState(0);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCodeLineIndex((i) => (i + 1) % CODE_SNIPPETS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Background rotation effect - smooth crossfade every 6 seconds
  useEffect(() => {
    setIsLoaded(true);
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 6000); // Change every 6 seconds

    return () => clearInterval(bgInterval);
  }, []);

  return (
    <section className="relative overflow-hidden min-h-[85vh] sm:min-h-[90vh] flex items-center">
      
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
        
        {/* Gradient Overlays for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      </div>

      {/* Animated foreground elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs - hidden on mobile for performance */}
        <div className="hidden md:block absolute top-20 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }} />
        <div className="hidden md:block absolute bottom-20 left-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-2000" style={{ background: "radial-gradient(circle, #3b82f6, transparent 70%)" }} />
        
        {/* Grid overlay - subtle on mobile */}
        <div className="absolute inset-0 opacity-[0.015] md:opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        
        {/* Floating code lines - hidden on mobile */}
        <div className="hidden lg:block absolute left-0 top-1/4 w-full opacity-10">
          <div className="font-mono text-xs text-blue-400 space-y-2 animate-slide-up">
            {CODE_SNIPPETS.map((line, i) => (
              <div key={i} className="whitespace-nowrap" style={{ animationDelay: `${i * 0.1}s` }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Left — Hero text */}
          <div className="text-center lg:text-left space-y-6 sm:space-y-8 animate-fade-in-up">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold text-purple-300 border border-purple-500/30 backdrop-blur-sm" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 animate-pulse" />
              <span className="hidden xs:inline">Trusted by 1000+ Founders</span>
              <span className="xs:hidden">1000+ Founders</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Main headline - Responsive sizing */}
            <div>
              <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}>
                <span className="text-white">VETT</span>
                <span className="bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 bg-clip-text text-transparent">CODE</span>
                <span className="text-white">:</span>
              </h1>
              <p className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white/80 mt-3 sm:mt-4 tracking-wide">
                Verified Codebases for Founders
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-white/60 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed px-4 sm:px-0">
              Launch faster with production-ready, verified applications. Built by developers, trusted by founders.
            </p>

            {/* CTA buttons - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
              <button
                onClick={() => router.push("/products")}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3"
                style={{ background: "linear-gradient(135deg, #8b5cf6, #6366f1)" }}
              >
                <Terminal className="w-4 sm:w-5 h-4 sm:h-5" />
                Browse Applications
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              </button>
              
              <button
                onClick={() => router.push("/become-seller")}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white text-sm sm:text-base border-2 border-white/20 hover:border-purple-400/50 hover:bg-white/5 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 backdrop-blur-sm"
              >
                <Users className="w-4 sm:w-5 h-4 sm:h-5" />
                List Your App
              </button>
            </div>

            {/* Features row - 2x2 grid on mobile, 4 columns on larger screens */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 pt-2 sm:pt-4 px-2 sm:px-0">
              {FEATURES.map(({ icon: Icon, title, subtitle, color }, i) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  style={{ 
                    animationDelay: `${0.2 + i * 0.1}s`,
                    background: "rgba(255, 255, 255, 0.03)"
                  }}
                >
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-md sm:rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/90 leading-tight">{title}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-white/60 leading-tight">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard mockup - Hidden on mobile and tablet */}
          <div className="hidden lg:block relative animate-fade-in-up delay-300">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-3xl blur-3xl" />
              
              {/* Dashboard card */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl" style={{ background: "rgba(15, 23, 42, 0.8)" }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs font-mono text-white/60 ml-2">MY VETTCODE</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500" />
                    <Shield className="w-4 h-4 text-white/40" />
                    <Database className="w-4 h-4 text-white/40" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {/* Overview section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-white">Overview</h3>
                      <span className="text-xs text-purple-400 font-mono">Real-time</span>
                    </div>
                    
                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg" style={{ background: "rgba(139, 92, 246, 0.1)" }}>
                        <p className="text-xs text-white/60 mb-1">Total Sales</p>
                        <p className="text-2xl font-black text-white">$48,250</p>
                        <p className="text-xs text-emerald-400 font-semibold mt-1">+12.5% this month</p>
                      </div>
                      <div className="p-3 rounded-lg" style={{ background: "rgba(59, 130, 246, 0.1)" }}>
                        <p className="text-xs text-white/60 mb-1">Active Users</p>
                        <p className="text-2xl font-black text-white">1,429</p>
                        <p className="text-xs text-blue-400 font-semibold mt-1">+8.2% vs last week</p>
                      </div>
                    </div>

                    {/* Chart placeholder */}
                    <div className="h-24 rounded-lg flex items-end gap-1 p-2" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t bg-gradient-to-t from-purple-500 to-blue-500 opacity-80 hover:opacity-100 transition-opacity"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                      {[
                        { label: "New App Deployed", value: "$12,745", color: "emerald" },
                        { label: "E-Commerce Platform", value: "$8,230", color: "blue" },
                        { label: "SaaS Dashboard", value: "$5,890", color: "purple" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${item.color}-400`} />
                            <span className="text-xs text-white/70">{item.label}</span>
                          </div>
                          <span className="text-xs font-bold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Projects */}
                  <div>
                    <h3 className="text-sm font-bold text-white mb-3">Top Projects</h3>
                    <div className="space-y-2">
                      {[
                        { name: "AI Content Generator", sales: "$12,745" },
                        { name: "E-Commerce Platform", sales: "$8,230" },
                        { name: "SaaS Dashboard", sales: "$5,890" },
                      ].map((project, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-white/60">{project.name}</span>
                          <span className="font-bold text-white">{project.sales}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer badge */}
                <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-white/40 font-mono">Verified & Secure</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-semibold">Production Ready</span>
                  </div>
                </div>
              </div>

              {/* Floating badge - Verified */}
              <div className="absolute -top-4 -right-4 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl animate-float border border-white/20" style={{ background: "rgba(139, 92, 246, 0.2)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-black">Verified</p>
                    <p className="text-emerald-300 text-[10px] font-bold">100% Quality</p>
                  </div>
                </div>
              </div>

              {/* Floating badge - Secure */}
              <div className="absolute -bottom-4 -left-4 backdrop-blur-xl rounded-2xl px-4 py-3 shadow-2xl animate-float animation-delay-2000 border border-white/20" style={{ background: "rgba(59, 130, 246, 0.2)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-black">Secure</p>
                    <p className="text-blue-300 text-[10px] font-bold">Enterprise Grade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar - Responsive */}
        <div className="mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-sm">
          {[
            { value: "1,000+", label: "Applications" },
            { value: "500+", label: "Founders" },
            { value: "99.9%", label: "Uptime" },
            { value: "24/7", label: "Support" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center py-4 sm:py-6 px-2 sm:px-4 animate-count-up" style={{ animationDelay: `${0.5 + i * 0.1}s`, background: "rgba(255,255,255,0.02)" }}>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</span>
              <span className="text-white/50 text-[10px] sm:text-xs font-semibold mt-1 tracking-wide">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: "40px sm:60px" }}>
          <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 30C840 36 960 40 1080 44C1200 48 1320 52 1380 54L1440 56V80H0Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
