'use client'

import { useState, useEffect } from 'react'
import { PageHeader, EmptyState, LoadingSkeleton } from '@/components/account'
import { WishlistGrid } from '@/features/wishlist/components/WishlistGrid'
import { WishlistStats } from '@/features/wishlist/components/WishlistStats'
import { Heart } from 'lucide-react'
import { mockWishlist } from '@/lib/mockWishlistData'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      setTimeout(() => {
        setWishlist(mockWishlist)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching wishlist:', error)
      setLoading(false)
    }
  }

  const handleRemoveItem = (itemId) => {
    setWishlist(wishlist.filter(item => item.id !== itemId))
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
