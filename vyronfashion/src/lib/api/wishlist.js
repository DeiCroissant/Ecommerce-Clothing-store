/**
 * Wishlist API Service
 * Gọi API backend để quản lý wishlist
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Thêm hoặc xóa sản phẩm khỏi wishlist
 */
export async function toggleWishlist(productId, userId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/wishlist/toggle?product_id=${productId}&user_id=${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to toggle wishlist')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    throw error
  }
}

/**
 * Lấy danh sách wishlist của user
 */
export async function getWishlist(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}`)
    
    if (!response.ok) {
      if (response.status === 404) return { wishlist: [], total: 0 }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return { wishlist: [], total: 0 }
  }
}

/**
 * Lấy danh sách sản phẩm trong wishlist
 */
export async function getWishlistProducts(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/wishlist/${userId}/products`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching wishlist products:', error)
    return { products: [], total: 0 }
  }
}

