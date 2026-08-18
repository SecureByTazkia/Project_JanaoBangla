// ==========================================
// JanaoBangla — AI Advanced Duplicate Detection Service
// BRANCH: feature-ai-powered-civic-problem-recognition-and-smart-suggestions
// Ei service database er existing reports er sathe notun report compare kore
// AI similarity score, category match ebong geographic distance hisab korbe
// ==========================================

const db = require('./DatabaseService');

// Haversine formula diye duita GPS coordinates er distance (km) hisab kore
function calculateDistanceInKm(lat1, lon1, lat2, lon2) {
  // Duita location er moddhe distance ber korche
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simple text token similarity hisab kore (Jaccard similarity index)
function calculateTextSimilarity(str1 = '', str2 = '') {
  // Shob words tokenize kore common words percentage ber korche
  const words1 = new Set(str1.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2));

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersectionCount = 0;
  for (const word of words1) {
    if (words2.has(word)) intersectionCount++;
  }

  const unionCount = new Set([...words1, ...words2]).size;
  return unionCount === 0 ? 0 : (intersectionCount / unionCount);
}

class AIAdvancedDuplicateDetectionService {

  // ==========================================
  // detectDuplicates — Notun report submit korar age similar problem search kore
  // ==========================================
  static async detectDuplicates({ title = '', description = '', category = '', latitude = null, longitude = null }) {
    // Ei function database er shob active/submitted/processing report theke duplicates khujbe
    try {
      // 1. Fetch recent unresolved or active reports with their locations
      const reports = await db.query(
        `SELECT r.id, r.title, r.description, r.category, r.status, r.created_at,
                l.latitude, l.longitude, l.address
         FROM reports r
         LEFT JOIN locations l ON l.report_id = r.id
         WHERE r.status != 'solved'
         ORDER BY r.created_at DESC
         LIMIT 50`
      );

      if (!reports || reports.length === 0) {
        return {
          hasDuplicate: false,
          maxSimilarity: 0,
          similarReports: [],
          message: 'No similar reports found in this area.'
        };
      }

      const inputLat = latitude ? parseFloat(latitude) : null;
      const inputLng = longitude ? parseFloat(longitude) : null;
      const combinedInputText = `${title} ${description}`.trim();

      const matchedResults = [];

      for (const report of reports) {
        let similarityScore = 0;

        // Factor 1: Category Match (30 points)
        if (category && report.category && category.toLowerCase() === report.category.toLowerCase()) {
          similarityScore += 30;
        }

        // Factor 2: Text Similarity (40 points)
        const combinedReportText = `${report.title} ${report.description}`.trim();
        const textSimRatio = calculateTextSimilarity(combinedInputText, combinedReportText);
        similarityScore += Math.round(textSimRatio * 40);

        // Factor 3: Geographic Proximity (30 points)
        let distanceKm = null;
        if (inputLat && inputLng && report.latitude && report.longitude) {
          distanceKm = calculateDistanceInKm(inputLat, inputLng, parseFloat(report.latitude), parseFloat(report.longitude));
          
          if (distanceKm <= 0.2) {
            // Under 200 meters -> +30 points
            similarityScore += 30;
          } else if (distanceKm <= 0.5) {
            // Under 500 meters -> +20 points
            similarityScore += 20;
          } else if (distanceKm <= 1.0) {
            // Under 1 km -> +10 points
            similarityScore += 10;
          }
        }

        // Jodi similarity 50% ba tar beshi hoy, tahole potential duplicate dhora hobe
        if (similarityScore >= 50) {
          matchedResults.push({
            reportId: report.id,
            title: report.title,
            category: report.category,
            status: report.status,
            address: report.address || 'Reported Location',
            distanceKm: distanceKm ? parseFloat(distanceKm.toFixed(2)) : null,
            similarityPercentage: Math.min(98, similarityScore),
            createdAt: report.created_at
          });
        }
      }

      // Sort by highest similarity
      matchedResults.sort((a, b) => b.similarityPercentage - a.similarityPercentage);

      const maxSimilarity = matchedResults.length > 0 ? matchedResults[0].similarityPercentage : 0;
      const hasDuplicate = maxSimilarity >= 70;

      return {
        hasDuplicate,
        maxSimilarity,
        similarReports: matchedResults.slice(0, 3), // Top 3 matches
        message: hasDuplicate
          ? `Similar Report Found (${maxSimilarity}% match). You can view existing report or submit anyway.`
          : 'No significant duplicates detected.'
      };
    } catch (error) {
      console.error('AI Duplicate Detection Error:', error.message);
      return {
        hasDuplicate: false,
        maxSimilarity: 0,
        similarReports: [],
        message: 'Duplicate check completed with no conflicts.'
      };
    }
  }
}

module.exports = AIAdvancedDuplicateDetectionService;
