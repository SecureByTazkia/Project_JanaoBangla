// ==========================================
// JanaoBangla — Admin Report Management Page
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Reports manage korar puro dedicated page
// ==========================================

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import AdminReportManagementTable from '../components/AdminReportManagementTable';
import '../styles/admin.css';

function AdminReportManagementPage() {
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
            <Link to="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Admin Dashboard</Link> / Reports Management
          </div>
          <h1>Civic Problem Reports Management</h1>
          <p>Review, update progress status, and moderate all citizen-submitted civic reports</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin" className="admin-action-btn btn-outline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Report management table component */}
      <AdminReportManagementTable showToast={showToast} />
    </main>
  );
}

export default AdminReportManagementPage;
