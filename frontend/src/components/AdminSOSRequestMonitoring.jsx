// ==========================================
// JanaoBangla — Admin SOS Request Monitoring Component
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Women Safety SOS requests real-time monitor kore, status resolve/cancel korte dey
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import AdminDashboardService from '../services/AdminDashboardService';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

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

function AdminSOSRequestMonitoring({ showToast }) {
  const [sosList, setSosList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 10;

  // SOS requests fetch korar function
  const fetchSosRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminDashboardService.getSosRequests(page, limit, statusFilter);
      setSosList(data.sosRequests || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load SOS requests.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchSosRequests();
  }, [fetchSosRequests]);

  // SOS status update (active -> resolved / cancelled)
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(`sos-${id}`);
    try {
      await AdminDashboardService.updateSosStatus(id, newStatus);
      if (showToast) showToast(`SOS request #${id} marked as '${newStatus}' ✅`, 'success');
      fetchSosRequests();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to update SOS status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3 className="admin-section-title">🚨 Women Safety SOS Emergency Requests</h3>
        <div className="admin-filter-row">
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="all">All SOS Status</option>
            <option value="active">Active Alerts Only</option>
            <option value="resolved">Resolved Alerts</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-section-body">
          <LoadingSpinner message="Loading SOS alerts..." />
        </div>
      ) : error ? (
        <div className="admin-section-body">
          <ErrorMessage message={error} />
        </div>
      ) : sosList.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">🛡️</div>
          <div className="admin-empty-text">No SOS requests found.</div>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User / Citizen</th>
                  <th>Phone Number</th>
                  <th>GPS Coordinates</th>
                  <th>Location Address</th>
                  <th>SMS/Email Status</th>
                  <th>Status</th>
                  <th>Triggered At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sosList.map(sos => (
                  <tr key={sos.id} style={{ background: sos.status === 'active' ? 'rgba(255, 23, 68, 0.05)' : 'inherit' }}>
                    <td><strong>#{sos.id}</strong></td>
                    <td style={{ fontWeight: 500 }}>
                      <div>{sos.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sos.user_email}</div>
                    </td>
                    <td>{sos.user_phone || '—'}</td>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {sos.latitude && sos.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-location)', textDecoration: 'underline' }}
                        >
                          📍 {Number(sos.latitude).toFixed(4)}, {Number(sos.longitude).toFixed(4)}
                        </a>
                      ) : 'GPS Not Captured'}
                    </td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {sos.location_address || '—'}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.78rem' }}>
                        <div>📱 SMS: {sos.sms_sent ? '✅ Sent' : '⏳ Pending'}</div>
                        <div>✉️ Email: {sos.email_sent ? '✅ Sent' : '⏳ Pending'}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-badge badge-${sos.status === 'active' ? 'flagged' : sos.status === 'resolved' ? 'active' : 'inactive'}`}>
                        {sos.status === 'active' ? '🚨 ACTIVE' : sos.status === 'resolved' ? '✅ Resolved' : '🚫 Cancelled'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDate(sos.created_at)}</td>
                    <td>
                      <div className="admin-actions-cell">
                        {sos.status === 'active' && (
                          <button
                            className="admin-action-btn btn-success btn-sm"
                            onClick={() => handleStatusChange(sos.id, 'resolved')}
                            disabled={actionLoading === `sos-${sos.id}`}
                          >
                            ✅ Resolve
                          </button>
                        )}
                        {sos.status === 'active' && (
                          <button
                            className="admin-action-btn btn-outline btn-sm"
                            onClick={() => handleStatusChange(sos.id, 'cancelled')}
                            disabled={actionLoading === `sos-${sos.id}`}
                          >
                            Cancel
                          </button>
                        )}
                        {sos.status !== 'active' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <div className="admin-pagination-info">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} SOS requests
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
    </div>
  );
}

export default AdminSOSRequestMonitoring;
