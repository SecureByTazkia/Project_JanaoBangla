// ==========================================
// JanaoBangla — Civic Problem Report Details Page
// BRANCH: feature-civic-problem-reporting-visibility-and-management
// Report full view with evidence, location, visibility, and reporter identity
// ==========================================

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import CivicProblemReportService from '../services/CivicProblemReportService';
import CivicProblemReportStatus from '../components/CivicProblemReportStatus';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CivicProblemReportDetailsPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ei effect theke specific ID diye report data fetch kora hocche
  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const data = await CivicProblemReportService.getReportDetails(id);
        setReport(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load report details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReportDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <ErrorMessage message={error} />
        <Link to="/my-reports" className="btn btn-primary mt-3">Back to My Reports</Link>
      </div>
    );
  }

  if (!report) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCategory = (cat) => {
    if (!cat) return '';
    if (cat === 'extortion_chanda') return 'Extortion / Chanda Collection';
    if (cat === 'women_harassment') return 'Women Harassment';
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Women Harassment sub-type label display
  const formatHarassmentType = (type) => {
    if (!type) return null;
    return type === 'online' ? 'Online Harassment' : 'Offline / Physical Harassment';
  };

  return (
    <div className="container py-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <Link to="/my-reports" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left me-2"></i> Back
        </Link>
        <CivicProblemReportStatus status={report.status} />
      </div>

      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <span className="badge bg-primary-light text-primary-dark mb-3">
                {formatCategory(report.category)}
              </span>
              <h2 className="card-title fw-bold text-dark mb-4">{report.title}</h2>
              
              <div className="mb-4 pb-4 border-bottom">
                <h5 className="text-secondary fw-bold">Description</h5>
                <p className="text-dark" style={{ whiteSpace: 'pre-wrap' }}>{report.description}</p>
              </div>

              <div className="mb-4">
                <h5 className="text-secondary fw-bold mb-3">Evidence</h5>
                {report.evidence && report.evidence.length > 0 ? (
                  <div className="row g-3">
                    {report.evidence.map((file) => (
                      <div className="col-md-6" key={file.id}>
                        {file.file_type === 'image' ? (
                          <img 
                            src={`http://localhost:5000${file.file_path}`} 
                            alt="Evidence" 
                            className="img-fluid rounded shadow-sm w-100" 
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                        ) : (
                          <video 
                            src={`http://localhost:5000${file.file_path}`} 
                            controls 
                            className="w-100 rounded shadow-sm"
                            style={{ height: '250px', objectFit: 'cover' }}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted fst-italic">No evidence attached.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm border-0 mb-4 bg-light">
            <div className="card-body p-4">
              <h5 className="text-secondary fw-bold border-bottom pb-2 mb-3">Details</h5>
              
              <div className="mb-3">
                <small className="text-muted d-block">Reported By</small>
                <span className="fw-medium text-dark">
                  {report.is_anonymous ? 'Anonymous Citizen' : (report.reporter_name || 'Citizen')}
                </span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Reporter Identity</small>
                <span className={`badge ${report.is_anonymous ? 'bg-secondary' : 'bg-info text-dark'}`}>
                  {report.is_anonymous ? '🕵️ Anonymous' : 'Public Identity'}
                </span>
              </div>
              
              <div className="mb-3">
                <small className="text-muted d-block">Date Submitted</small>
                <span className="fw-medium text-dark">{formatDate(report.created_at)}</span>
              </div>

              <div className="mb-3">
                <small className="text-muted d-block">Visibility</small>
                <span className={`badge ${report.visibility === 'public' ? 'bg-success' : 'bg-dark'}`}>
                  {report.visibility.toUpperCase()}
                </span>
              </div>

              {report.address && (
                <div className="mb-3">
                  <small className="text-muted d-block">Address</small>
                  <span className="fw-medium text-dark">{report.address}</span>
                </div>
              )}

              {/* Women Harassment e sub-type show hobe */}
              {report.category === 'women_harassment' && report.harassment_type && (
                <div className="mb-3">
                  <small className="text-muted d-block">Harassment Type</small>
                  <span className="badge bg-danger">
                    {formatHarassmentType(report.harassment_type)}
                  </span>
                </div>
              )}

              {(report.latitude && report.longitude) && (
                <div className="mb-3">
                  <small className="text-muted d-block">Coordinates</small>
                  <span className="fw-medium text-dark font-monospace small">
                    {parseFloat(report.latitude).toFixed(6)}, {parseFloat(report.longitude).toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicProblemReportDetailsPage;
