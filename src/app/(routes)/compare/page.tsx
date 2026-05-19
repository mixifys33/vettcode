"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useProductComparison } from "@/hooks/useProductComparison";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import { resolveSellerId } from "@/utils/sellerId";
import { 
  X, Star, ShoppingCart, Heart, ArrowLeft, Check, Minus, GitCompare, 
  Code2, Award, Zap, Terminal, Sparkles, Package 
} from "lucide-react";
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
    const displayTitle = product.appName || product.title;
    const displayPrice = product.isFree ? 0 : (product.salePrice || product.price);
    const sellerId = resolveSellerId(product);
    addToCart({ 
      id: product.id, 
      title: displayTitle, 
      price: displayPrice, 
      image: product.image, 
      shopId: sellerId,
      sellerId,
      appCategory: product.appCategory || product.category,
    }, user, null, null);
    toast.success(`Added "${displayTitle}" to cart`);
  };

  const handleWishlist = (product: any) => {
    const inWishlist = wishlist.some((i: any) => i.id === product.id);
    if (inWishlist) { toast.info("Already in wishlist"); return; }
    const displayTitle = product.appName || product.title;
    const displayPrice = product.isFree ? 0 : (product.salePrice || product.price);
    addToWishlist({ 
      id: product.id, 
      title: displayTitle, 
      price: displayPrice, 
      image: product.image, 
      shopId: "" 
    }, user, null, null);
    toast.success("Saved to wishlist");
  };

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden py-12">
        {/* Animated Code Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
          
          {/* Floating Code Snippets */}
          <div className="absolute top-20 left-10 text-purple-500/20 font-mono text-xs animate-float">
            <pre>{`const compare = () => {\n  return <Apps />;\n}`}</pre>
          </div>
          <div className="absolute top-40 right-20 text-blue-500/20 font-mono text-xs animate-float-delayed">
            <pre>{`function analyze() {\n  return data;\n}`}</pre>
          </div>
          <div className="absolute bottom-40 left-1/4 text-purple-500/20 font-mono text-xs animate-float">
            <pre>{`import { Compare } from 'vettcode';`}</pre>
          </div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slower" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-12 shadow-2xl shadow-purple-500/20 border border-purple-500/20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/50">
              <GitCompare className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">No Applications to Compare</h1>
            <p className="text-gray-300 mb-6">
              Browse applications and click <strong className="text-purple-300">"Compare"</strong> on any application page to add it here. You can compare up to 4 applications side by side.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg shadow-purple-500/50"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Applications
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
    <div className="min-h-screen bg-[#0a0e27] relative overflow-hidden py-8">
      {/* Animated Code Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Floating Code Snippets */}
        <div className="absolute top-10 left-10 text-purple-500/20 font-mono text-xs animate-float">
          <pre>{`const compare = () => {\n  return <VettCode />;\n}`}</pre>
        </div>
        <div className="absolute top-40 right-20 text-blue-500/20 font-mono text-xs animate-float-delayed">
          <pre>{`function verify() {\n  return true;\n}`}</pre>
        </div>
        <div className="absolute bottom-20 left-1/4 text-purple-500/20 font-mono text-xs animate-float">
          <pre>{`import { App } from 'vettcode';`}</pre>
        </div>
        <div className="absolute bottom-40 right-1/3 text-blue-500/20 font-mono text-xs animate-float-delayed">
          <pre>{`export default Compare;`}</pre>
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slower" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              Compare Applications
            </h1>
            <p className="text-gray-400">Comparing {compareList.length} applications side by side</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearCompare}
              className="px-4 py-2 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all backdrop-blur-sm"
            >
              Clear All
            </button>
            <Link
              href="/products"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/50"
            >
              Add More
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/20 overflow-hidden border border-purple-500/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="p-4 text-left text-sm font-medium text-purple-300 w-48 bg-slate-900/50">
                    Application
                  </th>
                  {compareList.map((product) => (
                    <th key={product.id} className="p-4 min-w-[200px] bg-slate-900/30">
                      <div className="relative">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Link href={`/product/${product.slug}`}>
                          <div className="relative w-32 h-32 mx-auto mb-3 rounded-xl overflow-hidden bg-slate-900 border border-purple-500/20">
                            <Image
                              src={product.image || "/placeholder.png"}
                              alt={product.appName || product.title}
                              fill
                              className="object-contain hover:scale-105 transition-transform"
                            />
                          </div>
                          <h3 className="font-medium text-white text-sm line-clamp-2 hover:text-purple-300 transition-colors">
                            {product.appName || product.title}
                          </h3>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <tr className="border-b border-purple-500/20 bg-slate-900/30">
                  <td className="p-4 font-medium text-purple-300">Price</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.salePrice && product.salePrice < product.price ? (
                        <div>
                          <span className="text-lg font-bold text-green-400">
                            ${product.salePrice.toLocaleString()}
                          </span>
                          <span className="block text-sm text-gray-500 line-through">
                            ${product.price.toLocaleString()}
                          </span>
                        </div>
                      ) : product.price === 0 ? (
                        <span className="text-lg font-bold text-green-400">FREE</span>
                      ) : (
                        <span className="text-lg font-bold text-white">
                          ${product.price.toLocaleString()}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b border-purple-500/20">
                  <td className="p-4 font-medium text-purple-300">Rating</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-medium text-white">{product.ratings.toFixed(1)}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr className="border-b border-purple-500/20 bg-slate-900/30">
                  <td className="p-4 font-medium text-purple-300">Availability</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-green-400">
                          <Check className="w-4 h-4" />
                          In Stock ({product.stock})
                        </span>
                      ) : (
                        <span className="text-red-400">Out of Stock</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b border-purple-500/20">
                  <td className="p-4 font-medium text-purple-300">Category</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-gray-300">
                        <Code2 className="w-3 h-3 text-purple-400" />
                        {product.appCategory || product.category}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Brand */}
                <tr className="border-b border-purple-500/20 bg-slate-900/30">
                  <td className="p-4 font-medium text-purple-300">Brand</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-300">
                      {product.brand || "-"}
                    </td>
                  ))}
                </tr>

                {/* Shop */}
                <tr className="border-b border-purple-500/20">
                  <td className="p-4 font-medium text-purple-300">Seller</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-300">
                      {product.shopName}
                    </td>
                  ))}
                </tr>

                {/* Verification Status */}
                <tr className="border-b border-purple-500/20 bg-slate-900/30">
                  <td className="p-4 font-medium text-purple-300">Verification</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {(product as any).verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/30">
                          <Award className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Technology Stack */}
                <tr className="border-b border-purple-500/20">
                  <td className="p-4 font-medium text-purple-300">Technology Stack</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.technologyStack && product.technologyStack.length > 0 ? (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {product.technologyStack.slice(0, 3).map((tech, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-purple-500/20 backdrop-blur-sm rounded text-xs text-purple-300 border border-purple-500/30"
                            >
                              {tech}
                            </span>
                          ))}
                          {product.technologyStack.length > 3 && (
                            <span className="px-2 py-1 bg-slate-700/50 rounded text-xs text-gray-400">
                              +{product.technologyStack.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Platforms */}
                <tr className="border-b border-purple-500/20 bg-slate-900/30">
                  <td className="p-4 font-medium text-purple-300">Platforms</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.platforms && product.platforms.length > 0 ? (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {product.platforms.map((platform, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-blue-500/20 backdrop-blur-sm rounded text-xs text-blue-300 border border-blue-500/30"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Downloads */}
                <tr className="border-b border-purple-500/20">
                  <td className="p-4 font-medium text-purple-300">Downloads</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-300">
                      {product.downloadCount ? (
                        <span className="inline-flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          {product.downloadCount.toLocaleString()}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  ))}
                </tr>

                {/* Colors */}
                <tr className="border-b border-purple-500/20">
                  <td className="p-4 font-medium text-purple-300">Colors</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.colors && product.colors.length > 0 ? (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {product.colors.map((color, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-slate-700/50 backdrop-blur-sm rounded text-xs text-gray-300 border border-purple-500/20"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Minus className="w-4 h-4 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Sizes */}
                <tr className="border-b border-purple-500/20 bg-slate-900/30">
                  <td className="p-4 font-medium text-purple-300">Sizes</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.sizes && product.sizes.length > 0 ? (
                        <div className="flex justify-center gap-1 flex-wrap">
                          {product.sizes.map((size, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-slate-700/50 backdrop-blur-sm rounded text-xs text-gray-300 border border-purple-500/20"
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Minus className="w-4 h-4 text-gray-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>

                {/* Warranty */}
                <tr className="border-b border-purple-500/20">
                  <td className="p-4 font-medium text-purple-300">Warranty</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 text-center text-gray-300">
                      {product.warranty || "-"}
                    </td>
                  ))}
                </tr>

                {/* Dynamic Specifications */}
                {Array.from(allSpecs).map((spec, index) => (
                  <tr key={spec} className={`border-b border-purple-500/20 ${index % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
                    <td className="p-4 font-medium text-purple-300 capitalize">
                      {spec.replace(/_/g, " ")}
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className="p-4 text-center text-gray-300">
                        {product.specifications?.[spec] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Actions */}
                <tr className="bg-slate-900/50">
                  <td className="p-4 font-medium text-purple-300">Actions</td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg shadow-purple-500/50"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => handleWishlist(product)}
                          className="w-full px-4 py-2 border-2 border-purple-500/30 rounded-xl hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2 font-semibold text-gray-300 backdrop-blur-sm"
                        >
                          <Heart className="w-4 h-4" />
                          Save
                        </button>
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="w-full px-4 py-2 border-2 border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 text-sm backdrop-blur-sm"
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

