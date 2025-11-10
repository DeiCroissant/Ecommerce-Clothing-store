const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`)
    if (!response.ok) {
      throw new Error('Không thể lấy thống kê dashboard')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

