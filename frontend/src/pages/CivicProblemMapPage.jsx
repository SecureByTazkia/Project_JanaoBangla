// ==========================================
// JanaoBangla — Civic Problem Map Page
// BRANCH: feature-location-and-civic-problem-map-visualization
// Interactive Leaflet map visualization page with filters & list view
// ==========================================

import React, { useState, useEffect } from 'react';
import LocationService from '../services/LocationService';
import CivicProblemMap from '../components/CivicProblemMap';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Link } from 'react-router-dom';

const CivicProblemMapPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [radiusFilter, setRadiusFilter] = useState('all');

  // Location states
  const [userLocation, setUserLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([23.8103, 90.4125]); // Default Dhaka
  const [mapZoom, setMapZoom] = useState(11);
  const [selectedReportId, setSelectedReportId] = useState(null);

  // Ei function component mount ar filter change hoile backend location reports fetch korbe
  const fetchMapReports = async () => {
    setLoading(true);
    setError(null);
    try {
      if (userLocation && radiusFilter !== 'all') {
        const res = await LocationService.getNearbyReports(
          userLocation.latitude,
          userLocation.longitude,
          radiusFilter,
          { category: categoryFilter, status: statusFilter }
        );
        setReports(res.data || []);
      } else {
        const res = await LocationService.getMapReports({
          category: categoryFilter,
          status: statusFilter
        });
        setReports(res.data || []);
      }
    } catch (err) {
      console.error('Error loading map reports:', err);
      setError('Failed to load civic problem map reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapReports();
  }, [categoryFilter, statusFilter, radiusFilter, userLocation]);

  // Ei function browser GPS latitude longitude fetch kore map center move korbe
  const handleEnableGPS = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        };
        setUserLocation(coords);
        setMapCenter([coords.latitude, coords.longitude]);
        setMapZoom(14);
        setGpsLoading(false);
      },
      (err) => {
        alert('Could not retrieve your GPS location.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Ei function report list item click korle map marker central pan korbe
  const handleSelectReportCard = (report) => {
    const lat = parseFloat(report.latitude);
    const lng = parseFloat(report.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      setMapCenter([lat, lng]);
      setMapZoom(15);
      setSelectedReportId(report.id);
    }
  };

  // Client-side text search query filter
  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(query)) ||
      (r.address && r.address.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="civic-map-page-wrapper" style={{ padding: '24px 0', minHeight: '85vh' }}>
      <div className="container-fluid px-md-4">
        {/* Page Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between mb-3 bg-white p-3 rounded shadow-sm border">
          <div>
            <h2 className="h4 fw-bold text-primary-dark mb-1">Interactive Civic Problem Map</h2>
            <p className="text-muted small mb-0">
              Explore reported civic and public safety issues across Bangladesh in real-time.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
            <button
              className="btn btn-outline-primary btn-sm fw-semibold"
              onClick={handleEnableGPS}
              disabled={gpsLoading}
            >
              {gpsLoading ? 'Locating...' : 'My GPS Location'}
            </button>
            <Link to="/report-problem" className="btn btn-primary btn-sm fw-semibold">
              + Report New Problem
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body p-3">
            <div className="row g-2 align-items-center">
              <div className="col-md-3 col-sm-6">
                <label className="form-label small fw-bold mb-1">Category</label>
                <select
                  className="form-select form-select-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
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

              <div className="col-md-3 col-sm-6">
                <label className="form-label small fw-bold mb-1">Status</label>
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="processing">Processing</option>
                  <option value="solved">Solved</option>
                </select>
              </div>

              <div className="col-md-3 col-sm-6">
                <label className="form-label small fw-bold mb-1">Distance Radius</label>
                <select
                  className="form-select form-select-sm"
                  value={radiusFilter}
                  onChange={(e) => setRadiusFilter(e.target.value)}
                  disabled={!userLocation}
                >
                  <option value="all">All Locations (Entire Country)</option>
                  <option value="2">Within 2 KM</option>
                  <option value="5">Within 5 KM</option>
                  <option value="10">Within 10 KM</option>
                  <option value="25">Within 25 KM</option>
                </select>
                {!userLocation && (
                  <span className="text-muted" style={{ fontSize: '0.75rem' }}>*Requires GPS location</span>
                )}
              </div>

              <div className="col-md-3 col-sm-6">
                <label className="form-label small fw-bold mb-1">Search Address / Title</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Filter by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        {/* Map & List Split View */}
        <div className="row g-3">
          {/* Map Column */}
          <div className="col-lg-8 col-md-7">
            <div className="card shadow-sm border-0 civic-map-wrapper-card">
              <div className="card-body p-2" style={{ height: '100%' }}>
                {loading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <LoadingSpinner message="Loading interactive map & markers..." />
                  </div>
                ) : (
                  <CivicProblemMap
                    reports={filteredReports}
                    userLocation={userLocation}
                    center={mapCenter}
                    zoom={mapZoom}
                    onMarkerClick={(r) => setSelectedReportId(r.id)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Mapped Reports Side List Column */}
          <div className="col-lg-4 col-md-5">
            <div className="card shadow-sm border-0 civic-map-list-wrapper-card">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="h6 mb-0 fw-bold">Mapped Problems ({filteredReports.length})</h5>
                {userLocation && (
                  <span className="badge bg-success-subtle text-success border border-success-subtle">
                    GPS Active
                  </span>
                )}
              </div>
              <div className="card-body p-2" style={{ overflowY: 'auto', flex: 1 }}>
                {filteredReports.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <p className="mb-1">No civic problem markers found matching filters.</p>
                    <small>Try selecting "All Categories" or resetting search criteria.</small>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className={`card mb-2 cursor-pointer transition-all ${
                        selectedReportId === report.id ? 'border-primary bg-light' : 'border-light shadow-sm'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectReportCard(report)}
                    >
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span className="badge bg-secondary-subtle text-dark border small text-capitalize">
                            {report.category?.replace('_', ' ')}
                          </span>
                          <span className="badge bg-primary text-capitalize small">
                            {report.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <h6 className="fw-bold mb-1 text-primary-dark" style={{ fontSize: '0.95rem' }}>
                          {report.title}
                        </h6>
                        {report.address && (
                          <p className="text-muted small mb-1" style={{ fontSize: '0.82rem' }}>
                            {report.address}
                          </p>
                        )}
                        {report.distance_km !== undefined && (
                          <div className="text-primary small fw-semibold">
                            {report.distance_km} km away
                          </div>
                        )}
                        <div className="mt-2 text-end">
                          <Link
                            to={`/reports/${report.id}`}
                            className="btn btn-sm btn-outline-primary py-0 px-2"
                            style={{ fontSize: '0.78rem' }}
                          >
                            View &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicProblemMapPage;
