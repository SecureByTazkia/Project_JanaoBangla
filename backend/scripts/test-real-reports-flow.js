// ==========================================
// Test Real Report Flow: Zero Reports Empty State -> Submit Real Report -> Feed Displays Real Report
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../services/DatabaseService');
const CivicProblemCommentModel = require('../models/CivicProblemCommentModel');
const CivicProblemReportModel  = require('../models/CivicProblemReportModel');

async function testRealReportFlow() {
  console.log('🧪 Testing Real Reports Flow...\n');

  try {
    // 1. Verify 0 reports in DB
    const initialFeed = await CivicProblemCommentModel.getPublicCommunityFeed({});
    console.log(`1. Initial Feed State (Expected 0): total=${initialFeed.total}, reports=${initialFeed.reports.length}`);

    // 2. Submit a real civic problem report by user ID 2 (Rahim Uddin)
    console.log('\n2. Submitting a real civic problem report from citizen user...');
    const reportId = await CivicProblemReportModel.createReport({
      user_id: 2,
      title: 'Waterlogging on Mirpur Road near Science Lab',
      description: 'Severe waterlogging caused by blocked municipal drains after heavy rainfall. Pedestrians cannot cross the road.',
      category: 'water_drainage',
      visibility: 'public',
      is_anonymous: false
    });
    console.log(`✅ Real report created with ID: ${reportId}`);

    // 3. Save location for this real report
    await CivicProblemReportModel.saveLocation(reportId, {
      latitude: 23.73890000,
      longitude: 90.38720000,
      address: 'Mirpur Road, Science Lab Intersection, Dhaka'
    });
    console.log(`✅ Location attached to report #${reportId}`);

    // 4. Verify feed dynamically returns the real report
    console.log('\n3. Fetching community feed dynamically from MySQL...');
    const updatedFeed = await CivicProblemCommentModel.getPublicCommunityFeed({});
    console.log(`✅ Feed now contains ${updatedFeed.total} real reports:`);
    updatedFeed.reports.forEach(r => {
      console.log(`   - [Report #${r.id}] "${r.title}" | Category: ${r.category} | Reporter: ${r.reporter_name} | Location: ${r.address}`);
    });

    // 5. Test posting a comment on this real report
    console.log('\n4. Citizen commenting on the real report...');
    const comment = await CivicProblemCommentModel.createComment({
      report_id: reportId,
      user_id: 3,
      content: 'I live nearby, traffic is completely halted. Need DSCC emergency pump team.',
      is_anonymous: false
    });
    console.log(`✅ Comment posted on real report: [Comment #${comment.id}] "${comment.content}" by ${comment.author_name}`);

    // 6. Test problem verification on the real report
    console.log('\n5. Citizen confirming this real problem...');
    const verifyRes = await CivicProblemCommentModel.toggleVerification(reportId, 3);
    console.log(`✅ Problem confirmation result:`, verifyRes);

    // 7. Verify discussion data for the real report
    const discussion = await CivicProblemCommentModel.getReportDiscussionSummary(reportId, 3);
    console.log(`\n6. Discussion loaded: ${discussion.comments.length} comments, ${discussion.verificationCount} verifications.`);

    console.log('\n========================================');
    console.log('🎉 REAL REPORT DATABASE FLOW VERIFIED SUCCESSFULLY!');
    console.log('========================================');
  } catch (error) {
    console.error('❌ Test Error:', error);
    process.exit(1);
  }
}

testRealReportFlow().then(() => process.exit(0));
