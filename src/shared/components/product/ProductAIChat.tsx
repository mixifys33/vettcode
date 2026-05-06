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
  Minimize2,
  Clock,
  ShoppingCart,
  Package,
  Star,
  Code,
  Database,
  Cpu,
  CheckCircle2,
  FileSearch,
  Brain,
  Zap
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
  currency?: string
  image: string
  rating: number
}

interface ProductAIChatProps {
  productInfo: any
  isOpen: boolean
  onClose: () => void
  onAddToCart?: (product: any) => void
}

// Loading states with icons and messages
const LOADING_STATES = [
  { icon: FileSearch, text: "Reading your question...", color: "text-blue-500" },
  { icon: Database, text: "Analyzing application data...", color: "text-purple-500" },
  { icon: Code, text: "Reviewing tech stack...", color: "text-green-500" },
  { icon: CheckCircle2, text: "Checking verification status...", color: "text-cyan-500" },
  { icon: Cpu, text: "Processing requirements...", color: "text-orange-500" },
  { icon: Brain, text: "Generating insights...", color: "text-pink-500" },
  { icon: Zap, text: "Preparing response...", color: "text-yellow-500" },
  { icon: Sparkles, text: "Finalizing answer...", color: "text-indigo-500" },
];

const ProductAIChat = ({ productInfo, isOpen, onClose, onAddToCart }: ProductAIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStateIndex, setLoadingStateIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
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

  // Animate loading states
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingStateIndex((prev) => (prev + 1) % LOADING_STATES.length)
      }, 1200) // Change every 1.2 seconds
      return () => clearInterval(interval)
    } else {
      setLoadingStateIndex(0)
    }
  }, [isLoading])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && messages.length === 0 && productInfo) {
      const isFree = productInfo.isFree || productInfo.price === 0 || productInfo.sale_price === 0;
      const price = productInfo.price || productInfo.sale_price || 0;
      const currency = productInfo.currency || "USD";
      
      setMessages([{
        id: generateId(),
        role: "assistant",
        content: `Hi! I'm VettCode AI, your application assistant 🤖

I'm here to help you with **${productInfo?.title || productInfo?.appName || "this application"}**

${isFree ? `✨ Great news! This application is **FREE** to access!\n` : `💰 **Price**: ${currency} ${price.toLocaleString()}\n`}
- **Category**: ${productInfo?.appCategory || productInfo?.category || "Application"}
- **Status**: ✅ Production-Ready & Verified

Ask me anything about features, tech stack, use cases, security, or implementation advice!`,
        timestamp: new Date()
      }])
    }
  }, [isOpen, productInfo])

  const suggestedQuestions = [
    { text: "Key features?", icon: "✨" },
    { text: "Tech stack used?", icon: "⚙️" },
    { text: "Production ready?", icon: "🚀" },
    { text: "Security verified?", icon: "🔒" },
    { text: "Setup guide?", icon: "📖" },
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

  const currentLoadingState = LOADING_STATES[loadingStateIndex]
  const LoadingIcon = currentLoadingState.icon

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-2 sm:p-4 transition-all duration-300 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-700 ${
        isFullscreen 
          ? 'w-full h-full rounded-none' 
          : 'w-full max-w-4xl h-[95vh] max-h-[900px]'
      }`}>
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-lg sm:text-xl">VettCode AI Assistant</h3>
                <p className="text-xs sm:text-sm text-purple-100 truncate">
                  {productInfo?.appName || productInfo?.title || "Application Expert"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Quick Access/Download */}
          {!productInfo?.isFree && productInfo?.price > 0 && onAddToCart && (
            <button
              onClick={handleAddToCart}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <ShoppingCart className="w-4 h-4" />
              Get Application - {productInfo.currency || 'USD'} {(productInfo.price || productInfo.sale_price)?.toLocaleString()}
            </button>
          )}
          {productInfo?.isFree && onAddToCart && (
            <button
              onClick={handleAddToCart}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500/90 hover:bg-green-500 backdrop-blur-sm rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <Package className="w-4 h-4" />
              Get Free Application
            </button>
          )}
        </div>

        {/* Messages - Scrollable */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800"
          style={{ maxHeight: isFullscreen ? 'calc(100vh - 280px)' : 'calc(85vh - 280px)' }}
        >
          {messages.map((message) => (
            <div key={message.id} className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`flex gap-3 sm:gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] ${message.role === "user" ? "order-first" : ""}`}>
                  <div className={`p-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-br-sm"
                      : message.isError
                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-2 border-red-200 dark:border-red-800 rounded-bl-sm"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-sm"
                  }`}>
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed font-medium">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                        prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                        prose-headings:font-bold prose-headings:mb-3
                        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
                        prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-3
                        prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
                        prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-bold
                        prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-sm
                        prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:p-4 prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:border prose-pre:border-slate-700
                        prose-ul:list-disc prose-ul:ml-4 prose-ul:space-y-1.5
                        prose-ol:list-decimal prose-ol:ml-4 prose-ol:space-y-1.5
                        prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:leading-relaxed
                        prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
                        prose-img:rounded-lg prose-img:shadow-md
                        prose-hr:border-slate-200 dark:prose-hr:border-slate-700
                        prose-table:border-collapse prose-table:w-full
                        prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:text-left prose-th:font-semibold
                        prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:p-2
                      ">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    )}
                    
                    {message.usedWebSearch && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Live web data used</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Footer with Actions */}
                  <div className={`flex items-center gap-3 mt-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
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
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
              </div>
              
              {/* Similar Applications */}
              {message.similarProducts && message.similarProducts.length > 0 && (
                <div className="ml-10 sm:ml-14 mr-2 mt-3">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Similar Applications You Might Like:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {message.similarProducts.slice(0, 4).map(product => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg transition-all duration-200 hover:scale-105"
                      >
                        {product.image && (
                          <div className="w-full h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg overflow-hidden mb-2 shadow-sm">
                            <Image 
                              src={product.image} 
                              alt={product.title}
                              width={200}
                              height={96}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate mb-1.5">{product.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-bold">
                            {product.price === 0 ? 'FREE' : `${product.currency || 'USD'} ${product.price?.toLocaleString()}`}
                          </p>
                          {product.rating > 0 && (
                            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-0.5" />
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
          
          {/* Enhanced Loading Animation */}
          {isLoading && (
            <div className="flex gap-3 sm:gap-4 justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-sm shadow-lg border border-slate-200 dark:border-slate-700 min-w-[280px]">
                <div className="flex items-center gap-3 mb-3">
                  <LoadingIcon className={`w-5 h-5 ${currentLoadingState.color} animate-spin`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 animate-pulse">
                    {currentLoadingState.text}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Fixed */}
        {messages.length <= 1 && !isLoading && (
          <div className="flex-shrink-0 px-4 sm:px-6 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question.text)}
                  disabled={isLoading}
                  className="text-xs bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-full hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/40 dark:hover:to-indigo-900/40 transition-all duration-200 disabled:opacity-50 flex items-center gap-1.5 font-medium border border-purple-200 dark:border-purple-800 hover:scale-105 hover:shadow-md"
                >
                  <span>{question.icon}</span>
                  <span>{question.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 sm:p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-2xl">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this application..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-sm sm:text-base transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by VettCode AI • Production-ready insights
            </p>
            <Link 
              href="/ai-assistant"
              className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
            >
              Full AI Assistant
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductAIChat

