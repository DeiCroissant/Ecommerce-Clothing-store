import { RETURN_STATUSES } from '@/lib/mockReturnsData';

export function ReturnFilters({ activeStatus, onStatusChange }) {
  return (
    <div className="return-filters">
      <div className="status-filters">
        {Object.values(RETURN_STATUSES).map(status => (
          <button
            key={status.value}
            className={`filter-pill ${activeStatus === status.value ? 'active' : ''}`}
            onClick={() => onStatusChange(status.value)}
            style={{
              '--pill-color': status.color
            }}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}
