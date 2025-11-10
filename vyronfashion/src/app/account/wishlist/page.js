'use client'

import { useState, useEffect } from 'react'
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/account'
import { WishlistGrid } from '@/features/wishlist/components/WishlistGrid'
import { WishlistStats } from '@/features/wishlist/components/WishlistStats'
import { Heart } from 'lucide-react'
import * as wishlistAPI from '@/lib/api/wishlist'
import * as productAPI from '@/lib/api/products'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const userId = getCurrentUserId()
      
      if (!userId) {
        setWishlist([])
        setLoading(false)
        return
      }

      // Lấy danh sách sản phẩm trong wishlist
      const response = await wishlistAPI.getWishlistProducts(userId)
      setWishlist(response.products || [])
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setWishlist([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (productId) => {
    const userId = getCurrentUserId()
    if (!userId) return

    try {
      // Gọi API để xóa khỏi wishlist
      await wishlistAPI.toggleWishlist(productId, userId)
      
      // Reload wishlist
      await fetchWishlist()
    } catch (error) {
      console.error('Error removing item from wishlist:', error)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('showToast', { 
          detail: { message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi yêu thích', type: 'error', duration: 3000 } 
        }));
      }
    }
  }

  if (loading) {
    return (
      <div className="wishlist-page">
        <PageHeader title="Danh sách yêu thích" />
        <LoadingSkeleton type="card" count={4} />
      </div>
    )
  }

  return (
    <div className="wishlist-page">
      <PageHeader
        title="Danh sách yêu thích"
        description="Các sản phẩm bạn đã lưu"
      />

      {wishlist.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Danh sách yêu thích trống"
          description="Bạn chưa có sản phẩm yêu thích nào. Hãy khám phá và thêm sản phẩm vào danh sách!"
          actionLabel="Khám phá sản phẩm"
          actionHref="/"
        />
      ) : (
        <>
          <WishlistStats items={wishlist} />
          <WishlistGrid items={wishlist} onRemove={handleRemoveItem} />
        </>
      )}

      <style jsx>{`
        .wishlist-page {
          max-width: 1400px;
        }
      `}</style>
    </div>
  )
}
