-- ==========================================
-- JanaoBangla — Database Schema Foundation
-- BRANCH: main
-- Ei file ta database er sob table create korbe
-- MySQL e run korte: mysql -u root -p < database/schema.sql
-- ==========================================

-- Database create kora hocche jodi na thake
CREATE DATABASE IF NOT EXISTS janao_bangla_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Database select kora hocche
USE janao_bangla_db;

-- ==========================================
-- TABLE: users
-- System er sob user er information store hobe
-- role field diye admin ar citizen user alag kora hobe
-- ==========================================
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

-- ==========================================
-- TABLE: email_verifications
-- Email verify korar jonno token store hobe
-- ==========================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at    DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_email_verifications_token (token),
  INDEX idx_email_verifications_user_id (user_id),
  FOREIGN KEY fk_email_verifications_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: password_resets
-- Password reset request er token store hobe
-- ==========================================
CREATE TABLE IF NOT EXISTS password_resets (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at    DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_password_resets_token (token),
  INDEX idx_password_resets_user_id (user_id),
  FOREIGN KEY fk_password_resets_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: locations
-- Report er location data alag table e store hobe
-- Leaflet map er jonno latitude/longitude dorkar
-- ==========================================
CREATE TABLE IF NOT EXISTS locations (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  label        VARCHAR(300),
  address      TEXT,
  division     VARCHAR(100),
  district     VARCHAR(100),
  upazila      VARCHAR(100),
  latitude     DECIMAL(10, 8) NOT NULL,
  longitude    DECIMAL(11, 8) NOT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_locations_lat_lng (latitude, longitude),
  INDEX idx_locations_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: reports
-- Civic problem report er sob information store hobe
-- status track korbe report kothay ache
-- visibility control korbe public/private
-- ==========================================
CREATE TABLE IF NOT EXISTS reports (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id            INT UNSIGNED NOT NULL,
  location_id        INT UNSIGNED,
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
  INDEX idx_reports_created_at (created_at),
  INDEX idx_reports_location_id (location_id),
  FOREIGN KEY fk_reports_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY fk_reports_location_id (location_id)
    REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY fk_reports_duplicate_of_id (duplicate_of_id)
    REFERENCES reports(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: report_evidence
-- Report er sathe upload kora image/video store hobe
-- Multer diye upload hoye file path ei table e jabe
-- ==========================================
CREATE TABLE IF NOT EXISTS report_evidence (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id   INT UNSIGNED NOT NULL,
  file_type   ENUM('image', 'video') NOT NULL,
  file_name   VARCHAR(500) NOT NULL,
  file_path   VARCHAR(1000) NOT NULL,
  file_size   INT UNSIGNED,
  mime_type   VARCHAR(100),
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_report_evidence_report_id (report_id),
  FOREIGN KEY fk_report_evidence_report_id (report_id)
    REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: comments
-- Community members report e comment dite parbe
-- Replies support korar jonno parent_id use hobe
-- ==========================================
CREATE TABLE IF NOT EXISTS comments (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id    INT UNSIGNED NOT NULL,
  user_id      INT UNSIGNED NOT NULL,
  parent_id    INT UNSIGNED,
  content      TEXT NOT NULL,
  is_flagged   TINYINT(1) NOT NULL DEFAULT 0,
  is_hidden    TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_comments_report_id (report_id),
  INDEX idx_comments_user_id (user_id),
  INDEX idx_comments_parent_id (parent_id),
  FOREIGN KEY fk_comments_report_id (report_id)
    REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY fk_comments_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY fk_comments_parent_id (parent_id)
    REFERENCES comments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: report_verifications
-- Community members report confirm korle ei table e record hobe
-- Ek user ekta report ek bar i confirm korte parbe
-- ==========================================
CREATE TABLE IF NOT EXISTS report_verifications (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_id  INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_report_verifications (report_id, user_id),
  INDEX idx_report_verifications_report_id (report_id),
  FOREIGN KEY fk_report_verifications_report_id (report_id)
    REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY fk_report_verifications_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: emergency_contacts
-- Women Safety feature er jonno emergency contact store hobe
-- Ek user multiple contact rakhte parbe
-- ==========================================
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
  INDEX idx_emergency_contacts_user_id (user_id),
  FOREIGN KEY fk_emergency_contacts_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: emergency_requests
-- SOS button press korle ei table e record hobe
-- GPS location, status, notification info store hobe
-- ==========================================
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
  INDEX idx_emergency_requests_status (status),
  INDEX idx_emergency_requests_created_at (created_at),
  FOREIGN KEY fk_emergency_requests_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: notifications
-- System generated notifications store hobe
-- User ke notify korte ei table use hobe
-- ==========================================
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
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_is_read (is_read),
  INDEX idx_notifications_created_at (created_at),
  FOREIGN KEY fk_notifications_user_id (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABLE: duplicate_links
-- Duplicate report detect hoile duto report er link store hobe
-- ==========================================
CREATE TABLE IF NOT EXISTS duplicate_links (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  original_id      INT UNSIGNED NOT NULL,
  duplicate_id     INT UNSIGNED NOT NULL,
  similarity_score DECIMAL(5, 2),
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_duplicate_links (original_id, duplicate_id),
  INDEX idx_duplicate_links_original_id (original_id),
  INDEX idx_duplicate_links_duplicate_id (duplicate_id),
  FOREIGN KEY fk_duplicate_links_original_id (original_id)
    REFERENCES reports(id) ON DELETE CASCADE,
  FOREIGN KEY fk_duplicate_links_duplicate_id (duplicate_id)
    REFERENCES reports(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
