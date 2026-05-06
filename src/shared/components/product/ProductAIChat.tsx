"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { 
  Send, 
  X, 
  User, 
  Globe, 
  Sparkles, 
  ExternalLink,
  Maximize2,
  Clock,
  ShoppingCart,
  Package,
  Star
} from "lucide-react"
import MarkdownRenderer from "../ui/MarkdownRenderer"
import MessageActions from "../ui/MessageActions"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  usedWebSearch?: boolean
  isError?: boolean
  similarProducts?: SimilarProduct[]
}

interface SimilarProduct {
  id: string
  title: string
  slug: string
  price: number
  image: string
  rating: number
}

interface ProductAIChatProps {
  productInfo: any
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (product: any) => void
}

const ProductAIChat = ({ productInfo, isOpen, onClose, onAddToCart }: ProductAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substring(2, 15)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messages.length === 0 && productInfo) {
      const discount = productInfo.regular_price > productInfo.sale_price
        ? Math.round(((productInfo.regular_price - productInfo.sale_price) / productInfo.regular_price) * 100)
        : 0;
      
      setMessages([{
        id: generateId(),
        role: "assistant",
        content: `Hi! I'm E-AI, your shopping assistant 🛒

I'm here to help you with **${productInfo?.title || "this product"}**

${discount > 0 ? `🔥 Great news! This item is **${discount}% OFF** right now!\n` : ''}
- **Price**: UGX ${productInfo?.sale_price?.toLocaleString() || "N/A"}
- **Status**: ${productInfo?.stock > 0 ? `✅ In Stock (${productInfo.stock} available)` : '❌ Currently out of stock'}

Ask me anything about features, comparisons, warranty, or buying advice!`,
        timestamp: new Date()
      }])
    }
  }, [isOpen, productInfo])

  const suggestedQuestions = [
    { text: "Key features?", icon: "✨" },
    { text: "Worth the price?", icon: "💰" },
    { text: "Compare options", icon: "⚖️" },
    { text: "Any issues?", icon: "🔍" },
  ]

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    if (!text || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/product-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          productInfo: {
            ...productInfo,
            id: productInfo?.id,
            title: productInfo?.title,
            slug: productInfo?.slug,
            sale_price: productInfo?.sale_price,
            regular_price: productInfo?.regular_price,
            category: productInfo?.category,
            subCategory: productInfo?.subCategory,
            description: productInfo?.description,
            detailed_description: productInfo?.detailed_description,
            brand: productInfo?.brand,
            stock: productInfo?.stock,
            ratings: productInfo?.ratings,
            colors: productInfo?.colors,
            sizes: productInfo?.sizes,
            warranty: productInfo?.warranty,
            cash_on_delivery: productInfo?.cash_on_delivery,
            custom_specifications: productInfo?.custom_specifications,
            images: productInfo?.images,
            shops: productInfo?.shops
          },
          chatHistory: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await response.json()

      setMessages(prev => [...prev, {
        id: generateId(),
        role: "assistant",
        content: data.success ? data.message : (data.message || "Sorry, I couldn't process your request. Please try again."),
        timestamp: new Date(),
        usedWebSearch: data.usedWebSearch,
        similarProducts: data.similarProducts,
        isError: !data.success
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I couldn't connect to the server. Please try again.",
        timestamp: new Date(),
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const retryMessage = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    // Find the last user message before this assistant message
    let lastUserMessage = null
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessage = messages[i]
        break
      }
    }
    
    if (lastUserMessage) {
      // Remove the error message
      setMessages(prev => prev.filter(m => m.id !== messageId))
      // Resend
      sendMessage(lastUserMessage.content)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date)
  }

  const handleAddToCart = () => {
    if (onAddToCart && productInfo) {
      onAddToCart({
        id: productInfo.id,
        title: productInfo.title,
        price: productInfo.sale_price,
        image: productInfo.images?.[0]?.url || '',
        shopId: productInfo.shops?.id || productInfo.shopId
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[90vh] sm:h-[85vh] max-h-[700px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 text-white p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base">E-AI Assistant</h3>
                <p className="text-xs text-slate-300 truncate max-w-[150px] sm:max-w-[200px]">
                  {productInfo?.title || "Ask me anything"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href="/ai-assistant"
                className="p-2 hover:bg-white/10 rounded-lg transition"
                title="Open full E-AI"
              >
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
          
          {/* Quick Add to Cart */}
          {productInfo?.stock > 0 && onAddToCart && (
            <button
              onClick={handleAddToCart}
              className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-xs sm:text-sm font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart - UGX {productInfo.sale_price?.toLocaleString()}
            </button>
          )}
        </div>

        {/* Messages - Scrollable */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 bg-slate-50"
        >
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] ${message.role === "user" ? "order-first" : ""}`}>
                  <div className={`p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-slate-800 text-white rounded-br-sm"
                      : message.isError
                      ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-sm"
                      : "bg-white text-slate-800 shadow-sm border border-slate-100 rounded-bl-sm"
                  }`}>
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                    ) : (
                      <MarkdownRenderer content={message.content} />
                    )}
                    
                    {message.usedWebSearch && (
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                        <Globe className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Live web data</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Footer with Actions */}
                  <div className={`flex items-center gap-2 mt-1 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatTime(message.timestamp)}
                    </div>
                    {message.role === "assistant" && (
                      <MessageActions 
                        content={message.content}
                        messageId={message.id}
                        onRetry={() => retryMessage(message.id)}
                        showRetry={message.isError}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
                {message.role === "user" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Similar Products */}
              {message.similarProducts && message.similarProducts.length > 0 && (
                <div className="ml-9 sm:ml-11 mr-2">
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    Similar Products:
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {message.similarProducts.slice(0, 4).map(product => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="flex-shrink-0 w-28 p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition"
                      >
                        {product.image && (
                          <div className="w-full h-16 bg-slate-100 rounded overflow-hidden mb-2">
                            <Image 
                              src={product.image} 
                              alt={product.title}
                              width={112}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <p className="text-xs font-medium text-slate-800 truncate">{product.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-orange-600 font-semibold">UGX {(product.price / 1000).toFixed(0)}k</p>
                          {product.rating > 0 && (
                            <span className="flex items-center text-xs text-slate-400">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {product.rating}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Loading */}
          {isLoading && (
            <div className="flex gap-2 sm:gap-3 justify-start">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-500">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Fixed */}
        {messages.length <= 1 && !isLoading && (
          <div className="flex-shrink-0 px-3 sm:px-4 py-2 bg-white border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question.text)}
                  disabled={isLoading}
                  className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-full hover:bg-slate-200 transition disabled:opacity-50 flex items-center gap-1"
                >
                  <span>{question.icon}</span>
                  <span>{question.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - Fixed at bottom */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-slate-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this product..."
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50 text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center mt-2">
            <Link 
              href="/ai-assistant"
              className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
            >
              Open full assistant
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductAIChat

