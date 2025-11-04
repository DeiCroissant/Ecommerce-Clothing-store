/**
 * Admin Page Header Component
 * Standard page title with action buttons
 */

export function AdminPageHeader({ 
  title, 
  description, 
  action,
  breadcrumbs 
}) {
  return (
    <div className="admin-page-header">
      <div className="admin-page-title-wrapper">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {description && (
            <p className="admin-page-description">{description}</p>
          )}
        </div>
        {action && (
          <div>
            {action}
          </div>
        )}
      </div>
    </div>
  )
}
