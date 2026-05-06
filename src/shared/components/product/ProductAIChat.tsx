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

${isFree ? `✨ Great news! This application is **FREE** to access!\n` : `💰 **Price**: ${currency} ${(price || 0).toLocaleString()}\n`}
- **Category**: ${productInfo?.appCategory || productInfo?.category || "Application"}
- **Status**: ✅ Production-Ready & Verified

Ask me anything about features, tech stack, use cases, security, or implementation advice!`,
        timestamp: new Date()
      }])
    }
  }, [isOpen, productInfo])

  const suggestedQuestions = [
    { text: "What are the key features?" },
    { text: "What tech stack is used?" },
    { text: "Is it production ready?" },
    { text: "How secure is it?" },
    { text: "How do I set it up?" },
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
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
      <div className={`bg-white dark:bg-[#212121] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 ${
        isFullscreen 
          ? 'w-full h-full rounded-none' 
          : 'w-full max-w-4xl h-[90vh] sm:h-[85vh] max-h-[800px] rounded-xl'
      }`}>
        {/* Header - Minimal ChatGPT Style */}
        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {productInfo?.appName || productInfo?.title || "Application Assistant"}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages - Scrollable */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 bg-white dark:bg-[#212121]"
        >
          {messages.map((message) => (
            <div key={message.id} className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] sm:max-w-[80%] ${message.role === "user" ? "order-first" : ""}`}>
                  <div className={`px-4 py-3 rounded-2xl transition-all duration-200 ${
                    message.role === "user"
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                      : message.isError
                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                      : "bg-slate-100 dark:bg-[#2f2f2f] text-slate-900 dark:text-slate-100"
                  }`}>
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {message.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none
                        prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                        prose-headings:font-semibold prose-headings:mb-2
                        prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                        prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-2
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:break-words
                        prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-semibold
                        prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-purple-50 dark:prose-code:bg-purple-900/20 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-xs prose-code:break-words
                        prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:p-3 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-xs
                        prose-ul:list-disc prose-ul:ml-4 prose-ul:space-y-1
                        prose-ol:list-decimal prose-ol:ml-4 prose-ol:space-y-1
                        prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:leading-relaxed
                        prose-blockquote:border-l-2 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
                        prose-img:rounded-lg prose-img:max-w-full
                        prose-hr:border-slate-200 dark:prose-hr:border-slate-700
                        prose-table:text-xs
                        prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:text-left
                        prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700 prose-td:p-2
                      ">
                        <MarkdownRenderer content={message.content} />
                      </div>
                    )}
                    
                    {message.usedWebSearch && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <Globe className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Web search used</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Footer with Actions */}
                  <div className={`flex items-center gap-2 mt-1.5 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
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
                  <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Similar Applications */}
              {message.similarProducts && message.similarProducts.length > 0 && (
                <div className="ml-10 mr-2 mt-2">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" />
                    Similar Applications:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {message.similarProducts.slice(0, 4).map(product => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        className="group p-2 bg-white dark:bg-[#2f2f2f] rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all"
                      >
                        {product.image && (
                          <div className="w-full h-20 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden mb-1.5">
                            <Image 
                              src={product.image} 
                              alt={product.title}
                              width={200}
                              height={80}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate mb-1">{product.title}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                            {product.price === 0 ? 'FREE' : `${product.currency || 'USD'} ${(product.price || 0).toLocaleString()}`}
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
          
          {/* Loading Animation */}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-100 dark:bg-[#2f2f2f] px-4 py-3 rounded-2xl min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <LoadingIcon className={`w-4 h-4 ${currentLoadingState.color} animate-spin`} />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 animate-pulse">
                    {currentLoadingState.text}
                  </span>
                </div>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions - Fixed */}
        {messages.length <= 1 && !isLoading && (
          <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 bg-white dark:bg-[#212121] border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(question.text)}
                  disabled={isLoading}
                  className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 border border-slate-200 dark:border-slate-700"
                >
                  {question.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - ChatGPT Style */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-white dark:bg-[#212121] border-t border-slate-200 dark:border-slate-700">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-[#2f2f2f] rounded-2xl border border-slate-200 dark:border-slate-600 focus-within:border-slate-300 dark:focus-within:border-slate-500 transition-colors shadow-sm">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message VettCode AI..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none disabled:cursor-not-allowed text-sm placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="m-1.5 p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductAIChat

