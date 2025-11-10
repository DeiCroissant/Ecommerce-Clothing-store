const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getPendingOrdersCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/count/pending`);
    if (!response.ok) {
      throw new Error('Không thể lấy số đơn hàng chờ xử lý');
    }
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching pending orders count:', error);
    return 0;
  }
};

export async function getAllOrders(params = {}) {
  try {
    const { status, page = 1, limit = 20, search } = params;
    const queryParams = new URLSearchParams();
    
    if (status && status !== 'all') queryParams.append('status', status);
    if (page) queryParams.append('page', page.toString());
    if (limit) queryParams.append('limit', limit.toString());
    if (search) queryParams.append('search', search);
    
    const url = `${API_BASE_URL}/api/admin/orders?${queryParams.toString()}`;
    console.log('Fetching orders from:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Không thể lấy danh sách đơn hàng');
    }
    
    console.log('Orders API response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể cập nhật trạng thái đơn hàng');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function getPendingOrders(limit = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/orders?status=pending&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách đơn hàng chờ xử lý');
    }
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return [];
  }
}

