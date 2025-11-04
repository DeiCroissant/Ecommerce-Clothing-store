'use client'

export function SectionTitle({ children, action }) {
  return (
    <div className="section-title">
      <h2 className="section-title-text">{children}</h2>
      {action && <div className="section-title-action">{action}</div>}
      
      <style jsx>{`
        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid #f4f4f5;
        }
        
        .section-title-text {
          font-size: 1.25rem;
          font-weight: 600;
          color: #18181b;
          margin: 0;
          letter-spacing: -0.025em;
        }
        
        .section-title-action {
          flex-shrink: 0;
        }
        
        @media (max-width: 640px) {
          .section-title {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .section-title-text {
            font-size: 1.125rem;
          }
          
          .section-title-action {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
