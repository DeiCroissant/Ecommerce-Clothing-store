// API Configuration
// Đọc trực tiếp từ process.env (Next.js tự động inject NEXT_PUBLIC_* variables)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Log để debug (chỉ trong development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API_BASE_URL:', API_BASE_URL);
  console.log('🔧 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
}
