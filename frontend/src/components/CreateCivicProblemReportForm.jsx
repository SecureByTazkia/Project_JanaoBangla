// ==========================================
// JanaoBangla — Create Civic Problem Report Form
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Civic problem reporting with integrated AI Content Safety & Nudity Moderation
// ==========================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CivicProblemReportService from '../services/CivicProblemReportService';
import AICivicProblemService from '../services/AICivicProblemService';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';
import LocationMapPicker from './LocationMapPicker';
import '../styles/ai.css';

const CreateCivicProblemReportForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road_damage',
    visibility: 'public',
    isAnonymous: false,
    latitude: '',
    longitude: '',
    address: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [safetyWarning, setSafetyWarning] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isScanningSafety, setIsScanningSafety] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // handleChange — Form input field changes
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==========================================
  // handleFileChange — Evidence photo/video selection with instant AI Safety Moderation scan
  // ==========================================
  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);
    setSafetyWarning(null);

    // Instant scan for image files to catch nudity/adult content early
    const imageFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      setIsScanningSafety(true);
      try {
        for (const imgFile of imageFiles) {
          const scanRes = await AICivicProblemService.moderateUploadedImage(imgFile);
          if (scanRes && scanRes.isSafe === false) {
            setSafetyWarning(scanRes.reason || scanRes.reasonBn || 'Inappropriate or adult content detected. Please remove the photo.');
            setFiles([]);
            e.target.value = '';
            break;
          }
        }
      } catch (scanErr) {
        // If pre-scan fails (e.g. network), backend will still enforce safety check on submission
        console.warn('Safety pre-scan skipped or failed:', scanErr.message);
      } finally {
        setIsScanningSafety(false);
      }
    }
  };

  // ==========================================
  // handleSubmit — Complete form data submission
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSafetyWarning(null);
    setSuccess(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('visibility', formData.visibility);
      data.append('isAnonymous', formData.isAnonymous ? 'true' : 'false');
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      if (formData.address) data.append('address', formData.address);

      // Append evidence files
      files.forEach(file => {
        data.append('evidence', file);
      });

      await CivicProblemReportService.submitReport(data);
      setSuccess('Civic problem reported successfully! Your report has been published.');
      setTimeout(() => {
        navigate('/my-reports');
      }, 1800);
    } catch (err) {
      const serverData = err.response?.data;
      if (serverData?.isUnsafe || serverData?.flagType === 'nudity' || serverData?.messageBn) {
        setSafetyWarning(
          serverData.error + (serverData.messageBn ? ` (${serverData.messageBn})` : '')
        );
      } else {
        setError(serverData?.error || 'An error occurred while submitting the report.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm p-4" style={{ borderRadius: '12px', border: '1px solid #E2E8F0' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div>
          <h3 className="text-primary-dark mb-0 fw-bold">Report a Civic Problem</h3>
          <small className="text-muted">Fill in the details below to report a civic issue in your community.</small>
        </div>
        <span className="badge bg-light text-primary border border-primary p-2" style={{ fontSize: '0.8rem' }}>
          🛡️ AI Content Safety Protected
        </span>
      </div>

      {error && <ErrorMessage message={error} />}
      {safetyWarning && (
        <div className="alert alert-danger d-flex align-items-start gap-2 shadow-sm mb-3" style={{ borderRadius: '8px', borderLeft: '4px solid #DC2626' }}>
          <span style={{ fontSize: '1.4rem' }}>🚫</span>
          <div>
            <h6 className="alert-heading mb-1 fw-bold text-danger">Content Safety Violation</h6>
            <p className="mb-0" style={{ fontSize: '0.9rem' }}>{safetyWarning}</p>
          </div>
        </div>
      )}
      {success && <SuccessMessage message={success} />}

      <form onSubmit={handleSubmit}>
        {/* Evidence Upload Section */}
        <div className="mb-3 p-3 border rounded bg-light" style={{ borderColor: '#CBD5E1' }}>
          <label className="form-label fw-bold d-flex justify-content-between align-items-center">
            <span>📷 Evidence Photo / Video</span>
            {isScanningSafety && (
              <span className="badge bg-warning text-dark" style={{ fontSize: '0.75rem' }}>
                🔍 AI Safety Scanning...
              </span>
            )}
          </label>
          <input
            type="file"
            className="form-control"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isScanningSafety}
          />
          {files.length > 0 && (
            <small className="text-success mt-1 d-block fw-bold">
              ✓ {files.length} file(s) selected and verified for upload.
            </small>
          )}
          <small className="text-muted mt-2 d-block" style={{ fontSize: '0.78rem' }}>
            🔒 <strong>Strict Content Safety:</strong> Adult materials, nudity, or inappropriate content are strictly prohibited and automatically scanned/blocked by AI moderation.
          </small>
        </div>

        {/* Problem Title */}
        <div className="mb-3">
          <label className="form-label fw-bold">Problem Title *</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="E.g., Severe Road Damage and Potholes on Mirpur-10 Main Road"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-bold mb-1">Description *</label>
          <textarea
            className="form-control"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the civic problem in detail (landmarks, hazard level, impact on citizens)..."
          ></textarea>
        </div>

        {/* Category & Visibility Selectors */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Category *</label>
            <select
              className="form-select"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="road_damage">🛣️ Road Damage (সড়ক ক্ষতিগ্রস্ত)</option>
              <option value="garbage_waste">🗑️ Garbage / Waste (ময়লা-আবর্জনা)</option>
              <option value="street_light">💡 Street Light (রাস্তার বাতি)</option>
              <option value="water_drainage">🌊 Water / Drainage (পানি নিষ্কাশন)</option>
              <option value="traffic_accident">🚦 Traffic / Accident (যানজট ও দুর্ঘটনা)</option>
              <option value="public_safety">🛡️ Public Safety (জননিরাপত্তা)</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Visibility *</label>
            <select
              className="form-select"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="public">Public (Visible to Community & Map)</option>
              <option value="private">Private (Only Admins & Authorities)</option>
            </select>
            <small className="text-muted">Private reports won't appear on the public map.</small>
          </div>
        </div>

        {/* Reporter Identity — Anonymous option */}
        <div className="mb-3 p-3 border rounded" style={{ backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }}>
          <label className="form-label fw-bold d-block mb-2">🔒 Reporter Identity</label>
          <div className="d-flex gap-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="isAnonymous"
                id="identityShow"
                value="false"
                checked={!formData.isAnonymous}
                onChange={() => setFormData(prev => ({ ...prev, isAnonymous: false }))}
              />
              <label className="form-check-label" htmlFor="identityShow">
                👤 Show my identity
              </label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="isAnonymous"
                id="identityAnonymous"
                value="true"
                checked={formData.isAnonymous}
                onChange={() => setFormData(prev => ({ ...prev, isAnonymous: true }))}
              />
              <label className="form-check-label" htmlFor="identityAnonymous">
                🕵️ Report anonymously
              </label>
            </div>
          </div>
          <small className="text-muted mt-1 d-block">
            Your identity will be hidden from other citizens, but authorized administrators can still identify the reporter when necessary.
          </small>
          {formData.isAnonymous && (
            <div className="alert alert-info py-1 px-2 mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
              🕵️ This report will appear as submitted by <strong>Anonymous Citizen</strong> to other users.
            </div>
          )}
        </div>

        {/* Location Picker */}
        <div className="mb-4">
          <label className="form-label fw-bold">Report Location Data *</label>
          <LocationMapPicker
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            onLocationSelect={({ latitude, longitude, address }) => {
              setFormData((prev) => ({
                ...prev,
                latitude,
                longitude,
                address: address || prev.address
              }));
            }}
          />
          <div className="mt-2">
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Detailed location/street address (e.g. Mirpur-10 Circle, Dhaka)"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-bold text-white shadow-sm"
          disabled={loading || isScanningSafety}
          style={{ borderRadius: '8px', fontSize: '1rem' }}
        >
          {loading ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <LoadingSpinner size="sm" /> Submitting Report...
            </span>
          ) : (
            '🚀 Submit Civic Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCivicProblemReportForm;
