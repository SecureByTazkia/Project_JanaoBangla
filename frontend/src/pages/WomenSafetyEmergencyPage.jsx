// ==========================================
// JanaoBangla — WomenSafetyEmergencyPage Page
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Main Women Safety & Emergency SOS page
// Integrates: OneClickWomenSafetySOSButton, EmergencyContactManagement, EmergencyNotificationStatus, National Helplines
// ==========================================

import { useState } from 'react';
import OneClickWomenSafetySOSButton from '../components/OneClickWomenSafetySOSButton';
import EmergencyContactManagement from '../components/EmergencyContactManagement';
import EmergencyNotificationStatus from '../components/EmergencyNotificationStatus';

function WomenSafetyEmergencyPage() {
  const [lastSOSResult, setLastSOSResult] = useState(null);
  const [contactsCount, setContactsCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ==========================================
  // handleSOSTriggered — SOS trigger successful hole state update kora
  // ==========================================
  const handleSOSTriggered = (data) => {
    setLastSOSResult(data);
    setRefreshTrigger((prev) => prev + 1);
  };

  // ==========================================
  // handleStatusChanged — SOS resolve ba cancel hole history refresh kora
  // ==========================================
  const handleStatusChanged = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="page-content py-4" style={{ backgroundColor: '#F8FAFC', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Page Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center p-2 rounded-circle mb-2" style={{ backgroundColor: '#FFE4E6' }}>
            <span style={{ fontSize: '2.2rem' }}>🚨</span>
          </div>
          <h1 className="fw-bold text-dark mb-1" style={{ fontSize: '2rem' }}>
            Women Safety &amp; Emergency SOS
          </h1>
          <p className="text-secondary mb-0" style={{ maxWidth: '600px', margin: '0 auto' }}>
            In an emergency situation, activate instant one-click SOS to share your live GPS location with your trusted contacts and safety networks.
          </p>
        </div>

        {/* National Emergency Helplines Bangladesh */}
        <div className="card border-0 shadow-sm rounded-3 mb-4 text-white" style={{ backgroundColor: '#004D3A' }}>
          <div className="card-body p-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fs-4">🇧🇩</span>
                <div>
                  <h6 className="fw-bold mb-0 text-white">Bangladesh National Emergency Helplines</h6>
                  <small className="text-white-50">Toll-free emergency numbers available 24/7</small>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <a
                  href="tel:999"
                  className="btn btn-light btn-sm fw-bold px-3 d-inline-flex align-items-center gap-1"
                  style={{ color: '#004D3A' }}
                >
                  <span>📞</span> 999 (National Emergency)
                </a>
                <a
                  href="tel:109"
                  className="btn btn-warning btn-sm fw-bold px-3 d-inline-flex align-items-center gap-1"
                >
                  <span>🛡️</span> 109 (Women &amp; Child Helpline)
                </a>
                <a
                  href="tel:1098"
                  className="btn btn-outline-light btn-sm fw-bold px-3 d-inline-flex align-items-center gap-1"
                >
                  <span>🧒</span> 1098 (Child Helpline)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Big One-Click SOS Trigger Button Component */}
        <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
          <OneClickWomenSafetySOSButton
            emergencyContactsCount={contactsCount}
            onSOSTriggered={handleSOSTriggered}
            onStatusChanged={handleStatusChanged}
          />
        </div>

        {/* Emergency Contacts Management Component */}
        <div className="mb-4">
          <EmergencyContactManagement
            onContactsCountChange={setContactsCount}
          />
        </div>

        {/* Emergency Notification & History Status Component */}
        <div className="mb-4">
          <EmergencyNotificationStatus
            lastSOSResult={lastSOSResult}
            refreshTrigger={refreshTrigger}
          />
        </div>

      </div>
    </main>
  );
}

export default WomenSafetyEmergencyPage;
