// ==========================================
// JanaoBangla — Admin User Management Page
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Users manage korar puro dedicated page
// ==========================================

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminUserManagementTable from '../components/AdminUserManagementTable';
import '../styles/admin.css';

function AdminUserManagementPage() {
  const [toast, setToast] = useState(null);

  // Toast notification trigger
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <main className="admin-dashboard page-content">
      {/* Toast notification */}
      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Header with breadcrumb navigation */}
      <div className="admin-dashboard-header">
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
            <Link to="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Admin Dashboard</Link> / Users Management
          </div>
          <h1>👥 Registered Users Management</h1>
          <p>Manage platform citizens, assign administrator roles, and handle account activation states</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin" className="admin-action-btn btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* User management table component */}
      <AdminUserManagementTable showToast={showToast} />
    </main>
  );
}

export default AdminUserManagementPage;
