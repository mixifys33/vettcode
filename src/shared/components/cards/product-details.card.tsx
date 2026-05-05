import { MessageCircle, Heart, MapPin, X, Code2, Star, Download, Eye, Shield, CheckCircle, GitFork, Sparkles, Award } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import Ratings from "../ratings";
import { useRouter } from "next/navigation";
import CartIcon from "@/assets/svgs/cart-icon";
import useDeviceTracking from "@/hooks/useDeviceTracking";
import useLocationTracking from "@/hooks/useLocationTracking";
import useUser from "@/hooks/useUser";
import { useStore } from "@/store";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

const ProductDetailsCard = ({
  data,
  setOpen,
}: {
  data: any;
  setOpen: (open: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();
  const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
  const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const { formatPrice } = useCurrencyFormat();

  const cart = useStore((state) => state.cart);
  const wishlist = useStore((state) => state.wishlist);
  const addToCart = useStore((state) => state.addToCart);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const updateCartQuantity = useStore((state) => state.updateCartQuantity);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);

  const isWishListed = wishlist.some((item) => item.id === data.id);
  const cartItem = cart.find((item) => item.id === data.id);
  const isInCart = !!cartItem;
  const cartQuantity = cartItem?.quantity || 0;

  // Calculate subtotal
  const subtotal = (data?.sale_price || 0) * cartQuantity;

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  // Handle quantity increase
  const handleIncreaseQuantity = () => {
    if (isInCart) {
      updateCartQuantity(data.id, cartQuantity + 1, user, location, deviceInfo);
    }
  };

  // Handle quantity decrease or remove from cart
  const handleDecreaseQuantity = () => {
    if (cartQuantity <= 1) {
      // Remove from cart when quantity reaches 0
      removeFromCart(data.id, user, location, deviceInfo);
    } else {
      updateCartQuantity(data.id, cartQuantity - 1, user, location, deviceInfo);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart(
      {
        ...data,
        quantity: 1,
        selectedOptions: {
          color: isSelected,
          size: isSizeSelected,
        },
      },
      user,
      location,
      deviceInfo
    );
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-2 sm:p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-5xl max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="absolute right-2 top-2 sm:right-4 sm:top-4 z-10 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </button>

        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
              {data?.images?.[activeImage]?.url && (
                <Image
                  src={data.images[activeImage].url}
                  alt={data?.title || "Product image"}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {data?.images?.map(
                (img: any, index: number) =>
                  img?.url && (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition ${
                        activeImage === index
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
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
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 p-3 sm:p-4 lg:p-6 lg:border-l border-gray-100">
            {/* Seller Info */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {data?.Shop?.avatar ? (
                  <Image
                    src={data.Shop.avatar}
                    alt="Shop Logo"
                    width={48}
                    height={48}
                    className="rounded-full w-10 h-10 sm:w-12 sm:h-12 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="rounded-full w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 flex items-center justify-center text-gray-500 text-lg font-semibold flex-shrink-0">
                    {data?.Shop?.name?.charAt(0) || "S"}
                  </div>
                )}
                <div className="min-w-0">
                  <Link
                    href={`/shop/${data?.Shop?.id}`}
                    className="text-sm sm:text-base font-medium text-gray-900 hover:text-blue-600 truncate block"
                  >
                    {data?.Shop?.name}
                  </Link>
                  <div className="mt-0.5">
                    <Ratings rating={data?.Shop?.ratings} size="sm" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {data?.Shop?.address || "Location Not Available"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition w-full sm:w-auto"
                onClick={() => {
                  const shopId = data?.Shop?.id || data?.shopId;
                  const shopName = data?.Shop?.name || data?.shopName || 'Shop';
                  if (!shopId) {
                    alert('Shop information is not available');
                    return;
                  }
                  router.push(`/inbox?shopId=${shopId}&shopName=${encodeURIComponent(shopName)}&productId=${data?.id || ''}&productTitle=${encodeURIComponent(data?.title || '')}&productImage=${encodeURIComponent(data?.images?.[0]?.url || '')}`);
                }}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="sm:inline">Chat with Seller</span>
              </button>
            </div>

            {/* Product Title */}
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mt-4 leading-tight">
              {data?.title}
            </h2>

            {/* Product Ratings */}
            <div className="mt-2 flex items-center gap-3">
              <Ratings rating={data?.ratings} size="md" />
              {data?.totalSales > 0 && (
                <span className="text-sm text-gray-500">
                  | {data.totalSales} sold
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-2">
              <p
                className={`text-sm sm:text-base text-gray-600 ${
                  showFullDescription ? "" : "line-clamp-3"
                }`}
              >
                {data?.description || ""}
              </p>
              {data?.description && data.description.length > 150 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </button>
              )}
            </div>

            {/* Brand */}
            {data?.brand && (
              <p className="mt-2 text-sm text-gray-700">
                <span className="font-medium">Brand:</span> {data.brand}
              </p>
            )}

            {/* Color and Size Options */}
            <div className="mt-4 space-y-4">
              {data?.colors?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Color:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          isSelected === color
                            ? "border-gray-800 ring-2 ring-offset-1 ring-gray-400"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        onClick={() => setIsSelected(color)}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {data?.sizes?.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Size:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {data.sizes.map((size: string, index: number) => (
                      <button
                        key={index}
                        className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                          isSizeSelected === size
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                        onClick={() => setIsSizeSelected(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                {formatPrice(data?.sale_price)}
              </span>
              {data?.regular_price && data.regular_price > data.sale_price && (
                <span className="text-base sm:text-lg text-gray-400 line-through">
                  {formatPrice(data.regular_price)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-3">
              {data?.stock > 0 ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  In Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Cart Actions */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              {isInCart ? (
                /* Quantity Selector with Subtotal - shown when product is in cart */
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      className="p-2.5 hover:bg-gray-200 transition rounded-l-lg"
                      onClick={handleDecreaseQuantity}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="px-5 py-2 min-w-[3.5rem] text-center font-semibold text-gray-800">
                      {cartQuantity}
                    </span>
                    <button
                      className="p-2.5 hover:bg-gray-200 transition rounded-r-lg"
                      onClick={handleIncreaseQuantity}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Subtotal Display */}
                  <div className="flex-1 flex items-center justify-between sm:justify-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm text-green-700">Subtotal:</span>
                    <span className="text-lg font-bold text-green-800">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                /* Add to Cart Button - shown when product is not in cart */
                <button
                  onClick={handleAddToCart}
                  disabled={data?.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                    data?.stock === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#ff5722] hover:bg-[#e64a19] text-white"
                  }`}
                >
                  <CartIcon size={18} />
                  {data?.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              )}

              {/* Wishlist */}
              <button
                className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex-shrink-0"
                onClick={() =>
                  isWishListed
                    ? removeFromWishlist(data.id, user, location, deviceInfo)
                    : addToWishlist(
                        {
                          ...data,
                          quantity: 1,
                          selectedOptions: {
                            color: isSelected,
                            size: isSizeSelected,
                          },
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
                      : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            {/* Delivery Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Estimated Delivery:{" "}
                <span className="font-medium text-gray-900">
                  {estimatedDelivery.toDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsCard;