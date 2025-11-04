'use client'

import Link from 'next/link'

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {Icon && <Icon size={64} strokeWidth={1.5} />}
      </div>
      
      <h3 className="empty-state-title">{title}</h3>
      
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      
      {(actionLabel && (actionHref || onAction)) && (
        <div className="empty-state-action">
          {actionHref ? (
            <Link href={actionHref} className="btn-primary">
              {actionLabel}
            </Link>
          ) : (
            <button onClick={onAction} className="btn-primary">
              {actionLabel}
            </button>
          )}
        </div>
      )}
      
      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          min-height: 300px;
        }
        
        .empty-state-icon {
          color: #a1a1aa;
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }
        
        .empty-state-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #18181b;
          margin-bottom: 0.75rem;
        }
        
        .empty-state-description {
          font-size: 1rem;
          color: #71717a;
          max-width: 400px;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .empty-state-action {
          margin-top: 1rem;
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background-color: #18181b;
          color: white;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }
        
        .btn-primary:hover {
          background-color: #27272a;
          transform: translateY(-1px);
        }
        
        .btn-primary:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}
