'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { formatCurrency } from '@/lib/formatCurrency'
import { checkUserOrderedProduct } from '@/lib/api/orders'

export default function ProductReviews({ product, reviews = [], loading = false, onSubmit }) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasOrdered, setHasOrdered] = useState(false)
  const [checkingOrder, setCheckingOrder] = useState(true)

  // Lấy user ID từ localStorage
  const getCurrentUserId = () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          return user.id || user._id
        } catch (e) {
          return null
        }
      }
    }
    return null
  }

  // Kiểm tra xem user đã mua sản phẩm chưa
  useEffect(() => {
    const checkOrder = async () => {
      const userId = getCurrentUserId()
      if (!userId || !product?.id) {
        setCheckingOrder(false)
        return
      }

      try {
        const result = await checkUserOrderedProduct(userId, product.id)
        setHasOrdered(result.has_ordered || false)
      } catch (error) {
        console.error('Error checking order:', error)
        setHasOrdered(false)
      } finally {
        setCheckingOrder(false)
      }
    }

    checkOrder()
  }, [product?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const userId = getCurrentUserId()
    if (!userId) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng đăng nhập để đánh giá sản phẩm', type: 'warning', duration: 3000 } 
        }));
      }
      return
    }

    if (rating === 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Vui lòng chọn số sao đánh giá', type: 'warning', duration: 3000 } 
        }));
      }
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        product_id: product.id,
        user_id: userId,
        rating: rating,
        comment: comment.trim()
      })
      
      // Reset form
      setRating(0)
      setComment('')
      setShowForm(false)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Cảm ơn bạn đã đánh giá sản phẩm!', type: 'success', duration: 3000 } 
        }));
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: error.message || 'Có lỗi xảy ra khi gửi đánh giá', type: 'error', duration: 3000 } 
        }));
      }
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = product.rating?.average || 0
  const reviewCount = product.rating?.count || reviews.length || 0

  return (
    <div>
      <h2 id="reviews" className="text-2xl font-bold text-gray-900 mb-6">
        Đánh giá sản phẩm ({reviewCount})
      </h2>

      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {reviewCount} đánh giá
            </div>
          </div>
          
          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(r => r.rating === star).length
              const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0
              
              return (
                <div key={star} className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium w-12 whitespace-nowrap">{star} sao</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {checkingOrder ? (
        <div className="mb-6 text-center text-gray-500">Đang kiểm tra...</div>
      ) : !showForm ? (
        <div className="mb-6">
          {!getCurrentUserId() ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">Vui lòng đăng nhập để đánh giá sản phẩm</p>
            </div>
          ) : !hasOrdered ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700">
                Chỉ khách hàng đã mua và thanh toán thành công mới có thể đánh giá sản phẩm này.
              </p>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Viết đánh giá
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
          
          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600">
                  {rating} {rating === 1 ? 'sao' : 'sao'}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Bình luận
            </label>
            <textarea
              id="comment"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              maxLength={2000}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {comment.length}/2000 ký tự
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setRating(0)
                setComment('')
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải đánh giá...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                  {review.user_avatar ? (
                    <img
                      src={review.user_avatar}
                      alt={review.user_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    review.user_name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

