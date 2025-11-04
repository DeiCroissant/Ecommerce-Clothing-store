'use client'

export function AccountCard({ children, title, description, className = '' }) {
  return (
    <div className={`account-card ${className}`}>
      {(title || description) && (
        <div className="account-card-header">
          {title && <h2 className="account-card-title">{title}</h2>}
          {description && <p className="account-card-description">{description}</p>}
        </div>
      )}
      
      <div className="account-card-content">
        {children}
      </div>
      
      <style jsx>{`
        .account-card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e4e4e7;
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        
        .account-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        
        .account-card-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f4f4f5;
          background: #fafafa;
        }
        
        .account-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #18181b;
          margin: 0 0 0.25rem 0;
        }
        
        .account-card-description {
          font-size: 0.875rem;
          color: #71717a;
          margin: 0;
          line-height: 1.5;
        }
        
        .account-card-content {
          padding: 1.5rem;
        }
        
        @media (max-width: 640px) {
          .account-card-header,
          .account-card-content {
            padding: 1rem;
          }
          
          .account-card-title {
            font-size: 1.125rem;
          }
        }
      `}</style>
    </div>
  )
}
