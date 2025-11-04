/**
 * Admin Card Component
 * Reusable card container with header, body, and footer sections
 */

export function AdminCard({ 
  children, 
  className = '',
  hover = false 
}) {
  return (
    <div className={`admin-card ${hover ? 'hover:shadow-md' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function AdminCardHeader({ children, className = '' }) {
  return (
    <div className={`admin-card-header ${className}`}>
      {children}
    </div>
  )
}

export function AdminCardTitle({ children, className = '' }) {
  return (
    <h3 className={`admin-card-title ${className}`}>
      {children}
    </h3>
  )
}

export function AdminCardDescription({ children, className = '' }) {
  return (
    <p className={`admin-card-description ${className}`}>
      {children}
    </p>
  )
}

export function AdminCardBody({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function AdminCardFooter({ children, className = '' }) {
  return (
    <div className={`admin-card-footer ${className}`}>
      {children}
    </div>
  )
}
