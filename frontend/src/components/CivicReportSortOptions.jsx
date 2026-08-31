// ==========================================
// JanaoBangla — CivicReportSortOptions Component
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei component ta Newest, Oldest, Most Confirmed, Highest Priority, ar Nearest sorting dropdown render kore
// GPS location capture handle kore nearest sorting er jonno
// ==========================================

import { useState } from 'react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_confirmed', label: 'Most Confirmed' },
  { value: 'highest_priority', label: 'Highest Priority' },
  { value: 'nearest', label: 'Nearest to Me' }
];

function CivicReportSortOptions({ currentSort = 'newest', totalResults = 0, onSortChange }) {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // ==========================================
  // handleSortSelect — Sorting option change handle kora
  // Nearest select korle GPS location collect kore
  // ==========================================
  const handleSortSelect = (sortValue) => {
    setGpsError(null);

    if (sortValue === 'nearest') {
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser');
        if (onSortChange) onSortChange('newest', null, null);
        return;
      }

      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLoading(false);
          if (onSortChange) {
            onSortChange('nearest', position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          setGpsLoading(false);
          setGpsError('Location access was denied or unavailable.');
          if (onSortChange) {
            onSortChange('newest', null, null);
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      if (onSortChange) {
        onSortChange(sortValue, null, null);
      }
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3" id="civic-report-sort-options">
      {/* Results Count */}
      <div className="text-secondary small">
        Found <strong className="text-dark">{totalResults}</strong> civic report(s)
      </div>

      {/* Sort Select & GPS indicator */}
      <div className="d-flex align-items-center gap-2">
        <label className="text-secondary small fw-semibold mb-0" htmlFor="sort-by-select">
          Sort by:
        </label>
        <select
          id="sort-by-select"
          className="form-select form-select-sm border shadow-sm"
          style={{ width: 'auto', minWidth: '180px' }}
          value={currentSort}
          onChange={(e) => handleSortSelect(e.target.value)}
          disabled={gpsLoading}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {gpsLoading && (
          <span className="spinner-border spinner-border-sm text-primary" title="Detecting your location..."></span>
        )}
      </div>

      {gpsError && (
        <div className="w-100 text-end text-danger small mt-1">
          {gpsError}
        </div>
      )}
    </div>
  );
}

export default CivicReportSortOptions;
