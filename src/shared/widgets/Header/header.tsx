"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, TrendingUp, Zap } from "lucide-react";
import ProfileIcon from "../../../assets/svgs/profile-icon";
import HeartIcon from "../../../assets/svgs/heart-icon";
import CartIcon from "../../../assets/svgs/cart-icon";
import HeaderBottom from "./header-bottom";
import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import axiosInstance from "@/utils/axiosInstance";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

const formatUserName = (fullName?: string, compact = false): string => {
  if (!fullName) return "User";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "User";
  if (compact) return parts.map(p => p[0]?.toUpperCase()).join("").slice(0, 2);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${parts[1][0]?.toUpperCase()}.`;
  const mid = parts[Math.floor(parts.length / 2)];
  const last = parts[parts.length - 1];
  return `${mid} ${last[0]?.toUpperCase()}.`;
};

type ProductSuggestion = {
  id: string; title: string; slug: string;
  category?: string; sale_price?: number; regular_price?: number;
};

const Header = () => {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const wishlist = useStore((state: any) => state.wishlist);
  const cart = useStore((state: any) => state.cart);
  const { formatPrice } = useCurrencyFormat();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = async (query: string) => {
    setLoadingSuggestions(true);
    try {
      const { data } = await axiosInstance.get("/api/products", { params: { q: query, limit: 7 } });
      setSuggestions(data?.products ?? []);
    } catch { setSuggestions([]); }
    finally { setLoadingSuggestions(false); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) { setShowDropdown(true); void fetchSuggestions(val.trim()); }
    else { setSuggestions([]); setShowDropdown(false); }
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = (slug: string, title: string) => {
    setSearchQuery(title); setShowDropdown(false);
    router.push(`/product/${slug}`);
  };

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 shadow-lg transition-transform duration-300 ${
          isScrolled ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)" }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #8b5cf6, #6366f1, #a855f7, #8b5cf6)", backgroundSize: "200% 100%", animation: "gradient-shift 4s linear infinite" }} />

        {/* Main row */}
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex items-center gap-4 lg:gap-6 py-3 md:py-3.5">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 group">
          <div className="relative w-9 h-9 md:w-11 md:h-11 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl rotate-3 group-hover:rotate-6 transition-transform duration-300 shadow-lg" />
            <div className="relative w-full h-full bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-sm md:text-base leading-none select-none" style={{ fontFamily: "var(--font-space)" }}>VC</span>
            </div>
          </div>
          <div className="hidden md:flex flex-col leading-none">
            <span className="text-white font-black text-xl tracking-tight" style={{ fontFamily: "var(--font-space)" }}>
              VETT<span className="text-purple-300">CODE</span>
            </span>
            <span className="text-purple-300/70 text-[9px] tracking-[0.2em] uppercase font-medium">Marketplace</span>
          </div>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="flex-1 relative max-w-2xl">
          <div className="flex items-center bg-white/95 rounded-2xl overflow-hidden shadow-lg ring-2 ring-transparent focus-within:ring-purple-400/60 transition-all duration-300">
            <Search className="ml-3 md:ml-4 w-4 h-4 text-purple-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search applications, categories, developers..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-3 py-2.5 md:py-3 text-sm md:text-base text-gray-800 placeholder-gray-400 outline-none bg-transparent"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSuggestions([]); setShowDropdown(false); }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
            <button onClick={handleSearch}
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold px-4 md:px-6 py-2.5 md:py-3 text-sm transition-all duration-200 flex-shrink-0 flex items-center gap-1.5 active:scale-95">
              <Search className="w-3.5 h-3.5 md:hidden" />
              <span className="hidden md:inline">Search</span>
            </button>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down">
              {loadingSuggestions ? (
                <div className="flex items-center gap-3 px-4 py-4 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" /> Searching...
                </div>
              ) : suggestions.length > 0 ? (
                <>
                  <div className="px-4 py-2.5 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-100 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Suggestions</span>
                  </div>
                  <ul className="max-h-72 overflow-y-auto">
                    {suggestions.map((item) => (
                      <li key={item.id}>
                        <button onClick={() => handleSelect(item.slug, item.title)}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left group">
                          <div className="min-w-0 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0 group-hover:bg-purple-600 transition-colors" />
                            <div>
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                              {item.category && <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.category}</p>}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-purple-700 flex-shrink-0 bg-purple-50 px-2 py-0.5 rounded-lg">
                            {formatPrice(item.sale_price ?? item.regular_price)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                    <button onClick={handleSearch} className="text-xs text-purple-600 font-semibold hover:text-purple-800 transition-colors">
                      See all results for &ldquo;{searchQuery}&rdquo; →
                    </button>
                  </div>
                </>
              ) : (
                <div className="px-4 py-5 text-sm text-gray-500 text-center">
                  No results for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3 lg:gap-5 flex-shrink-0">

          {/* Profile */}
          <Link href={user ? "/profile" : "/login"} className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 lg:w-10 lg:h-10 rounded-full overflow-hidden ring-2 ring-white/20 group-hover:ring-purple-400 transition-all duration-200 flex-shrink-0">
              {user?.avatar || user?.images?.[0]?.url ? (
                <Image src={user.avatar || user.images[0].url} alt={user.name || "User"} width={40} height={40} className="w-full h-full object-cover" />
              ) : user ? (
                <div className="w-full h-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-xs font-black">
                  {formatUserName(user.name, true)}
                </div>
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center">
                  <ProfileIcon />
                </div>
              )}
            </div>
            <div className="hidden lg:block leading-tight">
              <p className="text-purple-300/70 text-[10px] font-medium">{user ? "Hello," : "Welcome,"}</p>
              <p className="text-white font-bold text-sm">{isLoading ? "..." : user ? formatUserName(user.name) : "Sign In"}</p>
            </div>
          </Link>

          <div className="w-px h-8 bg-white/15" />

          {/* Wishlist */}
          <Link href="/wishlist" className="relative flex flex-col items-center gap-0.5 group">
            <div className="relative p-1.5 rounded-xl group-hover:bg-white/10 transition-colors">
              <HeartIcon size={22} isActive={wishlist?.length > 0} />
              {wishlist?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-pink-500 text-[9px] font-black text-white px-1 shadow-md">
                  {wishlist.length > 9 ? "9+" : wishlist.length}
                </span>
              )}
            </div>
            <span className="text-purple-300/60 text-[9px] font-medium group-hover:text-white transition-colors">Wishlist</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative flex flex-col items-center gap-0.5 group">
            <div className="relative p-1.5 rounded-xl group-hover:bg-white/10 transition-colors">
              <CartIcon size={22} isActive={cart?.length > 0} />
              {cart?.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-purple-400 text-[9px] font-black text-white px-1 shadow-md">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              )}
            </div>
            <span className="text-purple-300/60 text-[9px] font-medium group-hover:text-white transition-colors">Cart</span>
          </Link>
        </div>
      </div>

      </header>
      <HeaderBottom />
    </>
  );
};

export default Header;
