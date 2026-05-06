"use client";
import React, { useState, useEffect } from "react";
import { Hero } from "../shared/modules/hero";
import SectionTitle from "../shared/components/section/section-title";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";
import ProductCard from "@/shared/components/cards/Product-card";
import useUser from "@/hooks/useUser";
import useExpiredEventCleanup from "@/hooks/useExpiredEventCleanup";
import EventsSection from "@/shared/components/sections/EventsSection";
import OffersSection from "@/shared/components/sections/OffersSection";
import Footer from "@/shared/components/Footer";
import Link from "next/link";
import ScaleLoader from "@/shared/components/loading/ScaleLoader";
import {
  Store, ArrowRight, TrendingUp, Sparkles, ShoppingCart,
  Heart, X, Zap, Tag, Shield, Truck, RotateCcw, Star,
  ShoppingBag, Package, Flame, Smartphone, Shirt, Home,
  Sparkle, Dumbbell, BookOpen, Puzzle, ShoppingBasket,
  type LucideIcon
} from "lucide-react";

const CATEGORIES: { label: string; icon: LucideIcon; href: string; color: string }[] = [
  { label: "Web Apps",      icon: Smartphone,     href: "/applications?category=web-apps", color: "from-blue-500 to-indigo-600" },
  { label: "Mobile Apps",   icon: Shirt,          href: "/applications?category=mobile-apps", color: "from-pink-500 to-rose-600" },
  { label: "SaaS",          icon: Home,           href: "/applications?category=saas", color: "from-emerald-500 to-teal-600" },
  { label: "APIs",          icon: Sparkle,        href: "/applications?category=apis", color: "from-purple-500 to-violet-600" },
  { label: "Templates",     icon: Dumbbell,       href: "/applications?category=templates", color: "from-orange-500 to-amber-600" },
  { label: "Dashboards",    icon: BookOpen,       href: "/applications?category=dashboards", color: "from-cyan-500 to-sky-600" },
  { label: "E-Commerce",    icon: Puzzle,         href: "/applications?category=ecommerce", color: "from-yellow-500 to-amber-500" },
  { label: "Tools",         icon: ShoppingBasket, href: "/applications?category=tools", color: "from-green-500 to-emerald-600" },
];

const TRUST_FEATURES = [
  { icon: Shield, title: "Verified Code", desc: "100% vetted & secure", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: Truck, title: "Instant Access", desc: "Download immediately", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: RotateCcw, title: "Updates Included", desc: "Free updates & support", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Star, title: "Top Rated", desc: "4.9★ by founders", color: "text-amber-600", bg: "bg-amber-50" },
];

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
    <div className="aspect-square skeleton" />
    <div className="p-3 space-y-2">
      <div className="h-2.5 skeleton w-1/3" />
      <div className="h-3.5 skeleton" />
      <div className="h-3.5 skeleton w-3/4" />
      <div className="h-3 skeleton w-1/4" />
      <div className="h-9 skeleton rounded-xl mt-2" />
    </div>
  </div>
);

export default function Page() {
  const { user, isLoading: userLoading } = useUser();
  const [showWelcome, setShowWelcome] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  useExpiredEventCleanup();

  const welcomeMessages = [
    `Welcome back, ${user?.name?.split(" ")[0] || "Shopper"}!`,
    `Great to see you, ${user?.name?.split(" ")[0] || "Friend"}!`,
    `Hey ${user?.name?.split(" ")[0] || "there"}! Ready to shop?`,
  ];
  const [currentMessage] = useState(() => welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]);

  useEffect(() => {
    if (!user || !showWelcome) return;
    let index = 0;
    setTypedText(""); setIsTyping(true);
    const iv = setInterval(() => {
      if (index < currentMessage.length) { setTypedText(currentMessage.slice(0, index + 1)); index++; }
      else { setIsTyping(false); clearInterval(iv); }
    }, 45);
    return () => clearInterval(iv);
  }, [user, showWelcome, currentMessage]);

  useEffect(() => {
    if (!user || !showWelcome) return;
    const t = setTimeout(() => setShowWelcome(false), 3 * 60 * 1000);
    return () => clearTimeout(t);
  }, [user, showWelcome]);

  const { data: applications, isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/applications?page=1&limit=10");
      return res.data.applications;
    },
    staleTime: 1000 * 60 * 3,
  });

  const { data: latestApplications } = useQuery({
    queryKey: ["latest-applications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/applications?page=1&limit=10&sortBy=createdAt&sortOrder=desc");
      return res.data.applications;
    },
    staleTime: 1000 * 60 * 2,
  });

  const { data: trendingApplications } = useQuery({
    queryKey: ["trending-applications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/applications?page=1&limit=10&sortBy=downloads&sortOrder=desc");
      return res.data.applications;
    },
    staleTime: 1000 * 60 * 5,
  });

  if (userLoading) {
    return <ScaleLoader fullScreen message="Preparing your workspace..." />;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 relative" style={{ 
      background: "linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)"
    }}>
      {/* Animated code-themed background pattern */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px"
          }}
        />
        
        {/* Floating code blocks */}
        <div className="absolute top-20 left-10 text-purple-500/30 font-mono text-xs animate-float">
          {"{ code: 'verified' }"}
        </div>
        <div className="absolute top-40 right-20 text-blue-500/30 font-mono text-xs animate-float animation-delay-1000">
          {"<Component />"}
        </div>
        <div className="absolute top-60 left-1/4 text-emerald-500/30 font-mono text-xs animate-float animation-delay-2000">
          {"const app = () => {}"}
        </div>
        <div className="absolute bottom-40 right-1/4 text-violet-500/30 font-mono text-xs animate-float animation-delay-3000">
          {"npm install"}
        </div>
        <div className="absolute bottom-60 left-1/3 text-cyan-500/30 font-mono text-xs animate-float animation-delay-1500">
          {"git commit -m"}
        </div>
        
        {/* Binary pattern */}
        <div className="absolute top-1/4 right-10 text-purple-400/20 font-mono text-[10px] leading-relaxed animate-pulse">
          01010110<br/>
          01000101<br/>
          01010100<br/>
          01010100
        </div>
        
        {/* Gradient orbs */}
        <div 
          className="absolute top-20 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-slow"
          style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%)" }}
        />
        <div 
          className="absolute bottom-20 left-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse-slow animation-delay-2000"
          style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)" }}
        />
      </div>
      
      {/* Content wrapper with backdrop */}
      <div className="relative z-10">

      {/* Hero — only for guests */}
      {!user && <Hero />}

      {/* Welcome banner for logged-in users */}
      {user && showWelcome && (
        <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628, #0f2744, #0d3f4d)" }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fcd34d, #f59e0b)" }}>
                <Sparkles className="w-4 h-4 text-gray-900" />
              </div>
              <span className="text-sm font-semibold text-white truncate">
                {typedText}
                {isTyping && <span className="animate-pulse text-amber-300 ml-0.5">|</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/cart" className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all">
                <ShoppingCart className="w-4 h-4" />
              </Link>
              <Link href="/wishlist" className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all">
                <Heart className="w-4 h-4" />
              </Link>
              <button onClick={() => setShowWelcome(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events & Offers */}
      <EventsSection minEventsToShow={5} />
      <OffersSection minOffersToShow={5} />

      {/* Category pills */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto bg-slate-800/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-5">
            <SectionTitle title="Browse by Category" icon={<Tag className="w-4 h-4" />} />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.label} href={cat.href}
                className="group flex flex-col items-center gap-2 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}>
                  <cat.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-300 group-hover:text-purple-400 text-center transition-colors leading-tight">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider mx-4 sm:mx-8 opacity-20" />

      {/* Suggested Applications */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <SectionTitle
              title="Featured Applications"
              subtitle="Handpicked production-ready codebases"
              actionLabel="View All"
              actionHref="/applications"
              icon={<Sparkles className="w-4 h-4" />}
            />
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 10 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}

          {!isLoading && !isError && applications?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {applications.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!isLoading && !isError && applications?.length === 0 && (
            <div className="text-center py-16 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No applications available yet.</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-16 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
              <div className="w-12 h-12 rounded-2xl bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-gray-400 font-medium">Failed to load applications.</p>
              <p className="text-gray-500 text-sm mt-1">Make sure the backend is running.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust features banner */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm rounded-3xl p-6 border border-slate-700/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-700/50 hover:shadow-lg transition-all duration-200 border border-slate-700/30">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="text-xs text-gray-400 font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Applications */}
      {trendingApplications?.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-700/30">
            <div className="mb-6">
              <SectionTitle
                title="Trending Now 🔥"
                subtitle="Most popular applications this week"
                actionLabel="View All"
                actionHref="/applications?sort=trending"
                icon={<Flame className="w-4 h-4" />}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {trendingApplications.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Arrivals */}
      {latestApplications?.length > 0 && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="max-w-7xl mx-auto bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm rounded-3xl p-8 border border-blue-700/30">
            <div className="mb-6">
              <SectionTitle
                title="Latest Arrivals ✨"
                subtitle="Fresh applications just added"
                actionLabel="View All"
                actionHref="/applications?sort=latest"
                icon={<Zap className="w-4 h-4" />}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {latestApplications.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Become a Seller CTA */}
      {(!user || !user.role?.includes("seller")) && (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-14 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0a1628 0%, #0f2744 40%, #0d3f4d 100%)" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 animate-hero-glow" style={{ background: "radial-gradient(circle, #14b8a6, transparent 70%)" }} />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 animate-hero-glow animation-delay-2000" style={{ background: "radial-gradient(circle, #f59e0b, transparent 70%)" }} />
          </div>
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-amber-300 border border-amber-400/30 glass mb-6">
              <Store className="w-3.5 h-3.5" />
              Start Your Business Today
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Turn Your Passion Into
              <span className="block" style={{ background: "linear-gradient(135deg, #fcd34d, #f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Profit
              </span>
            </h2>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 font-medium">
              Join thousands of successful sellers. Reach millions of buyers and grow your business with vettcode.
            </p>
            <Link href="/become-seller"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-black text-gray-900 text-base shadow-2xl hover:shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all duration-300"
              style={{ background: "linear-gradient(135deg, #fcd34d, #f59e0b)" }}>
              <Store className="w-5 h-5" />
              Start Selling Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}

      <Footer />
      </div>
    </div>
  );
}

