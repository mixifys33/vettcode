"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Heart, 
  ShoppingCart, 
  FileText, 
  MessageCircle, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  Play,
  X,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  MapPin,
  Check,
  Eye,
  Clock,
  GitCompare
} from "lucide-react"
import { useStore } from "@/store"
import useUser from "@/hooks/useUser"
import useDeviceTracking from "@/hooks/useDeviceTracking"
import useLocationTracking from "@/hooks/useLocationTracking"
import ProductDescriptionModal from "@/shared/components/product/ProductDescriptionModal"
import ProductAIChat from "@/shared/components/product/ProductAIChat"
import ProductReviews from "@/shared/components/product/ProductReviews"
import Ratings from "@/shared/components/ratings"
import ProductCard from "@/shared/components/cards/Product-card"
import { useProductComparison } from "@/hooks/useProductComparison"
import { toast } from "sonner"

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

const ProductDetails = ({
  productDetails,
  similarProducts = []
}: {
  productDetails: any;
  similarProducts?: SimilarProduct[];
}) => {
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  
  // UI States
  const [activeImage, setActiveImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Store
  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const wishlistIds = useStore((state) => state.wishlistIds);
  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateCartQuantity = useStore((state) => state.updateCartQuantity);
  const syncWithServer = useStore((state) => state.syncWithServer);

  // Compare
  const { addToCompare, removeFromCompare, isInCompare, canAddMore } = useProductComparison();
  const isCompared = productDetails ? isInCompare(productDetails.id) : false;

  const handleCompare = () => {
    if (!productDetails) return;
    if (isCompared) {
      removeFromCompare(productDetails.id);
      toast.info("Removed from comparison");
    } else {
      const added = addToCompare({
        id: productDetails.id,
        slug: productDetails.slug || productDetails.id,
        title: productDetails.title,
        image: productDetails.images?.[0]?.url || "",
        price: productDetails.regular_price || productDetails.sale_price,
        salePrice: productDetails.sale_price,
        category: productDetails.category || "",
        brand: productDetails.brand || "",
        ratings: productDetails.ratings || 0,
        stock: productDetails.stock || 0,
        shopName: productDetails.shops?.name || "",
        colors: productDetails.colors || [],
        sizes: productDetails.sizes || [],
        warranty: productDetails.warranty || "",
      });
      if (added) {
        toast.success("Added to comparison! Go to /compare to view.");
      } else {
        toast.warning("You can compare up to 4 products at a time.");
      }
    }
  };

  const isWishListed = productDetails ? (
    wishlist.some((item) => item.id === productDetails.id) || wishlistIds.includes(productDetails.id)
  ) : false;
  
  const cartItem = productDetails ? cart.find((item) => item.id === productDetails.id) : null;
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  useEffect(() => {
    if (user?.id) {
      syncWithServer(user);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Set default selections
  useEffect(() => {
    if (productDetails?.colors?.length > 0 && !selectedColor) {
      setSelectedColor(productDetails.colors[0]);
    }
    if (productDetails?.sizes?.length > 0 && !selectedSize) {
      setSelectedSize(productDetails.sizes[0]);
    }
  }, [productDetails, selectedColor, selectedSize]);

  if (!productDetails) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Eye className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700">Product Not Found</h2>
          <p className="text-gray-500 mt-2 mb-6">The product you are looking for does not exist or has been removed.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const {
    id,
    slug,
    title,
    description,
    detailed_description,
    sale_price,
    regular_price,
    images = [],
    video_url,
    brand,
    category,
    subCategory,
    stock,
    colors = [],
    sizes = [],
    shops,
    tags: rawTags = [],
    ratings,
    totalSales,
    warranty,
    cash_on_delivery,
  } = productDetails;

  const discount = regular_price > sale_price 
    ? Math.round(((regular_price - sale_price) / regular_price) * 100) 
    : 0;

  // Normalize tags — backend may return a string, array, or nothing
  const tags: string[] = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string' && rawTags.trim()
      ? rawTags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

  const subtotal = sale_price * cartQuantity;

  // Estimated delivery date (5 days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const handleAddToCart = () => {
    addToCart({ 
      id, 
      slug: slug || id,
      title, 
      price: sale_price, 
      image: images?.[0]?.url || "", 
      shopId: shops?.id || "",
      quantity: 1 
    }, user, location, deviceInfo);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(id, user, location, deviceInfo);
  };

  const handleIncreaseQuantity = () => {
    if (isInCart) {
      updateCartQuantity(id, cartQuantity + 1, user, location, deviceInfo);
    }
  };

  const handleDecreaseQuantity = () => {
    if (cartQuantity <= 1) {
      removeFromCart(id, user, location, deviceInfo);
    } else {
      updateCartQuantity(id, cartQuantity - 1, user, location, deviceInfo);
    }
  };

  const handleWishlist = () => {
    if (isWishListed) {
      removeFromWishlist(id, user, location, deviceInfo);
    } else {
      addToWishlist({ 
        id, 
        title, 
        price: sale_price, 
        image: images?.[0]?.url || "", 
        shopId: shops?.id || "" 
      }, user, location, deviceInfo);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  const youtubeId = video_url ? getYouTubeId(video_url) : null;

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20 md:pb-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {category && (
              <>
                <Link href={`/category/${category}`} className="hover:text-blue-600">{category}</Link>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </>
            )}
            {subCategory && (
              <>
                <span className="hover:text-blue-600">{subCategory}</span>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </>
            )}
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{title}</span>
          </nav>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            
            {/* Left: Images & Video */}
            <div className="p-4 md:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
              {/* Main Image/Video */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
                {showVideo && youtubeId ? (
                  <div className="absolute inset-0">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      onClick={() => setShowVideo(false)}
                      className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    {images.length > 0 ? (
                      <Image
                        src={images[activeImage]?.url}
                        alt={title}
                        fill
                        className={`object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : ''}`}
                        onClick={() => setIsZoomed(!isZoomed)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image available
                      </div>
                    )}
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        -{discount}%
                      </div>
                    )}

                    {/* Video Play Button */}
                    {youtubeId && !showVideo && (
                      <button
                        onClick={() => setShowVideo(true)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/70 text-white px-4 py-2 rounded-full hover:bg-black/90 transition"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span className="text-sm font-medium">Watch Video</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => { setActiveImage(index); setShowVideo(false); }}
                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === index && !showVideo
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`${title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
                {/* Video Thumbnail */}
                {youtubeId && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition bg-gray-900 ${
                      showVideo ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="p-4 md:p-6 lg:p-8">
              {/* Shop Info */}
              {shops && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {shops.name?.charAt(0) || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${shops.id}`} className="font-medium text-gray-900 hover:text-blue-600 truncate block">
                      {shops.name}
                    </Link>
                    {shops.address && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{shops.address}</span>
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/inbox?shopId=${shops.id}&shopName=${encodeURIComponent(shops.name || '')}&productId=${id}&productTitle=${encodeURIComponent(title)}&productImage=${encodeURIComponent(images?.[0]?.url || '')}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Chat with Seller</span>
                    <span className="sm:hidden">Chat</span>
                  </Link>
                </div>
              )}

              {/* Title */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {title}
              </h1>

              {/* Ratings & Sales */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="flex items-center gap-1">
                  <Ratings rating={ratings || 5} size="sm" />
                  <span className="text-sm text-gray-500 ml-1">({ratings || 5})</span>
                </div>
                {totalSales > 0 && (
                  <span className="text-sm text-gray-500">|  {totalSales} sold</span>
                )}
                {brand && (
                  <span className="text-sm text-gray-500">|  Brand: <span className="font-medium text-gray-700">{brand}</span></span>
                )}
              </div>

              {/* Price & Delivery Row */}
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* Price */}
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-2xl md:text-3xl font-bold text-orange-600">
                      UGX {sale_price?.toLocaleString('en-UG')}
                    </span>
                    {discount > 0 && (
                      <>
                        <span className="text-base text-gray-400 line-through">
                          UGX {regular_price?.toLocaleString('en-UG')}
                        </span>
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                          -{discount}%
                        </span>
                      </>
                    )}
                  </div>
                  
                  {/* Estimated Delivery - Next to Price */}
                  <div className="flex items-center gap-2 text-sm bg-white/60 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-gray-500">Delivery by </span>
                      <span className="font-semibold text-gray-800">
                        {estimatedDelivery.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-2">
                {stock > 0 ? (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 font-medium">In Stock</span>
                    <span className="text-gray-500">({stock} items available)</span>
                  </>
                ) : (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Color: <span className="text-gray-900">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                          selectedColor === color
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Size: <span className="text-gray-900">{selectedSize}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[3rem] px-4 py-2 rounded-lg border-2 text-sm font-medium transition ${
                          selectedSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Cart Actions */}
              <div className="mt-6">
                {isInCart ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={handleDecreaseQuantity}
                          className="p-2.5 hover:bg-gray-100 transition rounded-l-lg"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-5 py-2 font-semibold min-w-[3rem] text-center">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={handleIncreaseQuantity}
                          className="p-2.5 hover:bg-gray-100 transition rounded-r-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-700 font-medium">Subtotal:</span>
                      <span className="text-xl font-bold text-green-800">
                        UGX {subtotal.toLocaleString('en-UG')}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* ACTION BUTTONS */}
              {/* PRIMARY: Add to Cart / Remove from Cart */}
              <div className="mt-6">
                {isInCart ? (
                  <button
                    onClick={handleRemoveFromCart}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition text-base shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Remove from Cart
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={stock === 0}
                    className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-bold transition text-base shadow-lg ${
                      stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                )}
              </div>

              {/* SECONDARY: Message Seller Button - PROMINENT */}
              {shops && (
                <div className="mt-3">
                  <Link
                    href={`/inbox?shopId=${shops.id}&shopName=${encodeURIComponent(shops.name || '')}&productId=${id}&productTitle=${encodeURIComponent(title)}&productImage=${encodeURIComponent(images?.[0]?.url || '')}`}
                    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold transition text-base shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message Seller
                  </Link>
                </div>
              )}

              {/* TERTIARY: Wishlist, Compare and Share - Same Row */}
              <div className="mt-3 flex flex-row gap-3">
                <button
                  onClick={handleWishlist}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition border-2 ${
                    isWishListed
                      ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishListed ? 'fill-red-500' : ''}`} />
                  {isWishListed ? 'Saved' : 'Save'}
                </button>

                <Link
                  href="/compare"
                  onClick={handleCompare}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition border-2 ${
                    isCompared
                      ? 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <GitCompare className="w-5 h-5" />
                  {isCompared ? 'Comparing' : 'Compare'}
                </Link>

                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition border-2 border-gray-200 text-gray-700 hover:bg-gray-50 relative"
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

              {/* Description & AI Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDescription(true)}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">Description</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Specs & details</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowChat(true)}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-xl transition border border-blue-100"
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-left min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base truncate">Ask AI</p>
                    <p className="text-xs text-gray-500 hidden sm:block">Get instant help</p>
                  </div>
                </button>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag: string, index: number) => (
                    <Link
                      key={index}
                      href={`/search?q=${tag}`}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <ProductReviews productId={id} productTitle={title} />
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Similar Products</h2>
              <Link 
                href={`/category/${category}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarProducts.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Service Features - Moved to End */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Shop With Us</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-medium text-gray-800">Free Delivery</span>
              <span className="text-xs text-gray-500 mt-1">On orders over UGX 1,500,000</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <span className="font-medium text-gray-800">Secure Payment</span>
              <span className="text-xs text-gray-500 mt-1">100% secure checkout</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <RotateCcw className="w-6 h-6 text-orange-600" />
              </div>
              <span className="font-medium text-gray-800">Easy Returns</span>
              <span className="text-xs text-gray-500 mt-1">7-day return policy</span>
            </div>
            {cash_on_delivery === 'yes' ? (
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
                <span className="font-medium text-gray-800">COD Available</span>
                <span className="text-xs text-gray-500 mt-1">Pay on delivery eligebility</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-purple-600" />
                </div>
                <span className="font-medium text-gray-800">Quality Guaranteed</span>
                <span className="text-xs text-gray-500 mt-1">Verified products</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductDescriptionModal
        productInfo={productDetails}
        isOpen={showDescription}
        onClose={() => setShowDescription(false)}
      />

      <ProductAIChat
        productInfo={productDetails}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  )
}

export default ProductDetails
