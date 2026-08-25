// ==========================================
// JanaoBangla — Admin Report Management Table
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Sob civic report dekhay ebong status update/delete manage korar option dey
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import AdminDashboardService from '../services/AdminDashboardService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Category label formatting helper
const CATEGORY_LABELS = {
  road_damage: '🛣️ Road Damage',
  garbage_waste: '🗑️ Garbage / Waste',
  street_light: '💡 Street Light',
  water_drainage: '💧 Water / Drainage',
  traffic_accident: '🚗 Traffic / Accident',
  public_safety: '🛡️ Public Safety',
  women_harassment: '🚨 Women Harassment',
  extortion_chanda: '💰 Illegal Money Collection Report/চাঁদাবাজির অভিযোগ'
};

// Status label formatting helper
const STATUS_LABELS = {
  submitted: 'Pending (অভিযোগটি জমা হয়েছে)',
  under_review: 'Under Review (যাচাই চলছে)',
  processing: 'Action Taken (ব্যবস্থা নেওয়া হয়েছে)',
  solved: 'Resolved (নিষ্পত্তি হয়েছে)'
};

// Date formatter
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function AdminReportManagementTable({ showToast }) {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const limit = 10;

  // Reports list fetch korar function
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminDashboardService.getReports(page, limit, statusFilter, categoryFilter);
      setReports(data.reports || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Report status update kora hocche (submitted -> under_review -> processing -> solved)
  const handleStatusChange = async (reportId, newStatus) => {
    setActionLoading(`status-${reportId}`);
    try {
      await AdminDashboardService.updateReportStatus(reportId, newStatus);
      if (showToast) {
        showToast(`Report #${reportId} published & status updated to: ${STATUS_LABELS[newStatus] || newStatus} 📢`, 'success');
      }
      fetchReports();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Report delete confirm hole execute hobe
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setActionLoading(`delete-${confirmDelete}`);
    try {
      await AdminDashboardService.deleteReport(confirmDelete);
      if (showToast) showToast('Report deleted successfully ✅', 'success');
      setConfirmDelete(null);
      fetchReports();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to delete report.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3 className="admin-section-title">📋 Civic Problem Reports Management</h3>
        <div className="admin-filter-row">
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="submitted">⏳ Pending (অভিযোগ জমা হয়েছে)</option>
            <option value="under_review">🔍 Under Review (যাচাই চলছে)</option>
            <option value="processing">⚙️ Action Taken (ব্যবস্থা নেওয়া হয়েছে)</option>
            <option value="solved">✅ Resolved (নিষ্পত্তি হয়েছে)</option>
          </select>
          <select
            className="admin-filter-select"
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All Categories</option>
            <option value="road_damage">Road Damage</option>
            <option value="garbage_waste">Garbage / Waste</option>
            <option value="street_light">Street Light</option>
            <option value="water_drainage">Water / Drainage</option>
            <option value="traffic_accident">Traffic / Accident</option>
            <option value="public_safety">Public Safety</option>
            <option value="women_harassment">Women Harassment</option>
            <option value="extortion_chanda">Illegal Money Collection Report/চাঁদাবাজির অভিযোগ</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-section-body">
          <LoadingSpinner message="Loading reports..." />
        </div>
      ) : error ? (
        <div className="admin-section-body">
          <ErrorMessage message={error} />
        </div>
      ) : reports.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">📋</div>
          <div className="admin-empty-text">No reports found matching the criteria.</div>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Reporter</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Visibility</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id}>
                    <td>{report.id}</td>
                    <td style={{ fontWeight: 500, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.title}
                    </td>
                    <td>
                      <span className="admin-category-label">
                        {CATEGORY_LABELS[report.category] || report.category}
                      </span>
                    </td>
                    <td>{report.reporter_name || '—'}</td>
                    <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {report.address || '—'}
                    </td>
                    <td>
                      {/* Inline status dropdown */}
                      <select
                        className="admin-status-select"
                        value={report.status}
                        onChange={e => handleStatusChange(report.id, e.target.value)}
                        disabled={actionLoading === `status-${report.id}`}
                      >
                        <option value="submitted">⏳ Pending (অভিযোগটি জমা হয়েছে)</option>
                        <option value="under_review">🔍 Under Review (যাচাই চলছে)</option>
                        <option value="processing">⚙️ Action Taken (ব্যবস্থা নেওয়া হয়েছে)</option>
                        <option value="solved">✅ Resolved (নিষ্পত্তি হয়েছে)</option>
                      </select>
                    </td>
                    <td>
                      <span className={`admin-badge badge-${report.visibility}`}>
                        {report.visibility === 'public' ? '🌐 Public' : '🔒 Private'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDate(report.created_at)}</td>
                    <td>
                      <div className="admin-actions-cell" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {!report.is_published ? (
                          <button
                            className="admin-action-btn btn-sm"
                            onClick={() => handleStatusChange(report.id, 'submitted')}
                            disabled={actionLoading === `status-${report.id}`}
                            title="Publish report to public feed as submitted (Pending / অভিযোগটি জমা হয়েছে)"
                            style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                          >
                            📢 Publish to Feed
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#2e7d32', fontWeight: 600, padding: '2px 6px', background: '#e8f5e9', borderRadius: '4px' }}>
                            ✓ In Feed
                          </span>
                        )}
                        <button
                          className="admin-action-btn btn-danger btn-sm"
                          onClick={() => setConfirmDelete(report.id)}
                          disabled={actionLoading === `delete-${report.id}`}
                          title="Delete report"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} reports
              </div>
              <div className="admin-pagination-controls">
                <button className="admin-pagination-btn" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  ← Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let startPage = Math.max(1, page - 2);
                  if (startPage + 4 > totalPages) startPage = Math.max(1, totalPages - 4);
                  const pageNum = startPage + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <button
                      key={pageNum}
                      className={`admin-pagination-btn ${pageNum === page ? 'active' : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button className="admin-pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="admin-confirm-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3 className="admin-confirm-title">Delete Report #{confirmDelete}?</h3>
            <p className="admin-confirm-message">Are you sure you want to permanently delete this report and all associated data?</p>
            <div className="admin-confirm-actions">
              <button className="admin-action-btn btn-outline" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="admin-action-btn btn-danger" onClick={handleDeleteConfirm}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReportManagementTable;
