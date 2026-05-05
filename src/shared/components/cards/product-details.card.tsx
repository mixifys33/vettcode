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
  const router = useRouter();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const wishlist = useStore((state) => state.wishlist);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);

  const isWishListed = wishlist.some((item) => item.id === (data.id || data._id));

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
  const handleDownloadAccess = () => {
    if (data?.isFree) {
      // Track download
      console.log('Free application download:', data?.appName);
      // Redirect to download or access page
      if (data?.liveDemo) {
        window.open(data.liveDemo, '_blank');
      } else if (data?.githubRepo) {
        window.open(data.githubRepo, '_blank');
      }
    } else {
      // Navigate to purchase/checkout page
      router.push(`/applications/${data?.id || data?._id}`);
    }
  };

  // Get images array (screenshots for applications, images for products)
  const imageArray = data?.screenshots || data?.images || [];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-purple-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 p-1.5 sm:p-2 bg-gray-800/90 rounded-full shadow-md hover:bg-gray-700 transition border border-purple-500/30"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-800/50 border border-purple-500/20">
              {imageArray?.[activeImage]?.url ? (
                <Image
                  src={imageArray[activeImage].url}
                  alt={data?.appName || data?.title || "Application screenshot"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <Code2 className="w-16 h-16" />
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {imageArray?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {imageArray.map(
                  (img: any, index: number) =>
                    img?.url && (
                      <button
                        key={index}
                        className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition ${
                          activeImage === index
                            ? "border-purple-500 ring-2 ring-purple-400/50"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                        onClick={() => setActiveImage(index)}
                      >
                        <Image
                          src={img.url}
                          alt={`Thumbnail ${index + 1}`}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    )
                )}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 lg:border-l border-purple-500/20">
            {/* Seller/Developer Info */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {data?.Shop?.avatar ? (
                  <Image
                    src={data.Shop.avatar}
                    alt="Developer"
                    width={48}
                    height={48}
                    className="rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover flex-shrink-0 border-2 border-purple-500/30"
                  />
                ) : (
                  <div className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                    {data?.Shop?.name?.charAt(0) || "D"}
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/shop/${data?.Shop?.id}`}
                    className="text-sm sm:text-base font-medium text-gray-100 hover:text-purple-400 truncate block"
                  >
                    {data?.Shop?.name || "Developer"}
                  </Link>
                  <div className="mt-0.5">
                    <Ratings rating={data?.Shop?.ratings || data?.rating || 5.0} size="sm" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {data?.Shop?.address || "Location Not Available"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 transition w-full sm:w-auto"
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
                <span className="sm:inline">Contact Developer</span>
              </button>
            </div>

            {/* Application Title */}
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-100 mt-4 leading-tight">
              {data?.appName || data?.title || "Application"}
            </h2>

            {/* Category Badge */}
            {data?.appCategory && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Code2 className="w-3 h-3" />
                  {data.appCategory}
                </span>
              </div>
            )}

            {/* Application Ratings & Stats */}
            <div className="mt-3 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Ratings rating={data?.rating || 5.0} size="md" />
                <span className="text-sm text-gray-400">
                  ({data?.reviewCount || 0} reviews)
                </span>
              </div>
              {(data?.downloads || 0) > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Download className="w-4 h-4" />
                  {data.downloads.toLocaleString()} downloads
                </span>
              )}
              {(data?.views || 0) > 0 && (
                <span className="flex items-center gap-1 text-sm text-gray-400">
                  <Eye className="w-4 h-4" />
                  {data.views.toLocaleString()} views
                </span>
              )}
            </div>

            {/* Admin Completion Score */}
            {data?.completionScore && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-green-300">
                  {data.completionScore}% Complete Profile
                </span>
              </div>
            )}

            {/* Description */}
            <div className="mt-4">
              <p
                className={`text-sm sm:text-base text-gray-300 ${
                  showFullDescription ? "" : "line-clamp-3"
                }`}
              >
                {data?.detailedDescription || data?.shortDescription || data?.description || "No description available"}
              </p>
              {(data?.detailedDescription || data?.description || data?.shortDescription) && 
               ((data?.detailedDescription?.length || 0) > 150 || (data?.description?.length || 0) > 150 || (data?.shortDescription?.length || 0) > 150) && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-1 text-sm font-medium text-purple-400 hover:text-purple-300 hover:underline transition"
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Technology Stack */}
            {data?.technologyStack?.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-300 block mb-2">
                  Tech Stack:
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.technologyStack.map((tech: string, index: number) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Supported Platforms */}
            {data?.supportedPlatforms?.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-300 block mb-2">
                  Platforms:
                </span>
                <div className="flex flex-wrap gap-2">
                  {data.supportedPlatforms.map((platform: string, index: number) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 text-xs rounded-md bg-gray-700/50 text-gray-300 border border-gray-600"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* License Type */}
            {data?.licenseType && (
              <p className="mt-3 text-sm text-gray-400">
                <span className="font-medium text-gray-300">License:</span> {data.licenseType}
              </p>
            )}

            {/* Badges */}
            {data?.badges?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {data.badges.map((badge: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                  >
                    <Award className="w-3 h-3" />
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              {data?.isFree ? (
                <span className="text-2xl sm:text-3xl font-bold text-green-400">
                  FREE
                </span>
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-gray-100">
                  {formatApplicationPrice(data?.price || 0, data?.currency || 'USD')}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadAccess}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
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
                className="p-2.5 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition flex-shrink-0"
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

            {/* Quick Links */}
            <div className="mt-4 flex flex-wrap gap-2">
              {data?.liveDemo && (
                <a
                  href={data.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition border border-gray-700"
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
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition border border-gray-700"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {data?.videoDemo && (
                <a
                  href={data.videoDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition border border-gray-700"
                >
                  <Play className="w-4 h-4" />
                  Video Demo
                </a>
              )}
              {data?.documentationUrl && (
                <a
                  href={data.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-800/50 text-gray-300 rounded-lg hover:bg-gray-700/50 transition border border-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  Documentation
                </a>
              )}
            </div>

            {/* Support & Update Info */}
            {(data?.supportLevel || data?.updateFrequency) && (
              <div className="mt-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {data?.supportLevel && (
                    <div>
                      <span className="text-gray-400">Support:</span>
                      <span className="ml-2 font-medium text-gray-200">{data.supportLevel}</span>
                    </div>
                  )}
                  {data?.updateFrequency && (
                    <div>
                      <span className="text-gray-400">Updates:</span>
                      <span className="ml-2 font-medium text-gray-200">{data.updateFrequency}</span>
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
