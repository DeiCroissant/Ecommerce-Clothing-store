/**
 * Admin Empty State Component
 * Displays when there's no data to show
 */

export function AdminEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      textAlign: 'center',
      minHeight: '300px'
    }}>
      {Icon && (
        <div style={{ 
          color: 'var(--admin-text-disabled)', 
          marginBottom: '1.5rem',
          opacity: 0.5
        }}>
          <Icon size={64} />
        </div>
      )}
      
      <h3 style={{
        fontSize: 'var(--admin-text-xl)',
        fontWeight: 'var(--admin-font-semibold)',
        color: 'var(--admin-text-primary)',
        marginBottom: '0.75rem'
      }}>
        {title}
      </h3>
      
      {description && (
        <p style={{
          fontSize: 'var(--admin-text-base)',
          color: 'var(--admin-text-tertiary)',
          maxWidth: '400px',
          marginBottom: '2rem',
          lineHeight: 'var(--admin-leading-normal)'
        }}>
          {description}
        </p>
      )}
      
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}
