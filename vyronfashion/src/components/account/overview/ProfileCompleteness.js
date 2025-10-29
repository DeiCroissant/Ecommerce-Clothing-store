'use client'

export function ProfileCompleteness({ percentage }) {
  const getColor = (pct) => {
    if (pct >= 80) return '#10b981' // green
    if (pct >= 50) return '#f59e0b' // orange
    return '#ef4444' // red
  }

  const getMessage = (pct) => {
    if (pct >= 100) return 'Hồ sơ đã hoàn chỉnh! 🎉'
    if (pct >= 80) return 'Hồ sơ gần hoàn thiện'
    if (pct >= 50) return 'Hãy hoàn thiện thêm hồ sơ'
    return 'Hồ sơ cần được cập nhật'
  }

  return (
    <div className="profile-completeness">
      <div className="completeness-header">
        <span className="label">Hoàn thiện hồ sơ</span>
        <span className="percentage">{percentage}%</span>
      </div>
      
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: getColor(percentage),
          }}
        />
      </div>
      
      <p className="completion-hint">
        {getMessage(percentage)}
      </p>
    </div>
  )
}
