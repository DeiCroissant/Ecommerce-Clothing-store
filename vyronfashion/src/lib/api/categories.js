/**
 * Category API Service
 * Gọi API backend để quản lý categories
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Lấy danh sách danh mục
 * @param {Object} params - Query parameters
 * @param {string|null} params.parent_id - Lấy danh mục con (null = danh mục chính)
 * @param {string} params.status - Lọc theo trạng thái (active/inactive)
 */
export async function getCategories(params = {}) {
  try {
    const queryParams = new URLSearchParams()
    // Nếu parent_id được chỉ định (có thể là null hoặc string)
    if (params.parent_id !== undefined) {
      if (params.parent_id === null) {
        // Gửi "null" như string để backend hiểu là lấy danh mục chính
        queryParams.append('parent_id', 'null')
      } else if (params.parent_id) {
        queryParams.append('parent_id', params.parent_id)
      }
    }
    if (params.status) {
      queryParams.append('status', params.status)
    }
    
    const url = `${API_BASE_URL}/api/categories${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    console.log('Fetching categories from:', url)
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error:', errorText)
      throw new Error(`HTTP error! status: ${response.status}, ${errorText}`)
    }
    
    const data = await response.json()
    console.log('Categories response:', data)
    return data.categories || []
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

/**
 * Lấy một danh mục theo ID
 */
export async function getCategoryById(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

/**
 * Tạo danh mục mới
 */
export async function createCategory(categoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create category')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

/**
 * Cập nhật danh mục
 */
export async function updateCategory(categoryId, categoryData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update category')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

/**
 * Xóa danh mục
 */
export async function deleteCategory(categoryId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete category')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

/**
 * Lấy danh mục chính (parent_id = null)
 */
export async function getMainCategories() {
  return getCategories({ parent_id: null, status: 'active' })
}

/**
 * Lấy danh mục con theo parent_id
 */
export async function getSubCategories(parentId) {
  if (!parentId) return []
  return getCategories({ parent_id: parentId, status: 'active' })
}

