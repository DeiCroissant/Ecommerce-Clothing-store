/**
 * Reviews API Service
 * Gọi API backend để quản lý reviews/ratings
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Tạo đánh giá mới
 */
export async function createReview(reviewData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reviewData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create review')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating review:', error)
    throw error
  }
}

/**
 * Lấy danh sách đánh giá của sản phẩm
 */
export async function getProductReviews(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reviews/product/${productId}`)
    
    if (!response.ok) {
      if (response.status === 404) return { reviews: [], total: 0, average_rating: 0, rating_distribution: {} }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return { reviews: [], total: 0, average_rating: 0, rating_distribution: {} }
  }
}

