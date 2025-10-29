export function AccountCard({
  title,
  description,
  actions,
  children,
  className = '',
  noPadding = false,
}) {
  return (
    <div className={`account-card ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          {title && (
            <div className="card-header-text">
              <h2 className="card-title">{title}</h2>
              {description && <p className="card-description">{description}</p>}
            </div>
          )}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-content ${noPadding ? 'no-padding' : ''}`}>
        {children}
      </div>
    </div>
  )
}
