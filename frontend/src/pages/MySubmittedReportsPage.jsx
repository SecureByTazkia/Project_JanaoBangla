import React, { useEffect, useState } from 'react';
import CivicProblemReportService from '../services/CivicProblemReportService';
import CivicProblemReportCard from '../components/CivicProblemReportCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';

const MySubmittedReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ei effect theke component load holei user er report gulo pull korbe
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await CivicProblemReportService.getMyReports();
        setReports(data);
      } catch (err) {
        setError('Failed to load your reports. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-muted">Loading your reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary-dark">My Submitted Reports</h2>
        <Link to="/report-problem" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i> Report New Issue
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-5 bg-light rounded shadow-sm">
          <h4 className="text-muted mb-3">You haven't submitted any reports yet.</h4>
          <Link to="/report-problem" className="btn btn-outline-primary">
            Submit Your First Report
          </Link>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {reports.map(report => (
            <div className="col" key={report.id}>
              <CivicProblemReportCard report={report} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubmittedReportsPage;
