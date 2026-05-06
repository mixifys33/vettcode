"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductComparison } from "@/hooks/useProductComparison";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import { X, Star, ShoppingCart, Heart, ArrowLeft, Check, Minus, GitCompare } from "lucide-react";
import { toast } from "sonner";

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useProductComparison();
  const { user } = useUser();
  const addToCart = useStore((s: any) => s.addToCart);
  const addToWishlist = useStore((s: any) => s.addToWishlist);
  const cart = useStore((s: any) => s.cart);
  const wishlist = useStore((s: any) => s.wishlist);

  const handleAddToCart = (product: any) => {
    const inCart = cart.some((i: any) => i.id === product.id);
    if (inCart) { toast.info("Already in cart"); return; }
    addToCart({ id: product.id, title: product.title, price: product.salePrice || product.price, image: product.image, shopId: "" }, user, null, null);
    toast.success(`Added "${product.title}" to cart`);
  };

  const handleWishlist = (product: any) => {
    const inWishlist = wishlist.some((i: any) => i.id === product.id);
    if (inWishlist) { toast.info("Already in wishlist"); return; }
    addToWishlist({ id: product.id, title: product.title, price: product.salePrice || product.price, image: product.image, shopId: "" }, user, null, null);
    toast.success("Saved to wishlist");
  };

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-sm">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <GitCompare className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">No Products to Compare</h1>
            <p className="text-gray-500 mb-6">
              Browse products and click <strong>"Compare"</strong> on any product page to add it here. You can compare up to 4 products side by side.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#115061] text-white rounded-xl hover:bg-[#0d3f4d] transition font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get all unique specification keys
  const allSpecs = new Set<string>();
  compareList.forEach((product) => {
    if (product.specifications) {
      Object.keys(product.specifications).forEach((key) => allSpecs.add(key));
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compare Products</h1>
            <p className="text-gray-500">Comparing {compareList.length} products</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearCompare}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Clear All
            </button>
            <Link
              href="/products"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add More
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left text-sm font-medium text-gray-500 w-48">
                    Product
                  </th>
                  {compareList.map((product) => (
                    <th key={product.id} className="p-4 min-w-[200px]">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Link href={`/product/${product.slug}`}>
                          <div className="relative w-32 h-32 mx-auto mb-3">
                            <Image
                              src={product.image || "/placeholder.png"}
                              alt={product.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-blue-600">
                            {product.title}
                          </h3>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">Price</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.salePrice && product.salePrice < product.price ? (
                        <div>
                          <span className="text-lg font-bold text-green-600">
                            {product.salePrice.toLocaleString()} UGX
                          </span>
                          <span className="block text-sm text-gray-400 line-through">
                            {product.price.toLocaleString()} UGX
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {product.price.toLocaleString()} UGX
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-700">Rating</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium">{product.ratings.toFixed(1)}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">Availability</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Check className="w-4 h-4" />
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-red-500">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-700">Category</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-600">
                      {product.category}
                    </td>
                  ))}
                </tr>

                {/* Brand */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">Brand</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-600">
                      {product.brand || "-"}
                    </td>
                  ))}
                </tr>

                {/* Shop */}
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-700">Seller</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-600">
                      {product.shopName}
                    </td>
                  ))}
                </tr>

                {/* Colors */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">Colors</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.colors && product.colors.length > 0 ? (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {product.colors.map((color, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Sizes */}
                <tr className="border-b">
                  <td className="p-4 font-medium text-gray-700">Sizes</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.sizes && product.sizes.length > 0 ? (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {product.sizes.map((size, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-gray-100 rounded text-xs"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Minus className="w-4 h-4 text-gray-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Warranty */}
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">Warranty</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-600">
                      {product.warranty || "-"}
                    </td>
                  ))}
                </tr>

                {/* Dynamic Specifications */}
                {Array.from(allSpecs).map((spec) => (
                  <tr key={spec} className="border-b">
                    <td className="p-4 font-medium text-gray-700 capitalize">
                      {spec.replace(/_/g, " ")}
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className="p-4 text-center text-gray-600">
                        {product.specifications?.[spec] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Actions */}
                <tr className="bg-gray-50">
                  <td className="p-4 font-medium text-gray-700">Actions</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full px-4 py-2 bg-[#115061] text-white rounded-xl hover:bg-[#0d3f4d] transition flex items-center justify-center gap-2 font-semibold"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleWishlist(product)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 font-semibold text-gray-700"
                        >
                          <Heart className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="w-full px-4 py-2 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition flex items-center justify-center gap-2 text-sm"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

