// ==========================================
// Test Admin Dashboard Queries
// ==========================================
require('dotenv').config();
const db = require('../services/DatabaseService');

async function testAllQueries() {
  try {
    console.log('1. Testing System Stats Query...');
    const [userStats] = await db.query(
      `SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified_users,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users
       FROM users`
    );
    const [reportStats] = await db.query(
      `SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending_reports,
        SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as review_reports,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_reports,
        SUM(CASE WHEN status = 'solved' THEN 1 ELSE 0 END) as solved_reports,
        SUM(CASE WHEN visibility = 'private' THEN 1 ELSE 0 END) as private_reports,
        SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicate_reports
       FROM reports`
    );
    const [commentStats] = await db.query(
      `SELECT 
        COUNT(*) as total_comments,
        SUM(CASE WHEN is_removed = 1 THEN 1 ELSE 0 END) as removed_comments
       FROM comments`
    );
    const [sosStats] = await db.query(
      `SELECT 
        COUNT(*) as total_sos,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_sos,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_sos,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_sos
       FROM emergency_requests`
    );
    console.log('✅ Stats Result:', { userStats, reportStats, commentStats, sosStats });

    console.log('\n2. Testing Reports query with l.report_id = r.id...');
    const reports = await db.query(
      `SELECT r.*, l.latitude, l.longitude, l.address, u.name as reporter_name, u.email as reporter_email 
       FROM reports r
       LEFT JOIN locations l ON l.report_id = r.id
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC LIMIT 10 OFFSET 0`
    );
    console.log('✅ Reports fetched successfully, count:', reports.length);

    console.log('\n3. Testing Users query...');
    const users = await db.query(
      `SELECT id, name, email, phone_number, role, is_verified, is_active, profile_picture, created_at 
       FROM users 
       ORDER BY created_at DESC LIMIT 10 OFFSET 0`
    );
    console.log('✅ Users fetched successfully, count:', users.length);

    console.log('\n4. Testing Comments query with is_removed...');
    const comments = await db.query(
      `SELECT c.*, u.name as user_name, u.email as user_email, r.title as report_title 
       FROM comments c
       JOIN users u ON c.user_id = u.id
       JOIN reports r ON c.report_id = r.id
       ORDER BY c.created_at DESC LIMIT 10 OFFSET 0`
    );
    console.log('✅ Comments fetched successfully, count:', comments.length);

    console.log('\n5. Testing SOS query...');
    const sos = await db.query(
      `SELECT er.*, u.name as user_name, u.email as user_email, u.phone_number as user_phone
       FROM emergency_requests er
       JOIN users u ON er.user_id = u.id
       ORDER BY er.created_at DESC LIMIT 10 OFFSET 0`
    );
    console.log('✅ SOS requests fetched successfully, count:', sos.length);

    console.log('\n========================================');
    console.log('🎉 ALL DATABASE QUERIES WORKED PERFECTLY!');
    console.log('========================================');
  } catch (error) {
    console.error('❌ Query Test Error:', error);
  }
}

testAllQueries();
