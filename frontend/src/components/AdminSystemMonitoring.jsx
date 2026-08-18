// ==========================================
// JanaoBangla — Admin System Monitoring Component
// BRANCH: feature-admin-dashboard-and-system-monitoring
// System-er important activities, health, ebong live statistics monitor kore
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

function AdminSystemMonitoring() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // System logs & stats fetch korar function
  const fetchSystemData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [logsData, statsData] = await Promise.all([
        AdminDashboardService.getSystemLogs(),
        AdminDashboardService.getOverviewStats()
      ]);
      setLogs(logsData.logs || []);
      setStats(statsData.stats || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system monitoring data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSystemData();
  }, [fetchSystemData]);

  // Activity log icon & details formatting
  const getActivityDisplay = (log) => {
    if (log.event_type === 'USER_REGISTERED') {
      return {
        icon: '👤',
        iconClass: 'event-user',
        title: `Citizen Registered: ${log.name}`,
        meta: `Email: ${log.email} • Role: ${log.role}`
      };
    }
    if (log.event_type === 'REPORT_SUBMITTED') {
      return {
        icon: '📋',
        iconClass: 'event-report',
        title: `Civic Report Logged: ${log.title}`,
        meta: `Category: ${log.category} • Status: ${log.status}`
      };
    }
    if (log.event_type === 'SOS_ACTIVATED') {
      return {
        icon: '🚨',
        iconClass: 'event-sos',
        title: `Emergency SOS Alert Triggered by User #${log.user_id}`,
        meta: `Status: ${log.status}`
      };
    }
    return {
      icon: '📌',
      iconClass: 'event-report',
      title: 'System Activity Event',
      meta: ''
    };
  };

  if (isLoading) {
    return (
      <div className="admin-section">
        <div className="admin-section-body">
          <LoadingSpinner message="Checking system activity & health..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-section">
        <div className="admin-section-body">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  const s = stats || {};

  return (
    <div>
      {/* System Health / Status Indicators */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card-icon success">🟢</div>
          <div className="admin-stat-value">Operational</div>
          <div className="admin-stat-label">API Server Status</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-icon primary">🗄️</div>
          <div className="admin-stat-value">Connected</div>
          <div className="admin-stat-label">MySQL Database</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-icon info">💬</div>
          <div className="admin-stat-value">{s.totalComments || 0}</div>
          <div className="admin-stat-label">Total Comments Logged</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card-icon danger">🚨</div>
          <div className="admin-stat-value">{s.activeSos || 0}</div>
          <div className="admin-stat-label">Active SOS Alerts</div>
        </div>
      </div>

      {/* Activity Logs Timeline */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h3 className="admin-section-title">📜 Real-time System Activity Timeline</h3>
          <button className="admin-action-btn btn-outline btn-sm" onClick={fetchSystemData}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-section-body">
          {logs.length === 0 ? (
            <div className="admin-empty-state">
              <div className="admin-empty-icon">📜</div>
              <div className="admin-empty-text">No recent activity logged in the system.</div>
            </div>
          ) : (
            <ul className="admin-activity-list">
              {logs.map((log, idx) => {
                const display = getActivityDisplay(log);
                return (
                  <li className="admin-activity-item" key={idx}>
                    <div className={`admin-activity-icon ${display.iconClass}`}>
                      {display.icon}
                    </div>
                    <div className="admin-activity-content">
                      <div className="admin-activity-title">{display.title}</div>
                      <div className="admin-activity-meta">
                        {display.meta} • ⏱️ {formatDate(log.created_at)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminSystemMonitoring;
