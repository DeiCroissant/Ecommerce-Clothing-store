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
    console.log('Fetching products from:', url)
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Products response:', data)
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
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete product')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting product:', error)
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

