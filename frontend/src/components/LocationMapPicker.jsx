// ==========================================
// JanaoBangla — Location Map Picker Component
// BRANCH: feature-location-and-civic-problem-map-visualization
// Interactive Leaflet map input picker for report form
// ==========================================

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import LocationService from '../services/LocationService';
import { EmeraldCivicIcon, RoyalBlueUserIcon } from '../utils/mapIcons';

// Map re-centering child component
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Click event listener component for MapContainer
function LocationMarkerEvents({ onPositionSelected }) {
  useMapEvents({
    click(e) {
      onPositionSelected(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

const LocationMapPicker = ({ initialLat, initialLng, onLocationSelect }) => {
  // Default coordinates: Bangladesh Center (Dhaka)
  const defaultLat = initialLat ? parseFloat(initialLat) : 23.8103;
  const defaultLng = initialLng ? parseFloat(initialLng) : 90.4125;

  const [position, setPosition] = useState([defaultLat, defaultLng]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [addressText, setAddressText] = useState('');

  // Ei function map point select hoile position state update ar reverse geocode trigger korbe
  const handleSelectPosition = async (lat, lng) => {
    setPosition([lat, lng]);
    setAddressLoading(true);

    try {
      const geoResult = await LocationService.reverseGeocode(lat, lng);
      const fetchedAddress = geoResult.address || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
      setAddressText(fetchedAddress);

      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: fetchedAddress
        });
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
      if (onLocationSelect) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        });
      }
    } finally {
      setAddressLoading(false);
    }
  };

  // Ei function browser GPS location detect kore map point update korbe
  const handleGetCurrentLocation = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleSelectPosition(lat, lng);
        setGpsLoading(false);
      },
      (err) => {
        alert('Could not retrieve your GPS location. Please select on map manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-map-picker border rounded p-3 bg-light">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-2">
        <label className="fw-semibold text-secondary mb-1">
          📍 Select Location on Map (Click anywhere or drag pin)
        </label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={handleGetCurrentLocation}
          disabled={gpsLoading}
        >
          {gpsLoading ? 'Locating...' : '🎯 My GPS Location'}
        </button>
      </div>

      <div style={{ height: '280px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={position} />
          <LocationMarkerEvents onPositionSelected={handleSelectPosition} />
          <Marker
            position={position}
            icon={EmeraldCivicIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const newPos = marker.getLatLng();
                handleSelectPosition(newPos.lat, newPos.lng);
              }
            }}
          />
        </MapContainer>
      </div>

      <div className="mt-2 text-muted small">
        {addressLoading ? (
          <span>⏳ Fetching address details...</span>
        ) : (
          <span>
            <strong>Selected Coordinates:</strong> {position[0].toFixed(5)}, {position[1].toFixed(5)}
            {addressText && <div><strong>Detected Address:</strong> {addressText}</div>}
          </span>
        )}
      </div>
    </div>
  );
};

export default LocationMapPicker;
