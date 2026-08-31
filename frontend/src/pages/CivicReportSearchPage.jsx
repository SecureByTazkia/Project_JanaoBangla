// ==========================================
// JanaoBangla — CivicReportSearchPage Page
// BRANCH: feature-civic-report-search-filter-and-analytics
// Search, multi-criteria filter, and sorting page for all civic reports across Bangladesh
// ==========================================

import { useState, useEffect } from 'react';
import CivicReportSearchBar from '../components/CivicReportSearchBar';
import CivicReportFilterPanel from '../components/CivicReportFilterPanel';
import CivicReportSortOptions from '../components/CivicReportSortOptions';
import CivicProblemReportCard from '../components/CivicProblemReportCard';
import { searchReports } from '../services/CivicReportSearchService';

function CivicReportSearchPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    priority: 'all',
    division: 'all',
    district: 'all',
    startDate: '',
    endDate: '',
    minVerifications: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [userCoords, setUserCoords] = useState({ lat: null, lng: null });

  // ==========================================
  // useEffect — Search criteria change hole data load kora
  // ==========================================
  useEffect(() => {
    fetchResults(1);
  }, [searchQuery, filters, sortBy, userCoords]);

  // ==========================================
  // fetchResults — Backend theke search results fetch kora
  // ==========================================
  const fetchResults = async (pageToFetch = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        q: searchQuery || undefined,
        category: filters.category !== 'all' ? filters.category : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        division: filters.division !== 'all' ? filters.division : undefined,
        district: filters.district !== 'all' ? filters.district : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        minVerifications: filters.minVerifications || undefined,
        sortBy,
        userLat: userCoords.lat || undefined,
        userLng: userCoords.lng || undefined,
        page: pageToFetch,
        limit: 12
      };

      const res = await searchReports(params);
      if (res.success) {
        setReports(res.data.reports || []);
        setPagination(res.data.pagination || { total: 0, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error('Search fetch failed:', err);
      setError(err.response?.data?.message || 'Failed to search civic reports');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // handleSearchSubmit — Search bar theke text submit handle kora
  // ==========================================
  const handleSearchSubmit = (keyword) => {
    setSearchQuery(keyword);
  };

  // ==========================================
  // handleFilterChange — Filter panel update handle kora
  // ==========================================
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // ==========================================
  // handleResetFilters — Shob filter clear kora
  // ==========================================
  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      priority: 'all',
      division: 'all',
      district: 'all',
      startDate: '',
      endDate: '',
      minVerifications: ''
    });
    setSearchQuery('');
    setSortBy('newest');
    setUserCoords({ lat: null, lng: null });
  };

  // ==========================================
  // handleSortChange — Sort option change handle kora
  // ==========================================
  const handleSortChange = (newSort, lat, lng) => {
    setSortBy(newSort);
    if (lat && lng) {
      setUserCoords({ lat, lng });
    } else {
      setUserCoords({ lat: null, lng: null });
    }
  };

  // ==========================================
  // handlePageChange — Pagination page switch kora
  // ==========================================
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchResults(newPage);
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  return (
    <main className="page-content py-4" style={{ backgroundColor: '#F8FAFC', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Page Header */}
        <div className="text-center mb-4">
          <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2rem' }}>
            Search &amp; Filter Civic Reports
          </h1>
          <p className="text-secondary mb-0" style={{ maxWidth: '640px', margin: '0 auto' }}>
            Explore civic problems submitted by citizens across Bangladesh. Search by keywords, filter by category or division, and sort by urgency or proximity.
          </p>
        </div>

        {/* Search Bar Component */}
        <div className="mb-4">
          <CivicReportSearchBar
            value={searchQuery}
            onSearch={handleSearchSubmit}
          />
        </div>

        {/* Filter Panel Component */}
        <CivicReportFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Sort Options & Result Count */}
        <CivicReportSortOptions
          currentSort={sortBy}
          totalResults={pagination.total}
          onSortChange={handleSortChange}
        />

        {/* Error message */}
        {error && (
          <div className="alert alert-danger py-2 small mb-4">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border spinner-border-lg text-success mb-2" style={{ width: '3rem', height: '3rem' }}></span>
            <p className="text-secondary mt-2">Searching civic reports...</p>
          </div>
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="card border-0 shadow-sm rounded-3 p-5 text-center bg-white my-4">
            <h5 className="fw-bold text-dark mt-3">No Civic Reports Found</h5>
            <p className="text-muted small mb-4" style={{ maxWidth: '420px', margin: '0 auto' }}>
              We couldn't find any reports matching your search or active filter criteria. Try adjusting keywords or resetting filters.
            </p>
            <div>
              <button
                className="btn btn-outline-success fw-semibold btn-sm px-4"
                onClick={handleResetFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          /* Reports Grid */
          <>
            <div className="row g-4 mb-4">
              {reports.map((report) => (
                <div key={report.id} className="col-xl-4 col-md-6">
                  <div className="position-relative h-100">
                    {/* Distance badge if nearby search */}
                    {report.distance_km !== null && (
                      <span
                        className="badge bg-primary position-absolute shadow-sm"
                        style={{ top: '12px', right: '12px', zIndex: 2, fontSize: '0.75rem' }}
                      >
                        {report.distance_km} km away
                      </span>
                    )}
                    <CivicProblemReportCard report={report} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-4 pt-2">
                <button
                  className="btn btn-sm btn-outline-secondary px-3"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>

                <span className="text-secondary small fw-semibold px-2">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  className="btn btn-sm btn-outline-secondary px-3"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </main>
  );
}

export default CivicReportSearchPage;
