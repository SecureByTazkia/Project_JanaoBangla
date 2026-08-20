// ==========================================
// JanaoBangla — Create Civic Problem Report Form
// BRANCH: feature-duplicate-civic-problem-report-detection
// AI problem recognition, smart suggestions, category recommendations,
// ebong duplicate civic report detection & linking integrated submission form
// ==========================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CivicProblemReportService from '../services/CivicProblemReportService';
import AICivicProblemService from '../services/AICivicProblemService';
import DuplicateReportDetectionService from '../services/DuplicateReportDetectionService';
import AIProblemRecognitionResult from './AIProblemRecognitionResult';
import SmartProblemCategorySuggestion from './SmartProblemCategorySuggestion';
import SmartReportSuggestion from './SmartReportSuggestion';
import DuplicateReportWarning from './DuplicateReportWarning';
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
  const [success, setSuccess] = useState(null);

  // AI Assistive States
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiRecognition, setAiRecognition] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [aiDuplicates, setAiDuplicates] = useState(null);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);

  // Phase 6 — Duplicate Detection States
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [selectedDuplicate, setSelectedDuplicate] = useState(null);
  const [duplicateDismissed, setDuplicateDismissed] = useState(false);
  
  const navigate = useNavigate();

  // ==========================================
  // handleChange — Form input field er change handle kore ebong duplicate state reset kore
  // ==========================================
  const handleChange = (e) => {
    // Ei function user input korar sathe sathe formData state update korbe
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Input change hole duplicate check notun kore allow korbe
    setDuplicateDismissed(false);
  };

  // ==========================================
  // handleCheckDuplicates — Title, description ebong location niye duplicate API call kore
  // ==========================================
  const handleCheckDuplicates = async () => {
    // Ei function user er typed problem details niye similar/duplicate report khuje ber kore
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
          // Auto select top candidate as recommendation
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
  // handleFileChange — User jokhon photo/video select korbe tokhon AI image analysis trigger korbe
  // ==========================================
  const handleFileChange = async (e) => {
    // Ei function evidence upload handle korbe ebong AI recognition API call korbe
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);

    // Jodi image file thake, AI problem recognition trigger korbe
    const firstImageFile = selectedFiles.find(f => f.type.startsWith('image/'));
    if (firstImageFile) {
      setIsAiAnalyzing(true);
      try {
        const aiData = await AICivicProblemService.analyzeUploadedImage(firstImageFile, {
          title: formData.title,
          description: formData.description,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude
        });

        if (aiData.success && aiData.recognition) {
          setAiRecognition(aiData.recognition);
          setAiSuggestions(aiData.suggestions);
          setAiDuplicates(aiData.duplicates);

          // Category auto-update korar sujog (jodi default road_damage thake)
          if (aiData.recognition.suggestedCategory && formData.category === 'road_damage') {
            setFormData(prev => ({
              ...prev,
              category: aiData.recognition.suggestedCategory
            }));
          }

          // Duplicate data sync kora
          if (aiData.duplicates && aiData.duplicates.similarReports?.length > 0) {
            setDuplicateData(aiData.duplicates);
            setSelectedDuplicate(aiData.duplicates.similarReports[0]);
          }
        }
      } catch (aiErr) {
        console.warn('AI analysis error / content moderation flag:', aiErr);
        const errorData = aiErr.response?.data;
        if (errorData?.isUnsafe || errorData?.flagType || aiErr.response?.status === 400) {
          // Clear files and show safety error
          setFiles([]);
          if (e.target) e.target.value = '';
          setAiRecognition(null);
          setAiSuggestions(null);
          setError(
            errorData?.messageBn
              ? `🚫 ${errorData.messageBn} (${errorData.error || errorData.message})`
              : (errorData?.error || errorData?.message || 'Inappropriate or adult image detected. Please upload an appropriate civic issue photo.')
          );
        } else {
          console.warn('AI analysis skipped or failed:', aiErr.message);
        }
      } finally {
        setIsAiAnalyzing(false);
      }
    }
  };

  // ==========================================
  // handleEnhanceWithAi — Description box er text AI diye professional civic format e convert kore
  // ==========================================
  const handleEnhanceWithAi = async () => {
    // Ei function description enhance korar jonno AI suggestion service call kore
    if (!formData.description && !formData.title) {
      setError('Please type a brief note or problem summary first to enhance with AI.');
      return;
    }

    setIsAiEnhancing(true);
    setError(null);
    try {
      const response = await AICivicProblemService.getSmartSuggestions({
        text: formData.description || formData.title,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        address: formData.address
      });

      if (response.success && response.smartContent) {
        setAiSuggestions(response.smartContent);
        if (response.categorySuggestion?.categoryKey) {
          setFormData(prev => ({
            ...prev,
            category: response.categorySuggestion.categoryKey
          }));
        }
      }
    } catch (err) {
      setError('Failed to enhance description with AI. Please try again.');
    } finally {
      setIsAiEnhancing(false);
    }
  };

  // ==========================================
  // handleAcceptCategory — AI suggested category accept korle state update kore
  // ==========================================
  const handleAcceptCategory = (categoryKey) => {
    // Ei function user AI category accept korle select dropdown update korbe
    setFormData(prev => ({ ...prev, category: categoryKey }));
  };

  // ==========================================
  // handleApplySmartContent — AI suggested Title ebong Structured Description form e auto-fill kore
  // ==========================================
  const handleApplySmartContent = ({ smartTitle, smartDescription }) => {
    // Ei function AI suggested content form input fields e inject kore
    setFormData(prev => ({
      ...prev,
      title: smartTitle || prev.title,
      description: smartDescription || prev.description
    }));
  };

  const handleApplyTitleOnly = (title) => {
    setFormData(prev => ({ ...prev, title: title || prev.title }));
  };

  const handleApplyDescOnly = (description) => {
    setFormData(prev => ({ ...prev, description: description || prev.description }));
  };

  // ==========================================
  // handleSelectDuplicateForLink — User existing report ke duplicate parent hisebe select korle
  // ==========================================
  const handleSelectDuplicateForLink = (report) => {
    // Ei function selected duplicate candidate ke state e save kore
    setSelectedDuplicate(report);
  };

  // ==========================================
  // handleSubmit — Complete form data submit kore (duplicate linking shoho)
  // ==========================================
  const handleSubmit = async (e, forcedSubmit = false, linkWithReport = null) => {
    // Ei function report create korar jonno backend e multipart FormData pathay
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
          // Intercept and warn user
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

      // Phase 6 — Duplicate linking parameters
      if (targetLink && targetLink.reportId) {
        data.append('duplicateOfId', targetLink.reportId);
        data.append('similarityScore', targetLink.similarityPercentage || 85);
      }

      // Add files
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
          <small className="text-muted">Fill in the details below or let AI scan your evidence photo.</small>
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
          <span className="badge bg-light text-success border border-success p-2" style={{ fontSize: '0.8rem' }}>
            ✨ AI & Duplicate Recognition
          </span>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* 1. AI Image Analysis Result Widget (Shown upon uploading evidence photo) */}
      {(isAiAnalyzing || aiRecognition) && (
        <AIProblemRecognitionResult
          recognition={aiRecognition}
          isAnalyzing={isAiAnalyzing}
        />
      )}

      {/* 2. AI Category Recommendation Widget */}
      {aiRecognition && (
        <SmartProblemCategorySuggestion
          suggestedCategory={aiRecognition.suggestedCategory}
          currentCategory={formData.category}
          confidence={aiRecognition.confidence}
          onAcceptCategory={handleAcceptCategory}
          onDismiss={() => setAiRecognition(null)}
        />
      )}

      {/* 3. Phase 6 — Duplicate Report Warning Widget */}
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
          <label className="form-label fw-bold d-flex justify-content-between align-items-center">
            <span>📷 Evidence Photo / Video</span>
            <span className="badge bg-success" style={{ fontSize: '0.74rem' }}>Triggers Instant AI Scan</span>
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
              ✓ {files.length} file(s) selected for upload & AI analysis.
            </small>
          )}
          <small className="text-muted mt-2 d-block" style={{ fontSize: '0.78rem' }}>
            🔒 <strong>Strict Content Safety:</strong> Nudity, adult content, or inappropriate materials are strictly forbidden and automatically filtered by AI.
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
            placeholder="E.g., Severe Road Damage on Mirpur-10 Main Road"
          />
        </div>

        {/* Description & AI Enhancer */}
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <label className="form-label fw-bold mb-0">Description *</label>
            <button
              type="button"
              className="btn-ai-enhance"
              onClick={handleEnhanceWithAi}
              disabled={isAiEnhancing}
              title="Convert informal notes into structured civic description"
            >
              {isAiEnhancing ? '✨ Enhancing...' : '✨ Enhance with AI'}
            </button>
          </div>
          <textarea
            className="form-control"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the problem in detail (or type short notes and click 'Enhance with AI')..."
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

        {/* 4. AI Smart Suggestions Widget */}
        {(aiSuggestions) && (
          <SmartReportSuggestion
            suggestions={aiSuggestions}
            duplicates={aiDuplicates}
            onApplyAll={handleApplySmartContent}
            onApplyTitle={handleApplyTitleOnly}
            onApplyDescription={handleApplyDescOnly}
            onViewExistingReport={(reportId) => window.open(`/reports/${reportId}`, '_blank')}
          />
        )}

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
              ✕ Remove Link
            </button>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 fw-bold"
          disabled={loading || isCheckingDuplicates}
          style={{ fontSize: '1rem' }}
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : selectedDuplicate ? (
            `🔗 Submit & Link to Report #${selectedDuplicate.reportId}`
          ) : (
            '🚀 Submit Verified Civic Report'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateCivicProblemReportForm;
