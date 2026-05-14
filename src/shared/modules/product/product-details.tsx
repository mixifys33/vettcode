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
  GitCompare,
  ChevronDown,
  ChevronUp
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
  sourceCodeFile?: {
    url?: string;
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    uploaded?: boolean;
    originalFileCount?: number;
  };
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
  verificationStatus?: string;
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

// Strip HTML tags and format text for clean display
const stripHtmlAndFormat = (text: string): string => {
  if (!text) return '';
  
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');
  
  // Decode common HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  return cleaned;
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
  const [activeTab, setActiveTab] = useState<'badges' | 'features' | 'requirements'>('badges');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authActionType, setAuthActionType] = useState<'download' | 'purchase' | 'access'>('access');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isShortDescExpanded, setIsShortDescExpanded] = useState(false);

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

  // Set default tab based on available content
  useEffect(() => {
    if (productDetails) {
      const badges = productDetails.badges || [];
      const features = productDetails.features || [];
      const requirements = productDetails.requirements || [];
      
      if (badges.length > 0) {
        setActiveTab('badges');
      } else if (features.length > 0) {
        setActiveTab('features');
      } else if (requirements.length > 0) {
        setActiveTab('requirements');
      }
    }
  }, [productDetails]);

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
  const rawDescription = productDetails.detailedDescription || productDetails.shortDescription || productDetails.description || "";
  const description = stripHtmlAndFormat(rawDescription);
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

  // Description truncation logic
  const DESCRIPTION_CHAR_LIMIT = 500; // Show first 500 characters
  const shouldTruncateDescription = description.length > DESCRIPTION_CHAR_LIMIT;
  const displayedDescription = shouldTruncateDescription && !isDescriptionExpanded
    ? description.slice(0, DESCRIPTION_CHAR_LIMIT) + '...'
    : description;

  // Short description truncation logic (for top section)
  const SHORT_DESC_CHAR_LIMIT = 200; // Show first 200 characters in top section
  const shouldTruncateShortDesc = description.length > SHORT_DESC_CHAR_LIMIT;
  const displayedShortDesc = shouldTruncateShortDesc && !isShortDescExpanded
    ? description.slice(0, SHORT_DESC_CHAR_LIMIT) + '...'
    : description;
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
    const url = `${window.location.origin}/product/${id}`;
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
      // If already in compare, offer to view comparison
      toast.info(
        <div className="flex items-center justify-between gap-3">
          <span>Already in compare list</span>
          <Link
            href="/compare"
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            View
          </Link>
        </div>,
        { duration: 4000 }
      );
      return;
    }
    
    if (compareList.length >= maxItems) {
      toast.error(
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Compare list is full</span>
          <span className="text-sm text-gray-300">Remove an item to add this application</span>
          <Link
            href="/compare"
            className="mt-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
          >
            Manage Compare List
          </Link>
        </div>,
        { duration: 5000 }
      );
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
      ratings: rating,
      stock: 999,
      shopName: seller?.name || "",
      verificationStatus: productDetails.verificationStatus || "unverified",
      downloadCount: downloads,
      technologyStack: techStack,
      platforms: platforms,
    });

    if (success) {
      const remaining = maxItems - (compareList.length + 1);
      toast.success(
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-semibold">Added to compare!</span>
            <span className="text-sm text-gray-300">
              {remaining > 0 
                ? `${remaining} more slot${remaining !== 1 ? 's' : ''} available` 
                : 'Compare list is full'}
            </span>
          </div>
          <Link
            href="/compare"
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            Compare Now
          </Link>
        </div>,
        { duration: 5000 }
      );
    }
  };

  const handleDownloadAccess = async () => {
    // Check if user is logged in
    if (!user) {
      setAuthActionType(isFree ? 'download' : 'purchase');
      setShowAuthModal(true);
      return;
    }

    if (isFree) {
      // Priority: sourceCodeFile.url > githubRepo > liveDemo
      const downloadUrl = productDetails.sourceCodeFile?.url || githubRepo || liveDemo;
      
      if (downloadUrl) {
        // Track download in backend
        try {
          const apiUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
          const trackingUrl = `${apiUrl}/api/applications/${id}/download`;
          
          console.log('🔍 Tracking download:', {
            apiUrl,
            trackingUrl,
            applicationId: id
          });
          
          const response = await fetch(trackingUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          const data = await response.json();
          console.log('✅ Download tracked:', data);
          
          if (data.success) {
            console.log(`📊 New download count: ${data.downloads}`);
          }
        } catch (error) {
          console.error('❌ Failed to track download:', error);
          // Don't block download if tracking fails
        }
        
        toast.success("Starting download...");
        window.open(downloadUrl, '_blank');
      } else {
        toast.error("Download link not available. Please contact the seller.");
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
    <div className="w-full bg-[#0A0E1A] min-h-screen pb-20 md:pb-0">
      {/* Breadcrumb - Minimal & Clean */}
      <div className="bg-[#0F1419] border-b border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 py-2.5">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-slate-300 transition">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-slate-300 transition">Applications</Link>
            <ChevronRight className="w-3 h-3" />
            {appCategory && (
              <>
                <span className="hover:text-slate-300 transition">{appCategory}</span>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-slate-300 font-medium truncate max-w-[200px]">{appName}</span>
          </nav>
        </div>
      </div>

      {/* Main Application Section - Enterprise Grid Layout */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Top Header Bar - Compact & Professional */}
        <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            {/* Left: Title & Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{appName}</h1>
                {isFree && (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded border border-emerald-500/30">
                    FREE
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                {appCategory && (
                  <span className="flex items-center gap-1">
                    <Code2 className="w-3 h-3" />
                    {appCategory}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  v{version}
                </span>
                {lastUpdated && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated {formatDate(lastUpdated)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Right: Price & Primary Action */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                {isFree ? (
                  <div className="text-2xl font-bold text-emerald-400">FREE</div>
                ) : (
                  <div className="text-2xl font-bold text-white">{formatPrice(price, currency)}</div>
                )}
                <div className="text-xs text-slate-500">{licenseType}</div>
              </div>
              
              <button
                onClick={handleDownloadAccess}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition flex items-center gap-2 whitespace-nowrap shadow-sm"
              >
                {isFree ? (
                  <>
                    <Download className="w-4 h-4" />
                    Download Free
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Purchase
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Main Content Grid - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Left Column - Media & Stats (2/3 width) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Screenshot Gallery - Compact */}
            <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg overflow-hidden">
              <div className="relative aspect-video bg-black">
                {!showVideoModal && screenshots.length > 0 ? (
                  <Image
                    src={screenshots[activeImage]?.url}
                    alt={appName}
                    fill
                    className="object-contain"
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
                      className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-black rounded transition z-10"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <Code2 className="w-16 h-16" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {!showVideoModal && screenshots.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded transition"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 hover:bg-black/80 rounded transition"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails - Horizontal Strip */}
              <div className="flex gap-1 p-2 bg-[#0A0E1A] overflow-x-auto">
                {screenshots.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => { setActiveImage(index); setShowVideoModal(false); }}
                    className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border transition ${
                      activeImage === index && !showVideoModal
                        ? 'border-indigo-500 ring-1 ring-indigo-500'
                        : 'border-slate-700 hover:border-slate-600'
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
                {videoDemo && videoEmbedUrl && (
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded overflow-hidden border transition bg-slate-900 ${
                      showVideoModal ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Stats Bar - Horizontal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Download className="w-3 h-3" />
                  <span>Downloads</span>
                </div>
                <div className="text-lg font-bold text-white">{downloads.toLocaleString()}</div>
              </div>
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Eye className="w-3 h-3" />
                  <span>Views</span>
                </div>
                <div className="text-lg font-bold text-white">{views.toLocaleString()}</div>
              </div>
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Star className="w-3 h-3" />
                  <span>Rating</span>
                </div>
                <div className="text-lg font-bold text-white">{rating.toFixed(1)}/5</div>
              </div>
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                  <Users className="w-3 h-3" />
                  <span>Support</span>
                </div>
                <div className="text-sm font-bold text-white">{supportLevel}</div>
              </div>
            </div>

            {/* Description - Clean & Readable with Better Formatting */}
            <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Description</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-sm text-slate-300 leading-relaxed space-y-3">
                  {displayedDescription.split('\n\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    )
                  ))}
                  {!displayedDescription && (
                    <p className="text-slate-500 italic">No description available</p>
                  )}
                </div>
              </div>
              {shouldTruncateDescription && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 text-xs font-medium transition flex items-center gap-1"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Read More
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Tech Stack & Platforms - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {techStack.length > 0 && (
                <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {techStack.map((tech: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium rounded bg-slate-800/50 text-slate-300 border border-slate-700/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {platforms.length > 0 && (
                <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Platforms</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {platforms.map((platform: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs font-medium rounded bg-slate-800/50 text-slate-300 border border-slate-700/50"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Actions & Info (1/3 width) */}
          <div className="space-y-4">
            
            {/* Seller Card - Compact */}
            {seller && (
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {seller.name?.charAt(0) || 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${seller.id}`} className="text-sm font-semibold text-white hover:text-indigo-400 truncate block transition">
                      {seller.name}
                    </Link>
                    {seller.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {seller.address}
                      </p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/inbox?shopId=${seller.id}&shopName=${encodeURIComponent(seller.name || '')}&productId=${id}&productTitle=${encodeURIComponent(appName)}&productImage=${encodeURIComponent(screenshots?.[0]?.url || '')}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Seller
                </Link>
              </div>
            )}

            {/* Quick Actions - Stacked */}
            <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4 space-y-2">
              <button
                onClick={handleWishlist}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition ${
                  isWishListed
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishListed ? 'fill-red-500' : ''}`} />
                {isWishListed ? 'Saved' : 'Save to Wishlist'}
              </button>

              <button
                onClick={handleCompare}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition ${
                  isInCompareList
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <GitCompare className="w-4 h-4" />
                {isInCompareList ? 'In Compare' : 'Compare'}
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition bg-slate-800 hover:bg-slate-700 text-slate-300 relative"
              >
                <Share2 className="w-4 h-4" />
                Share
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowAIChat(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-sm font-medium transition bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <Bot className="w-4 h-4" />
                Ask AI
              </button>
            </div>

            {/* Quick Links - Compact */}
            {(liveDemo || githubRepo || documentationUrl) && (
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Links</h3>
                <div className="space-y-2">
                  {liveDemo && (
                    <a
                      href={liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Live Demo
                    </a>
                  )}
                  {githubRepo && (
                    <a
                      href={githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
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
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
                    >
                      <FileText className="w-3 h-3" />
                      Documentation
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Application Badges - Compact Display */}
            {badges.length > 0 && (
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Badges</h3>
                <div className="space-y-2">
                  {badges.slice(0, 5).map((badge: string, index: number) => {
                    let BadgeIcon = Award;
                    let colorClass = "bg-amber-500/10 border-amber-500/30";
                    let iconColor = "text-amber-400";
                    let textColor = "text-amber-300";

                    const badgeLower = badge.toLowerCase();
                    if (badgeLower.includes('verified') || badgeLower.includes('certified')) {
                      BadgeIcon = BadgeCheck;
                      colorClass = "bg-blue-500/10 border-blue-500/30";
                      iconColor = "text-blue-400";
                      textColor = "text-blue-300";
                    } else if (badgeLower.includes('premium') || badgeLower.includes('pro')) {
                      BadgeIcon = Crown;
                      colorClass = "bg-purple-500/10 border-purple-500/30";
                      iconColor = "text-purple-400";
                      textColor = "text-purple-300";
                    } else if (badgeLower.includes('trending') || badgeLower.includes('popular') || badgeLower.includes('hot')) {
                      BadgeIcon = Flame;
                      colorClass = "bg-orange-500/10 border-orange-500/30";
                      iconColor = "text-orange-400";
                      textColor = "text-orange-300";
                    } else if (badgeLower.includes('featured') || badgeLower.includes('editor')) {
                      BadgeIcon = Sparkles;
                      colorClass = "bg-pink-500/10 border-pink-500/30";
                      iconColor = "text-pink-400";
                      textColor = "text-pink-300";
                    } else if (badgeLower.includes('best') || badgeLower.includes('top')) {
                      BadgeIcon = Star;
                      colorClass = "bg-amber-500/10 border-amber-500/30";
                      iconColor = "text-amber-400";
                      textColor = "text-amber-300";
                    }

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-2 px-3 py-2 ${colorClass} rounded border`}
                      >
                        <BadgeIcon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
                        <span className={`text-xs font-medium ${textColor} truncate`}>{badge}</span>
                      </div>
                    );
                  })}
                  {badges.length > 5 && (
                    <p className="text-xs text-slate-500 text-center pt-1">
                      +{badges.length - 5} more badge{badges.length - 5 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Completion Score */}
            {completionScore && (
              <div className="bg-[#0F1419] border border-slate-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Profile Complete</span>
                </div>
                <div className="text-2xl font-bold text-white">{completionScore}%</div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Information Tabs - Minimal Design */}
        <div className="mt-6 bg-[#0F1419] border border-slate-800/50 rounded-lg overflow-hidden">
          {/* Tab Navigation - Minimal, Underline Style */}
          <div className="flex border-b border-slate-800/50 bg-[#0A0E1A]">
            {badges.length > 0 && (
              <button
                onClick={() => setActiveTab('badges')}
                className={`flex-1 px-6 py-3 text-xs font-semibold transition ${
                  activeTab === 'badges'
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  Badges
                </div>
              </button>
            )}
            {features.length > 0 && (
              <button
                onClick={() => setActiveTab('features')}
                className={`flex-1 px-6 py-3 text-xs font-semibold transition ${
                  activeTab === 'features'
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  Features
                </div>
              </button>
            )}
            {requirements.length > 0 && (
              <button
                onClick={() => setActiveTab('requirements')}
                className={`flex-1 px-6 py-3 text-xs font-semibold transition ${
                  activeTab === 'requirements'
                    ? 'text-white border-b-2 border-indigo-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Requirements
                </div>
              </button>
            )}
          </div>

          {/* Tab Content - Clean Typography */}
          <div className="p-6">
            {activeTab === 'badges' && badges.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Application Badges & Achievements</h3>
                <p className="text-xs text-slate-400 mb-4">
                  This application has earned the following badges for quality, performance, and excellence.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {badges.map((badge: string, index: number) => {
                    let BadgeIcon = Award;
                    let colorClass = "bg-amber-500/5 border-amber-500/20";
                    let iconColor = "text-amber-400";
                    let textColor = "text-amber-200";

                    const badgeLower = badge.toLowerCase();
                    if (badgeLower.includes('verified') || badgeLower.includes('certified')) {
                      BadgeIcon = BadgeCheck;
                      colorClass = "bg-blue-500/5 border-blue-500/20";
                      iconColor = "text-blue-400";
                      textColor = "text-blue-200";
                    } else if (badgeLower.includes('premium') || badgeLower.includes('pro')) {
                      BadgeIcon = Crown;
                      colorClass = "bg-purple-500/5 border-purple-500/20";
                      iconColor = "text-purple-400";
                      textColor = "text-purple-200";
                    } else if (badgeLower.includes('trending') || badgeLower.includes('popular') || badgeLower.includes('hot')) {
                      BadgeIcon = Flame;
                      colorClass = "bg-orange-500/5 border-orange-500/20";
                      iconColor = "text-orange-400";
                      textColor = "text-orange-200";
                    } else if (badgeLower.includes('featured') || badgeLower.includes('editor')) {
                      BadgeIcon = Sparkles;
                      colorClass = "bg-pink-500/5 border-pink-500/20";
                      iconColor = "text-pink-400";
                      textColor = "text-pink-200";
                    } else if (badgeLower.includes('best') || badgeLower.includes('top')) {
                      BadgeIcon = Star;
                      colorClass = "bg-amber-500/5 border-amber-500/20";
                      iconColor = "text-amber-400";
                      textColor = "text-amber-200";
                    }

                    return (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-4 ${colorClass} rounded border`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-slate-900/50 flex items-center justify-center ${iconColor} flex-shrink-0`}>
                          <BadgeIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${textColor} text-sm`}>{badge}</p>
                          <p className="text-slate-500 text-xs mt-0.5">Awarded by VettCode</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'features' && features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">Key Features</h3>
                <div className="grid gap-2">
                  {features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-800/20 rounded border border-slate-700/30"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requirements' && requirements.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">System Requirements</h3>
                <div className="grid gap-2">
                  {requirements.map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-slate-800/20 rounded border border-slate-700/30"
                    >
                      <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-indigo-400">{index + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{requirement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Applications - Clean & Minimal */}
        {similarProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Similar Applications</h2>
              <Link href="/products" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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

