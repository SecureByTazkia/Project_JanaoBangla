// ==========================================
// JanaoBangla — Admin Dashboard Page
// BRANCH: feature-admin-dashboard-and-system-monitoring
// Main admin dashboard — overall statistics, quick tabs, and modular sub-components
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboardService from '../services/AdminDashboardService';
import LoadingSpinner from '../components/LoadingSpinner';

// Modular Sub-components
import AdminReportManagementTable from '../components/AdminReportManagementTable';
import AdminUserManagementTable from '../components/AdminUserManagementTable';
import AdminCommentMonitoring from '../components/AdminCommentMonitoring';
import AdminSOSRequestMonitoring from '../components/AdminSOSRequestMonitoring';
import AdminSystemMonitoring from '../components/AdminSystemMonitoring';

import '../styles/admin.css';

// Category label formatting helper
const CATEGORY_LABELS = {
  road_damage: '🛣️ Road Damage',
  garbage_waste: '🗑️ Garbage / Waste',
  street_light: '💡 Street Light',
  water_drainage: '💧 Water / Drainage',
  traffic_accident: '🚗 Traffic / Accident',
  public_safety: '🛡️ Public Safety',
  women_harassment: '🚨 Women Harassment',
  extortion_chanda: '💰 Illegal Money Collection / চাঁদাবাজি'
};

// ==========================================
// OVERVIEW STATS TAB
// System er overall statistics card grid dekhabe
// ==========================================
function OverviewStatsTab({ stats, isLoading }) {
  if (isLoading) return <LoadingSpinner message="Loading statistics..." />;

  const s = stats || {};
  const categories = s.categoriesBreakdown || [];

  // Stats cards configuration
  const cards = [
    { icon: '👥', label: 'Total Users', value: s.totalUsers || 0, variant: 'primary', link: '/admin/users' },
    { icon: '🛡️', label: 'Admin Users', value: s.totalAdmins || 0, variant: 'info' },
    { icon: '📋', label: 'Total Reports', value: s.totalReports || 0, variant: 'primary', link: '/admin/reports' },
    { icon: '⏳', label: 'Pending Reports', value: s.pendingReports || 0, variant: 'warning' },
    { icon: '⚙️', label: 'In Progress', value: s.processingReports || 0, variant: 'info' },
    { icon: '✅', label: 'Solved Reports', value: s.solvedReports || 0, variant: 'success' },
    { icon: '💬', label: 'Total Comments', value: s.totalComments || 0, variant: 'info' },
    { icon: '🚨', label: 'Total SOS Alerts', value: s.totalSos || 0, variant: 'danger' },
    { icon: '⚠️', label: 'Active SOS Alerts', value: s.activeSos || 0, variant: 'danger' },
    { icon: '🔒', label: 'Private Reports', value: s.privateReports || 0, variant: 'warning' },
    { icon: '📑', label: 'Duplicate Reports', value: s.duplicateReports || 0, variant: 'danger' }
  ];

  return (
    <div>
      {/* Stats card grid */}
      <div className="admin-stats-grid">
        {cards.map((card, idx) => (
          <div className="admin-stat-card" key={idx}>
            <div className={`admin-stat-card-icon ${card.variant}`}>{card.icon}</div>
            <div className="admin-stat-value">{card.value}</div>
            <div className="admin-stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown section */}
      {categories.length > 0 && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h3 className="admin-section-title">📊 Reports Distribution by Civic Category</h3>
          </div>
          <div className="admin-section-body">
            <div className="admin-stats-grid">
              {categories.map((cat, idx) => (
                <div className="admin-stat-card" key={idx}>
                  <div className="admin-category-label">
                    {CATEGORY_LABELS[cat.category] || cat.category}
                  </div>
                  <div className="admin-stat-value">{cat.count}</div>
                  <div className="admin-stat-label">reports recorded</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">⚡ Dedicated Management Portals</h3>
        </div>
        <div className="admin-section-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Link to="/admin/reports" className="admin-stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="admin-stat-card-icon primary">📋</div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>Manage All Reports →</div>
            <div className="admin-stat-label">Dedicated full page for reports moderation and status tracking</div>
          </Link>
          <Link to="/admin/users" className="admin-stat-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
            <div className="admin-stat-card-icon info">👥</div>
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>Manage All Users →</div>
            <div className="admin-stat-label">Dedicated full page for registered citizen accounts & role control</div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ADMIN DASHBOARD PAGE — MAIN ROOT
// ==========================================
function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Overview stats fetch kora hocche
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const data = await AdminDashboardService.getOverviewStats();
        setStats(data.stats || null);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Toast trigger
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Navigation tab items
  const tabs = [
    { key: 'overview', icon: '📊', label: 'Overview & Stats' },
    { key: 'reports', icon: '📋', label: 'Civic Reports' },
    { key: 'users', icon: '👥', label: 'Registered Users' },
    { key: 'comments', icon: '💬', label: 'Comments Moderation' },
    { key: 'sos', icon: '🚨', label: 'SOS Monitoring' },
    { key: 'logs', icon: '📜', label: 'System Monitoring' }
  ];

  return (
    <main className="admin-dashboard page-content">
      {/* Toast notification */}
      {toast && (
        <div className={`admin-toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}

      {/* Dashboard header */}
      <div className="admin-dashboard-header">
        <div>
          <h1>🛡️ JanaoBangla Admin Command Center</h1>
          <p>System monitoring, civic reports verification, user administration & SOS tracking — Welcome, {user?.name || 'Administrator'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="admin-header-badge">
            🛡️ Role: {user?.role?.toUpperCase() || 'ADMIN'}
          </span>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`admin-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="admin-tab-icon">{tab.icon}</span>
            <span className="admin-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && <OverviewStatsTab stats={stats} isLoading={statsLoading} />}
      {activeTab === 'reports' && <AdminReportManagementTable showToast={showToast} />}
      {activeTab === 'users' && <AdminUserManagementTable showToast={showToast} />}
      {activeTab === 'comments' && <AdminCommentMonitoring showToast={showToast} />}
      {activeTab === 'sos' && <AdminSOSRequestMonitoring showToast={showToast} />}
      {activeTab === 'logs' && <AdminSystemMonitoring />}
    </main>
  );
}

export default AdminDashboardPage;
