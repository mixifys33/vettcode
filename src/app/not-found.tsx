"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Home, Search, ArrowLeft, RefreshCw, Tag, Headphones } from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "Home", icon: Home, desc: "Back to the main page" },
  { href: "/products", label: "Browse Products", icon: ShoppingBag, desc: "Explore all products" },
  { href: "/offers", label: "Offers & Deals", icon: Tag, desc: "See today's best deals" },
  { href: "/contact", label: "Contact Support", icon: Headphones, desc: "We're here to help" },
];

// Floating particle component
function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="absolute rounded-full opacity-20 animate-pulse" style={style} />;
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dots, setDots] = useState(".");

  useEffect(() => {
    setMounted(true);
    // Animate the "searching..." dots
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "." : d + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e38] via-[#115061] to-[#0d3f4d] flex items-center justify-center px-4 py-16 relative overflow-hidden">

      {/* Background particles */}
      <Particle style={{ width: 300, height: 300, background: "#facc15", top: "-80px", left: "-80px", filter: "blur(80px)" }} />
      <Particle style={{ width: 250, height: 250, background: "#2dd4bf", bottom: "-60px", right: "-60px", filter: "blur(80px)" }} />
      <Particle style={{ width: 150, height: 150, background: "#60a5fa", top: "40%", left: "10%", filter: "blur(60px)" }} />

      {/* Floating shapes */}
      <div className="absolute top-16 right-16 w-5 h-5 bg-yellow-400 rounded-full opacity-50 animate-bounce" style={{ animationDuration: "3s" }} />
      <div className="absolute bottom-24 left-20 w-3 h-3 bg-teal-300 rounded-full opacity-50 animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-white rounded-full opacity-30 animate-bounce" style={{ animationDuration: "5s", animationDelay: "2s" }} />
      <div className="absolute bottom-1/3 right-12 w-4 h-4 bg-orange-400 rounded-full opacity-40 animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "0.5s" }} />

      {/* Main card */}
      <div
        className={`relative z-10 w-full max-w-2xl transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* 404 big number */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <span
              className="text-[10rem] sm:text-[12rem] font-black leading-none select-none"
              style={{
                background: "linear-gradient(135deg, #facc15, #fb923c, #facc15)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
                animation: "gradient 3s ease infinite",
                filter: "drop-shadow(0 0 40px rgba(250,204,21,0.3))",
              }}
            >
              404
            </span>
            {/* Shopping bag icon floating over the 4 */}
            <div
              className="absolute -top-4 -right-4 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-xl"
              style={{ animation: "float 3s ease-in-out infinite" }}
            >
              <ShoppingBag className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Message */}
        <div
          className={`text-center mb-8 transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Oops! This page went shopping 
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-md mx-auto leading-relaxed">
            The page you're looking for doesn't exist or was moved to another section. But don't worry — there's plenty more to explore or contact support at (+256761819885) for help.
          </p>
        </div>

        {/* Search bar */}
        <div
          className={`mb-8 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search products${dots}`}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-2xl hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 transition-all duration-200 text-sm whitespace-nowrap"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick links */}
        <div
          className={`grid grid-cols-2 gap-3 mb-8 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {QUICK_LINKS.map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="group flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/20 hover:border-white/25 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors flex-shrink-0">
                <link.icon className="w-5 h-5 text-white/70 group-hover:text-yellow-400 transition-colors" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-semibold text-sm">{link.label}</div>
                <div className="text-white/50 text-xs truncate">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom actions */}
        <div
          className={`flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 delay-[400ms] ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-200 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full hover:bg-white/20 transition-all duration-200 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold rounded-full hover:shadow-lg hover:shadow-yellow-500/30 hover:scale-105 transition-all duration-200 text-sm"
          >
            <Home className="w-4 h-4" />
            Take Me Home
          </Link>
        </div>

        {/* Footer note */}
        <p
          className={`text-center text-white/30 text-xs mt-8 transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}
        >
          Error 404 · vettcode Uganda
        </p>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
