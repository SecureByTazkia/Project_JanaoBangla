// ==========================================
// Test Community Feed, Comments, and Discussion API & Model
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const CivicProblemCommentModel = require('../models/CivicProblemCommentModel');

async function testCommunityFeature() {
  console.log('🧪 Starting Community Feature Testing...\n');

  try {
    // 1. Test getPublicCommunityFeed
    console.log('1. Testing getPublicCommunityFeed...');
    const feed = await CivicProblemCommentModel.getPublicCommunityFeed({
      category: 'all',
      status: 'all',
      sortBy: 'newest',
      page: 1,
      limit: 10
    });
    console.log(`✅ Public feed fetched: ${feed.reports.length} reports found (total: ${feed.total})`);
    if (feed.reports.length > 0) {
      const first = feed.reports[0];
      console.log(`   Sample Report: ID=${first.id}, Title="${first.title}", Comments=${first.comment_count}, Verifications=${first.verification_count}, Reporter="${first.reporter_name}"`);
    }

    // 2. Test createComment (regular)
    console.log('\n2. Testing createComment (regular user)...');
    const comment1 = await CivicProblemCommentModel.createComment({
      report_id: 1,
      user_id: 2,
      content: 'This problem requires immediate road repair by Dhaka South City Corporation.',
      is_anonymous: false
    });
    console.log(`✅ Comment created: ID=${comment1.id}, Author="${comment1.author_name}", Anonymous=${comment1.is_anonymous}`);

    // 3. Test createComment (anonymous)
    console.log('\n3. Testing createComment (anonymous)...');
    const commentAnon = await CivicProblemCommentModel.createComment({
      report_id: 1,
      user_id: 2,
      content: 'I observed this hazard yesterday evening as well.',
      is_anonymous: true
    });
    console.log(`✅ Anonymous comment created: ID=${commentAnon.id}, Author="${commentAnon.author_name}", AuthorID=${commentAnon.author_id}`);

    // 4. Test reply to comment (nested reply)
    console.log('\n4. Testing nested reply to comment...');
    const reply = await CivicProblemCommentModel.createComment({
      report_id: 1,
      user_id: 3,
      parent_id: comment1.id,
      content: 'Agree 100%. We should also notify local ward councilor.',
      is_anonymous: false
    });
    console.log(`✅ Reply created: ID=${reply.id}, ParentID=${reply.parent_id}, Author="${reply.author_name}"`);

    // 5. Test getCommentsByReportId
    console.log('\n5. Testing getCommentsByReportId for Report #1...');
    const commentsTree = await CivicProblemCommentModel.getCommentsByReportId(1);
    console.log(`✅ Threaded comments fetched: ${commentsTree.length} root comments`);
    commentsTree.forEach(c => {
      console.log(`   - [ID ${c.id}] ${c.author_name}: "${c.content}" (${c.replies.length} replies)`);
      c.replies.forEach(r => {
        console.log(`       ↳ [Reply ID ${r.id}] ${r.author_name}: "${r.content}"`);
      });
    });

    // 6. Test flagComment
    console.log('\n6. Testing flagComment...');
    await CivicProblemCommentModel.flagComment(commentAnon.id);
    const flaggedCheck = await CivicProblemCommentModel.getCommentById(commentAnon.id);
    console.log(`✅ Comment flag status: is_flagged=${flaggedCheck.is_flagged}`);

    // 7. Test toggleVerification
    console.log('\n7. Testing toggleVerification (Confirm problem)...');
    const verResult1 = await CivicProblemCommentModel.toggleVerification(3, 2);
    console.log(`✅ Verification toggled ON:`, verResult1);
    const verResult2 = await CivicProblemCommentModel.toggleVerification(3, 2);
    console.log(`✅ Verification toggled OFF:`, verResult2);

    // 8. Test getReportDiscussionSummary
    console.log('\n8. Testing getReportDiscussionSummary for Report #1...');
    const discussion = await CivicProblemCommentModel.getReportDiscussionSummary(1, 2);
    console.log(`✅ Discussion summary loaded for "${discussion.report.title}":`);
    console.log(`   - Verification Count: ${discussion.verificationCount}`);
    console.log(`   - Total Root Comments: ${discussion.comments.length}`);
    console.log(`   - Has Current User Verified: ${discussion.hasVerified}`);

    console.log('\n========================================');
    console.log('🎉 ALL COMMUNITY BACKEND TESTS PASSED SUCCESSFULLY!');
    console.log('========================================');
  } catch (error) {
    console.error('❌ Community Test Error:', error);
    process.exit(1);
  }
}

testCommunityFeature().then(() => process.exit(0));
