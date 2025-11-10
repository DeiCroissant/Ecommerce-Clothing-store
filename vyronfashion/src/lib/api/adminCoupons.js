const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getAllCoupons() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Không thể lấy danh sách mã giảm giá');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
}

export async function createCoupon(couponData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(couponData),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Không thể tạo mã giảm giá');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
}

export async function updateCoupon(couponId, couponData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${couponId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(couponData),
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Không thể cập nhật mã giảm giá');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating coupon:', error);
    throw error;
  }
}

export async function deleteCoupon(couponId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/coupons/${couponId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Không thể xóa mã giảm giá');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    throw error;
  }
}

export async function validateCoupon(code, subtotal) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, subtotal }),
    });
    const data = await response.json();
    
    // API trả về success: false nếu không hợp lệ, không phải HTTP error
    return data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
}

