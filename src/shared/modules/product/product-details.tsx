"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Heart, 
  Download, 
  MessageCircle, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Play,
  X,
  Shield,
  MapPin,
  Eye,
  Code2,
  ExternalLink,
  FileText,
  CheckCircle,
  Award,
  Star,
  Sparkles,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Package,
  Lock,
  Unlock,
  Bot,
  Crown,
  Flame,
  Verified,
  BadgeCheck,
  GitCompare
} from "lucide-react"
import { useStore } from "@/store"
import useUser from "@/hooks/useUser"
import useDeviceTracking from "@/hooks/useDeviceTracking"
import useLocationTracking from "@/hooks/useLocationTracking"
import { useProductComparison } from "@/hooks/useProductComparison"
import ProductCard from "@/shared/components/cards/Product-card"
import ProductAIChat from "@/shared/components/product/ProductAIChat"
import AuthRequiredModal from "@/shared/components/modals/AuthRequiredModal"
import { toast } from "sonner"

// Type Definitions
interface Screenshot {
  url: string;
  alt?: string;
}

interface Seller {
  id: string;
  name: string;
  address?: string;
  avatar?: string;
  verified?: boolean;
}

interface ApplicationData {
  id: string;
  appName?: string;
  title?: string;
  appCategory?: string;
  category?: string;
  detailedDescription?: string;
  shortDescription?: string;
  description?: string;
  price?: number;
  sale_price?: number;
  currency?: string;
  isFree?: boolean;
  screenshots?: Screenshot[];
  images?: Screenshot[];
  videoDemo?: string;
  video_url?: string;
  videoUrl?: string;
  liveDemo?: string;
  githubRepo?: string;
  documentationUrl?: string;
  technologyStack?: string[];
  supportedPlatforms?: string[];
  licenseType?: string;
  rating?: number;
  ratings?: number;
  downloads?: number;
  totalSales?: number;
  views?: number;
  completionScore?: number;
  adminCompletionScore?: number;
  badges?: string[];
  Seller?: Seller;
  Shop?: Seller;
  shops?: Seller;
  supportLevel?: string;
  updateFrequency?: string;
  slug?: string;
  _id?: string;
  features?: string[];
  requirements?: string[];
  lastUpdated?: string;
  version?: string;
}

interface SimilarProduct {
  id: string;
  title: string;
  slug: string;
  sale_price: number;
  regular_price: number;
  images: { url: string }[];
  ratings: number;
  stock: number;
  category: string;
  shops?: { id: string; name: string };
}

// Helper Functions
const formatPrice = (amount: number, curr: string = 'USD'): string => {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    UGX: 'USh ',
    KES: 'KSh ',
    TZS: 'TSh ',
    RWF: 'RWF '
  };
  const symbol = symbols[curr] || curr + ' ';
  return symbol + amount.toLocaleString();
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  }
  if (url.includes('embed') || url.includes('vimeo') || url.includes('loom')) {
    return url;
  }
  return null;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return 'Recently';
  }
};

// Main Component
const ProductDetails = ({
  productDetails,
  similarProducts = []
}: {
  productDetails: ApplicationData | null;
  similarProducts?: SimilarProduct[];
}) => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  
  // UI States
  const [activeImage, setActiveImage] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'features' | 'requirements'>('overview');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionType, setAuthActionType] = useState<'download' | 'purchase' | 'access'>('access');

  // Store
  const wishlist = useStore((state) => state.wishlist);
  const wishlistIds = useStore((state) => state.wishlistIds);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const syncWithServer = useStore((state) => state.syncWithServer);

  // Compare functionality
  const { addToCompare, isInCompare, compareList, maxItems } = useProductComparison();
  const isInCompareList = productDetails ? isInCompare(productDetails.id) : false;

  const isWishListed = productDetails ? (
    wishlist.some((item) => item.id === productDetails.id) || wishlistIds.includes(productDetails.id)
  ) : false;

  useEffect(() => {
    if (user?.id) {
      syncWithServer(user);
    }
  }, [user?.id, syncWithServer]);

  // Early return for missing product
  if (!productDetails) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center border border-purple-500/30">
            <Package className="w-12 h-12 text-purple-400" />
          </div>
          <h2 className="text-2xl font-semibold text-white">Application Not Found</h2>
          <p className="text-gray-400 mt-2 mb-6">The application you are looking for does not exist or has been removed.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  // Extract and normalize application data
  const appName = productDetails.appName || productDetails.title || "Untitled Application";
  const appCategory = productDetails.appCategory || productDetails.category || "";
  const description = productDetails.detailedDescription || productDetails.shortDescription || productDetails.description || "";
  const price = productDetails.price || productDetails.sale_price || 0;
  const currency = productDetails.currency || "USD";
  const isFree = productDetails.isFree || price === 0;
  const screenshots = productDetails.screenshots || productDetails.images || [];
  const videoDemo = productDetails.videoDemo || productDetails.video_url || productDetails.videoUrl || null;
  const liveDemo = productDetails.liveDemo || null;
  const githubRepo = productDetails.githubRepo || null;
  const documentationUrl = productDetails.documentationUrl || null;
  const techStack = productDetails.technologyStack || [];
  const platforms = productDetails.supportedPlatforms || [];
  const licenseType = productDetails.licenseType || "Commercial License";
  const rating = productDetails.rating || productDetails.ratings || 5.0;
  const downloads = productDetails.downloads || productDetails.totalSales || 0;
  const views = productDetails.views || 0;
  const completionScore = productDetails.completionScore || productDetails.adminCompletionScore || null;
  const badges = productDetails.badges || [];
  const seller = productDetails.Seller || productDetails.Shop || productDetails.shops || null;
  const supportLevel = productDetails.supportLevel || "Email";
  const updateFrequency = productDetails.updateFrequency || "Active";
  const id = productDetails.id || productDetails._id || '';
  const slug = productDetails.slug || id;
  const features = productDetails.features || [];
  const requirements = productDetails.requirements || [];
  const lastUpdated = productDetails.lastUpdated;
  const version = productDetails.version || "1.0.0";

  const videoEmbedUrl = videoDemo ? getYouTubeEmbedUrl(videoDemo) : null;

  // Event Handlers
  const handleWishlist = () => {
    if (isWishListed) {
      removeFromWishlist(id, user, location, deviceInfo);
      toast.info("Removed from wishlist");
    } else {
      addToWishlist({ 
        id, 
        title: appName, 
        price, 
        image: screenshots?.[0]?.url || "", 
        shopId: seller?.id || "" 
      }, user, location, deviceInfo);
      toast.success("Added to wishlist");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${slug}`;
    const shareData = {
      title: `${appName} — ${isFree ? 'FREE' : formatPrice(price, currency)}`,
      text: `Check out ${appName} on VETTCODE!`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    }
  };

  const handleCompare = () => {
    if (isInCompareList) {
      toast.info("Already in compare list");
      return;
    }
    
    if (compareList.length >= maxItems) {
      toast.error(`You can only compare up to ${maxItems} applications`);
      return;
    }

    const success = addToCompare({
      id,
      slug,
      title: appName,
      appName,
      image: screenshots?.[0]?.url || "",
      price,
      salePrice: price,
      isFree,
      category: appCategory,
      appCategory,
      brand: seller?.name || "",
      ratings: 5.0,
      stock: 999,
      shopName: seller?.name || "",
      verificationStatus,
      downloadCount: 0,
      technologyStack,
      platforms,
    });

    if (success) {
      toast.success(`Added to compare (${compareList.length + 1}/${maxItems})`);
    }
  };

  const handleDownloadAccess = () => {
    // Check if user is logged in
    if (!user) {
      setAuthActionType(isFree ? 'download' : 'purchase');
      setShowAuthModal(true);
      return;
    }

    if (isFree) {
      toast.success("Redirecting to download...");
      if (liveDemo) {
        window.open(liveDemo, '_blank');
      } else if (githubRepo) {
        window.open(githubRepo, '_blank');
      }
    } else {
      toast.info("Redirecting to checkout...");
      // Navigate to checkout
    }
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % screenshots.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen pb-20 md:pb-0">
      {/* Breadcrumb */}
      <div className="bg-gray-900/50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-400 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-purple-400 transition">Home</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <Link href="/products" className="hover:text-purple-400 transition">Applications</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {appCategory && (
              <>
                <span className="hover:text-purple-400 transition">{appCategory}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </>
            )}
            <span className="text-white font-medium truncate max-w-[200px]">{appName}</span>
          </nav>
        </div>
      </div>

      {/* Main Application Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left: Screenshots & Video */}
            <div className="p-4 md:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-purple-500/20">
              {/* Main Screenshot */}
              <div className="relative aspect-video bg-gray-800/50 rounded-xl overflow-hidden group border border-purple-500/20">
                {!showVideoModal && screenshots.length > 0 ? (
                  <Image
                    src={screenshots[activeImage]?.url}
                    alt={appName}
                    fill
                    className="object-cover"
                  />
                ) : showVideoModal && videoEmbedUrl ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={videoEmbedUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Application Demo Video"
                    />
                    <button
                      onClick={() => setShowVideoModal(false)}
                      className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-lg transition z-10"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <Code2 className="w-20 h-20" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {!showVideoModal && screenshots.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}

                {/* Free Badge */}
                {isFree && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    FREE
                  </div>
                )}

                {/* Rating Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-white font-bold text-sm">{rating.toFixed(1)}</span>
                  <span className="text-gray-300 text-xs">by VettCode Admin</span>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {screenshots.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => { setActiveImage(index); setShowVideoModal(false); }}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === index && !showVideoModal
                        ? 'border-purple-500 ring-2 ring-purple-400/50'
                        : 'border-gray-700 hover:border-purple-500/50'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Screenshot ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
                {/* Video Thumbnail */}
                {videoDemo && videoEmbedUrl && (
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition bg-gray-900 ${
                      showVideoModal ? 'border-purple-500 ring-2 ring-purple-400/50' : 'border-gray-700 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                  </button>
                )}
              </div>

              {/* Stats Cards */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Downloads</span>
                  </div>
                  <p className="text-lg font-bold text-white">{downloads.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Views</span>
                  </div>
                  <p className="text-lg font-bold text-white">{views.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Right: Application Info */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Developer Info */}
              {seller && (
                <div className="flex items-center gap-3 pb-4 border-b border-purple-500/20 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {seller.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${seller.id}`} className="font-semibold text-white hover:text-purple-400 truncate block transition">
                      {seller.name}
                    </Link>
                    {seller.address && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{seller.address}</span>
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/inbox?shopId=${seller.id}&shopName=${encodeURIComponent(seller.name || '')}&productId=${id}&productTitle=${encodeURIComponent(appName)}&productImage=${encodeURIComponent(screenshots?.[0]?.url || '')}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Contact</span>
                  </Link>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                {appName}
              </h1>

              {/* Category Badge */}
              {appCategory && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    <Code2 className="w-3.5 h-3.5" />
                    {appCategory}
                  </span>
                </div>
              )}

              {/* Completion Score */}
              {completionScore && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/40 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold text-green-300">
                    {completionScore}% Complete Profile
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="mt-4">
                <p className="text-sm leading-relaxed text-gray-300 line-clamp-3">
                  {description || "No description available"}
                </p>
              </div>

              {/* Version & Last Updated */}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>v{version}</span>
                </div>
                {lastUpdated && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Updated {formatDate(lastUpdated)}</span>
                  </div>
                )}
              </div>

              {/* Tech Stack */}
              {techStack.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-white">Tech Stack</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/30 text-blue-200 border border-blue-400/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms */}
              {platforms.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-xl border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-bold text-white">Platforms</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/30 text-purple-200 border border-purple-400/50"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* License */}
              <div className="mt-4 flex items-center justify-between p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2">
                  {isFree ? (
                    <Unlock className="w-4 h-4 text-green-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-purple-400" />
                  )}
                  <span className="text-sm text-gray-400">License:</span>
                </div>
                <span className="text-sm font-semibold text-white">{licenseType}</span>
              </div>

              {/* Price */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
                <div className="flex items-baseline gap-3">
                  {isFree ? (
                    <span className="text-3xl font-bold text-green-400">FREE</span>
                  ) : (
                    <span className="text-3xl font-bold text-white">{formatPrice(price, currency)}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleDownloadAccess}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold transition shadow-lg"
                >
                  {isFree ? (
                    <>
                      <Download className="w-5 h-5" />
                      Free Access
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Get Application
                    </>
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleWishlist}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition border-2 ${
                      isWishListed
                        ? 'bg-red-500/20 border-red-500/40 text-red-400'
                        : 'border-purple-500/40 text-gray-300 hover:bg-purple-500/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishListed ? 'fill-red-500' : ''}`} />
                    {isWishListed ? 'Saved' : 'Save'}
                  </button>

                  <button
                    onClick={handleCompare}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition border-2 ${
                      isInCompareList
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                        : 'border-purple-500/40 text-gray-300 hover:bg-purple-500/10'
                    }`}
                  >
                    <GitCompare className="w-5 h-5" />
                    {isInCompareList ? 'Added' : 'Compare'}
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition border-2 border-purple-500/40 text-gray-300 hover:bg-purple-500/10 relative"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                    {copied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>

                {/* Ask AI Button */}
                <button
                  onClick={() => setShowAIChat(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition border-2 border-purple-500/40 bg-gradient-to-r from-purple-900/30 to-blue-900/30 text-purple-300 hover:from-purple-900/50 hover:to-blue-900/50"
                >
                  <Bot className="w-5 h-5" />
                  Ask AI About This App
                </button>
              </div>

              {/* Quick Links */}
              {(liveDemo || githubRepo || documentationUrl) && (
                <div className="mt-4 p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="w-4 h-4 text-gray-300" />
                    <span className="text-sm font-bold text-white">Quick Links</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {liveDemo && (
                      <a
                        href={liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold bg-gradient-to-br from-emerald-600/20 to-teal-600/20 text-emerald-300 hover:from-emerald-600/30 hover:to-teal-600/30 rounded-lg transition border border-emerald-500/40"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    )}
                    {githubRepo && (
                      <a
                        href={githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold bg-gradient-to-br from-gray-700/40 to-gray-800/40 text-gray-200 hover:from-gray-700/60 hover:to-gray-800/60 rounded-lg transition border border-gray-600"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </a>
                    )}
                    {documentationUrl && (
                      <a
                        href={documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-300 hover:from-blue-600/30 hover:to-indigo-600/30 rounded-lg transition border border-blue-500/40"
                      >
                        <FileText className="w-4 h-4" />
                        Docs
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Support Info */}
              <div className="mt-4 p-4 bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl border border-amber-500/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-amber-400/70 mb-1">Support Level</span>
                    <span className="text-sm font-bold text-amber-200">{supportLevel}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-amber-400/70 mb-1">Update Status</span>
                    <span className="text-sm font-bold text-amber-200">{updateFrequency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-purple-500/30">
          {/* Tab Navigation */}
          <div className="flex border-b border-purple-500/20 bg-gray-900/50">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'text-white bg-purple-600/20 border-b-2 border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Overview
              </div>
            </button>
            {badges.length > 0 && (
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === 'badges'
                    ? 'text-white bg-purple-600/20 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-4 h-4" />
                  Badges
                </div>
              </button>
            )}
            {features.length > 0 && (
              <button
                onClick={() => setActiveTab('features')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === 'features'
                    ? 'text-white bg-purple-600/20 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Features
                </div>
              </button>
            )}
            {requirements.length > 0 && (
              <button
                onClick={() => setActiveTab('requirements')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                  activeTab === 'requirements'
                    ? 'text-white bg-purple-600/20 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Requirements
                </div>
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    About This Application
                  </h3>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {description || "No detailed description available for this application."}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
                    <div className="flex items-center gap-2 text-purple-300 mb-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{rating.toFixed(1)}</p>
                    <p className="text-xs text-gray-400 mt-1">out of 5.0</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 rounded-xl border border-emerald-500/30">
                    <div className="flex items-center gap-2 text-emerald-300 mb-2">
                      <Download className="w-4 h-4" />
                      <span className="text-xs font-semibold">Downloads</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{downloads.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">total installs</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-500/30">
                    <div className="flex items-center gap-2 text-blue-300 mb-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-semibold">Views</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{views.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">page views</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-500/30">
                    <div className="flex items-center gap-2 text-amber-300 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-semibold">Support</span>
                    </div>
                    <p className="text-lg font-bold text-white">{supportLevel}</p>
                    <p className="text-xs text-gray-400 mt-1">{updateFrequency}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'badges' && badges.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Application Badges & Achievements
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  This application has earned the following badges for quality, performance, and excellence.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {badges.map((badge: string, index: number) => {
                    // Determine icon and color based on badge name
                    let BadgeIcon = Award;
                    let colorClass = "from-yellow-900/30 to-amber-900/30";
                    let borderClass = "border-yellow-500/30";
                    let iconColor = "text-yellow-400";
                    let textColor = "text-yellow-200";

                    const badgeLower = badge.toLowerCase();
                    if (badgeLower.includes('verified') || badgeLower.includes('certified')) {
                      BadgeIcon = BadgeCheck;
                      colorClass = "from-blue-900/30 to-indigo-900/30";
                      borderClass = "border-blue-500/30";
                      iconColor = "text-blue-400";
                      textColor = "text-blue-200";
                    } else if (badgeLower.includes('premium') || badgeLower.includes('pro')) {
                      BadgeIcon = Crown;
                      colorClass = "from-purple-900/30 to-violet-900/30";
                      borderClass = "border-purple-500/30";
                      iconColor = "text-purple-400";
                      textColor = "text-purple-200";
                    } else if (badgeLower.includes('trending') || badgeLower.includes('popular') || badgeLower.includes('hot')) {
                      BadgeIcon = Flame;
                      colorClass = "from-orange-900/30 to-red-900/30";
                      borderClass = "border-orange-500/30";
                      iconColor = "text-orange-400";
                      textColor = "text-orange-200";
                    } else if (badgeLower.includes('featured') || badgeLower.includes('editor')) {
                      BadgeIcon = Sparkles;
                      colorClass = "from-pink-900/30 to-rose-900/30";
                      borderClass = "border-pink-500/30";
                      iconColor = "text-pink-400";
                      textColor = "text-pink-200";
                    } else if (badgeLower.includes('best') || badgeLower.includes('top')) {
                      BadgeIcon = Star;
                      colorClass = "from-amber-900/30 to-yellow-900/30";
                      borderClass = "border-amber-500/30";
                      iconColor = "text-amber-400";
                      textColor = "text-amber-200";
                    }

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-4 p-5 bg-gradient-to-br ${colorClass} rounded-xl border ${borderClass} hover:scale-105 transition-transform duration-200`}
                      >
                        <div className={`w-12 h-12 rounded-full bg-gray-900/50 flex items-center justify-center ${iconColor} flex-shrink-0`}>
                          <BadgeIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${textColor} text-base`}>{badge}</p>
                          <p className="text-gray-400 text-xs mt-1">Awarded by VettCode</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'features' && features.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Key Features
                </h3>
                <div className="grid gap-3">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-200 leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requirements' && requirements.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  System Requirements
                </h3>
                <div className="grid gap-3">
                  {requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-lg border border-blue-500/20"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-300">{index + 1}</span>
                      </div>
                      <p className="text-gray-200 leading-relaxed">{requirement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Applications */}
        {similarProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Similar Applications
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarProducts.slice(0, 10).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Modal */}
      <ProductAIChat
        productInfo={{
          ...productDetails,
          title: appName,
          sale_price: price,
          regular_price: price,
          stock: 999, // Applications are always "in stock"
        }}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        actionType={authActionType}
        appName={appName}
      />
    </div>
  );
};

export default ProductDetails;

