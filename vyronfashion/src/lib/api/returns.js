/**
 * Returns API Service
 * Gọi API backend để quản lý yêu cầu trả hàng và hoàn tiền
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Lấy danh sách yêu cầu trả hàng của người dùng
 */
export async function getUserReturns(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/returns?user_id=${userId}`)
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Không thể lấy danh sách yêu cầu trả hàng')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching returns:', error)
    throw error
  }
}

/**
 * Lấy thông tin chi tiết một yêu cầu trả hàng
 */
export async function getReturn(returnId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/returns/${returnId}`)
    
    if (!response.ok) {
      if (response.status === 404) return null
      const error = await response.json()
      throw new Error(error.detail || 'Không thể lấy thông tin yêu cầu trả hàng')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching return:', error)
    throw error
  }
}

/**
 * Tạo yêu cầu trả hàng mới
 */
export async function createReturn(returnData, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/returns?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(returnData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Không thể tạo yêu cầu trả hàng')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating return:', error)
    throw error
  }
}

/**
 * Cập nhật yêu cầu trả hàng (chủ yếu cho admin)
 */
export async function updateReturn(returnId, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/returns/${returnId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Không thể cập nhật yêu cầu trả hàng')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating return:', error)
    throw error
  }
}

