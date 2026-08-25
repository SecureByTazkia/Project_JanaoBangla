// ==========================================
// JanaoBangla — EmergencyContactManagement Component
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei component ta user er sob emergency contacts view, add, edit, ar delete korar management dashboard render kore
// ==========================================

import { useState, useEffect } from 'react';
import { getEmergencyContacts, deleteEmergencyContact } from '../services/WomenSafetySOSService';
import EmergencyContactForm from './EmergencyContactForm';

function EmergencyContactManagement({ onContactsCountChange }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  // ==========================================
  // useEffect — Initial mount e user er contacts list fetch kora
  // ==========================================
  useEffect(() => {
    fetchContacts();
  }, []);

  // ==========================================
  // fetchContacts — Backend theke sob emergency contacts fetch kore state e rakha
  // ==========================================
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend theke contacts list fetch kora hocche
      const res = await getEmergencyContacts();
      if (res.success) {
        const list = res.data.contacts || [];
        setContacts(list);
        if (onContactsCountChange) {
          onContactsCountChange(list.length);
        }
      }
    } catch (err) {
      console.error('Fetch emergency contacts failed:', err);
      setError(err.response?.data?.message || 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // handleDeleteContact — Specific emergency contact delete kora
  // ==========================================
  const handleDeleteContact = async (contactId, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your emergency contacts?`)) {
      return;
    }

    setDeleteLoadingId(contactId);
    try {
      // Backend e delete request pathano hocche
      await deleteEmergencyContact(contactId);
      const updated = contacts.filter((c) => c.id !== contactId);
      setContacts(updated);
      if (onContactsCountChange) {
        onContactsCountChange(updated.length);
      }
    } catch (err) {
      console.error('Delete contact failed:', err);
      alert(err.response?.data?.message || 'Failed to delete contact');
    } finally {
      setDeleteLoadingId(null);
    }
  };

  // ==========================================
  // handleFormSuccess — Form submit successful hole list refresh kora
  // ==========================================
  const handleFormSuccess = () => {
    setIsAdding(false);
    setEditingContact(null);
    fetchContacts();
  };

  return (
    <div className="emergency-contacts-card bg-white rounded-3 border p-4 shadow-sm" id="emergency-contact-management-section">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
            <span>🛡️</span> Emergency Contacts
          </h5>
          <p className="text-secondary small mb-0">
            People who will receive immediate SMS & Email alerts with your live location during an SOS emergency.
          </p>
        </div>

        {!isAdding && !editingContact && (
          <button
            id="add-new-contact-btn"
            className="btn btn-sm btn-primary fw-semibold d-flex align-items-center gap-1"
            style={{ backgroundColor: '#006A4E', borderColor: '#006A4E' }}
            onClick={() => setIsAdding(true)}
            disabled={contacts.length >= 5}
          >
            <span>➕</span> Add Contact {contacts.length > 0 && `(${contacts.length}/5)`}
          </button>
        )}
      </div>

      {/* Inline Form (Add Mode) */}
      {isAdding && (
        <div className="mb-4">
          <EmergencyContactForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      )}

      {/* Inline Form (Edit Mode) */}
      {editingContact && (
        <div className="mb-4">
          <EmergencyContactForm
            initialContact={editingContact}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditingContact(null)}
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-4 text-secondary">
          <span className="spinner-border spinner-border-sm me-2 text-success"></span>
          Loading trusted contacts...
        </div>
      ) : contacts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-4 bg-light rounded-3 border border-dashed">
          <span style={{ fontSize: '2.5rem' }}>👥</span>
          <h6 className="fw-bold mt-2 text-dark">No Emergency Contacts Registered</h6>
          <p className="text-muted small mb-3" style={{ maxWidth: '380px', margin: '0 auto' }}>
            Add close family members, friends, or trusted guardians so they are notified immediately if you trigger an SOS.
          </p>
          {!isAdding && (
            <button
              className="btn btn-sm btn-outline-success fw-semibold"
              onClick={() => setIsAdding(true)}
            >
              ➕ Add First Contact
            </button>
          )}
        </div>
      ) : (
        /* Contacts List */
        <div className="row g-3">
          {contacts.map((contact) => (
            <div key={contact.id} className="col-md-6">
              <div
                className={`p-3 rounded-3 border h-100 position-relative ${
                  contact.is_primary ? 'border-success bg-light' : 'bg-white'
                }`}
                style={{
                  borderLeftWidth: contact.is_primary ? '4px' : '1px',
                  borderLeftColor: contact.is_primary ? '#006A4E' : '#E2E8F0'
                }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="fw-bold mb-0 text-dark">{contact.name}</h6>
                      {contact.is_primary ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small">
                          ⭐ Primary Contact
                        </span>
                      ) : null}
                    </div>
                    <span className="badge bg-secondary-subtle text-secondary small mb-2">
                      {contact.relationship || 'Contact'}
                    </span>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-secondary py-0 px-2"
                      title="Edit Contact"
                      onClick={() => {
                        setIsAdding(false);
                        setEditingContact(contact);
                      }}
                      disabled={deleteLoadingId === contact.id}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger py-0 px-2"
                      title="Delete Contact"
                      onClick={() => handleDeleteContact(contact.id, contact.name)}
                      disabled={deleteLoadingId === contact.id}
                    >
                      {deleteLoadingId === contact.id ? (
                        <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px' }}></span>
                      ) : (
                        '🗑️'
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-secondary small">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span>📞</span>
                    <a href={`tel:${contact.phone}`} className="text-decoration-none fw-semibold text-dark">
                      {contact.phone}
                    </a>
                  </div>
                  {contact.email ? (
                    <div className="d-flex align-items-center gap-2">
                      <span>✉️</span>
                      <span className="text-truncate">{contact.email}</span>
                    </div>
                  ) : (
                    <div className="text-muted fst-italic" style={{ fontSize: '0.8rem' }}>
                      (No email provided — SMS only)
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EmergencyContactManagement;
