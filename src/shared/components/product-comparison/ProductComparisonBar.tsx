"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, GitCompare, Trash2, ArrowRight, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useProductComparison } from "@/hooks/useProductComparison";

export default function ProductComparisonBar() {
  const { compareList, removeFromCompare, clearCompare, maxItems } = useProductComparison();
  const [isMinimized, setIsMinimized] = useState(false);

  if (compareList.length === 0) return null;

  const canCompare = compareList.length >= 2;
  const progress = (compareList.length / maxItems) * 100;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-40 md:hidden" />
      
      <div className={`fixed ${isMinimized ? 'bottom-0' : 'bottom-0'} left-0 right-0 z-50 transition-all duration-300`}>
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-500/30 overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1 bg-slate-700 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 transition-all duration-500 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>

            {/* Minimize/Maximize Button */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="absolute -top-10 right-4 w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform md:hidden"
            >
              {isMinimized ? (
                <ChevronUp className="w-4 h-4 text-white" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white" />
              )}
            </button>

            {!isMinimized && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-purple-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
                      <GitCompare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        Compare Applications
                        <span className="px-2 py-0.5 bg-purple-500/30 rounded-full text-xs font-mono">
                          {compareList.length}/{maxItems}
                        </span>
                      </h3>
                      <p className="text-gray-400 text-xs hidden sm:block">
                        {canCompare
                          ? "Ready to compare!"
                          : `Add ${2 - compareList.length} more to start comparing`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearCompare}
                    className="text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 text-sm group"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>

                {/* Products Grid */}
                <div className="flex items-center gap-3 md:gap-4 px-4 md:px-6 py-4">
                  {/* Products List */}
                  <div className="flex-1 flex items-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide">
                    {compareList.map((product, index) => (
                      <div
                        key={product.id}
                        className="relative flex-shrink-0 group animate-slide-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden bg-slate-700 border-2 border-purple-500/30 group-hover:border-purple-500/60 transition-all group-hover:scale-105 shadow-lg">
                          <Image
                            src={product.image || "/placeholder.png"}
                            alt={product.appName || product.title}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {/* Product Name Tooltip */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-purple-500/30 rounded-lg text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-10 shadow-xl">
                          {(product.appName || product.title).slice(0, 20)}
                          {(product.appName || product.title).length > 20 && "..."}
                        </div>
                        {/* Price Badge */}
                        {product.isFree ? (
                          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-green-500 rounded-full text-white text-[9px] font-bold shadow-lg">
                            FREE
                          </div>
                        ) : (
                          <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-purple-600 rounded-full text-white text-[9px] font-bold shadow-lg">
                            ${product.price}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: maxItems - compareList.length }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 border-dashed border-purple-500/30 flex items-center justify-center bg-slate-800/50 hover:border-purple-500/50 transition-all"
                      >
                        <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple-400/50" />
                      </div>
                    ))}
                  </div>

                  {/* Compare Button */}
                  <Link
                    href="/compare"
                    className={`flex-shrink-0 px-4 md:px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 group relative overflow-hidden ${
                      canCompare
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
                        : "bg-slate-700 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                    onClick={(e) => !canCompare && e.preventDefault()}
                    title={!canCompare ? "Add at least 2 applications to compare" : ""}
                  >
                    {canCompare && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow" />
                    )}
                    <span className="relative z-10 hidden sm:inline">Compare Now</span>
                    <span className="relative z-10 sm:hidden">Compare</span>
                    <ArrowRight className={`w-4 h-4 relative z-10 ${canCompare ? 'group-hover:translate-x-1' : ''} transition-transform`} />
                  </Link>
                </div>
              </>
            )}

            {/* Minimized View */}
            {isMinimized && (
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-purple-400" />
                  <span className="text-white text-sm font-medium">
                    {compareList.length} apps
                  </span>
                </div>
                <Link
                  href="/compare"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    canCompare
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-slate-700 text-gray-400"
                  }`}
                  onClick={(e) => !canCompare && e.preventDefault()}
                >
                  Compare
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shimmer-slow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 3s infinite;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}


