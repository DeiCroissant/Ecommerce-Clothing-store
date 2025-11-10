/**
 * API service for addresses
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get all addresses for a user
 */
export async function getUserAddresses(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/addresses/user/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể tải danh sách địa chỉ');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
}

/**
 * Create a new address
 */
export async function createAddress(addressData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể tạo địa chỉ');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating address:', error);
    throw error;
  }
}

/**
 * Update an existing address
 */
export async function updateAddress(addressId, addressData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/addresses/${addressId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể cập nhật địa chỉ');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

/**
 * Delete an address
 */
export async function deleteAddress(addressId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/addresses/${addressId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể xóa địa chỉ');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}

