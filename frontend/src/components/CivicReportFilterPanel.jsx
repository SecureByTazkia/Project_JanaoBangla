// ==========================================
// JanaoBangla — CivicReportFilterPanel Component
// BRANCH: feature-civic-report-search-filter-and-analytics
// Multi-criteria filter panel: Category, Status, Priority, Division, Date Range, Verifications
// ==========================================

import { useState } from 'react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'road_damage', label: 'Road Damage' },
  { value: 'garbage_waste', label: 'Garbage / Waste' },
  { value: 'street_light', label: 'Street Light' },
  { value: 'water_drainage', label: 'Water / Drainage' },
  { value: 'traffic_accident', label: 'Traffic / Accident' },
  { value: 'public_safety', label: 'Public Safety' },
  { value: 'women_harassment', label: 'Women Harassment' },
  { value: 'extortion_chanda', label: 'Illegal Money Collection / চাঁদাবাজি' }
];

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'processing', label: 'Processing' },
  { value: 'solved', label: 'Solved' }
];

const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const DIVISIONS = [
  { value: 'all', label: 'All Divisions' },
  { value: 'Dhaka', label: 'Dhaka (ঢাকা)' },
  { value: 'Chittagong', label: 'Chittagong (চট্টগ্রাম)' },
  { value: 'Rajshahi', label: 'Rajshahi (রাজশাহী)' },
  { value: 'Khulna', label: 'Khulna (খুলনা)' },
  { value: 'Barishal', label: 'Barishal (বরিশাল)' },
  { value: 'Sylhet', label: 'Sylhet (সিলেট)' },
  { value: 'Rangpur', label: 'Rangpur (রংপুর)' },
  { value: 'Mymensingh', label: 'Mymensingh (ময়মনসিংহ)' }
];

function CivicReportFilterPanel({ filters = {}, onFilterChange, onResetFilters }) {
  const [isOpen, setIsOpen] = useState(false);

  // ==========================================
  // handleFieldChange — Specific filter value change handle kora
  // ==========================================
  const handleFieldChange = (key, value) => {
    if (onFilterChange) {
      onFilterChange({
        ...filters,
        [key]: value
      });
    }
  };

  // ==========================================
  // countActiveFilters — Koto filter currently active calculate kora
  // ==========================================
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.priority && filters.priority !== 'all') count++;
    if (filters.division && filters.division !== 'all') count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.minVerifications && filters.minVerifications > 0) count++;
    return count;
  };

  const activeCount = getActiveFiltersCount();

  return (
    <div className="civic-filter-panel card border shadow-sm rounded-3 mb-4 bg-white" id="civic-report-filter-panel">
      {/* Header bar */}
      <div className="card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <h6 className="fw-bold mb-0 text-dark">Filter Civic Reports</h6>
          {activeCount > 0 && (
            <span className="badge bg-success rounded-pill px-2 py-1 small">
              {activeCount} Active
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              id="reset-filters-btn"
              className="btn btn-sm btn-outline-danger py-1 px-3"
              onClick={onResetFilters}
            >
              Reset All
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-md-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '▲ Hide Filters' : '▼ Show Filters'}
          </button>
        </div>
      </div>

      {/* Filter Body (Always visible on desktop, collapsible on mobile) */}
      <div className={`card-body p-4 ${isOpen ? 'd-block' : 'd-none d-md-block'}`}>
        <div className="row g-3">
          
          {/* Category */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Category
            </label>
            <select
              id="filter-category-select"
              className="form-select form-select-sm"
              value={filters.category || 'all'}
              onChange={(e) => handleFieldChange('category', e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Status
            </label>
            <select
              id="filter-status-select"
              className="form-select form-select-sm"
              value={filters.status || 'all'}
              onChange={(e) => handleFieldChange('status', e.target.value)}
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Priority
            </label>
            <select
              id="filter-priority-select"
              className="form-select form-select-sm"
              value={filters.priority || 'all'}
              onChange={(e) => handleFieldChange('priority', e.target.value)}
            >
              {PRIORITIES.map((pr) => (
                <option key={pr.value} value={pr.value}>
                  {pr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Division / Area */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Division / Area
            </label>
            <select
              id="filter-division-select"
              className="form-select form-select-sm"
              value={filters.division || 'all'}
              onChange={(e) => handleFieldChange('division', e.target.value)}
            >
              {DIVISIONS.map((div) => (
                <option key={div.value} value={div.value}>
                  {div.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Start */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Submitted From
            </label>
            <input
              type="date"
              id="filter-start-date-input"
              className="form-control form-control-sm"
              value={filters.startDate || ''}
              onChange={(e) => handleFieldChange('startDate', e.target.value)}
            />
          </div>

          {/* Date Range End */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Submitted To
            </label>
            <input
              type="date"
              id="filter-end-date-input"
              className="form-control form-control-sm"
              value={filters.endDate || ''}
              onChange={(e) => handleFieldChange('endDate', e.target.value)}
            />
          </div>

          {/* Min Confirmations / Verifications */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-semibold text-secondary mb-1">
              Min. Confirmations
            </label>
            <select
              id="filter-min-verifications-select"
              className="form-select form-select-sm"
              value={filters.minVerifications || ''}
              onChange={(e) => handleFieldChange('minVerifications', e.target.value)}
            >
              <option value="">Any Confirmations</option>
              <option value="1">1+ Confirmation</option>
              <option value="5">5+ Confirmations</option>
              <option value="10">10+ Highly Confirmed</option>
              <option value="20">20+ Critical Community Backing</option>
            </select>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CivicReportFilterPanel;
