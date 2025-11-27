/**
 * Product API Service
 * Gọi API backend để quản lý products
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Lấy danh sách sản phẩm
 * @param {Object} params - Query parameters
 * @param {string} params.category_slug - Lọc theo category slug
 * @param {string} params.status - Lọc theo trạng thái (active/inactive)
 * @param {string} params.search - Tìm kiếm theo tên/SKU/slug
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.limit - Số lượng mỗi trang
 * @param {string} params.sort - Sắp xếp (newest, price_asc, price_desc, etc.)
 */
export async function getProducts(params = {}) {
  try {
    const queryParams = new URLSearchParams()
    if (params.category_slug) {
      queryParams.append('category_slug', params.category_slug)
    }
    if (params.status) {
      queryParams.append('status', params.status)
    }
    if (params.search) {
      queryParams.append('search', params.search)
    }
    if (params.page) {
      queryParams.append('page', params.page)
    }
    if (params.limit) {
      queryParams.append('limit', params.limit)
    }
    if (params.sort) {
      queryParams.append('sort', params.sort)
    }
    
    const url = `${API_BASE_URL}/api/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], total: 0, page: 1, limit: 24, totalPages: 0 }
  }
}

/**
 * Lấy một sản phẩm theo ID
 */
export async function getProductById(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Tạo sản phẩm mới
 */
export async function createProduct(productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create product')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

/**
 * Cập nhật sản phẩm
 */
export async function updateProduct(productId, productData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update product')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

/**
 * Xóa sản phẩm
 */
export async function deleteProduct(productId) {
  try {
    console.log('🗑️ Deleting product with ID:', productId, 'Type:', typeof productId)
    const url = `${API_BASE_URL}/api/products/${productId}`
    console.log('🗑️ DELETE URL:', url)
    
    const response = await fetch(url, {
      method: 'DELETE',
    })
    
    console.log('🗑️ Delete response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('🗑️ Delete error response:', errorText)
      let error
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { detail: errorText }
      }
      throw new Error(error.detail || 'Failed to delete product')
    }
    
    const result = await response.json()
    console.log('✅ Delete successful:', result)
    return result
  } catch (error) {
    console.error('❌ Error deleting product:', error)
    throw error
  }
}

/**
 * Lấy sản phẩm theo category slug
 */
export async function getProductsByCategory(categorySlug, params = {}) {
  return getProducts({ category_slug: categorySlug, ...params })
}

/**
 * Lấy sản phẩm theo slug
 */
export async function getProductBySlug(slug) {
  try {
    // Gọi API với slug parameter
    const queryParams = new URLSearchParams({ slug: slug, limit: '1' })
    const url = `${API_BASE_URL}/api/products?${queryParams.toString()}`
    
    console.log('Fetching product by slug:', slug, 'URL:', url)
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('API Error:', response.status)
      return null
    }
    
    const data = await response.json()
    console.log('Product by slug response:', data)
    
    if (data.products && data.products.length > 0) {
      return data.products[0]
    }
    
    return null
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

/**
 * Lấy sản phẩm gợi ý tương tự (Content-Based Filtering)
 * @param {string} productId - ID sản phẩm
 * @param {number} limit - Số lượng sản phẩm gợi ý (default: 8)
 * @returns {Promise<Object>} - Danh sách sản phẩm tương tự
 */
export async function getProductRecommendations(productId, limit = 8) {
  try {
    const url = `${API_BASE_URL}/api/products/${productId}/recommendations?limit=${limit}`
    console.log('🧠 Fetching recommendations for product:', productId)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn('Product not found for recommendations')
        return { recommendations: [], total: 0 }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Recommendations response:', data)
    return data
  } catch (error) {
    console.error('❌ Error fetching recommendations:', error)
    return { recommendations: [], total: 0 }
  }
}

