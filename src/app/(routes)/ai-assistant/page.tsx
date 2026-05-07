"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Send, 
  User, 
  Globe, 
  Sparkles,
  MessageSquare,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShoppingBag,
  Search,
  Star,
  Menu,
  X,
  Package,
  HelpCircle,
  TrendingUp,
  Heart,
  ShoppingCart,
  Tag,
  Headphones,
  ImageIcon,
  Camera,
  Loader2,
  Database,
  Brain,
  Zap,
  CheckCircle,
  Code,
  Filter,
  BarChart,
  Shield,
  Cpu,
  FileSearch,
  Layers,
  GitBranch,
  Target
} from "lucide-react"
import useUser from "@/hooks/useUser"
import { useStore } from "@/store"
import MarkdownRenderer from "@/shared/components/ui/MarkdownRenderer"
import MessageActions from "@/shared/components/ui/MessageActions"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  usedWebSearch?: boolean
  productRecommendations?: ProductRecommendation[]
  action?: AIAction
  intent?: string
  isError?: boolean
}

interface ProductRecommendation {
  id: string
  title: string
  slug: string
  price: number
  regularPrice?: number
  image: string
  rating: number
  stock?: number
  brand?: string
  category?: string
}

interface AIAction {
  type: 'add_to_cart' | 'remove_from_cart' | 'update_quantity' | 'search_products' | 'compare_products' | 'get_recommendations' | 'price_alert' | 'escalate_support' | 'none'
  data?: any
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

const STORAGE_KEY = "easyai_chat_sessions"

const EasyAIPage = () => {
  const { user } = useUser()
  const addToCart = useStore((state) => state.addToCart)
  const removeFromCart = useStore((state) => state.removeFromCart)
  const addToWishlist = useStore((state) => state.addToWishlist)
  const removeFromWishlist = useStore((state) => state.removeFromWishlist)
  const cart = useStore((state) => state.cart)
  const wishlist = useStore((state) => state.wishlist)
  
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [actionNotification, setActionNotification] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Loading Steps - Progressive thinking animation
  const loadingSteps = [
    { icon: <FileSearch className="w-4 h-4" />, text: "Reading your query", color: "text-blue-400" },
    { icon: <Brain className="w-4 h-4" />, text: "Understanding intent", color: "text-purple-400" },
    { icon: <Database className="w-4 h-4" />, text: "Connecting to database", color: "text-cyan-400" },
    { icon: <Search className="w-4 h-4" />, text: "Searching applications", color: "text-green-400" },
    { icon: <Filter className="w-4 h-4" />, text: "Filtering results", color: "text-yellow-400" },
    { icon: <BarChart className="w-4 h-4" />, text: "Analyzing relevance", color: "text-pink-400" },
    { icon: <Code className="w-4 h-4" />, text: "Checking tech stacks", color: "text-indigo-400" },
    { icon: <Shield className="w-4 h-4" />, text: "Verifying quality", color: "text-emerald-400" },
    { icon: <Layers className="w-4 h-4" />, text: "Comparing features", color: "text-orange-400" },
    { icon: <Target className="w-4 h-4" />, text: "Matching preferences", color: "text-rose-400" },
    { icon: <GitBranch className="w-4 h-4" />, text: "Evaluating options", color: "text-teal-400" },
    { icon: <Cpu className="w-4 h-4" />, text: "Processing data", color: "text-violet-400" },
    { icon: <Zap className="w-4 h-4" />, text: "Optimizing response", color: "text-amber-400" },
    { icon: <Brain className="w-4 h-4" />, text: "Generating insights", color: "text-fuchsia-400" },
    { icon: <CheckCircle className="w-4 h-4" />, text: "Finalizing answer", color: "text-lime-400" }
  ]

  // Cycle through loading steps
  useEffect(() => {
    if (isLoading) {
      setLoadingStep(0)
      const interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingSteps.length - 1) {
            return prev + 1
          }
          return 0 // Loop back to start if still loading
        })
      }, 800) // Change step every 800ms

      return () => clearInterval(interval)
    }
  }, [isLoading])

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const loadedSessions = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }))
        setSessions(loadedSessions)
        if (loadedSessions.length > 0) {
          setActiveSessionId(loadedSessions[0].id)
        }
      } catch (e) {
        console.error("Error loading chat sessions:", e)
      }
    }
  }, [])

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
    }
  }, [sessions])

  const activeSession = sessions.find(s => s.id === activeSessionId)

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.messages, scrollToBottom])

  const generateId = () => Math.random().toString(36).substring(2, 15)

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
    setMobileSidebarOpen(false)
  }

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId)
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const clearAllSessions = () => {
    setSessions([])
    setActiveSessionId(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  // Image handling functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setActionNotification("Image must be less than 5MB")
        setTimeout(() => setActionNotification(null), 3000)
        return
      }
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearImageSelection = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploadingImage(true)
      const formData = new FormData()
      formData.append('file', file)
      
      const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || 'http://localhost:4002'
      const response = await fetch(`${CHAT_SERVICE_URL}/api/chat/upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Image upload failed:', error)
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleAddToCart = (product: any) => {
    if (!user) {
      setActionNotification("Please sign in to add items to cart")
      setTimeout(() => setActionNotification(null), 3000)
      return
    }
    const inCart = cart.some((i: any) => i.id === product.id)
    if (inCart) {
      removeFromCart(product.id, user, null, null)
      setActionNotification(`Removed "${product.title}" from cart`)
    } else {
      addToCart(
        { id: product.id, title: product.title, price: product.price, image: product.image, shopId: product.shopId || '' },
        user, null, null
      )
      setActionNotification(`Added "${product.title}" to cart!`)
    }
    setTimeout(() => setActionNotification(null), 3000)
  }

  const handleToggleWishlist = (product: any) => {
    if (!user) {
      setActionNotification("Please sign in to save items")
      setTimeout(() => setActionNotification(null), 3000)
      return
    }
    const inWishlist = wishlist.some((i: any) => i.id === product.id)
    if (inWishlist) {
      removeFromWishlist(product.id, user, null, null)
      setActionNotification(`Removed from wishlist`)
    } else {
      addToWishlist(
        { id: product.id, title: product.title, price: product.price, image: product.image, shopId: product.shopId || '' },
        user, null, null
      )
      setActionNotification(`Saved to wishlist!`)
    }
    setTimeout(() => setActionNotification(null), 3000)
  }

  const handleAction = (action: AIAction) => {
    if (!action || action.type === 'none') return
    
    switch (action.type) {
      case 'add_to_cart':
        if (action.data) {
          handleAddToCart(action.data)
        }
        break
      case 'escalate_support':
        setActionNotification("Opening support contact...")
        break
    }
  }

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim()
    // Allow sending with just an image and no text
    if (!text && !selectedImage) return
    if (isLoading) return

    // Capture and clear image immediately so UI feels responsive
    const imageFile = selectedImage
    const imageDataUrl = imagePreview
    clearImageSelection()

    let sessionId = activeSessionId
    if (!sessionId) {
      const newSession: ChatSession = {
        id: generateId(),
        title: text ? text.slice(0, 40) + (text.length > 40 ? "..." : "") : "Image search",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setSessions(prev => [newSession, ...prev])
      sessionId = newSession.id
      setActiveSessionId(sessionId)
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: text || "🖼️ Image search",
      timestamp: new Date(),
      // store preview so we can show it in the bubble
      ...(imageDataUrl ? { imagePreview: imageDataUrl } as any : {})
    }

    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const updatedMessages = [...s.messages, userMessage]
        return {
          ...s,
          messages: updatedMessages,
          title: s.messages.length === 0 ? (text || "Image search").slice(0, 40) : s.title,
          updatedAt: new Date()
        }
      }
      return s
    }))

    setInput("")
    setIsLoading(true)

    try {
      const currentSession = sessions.find(s => s.id === sessionId)
      const chatHistory = currentSession?.messages || []

      let data: any

      if (imageFile) {
        // ── Image search path ──────────────────────────────────────────────
        // Convert to base64 and send to backend image-search endpoint
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            // strip the data:image/...;base64, prefix
            resolve(result.split(',')[1])
          }
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })

        const BACKEND = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
        const res = await fetch(`${BACKEND}/api/shop-ai/image-search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            ...(text ? { message: text } : {})
          }),
        })

        if (!res.ok) throw new Error('Image search failed')
        const raw = await res.json()

        // Normalise to same shape as /api/ai-assistant response
        data = {
          success: true,
          message: raw.reply || '',
          productRecommendations: (raw.products || []).map((p: any) => ({
            id: p.id,
            title: p.name || p.title,
            slug: p.slug || p.id,
            price: p.price,
            regularPrice: p.originalPrice || p.price,
            image: p.image || '',
            rating: p.rating || 0,
            stock: p.stock || 0,
            brand: p.brand || '',
            category: p.category || '',
          })),
          suggestions: raw.suggestions || [],
        }
      } else {
        // ── Normal text chat path ──────────────────────────────────────────
        const res = await fetch("/api/ai-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            chatHistory: chatHistory.map(m => ({ role: m.role, content: m.content })),
            userId: user?.id || (user as any)?._id,
            cart: cart.map(item => ({
              id: item.id,
              title: item.title,
              price: item.price,
              quantity: item.quantity || 1
            }))
          }),
        })
        data = await res.json()
      }

      let messageContent = data.message || ""
      if (data.success && !messageContent.trim()) {
        messageContent = "I apologize, but I couldn't generate a proper response. Please try asking your question again."
      } else if (!data.success) {
        messageContent = data.message || "Sorry, I encountered an error. Please try again."
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: messageContent,
        timestamp: new Date(),
        usedWebSearch: data.usedWebSearch,
        productRecommendations: data.productRecommendations,
        action: data.action,
        intent: data.intent,
        isError: !data.success || !messageContent.trim()
      }

      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, messages: [...s.messages, assistantMessage], updatedAt: new Date() }
        }
        return s
      }))

      if (data.action && data.action.type !== 'none') {
        handleAction(data.action)
      }
    } catch (error: any) {
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, something went wrong. Please check your connection and try again.",
        timestamp: new Date(),
        isError: true
      }
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, messages: [...s.messages, errorMessage], updatedAt: new Date() }
        }
        return s
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const retryMessage = (messageId: string) => {
    if (!activeSession) return
    
    const messageIndex = activeSession.messages.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return
    
    let lastUserMessage = null
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (activeSession.messages[i].role === "user") {
        lastUserMessage = activeSession.messages[i]
        break
      }
    }
    
    if (lastUserMessage) {
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: s.messages.filter(m => m.id !== messageId) }
        }
        return s
      }))
      sendMessage(lastUserMessage.content)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestedPrompts = [
    { icon: <Search className="w-4 h-4" />, text: "Find React dashboard templates" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "What's trending in web apps?" },
    { icon: <Package className="w-4 h-4" />, text: "Compare SaaS platforms", href: "/compare" },
    { icon: <Tag className="w-4 h-4" />, text: "Best deals on APIs today" },
    { icon: <Heart className="w-4 h-4" />, text: "E-commerce starter kits" },
    { icon: <Headphones className="w-4 h-4" />, text: "Help with my purchase" },
  ]

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(date)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return "Today"
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
  }

  const getIntentBadge = (intent?: string) => {
    if (!intent) return null
    const badges: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      search_products: { color: 'bg-blue-100 text-blue-700', icon: <Search className="w-3 h-3" />, label: 'Search' },
      compare_products: { color: 'bg-purple-100 text-purple-700', icon: <Package className="w-3 h-3" />, label: 'Compare' },
      trending: { color: 'bg-orange-100 text-orange-700', icon: <TrendingUp className="w-3 h-3" />, label: 'Trending' },
      price_check: { color: 'bg-green-100 text-green-700', icon: <Tag className="w-3 h-3" />, label: 'Deals' },
      customer_support: { color: 'bg-cyan-100 text-cyan-700', icon: <Headphones className="w-3 h-3" />, label: 'Support' },
      add_to_cart: { color: 'bg-emerald-100 text-emerald-700', icon: <ShoppingCart className="w-3 h-3" />, label: 'Cart' }
    }
    const badge = badges[intent]
    if (!badge) return null
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Code pattern overlay */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)`,
        backgroundSize: "40px 40px"
      }} />
      
      {/* Action Notification */}
      {actionNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-top border border-purple-400/30">
          {actionNotification}
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[101] lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-[102]
        w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${!sidebarOpen && 'lg:w-0 lg:overflow-hidden'}
      `}>
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">VettCode AI</h1>
                <p className="text-xs text-slate-400">Developer Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="flex-shrink-0 p-3">
          <button
            onClick={createNewSession}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl transition font-medium text-sm shadow-lg"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat Sessions - Scrollable */}
        <div className="flex-1 overflow-y-auto px-3 min-h-0">
          <p className="text-xs text-slate-500 px-2 py-2 font-medium sticky top-0 bg-slate-900/95">Recent</p>
          <div className="space-y-1 pb-3">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition ${
                  activeSessionId === session.id ? 'bg-slate-800/80 border border-purple-500/30' : 'hover:bg-slate-800/50'
                }`}
                onClick={() => { setActiveSessionId(session.id); setMobileSidebarOpen(false) }}
              >
                <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate text-white">{session.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(session.updatedAt)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSession(session.id) }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-3 border-t border-slate-700/50 space-y-2">
          {sessions.length > 0 && (
            <button
              onClick={clearAllSessions}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          )}
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-white">{user.name}</p>
              </div>
            </div>
          )}
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ShoppingBag className="w-4 h-4" />
            Back to Marketplace
          </Link>
          <Link 
            href="/compare" 
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <Package className="w-4 h-4" />
            Compare Apps
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header - Fixed */}
        <header className="flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-3 sm:px-4 py-2.5 flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-2 hover:bg-slate-800 rounded-lg text-slate-300"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-white text-sm sm:text-base">VettCode AI</h2>
              <p className="text-xs text-slate-400 hidden sm:block">Search, compare, discover apps</p>
            </div>
          </div>
          
          {cart.length > 0 && (
            <Link href="/cart" className="relative p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-purple-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                {cart.length}
              </span>
            </Link>
          )}
          
          <Link href="/" className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg">
            <ShoppingBag className="w-5 h-5" />
          </Link>
        </header>

        {/* Messages Area - Scrollable */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overscroll-contain">
          {!activeSession || activeSession.messages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center p-4 sm:p-6">
              <div className="max-w-xl w-full text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Welcome to <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">VettCode AI</span>
                </h1>
                <p className="text-slate-300 mb-6 text-sm sm:text-base">
                  Your intelligent assistant for discovering production-ready applications
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6">
                  {[
                    {
                      icon: <Search className="w-5 h-5" />,
                      label: "Search",
                      color: "text-purple-400",
                      hoverBorder: "hover:border-purple-500/50",
                      bgHover: "hover:bg-purple-500/10",
                      prompt: "Help me search for an application. What are you looking for?",
                    },
                    {
                      icon: <Package className="w-5 h-5" />,
                      label: "Compare",
                      color: "text-indigo-400",
                      hoverBorder: "hover:border-indigo-500/50",
                      bgHover: "hover:bg-indigo-500/10",
                      href: "/compare",
                    },
                    {
                      icon: <TrendingUp className="w-5 h-5" />,
                      label: "Trending",
                      color: "text-pink-400",
                      hoverBorder: "hover:border-pink-500/50",
                      bgHover: "hover:bg-pink-500/10",
                      prompt: "What applications are trending on VettCode right now?",
                    },
                    {
                      icon: <Headphones className="w-5 h-5" />,
                      label: "Support",
                      color: "text-cyan-400",
                      hoverBorder: "hover:border-cyan-500/50",
                      bgHover: "hover:bg-cyan-500/10",
                      prompt: "I need help with my purchase or account. Can you assist me?",
                    },
                  ].map((f, i) => (
                    f.href ? (
                      <Link
                        key={i}
                        href={f.href}
                        className={`flex flex-col items-center gap-2 p-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 ${f.hoverBorder} ${f.bgHover} hover:shadow-lg transition-all duration-200 group cursor-pointer`}
                      >
                        <div className={`${f.color} group-hover:scale-110 transition-transform`}>{f.icon}</div>
                        <span className="text-xs font-semibold text-slate-200">{f.label}</span>
                      </Link>
                    ) : (
                      <button
                        key={i}
                        onClick={() => f.prompt && sendMessage(f.prompt)}
                        disabled={isLoading}
                        className={`flex flex-col items-center gap-2 p-3 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 ${f.hoverBorder} ${f.bgHover} hover:shadow-lg transition-all duration-200 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full`}
                      >
                        <div className={`${f.color} group-hover:scale-110 transition-transform`}>{f.icon}</div>
                        <span className="text-xs font-semibold text-slate-200">{f.label}</span>
                      </button>
                    )
                  ))}
                </div>

                {/* Suggested Prompts */}
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">Try asking:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      prompt.href ? (
                        <Link
                          key={index}
                          href={prompt.href}
                          className="flex items-center gap-2 p-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/10 text-left transition text-sm"
                        >
                          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                            {prompt.icon}
                          </div>
                          <span className="text-slate-200 truncate">{prompt.text}</span>
                        </Link>
                      ) : (
                        <button
                          key={index}
                          onClick={() => sendMessage(prompt.text)}
                          disabled={isLoading}
                          className="flex items-center gap-2 p-3 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/10 text-left transition disabled:opacity-50 text-sm"
                        >
                          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0">
                            {prompt.icon}
                          </div>
                          <span className="text-slate-200 truncate">{prompt.text}</span>
                        </button>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-3xl mx-auto p-3 sm:p-4 space-y-4">
              {activeSession.messages.map((message) => (
                <div key={message.id}>
                  <div className={`flex gap-2 sm:gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm shadow-lg'
                          : message.isError
                          ? 'bg-red-500/20 border border-red-500/30 text-red-200 rounded-bl-sm'
                          : 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-100 rounded-bl-sm shadow-lg'
                      }`}>
                        {message.role === 'user' ? (
                          <div>
                            {(message as any).imagePreview && (
                              <img
                                src={(message as any).imagePreview}
                                alt="Uploaded"
                                className="h-24 w-24 object-cover rounded-lg mb-2 border border-white/20"
                              />
                            )}
                            {message.content !== '🖼️ Image search' && (
                              <p className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</p>
                            )}
                          </div>
                        ) : (
                          <MarkdownRenderer content={message.content} />
                        )}

                        {/* Intent Badge + Web Search */}
                        {message.role === 'assistant' && (message.usedWebSearch || message.intent) && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-700/50 flex-wrap">
                            {message.intent && getIntentBadge(message.intent)}
                            {message.usedWebSearch && (
                              <span className="inline-flex items-center gap-1 text-xs text-green-400 font-medium">
                                <Globe className="w-3 h-3" />
                                Live data
                              </span>
                            )}
                          </div>
                        )}

                        {/* Add to Cart Action */}
                        {message.action?.type === 'add_to_cart' && message.action.data && (
                          <button
                            onClick={() => handleAddToCart(message.action!.data)}
                            className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition text-xs shadow-lg"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Add to Cart
                          </button>
                        )}
                      </div>

                      {/* Message Footer */}
                      <div className={`flex items-center gap-2 mt-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(message.timestamp)}
                        </span>
                        {message.role === 'assistant' && (
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

                    {message.role === 'user' && (
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Product Recommendations */}
                  {message.productRecommendations && message.productRecommendations.length > 0 && (
                    <div className="mt-3 ml-10 sm:ml-12">
                      <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        Recommended:
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {message.productRecommendations.slice(0, 6).map(product => {
                          const inCart = cart.some((i: any) => i.id === product.id)
                          const inWishlist = wishlist.some((i: any) => i.id === product.id)
                          const outOfStock = product.stock !== undefined && product.stock === 0
                          return (
                            <div key={product.id} className="flex-shrink-0 w-36 bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-purple-500/50 hover:shadow-lg transition flex flex-col">
                              {/* Image */}
                              <Link href={`/product/${product.slug}`} className="relative block w-full h-24 bg-slate-700/50">
                                {product.image ? (
                                  <Image src={product.image} alt={product.title} fill className="object-cover" sizes="144px" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag className="w-6 h-6 text-slate-600" />
                                  </div>
                                )}
                                {/* Badges */}
                                {outOfStock && (
                                  <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold bg-black/60 px-1.5 py-0.5 rounded">Out of Stock</span>
                                  </span>
                                )}
                                {!outOfStock && product.stock !== undefined && product.stock < 5 && product.stock > 0 && (
                                  <span className="absolute top-1 left-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">Low stock</span>
                                )}
                                {inCart && (
                                  <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">In Cart</span>
                                )}
                                {/* Wishlist button */}
                                <button
                                  onClick={(e) => { e.preventDefault(); handleToggleWishlist(product) }}
                                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-slate-800/90 flex items-center justify-center shadow hover:scale-110 transition"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                                </button>
                              </Link>

                              {/* Info */}
                              <div className="p-2 flex-1 flex flex-col">
                                <p className="text-xs font-semibold text-white truncate leading-tight">{product.title}</p>
                                {product.brand && <p className="text-[10px] text-slate-500 truncate">{product.brand}</p>}
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-purple-400 font-bold">
                                    UGX {product.price >= 1000 ? `${(product.price / 1000).toFixed(0)}k` : product.price}
                                  </p>
                                  {product.rating > 0 && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                      {product.rating.toFixed(1)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Cart button */}
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={outOfStock}
                                className={`w-full py-1.5 text-xs font-semibold flex items-center justify-center gap-1 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                  inCart
                                    ? 'bg-purple-600 text-white hover:bg-red-500'
                                    : 'bg-slate-700/50 text-slate-200 hover:bg-purple-600 hover:text-white'
                                }`}
                              >
                                <ShoppingCart className="w-3 h-3" />
                                {inCart ? 'Remove' : outOfStock ? 'Unavailable' : 'Add to Cart'}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
                  </div>
                  <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg min-w-[280px]">
                    <div className="flex items-center gap-3">
                      {/* Animated Icon */}
                      <div className={`${loadingSteps[loadingStep].color} animate-bounce`}>
                        {loadingSteps[loadingStep].icon}
                      </div>
                      
                      {/* Step Text */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-medium animate-pulse">
                            {loadingSteps[loadingStep].text}
                          </span>
                          <div className="flex gap-1">
                            <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-800 ease-out"
                            style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                          />
                        </div>
                        
                        {/* Step Counter */}
                        <div className="mt-1 text-xs text-slate-500">
                          Step {loadingStep + 1} of {loadingSteps.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Input Area - Fixed at bottom with safe area padding */}
        <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-xl p-3 sm:p-4 pb-4 sm:pb-4">
          <div className="max-w-3xl mx-auto">
            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-3 relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Selected" 
                  className="h-20 w-20 object-cover rounded-xl border border-slate-700"
                />
                <button
                  onClick={clearImageSelection}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <div className="flex items-end gap-2 sm:gap-3">
              {/* Image Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isUploadingImage}
                className="p-2.5 sm:p-3 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-xl transition disabled:opacity-50 flex-shrink-0"
                title="Upload image"
              >
                {isUploadingImage ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ImageIcon className="w-5 h-5" />
                )}
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedImage ? "Add a message about this image..." : "Ask VettCode AI anything..."}
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-slate-800/30 text-sm"
                  style={{ minHeight: '44px', maxHeight: '100px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height = Math.min(target.scrollHeight, 100) + 'px'
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="p-2.5 sm:p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-2 text-center">
              Upload images to find similar applications • VettCode AI uses web search for current info
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EasyAIPage

