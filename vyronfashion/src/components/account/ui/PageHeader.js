'use client'

export function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <h1 className="page-header-title">{title}</h1>
        {description && (
          <p className="page-header-description">{description}</p>
        )}
      </div>
      
      {action && (
        <div className="page-header-action">
          {action}
        </div>
      )}
      
      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e4e4e7;
        }
        
        .page-header-content {
          flex: 1;
        }
        
        .page-header-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #18181b;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }
        
        .page-header-description {
          font-size: 1rem;
          color: #71717a;
          margin: 0;
          line-height: 1.6;
        }
        
        .page-header-action {
          flex-shrink: 0;
        }
        
        @media (max-width: 640px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .page-header-title {
            font-size: 1.5rem;
          }
          
          .page-header-action {
            width: 100%;
          }
          
          .page-header-action > * {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
