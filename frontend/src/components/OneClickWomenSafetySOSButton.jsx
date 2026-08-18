// ==========================================
// JanaoBangla — OneClickWomenSafetySOSButton Component
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei component ta main SOS emergency trigger button render kore
// Single-click / confirmation modal flow, browser GPS detection, ar alert dispatch handle kore
// ==========================================

import { useState, useEffect } from 'react';
import { triggerSOS, getCurrentLocation, getActiveSOSStatus, resolveSOS, cancelSOS } from '../services/WomenSafetySOSService';

function OneClickWomenSafetySOSButton({ onSOSTriggered, onStatusChanged, emergencyContactsCount = 0 }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationStep, setLocationStep] = useState('idle'); // idle | fetching_gps | sending_alert | done | error
  const [locationError, setLocationError] = useState(null);
  const [activeSOS, setActiveSOS] = useState(null);
  const [alertSuccessData, setAlertSuccessData] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================
  // useEffect — Initial mount e user er active SOS ache kina check kora
  // ==========================================
  useEffect(() => {
    checkActiveSOS();
  }, []);

  // ==========================================
  // checkActiveSOS — Active SOS status backend theke fetch kore
  // ==========================================
  const checkActiveSOS = async () => {
    try {
      // Backend theke active SOS check kora hocche
      const res = await getActiveSOSStatus();
      if (res.success && res.data.hasActiveSOS) {
        setActiveSOS(res.data.activeRequest);
      } else {
        setActiveSOS(null);
      }
    } catch (err) {
      console.error('Active SOS check failed:', err);
    }
  };

  // ==========================================
  // handleSOSButtonClick — SOS button click korle confirmation modal open kore
  // ==========================================
  const handleSOSButtonClick = () => {
    setLocationError(null);
    setShowConfirmModal(true);
  };

  // ==========================================
  // handleConfirmSOS — User confirm korle GPS location neya ar backend e SOS pathano
  // ==========================================
  const handleConfirmSOS = async () => {
    setLoading(true);
    setLocationError(null);
    setLocationStep('fetching_gps');

    let coordinates = { latitude: null, longitude: null, locationAddress: null };

    try {
      // Step 1: Browser Geolocation theke accurate GPS newa
      try {
        const coords = await getCurrentLocation();
        coordinates.latitude = coords.latitude;
        coordinates.longitude = coords.longitude;
        coordinates.locationAddress = `GPS: ${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)} (Accuracy: ${Math.round(coords.accuracy)}m)`;
      } catch (geoErr) {
        console.warn('Geolocation warning:', geoErr.message);
        // Geolocation block thakleo SOS trigger allow korbo fallback hishebe
        coordinates.locationAddress = 'Location permission denied / unavailable';
      }

      // Step 2: Backend e SOS request dispatch kora
      setLocationStep('sending_alert');
      const response = await triggerSOS(coordinates);

      if (response.success) {
        setLocationStep('done');
        setShowConfirmModal(false);
        setActiveSOS(response.data.request);
        setAlertSuccessData(response.data);
        if (onSOSTriggered) {
          onSOSTriggered(response.data);
        }
      } else {
        throw new Error(response.message || 'Failed to dispatch SOS alert');
      }
    } catch (err) {
      console.error('SOS dispatch error:', err);
      setLocationError(err.response?.data?.message || err.message || 'Failed to send SOS emergency alert.');
      setLocationStep('error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // handleResolveSOS — Active SOS resolve kora (user safe)
  // ==========================================
  const handleResolveSOS = async (requestId) => {
    if (!window.confirm('Are you sure you are safe and want to resolve this SOS alert?')) return;
    setActionLoading(true);
    try {
      // Backend e SOS resolve request pathano hocche
      await resolveSOS(requestId);
      setActiveSOS(null);
      setAlertSuccessData(null);
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve SOS');
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // handleCancelSOS — Active SOS cancel kora (mistake/test)
  // ==========================================
  const handleCancelSOS = async (requestId) => {
    if (!window.confirm('Cancel this active SOS alert? (Contacts will see it was cancelled)')) return;
    setActionLoading(true);
    try {
      // Backend e SOS cancel request pathano hocche
      await cancelSOS(requestId);
      setActiveSOS(null);
      setAlertSuccessData(null);
      if (onStatusChanged) onStatusChanged();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel SOS');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="sos-button-container text-center my-4">
      {/* Active SOS Warning Alert Banner */}
      {activeSOS && (
        <div className="alert alert-danger shadow-sm border-danger p-3 mb-4 text-start animate__animated animate__pulse animate__infinite">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <span style={{ fontSize: '2rem' }}>🚨</span>
              <div>
                <h5 className="mb-0 text-danger fw-bold">ACTIVE SOS EMERGENCY IN PROGRESS</h5>
                <small className="text-muted">
                  Alert ID: #SOS-{activeSOS.id} &bull; Triggered: {new Date(activeSOS.created_at).toLocaleTimeString()}
                </small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                id="resolve-sos-btn"
                className="btn btn-success btn-sm fw-bold"
                onClick={() => handleResolveSOS(activeSOS.id)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Updating...' : '✅ I Am Safe (Resolve SOS)'}
              </button>
              <button
                id="cancel-sos-btn"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleCancelSOS(activeSOS.id)}
                disabled={actionLoading}
              >
                Cancel Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main SOS Big Button */}
      <div className="d-flex flex-column align-items-center justify-content-center">
        <button
          id="main-one-click-sos-btn"
          className="btn btn-danger rounded-circle shadow-lg d-flex flex-column align-items-center justify-content-center"
          style={{
            width: '180px',
            height: '180px',
            backgroundColor: '#FF1744',
            borderColor: '#D50032',
            borderWidth: '6px',
            boxShadow: '0 0 25px rgba(255, 23, 68, 0.45)',
            transition: 'all 0.2s ease-in-out',
            cursor: activeSOS ? 'not-allowed' : 'pointer',
            opacity: activeSOS ? 0.7 : 1
          }}
          onClick={handleSOSButtonClick}
          disabled={Boolean(activeSOS) || loading}
          title={activeSOS ? 'An SOS is currently active' : 'Click to send instant emergency alert'}
        >
          <span style={{ fontSize: '3rem', lineHeight: '1' }}>🆘</span>
          <span className="fw-bolder fs-4 tracking-wider mt-1 text-white">EMERGENCY</span>
          <small style={{ fontSize: '0.75rem', letterSpacing: '1px' }} className="text-white-50">
            {activeSOS ? 'ACTIVE' : 'ONE-CLICK SOS'}
          </small>
        </button>

        <p className="mt-3 text-muted small" style={{ maxWidth: '420px' }}>
          {emergencyContactsCount > 0 ? (
            <span>
              🔒 Pressing SOS will instantly capture your GPS coordinates and notify your <strong>{emergencyContactsCount} trusted contact(s)</strong> via SMS and Email.
            </span>
          ) : (
            <span className="text-warning fw-semibold">
              ⚠️ You have 0 emergency contacts added. Please add at least 1 contact below to receive emergency notifications.
            </span>
          )}
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-danger border-2 shadow-lg">
              <div className="modal-header bg-danger text-white py-3">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <span>🚨</span> CONFIRM EMERGENCY SOS ALERT
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => !loading && setShowConfirmModal(false)}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body p-4 text-start">
                <p className="fw-semibold text-dark fs-6 mb-3">
                  Are you in immediate danger or need emergency assistance?
                </p>
                <div className="bg-light p-3 rounded-3 border mb-3">
                  <ul className="mb-0 text-secondary small ps-3">
                    <li>Your real-time GPS coordinates will be captured via Browser Geolocation.</li>
                    <li>Emergency notification messages will be dispatched immediately to all your registered emergency contacts.</li>
                    <li>Authorities / System monitors can view active emergency markers.</li>
                  </ul>
                </div>

                {locationStep === 'fetching_gps' && (
                  <div className="alert alert-info py-2 d-flex align-items-center gap-2 small">
                    <span className="spinner-border spinner-border-sm text-info"></span>
                    <span>Acquiring high-accuracy GPS coordinates...</span>
                  </div>
                )}

                {locationStep === 'sending_alert' && (
                  <div className="alert alert-warning py-2 d-flex align-items-center gap-2 small">
                    <span className="spinner-border spinner-border-sm text-warning"></span>
                    <span>Dispatching SMS & Email emergency notifications...</span>
                  </div>
                )}

                {locationError && (
                  <div className="alert alert-danger py-2 small">
                    <strong>Error:</strong> {locationError}
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light p-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-sos-dispatch-btn"
                  className="btn btn-danger fw-bold px-4"
                  style={{ backgroundColor: '#FF1744' }}
                  onClick={handleConfirmSOS}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending Alert...
                    </>
                  ) : (
                    'YES, SEND SOS ALERT NOW'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OneClickWomenSafetySOSButton;
