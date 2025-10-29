export function PageHeader({ title, description, actions, backLink }) {
  return (
    <header className="page-header">
      <div className="page-header-content">
        <div className="page-header-text">
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>
    </header>
  )
}
