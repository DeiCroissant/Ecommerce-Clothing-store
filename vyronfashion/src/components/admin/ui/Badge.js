/**
 * Admin Badge Component
 * Status indicators with different variants
 */

export function AdminBadge({ 
  children, 
  variant = 'neutral',
  className = '' 
}) {
  const variantClass = `admin-badge-${variant}`
  
  return (
    <span className={`admin-badge ${variantClass} ${className}`}>
      {children}
    </span>
  )
}

/**
 * Status Badge - Convenient wrapper for common statuses
 */
export function StatusBadge({ status }) {
  const statusMap = {
    // Order statuses
    'pending': { label: 'Chờ xử lý', variant: 'warning' },
    'processing': { label: 'Đang xử lý', variant: 'info' },
    'completed': { label: 'Hoàn thành', variant: 'success' },
    'cancelled': { label: 'Đã hủy', variant: 'danger' },
    'refunded': { label: 'Đã hoàn tiền', variant: 'neutral' },
    
    // Payment statuses
    'paid': { label: 'Đã thanh toán', variant: 'success' },
    'unpaid': { label: 'Chưa thanh toán', variant: 'warning' },
    'failed': { label: 'Thất bại', variant: 'danger' },
    
    // Product statuses
    'active': { label: 'Đang bán', variant: 'success' },
    'draft': { label: 'Bản nháp', variant: 'neutral' },
    'out-of-stock': { label: 'Hết hàng', variant: 'danger' },
    'low-stock': { label: 'Sắp hết', variant: 'warning' },
    
    // Generic
    'enabled': { label: 'Bật', variant: 'success' },
    'disabled': { label: 'Tắt', variant: 'neutral' },
  }

  const config = statusMap[status] || { label: status, variant: 'neutral' }

  return (
    <AdminBadge variant={config.variant}>
      {config.label}
    </AdminBadge>
  )
}
