const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function addToCart(userId, productId, color, size, quantity = 1) {
  try {
    const params = new URLSearchParams({
      user_id: userId,
      product_id: productId,
      quantity: quantity.toString(),
    });
    
    if (color) params.append('color', color);
    if (size) params.append('size', size);
    
    const response = await fetch(`${API_BASE_URL}/api/cart/add?${params.toString()}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể thêm vào giỏ hàng');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

export async function getCart(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/${userId}`);
    if (!response.ok) {
      throw new Error('Không thể lấy giỏ hàng');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
}

export async function updateCartItemQuantity(userId, itemIndex, quantity) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/${userId}/${itemIndex}?quantity=${quantity}`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể cập nhật số lượng');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
}

export async function removeCartItem(userId, itemIndex) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cart/${userId}/${itemIndex}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể xóa khỏi giỏ hàng');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error removing cart item:', error);
    throw error;
  }
}

