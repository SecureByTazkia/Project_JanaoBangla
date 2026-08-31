import React, { useState, useEffect } from 'react';
import CivicProblemReportService from '../services/CivicProblemReportService';
import AICivicProblemService from '../services/AICivicProblemService';
import ErrorMessage from './ErrorMessage';
import SuccessMessage from './SuccessMessage';
import LoadingSpinner from './LoadingSpinner';
import LocationMapPicker from './LocationMapPicker';
import AIProblemRecognitionResult from './AIProblemRecognitionResult';
import SmartReportSuggestion from './SmartReportSuggestion';
import { useNavigate } from 'react-router-dom';

const CreateCivicProblemReportForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road_damage',
    visibility: 'public',
    latitude: '',
    longitude: '',
    address: '',
    isAnonymous: false,
    harassmentType: ''
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // AI states
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiRecognition, setAiRecognition] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);

  const navigate = useNavigate();

  // Input change handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // State for AI safety scanning on file upload
  const [isModeratingImage, setIsModeratingImage] = useState(false);

  // File change handler with instant AI adult content & nudity moderation
  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files);
    setError(null);
    setSuccess(null);

    const imageFiles = selected.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      setIsModeratingImage(true);
      try {
        for (const imgFile of imageFiles) {
          const modRes = await AICivicProblemService.moderateUploadedImage(imgFile);
          if (modRes && modRes.isSafe === false) {
            const dangerMsg = `AI Content Safety Alert: ${modRes.reasonBn || modRes.reason || 'Adult content or nudity detected.'} (আপলোড করা ছবিতে নগ্নতা বা অনৈতিক কন্টেন্ট পাওয়ায় তা বাতিল করা হয়েছে)`;
            setError(dangerMsg);
            setFiles([]);
            e.target.value = ''; // Clear file input
            setIsModeratingImage(false);
            return;
          }
        }
      } catch (modErr) {
        console.warn('AI Moderation scan warning:', modErr);
      } finally {
        setIsModeratingImage(false);
      }
    }

    setFiles(selected);

    // If clean image file was selected, clear old AI results
    if (selected.length > 0 && selected[0].type.startsWith('image/')) {
      setAiRecognition(null);
      setAiSuggestions(null);
    }
  };

  // Run AI analysis on the selected image
  const handleAnalyzeWithAI = async () => {
    const imageFile = files.find(f => f.type.startsWith('image/'));
    if (!imageFile) {
      setError('Please select an image file first to analyze with AI.');
      return;
    }

    setIsAiAnalyzing(true);
    setError(null);

    try {
      const result = await AICivicProblemService.analyzeEvidenceImage(imageFile, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        address: formData.address,
        latitude: formData.latitude,
        longitude: formData.longitude
      });

      if (result.success) {
        if (result.recognition) {
          setAiRecognition(result.recognition);
          if (result.recognition.suggestedCategory) {
            setFormData(prev => ({ ...prev, category: result.recognition.suggestedCategory }));
          }
        }
        if (result.suggestions) {
          setAiSuggestions(result.suggestions);
        }
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'AI analysis could not process this image.';
      setError(errMsg);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Submit report handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Location mandatory check
      if (!formData.latitude || !formData.longitude) {
        setError('Location is required. Please use "My GPS Location" button or click on the map to select your location.');
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('visibility', formData.visibility);
      data.append('isAnonymous', formData.isAnonymous ? 'true' : 'false');
      if (formData.category === 'women_harassment' && formData.harassmentType) {
        data.append('harassment_type', formData.harassmentType);
      }
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      if (formData.address) data.append('address', formData.address);

      files.forEach(file => {
        data.append('evidence', file);
      });

      await CivicProblemReportService.submitReport(data);
      setSuccess('Civic problem reported successfully! Awaiting review.');
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
    } catch (err) {
      const errMsg = err.response?.data?.reasonBn || err.response?.data?.error || err.response?.data?.message || 'An error occurred while submitting the report.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="text-primary-dark mb-0">Report a Civic Problem</h3>
        <span className="badge bg-light text-dark border px-3 py-2">
          JanaoBangla Civic Portal
        </span>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      <form onSubmit={handleSubmit} className="mt-3">
        {/* Evidence upload with Automatic AI Nudity & Adult Content Protection */}
        <div className="mb-3 p-3 bg-light rounded border" style={{ borderColor: '#E2E8F0' }}>
          <label className="form-label fw-bold d-flex justify-content-between align-items-center">
            <span>Evidence (Images / Videos)</span>
            <small className="text-muted">Max 5 files</small>
          </label>
          <div className="input-group">
            <input
              type="file"
              className="form-control"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={isModeratingImage}
            />
          </div>
          {files.length > 0 && (
            <div className="d-flex justify-content-between align-items-center mt-2">
              <small className="text-success fw-semibold">
                ✓ {files.length} file(s) attached
              </small>
            </div>
          )}
          <small className="text-muted d-block mt-2" style={{ fontSize: '0.78rem' }}>
            Nudity, adult, or inappropriate content is strictly prohibited. AI will automatically detect & block.
          </small>
        </div>

        {/* Problem Title */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Problem Title *</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="E.g., Large Pothole on Mirpur Road near Bus Stand"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Description *</label>
          <textarea
            className="form-control"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the problem in detail (what happened, severity, how long it has been there)..."
          ></textarea>
        </div>

        {/* Category & Visibility */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-semibold">Category *</label>
            <select
              className="form-select"
              name="category"
              value={formData.category}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({
                  ...prev,
                  category: val,
                  harassmentType: val === 'women_harassment' ? (prev.harassmentType || 'offline') : ''
                }));
              }}
            >
              <option value="road_damage">Road Damage</option>
              <option value="garbage_waste">Garbage / Waste</option>
              <option value="street_light">Street Light</option>
              <option value="water_drainage">Water / Drainage</option>
              <option value="traffic_accident">Traffic / Accident</option>
              <option value="public_safety">Public Safety</option>
              <option value="women_harassment">Women Harassment</option>
              <option value="extortion_chanda">Illegal Money Collection Report/চাঁদাবাজির অভিযোগ</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Visibility *</label>
            <select
              className="form-select"
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="public">Public (Visible to Community & Feed)</option>
              <option value="private">Private (Only Admins)</option>
            </select>
            <small className="text-muted">Private reports won't appear on the public map or feed.</small>
          </div>
        </div>

        {/* Women Harassment online/offline selector */}
        {formData.category === 'women_harassment' && (
          <div className="mb-3 p-3 rounded border" style={{ backgroundColor: '#FFF5F5', borderColor: '#FEB2B2' }}>
            <label className="form-label fw-bold text-danger d-block mb-1">
              Harassment Type (হয়রানির ধরন) *
            </label>
            <div className="d-flex gap-4 mt-2">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="harassmentType"
                  id="harassmentOnline"
                  value="online"
                  checked={formData.harassmentType === 'online'}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label fw-semibold" htmlFor="harassmentOnline">
                  Online Harassment (সোশ্যাল মিডিয়া, মেসেজিং বা অনলাইনে হয়রানি)
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="harassmentType"
                  id="harassmentOffline"
                  value="offline"
                  checked={formData.harassmentType === 'offline' || !formData.harassmentType}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label fw-semibold" htmlFor="harassmentOffline">
                  Offline / Physical Harassment (রাস্তায়, কর্মস্থলে বা প্রত্যক্ষ হয়রানি)
                </label>
              </div>
            </div>
            <small className="text-muted d-block mt-2">
              অনলাইন বা অফলাইন নির্বাচন করুন যাতে সংশ্লিষ্ট নিরাপত্তা বিভাগ তাৎক্ষণিক পদক্ষেপ গ্রহণ করতে পারে।
            </small>
          </div>
        )}

        {/* Anonymous Reporting Checkbox */}
        <div className="mb-3 p-2 bg-light rounded border">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
            />
            <label className="form-check-label fw-semibold" htmlFor="isAnonymous">
              Report Anonymously (আপনার নাম ও প্রোফাইল অন্য নাগরিকদের কাছে গোপন থাকবে)
            </label>
          </div>
          <small className="text-muted d-block ps-4">
            If enabled, your name will be displayed as "Anonymous Citizen" on public feeds and map.
          </small>
        </div>

        {/* Location Map Picker */}
        <div className="mb-4">
          <label className="form-label fw-bold">Report Location Data <span className="text-danger">*</span></label>
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
          className="btn btn-primary w-100 py-2 fw-bold"
          disabled={loading || isAiAnalyzing}
          style={{ fontSize: '1rem' }}
        >
          {loading ? <LoadingSpinner size="sm" /> : 'Submit Civic Report'}
        </button>
      </form>
    </div>
  );
};

export default CreateCivicProblemReportForm;
