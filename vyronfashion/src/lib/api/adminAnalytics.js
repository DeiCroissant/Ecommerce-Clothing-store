const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getAnalytics(period = '30d') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/analytics?period=${period}`)
    if (!response.ok) {
      throw new Error('Không thể lấy dữ liệu phân tích')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching analytics:', error)
    throw error
  }
}

