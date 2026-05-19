"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import {
  Tag,
  Clock,
  ShoppingCart,
  Heart,
  ArrowLeft,
  Package,
  Percent,
  Gift,
  Zap,
  Share2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  Truck,
  Shield,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatMoney } from "@/utils/currency";

interface OfferProduct {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  regular_price: number;
  image: string | null;
  category: string;
  discountedPrice: number;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  slug: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  timeRemaining: string;
  isFlashDeal: boolean;
  isLimitedStock: boolean;
  requiresCode: boolean;
  offerCode?: string;
  shopId: string;
  products: OfferProduct[];
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addToCart = useStore((state: any) => state.addToCart);
  const offerId = params.id as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (offerId) {
      fetchOffer();
      trackView();
    }
  }, [offerId]);

  // Countdown timer
  useEffect(() => {
    if (!offer?.endDate) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(offer.endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [offer?.endDate]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/offers/${offerId}`);
      const data = await res.json();

      if (data.success && data.offer) {
        setOffer(data.offer);
      } else {
        setError("Offer not found");
      }
    } catch (err) {
      console.error("Failed to fetch offer:", err);
      setError("Failed to load offer");
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`/api/offers/${offerId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "view" }),
      });
    } catch {
      // Silent fail for tracking
    }
  };

  const handleAddToCart = (product: OfferProduct) => {
    const sellerId = offer?.shopId || "";
    addToCart(
      {
        id: product.id,
        title: product.title,
        name: product.title,
        price: product.discountedPrice,
        sale_price: product.discountedPrice,
        original_price: product.sale_price,
        image: product.image || "",
        images: product.image ? [product.image] : [],
        quantity: 1,
        shopId: sellerId,
        sellerId,
        appCategory: product.category,
        discount: offer?.discountValue,
        offerId: offer?.id,
        offerEndDate: offer?.endDate,
      },
      user
    );
    toast.success("Added to cart!");
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const copyOfferCode = () => {
    if (offer?.offerCode) {
      navigator.clipboard.writeText(offer.offerCode);
      setCopiedCode(true);
      toast.success("Code copied!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const shareOffer = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: offer?.title,
          text: `Check out this amazing offer: ${offer?.title}`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const getDiscountDisplay = () => {
    if (!offer) return "";
    if (offer.discountType === "Percentage") return `${offer.discountValue}% OFF`;
    if (offer.discountType === "FixedAmount")
      return `${formatMoney(offer.discountValue)} OFF`;
    if (offer.discountType === "BuyOneGetOne") return "Buy 1 Get 1 Free";
    if (offer.discountType === "BuyXGetY") return "Buy More Save More";
    return offer.discountType;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading offer...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Offer Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "This offer may have expired or been removed."}</p>
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse All Offers
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(offer.endDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/offers" className="hover:text-red-600">Offers</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate max-w-[200px]">{offer.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className={`${offer.isFlashDeal ? "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500" : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"} text-white`}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                {offer.isFlashDeal ? (
                  <Zap className="w-8 h-8 text-yellow-300" />
                ) : (
                  <Tag className="w-8 h-8" />
                )}
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {offer.isFlashDeal ? "Flash Deal" : "Special Offer"}
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-3">{offer.title}</h1>
              {offer.description && (
                <p className="text-white/90 text-sm md:text-base max-w-2xl">{offer.description}</p>
              )}

              {/* Discount Badge */}
              <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Percent className="w-6 h-6" />
                <span className="text-2xl md:text-3xl font-bold">{getDiscountDisplay()}</span>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <p className="text-sm text-white/80 mb-3 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                {isExpired ? "Offer Ended" : "Ends In"}
              </p>
              {!isExpired ? (
                <div className="flex gap-3">
                  {[
                    { value: countdown.days, label: "Days" },
                    { value: countdown.hours, label: "Hours" },
                    { value: countdown.minutes, label: "Mins" },
                    { value: countdown.seconds, label: "Secs" },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-lg flex items-center justify-center mb-1">
                        <span className="text-xl md:text-2xl font-bold">{String(item.value).padStart(2, "0")}</span>
                      </div>
                      <span className="text-xs text-white/70">{item.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xl font-bold text-red-200">This offer has expired</p>
              )}
            </div>
          </div>

          {/* Offer Code */}
          {offer.requiresCode && offer.offerCode && (
            <div className="mt-6 flex items-center gap-4 flex-wrap">
              <span className="text-white/80">Use code:</span>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg">
                <code className="text-lg font-mono font-bold">{offer.offerCode}</code>
                <button
                  onClick={copyOfferCode}
                  className="p-1.5 hover:bg-white/20 rounded transition"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Share Button */}
          <button
            onClick={shareOffer}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
          >
            <Share2 className="w-4 h-4" />
            Share Offer
          </button>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Verified Offer</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-600" />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Products in this Offer ({offer.products.length})
          </h2>
        </div>

        {offer.products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {offer.products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Discount Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-lg shadow">
                    {getDiscountDisplay()}
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`absolute bottom-2 right-2 p-2 rounded-full shadow-lg transition ${
                      wishlist.includes(product.id)
                        ? "bg-red-500 text-white"
                        : "bg-white text-gray-600 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-red-600 transition mb-2 min-h-[40px]">
                      {product.title}
                    </h3>
                  </Link>

                  {product.category && (
                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                  )}

                  {/* Price */}
                  <div className="flex flex-col gap-1 mb-3">
                    <span className="text-lg font-bold text-red-600">
                      {formatMoney(product.discountedPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatMoney(product.sale_price)}
                    </span>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isExpired}
                    className="w-full py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isExpired ? "Offer Expired" : "Add to Cart"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Products Available</h3>
            <p className="text-gray-500">Products for this offer are not available yet.</p>
          </div>
        )}
      </div>

      {/* More Offers CTA */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
        <div className="container mx-auto px-4 text-center">
          <Gift className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Want More Deals?</h2>
          <p className="text-gray-400 mb-6">Discover more amazing offers and save big!</p>
          <Link
            href="/offers"
            className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Browse All Offers
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
