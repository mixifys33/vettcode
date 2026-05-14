import { MessageCircle, Heart, MapPin, X, Code2, Star, Download, Eye, Shield, CheckCircle, GitFork, Sparkles, Award, ExternalLink, Github, Play, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import Ratings from "../ratings";
import { useRouter } from "next/navigation";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import useUser from "@/hooks/useUser";
import { useStore } from "@/store";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const wishlist = useStore((state) => state.wishlist);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);

  const isWishListed = wishlist.some((item) => item.id === (data.id || data._id));

  // Extract YouTube video ID from URL
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // Handle various YouTube URL formats
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
    
    // If it's already an embed URL or other video platform
    if (url.includes('embed') || url.includes('vimeo') || url.includes('loom')) {
      return url;
    }
    
    return null;
  };

  const videoEmbedUrl = data?.videoDemo ? getYouTubeEmbedUrl(data.videoDemo) : null;

  // Format price with application's currency
  const formatApplicationPrice = (price: number, currency: string = 'USD') => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      UGX: 'USh ',
      KES: 'KSh ',
      TZS: 'TSh ',
      RWF: 'RWF '
    };
    
    const symbol = currencySymbols[currency] || currency + ' ';
    return symbol + price.toLocaleString();
  };

  // Handle download/access for free apps
  const handleDownloadAccess = async () => {
    if (data?.isFree) {
      // Priority: sourceCodeFile.url > githubRepo > liveDemo
      const downloadUrl = data?.sourceCodeFile?.url || data?.githubRepo || data?.liveDemo;
      
      if (downloadUrl) {
        // Track download in backend
        try {
          const appId = data?.id || data?._id;
          if (appId) {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/${appId}/download`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
          }
        } catch (error) {
          console.error('Failed to track download:', error);
          // Don't block download if tracking fails
        }
        
        window.open(downloadUrl, '_blank');
      } else {
        alert('Download link not available. Please contact the seller.');
      }
    } else {
      // Navigate to purchase/checkout page
      router.push(`/product/${data?.slug || data?.id || data?._id}`);
    }
  };

  // Get images array (screenshots for applications, images for products)
  const imageArray = data?.screenshots || data?.images || [];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 p-2 bg-gray-800/90 rounded-full shadow-lg hover:bg-gray-700 transition border border-purple-500/40"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-200" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Image Section - Optimized Space Usage */}
          <div className="w-full lg:w-[45%] p-4 sm:p-5 lg:p-6 flex flex-col">
            {/* Main Image */}
            <div className="relative w-full rounded-xl overflow-hidden bg-gray-800/50 border border-purple-500/20 flex-shrink-0" style={{ aspectRatio: '16/10' }}>
              {imageArray?.[activeImage]?.url ? (
                <Image
                  src={imageArray[activeImage].url}
                  alt={data?.appName || data?.title || "Application screenshot"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Code2 className="w-20 h-20" />
                </div>
              )}
            </div>
            
            {/* Thumbnails - Compact Grid */}
            {imageArray?.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {imageArray.slice(0, 5).map(
                  (img: any, index: number) =>
                    img?.url && (
                      <button
                        key={index}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                          activeImage === index
                            ? "border-purple-500 ring-2 ring-purple-400/50"
                            : "border-gray-700 hover:border-purple-500/50"
                        }`}
                        onClick={() => setActiveImage(index)}
                      >
                        <Image
                          src={img.url}
                          alt={`Thumbnail ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )
                )}
              </div>
            )}

            {/* Video Demo Section - Embedded Player */}
            {data?.videoDemo && (
              <div className="mt-4">
                {!showVideo ? (
                  <div className="p-4 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Play className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-semibold text-white">Video Demo Available</span>
                    </div>
                    <button
                      onClick={() => setShowVideo(true)}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition shadow-lg"
                    >
                      <Play className="w-4 h-4" />
                      Watch Demo
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black border border-purple-500/30">
                    {videoEmbedUrl ? (
                      <div className="relative" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={videoEmbedUrl}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Application Demo Video"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center text-gray-400">
                        <p className="text-sm">Video format not supported for embedding</p>
                      </div>
                    )}
                    <button
                      onClick={() => setShowVideo(false)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-lg transition"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats - Use remaining space */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Downloads</span>
                </div>
                <p className="text-lg font-bold text-white">{(data?.downloads || 0).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-800/40 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Views</span>
                </div>
                <p className="text-lg font-bold text-white">{(data?.views || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Details Section - Better Typography & Spacing */}
          <div className="w-full lg:w-[55%] p-4 sm:p-5 lg:p-6 lg:border-l border-purple-500/20 overflow-y-auto">
            {/* Seller/Developer Info */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {data?.Shop?.avatar ? (
                  <Image
                    src={data.Shop.avatar}
                    alt="Developer"
                    width={48}
                    height={48}
                    className="rounded-full w-11 h-11 sm:w-12 sm:h-12 object-cover flex-shrink-0 border-2 border-purple-500/40"
                  />
                ) : (
                  <div className="rounded-full w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-lg">
                    {data?.Shop?.name?.charAt(0) || "D"}
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/shop/${data?.Shop?.id}`}
                    className="text-sm sm:text-base font-semibold text-white hover:text-purple-400 truncate block transition"
                  >
                    {data?.Shop?.name || "Developer"}
                  </Link>
                  <div className="mt-1">
                    <Ratings rating={data?.Shop?.ratings || data?.rating || 5.0} size="sm" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {data?.Shop?.address || "Global"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg w-full sm:w-auto"
                onClick={() => {
                  const shopId = data?.Shop?.id || data?.shopId;
                  const shopName = data?.Shop?.name || data?.shopName || 'Developer';
                  if (!shopId) {
                    alert('Developer information is not available');
                    return;
                  }
                  router.push(`/inbox?shopId=${shopId}&shopName=${encodeURIComponent(shopName)}&productId=${data?.id || data?._id || ''}&productTitle=${encodeURIComponent(data?.appName || data?.title || '')}&productImage=${encodeURIComponent(imageArray?.[0]?.url || '')}`);
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact</span>
              </button>
            </div>

            {/* Application Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-4 leading-tight">
              {data?.appName || data?.title || "Application"}
            </h2>

            {/* Category & Rating Row */}
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {data?.appCategory && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <Code2 className="w-3.5 h-3.5" />
                  {data.appCategory}
                </span>
              )}
              <div className="flex items-center gap-2">
                <Ratings rating={data?.rating || 5.0} size="md" />
                <span className="text-xs font-medium text-gray-400">
                  by VettCode Admin
                </span>
              </div>
            </div>

            {/* Admin Completion Score */}
            {data?.completionScore && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/40 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-semibold text-green-300">
                  {data.completionScore}% Complete Profile
                </span>
              </div>
            )}

            {/* Description */}
            <div className="mt-4">
              <p
                className={`text-sm leading-relaxed text-gray-300 ${
                  showFullDescription ? "" : "line-clamp-3"
                }`}
              >
                {data?.detailedDescription || data?.shortDescription || data?.description || "No description available"}
              </p>
              {(data?.detailedDescription || data?.description || data?.shortDescription) && 
               ((data?.detailedDescription?.length || 0) > 150 || (data?.description?.length || 0) > 150 || (data?.shortDescription?.length || 0) > 150) && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-sm font-semibold text-purple-400 hover:text-purple-300 hover:underline transition"
                >
                  {showFullDescription ? "Show less" : "Read more"}
                </button>
              )}
            </div>

            {/* Technology Stack - Redesigned with Better Background */}
            {data?.technologyStack?.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-xl border border-blue-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">Tech Stack</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.technologyStack.map((tech: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/30 text-blue-200 border border-blue-400/50 hover:bg-blue-500/40 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Platforms - Redesigned with Better Background */}
            {data?.supportedPlatforms?.length > 0 && (
              <div className="mt-4 p-4 bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-bold text-white">Platforms</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.supportedPlatforms.map((platform: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/30 text-purple-200 border border-purple-400/50 hover:bg-purple-500/40 transition-colors"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* License & Badges Row */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              {data?.licenseType && (
                <span className="text-sm text-gray-300">
                  <span className="font-semibold text-white">License:</span> {data.licenseType}
                </span>
              )}
            </div>

            {/* Badges */}
            {data?.badges?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.badges.map((badge: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
                  >
                    <Award className="w-3.5 h-3.5" />
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Price & Action Section */}
            <div className="mt-6 pt-4 border-t border-purple-500/20">
              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                {data?.isFree ? (
                  <span className="text-3xl font-bold text-green-400">
                    FREE
                  </span>
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {formatApplicationPrice(data?.price || 0, data?.currency || 'USD')}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadAccess}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold transition bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                >
                  {data?.isFree ? (
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

                {/* Wishlist */}
                <button
                  className="p-3 border border-purple-500/40 rounded-lg hover:bg-purple-500/10 transition flex-shrink-0"
                  onClick={() =>
                    isWishListed
                      ? removeFromWishlist(data.id || data._id, user, location, deviceInfo)
                      : addToWishlist(
                          {
                            ...data,
                            id: data.id || data._id
                          },
                          user,
                          location,
                          deviceInfo
                        )
                  }
                  aria-label={isWishListed ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishListed
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick Links - Redesigned with Card Backgrounds */}
            {(data?.liveDemo || data?.githubRepo || data?.documentationUrl) && (
              <div className="mt-4 p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="w-4 h-4 text-gray-300" />
                  <span className="text-sm font-bold text-white">Quick Links</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {data?.liveDemo && (
                    <a
                      href={data.liveDemo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold bg-gradient-to-br from-emerald-600/20 to-teal-600/20 text-emerald-300 hover:text-emerald-200 hover:from-emerald-600/30 hover:to-teal-600/30 rounded-lg transition-all border border-emerald-500/40 hover:border-emerald-400/60"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                  {data?.githubRepo && (
                    <a
                      href={data.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold bg-gradient-to-br from-gray-700/40 to-gray-800/40 text-gray-200 hover:text-white hover:from-gray-700/60 hover:to-gray-800/60 rounded-lg transition-all border border-gray-600 hover:border-gray-500"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </a>
                  )}
                  {data?.documentationUrl && (
                    <a
                      href={data.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold bg-gradient-to-br from-blue-600/20 to-indigo-600/20 text-blue-300 hover:text-blue-200 hover:from-blue-600/30 hover:to-indigo-600/30 rounded-lg transition-all border border-blue-500/40 hover:border-blue-400/60"
                    >
                      <FileText className="w-4 h-4" />
                      Docs
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Support & Update Info - Redesigned */}
            {(data?.supportLevel || data?.updateFrequency) && (
              <div className="mt-4 p-4 bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-xl border border-amber-500/30">
                <div className="grid grid-cols-2 gap-4">
                  {data?.supportLevel && (
                    <div className="flex flex-col">
                      <span className="text-xs text-amber-400/70 mb-1">Support Level</span>
                      <span className="text-sm font-bold text-amber-200">{data.supportLevel}</span>
                    </div>
                  )}
                  {data?.updateFrequency && (
                    <div className="flex flex-col">
                      <span className="text-xs text-amber-400/70 mb-1">Update Status</span>
                      <span className="text-sm font-bold text-amber-200">{data.updateFrequency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;

