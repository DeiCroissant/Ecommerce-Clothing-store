export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`empty-state ${className}`}>
      {Icon && (
        <div className="empty-icon">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="empty-title">{title}</h3>
      {description && <p className="empty-description">{description}</p>}
      {action && <div className="empty-action">{action}</div>}
    </div>
  )
}
