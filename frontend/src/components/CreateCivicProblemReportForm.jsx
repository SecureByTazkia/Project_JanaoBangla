import React, { useState } from 'react';
import CivicProblemReportService from '../services/CivicProblemReportService';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';
import LocationMapPicker from './LocationMapPicker';
import { useNavigate } from 'react-router-dom';

const CreateCivicProblemReportForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road_damage',
    visibility: 'public',
    latitude: '',
    longitude: '',
    address: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const navigate = useNavigate();

  // Ei function input field er change handle korbe
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Ei function user jokhon file select korbe tokhon state update korbe
  const handleFileChange = (e) => {
    // Convert FileList to Array
    setFiles(Array.from(e.target.files));
  };

  // Ei function browser er GPS API theke location collect korbe
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

  // Ei function form submit korle backend e data send korbe
  const handleSubmit = async (e) => {
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

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? <LoadingSpinner size="sm" /> : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default CreateCivicProblemReportForm;
