// ==========================================
// JanaoBangla — Location Model
// BRANCH: feature-location-and-civic-problem-map-visualization
// Map ar Location features er database queries ekhane store kora ache
// Actual MySQL schema: users.name, locations.area, locations.city, locations.report_id
// ==========================================

const db = require('../services/DatabaseService');

class LocationModel {

  // Ei function map e dekhabar jonno public reports fetch korbe MySQL database theke
  // u.name, l.area, l.city column match kora hoyeche actual schema onujayi
  static async getMapReports(filters = {}) {
    let sql = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.priority,
        r.visibility,
        r.created_at,
        l.id as location_id,
        l.latitude,
        l.longitude,
        l.address,
        l.area,
        l.city,
        u.name as reporter_name,
        (
          SELECT file_path 
          FROM report_evidence 
          WHERE report_id = r.id AND file_type = 'image' 
          LIMIT 1
        ) as thumbnail_path
      FROM reports r
      INNER JOIN locations l ON l.report_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.visibility = 'public'
        AND l.latitude IS NOT NULL 
        AND l.longitude IS NOT NULL
    `;

    const params = [];

    // Category filter apply kora hocche
    if (filters.category && filters.category !== 'all') {
      sql += ` AND r.category = ?`;
      params.push(filters.category);
    }

    // Status filter apply kora hocche (default: only show admin-approved reports)
    if (filters.status && filters.status !== 'all') {
      sql += ` AND r.status = ?`;
      params.push(filters.status);
    } else {
      sql += ` AND r.status != 'submitted'`;
    }

    // Latitude ar longitude boundary filter (Bounding Box)
    if (filters.minLat && filters.maxLat && filters.minLng && filters.maxLng) {
      sql += ` AND l.latitude BETWEEN ? AND ? AND l.longitude BETWEEN ? AND ?`;
      params.push(filters.minLat, filters.maxLat, filters.minLng, filters.maxLng);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const rows = await db.query(sql, params);
    return rows;
  }

  // Ei function user lat/lng position dhore specify radius (km) e nearby public reports filter korbe
  // Haversine distance formula use kora hocche SQL query balance thakar jonno
  static async getNearbyReports({ latitude, longitude, radiusKm = 10, category = 'all', status = 'all' }) {
    let sql = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.priority,
        r.created_at,
        l.latitude,
        l.longitude,
        l.address,
        l.area,
        l.city,
        u.name as reporter_name,
        (
          SELECT file_path 
          FROM report_evidence 
          WHERE report_id = r.id AND file_type = 'image' 
          LIMIT 1
        ) as thumbnail_path,
        ROUND(
          6371 * ACOS(
            LEAST(1.0, GREATEST(-1.0, 
              COS(RADIANS(?)) * COS(RADIANS(l.latitude)) * 
              COS(RADIANS(l.longitude) - RADIANS(?)) + 
              SIN(RADIANS(?)) * SIN(RADIANS(l.latitude))
            ))
          ), 2
        ) AS distance_km
      FROM reports r
      INNER JOIN locations l ON l.report_id = r.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.visibility = 'public'
        AND l.latitude IS NOT NULL 
        AND l.longitude IS NOT NULL
    `;

    const params = [latitude, longitude, latitude];

    if (category && category !== 'all') {
      sql += ` AND r.category = ?`;
      params.push(category);
    }

    if (status && status !== 'all') {
      sql += ` AND r.status = ?`;
      params.push(status);
    } else {
      sql += ` AND r.status != 'submitted'`;
    }

    sql += ` HAVING distance_km <= ? ORDER BY distance_km ASC LIMIT 100`;
    params.push(parseFloat(radiusKm));

    const rows = await db.query(sql, params);
    return rows;
  }

  // Ei function keyword text search matching reports array return korbe
  static async searchLocationReports(searchTerm) {
    const term = `%${searchTerm}%`;
    const sql = `
      SELECT 
        r.id,
        r.title,
        r.description,
        r.category,
        r.status,
        r.created_at,
        l.latitude,
        l.longitude,
        l.address,
        l.area,
        l.city
      FROM reports r
      INNER JOIN locations l ON l.report_id = r.id
      WHERE r.visibility = 'public'
        AND r.status != 'submitted'
        AND (l.address LIKE ? OR l.area LIKE ? OR l.city LIKE ? OR r.title LIKE ?)
      ORDER BY r.created_at DESC
      LIMIT 50
    `;
    const rows = await db.query(sql, [term, term, term, term]);
    return rows;
  }
}

module.exports = LocationModel;
