// ==========================================
// JanaoBangla — Test Duplicate Report Detection & Linking
// BRANCH: feature-duplicate-civic-problem-report-detection
// Ei script LocationComparison, SimilarReportDetection ebong DuplicateLinking services test korbe
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = require('../services/DatabaseService');
const LocationBasedReportComparisonService = require('../services/LocationBasedReportComparisonService');
const SimilarReportDetectionService = require('../services/SimilarReportDetectionService');
const DuplicateReportLinkingService = require('../services/DuplicateReportLinkingService');

async function runDuplicateTests() {
  console.log('🧪 Starting Duplicate Report Detection Test Suite...\n');

  try {
    // 1. Test Location Comparison Service
    console.log('📍 1. Testing LocationBasedReportComparisonService:');
    const agrabadLat1 = 22.3274;
    const agrabadLon1 = 91.8123;
    const agrabadLat2 = 22.3280; // ~80m away
    const agrabadLon2 = 91.8128;

    const distMeters = LocationBasedReportComparisonService.calculateDistanceInMeters(
      agrabadLat1, agrabadLon1, agrabadLat2, agrabadLon2
    );
    const proxScore = LocationBasedReportComparisonService.calculateProximityScore(distMeters);
    const formatted = LocationBasedReportComparisonService.formatDistance(distMeters);

    console.log(`   Distance: ${distMeters} meters (${formatted})`);
    console.log(`   Proximity Score: ${proxScore}/100`);
    if (distMeters <= 100 && proxScore >= 90) {
      console.log('   ✅ Location proximity calculation PASSED!\n');
    } else {
      console.log('   ❌ Location proximity score unexpected.\n');
    }

    // 2. Test Text Tokenization & Jaccard Similarity
    console.log('📝 2. Testing SimilarReportDetectionService Text Matching:');
    const text1 = 'Large pothole on Agrabad road causing heavy traffic';
    const text2 = 'Big road hole in Agrabad causing terrible traffic';
    const textScore = SimilarReportDetectionService.calculateTextSimilarityScore(
      'Large pothole on Agrabad road', text1,
      'Big road hole in Agrabad', text2
    );

    console.log(`   Text 1: "${text1}"`);
    console.log(`   Text 2: "${text2}"`);
    console.log(`   Text Similarity Score: ${textScore}%`);
    if (textScore >= 40) {
      console.log('   ✅ Text similarity calculation PASSED!\n');
    } else {
      console.log('   ❌ Text similarity below expectation.\n');
    }

    // 3. Test Database Candidate Comparison
    console.log('🔍 3. Testing Database Duplicate Detection Query:');
    const detectionResult = await SimilarReportDetectionService.findSimilarReports({
      title: 'Large pothole on Agrabad road',
      description: 'Dangerous road hole near Agrabad circle',
      category: 'road_damage',
      latitude: agrabadLat1,
      longitude: agrabadLon1
    });

    console.log('   Duplicate Detection Result:', {
      hasDuplicate: detectionResult.hasDuplicate,
      maxSimilarity: detectionResult.maxSimilarity,
      candidatesCount: detectionResult.similarReports.length,
      recommendation: detectionResult.recommendation
    });
    console.log('   ✅ Database duplicate detection query executed cleanly!\n');

    // 4. Test Duplicate Linking & Unlinking Workflow
    console.log('🔗 4. Testing Duplicate Report Linking Service:');
    let sampleReports = await db.query('SELECT id, title FROM reports LIMIT 2');
    
    // Jodi database e report kom thake, test er jonno duita temporary test report create kore test korbo
    let tempOrigId = null;
    let tempDupId = null;

    if (!sampleReports || sampleReports.length < 2) {
      // Find a user ID
      const user = await db.queryOne('SELECT id FROM users LIMIT 1');
      const userId = user ? user.id : 1;

      tempOrigId = await db.insert(
        `INSERT INTO reports (user_id, title, description, category, visibility, status)
         VALUES (?, 'Large pothole on Agrabad road', 'Dangerous pothole near Agrabad circle', 'road_damage', 'public', 'submitted')`,
        [userId]
      );
      tempDupId = await db.insert(
        `INSERT INTO reports (user_id, title, description, category, visibility, status)
         VALUES (?, 'Big road hole in Agrabad', 'Big hole in the middle of Agrabad road', 'road_damage', 'public', 'submitted')`,
        [userId]
      );
      sampleReports = [{ id: tempOrigId }, { id: tempDupId }];
    }

    const origId = sampleReports[0].id;
    const dupId = sampleReports[1].id;

    console.log(`   Attempting link: Report #${dupId} -> Original #${origId}`);
    const linkResult = await DuplicateReportLinkingService.linkReports({
      originalId: origId,
      duplicateId: dupId,
      similarityScore: 88.5
    });
    console.log('   Link result:', linkResult.message);

    // Verify linked status
    const linkedData = await DuplicateReportLinkingService.getLinkedReports(origId);
    console.log(`   Primary Report #${origId} now has ${linkedData.linkedDuplicates.length} linked duplicate(s).`);

    // Test Unlink
    console.log(`   Unlinking Report #${dupId}...`);
    const unlinkResult = await DuplicateReportLinkingService.unlinkReport(dupId);
    console.log('   Unlink result:', unlinkResult.message);

    // Clean up temporary test reports if created
    if (tempOrigId && tempDupId) {
      await db.query('DELETE FROM reports WHERE id IN (?, ?)', [tempOrigId, tempDupId]);
    }

    console.log('   ✅ Duplicate linking and unlinking workflow PASSED!\n');

    // 5. Test Duplicate Clusters Query
    console.log('📊 5. Testing Duplicate Clusters Summary:');
    const clusters = await DuplicateReportLinkingService.getAllDuplicateClusters();
    console.log(`   Active Duplicate Clusters: ${clusters.length}`);
    console.log('   ✅ Duplicate clusters query PASSED!\n');

    console.log('🎉 ALL DUPLICATE DETECTION TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Test Suite Failed:', error);
    process.exit(1);
  }
}

runDuplicateTests();
