'use client'

export function LoadingSkeleton({ type = 'default', count = 1 }) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-text" />
              <div className="skeleton-line skeleton-text short" />
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="skeleton-list-item">
            <div className="skeleton-circle" />
            <div className="skeleton-list-content">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-text short" />
            </div>
          </div>
        )
      
      default:
        return (
          <div className="skeleton-default">
            <div className="skeleton-line skeleton-title" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text" />
            <div className="skeleton-line skeleton-text short" />
          </div>
        )
    }
  }

  return (
    <div className="loading-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
      
      <style jsx>{`
        .loading-skeleton {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .skeleton-card,
        .skeleton-list-item,
        .skeleton-default {
          background: white;
          border-radius: 0.75rem;
          padding: 1rem;
          border: 1px solid #f4f4f5;
        }
        
        .skeleton-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(90deg, #f4f4f5 0%, #e4e4e7 50%, #f4f4f5 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .skeleton-circle {
          width: 48px;
          height: 48px;
          background: linear-gradient(90deg, #f4f4f5 0%, #e4e4e7 50%, #f4f4f5 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 50%;
        }
        
        .skeleton-line {
          height: 1rem;
          background: linear-gradient(90deg, #f4f4f5 0%, #e4e4e7 50%, #f4f4f5 100%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 0.25rem;
          margin-bottom: 0.75rem;
        }
        
        .skeleton-title {
          height: 1.5rem;
          width: 60%;
        }
        
        .skeleton-text {
          width: 100%;
        }
        
        .skeleton-text.short {
          width: 40%;
        }
        
        .skeleton-list-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .skeleton-list-content {
          flex: 1;
        }
        
        .skeleton-content {
          padding: 0.5rem 0;
        }
      `}</style>
    </div>
  )
}
