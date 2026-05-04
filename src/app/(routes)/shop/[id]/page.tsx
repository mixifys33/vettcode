"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Store, MapPin, Star, Globe, Clock, Package, ChevronRight, 
  Loader2, ArrowLeft, Share2, Heart, MessageCircle, CheckCircle, 
  ExternalLink, ShoppingBag, ShoppingCart, Eye, UserPlus, UserMinus,
  Copy, Check, Filter
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

// Product Card Component - Enhanced with cart functionality
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

  return (
    <div className="bg-white rounded-2xl border hover:border-blue-200 hover:shadow-xl transition-all overflow-hidden group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-100">
          <Image src={productImage} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
              -{discount}%
            </div>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
              Low Stock
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-3 right-3 bg-gray-800 text-white px-2 py-1 rounded-lg text-xs font-medium">
              Out of Stock
            </div>
          )}
          {isInCart && (
            <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> {cartQty}
            </div>
          )}
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" /> Quick View
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 mb-2">
            {product.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium">{product.ratings?.toFixed(1) || "5.0"}</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-blue-600">
            UGX {product.sale_price.toLocaleString()}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              UGX {product.regular_price.toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(product); }}
          disabled={product.stock === 0 || isAdding}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition ${
            isInCart
              ? "bg-green-50 text-green-600 border border-green-200"
              : product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
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
      <div className="bg-white rounded-xl border hover:border-blue-200 hover:shadow-lg transition-all p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 shrink-0">
          <Image src={shopAvatar} alt={shop.name} fill className="object-cover" unoptimized />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600">{shop.name}</h4>
          <p className="text-sm text-gray-500">{shop.category}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {shop.ratings?.toFixed(1) || "5.0"}
            </span>
            <span>{shop.productCount} products</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading shop...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shop not found</h2>
          <p className="text-gray-500 mb-6">{error || "The shop you're looking for doesn't exist"}</p>
          <Link href="/shops" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2">
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Cover Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        {coverBanner && <Image src={coverBanner} alt="" fill className="object-cover" unoptimized />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <Link href="/shops" className="absolute top-4 left-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>

        {/* Share Button */}
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Share2 className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Shop Info Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative -mt-16 sm:-mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-white shadow-xl overflow-hidden shrink-0 mx-auto sm:mx-0 -mt-20 sm:-mt-24">
                <Image src={shopAvatar} alt={shop.name} fill className="object-cover" unoptimized />
                {shop.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Shop Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{shop.name}</h1>
                      {shop.isVerified && (
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">Verified</span>
                      )}
                    </div>
                    <p className="text-blue-600 font-medium mb-2">{shop.category}</p>
                    {shop.bio && <p className="text-gray-600 max-w-2xl">{shop.bio}</p>}
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200 mx-auto sm:mx-0">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-bold">{shop.ratings?.toFixed(1) || "5.0"}</span>
                    <span className="text-sm text-gray-500">({shop.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Stats & Info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span><strong>{shop.productCount}</strong> Products</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                    <MapPin className="w-4 h-4 text-pink-500" />
                    <span>{shop.address || "Uganda"}</span>
                  </div>
                  {shop.website && (
                    <a href={shop.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {shop.opening_hours && (
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span>{shop.opening_hours}</span>
                    </div>
                  )}
                </div>

                {/* Seller Info */}
                <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {shop.seller?.name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seller</p>
                      <p className="font-medium text-gray-900">{shop.seller?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleChatWithSeller}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with Seller
                    </button>
                    <button 
                      onClick={handleFollowShop}
                      disabled={followLoading}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                        isFollowing 
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                          : "bg-purple-600 text-white hover:bg-purple-700"
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
                      className={`p-2.5 border rounded-xl transition-colors ${
                        isLiked ? "bg-red-50 border-red-200" : "hover:bg-gray-50"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Products Section */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
              Products ({shop.productCount})
            </h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Category Filter */}
              {productCategories.length > 1 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex-1 sm:flex-none bg-white border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="flex-1 sm:flex-none bg-white border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
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
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more products...</span>
                  </div>
                )}
                {!hasMore && products.length > 0 && (
                  <p className="text-gray-400 text-sm">You&apos;ve seen all products from this shop</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500">This shop hasn&apos;t added any products yet</p>
            </div>
          )}
        </div>

        {/* Other Shops by Same Seller */}
        {otherShops.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Store className="w-6 h-6 text-purple-600" />
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
          <div className="mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Customer Reviews ({shop.reviewCount})
            </h2>
            <div className="bg-white rounded-2xl border divide-y">
              {shop.reviews.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {review.user?.name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.user?.name || "Anonymous"}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.review && <p className="text-gray-600">{review.review}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
