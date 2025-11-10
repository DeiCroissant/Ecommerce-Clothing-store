const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getAllCustomers(params = {}) {
  try {
    const { page = 1, limit = 50, search, role, is_banned } = params;
    const queryParams = new URLSearchParams();
    
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('role', role);
    if (is_banned !== undefined && is_banned !== null) queryParams.append('is_banned', is_banned.toString());
    
    const url = `${API_BASE_URL}/api/admin/customers?${queryParams.toString()}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Không thể lấy danh sách khách hàng');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

export async function banCustomer(userId, isBanned) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/${userId}/ban`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_banned: isBanned }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể cập nhật trạng thái ban');
    }
    return await response.json();
  } catch (error) {
    console.error('Error banning customer:', error);
    throw error;
  }
}

export async function updateCustomerRole(userId, role) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể cập nhật role');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating customer role:', error);
    throw error;
  }
}

export async function sendPromotionEmail(userIds, subject, content) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/customers/send-promotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_ids: userIds && userIds.length > 0 ? userIds : null,
        subject,
        content,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể gửi email khuyến mãi');
    }
    return await response.json();
  } catch (error) {
    console.error('Error sending promotion email:', error);
    throw error;
  }
}

