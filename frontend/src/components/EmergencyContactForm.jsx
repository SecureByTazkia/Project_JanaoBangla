// ==========================================
// JanaoBangla — EmergencyContactForm Component
// BRANCH: feature-women-safety-sos-and-emergency-notifications
// Ei component ta notun emergency contact add ba existing contact edit korar form render kore
// Validation (Phone/Email/Name), Primary contact flag, submission handler sob ekhane
// ==========================================

import { useState, useEffect } from 'react';
import { addEmergencyContact, updateEmergencyContact } from '../services/WomenSafetySOSService';

function EmergencyContactForm({ initialContact = null, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Family',
    isPrimary: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // useEffect — Jodi edit mode hoy tahole existing contact er data form e load kora
  // ==========================================
  useEffect(() => {
    if (initialContact) {
      setFormData({
        name: initialContact.name || '',
        phone: initialContact.phone || '',
        email: initialContact.email || '',
        relationship: initialContact.relationship || 'Family',
        isPrimary: Boolean(initialContact.is_primary)
      });
    }
  }, [initialContact]);

  // ==========================================
  // handleChange — Input change handle kora
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // ==========================================
  // handleSubmit — Form submit kore backend e add ba update request pathano
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation checks
    if (!formData.name.trim()) {
      setError('Contact full name is required');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Contact phone number is required');
      return;
    }

    setLoading(true);
    try {
      if (initialContact && initialContact.id) {
        // Edit mode: Update API call
        const res = await updateEmergencyContact(initialContact.id, formData);
        if (res.success && onSuccess) {
          onSuccess(res.data.contact, 'updated');
        }
      } else {
        // Create mode: Add API call
        const res = await addEmergencyContact(formData);
        if (res.success && onSuccess) {
          onSuccess(res.data.contact, 'created');
        }
      }
    } catch (err) {
      console.error('Contact form save error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save emergency contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white rounded-3 border shadow-sm" id="emergency-contact-form">
      <h6 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
        <span>{initialContact ? '✏️' : '➕'}</span>
        {initialContact ? 'Edit Emergency Contact' : 'Add New Emergency Contact'}
      </h6>

      {error && (
        <div className="alert alert-danger py-2 small mb-3">
          {error}
        </div>
      )}

      <div className="row g-3">
        {/* Name */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="contact-name-input"
            className="form-control form-control-sm"
            placeholder="e.g. Ayesha Rahman"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary">
            Phone Number (SMS Alert) <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            id="contact-phone-input"
            className="form-control form-control-sm"
            placeholder="e.g. 01712345678"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary">
            Email Address (Email Alert)
          </label>
          <input
            type="email"
            name="email"
            id="contact-email-input"
            className="form-control form-control-sm"
            placeholder="e.g. ayesha@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Relationship */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary">
            Relationship
          </label>
          <select
            name="relationship"
            id="contact-relationship-select"
            className="form-select form-select-sm"
            value={formData.relationship}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="Parent">Parent (মা / বাবা)</option>
            <option value="Spouse">Spouse (স্বামী / স্ত্রী)</option>
            <option value="Sibling">Sibling (ভাই / বোন)</option>
            <option value="Friend">Friend (বন্ধু)</option>
            <option value="Colleague">Colleague (সহকর্মী)</option>
            <option value="Other">Other (অন্যান্য)</option>
          </select>
        </div>

        {/* Primary Contact Toggle */}
        <div className="col-12">
          <div className="form-check">
            <input
              type="checkbox"
              name="isPrimary"
              id="contact-is-primary-check"
              className="form-check-input"
              checked={formData.isPrimary}
              onChange={handleChange}
              disabled={loading}
            />
            <label className="form-check-label small text-dark fw-semibold" htmlFor="contact-is-primary-check">
              Set as Primary Contact (Will be notified first with highest priority)
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top">
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          id="save-emergency-contact-btn"
          className="btn btn-primary btn-sm px-3 fw-bold"
          style={{ backgroundColor: '#006A4E', borderColor: '#006A4E' }}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-1"></span>
              Saving...
            </>
          ) : (
            initialContact ? 'Update Contact' : 'Save Contact'
          )}
        </button>
      </div>
    </form>
  );
}

export default EmergencyContactForm;
