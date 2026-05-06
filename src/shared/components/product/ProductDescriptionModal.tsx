"use client"

import React, { useState } from "react"
import { 
  X, 
  MessageCircle, 
  FileText, 
  ChevronRight, 
  Package, 
  Shield, 
  Tag,
  Sparkles,
  CheckCircle,
  Info
} from "lucide-react"
import ProductAIChat from "./ProductAIChat"

interface ProductDescriptionModalProps {
  productInfo: any
  isOpen: boolean
  onClose: () => void
}

const ProductDescriptionModal = ({ productInfo, isOpen, onClose }: ProductDescriptionModalProps) => {
  const [showChat, setShowChat] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "features">("overview")

  if (!isOpen) return null

  const {
    title,
    description,
    detailed_description,
    brand,
    category,
    subCategory,
    warranty,
    custom_specifications,
    tags: rawTags,
    colors,
    sizes,
  } = productInfo || {}

  // Normalize tags — backend may return string, array, or nothing
  const tags: string[] = Array.isArray(rawTags)
    ? rawTags
    : typeof rawTags === 'string' && rawTags.trim()
      ? rawTags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : []

  // Parse features from detailed description (looking for bullet points or numbered lists)
  const extractFeatures = (text: string): string[] => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim());
    const features = lines.filter(line => 
      line.trim().startsWith('-') || 
      line.trim().startsWith('•') || 
      line.trim().startsWith('*') ||
      /^\d+[.)]/.test(line.trim())
    ).map(line => line.replace(/^[-•*\d.)]+\s*/, '').trim());
    return features.length > 0 ? features : [];
  }

  const features = extractFeatures(detailed_description || description || '');

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">
                    {title || "Product Details"}
                  </h3>
                  <p className="text-sm text-slate-300 mt-0.5">
                    Complete product information
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-50 border-b">
            {[
              { id: "overview", label: "Overview", icon: FileText },
              { id: "specs", label: "Specifications", icon: Info },
              { id: "features", label: "Features", icon: CheckCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "text-slate-900 bg-white border-b-2 border-slate-900"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "overview" && (
              <div className="p-6 space-y-6">
                {/* Main Description Card */}
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-100">
                  <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-slate-800 rounded-full" />
                    About This Product
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-[15px]">
                    {description || "No description available for this product."}
                  </p>
                </div>

                {/* Detailed Description */}
                {detailed_description && (
                  <div className="bg-white rounded-xl p-5 border border-slate-100">
                    <h4 className="text-base font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <div className="w-1 h-5 bg-slate-600 rounded-full" />
                      Detailed Description
                    </h4>
                    <div className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-line">
                      {detailed_description}
                    </div>
                  </div>
                )}

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {brand && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Brand</p>
                      <p className="font-semibold text-slate-800">{brand}</p>
                    </div>
                  )}
                  {category && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Category</p>
                      <p className="font-semibold text-slate-800">{category}</p>
                    </div>
                  )}
                  {warranty && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Warranty</p>
                        <p className="font-semibold text-slate-800">{warranty}</p>
                      </div>
                    </div>
                  )}
                  {subCategory && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Type</p>
                      <p className="font-semibold text-slate-800">{subCategory}</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Related Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-slate-200 transition cursor-default"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="p-6">
                {/* Main Specs */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h4 className="font-semibold text-slate-800">Product Specifications</h4>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {brand && (
                      <div className="flex">
                        <div className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 text-sm">
                          Brand
                        </div>
                        <div className="flex-1 px-4 py-3 text-slate-800 text-sm">
                          {brand}
                        </div>
                      </div>
                    )}
                    {category && (
                      <div className="flex">
                        <div className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 text-sm">
                          Category
                        </div>
                        <div className="flex-1 px-4 py-3 text-slate-800 text-sm">
                          {category}
                        </div>
                      </div>
                    )}
                    {subCategory && (
                      <div className="flex">
                        <div className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 text-sm">
                          Sub-Category
                        </div>
                        <div className="flex-1 px-4 py-3 text-slate-800 text-sm">
                          {subCategory}
                        </div>
                      </div>
                    )}
                    {warranty && (
                      <div className="flex">
                        <div className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 text-sm">
                          Warranty
                        </div>
                        <div className="flex-1 px-4 py-3 text-slate-800 text-sm">
                          {warranty}
                        </div>
                      </div>
                    )}
                    {colors && colors.length > 0 && (
                      <div className="flex">
                        <div className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 text-sm">
                          Available Colors
                        </div>
                        <div className="flex-1 px-4 py-3 text-slate-800 text-sm">
                          {colors.join(", ")}
                        </div>
                      </div>
                    )}
                    {sizes && sizes.length > 0 && (
                      <div className="flex">
                        <div className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 text-sm">
                          Available Sizes
                        </div>
                        <div className="flex-1 px-4 py-3 text-slate-800 text-sm">
                          {sizes.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Specifications */}
                {custom_specifications && Object.keys(custom_specifications).length > 0 && (
                  <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                      <h4 className="font-semibold text-slate-800">Additional Details</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {Object.entries(custom_specifications).map(([key, value], index) => (
                        <div key={index} className="flex">
                          <div className="w-1/3 bg-slate-50 px-4 py-3 font-medium text-slate-600 text-sm capitalize">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="flex-1 px-4 py-3 text-slate-800 text-sm">
                            {String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!brand && !category && !warranty && !custom_specifications && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Info className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">No specifications available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "features" && (
              <div className="p-6">
                {features.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-800 mb-4">Key Features</h4>
                    {features.map((feature, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <p className="text-slate-700 text-[15px] leading-relaxed">{feature}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-slate-800">Product Highlights</h4>
                    
                    {/* Show description as features if no bullet points found */}
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-5 border border-slate-100">
                      <p className="text-slate-600 leading-relaxed text-[15px]">
                        {description || detailed_description || "No feature information available for this product."}
                      </p>
                    </div>

                    {/* Quick highlights from available data */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {brand && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-slate-700">Branded by <strong>{brand}</strong></span>
                        </div>
                      )}
                      {warranty && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <Shield className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-slate-700">{warranty} warranty</span>
                        </div>
                      )}
                      {colors && colors.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-slate-700">{colors.length} color options</span>
                        </div>
                      )}
                      {sizes && sizes.length > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-slate-700">{sizes.length} size options</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with AI Chat Button */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => setShowChat(true)}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-medium hover:from-slate-900 hover:to-black transition shadow-lg"
            >
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span>Ask E-AI About This Product</span>
              <ChevronRight className="w-5 h-5 ml-auto" />
            </button>
            <p className="text-xs text-slate-500 text-center mt-2">
              Get instant answers about features, comparisons & recommendations
            </p>
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      <ProductAIChat
        productInfo={productInfo}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </>
  )
}

export default ProductDescriptionModal

