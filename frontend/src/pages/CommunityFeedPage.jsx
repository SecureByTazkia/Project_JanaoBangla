// ==========================================
// JanaoBangla — Community Feed Page
// BRANCH: feature-community-feed-comments-and-discussion
// Puro public community feed page jekhane public reports, category filter, sorting, problem verification ebong discussion dekhabe
// ==========================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicCivicProblemFeed from '../components/PublicCivicProblemFeed';
import CommunityInteractionService from '../services/CommunityInteractionService';
import '../styles/community.css';

function CommunityFeedPage() {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filters & Pagination State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus]     = useState('all');
  const [searchQuery, setSearchQuery]           = useState('');
  const [sortBy, setSortBy]                     = useState('newest');
  const [currentPage, setCurrentPage]           = useState(1);
  const [totalPages, setTotalPages]             = useState(1);
  const [totalReports, setTotalReports]         = useState(0);

  const categories = [
    { id: 'all',              label: 'All Problems',     icon: '🌐' },
    { id: 'road_damage',      label: 'Road Damage',      icon: '🚧' },
    { id: 'garbage_waste',    label: 'Garbage & Waste',  icon: '🗑️' },
    { id: 'street_light',     label: 'Street Light',     icon: '💡' },
    { id: 'water_drainage',   label: 'Water & Drainage', icon: '🚰' },
    { id: 'traffic_accident', label: 'Traffic Safety',   icon: '🚦' },
    { id: 'public_safety',    label: 'Public Safety',    icon: '🛡️' }
  ];

  // ==========================================
  // fetchFeedData
  // Backend theke community feed data fetch korar core function
  // ==========================================
  const fetchFeedData = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await CommunityInteractionService.getCommunityFeed({
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery.trim(),
        sortBy: sortBy,
        page: currentPage,
        limit: 10
      });

      if (res.success && res.data) {
        setReports(res.data.reports || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalReports(res.data.total || 0);
      }
    } catch (err) {
      console.error('Community feed loading error:', err);
      setError('Failed to load community feed. Please check your internet connection or backend server.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // useEffect — Filter, Search, Sort ba Page change hole data reload hobe
  // ==========================================
  useEffect(() => {
    fetchFeedData();
  }, [selectedCategory, selectedStatus, sortBy, currentPage]);

  // ==========================================
  // handleSearchSubmit
  // Search box theke form submit handle kore
  // ==========================================
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFeedData();
  };

  // ==========================================
  // handleCategorySelect
  // Category button click korle active filter change kore
  // ==========================================
  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
  };

  return (
    <main className="page-content">
      {/* Hero Header Section */}
      <section className="community-hero">
        <div className="community-hero-content">
          <div className="community-hero-badge">
            <span>👥</span>
            <span>PUBLIC CIVIC COMMUNITY & DISCUSSION</span>
          </div>
          <h1>Citizen Voice & Community Action</h1>
          <p>
            Browse verified civic reports across Bangladesh, confirm issues in your neighborhood to build collective proof, and participate in community discussions for faster resolutions.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="community-container">
        {/* Controls & Filter Bar */}
        <div className="community-controls">
          {/* Search Bar & Dropdowns Row */}
          <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="community-search-box">
              <span className="community-search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                placeholder="Search reports by title, description, or location (e.g. Dhanmondi, Mirpur)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Status Dropdown */}
            <div style={{ minWidth: '150px' }}>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ borderRadius: '10px', fontSize: '0.9rem', padding: '11px 14px' }}
                aria-label="Filter by problem status"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">📝 Submitted</option>
                <option value="under_review">🔍 Under Review</option>
                <option value="processing">⚙️ Processing</option>
                <option value="solved">✅ Solved</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div style={{ minWidth: '160px' }}>
              <select
                className="form-select"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ borderRadius: '10px', fontSize: '0.9rem', padding: '11px 14px' }}
                aria-label="Sort reports"
              >
                <option value="newest">🕒 Newest First</option>
                <option value="most_confirmed">🤝 Most Confirmed</option>
                <option value="most_discussed">💬 Most Discussed</option>
                <option value="oldest">⌛ Oldest First</option>
              </select>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="community-filter-tabs" role="tablist" aria-label="Category filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`community-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => handleCategorySelect(cat.id)}
                role="tab"
                aria-selected={selectedCategory === cat.id}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="d-flex align-items-center justify-content-between mb-3 px-1">
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>
            Showing <strong>{reports.length}</strong> of <strong>{totalReports}</strong> civic reports
          </span>

          <Link
            to="/report-problem"
            className="btn-primary-jb"
            style={{ padding: '6px 14px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>➕</span>
            <span>Report Problem</span>
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger py-3 px-4 rounded-3 mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Feed List */}
        <PublicCivicProblemFeed
          reports={reports}
          loading={loading}
          onRefresh={fetchFeedData}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-2 mt-4 pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              ← Previous
            </button>

            <span className="text-muted px-2" style={{ fontSize: '0.875rem' }}>
              Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              disabled={currentPage === totalPages || loading}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default CommunityFeedPage;
