// ==========================================
// JanaoBangla — Create Civic Problem Report Form
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// Civic problem reporting form with Report Visibility and Anonymous Reporter Identity support
// ==========================================

import React, { useState } from 'react';
import CivicProblemReportService from '../services/CivicProblemReportService';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const CreateCivicProblemReportForm = () => {
  // isAnonymous boolean field state e rakha hoyeche (default: false - Show my identity)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road_damage',
    visibility: 'public',
    isAnonymous: false,
    latitude: '',
    longitude: '',
    address: '',
    // Women Harassment er jonno harassment type (online/offline) — default empty
    harassmentType: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const navigate = useNavigate();

  // ==========================================
  // handleChange — Input field er text/select change handle kore
  // ==========================================
  const handleChange = (e) => {
    // Ei function form inputs update korbe
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Category change hole Women Harassment er harassment type reset hobe
      if (name === 'category' && value !== 'women_harassment') {
        updated.harassmentType = '';
      }
      return updated;
    });
  };

  // ==========================================
  // handleFileChange — Evidence file selection handle kore
  // ==========================================
  const handleFileChange = (e) => {
    // Convert FileList to Array
    setFiles(Array.from(e.target.files));
  };

  // ==========================================
  // getLocation — Browser GPS API theke location collect kore
  // ==========================================
  const getLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationLoading(false);
      },
      (err) => {
        setError('Unable to retrieve your location');
        setLocationLoading(false);
      }
    );
  };

  // ==========================================
  // handleSubmit — Form data backend e multipart FormData hishabe pathay
  // ==========================================
  const handleSubmit = async (e) => {
    // User anonymous choose korle isAnonymous backend e pathabe
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('visibility', formData.visibility);
      data.append('isAnonymous', formData.isAnonymous);
      // Women Harassment e harassment_type backend e pathano hocche
      if (formData.category === 'women_harassment' && formData.harassmentType) {
        data.append('harassment_type', formData.harassmentType);
      }
      if (formData.latitude) data.append('latitude', formData.latitude);
      if (formData.longitude) data.append('longitude', formData.longitude);
      if (formData.address) data.append('address', formData.address);

      // Add files
      files.forEach(file => {
        data.append('evidence', file);
      });

      await CivicProblemReportService.submitReport(data);
      setSuccess('Civic problem reported successfully!');
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while submitting the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <h3 className="mb-4 text-primary-dark">Report a Civic Problem</h3>
      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Problem Title *</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="E.g., Large Pothole on Mirpur Road"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description *</label>
          <textarea
            className="form-control"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the problem in detail..."
          ></textarea>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="road_damage">Road Damage</option>
              <option value="garbage_waste">Garbage / Waste</option>
              <option value="street_light">Street Light</option>
              <option value="water_drainage">Water / Drainage</option>
              <option value="traffic_accident">Traffic / Accident</option>
              <option value="public_safety">Public Safety</option>
              <option value="women_harassment">Women Harassment</option>
              <option value="extortion_chanda">Extortion / Chanda Collection Report</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Visibility *</label>
            <select
              className="form-select"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="public">Public (Visible to Community)</option>
              <option value="private">Private (Only Admins)</option>
            </select>
            <small className="text-muted">Private reports won't appear on the public map.</small>
          </div>
        </div>

        {/* Women Harassment e Harassment Type dropdown show hobe */}
        {formData.category === 'women_harassment' && (
          <div className="mb-3">
            <label className="form-label fw-bold">
              Harassment Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              name="harassmentType"
              value={formData.harassmentType}
              onChange={handleChange}
              required
            >
              <option value="">— Select Harassment Type —</option>
              <option value="online">Online Harassment</option>
              <option value="offline">Offline / Physical Harassment</option>
            </select>
            <small className="text-muted">
              Select whether this is online or in-person / physical harassment.
            </small>
          </div>
        )}

        {/* Reporter Identity Option (Anonymous Reporting) */}
        <div className="mb-3 p-3 border rounded bg-light">
          <label className="form-label fw-bold d-block mb-2">Reporter Identity</label>
          <div className="form-check form-check-inline me-4">
            <input
              className="form-check-input"
              type="radio"
              name="isAnonymous"
              id="identityPublic"
              value="false"
              checked={formData.isAnonymous === false}
              onChange={() => setFormData(prev => ({ ...prev, isAnonymous: false }))}
            />
            <label className="form-check-label" htmlFor="identityPublic">
              Show my identity
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name="isAnonymous"
              id="identityAnonymous"
              value="true"
              checked={formData.isAnonymous === true}
              onChange={() => setFormData(prev => ({ ...prev, isAnonymous: true }))}
            />
            <label className="form-check-label" htmlFor="identityAnonymous">
              Report anonymously
            </label>
          </div>
          <small className="form-text text-muted d-block mt-2">
            Your identity will be hidden from other citizens, but authorized administrators can still identify the reporter when necessary.
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Evidence (Images/Videos)</label>
          <input
            type="file"
            className="form-control"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <small className="text-success mt-1 d-block">{files.length} file(s) selected.</small>
          )}
        </div>

        <div className="card bg-light mb-4 p-3 border-0">
          <label className="form-label">Location Data</label>
          <div className="d-flex align-items-center mb-2">
            <button 
              type="button" 
              className="btn btn-outline-primary me-3" 
              onClick={getLocation}
              disabled={locationLoading}
            >
              {locationLoading ? 'Getting Location...' : 'Get Current Location via GPS'}
            </button>
            {(formData.latitude && formData.longitude) && (
              <span className="text-success fw-bold">
                Location captured! (Lat: {parseFloat(formData.latitude).toFixed(4)}, Lng: {parseFloat(formData.longitude).toFixed(4)})
              </span>
            )}
          </div>
          <input
            type="text"
            className="form-control"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Or type address manually (e.g., Banani, Road 11)"
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default CreateCivicProblemReportForm;
