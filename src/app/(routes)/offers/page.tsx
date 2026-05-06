"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import {
  Tag, ShoppingCart, Heart, Zap, Gift, ArrowRight, Package,
  Loader2, Sparkles, Timer, Star, Copy, Check, Store,
  Percent, Truck, Layers, ShoppingBag, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────────── */
interface CampaignProduct {
  id: string; title: string; slug: string;
  sale_price: number; regular_price: number; discounted_price: number;
  image: string | null; category: string; brand?: string;
  stock: number; ratings: number; savings: number;
}
interface Campaign {
  id: string; title: string; description: string;
  type: string; discountType: string; discountValue: number;
  minOrderAmount: number; couponCode?: string;
  bannerColor: string; startDate: string; endDate: string;
  appliesTo: string; products: CampaignProduct[];
  shopName: string; shopAvatar: string | null; productCount: number;
}

/* ─── Helpers ────────────────────────────────────────────── */
const TYPE_META: Record<string, { icon: React.ElementType; label: string }> = {
  discount:      { icon: Percent,      label: "Discount" },
  flash_sale:    { icon: Zap,          label: "Flash Sale" },
  buy_x_get_y:   { icon: Gift,         label: "Buy X Get Y" },
  free_shipping: { icon: Truck,        label: "Free Shipping" },
  bundle:        { icon: Layers,       label: "Bundle Deal" },
};

function useCountdown(endDate: string) {
  const [left, setLeft] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setLeft("Ended"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);
  return left;
}

function CampaignBanner({ campaign }: { campaign: Campaign }) {
  const countdown = useCountdown(campaign.endDate);
  const TypeIcon = TYPE_META[campaign.type]?.icon || Tag;
  const typeLabel = TYPE_META[campaign.type]?.label || campaign.type;
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!campaign.couponCode) return;
    navigator.clipboard.writeText(campaign.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Coupon code copied!");
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden text-white p-5 sm:p-7 mb-2"
      style={{ background: `linear-gradient(135deg, ${campaign.bannerColor}ee, ${campaign.bannerColor}99)` }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-3">
            <TypeIcon className="w-3.5 h-3.5" />
            {typeLabel}
          </div>
          <h2 className="text-xl sm:text-2xl font-black leading-tight mb-1">{campaign.title}</h2>
          {campaign.description && <p className="text-white/80 text-sm line-clamp-2">{campaign.description}</p>}

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {/* Discount badge */}
            <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-1.5 text-sm font-bold">
              {campaign.discountType === 'percentage'
                ? `${campaign.discountValue}% OFF`
                : `UGX ${campaign.discountValue.toLocaleString('en-UG')} OFF`}
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur rounded-xl px-3 py-1.5 text-sm font-semibold">
              <Timer className="w-3.5 h-3.5" />
              {countdown}
            </div>

            {/* Min order */}
            {campaign.minOrderAmount > 0 && (
              <div className="text-white/70 text-xs">
                Min. UGX {campaign.minOrderAmount.toLocaleString('en-UG')}
              </div>
            )}
          </div>

          {/* Coupon code */}
          {campaign.couponCode && (
            <button onClick={copyCode}
              className="mt-3 inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 rounded-xl px-4 py-2 text-sm font-bold transition active:scale-95">
              <Tag className="w-3.5 h-3.5" />
              Code: {campaign.couponCode}
              {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Shop info */}
        <div className="flex items-center gap-2 sm:flex-col sm:items-end flex-shrink-0">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl px-3 py-2">
            {campaign.shopAvatar ? (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image src={campaign.shopAvatar} alt={campaign.shopName} width={32} height={32} className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4" />
              </div>
            )}
            <span className="text-sm font-semibold">{campaign.shopName}</span>
          </div>
          <div className="text-white/70 text-xs text-right">
            {campaign.productCount} product{campaign.productCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product, campaign, user, cart, addToCart, wishlist, toggleWishlist }: {
  product: CampaignProduct; campaign: Campaign;
  user: any; cart: any[]; addToCart: any;
  wishlist: string[]; toggleWishlist: (id: string) => void;
}) {
  const inCart = cart.some((i: any) => i.id === product.id);
  const inWishlist = wishlist.includes(product.id);
  const discountPct = product.sale_price > 0
    ? Math.round((1 - product.discounted_price / product.sale_price) * 100)
    : campaign.discountValue;

  const handleCart = () => {
    if (!user) { toast.error("Please sign in to add to cart"); return; }
    addToCart({ id: product.id, title: product.title, price: product.discounted_price, image: product.image || "", shopId: "" }, user, null, null);
    toast.success(inCart ? "Removed from cart" : "Added to cart!");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square bg-gray-50 overflow-hidden">
        {product.image ? (
          <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition duration-300" unoptimized
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-10 h-10 text-gray-200" /></div>
        )}
        {/* Discount badge */}
        {discountPct > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            -{discountPct}%
          </div>
        )}
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded">Out of Stock</span>
          </div>
        )}
        {/* Wishlist */}
        <button onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow hover:scale-110 transition">
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
      </Link>

      <div className="p-3 flex-1 flex flex-col">
        <p className="text-xs text-gray-400 mb-0.5">{product.brand || product.category}</p>
        <Link href={`/product/${product.slug}`}>
          <p className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-teal-700 transition leading-tight">{product.title}</p>
        </Link>

        {product.ratings > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] text-gray-500">{product.ratings.toFixed(1)}</span>
          </div>
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-black text-teal-700">
              UGX {product.discounted_price.toLocaleString("en-UG")}
            </span>
            {product.sale_price > product.discounted_price && (
              <span className="text-xs text-gray-400 line-through">
                UGX {product.sale_price.toLocaleString("en-UG")}
              </span>
            )}
          </div>
          {product.savings > 0 && (
            <p className="text-[10px] text-green-600 font-medium">
              Save UGX {product.savings.toLocaleString("en-UG")}
            </p>
          )}
        </div>
      </div>

      <button onClick={handleCart} disabled={product.stock === 0}
        className={`w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
          inCart ? "bg-teal-600 text-white hover:bg-red-500" : "bg-gray-50 text-gray-700 hover:bg-teal-600 hover:text-white"
        }`}>
        <ShoppingCart className="w-3.5 h-3.5" />
        {product.stock === 0 ? "Out of Stock" : inCart ? "Remove" : "Add to Cart"}
      </button>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function OffersPage() {
  const { user } = useUser();
  const addToCart = useStore((s: any) => s.addToCart);
  const removeFromWishlist = useStore((s: any) => s.removeFromWishlist);
  const addToWishlist = useStore((s: any) => s.addToWishlist);
  const cart = useStore((s: any) => s.cart);
  const wishlistStore = useStore((s: any) => s.wishlist) as any[];

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const wishlistIds = useMemo(() => wishlistStore.map((i: any) => i.id), [wishlistStore]);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns/active");
      const data = await res.json();
      if (data.success) setCampaigns(data.campaigns || []);
    } catch (e) {
      console.error("Failed to fetch campaigns:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (productId: string) => {
    if (!user) { toast.error("Please sign in"); return; }
    const inWishlist = wishlistIds.includes(productId);
    if (inWishlist) removeFromWishlist(productId, user, null, null);
    else addToWishlist({ id: productId, title: "", price: 0, image: "", shopId: "" }, user, null, null);
  };

  const filtered = useMemo(() => {
    if (filter === "all") return campaigns;
    return campaigns.filter(c => c.type === filter);
  }, [campaigns, filter]);

  const types = useMemo(() => {
    const seen = new Set<string>();
    campaigns.forEach(c => seen.add(c.type));
    return Array.from(seen);
  }, [campaigns]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading offers…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Active Campaigns & Deals
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-2">Today's Best Offers</h1>
          <p className="text-teal-200 text-sm sm:text-base">Exclusive deals from verified sellers — limited time only</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Filter + Refresh */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === "all" ? "bg-teal-600 text-white" : "bg-white text-gray-600 border hover:border-teal-400"}`}>
            All ({campaigns.length})
          </button>
          {types.map(t => {
            const meta = TYPE_META[t];
            const Icon = meta?.icon || Tag;
            return (
              <button key={t} onClick={() => setFilter(t)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition ${filter === t ? "bg-teal-600 text-white" : "bg-white text-gray-600 border hover:border-teal-400"}`}>
                <Icon className="w-3.5 h-3.5" />
                {meta?.label || t}
              </button>
            );
          })}
          <button onClick={fetchCampaigns} className="ml-auto p-2 bg-white border rounded-xl hover:bg-gray-50 transition" title="Refresh">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Tag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No active offers right now</h2>
            <p className="text-gray-500 text-sm mb-6">Check back soon — sellers are always adding new deals</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition">
              <ShoppingBag className="w-4 h-4" />Browse All Products
            </Link>
          </div>
        )}

        {/* Campaign cards */}
        <div className="space-y-10">
          {filtered.map(campaign => {
            const isExpanded = expandedId === campaign.id;
            const shown = isExpanded ? campaign.products : campaign.products.slice(0, 4);

            return (
              <div key={campaign.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Banner */}
                <div className="p-4 sm:p-5">
                  <CampaignBanner campaign={campaign} />
                </div>

                {/* Products grid */}
                {campaign.products.length > 0 ? (
                  <div className="px-4 sm:px-5 pb-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {shown.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          campaign={campaign}
                          user={user}
                          cart={cart}
                          addToCart={addToCart}
                          wishlist={wishlistIds}
                          toggleWishlist={toggleWishlist}
                        />
                      ))}
                    </div>

                    {campaign.products.length > 4 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : campaign.id)}
                        className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-xl text-sm font-semibold text-gray-500 hover:text-teal-600 transition flex items-center justify-center gap-2"
                      >
                        {isExpanded ? "Show less" : `Show all ${campaign.products.length} products`}
                        <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="px-5 pb-5 text-center text-sm text-gray-400 py-6">
                    <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    No products in this campaign yet
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

