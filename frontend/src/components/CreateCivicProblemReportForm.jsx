// ==========================================
// JanaoBangla — Create Civic Problem Report Form
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// Standard civic problem report submission form with duplicate detection & content safety
// ==========================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CivicProblemReportService from '../services/CivicProblemReportService';
import DuplicateReportDetectionService from '../services/DuplicateReportDetectionService';
import DuplicateReportWarning from './DuplicateReportWarning';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';
import LocationMapPicker from './LocationMapPicker';

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
  const [success, setSuccess] = useState(null);

  // Duplicate Detection States
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  
  const navigate = useNavigate();

  // ==========================================
  // handleChange — Form input field er change handle kore
  // ==========================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDuplicateDismissed(false);
  };

  // ==========================================
  // handleCheckDuplicates — Title, description ebong location niye duplicate API call kore
  // ==========================================
  const handleCheckDuplicates = async () => {
    if (!formData.title && !formData.description) {
      setError('Please enter a title or description first to check for duplicates.');
      return;
    }

    setIsCheckingDuplicates(true);
    setError(null);
    try {
      const data = await DuplicateReportDetectionService.checkDuplicates({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      if (data.success) {
        setDuplicateData(data);
        setDuplicateDismissed(false);
        if (data.similarReports && data.similarReports.length > 0) {
          setSelectedDuplicate(data.similarReports[0]);
        }
      }
    } catch (err) {
      console.warn('Duplicate check failed:', err.message);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // ==========================================
  // handleFileChange — User evidence photo/video select korle files state update kore
  // ==========================================
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);
  };

  // ==========================================
  // handleSelectDuplicateForLink — User existing report ke duplicate parent hisebe select korle
  // ==========================================
  const handleSelectDuplicateForLink = (report) => {
    setSelectedDuplicate(report);
  };

  // ==========================================
  // handleSubmit — Complete form data submit kore (content safety & duplicate linking shoho)
  // ==========================================
  const handleSubmit = async (e, forcedSubmit = false, linkWithReport = null) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setSuccess(null);

    // Jodi duplicate check kora na hoye thake ebong direct submit kora hoy, age duplicate check korbo
    const targetLink = linkWithReport || selectedDuplicate;
    if (!forcedSubmit && !duplicateDismissed && !duplicateData && formData.title) {
      try {
        setIsCheckingDuplicates(true);
        const dupCheck = await DuplicateReportDetectionService.checkDuplicates({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          latitude: formData.latitude,
          longitude: formData.longitude
        });

        if (dupCheck && dupCheck.hasDuplicate && dupCheck.similarReports?.length > 0) {
          setDuplicateData(dupCheck);
          setSelectedDuplicate(dupCheck.similarReports[0]);
          setIsCheckingDuplicates(false);
          return;
        }
      } catch (checkErr) {
        console.warn('Pre-submit duplicate check error:', checkErr.message);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }

    setLoading(true);

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

      // Duplicate linking parameters
      if (targetLink && targetLink.reportId) {
        data.append('duplicateOfId', targetLink.reportId);
        data.append('similarityScore', targetLink.similarityPercentage || 85);
      }

      // Add evidence files
      files.forEach(file => {
        data.append('evidence', file);
      });

      const res = await CivicProblemReportService.submitReport(data);
      const successMsg = targetLink
        ? `Report #${res.reportId} successfully linked as duplicate of #${targetLink.reportId}!`
        : 'Civic problem reported successfully!';

      setSuccess(successMsg);
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.isUnsafe || errData?.flagType) {
        setFiles([]);
        setError(
          errData.messageBn
            ? `🚫 ${errData.messageBn} (${errData.error || errData.message})`
            : (errData.error || errData.message || 'Inappropriate or adult image detected. Submission rejected.')
        );
      } else {
        setError(err.response?.data?.error || 'An error occurred while submitting the report.');
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
          <small className="text-muted">Fill in the details below to report a civic issue in your area.</small>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={handleCheckDuplicates}
            disabled={isCheckingDuplicates || (!formData.title && !formData.description)}
            title="Check if this problem is already reported nearby"
            style={{ fontSize: '0.8rem' }}
          >
            {isCheckingDuplicates ? '🔍 Checking...' : '🔍 Check Duplicates'}
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* Duplicate Report Warning Widget */}
      {duplicateData && duplicateData.similarReports?.length > 0 && !duplicateDismissed && (
        <DuplicateReportWarning
          duplicateData={duplicateData}
          selectedDuplicate={selectedDuplicate}
          onSelectDuplicateForLink={handleSelectDuplicateForLink}
          onSubmitAnyway={() => {
            setDuplicateDismissed(true);
            handleSubmit(null, true, null); // Forced submit as independent report
          }}
          onSubmitWithLink={() => {
            handleSubmit(null, true, selectedDuplicate); // Submit and link to chosen report
          }}
          onViewExistingReport={(reportId) => window.open(`/reports/${reportId}`, '_blank')}
          onDismiss={() => setDuplicateDismissed(true)}
        />
      )}

      <form onSubmit={(e) => handleSubmit(e, false, null)}>
        {/* Evidence Upload Section */}
        <div className="mb-3 p-3 border rounded bg-light" style={{ borderColor: '#CBD5E1' }}>
          <label className="form-label fw-bold d-block">
            📷 Evidence Photo / Video
          </label>
          <input
            type="file"
            className="form-control"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <small className="text-success mt-1 d-block fw-bold">
              ✓ {files.length} file(s) selected.
            </small>
          )}
          <small className="text-muted mt-2 d-block" style={{ fontSize: '0.78rem' }}>
            🔒 <strong>Content Safety Policy:</strong> Nudity, adult content, or inappropriate materials are strictly forbidden and automatically filtered.
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
            placeholder="E.g., Broken Road with large potholes on Main Street"
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
            placeholder="Describe the civic problem in detail..."
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

        {/* Linked Duplicate Summary Badge if Selected */}
        {selectedDuplicate && (
          <div className="mb-3 p-3 rounded border border-primary bg-primary-light d-flex justify-content-between align-items-center">
            <div>
              <strong className="text-primary-dark d-block">🔗 Linking as Duplicate to #{selectedDuplicate.reportId}:</strong>
              <small className="text-dark">{selectedDuplicate.title}</small>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => setSelectedDuplicate(null)}
              title="Remove duplicate link"
            >
              ✕ Unlink
            </button>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-bold text-white shadow-sm"
          disabled={loading}
          style={{ borderRadius: '8px', fontSize: '1rem' }}
        >
          {loading ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <LoadingSpinner size="sm" /> Submitting Report...
            </span>
          ) : (
            'Submit Civic Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCivicProblemReportForm;
