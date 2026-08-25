// ==========================================
// JanaoBangla — Leaflet Map Custom Marker Icons
// BRANCH: feature-location-and-civic-problem-map-visualization
// PRD Design System Rules:
// Emerald (#006A4E) -> Civic / Infrastructure problems
// Crimson (#FF1744) -> Safety / Emergency problems
// Royal Blue (#2962FF) -> Current User Location marker
// ==========================================

import L from 'leaflet';

// Leaflet default icon asset fix for Vite environment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ei helper function HTML SVG pin string define kore Leaflet DivIcon generate korbe
const createSvgMarkerIcon = (color, label = '', isUser = false) => {
  const svgMarkup = isUser
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        <circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2"/>
        <circle cx="12" cy="12" r="5" fill="${color}"/>
       </svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="42">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>
       </svg>`;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgMarkup,
    iconSize: isUser ? [36, 36] : [30, 42],
    iconAnchor: isUser ? [18, 18] : [15, 42],
    popupAnchor: isUser ? [0, -18] : [0, -40]
  });
};

// Emerald Icon (#006A4E) — Civic & Infrastructure Problems
export const EmeraldCivicIcon = createSvgMarkerIcon('#006A4E');

// Crimson Icon (#FF1744) — Safety & Emergency Problems
export const CrimsonSafetyIcon = createSvgMarkerIcon('#FF1744');

// Royal Blue Icon (#2962FF) — Current User Location
export const RoyalBlueUserIcon = createSvgMarkerIcon('#2962FF', '', true);

// Ei helper function category base optimal marker icon choose korbe
export const getMarkerIconByCategory = (category) => {
  if (category === 'public_safety' || category === 'traffic_accident') {
    return CrimsonSafetyIcon;
  }
  return EmeraldCivicIcon;
};
