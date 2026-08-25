// ==========================================
// JanaoBangla — Civic Problem Map Component
// BRANCH: feature-location-and-civic-problem-map-visualization
// Interactive Leaflet Map displaying civic problem markers & popups
// ==========================================

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { getMarkerIconByCategory, RoyalBlueUserIcon } from '../utils/mapIcons';

// Helper component to auto pan/zoom map to selected center
function MapViewController({ center, zoom = 12 }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Ei function category text format kore friendly label generate korbe
const formatCategoryLabel = (category) => {
  const labels = {
    road_damage: 'Road Damage',
    garbage_waste: 'Garbage / Waste',
    street_light: 'Street Light',
    water_drainage: 'Water / Drainage',
    traffic_accident: 'Traffic / Accident',
    public_safety: 'Public Safety'
  };
  return labels[category] || category;
};

// Ei function status text format kore CSS badge class name return korbe
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'submitted': return 'bg-secondary';
    case 'under_review': return 'bg-warning text-dark';
    case 'processing': return 'bg-info text-dark';
    case 'solved': return 'bg-success';
    default: return 'bg-primary';
  }
};

const CivicProblemMap = ({
  reports = [],
  userLocation = null,
  center = [23.8103, 90.4125],
  zoom = 12,
  onMarkerClick = null
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className="civic-problem-map-container" style={{ width: '100%', height: '100%', minHeight: '400px', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController center={center} zoom={zoom} />

        {/* User GPS location marker (Royal Blue) */}
        {userLocation && userLocation.latitude && userLocation.longitude && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={RoyalBlueUserIcon}
          >
            <Popup>
              <div className="text-center p-1">
                <span className="badge bg-primary mb-1">Your Location</span>
                <p className="small mb-0">You are here</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Civic report markers */}
        {reports.map((report) => {
          const lat = parseFloat(report.latitude);
          const lng = parseFloat(report.longitude);

          if (isNaN(lat) || isNaN(lng)) return null;

          const markerIcon = getMarkerIconByCategory(report.category);

          return (
            <Marker
              key={report.id}
              position={[lat, lng]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  if (onMarkerClick) onMarkerClick(report);
                }
              }}
            >
              <Popup maxWidth={280}>
                <div className="map-popup-card">
                  {report.thumbnail_path && (
                    <img
                      src={
                        report.thumbnail_path.startsWith('http')
                          ? report.thumbnail_path
                          : `${API_BASE_URL}/${report.thumbnail_path.replace(/^\/+/, '').replace(/\\/g, '/')}`
                      }
                      alt={report.title}
                      style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                    />
                  )}
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="badge bg-light text-dark border small">
                      {formatCategoryLabel(report.category)}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(report.status)} text-capitalize`}>
                      {report.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{report.title}</h6>
                  {report.address && (
                    <p className="text-muted small mb-1" style={{ fontSize: '0.8rem' }}>
                      📍 {report.address}
                    </p>
                  )}
                  {report.distance_km !== undefined && (
                    <div className="text-primary small fw-semibold mb-2">
                      📏 Distance: {report.distance_km} km away
                    </div>
                  )}
                  <Link
                    to={`/reports/${report.id}`}
                    className="btn btn-sm btn-primary w-100 mt-1"
                    style={{ fontSize: '0.85rem' }}
                  >
                    View Report Details &rarr;
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default CivicProblemMap;
