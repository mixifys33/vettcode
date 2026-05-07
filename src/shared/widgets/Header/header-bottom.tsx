'use client';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AlignLeft, ChevronDown, ChevronRight, User, Heart, ShoppingCart,
  Home, Sparkles, Search, X, Loader2, TrendingUp, Download,
  Smartphone, Monitor, Tablet, Code, Chrome, Plug, Package,
  Terminal, Gamepad2, ShoppingBag, FileText, LayoutDashboard, Layers,
} from 'lucide-react';
import { navItemTypes } from '../../../configs/constants';
import useUser from '@/hooks/useUser';
import { useStore } from '@/store';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';

/* ─── types ─────────────────────────────────────────────── */
type ProductSuggestion = {
  id?: string;
  _id?: string;
  title?: string;
  appName?: string;
  slug?: string;
  appCategory?: string;
  price?: number;
  isFree?: boolean;
};

type Category = {
  name: string;
  icon: any;
};

/* ─── Static Categories from Seller Frontend ─────────────── */
const STATIC_CATEGORIES: Category[] = [
  { name: 'Web Application', icon: Monitor },
  { name: 'Mobile App (React Native)', icon: Smartphone },
  { name: 'Mobile App (Native iOS)', icon: Tablet },
  { name: 'Mobile App (Native Android)', icon: Smartphone },
  { name: 'Desktop Application', icon: Monitor },
  { name: 'API/Backend Service', icon: Code },
  { name: 'Chrome Extension', icon: Chrome },
  { name: 'WordPress Plugin', icon: Plug },
  { name: 'NPM Package/Library', icon: Package },
  { name: 'CLI Tool', icon: Terminal },
  { name: 'Game', icon: Gamepad2 },
  { name: 'E-commerce Solution', icon: ShoppingBag },
  { name: 'CMS/Blog Platform', icon: FileText },
  { name: 'Dashboard/Admin Panel', icon: LayoutDashboard },
  { name: 'Other', icon: Layers },
];

const getUserInitials = (name?: string) => {
  if (!name) return 'U';
  return name.trim().split(/\s+/).map(p => p[0]?.toUpperCase()).join('').slice(0, 2);
};

const HIDDEN_PATHS = ['/ai-assistant', '/inbox'];

/* ═══════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════ */
const HeaderBottom = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const wishlist = useStore((s: any) => s.wishlist);
  const cart = useStore((s: any) => s.cart);
  const { formatPrice } = useCurrencyFormat();

  /* scroll state */
  const [isSticky, setIsSticky] = useState(false);

  /* categories dropdown */
  const [showCats, setShowCats] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  /* search (sticky collapsed) */
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shouldHide = HIDDEN_PATHS.some(p => pathname === p || pathname?.startsWith(`${p}/`));

  // Fetch all applications once and cache (for search suggestions)
  const { data: allApplications, isLoading: isLoadingApps } = useQuery({
    queryKey: ["all-applications-search"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/api/applications?page=1&limit=1000');
        console.log('📦 Fetched applications for search:', res.data?.applications?.length || 0);
        return res.data?.applications ?? [];
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
  });

  /* scroll listener */
  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close cat dropdown on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setShowCats(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* close search dropdown on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDrop(false);
        if (isSticky) setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [isSticky]);

  /* focus input when search expands */
  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  /* Client-side search filtering */
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2 || !allApplications) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = allApplications.filter((app: any) =>
      app.appName?.toLowerCase().includes(query) ||
      app.shortDescription?.toLowerCase().includes(query) ||
      app.detailedDescription?.toLowerCase().includes(query) ||
      app.tags?.toLowerCase().includes(query) ||
      app.appCategory?.toLowerCase().includes(query)
    );

    // Return top 7 results
    return filtered.slice(0, 7);
  }, [searchQuery, allApplications]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchQuery(v);
    if (v.trim().length >= 2) {
      setShowDrop(true);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
      setShowDrop(false);
    }
  };

  // Update suggestions when filtered results change
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setSuggestions(filteredSuggestions);
    }
  }, [filteredSuggestions, searchQuery]);

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowDrop(false); setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = (slug: string, title: string) => {
    setSearchQuery(title); setShowDrop(false); setSearchOpen(false);
    router.push(`/product/${slug}`);
  };

  /* ── shared icon strip (profile / wishlist / cart) ── */
  const IconStrip = () => (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <Link href={user ? '/profile' : '/login'}
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30 hover:border-amber-400 transition-colors flex-shrink-0">
        {user?.avatar || user?.images?.[0]?.url ? (
          <Image src={user.avatar || user.images[0].url} alt={user.name || 'User'} width={32} height={32} className="w-full h-full object-cover" />
        ) : user ? (
          <div className="w-full h-full bg-amber-400 flex items-center justify-center text-teal-900 text-[10px] font-black">
            {getUserInitials(user.name)}
          </div>
        ) : (
          <div className="w-full h-full bg-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </Link>
      <Link href="/wishlist" className="relative p-1">
        <Heart className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
        {wishlist?.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-0.5">
            {wishlist.length > 9 ? '9+' : wishlist.length}
          </span>
        )}
      </Link>
      <Link href="/cart" className="relative p-1">
        <ShoppingCart className="w-5 h-5 text-white/80 hover:text-white transition-colors" />
        {cart?.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-teal-900 px-0.5">
            {cart.length > 9 ? '9+' : cart.length}
          </span>
        )}
      </Link>
    </div>
  );

  /* ── categories dropdown panel ── */
  const CatDropdown = () => (
    <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-down">
      <div className="py-2 max-h-96 overflow-y-auto">
        {STATIC_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              onClick={() => setShowCats(false)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-teal-50 text-gray-700 hover:text-teal-700 text-sm font-medium transition-colors group">
              <IconComponent className="w-4 h-4 text-gray-400 group-hover:text-teal-500 transition-colors flex-shrink-0" />
              <span className="truncate">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );

  /* ── search suggestions dropdown ── */
  const SearchDropdown = () => (
    <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-down">
      {suggestions.length > 0 ? (
        <>
          <div className="px-4 py-2 bg-gradient-to-r from-teal-50 to-indigo-50 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Suggestions</span>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {suggestions.map((item) => (
              <li key={item.id || item._id}>
                <button onClick={() => handleSelect(item.slug || item._id, item.appName || item.title)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-teal-50 transition-colors text-left group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.appName || item.title}</p>
                      {item.appCategory && <p className="text-xs text-gray-400 capitalize">{item.appCategory}</p>}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-teal-700 flex-shrink-0 bg-teal-50 px-2 py-0.5 rounded-lg">
                    {item.isFree || item.price === 0 ? 'FREE' : formatPrice(item.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
            <button onClick={handleSearch} className="text-xs text-teal-600 font-semibold hover:text-teal-800 transition-colors">
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
  );

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── NAV BAR ─────────────────────────────────────── */}
      <div className={`w-full bg-[#0d3f4d] transition-all duration-300 ${
        isSticky ? 'fixed top-0 left-0 z-[60] shadow-xl' : 'relative'
      }`}>
        <div className="max-w-[1400px] mx-auto px-3 lg:px-8 flex items-center gap-2 h-11 md:h-12">

          {/* ── Logo (sticky only) ── */}
          {isSticky && (
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 mr-2">
              <div className="relative w-7 h-7 flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg rotate-3 transition-transform duration-300" />
                <div className="relative w-full h-full bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-black text-xs leading-none select-none" style={{ fontFamily: "var(--font-space)" }}>VC</span>
                </div>
              </div>
              <span className="hidden sm:block text-white font-black text-sm" style={{ fontFamily: 'var(--font-space)' }}>
                VETT<span className="text-purple-300">CODE</span>
              </span>
            </Link>
          )}

          {/* ── Categories button ── */}
          <div ref={catRef} className="relative flex-shrink-0">
            <button
              onClick={() => setShowCats(!showCats)}
              className="flex items-center gap-1.5 px-3 md:px-4 h-11 md:h-12 font-black text-xs md:text-sm transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#ffffff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <AlignLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Categories</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showCats ? 'rotate-180' : ''}`} />
            </button>
            {showCats && <CatDropdown />}
          </div>

          {/* ── Nav links ── */}
          <nav className="flex items-center overflow-x-auto scrollbar-hide flex-1 px-1 md:px-2">
            {navItemTypes.map((item: NavItemTypes, i: number) => {
              const active = pathname === item.href;
              return (
                <Link key={i} href={item.href}
                  className={`px-2.5 md:px-3 h-11 md:h-12 flex items-center text-xs md:text-sm whitespace-nowrap transition-all duration-200 border-b-2 ${
                    active ? 'border-purple-400' : 'border-transparent hover:border-white/30'
                  }`}
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    color: active ? '#c4b5fd' : '#ffffff',
                  }}>
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* ── Right side ── */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">

            {/* E-AI pill */}
            <Link href="/ai-assistant"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white text-xs font-semibold rounded-full transition-all shadow-md flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
              VettCode AI
            </Link>

            {/* Install pill */}
            <Link href="/install"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-400 to-violet-500 hover:from-purple-500 hover:to-violet-600 text-white text-xs font-semibold rounded-full transition-all shadow-md flex-shrink-0">
              <Download className="w-3.5 h-3.5" />
              Install App
            </Link>

            {/* ── Sticky extras ── */}
            {isSticky && (
              <>
                {/* Collapsible search */}
                <div ref={searchRef} className="relative hidden md:flex items-center">
                  {!searchOpen ? (
                    <button
                      onClick={() => setSearchOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20">
                      <Search className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Search applications</span>
                    </button>
                  ) : (
                    <div className="flex items-center bg-white rounded-xl overflow-hidden shadow-lg ring-2 ring-purple-400/60 transition-all w-56 lg:w-72">
                      <Search className="ml-3 w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search applications…"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1 px-2 py-2 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                      />
                      {searchQuery ? (
                        <button onClick={() => { setSearchQuery(''); setSuggestions([]); setShowDrop(false); }}
                          className="p-1.5 text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={() => setSearchOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={handleSearch}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 text-xs transition-all flex-shrink-0 active:scale-95">
                        Go
                      </button>
                    </div>
                  )}
                  {showDrop && searchOpen && <SearchDropdown />}
                </div>

                {/* Profile / wishlist / cart */}
                <div className="hidden md:flex">
                  <IconStrip />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────── */}
      {!shouldHide && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-around py-1.5 px-2">
            {[
              { href: '/', icon: Home, label: 'Home', activeColor: 'text-purple-700', activeBg: 'bg-purple-50' },
              { href: '/ai-assistant', icon: Sparkles, label: 'VettCode AI', gradient: true },
              { href: '/install', icon: Download, label: 'Install', activeColor: 'text-purple-500', activeBg: 'bg-purple-50' },
              { href: '/wishlist', icon: Heart, label: 'Wishlist', activeColor: 'text-red-500', activeBg: 'bg-red-50', badge: wishlist?.length, badgeColor: 'bg-red-500 text-white' },
              { href: '/cart', icon: ShoppingCart, label: 'Cart', activeColor: 'text-purple-700', activeBg: 'bg-purple-50', badge: cart?.length, badgeColor: 'bg-purple-600 text-white' },
            ].map(({ href, icon: Icon, label, activeColor, activeBg, gradient, badge, badgeColor }: any) => {              const active = pathname === href;
              return (
                <Link key={href} href={href} className="flex flex-col items-center gap-0.5 p-1 min-w-[52px]">
                  <div className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all ${
                    gradient ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-md' :
                    active ? activeBg : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${gradient ? 'text-white' : active ? activeColor : 'text-gray-500'}`} />
                    {badge > 0 && (
                      <span className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-[9px] font-bold px-0.5 ${badgeColor}`}>
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? (activeColor || 'text-purple-700') : 'text-gray-500'}`}>{label}</span>
                </Link>
              );
            })}

            {/* Profile */}
            <Link href={user ? '/profile' : '/login'} className="flex flex-col items-center gap-0.5 p-1 min-w-[52px]">
              <div className={`w-9 h-9 rounded-full overflow-hidden transition-all ${pathname === '/profile' ? 'ring-2 ring-purple-600' : ''} ${!user ? 'bg-gray-100 flex items-center justify-center' : ''}`}>
                {user?.avatar || user?.images?.[0]?.url ? (
                  <Image src={user.avatar || user.images[0].url} alt={user.name || 'User'} width={36} height={36} className="w-full h-full object-cover" />
                ) : user ? (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white text-[10px] font-black">
                    {getUserInitials(user.name)}
                  </div>
                ) : (
                  <User className="w-4 h-4 text-gray-500" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${pathname === '/profile' ? 'text-purple-700' : 'text-gray-500'}`}>
                {isLoading ? '…' : user ? 'Profile' : 'Login'}
              </span>
            </Link>
          </div>
        </div>
      )}

      {!shouldHide && <div className="md:hidden h-16" />}
    </>
  );
};

export default HeaderBottom;

