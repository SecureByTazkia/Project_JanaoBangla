// ==========================================
// Database Setup Script for JanaoBangla
// Ei script ta schema.sql ar seed.sql run kore database e sob table create ar seed data insert korbe
// ==========================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const fs = require('fs');

async function setupDatabase() {
  console.log('🔄 Initializing JanaoBangla Database...');
  console.log('   Host:', process.env.DB_HOST);
  console.log('   User:', process.env.DB_USER);
  console.log('   Database:', process.env.DB_NAME);

  // Database create korar jonno prothome DB chara connection open kora hocche
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  const dbName = process.env.DB_NAME || 'Project_JanaoBangla';

  // Database create kora hocche jodi na thake
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await connection.query(`USE \`${dbName}\`;`);

  console.log(`✅ Using database: ${dbName}`);

  // Table create queries
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS users (
      id                          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name                        VARCHAR(100) NOT NULL,
      email                       VARCHAR(191) NOT NULL,
      phone_number                VARCHAR(20),
      password                    VARCHAR(255) NOT NULL,
      role                        ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
      is_verified                 TINYINT(1) DEFAULT 0,
      is_active                   TINYINT(1) NOT NULL DEFAULT 1,
      verification_code           VARCHAR(10),
      verification_expires_at     DATETIME,
      created_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at                  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      password_reset_code         VARCHAR(10),
      password_reset_expires_at   DATETIME,
      profile_picture             VARCHAR(255),
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email),
      INDEX idx_users_role (role),
      INDEX idx_users_is_active (is_active),
      INDEX idx_users_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS reports (
      id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id            INT UNSIGNED NOT NULL,
      title              VARCHAR(300) NOT NULL,
      description        TEXT NOT NULL,
      category           ENUM(
                           'road_damage',
                           'garbage_waste',
                           'street_light',
                           'water_drainage',
                           'traffic_accident',
                           'public_safety'
                         ) NOT NULL,
      status             ENUM(
                           'submitted',
                           'under_review',
                           'processing',
                           'solved'
                         ) NOT NULL DEFAULT 'submitted',
      visibility         ENUM('public', 'private') NOT NULL DEFAULT 'public',
      priority           ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
      is_anonymous       TINYINT(1) NOT NULL DEFAULT 0,
      is_duplicate       TINYINT(1) NOT NULL DEFAULT 0,
      duplicate_of_id    INT UNSIGNED,
      verification_count INT UNSIGNED NOT NULL DEFAULT 0,
      ai_suggested       TINYINT(1) NOT NULL DEFAULT 0,
      created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_reports_user_id (user_id),
      INDEX idx_reports_category (category),
      INDEX idx_reports_status (status),
      INDEX idx_reports_visibility (visibility),
      INDEX idx_reports_created_at (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS locations (
      id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_id    INT UNSIGNED,
      label        VARCHAR(300),
      address      TEXT,
      division     VARCHAR(100),
      district     VARCHAR(100),
      upazila      VARCHAR(100),
      latitude     DECIMAL(10, 8) NOT NULL,
      longitude    DECIMAL(11, 8) NOT NULL,
      created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_locations_report_id (report_id),
      INDEX idx_locations_lat_lng (latitude, longitude),
      INDEX idx_locations_district (district)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS report_evidence (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_id   INT UNSIGNED NOT NULL,
      file_type   ENUM('image', 'video') NOT NULL,
      file_name   VARCHAR(500),
      file_path   VARCHAR(1000) NOT NULL,
      original_name VARCHAR(500),
      file_size   INT UNSIGNED,
      mime_type   VARCHAR(100),
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_report_evidence_report_id (report_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS comments (
      id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_id    INT UNSIGNED NOT NULL,
      user_id      INT UNSIGNED NOT NULL,
      parent_id    INT UNSIGNED DEFAULT NULL,
      content      TEXT NOT NULL,
      is_anonymous TINYINT(1) NOT NULL DEFAULT 0,
      is_flagged   TINYINT(1) NOT NULL DEFAULT 0,
      is_removed   TINYINT(1) NOT NULL DEFAULT 0,
      created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_comments_report_id (report_id),
      INDEX idx_comments_user_id (user_id),
      INDEX idx_comments_parent_id (parent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS report_verifications (
      id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
      report_id  INT UNSIGNED NOT NULL,
      user_id    INT UNSIGNED NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_report_verifications (report_id, user_id),
      INDEX idx_report_verifications_report_id (report_id),
      INDEX idx_report_verifications_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id      INT UNSIGNED NOT NULL,
      name         VARCHAR(150) NOT NULL,
      phone        VARCHAR(20) NOT NULL,
      email        VARCHAR(255),
      relationship VARCHAR(100),
      is_primary   TINYINT(1) NOT NULL DEFAULT 0,
      created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_emergency_contacts_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS emergency_requests (
      id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id            INT UNSIGNED NOT NULL,
      latitude           DECIMAL(10, 8),
      longitude          DECIMAL(11, 8),
      location_address   TEXT,
      status             ENUM('active', 'resolved', 'cancelled') NOT NULL DEFAULT 'active',
      sms_sent           TINYINT(1) NOT NULL DEFAULT 0,
      email_sent         TINYINT(1) NOT NULL DEFAULT 0,
      sms_status         VARCHAR(50),
      email_status       VARCHAR(50),
      resolved_at        DATETIME,
      created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_emergency_requests_user_id (user_id),
      INDEX idx_emergency_requests_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS notifications (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id     INT UNSIGNED NOT NULL,
      type        VARCHAR(100) NOT NULL,
      title       VARCHAR(300) NOT NULL,
      message     TEXT NOT NULL,
      is_read     TINYINT(1) NOT NULL DEFAULT 0,
      related_id  INT UNSIGNED,
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_notifications_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    CREATE TABLE IF NOT EXISTS duplicate_links (
      id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
      original_id      INT UNSIGNED NOT NULL,
      duplicate_id     INT UNSIGNED NOT NULL,
      similarity_score DECIMAL(5, 2),
      created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_duplicate_links (original_id, duplicate_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await connection.query(createTablesSql);
  console.log('✅ All database tables created successfully!');

  // Check if admin user exists, if not seed initial data
  const [adminRows] = await connection.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
  if (adminRows.length === 0) {
    console.log('🌱 Seeding initial development data...');
    // Seed admin (Admin@1234) and sample users
    await connection.query(`
      INSERT INTO users (id, name, email, phone_number, password, role, is_verified, is_active)
      VALUES 
        (1, 'JanaoBangla Admin', 'admin@janaobangla.com', '+8801700000000', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG', 'admin', 1, 1),
        (2, 'Rahim Uddin', 'rahim@example.com', '+8801711111111', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG', 'citizen', 1, 1),
        (3, 'Fatema Khatun', 'fatema@example.com', '+8801722222222', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG', 'citizen', 1, 1),
        (4, 'Karim Hossain', 'karim@example.com', '+8801733333333', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG', 'citizen', 1, 1)
      ON DUPLICATE KEY UPDATE name=VALUES(name);
    `);

    console.log('✅ Initial user accounts verified successfully!');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  await connection.end();
  console.log('🎉 Database setup complete!');
}

setupDatabase().catch(err => {
  console.error('❌ Database setup error:', err);
  process.exit(1);
});
