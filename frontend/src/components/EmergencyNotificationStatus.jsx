// ==========================================
// JanaoBangla — EmergencyNotificationStatus Component
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei component ta SOS alert dispatch status (SMS/Email) ar emergency history render kore
// ==========================================

import { useState, useEffect } from 'react';
import { getSOSHistory } from '../services/WomenSafetySOSService';

function EmergencyNotificationStatus({ lastSOSResult = null, refreshTrigger = 0 }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================
  // useEffect — Mount ba refreshTrigger change hole SOS history load kora
  // ==========================================
  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger, lastSOSResult]);

  // ==========================================
  // fetchHistory — Backend theke user er previous SOS requests fetch kora
  // ==========================================
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend theke history fetch kora hocche
      const res = await getSOSHistory(10, 0);
      if (res.success) {
        setHistory(res.data.requests || []);
      }
    } catch (err) {
      console.error('Fetch SOS history error:', err);
      setError(err.response?.data?.message || 'Failed to load SOS history');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // getStatusBadge — Status anujayee colored badge return kore
  // ==========================================
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-danger">🚨 Active Alert</span>;
      case 'resolved':
        return <span className="badge bg-success">✅ Resolved</span>;
      case 'cancelled':
        return <span className="badge bg-secondary">❌ Cancelled</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  return (
    <div className="emergency-status-section" id="emergency-notification-status-section">
      {/* Last Triggered SOS Notification Breakdown (If available) */}
      {lastSOSResult && (
        <div className="card border-0 shadow-sm mb-4" style={{ borderLeft: '4px solid #FF1744' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <h6 className="fw-bold mb-0 text-danger d-flex align-items-center gap-2">
                <span>📡</span> Latest SOS Dispatch Summary (#SOS-{lastSOSResult.request?.id || lastSOSResult.requestId})
              </h6>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                Triggered Just Now
              </span>
            </div>

            <div className="row g-3">
              {/* Contacts Notified */}
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <div className="fs-4 mb-1">👥</div>
                  <div className="fw-bold text-dark">{lastSOSResult.contactsNotified ?? 0} Contact(s)</div>
                  <small className="text-secondary">Alerts Dispatched</small>
                </div>
              </div>

              {/* SMS Status */}
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <div className="fs-4 mb-1">📱</div>
                  <div className="fw-bold text-dark">
                    {lastSOSResult.smsSent ? (
                      <span className="text-success">Delivered / Queued</span>
                    ) : (
                      <span className="text-warning">Provider Logged (Simulated)</span>
                    )}
                  </div>
                  <small className="text-secondary">SMS Alert Service</small>
                </div>
              </div>

              {/* Email Status */}
              <div className="col-sm-4">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <div className="fs-4 mb-1">📧</div>
                  <div className="fw-bold text-dark">
                    {lastSOSResult.emailSent ? (
                      <span className="text-success">Sent to Contacts</span>
                    ) : (
                      <span className="text-muted">SMTP Abstracted (Dev)</span>
                    )}
                  </div>
                  <small className="text-secondary">Email Alert Service</small>
                </div>
              </div>
            </div>

            {/* GPS Location details if present */}
            {lastSOSResult.location && (
              <div className="mt-3 p-2 bg-light rounded border d-flex align-items-center justify-content-between flex-wrap gap-2 small">
                <div className="d-flex align-items-center gap-2 text-dark">
                  <span>📍</span>
                  <span><strong>Dispatched Location:</strong> {lastSOSResult.location.locationString || 'GPS Captured'}</span>
                </div>
                {lastSOSResult.location.googleMapsLink && (
                  <a
                    href={lastSOSResult.location.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary py-0 px-2 fw-semibold"
                  >
                    View Map ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emergency Request History */}
      <div className="card bg-white rounded-3 border shadow-sm p-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
          <div>
            <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <span>📜</span> Emergency SOS History
            </h5>
            <p className="text-secondary small mb-0">
              Audit log of all SOS alerts previously triggered from your account.
            </p>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            onClick={fetchHistory}
            disabled={loading}
          >
            <span>🔄</span> Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4 text-secondary">
            <span className="spinner-border spinner-border-sm me-2 text-danger"></span>
            Loading emergency history...
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            <span>🛡️</span> No emergency alerts have been triggered from this account.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th>Alert ID</th>
                  <th>Status</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Notifications</th>
                </tr>
              </thead>
              <tbody>
                {history.map((req) => (
                  <tr key={req.id}>
                    <td className="fw-bold text-danger">#SOS-{req.id}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td className="text-secondary">
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td>
                      {req.latitude && req.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${req.latitude},${req.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-decoration-none text-primary fw-semibold d-inline-flex align-items-center gap-1"
                        >
                          <span>📍</span> {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                        </a>
                      ) : (
                        <span className="text-muted">No GPS coordinates</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <span
                          className={`badge ${req.sms_sent ? 'bg-success-subtle text-success' : 'bg-light text-secondary'} border`}
                          title="SMS Status"
                        >
                          📱 {req.sms_sent ? 'SMS Sent' : req.sms_status || 'SMS Queued'}
                        </span>
                        <span
                          className={`badge ${req.email_sent ? 'bg-info-subtle text-info' : 'bg-light text-secondary'} border`}
                          title="Email Status"
                        >
                          📧 {req.email_sent ? 'Email Sent' : req.email_status || 'Email Logged'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmergencyNotificationStatus;
