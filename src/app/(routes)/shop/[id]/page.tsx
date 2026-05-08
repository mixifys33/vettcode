"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Store, MapPin, Star, Globe, Clock, Package, ChevronRight, 
  Loader2, ArrowLeft, Share2, Heart, MessageCircle, CheckCircle, 
  ExternalLink, ShoppingBag, ShoppingCart, Eye, UserPlus, UserMinus,
  Copy, Check, Filter, Code2, Download, Award, Zap, Terminal, Sparkles
} from "lucide-react";
import axiosInstance from "@/utils/axiosInstance";
import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { useLocationTracking, useDeviceTracking } from "@/hooks/useTracking";
import { toast } from "sonner";

interface ShopDetail {
  id: string;
  name: string;
  bio?: string;
  category: string;
  address: string;
  ratings: number;
  reviewCount: number;
  productCount: number;
  avatar?: string;
  coverBanner?: string;
  images?: { url: string }[];
  website?: string;
  opening_hours?: string;
  socialLinks?: any;
  isVerified: boolean;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    country: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    review?: string;
    createdAt: string;
    user?: { id: string; name: string; avatar?: string };
  }>;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  sale_price: number;
  regular_price: number;
  ratings: number;
  stock: number;
  images?: { url: string }[];
}

interface OtherShop {
  id: string;
  name: string;
  bio?: string;
  category: string;
  avatar?: string;
  coverBanner?: string;
  ratings: number;
  productCount: number;
}

// Product Card Component - Enhanced with cart functionality and VettCode dark theme
const ProductCard = ({ product, onAddToCart, isInCart, cartQty, isAdding }: { 
  product: Product; 
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
  cartQty: number;
  isAdding: boolean;
}) => {
  const productImage = product.images?.[0]?.url || "/placeholder-product.svg";
  const discount = product.regular_price > product.sale_price
    ? Math.round(((product.regular_price - product.sale_price) / product.regular_price) * 100)
    : 0;
  const isFree = product.sale_price === 0;
  const isVerified = (product as any).verificationStatus === 'verified';

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/20 transition-all overflow-hidden group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-slate-900">
          <Image src={productImage} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
              -{discount}%
            </div>
          )}
          {isFree && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
              FREE
            </div>
          )}
          {isVerified && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
              <Award className="w-3 h-3" />
              Verified
            </div>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg">
              Low Stock
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute bottom-3 left-3 bg-gray-700 text-white px-2 py-1 rounded-lg text-xs font-medium shadow-lg">
              Out of Stock
            </div>
          )}
          {isInCart && (
            <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
              <Check className="w-3 h-3" /> {cartQty}
            </div>
          )}
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 border border-white/20">
              <Eye className="w-4 h-4" /> Quick View
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-white line-clamp-2 group-hover:text-purple-300 mb-2 transition-colors">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium text-gray-300">{product.ratings?.toFixed(1) || "5.0"}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-purple-300">
            {isFree ? 'FREE' : `$${product.sale_price.toLocaleString()}`}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-500 line-through">
              ${product.regular_price.toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
          disabled={product.stock === 0 || isAdding}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition shadow-lg ${
            isInCart
              ? "bg-green-500/20 text-green-300 border border-green-500/30"
              : product.stock === 0
              ? "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-600"
              : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-purple-500/50"
          }`}
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isInCart ? (
            <><Check className="w-4 h-4" /> In Cart ({cartQty})</>
          ) : product.stock === 0 ? (
            "Out of Stock"
          ) : (
            <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
          )}
        </button>
      </div>
    </div>
  );
};

// Other Shop Card Component
const OtherShopCard = ({ shop }: { shop: OtherShop }) => {
  const shopAvatar = shop.avatar || "/placeholder-shop.svg";

  return (
    <Link href={`/shop/${shop.id}`} className="block group">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/20 transition-all p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 shrink-0 shadow-lg shadow-purple-500/50">
          <Image src={shopAvatar} alt={shop.name} fill className="object-cover" unoptimized />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">{shop.name}</h4>
          <p className="text-sm text-gray-400">{shop.category}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              {shop.ratings?.toFixed(1) || "5.0"}
            </span>
            <span>{shop.productCount} applications</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
      </div>
    </Link>
  );
};


// Main Shop Detail Page
export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  
  // Store
  const cart = useStore((state) => state.cart);
  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);

  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [otherShops, setOtherShops] = useState<OtherShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [productSort, setProductSort] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // UI State
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Cart helpers
  const cartItemIds = new Set(cart.map((item: any) => item.id));
  const cartQuantities: Record<string, number> = {};
  cart.forEach((item: any) => { cartQuantities[item.id] = item.quantity || 1; });

  // Get unique categories from products
  const productCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    if (cartItemIds.has(product.id)) {
      toast.info(`Already in cart (${cartQuantities[product.id]} items)`);
      return;
    }
    setAddingToCart(product.id);
    try {
      addToCart(product as any, user, location, deviceInfo);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  // Handle like shop
  const handleLikeShop = async () => {
    if (!user) {
      toast.error("Please login to like shops");
      return;
    }
    setIsLiked(!isLiked);
    toast.success(isLiked ? "Removed from liked shops" : "Added to liked shops");
  };

  // Handle follow shop
  const handleFollowShop = async () => {
    if (!user) {
      toast.error("Please login to follow shops");
      router.push("/login");
      return;
    }
    
    setFollowLoading(true);
    try {
      const endpoint = isFollowing ? "/api/user/unfollow-shop" : "/api/user/follow-shop";
      await axiosInstance.post(endpoint, { shopId });
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed shop" : "Now following this shop!");
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  // Handle chat with seller
  const handleChatWithSeller = () => {
    if (!user) {
      toast.error("Please login to chat with seller");
      router.push("/login");
      return;
    }
    // Navigate to inbox with this seller
    router.push(`/inbox?sellerId=${shop?.seller?.id}&shopId=${shopId}&shopName=${encodeURIComponent(shop?.name || '')}`);
  };

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    const title = `Check out ${shop?.name} on vettcode`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
      }
    } else {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  // Fetch shop details
  const fetchShopDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/api/shops/${shopId}`);
      const data = response.data;

      if (data.success) {
        setShop(data.shop);
        setProducts(data.products);
        setOtherShops(data.otherShops || []);
        setNextCursor(data.nextProductCursor);
        setHasMore(data.hasMoreProducts);
      } else {
        setError(data.message || "Failed to fetch shop details");
      }
    } catch (err: any) {
      console.error("Error fetching shop:", err);
      setError(err.response?.data?.message || "Failed to fetch shop details");
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  // Fetch more products
  const fetchMoreProducts = useCallback(async () => {
    if (!nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await axiosInstance.get(`/api/shops/${shopId}/products`, {
        params: { cursor: nextCursor, limit: 12, sort: productSort },
      });
      const data = response.data;

      if (data.success) {
        setProducts((prev) => [...prev, ...data.products]);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (err) {
      console.error("Error fetching more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [shopId, nextCursor, loadingMore, productSort]);

  // Initial fetch
  useEffect(() => {
    fetchShopDetails();
  }, [fetchShopDetails]);

  // Check if user is following this shop
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!user || !shopId) return;
      try {
        const response = await axiosInstance.get(`/api/user/following/${shopId}`);
        setIsFollowing(response.data?.isFollowing || false);
      } catch {
        // Silently fail
      }
    };
    checkFollowStatus();
  }, [user, shopId]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && nextCursor) {
          fetchMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, nextCursor, fetchMoreProducts]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading shop...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !shop) {
    return (
      <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Shop not found</h2>
          <p className="text-gray-400 mb-6">{error || "The shop you're looking for doesn't exist"}</p>
          <Link href="/shops" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all inline-flex items-center gap-2 shadow-lg shadow-purple-500/50">
            <ArrowLeft className="w-4 h-4" />
            Back to Shops
          </Link>
        </div>
      </div>
    );
  }

  const shopAvatar = shop.avatar || shop.images?.[0]?.url || "/placeholder-shop.svg";
  const coverBanner = shop.coverBanner || null;

  return (
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden pb-20 md:pb-0">
      {/* Animated Code Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating Code Snippets */}
        <div className="absolute top-10 left-10 text-purple-500/20 font-mono text-xs animate-float">
          <pre>{`const shop = () => {\n  return <VettCode />;\n}`}</pre>
        </div>
        <div className="absolute top-40 right-20 text-blue-500/20 font-mono text-xs animate-float-delayed">
          <pre>{`function verify() {\n  return true;\n}`}</pre>
        </div>
        <div className="absolute bottom-20 left-1/4 text-purple-500/20 font-mono text-xs animate-float">
          <pre>{`import { App } from 'vettcode';`}</pre>
        </div>
        <div className="absolute bottom-40 right-1/3 text-blue-500/20 font-mono text-xs animate-float-delayed">
          <pre>{`export default Shop;`}</pre>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slower" />
      </div>

      {/* Cover Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
        {coverBanner && <Image src={coverBanner} alt="" fill className="object-cover opacity-40" unoptimized />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-[#0a0e27]/60 to-transparent" />
        
        {/* Back Button */}
        <Link href="/shops" className="absolute top-4 left-4 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 p-2 rounded-full shadow-lg transition-colors border border-purple-500/30">
          <ArrowLeft className="w-5 h-5 text-purple-300" />
        </Link>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 bg-slate-800/80 backdrop-blur-sm hover:bg-slate-700 p-2 rounded-full shadow-lg transition-colors border border-purple-500/30"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <Share2 className="w-5 h-5 text-purple-300" />
          )}
        </button>
      </div>

      {/* Shop Info Section */}
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/20 p-6 sm:p-8 border border-purple-500/20">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-slate-700 bg-gradient-to-br from-purple-600 to-blue-600 shadow-xl shadow-purple-500/50 overflow-hidden shrink-0 mx-auto sm:mx-0 -mt-20 sm:-mt-24">
                <Image src={shopAvatar} alt={shop.name} fill className="object-cover" unoptimized />
                {shop.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Shop Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">{shop.name}</h1>
                      {shop.isVerified && (
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-500/30 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-purple-300 font-medium mb-2 flex items-center justify-center sm:justify-start gap-1">
                      <Code2 className="w-4 h-4" />
                      {shop.category}
                    </p>
                    {shop.bio && <p className="text-gray-300 max-w-2xl">{shop.bio}</p>}
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 px-4 py-2 rounded-xl border border-yellow-500/30 mx-auto sm:mx-0 backdrop-blur-sm shadow-lg shadow-yellow-500/20">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-lg font-bold text-white">{shop.ratings?.toFixed(1) || "5.0"}</span>
                    <span className="text-sm text-gray-300">({shop.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Stats & Info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-500/20">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300"><strong className="text-white">{shop.productCount}</strong> Applications</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-500/20">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    <span className="text-gray-300">{shop.address || "Worldwide"}</span>
                  </div>
                  {shop.website && (
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-500/20 hover:bg-slate-600/50 hover:border-blue-500/40 transition-colors text-gray-300 hover:text-blue-300">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {shop.opening_hours && (
                    <div className="flex items-center gap-2 bg-slate-700/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-purple-500/20">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{shop.opening_hours}</span>
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="mt-6 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/50">
                      {shop.seller?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Seller</p>
                      <p className="font-medium text-white">{shop.seller?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleChatWithSeller}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/50"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with Seller
                    </button>
                    <button 
                      onClick={handleFollowShop}
                      disabled={followLoading}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg ${
                        isFollowing 
                          ? "bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 border border-purple-500/20" 
                          : "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 shadow-purple-500/50"
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <><UserMinus className="w-4 h-4" /> Unfollow</>
                      ) : (
                        <><UserPlus className="w-4 h-4" /> Follow</>
                      )}
                    </button>
                    <button 
                      onClick={handleLikeShop}
                      className={`p-2.5 border rounded-xl transition-all ${
                        isLiked ? "bg-red-500/20 border-red-500/30 shadow-lg shadow-red-500/20" : "border-purple-500/20 hover:bg-slate-700/50"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? "text-red-400 fill-red-400" : "text-gray-400"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Products Section */}
        <div className="mb-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Applications ({shop.productCount})
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Category Filter */}
              {productCategories.length > 1 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 sm:flex-none bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Categories</option>
                  {productCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
              {/* Sort */}
              <select
                value={productSort}
                onChange={(e) => setProductSort(e.target.value)}
                className="flex-1 sm:flex-none bg-slate-800/50 backdrop-blur-sm border border-purple-500/30 text-white rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
                <option value="downloads">Most Downloads</option>
              </select>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {products
                  .filter(p => categoryFilter === "all" || p.category === categoryFilter)
                  .map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      isInCart={cartItemIds.has(product.id)}
                      cartQty={cartQuantities[product.id] || 0}
                      isAdding={addingToCart === product.id}
                    />
                  ))}
              </div>

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more applications...</span>
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-gray-500 text-sm">You&apos;ve seen all applications from this shop</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20">
              <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No applications yet</h3>
              <p className="text-gray-400">This shop hasn&apos;t added any applications yet</p>
            </div>
          )}
        </div>

        {/* Other Shops by Same Seller */}
        {otherShops.length > 0 && (
          <div className="mb-12 relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Store className="w-6 h-6 text-purple-400" />
              More Shops by {shop.seller?.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherShops.map((otherShop) => (
                <OtherShopCard key={otherShop.id} shop={otherShop} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {shop.reviews && shop.reviews.length > 0 && (
          <div className="mb-12 relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" />
              Customer Reviews ({shop.reviewCount})
            </h2>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-purple-500/20 divide-y divide-purple-500/20">
              {shop.reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-purple-500/50">
                      {review.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-white">{review.user?.name || "Anonymous"}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review && <p className="text-gray-300">{review.review}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
