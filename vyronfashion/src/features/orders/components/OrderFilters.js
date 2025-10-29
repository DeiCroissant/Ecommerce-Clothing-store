import { X } from 'lucide-react';
import { ORDER_STATUSES, DATE_RANGES } from '@/lib/mockOrdersData';

export function OrderFilters({ 
  activeStatus, 
  activeDateRange, 
  onStatusChange, 
  onDateRangeChange 
}) {
  return (
    <div className="order-filters">
      {/* Status Filters */}
      <div className="status-filters">
        {Object.values(ORDER_STATUSES).map(status => (
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

      {/* Date Range Filter */}
      <div className="date-filter">
        <label htmlFor="date-range" className="date-label">
          Thời gian:
        </label>
        <select 
          id="date-range"
          className="date-select"
          value={activeDateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
        >
          {DATE_RANGES.map(range => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Active Filters Chips (optional display) */}
      {(activeStatus !== 'all' || activeDateRange !== 'all') && (
        <div className="active-filters">
          {activeStatus !== 'all' && (
            <div className="filter-chip">
              <span>
                {ORDER_STATUSES[activeStatus.toUpperCase()]?.label || activeStatus}
              </span>
              <button 
                onClick={() => onStatusChange('all')}
                aria-label="Remove status filter"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {activeDateRange !== 'all' && (
            <div className="filter-chip">
              <span>
                {DATE_RANGES.find(r => r.value === activeDateRange)?.label}
              </span>
              <button 
                onClick={() => onDateRangeChange('all')}
                aria-label="Remove date filter"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
