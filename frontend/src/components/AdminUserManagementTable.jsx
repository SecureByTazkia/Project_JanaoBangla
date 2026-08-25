// ==========================================
// JanaoBangla — Admin User Management Table
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Registered users dekhay ebong role change / activate / deactivate manage korte dey
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

function AdminUserManagementTable({ showToast }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const limit = 10;

  // Users list fetch kora hocche
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AdminDashboardService.getUsers(page, limit, search);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search input change hoile first page e reset hobe
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // User role toggle (citizen <-> admin)
  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'citizen' : 'admin';
    setActionLoading(`role-${userId}`);
    try {
      await AdminDashboardService.updateUserRole(userId, newRole);
      if (showToast) showToast(`User role updated to '${newRole}' ✅`, 'success');
      fetchUsers();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to update role.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // User active/inactive toggle
  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    setActionLoading(`status-${userId}`);
    try {
      await AdminDashboardService.updateUserStatus(userId, newStatus);
      if (showToast) showToast(`User ${newStatus ? 'activated' : 'deactivated'} ✅`, 'success');
      fetchUsers();
    } catch (err) {
      if (showToast) showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3 className="admin-section-title">👥 Registered Users Management</h3>
        <div className="admin-search-bar">
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="admin-section-body">
          <LoadingSpinner message="Loading users..." />
        </div>
      ) : error ? (
        <div className="admin-section-body">
          <ErrorMessage message={error} />
        </div>
      ) : users.length === 0 ? (
        <div className="admin-empty-state">
          <div className="admin-empty-icon">👤</div>
          <div className="admin-empty-text">No registered users found.</div>
        </div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td style={{ fontWeight: 500 }}>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number || '—'}</td>
                    <td>
                      <span className={`admin-badge badge-${user.role}`}>
                        {user.role === 'admin' ? '🛡️ Admin' : '👤 Citizen'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge badge-${user.is_verified ? 'verified' : 'unverified'}`}>
                        {user.is_verified ? '✅ Yes' : '⏳ No'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge badge-${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? '🟢 Active' : '🔴 Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{formatDate(user.created_at)}</td>
                    <td>
                      <div className="admin-actions-cell">
                        <button
                          className="admin-action-btn btn-outline btn-sm"
                          onClick={() => handleRoleToggle(user.id, user.role)}
                          disabled={actionLoading === `role-${user.id}`}
                          title={`Switch to ${user.role === 'admin' ? 'citizen' : 'admin'}`}
                        >
                          {actionLoading === `role-${user.id}` ? '...' : user.role === 'admin' ? '👤 Citizen' : '🛡️ Admin'}
                        </button>
                        <button
                          className={`admin-action-btn btn-sm ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => handleStatusToggle(user.id, user.is_active)}
                          disabled={actionLoading === `status-${user.id}`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {actionLoading === `status-${user.id}` ? '...' : user.is_active ? '🚫 Deactivate' : '✅ Activate'}
                        </button>
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
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
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

export default AdminUserManagementTable;
