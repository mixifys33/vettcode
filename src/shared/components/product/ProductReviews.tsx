"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Star, ThumbsUp, CheckCircle, X, Camera } from "lucide-react"
import useUser from "@/hooks/useUser"

interface Review {
  id: string
  userId: string
  userName?: string
  userAvatar?: string
  rating: number
  title?: string
  review?: string
  images?: string[]
  isVerified: boolean
  helpful: number
  createdAt: string
}

interface ReviewStats {
  average: number
  total: number
  distribution: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
}

interface ProductReviewsProps {
  productId: string
  productTitle: string
}

const StarRating = ({ 
  rating, 
  size = "md", 
  interactive = false, 
  onRate 
}: { 
  rating: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRate?: (rating: number) => void
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const sizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" }
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`${sizes[size]} ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            } transition`}
          />
        </button>
      ))}
    </div>
  )
}

const ProductReviews = ({ productId, productTitle }: ProductReviewsProps) => {
  const { user } = useUser()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [userOrder, setUserOrder] = useState<any>(null)
  
  // Review form state
  const [newRating, setNewRating] = useState(0)
  const [newTitle, setNewTitle] = useState("")
  const [newReview, setNewReview] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
    if (user?.id) {
      checkCanReview()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, user?.id])

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?productId=${productId}`)
      const data = await response.json()
      if (data.success) {
        setReviews(data.reviews || [])
        setStats(data.stats || { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } })
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const checkCanReview = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/api/check-can-review?userId=${user?.id}&productId=${productId}`
      )
      const data = await response.json()
      setCanReview(data.canReview || false)
      setUserOrder(data.order || null)
    } catch (error) {
      setCanReview(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !userOrder?.id || newRating === 0) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          userId: user.id,
          orderId: userOrder.id,
          rating: newRating,
          title: newTitle,
          review: newReview,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setShowWriteReview(false)
        setNewRating(0)
        setNewTitle("")
        setNewReview("")
        fetchReviews()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const getPercentage = (count: number) => {
    if (stats.total === 0) return 0
    return Math.round((count / stats.total) * 100)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            Customer Reviews
          </h2>
          {canReview && !showWriteReview && (
            <button
              onClick={() => setShowWriteReview(true)}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">
                {stats.average.toFixed(1)}
              </div>
              <StarRating rating={Math.round(stats.average)} size="md" />
              <p className="text-sm text-gray-500 mt-1">
                {stats.total} {stats.total === 1 ? "review" : "reviews"}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-12">{star} star</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${getPercentage(stats.distribution[star as keyof typeof stats.distribution] || 0)}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-10">
                  {getPercentage(stats.distribution[star as keyof typeof stats.distribution] || 0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Write Your Review</h3>
            <button
              onClick={() => setShowWriteReview(false)}
              className="p-1 hover:bg-blue-100 rounded-full transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <StarRating
                rating={newRating}
                size="lg"
                interactive
                onRate={setNewRating}
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Sum up your experience"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={newRating === 0 || submitting}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowWriteReview(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="divide-y divide-gray-100">
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Reviews Yet</h3>
            <p className="text-gray-500">
              {canReview 
                ? "Be the first to review this product!"
                : "Purchase this product to leave a review."}
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {review.userAvatar ? (
                    <Image
                      src={review.userAvatar}
                      alt={review.userName || "User"}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {(review.userName || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {review.userName || "Anonymous"}
                    </span>
                    {review.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  )}

                  {review.review && (
                    <p className="text-gray-600 text-sm leading-relaxed">{review.review}</p>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image src={img} alt={`Review image ${idx + 1}`} fill sizes="64px" className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful */}
                  <div className="flex items-center gap-4 mt-3">
                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition">
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Not Logged In / Not Purchased Message */}
      {!user && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-gray-600">
            <a href="/sign-in" className="text-blue-600 hover:underline font-medium">
              Sign in
            </a>{" "}
            to write a review after purchasing this product.
          </p>
        </div>
      )}

      {user && !canReview && reviews.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-gray-600">
            Purchase this product to leave a review.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProductReviews

