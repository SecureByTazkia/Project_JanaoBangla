// ==========================================
// JanaoBangla — CivicReportSearchBar Component
// BRANCH: feature-civic-report-search-filter-and-analytics
// Ei component ta keyword diye civic report search korar input bar render kore
// Clear button, quick tags, ar enter submit handle kore
// ==========================================

import { useState, useEffect } from 'react';

function CivicReportSearchBar({ value = '', onSearch, placeholder = 'Search by keyword, street name, area, or description...' }) {
  const [searchTerm, setSearchTerm] = useState(value);

  // ==========================================
  // useEffect — Parent theke value update hole local state sync kora
  // ==========================================
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // ==========================================
  // handleSubmit — Search form submit handle kora
  // ==========================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm.trim());
    }
  };

  // ==========================================
  // handleClear — Search term reset kora
  // ==========================================
  const handleClear = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
  };

  // ==========================================
  // handleQuickTagClick — Quick search suggestion tag click handle kora
  // ==========================================
  const handleQuickTagClick = (tag) => {
    setSearchTerm(tag);
    if (onSearch) {
      onSearch(tag);
    }
  };

  const quickTags = ['Pot hole', 'Water logging', 'Broken lamp', 'Garbage dump', 'Dhaka', 'Chittagong'];

  return (
    <div className="civic-search-bar-container" id="civic-report-search-bar">
      <form onSubmit={handleSubmit} className="position-relative">
        <div className="input-group input-group-lg shadow-sm rounded-pill overflow-hidden border">
          <span className="input-group-text bg-white border-0 ps-4 text-secondary">
            🔍
          </span>
          <input
            type="text"
            id="civic-search-input"
            className="form-control border-0 py-3 ps-2 pe-5"
            style={{ fontSize: '1rem', outline: 'none', boxShadow: 'none' }}
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="btn bg-white border-0 text-secondary pe-3"
              onClick={handleClear}
              title="Clear search"
              style={{ zIndex: 5 }}
            >
              ✕
            </button>
          )}

          <button
            type="submit"
            id="civic-search-submit-btn"
            className="btn btn-primary px-4 fw-bold d-flex align-items-center gap-2"
            style={{ backgroundColor: '#006A4E', borderColor: '#006A4E' }}
          >
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Quick Search Tag Suggestions */}
      <div className="d-flex align-items-center flex-wrap gap-2 mt-3 px-2">
        <span className="text-secondary small fw-semibold">Popular Searches:</span>
        {quickTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="btn btn-sm btn-light border text-secondary rounded-pill py-0 px-2 small"
            style={{ fontSize: '0.8rem' }}
            onClick={() => handleQuickTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CivicReportSearchBar;
