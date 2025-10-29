export function LoadingSkeleton({ type = 'card', count = 1, className = '' }) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  if (type === 'card') {
    return (
      <>
        {skeletons.map((i) => (
          <div key={i} className={`skeleton-card ${className}`}>
            <div className="skeleton-header">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
            </div>
            <div className="skeleton-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'list') {
    return (
      <div className={`skeleton-list ${className}`}>
        {skeletons.map((i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-list-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className={`skeleton-table ${className}`}>
        {skeletons.map((i) => (
          <div key={i} className="skeleton-table-row">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        ))}
      </div>
    )
  }

  // Default: simple lines
  return (
    <div className={`skeleton ${className}`}>
      {skeletons.map((i) => (
        <div key={i} className="skeleton-line"></div>
      ))}
    </div>
  )
}
