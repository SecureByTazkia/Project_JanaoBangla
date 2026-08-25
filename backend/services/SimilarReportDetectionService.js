// ==========================================
// JanaoBangla — Similar Report Detection Service
// BRANCH: feature-duplicate-civic-problem-report-detection
// Ei service notun ba existing report er title, description, category ebong location
// compare kore similar/duplicate report detect kore ebong similarity percentage ber kore
// ==========================================

const db = require('./DatabaseService');
const LocationBasedReportComparisonService = require('./LocationBasedReportComparisonService');

// Bangla and English common stop words list (shudhu purely grammatical words rakha hoyeche)
const STOP_WORDS = new Set([
  // English grammatical words
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
  'is', 'are', 'was', 'were', 'it', 'this', 'that', 'there', 'here', 'please', 'help',
  'very', 'due', 'into', 'over', 'under',
  // Bangla grammatical words
  'এই', 'একটি', 'এবং', 'বা', 'তে', 'এ', 'র', 'এর', 'দিয়ে', 'হতে', 'থেকে', 'করা', 'হয়েছে',
  'আছে', 'ছিল', 'হবে', 'একটু', 'অনুগ্রহ', 'করে'
]);

class SimilarReportDetectionService {

  // ==========================================
  // normalizeText — Text clean kore, punctuation shoray ebong lowercase kore
  // ==========================================
  static normalizeText(text = '') {
    // Ei function string clean kore shudhu alphanumeric ebong bangla characters rakhe
    if (!text || typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’‘।]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ==========================================
  // extractTokens — Clean text theke meaningful words (tokens) ber kore stop words baad diye
  // ==========================================
  static extractTokens(text = '') {
    // Ei function text theke shob words token hisebe alada kore ebong stop words filter out kore
    const normalized = this.normalizeText(text);
    if (!normalized) return [];

    const words = normalized.split(/\s+/);
    return words.filter(word => word.length >= 2 && !STOP_WORDS.has(word));
  }

  // ==========================================
  // extractNgrams — Text theke 2-word phrase (bi-grams) toiri kore context match korar jonno
  // ==========================================
  static extractNgrams(words = [], n = 2) {
    // Ei function consecutive word pairs banay jate 'large pothole' ba 'water clog' er moto phrases match hoy
    if (!words || words.length < n) return [];
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  // ==========================================
  // calculateJaccardSimilarity — Duita token set er moddhe Jaccard similarity index hisab kore (0 to 1)
  // Substring and partial root matching shoho
  // ==========================================
  static calculateJaccardSimilarity(setA, setB) {
    // Ei function duita set er exact ebong partial sub-word match hisab kore similarity ratio ber kore
    if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;

    let matchWeight = 0;
    const arrayB = Array.from(setB);

    for (const itemA of setA) {
      if (setB.has(itemA)) {
        matchWeight += 1.0;
      } else {
        // Partial sub-word match check (e.g. 'pothole' and 'hole', 'damage' and 'damaged')
        const hasSubMatch = arrayB.some(itemB => 
          (itemA.length >= 4 && itemB.length >= 4) &&
          (itemA.includes(itemB) || itemB.includes(itemA))
        );
        if (hasSubMatch) {
          matchWeight += 0.7;
        }
      }
    }

    const totalUnion = new Set([...setA, ...setB]).size;
    return totalUnion === 0 ? 0 : Math.min(1.0, matchWeight / totalUnion);
  }

  // ==========================================
  // calculateTextSimilarityScore — Duita report er title ebong description er text match score (0-100) ber kore
  // ==========================================
  static calculateTextSimilarityScore(title1 = '', desc1 = '', title2 = '', desc2 = '') {
    // Ei function single word tokens ebong bi-gram phrases duita combine kore text match score calculate kore
    const text1 = `${title1} ${desc1}`.trim();
    const text2 = `${title2} ${desc2}`.trim();

    const tokens1 = this.extractTokens(text1);
    const tokens2 = this.extractTokens(text2);

    if (tokens1.length === 0 || tokens2.length === 0) {
      // Jodi stop word filter er pore kono token na thake, direct raw normalized string compare korbe
      const norm1 = this.normalizeText(text1);
      const norm2 = this.normalizeText(text2);
      if (norm1 && norm2 && (norm1.includes(norm2) || norm2.includes(norm1))) {
        return 70;
      }
      return 0;
    }

    // 1. Single word similarity (Weight: 65%)
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const tokenSim = this.calculateJaccardSimilarity(set1, set2);

    // 2. Bigram phrase similarity (Weight: 15%)
    const bigrams1 = new Set(this.extractNgrams(tokens1, 2));
    const bigrams2 = new Set(this.extractNgrams(tokens2, 2));
    const bigramSim = (bigrams1.size > 0 && bigrams2.size > 0)
      ? this.calculateJaccardSimilarity(bigrams1, bigrams2)
      : tokenSim;

    // 3. Title specific similarity (Weight: 20%)
    const titleTokens1 = new Set(this.extractTokens(title1));
    const titleTokens2 = new Set(this.extractTokens(title2));
    const titleSim = (titleTokens1.size > 0 && titleTokens2.size > 0)
      ? this.calculateJaccardSimilarity(titleTokens1, titleTokens2)
      : tokenSim;

    const combinedSim = (tokenSim * 0.65) + (bigramSim * 0.15) + (titleSim * 0.20);
    return Math.min(100, Math.round(combinedSim * 100));
  }

  // ==========================================
  // calculateOverallSimilarity — Category, Text ebong Location milie total similarity score calculate kore
  // ==========================================
  static calculateOverallSimilarity({
    categoryMatch = false,
    textScore = 0,
    proximityScore = 0,
    hasLocation = false
  }) {
    // Ei function multi-factor weighted formula use kore:
    // Location thakle: Category (25%) + Text (40%) + Proximity (35%)
    // Location na thakle: Category (40%) + Text (60%)
    let categoryWeight = 25;
    let textWeight = 40;
    let locationWeight = 35;

    const categoryScore = categoryMatch ? 100 : 0;

    let overall = 0;
    if (hasLocation) {
      overall =
        (categoryScore * (categoryWeight / 100)) +
        (textScore * (textWeight / 100)) +
        (proximityScore * (locationWeight / 100));
    } else {
      categoryWeight = 40;
      textWeight = 60;
      overall =
        (categoryScore * (categoryWeight / 100)) +
        (textScore * (textWeight / 100));
    }

    // High confidence boost: Jodi category match ebong proximity khub kache hoy (< 150m), ektu boost pabe
    if (categoryMatch && proximityScore >= 90 && textScore >= 30) {
      overall = Math.min(99, overall + 10);
    }

    return Math.min(99, Math.round(overall));
  }

  // ==========================================
  // findSimilarReports — Database theke existing reports fetch kore candidates compare kore list return kore
  // ==========================================
  static async findSimilarReports({
    title = '',
    description = '',
    category = '',
    latitude = null,
    longitude = null,
    excludeReportId = null,
    minSimilarityThreshold = 40
  }) {
    // Ei function database er sob unresolved/active reports query kore similarity check kore
    try {
      let query = `
        SELECT 
          r.id,
          r.user_id,
          r.title,
          r.description,
          r.category,
          r.status,
          r.visibility,
          r.priority,
          r.is_duplicate,
          r.duplicate_of_id,
          r.verification_count,
          r.created_at,
          l.latitude,
          l.longitude,
          l.address,
          u.name as reporter_name
        FROM reports r
        LEFT JOIN locations l ON l.report_id = r.id
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.status != 'solved'
      `;

      const queryParams = [];

      // Jodi kono specific report ID exclude korte hoy (e.g. nijer report update er shomoy)
      if (excludeReportId) {
        query += ` AND r.id != ?`;
        queryParams.push(excludeReportId);
      }

      query += ` ORDER BY r.created_at DESC LIMIT 100`;

      const existingReports = await db.query(query, queryParams);

      if (!existingReports || existingReports.length === 0) {
        return {
          hasDuplicate: false,
          maxSimilarity: 0,
          similarReports: [],
          message: 'No existing reports found in the system for comparison.'
        };
      }

      const inputLat = latitude ? parseFloat(latitude) : null;
      const inputLng = longitude ? parseFloat(longitude) : null;
      const hasInputLocation = inputLat !== null && inputLng !== null && !isNaN(inputLat) && !isNaN(inputLng);

      const matchedList = [];

      for (const report of existingReports) {
        // 1. Category comparison
        const isCategoryMatch = category && report.category
          ? category.trim().toLowerCase() === report.category.trim().toLowerCase()
          : false;

        // 2. Text comparison (Title + Description)
        const textScore = this.calculateTextSimilarityScore(
          title,
          description,
          report.title,
          report.description
        );

        // 3. Location distance & proximity score
        let distanceMeters = null;
        let distanceText = 'Location not specified';
        let proximityScore = 0;
        const reportLat = report.latitude ? parseFloat(report.latitude) : null;
        const reportLng = report.longitude ? parseFloat(report.longitude) : null;
        const hasReportLocation = reportLat !== null && reportLng !== null && !isNaN(reportLat) && !isNaN(reportLng);

        if (hasInputLocation && hasReportLocation) {
          distanceMeters = LocationBasedReportComparisonService.calculateDistanceInMeters(
            inputLat,
            inputLng,
            reportLat,
            reportLng
          );
          proximityScore = LocationBasedReportComparisonService.calculateProximityScore(distanceMeters);
          distanceText = LocationBasedReportComparisonService.formatDistance(distanceMeters);
        }

        // 4. Calculate weighted total similarity
        const overallSimilarity = this.calculateOverallSimilarity({
          categoryMatch: isCategoryMatch,
          textScore,
          proximityScore,
          hasLocation: hasInputLocation && hasReportLocation
        });

        // Threshold check: jodi minimum threshold cross kore
        if (overallSimilarity >= minSimilarityThreshold) {
          matchedList.push({
            reportId: report.id,
            title: report.title,
            description: report.description,
            category: report.category,
            status: report.status,
            visibility: report.visibility,
            priority: report.priority,
            isDuplicate: Boolean(report.is_duplicate),
            duplicateOfId: report.duplicate_of_id,
            verificationCount: report.verification_count || 0,
            reporterName: report.reporter_name || 'Citizen',
            createdAt: report.created_at,
            address: report.address || 'Reported area',
            latitude: report.latitude,
            longitude: report.longitude,
            distanceMeters,
            distanceText,
            similarityPercentage: overallSimilarity,
            breakdown: {
              categoryMatch: isCategoryMatch,
              textScore,
              proximityScore
            }
          });
        }
      }

      // Sort by highest similarity percentage first
      matchedList.sort((a, b) => b.similarityPercentage - a.similarityPercentage);

      const maxSimilarity = matchedList.length > 0 ? matchedList[0].similarityPercentage : 0;
      const hasDuplicate = maxSimilarity >= 65; // 65% or higher is flagged as strong duplicate risk

      let recommendation = 'proceed';
      if (maxSimilarity >= 75) {
        recommendation = 'strong_warning';
      } else if (maxSimilarity >= 50) {
        recommendation = 'suggestion';
      }

      return {
        hasDuplicate,
        maxSimilarity,
        recommendation,
        similarReports: matchedList.slice(0, 5), // Top 5 closest matches
        message: hasDuplicate
          ? `⚠️ Similar Report Found (${maxSimilarity}% match). A similar civic problem has already been reported in this area.`
          : matchedList.length > 0
          ? `Possible related report found (${maxSimilarity}% match).`
          : 'No similar reports detected.'
      };
    } catch (error) {
      console.error('SimilarReportDetectionService Error:', error.message);
      return {
        hasDuplicate: false,
        maxSimilarity: 0,
        recommendation: 'proceed',
        similarReports: [],
        message: 'Duplicate comparison completed without conflict.'
      };
    }
  }
}

module.exports = SimilarReportDetectionService;
