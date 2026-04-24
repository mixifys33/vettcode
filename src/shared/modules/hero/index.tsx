"use client";

import { Search, ShoppingBag, Shield, Truck, Star, Zap, ArrowRight, Sparkles, Tag, Percent, Gift, ChevronRight, Smartphone, Shirt, Home, Sparkle } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const ROTATING_WORDS = ["Electronics", "Fashion products", "Beauty", "Home & Living products", "Sports equipments", "deals","Gadgets"];

const PROMO_BADGES = [
  { icon: Zap, label: "Flash Deals", color: "from-amber-400 to-orange-500" },
  { icon: Percent, label: "Up to 90% Off", color: "from-rose-500 to-pink-600" },
  { icon: Gift, label: "Free Gifts", color: "from-violet-500 to-purple-600" },
  { icon: Truck, label: "Free Delivery", color: "from-teal-500 to-cyan-600" },
];

const CATEGORY_CARDS = [
  
  { label: "Electronics", icon: Smartphone, color: "from-blue-500 to-indigo-600", deal: "Up to 89% off" },
  { label: "Fashion", icon: Shirt, color: "from-pink-500 to-rose-600", deal: "New Collection" },
  { label: "Home & Living", icon: Home, color: "from-emerald-500 to-teal-600", deal: "Best Deals" },
  { label: "Beauty", icon: Sparkle, color: "from-purple-500 to-violet-600", deal: "Trending Now" },
];

export const Hero = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2744 30%, #0d3f4d 65%, #083d38 100%)" }}>

      {/* Animated orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 animate-hero-glow" style={{ background: "radial-gradient(circle, #14b8a6, transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-15 animate-hero-glow animation-delay-2000" style={{ background: "radial-gradient(circle, #6366f1, transparent 70%)" }} />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full opacity-20 animate-hero-glow animation-delay-4000" style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Promo ticker */}
      <div className="relative z-10 border-b border-white/10" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="overflow-hidden py-2">
          <div className="marquee-track animate-marquee">
            {[...PROMO_BADGES, ...PROMO_BADGES, ...PROMO_BADGES, ...PROMO_BADGES].map((b, i) => {
              const Icon = b.icon;
              return (
                <span key={i} className="inline-flex items-center gap-2 mx-8 text-white/80 text-xs font-semibold whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r ${b.color}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </span>
                  {b.label}
                  <span className="text-white/30">•</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0 sm:pt-16 md:pt-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — text */}
          <div className="text-center lg:text-left space-y-6 animate-fade-in-up">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-amber-300 border border-amber-400/30 glass">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Uganda&apos;s #1 Trusted Online Marketplace
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Shop
                <span className="block" style={{ background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 40%, #fb923c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Smarter.
                </span>
                <span className="block text-white/90">Live Better.</span>
              </h1>
            </div>

            {/* Rotating category */}
            <p className="text-lg sm:text-xl text-white/70 font-medium max-w-lg mx-auto lg:mx-0">
              Discover amazing{" "}
              <span
                className="font-bold text-teal-300 inline-block transition-all duration-300"
                style={{ opacity: fade ? 1 : 0, transform: fade ? "translateY(0)" : "translateY(-8px)" }}
              >
                {ROTATING_WORDS[wordIndex]}
              </span>{" "}
              at unbeatable prices.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto lg:mx-0">
              <div className="relative flex items-center rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 focus-within:ring-amber-400/50 transition-all duration-300" style={{ background: "rgba(255,255,255,0.97)" }}>
                <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-12 pr-4 py-4 text-gray-800 text-sm sm:text-base placeholder-gray-400 outline-none bg-transparent font-medium"
                />
                <button
                  type="submit"
                  className="flex-shrink-0 m-1.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}
                >
                  <Search className="w-4 h-4 sm:hidden" />
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="w-4 h-4 hidden sm:block" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 justify-center lg:justify-start">
                {["Samsung","iPhone","Furniture","Nike", "Xiaomi","Beauty","Techno"].map((t) => (
                  <button key={t} type="button"
                    onClick={() => router.push(`/search?q=${t}`)}
                    className="text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1 rounded-full transition-all duration-200 hover:bg-white/10">
                    {t}
                  </button>
                ))}
              </div>
            </form>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={() => router.push("/products")}
                className="group relative px-7 py-3.5 rounded-2xl font-bold text-gray-900 text-sm sm:text-base overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #fcd34d, #f59e0b)" }}
              >
                <ShoppingBag className="w-5 h-5" />
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push("/become-seller")}
                className="px-7 py-3.5 rounded-2xl font-bold text-white text-sm sm:text-base border-2 border-white/25 hover:border-white/50 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 glass"
              >
                <Tag className="w-4 h-4" />
                Start Selling
              </button>
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start pt-2">
              {[
                { icon: Shield, text: "Secure Payments" },
                { icon: Truck, text: "Fast Delivery" },
                { icon: Star, text: "4.9★ Rated" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/60 text-xs font-medium">
                  <Icon className="w-3.5 h-3.5 text-amber-400" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — category cards */}
          <div className="hidden lg:block relative animate-fade-in-up delay-300">
            <div className="relative">
              {/* Floating ring */}
              <div className="absolute inset-0 rounded-3xl border border-white/10 animate-spin-slow" style={{ margin: "-20px" }} />

              <div className="grid grid-cols-2 gap-4">
                {CATEGORY_CARDS.map((cat, i) => (
                  <button
                    key={cat.label}
                    onClick={() => router.push(`/products?category=${encodeURIComponent(cat.label)}`)}
                    className={`group relative rounded-2xl p-6 text-left overflow-hidden shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up`}
                    style={{ animationDelay: `${0.3 + i * 0.1}s`, background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90`} />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300" style={{ background: "radial-gradient(circle at 50% 50%, white, transparent 70%)" }} />
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <cat.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-white font-bold text-base">{cat.label}</p>
                      <p className="text-white/75 text-xs mt-1 font-medium">{cat.deal}</p>
                      <ChevronRight className="w-4 h-4 text-white/60 mt-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-xl animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-black">Flash Sale</p>
                    <p className="text-amber-300 text-[10px] font-bold">Ends in 2h 30m</p>
                  </div>
                </div>
              </div>

              {/* Floating rating */}
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-3 shadow-xl animate-float animation-delay-2000">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-white text-xs font-bold">10K+ Happy Buyers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
          {[
            { value: "50K+", label: "Products" },
            { value: "10K+", label: "Happy Customers" },
            { value: "500+", label: "Trusted Brands" },
            { value: "24/7", label: "Support" },
          ].map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center py-5 px-4 animate-count-up" style={{ animationDelay: `${0.5 + i * 0.1}s`, background: "rgba(255,255,255,0.04)" }}>
              <span className="text-2xl sm:text-3xl font-black text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{stat.value}</span>
              <span className="text-white/50 text-xs font-medium mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wave */}
      <div className="relative z-10 mt-8">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none" style={{ height: "60px" }}>
          <path d="M0 80L60 68C120 56 240 32 360 24C480 16 600 24 720 30C840 36 960 40 1080 44C1200 48 1320 52 1380 54L1440 56V80H0Z" fill="#f8fafc" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
