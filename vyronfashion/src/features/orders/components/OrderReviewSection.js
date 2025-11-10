'use client'

import { useState, useEffect } from 'react'
import { Star, MessageSquare, Send, CheckCircle2 } from 'lucide-react'
import * as reviewAPI from '@/lib/api/reviews'
import Image from 'next/image'

function getCurrentUserId() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id || user._id || null;
  } catch {
    return null;
  }
}

function ReviewForm({ item, productId, onReviewSubmitted }) {
  const userId = getCurrentUserId()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [existingReview, setExistingReview] = useState(null)
  const [loadingReview, setLoadingReview] = useState(true)

  useEffect(() => {
    checkExistingReview()
  }, [productId, userId])

  const checkExistingReview = async () => {
    if (!productId || !userId) {
      setLoadingReview(false)
      return
    }

    try {
      const response = await reviewAPI.getProductReviews(productId)
      const userReview = response.reviews?.find(r => r.user_id === userId)
      if (userReview) {
        setExistingReview(userReview)
        setRating(userReview.rating)
        setComment(userReview.comment || '')
      }
    } catch (error) {
      console.error('Error checking existing review:', error)
    } finally {
      setLoadingReview(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!rating) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn số sao đánh giá', type: 'warning', duration: 3000 } 
        }))
      }
      return
    }

    if (!userId) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng đăng nhập', type: 'error', duration: 3000 } 
        }))
      }
      return
    }

    try {
      setSubmitting(true)
      await reviewAPI.createReview({
        product_id: productId,
        user_id: userId,
        rating: rating,
        comment: comment.trim()
      })

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Đánh giá thành công!', type: 'success', duration: 3000 } 
        }))
      }

      // Reload review
      await checkExistingReview()
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Không thể gửi đánh giá', type: 'error', duration: 3000 } 
        }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingReview) {
    return (
      <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
        <div className="animate-pulse">Đang tải...</div>
      </div>
    )
  }

  if (existingReview) {
    return (
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-3">
          <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900 mb-2">Bạn đã đánh giá sản phẩm này</p>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= existingReview.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'}
                />
              ))}
              <span className="text-sm font-medium text-green-900 ml-2">{existingReview.rating}/5</span>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-green-700">{existingReview.comment}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <div className="mb-3">
        <label className="block text-sm font-medium text-zinc-900 mb-2">
          Đánh giá của bạn
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={
                  star <= (hoveredRating || rating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-zinc-300'
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm font-medium text-zinc-700 ml-2">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor={`comment-${productId}`} className="block text-sm font-medium text-zinc-900 mb-2">
          Bình luận (tùy chọn)
        </label>
        <textarea
          id={`comment-${productId}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
        />
        <p className="text-xs text-zinc-500 mt-1 text-right">
          {comment.length}/2000
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting || !rating}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-sm"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span>Đang gửi...</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Gửi đánh giá</span>
          </>
        )}
      </button>
    </form>
  )
}

export function OrderReviewSection({ order }) {
  // Chỉ hiển thị khi đơn hàng đã giao thành công
  const canReview = order?.status === 'delivered' || order?.status === 'completed'

  if (!canReview) {
    return null
  }

  return (
    <div className="mt-6 pt-6 border-t-2 border-zinc-200">
      <div className="flex items-center gap-2 mb-5">
        <Star size={20} className="text-amber-500 fill-amber-500" />
        <h3 className="text-lg font-bold text-zinc-900">Đánh giá sản phẩm</h3>
      </div>
      <p className="text-sm text-zinc-600 mb-5">
        Cảm ơn bạn đã mua sắm! Hãy chia sẻ trải nghiệm của bạn về các sản phẩm trong đơn hàng này.
      </p>

      <div className="space-y-6">
        {order.items?.map((item) => (
          <div key={item.id || item.product_id} className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized={item.image.startsWith('data:image/')}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MessageSquare size={24} className="text-zinc-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-zinc-900 mb-1">{item.name}</h4>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  {item.variant_color && <span>Màu: {item.variant_color}</span>}
                  {item.variant_size && <span>Size: {item.variant_size}</span>}
                  <span>Số lượng: {item.quantity}</span>
                </div>
              </div>
            </div>
            <ReviewForm 
              item={item} 
              productId={item.id || item.product_id}
              onReviewSubmitted={() => {
                // Refresh nếu cần
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

