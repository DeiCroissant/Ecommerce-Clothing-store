const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function checkUserOrderedProduct(userId, productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/check/${userId}/${productId}`);
    if (!response.ok) {
      throw new Error('Không thể kiểm tra đơn hàng');
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking user order:', error);
    throw error;
  }
}

export async function getUserOrders(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`);
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách đơn hàng');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể tạo đơn hàng');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getOrderById(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Không tìm thấy đơn hàng');
      }
      const error = await response.json();
      throw new Error(error.detail || 'Không thể lấy chi tiết đơn hàng');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

