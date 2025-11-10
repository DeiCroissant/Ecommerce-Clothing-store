const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getAllReturns(params = {}) {
  try {
    const { status } = params;
    const queryParams = new URLSearchParams();
    
    if (status && status !== 'all') queryParams.append('status', status);
    
    const url = `${API_BASE_URL}/api/admin/returns${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Không thể lấy danh sách yêu cầu trả hàng');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching returns:', error);
    throw error;
  }
}

export async function updateReturnStatus(returnId, status, adminNote = null, refundAmount = null, refundDate = null) {
  try {
    const updateData = { status };
    if (adminNote !== null) updateData.admin_note = adminNote;
    if (refundAmount !== null) updateData.refund_amount = refundAmount;
    if (refundDate !== null) updateData.refund_date = refundDate;
    
    const response = await fetch(`${API_BASE_URL}/api/returns/${returnId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể cập nhật trạng thái yêu cầu trả hàng');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating return status:', error);
    throw error;
  }
}

