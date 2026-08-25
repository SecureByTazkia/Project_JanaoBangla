-- ==========================================
-- JanaoBangla — Seed Data for Development
-- BRANCH: main
-- Ei file ta development er jonno test data insert korbe
-- IMPORTANT: Production e kabhi run korbe na
-- Run korte: mysql -u root -p < database/seed.sql
-- ==========================================

USE janao_bangla_db;

-- ==========================================
-- ADMIN USER SEED
-- Password: Admin@1234 (bcrypt hashed)
-- Production e ei password change korte hobe
-- bcrypt hash generate korte:
--   node -e "const b=require('bcrypt'); b.hash('Admin@1234',12).then(h=>console.log(h))"
-- ==========================================
INSERT INTO users (name, email, phone_number, password, role, is_verified, is_active)
VALUES (
  'JanaoBangla Admin',
  'admin@janaobangla.com',
  '+8801700000000',
  '$2b$12$7xYkf0TZW7P0/.D4TseEhOJfKbCwYWWCOL0.rjmvZz34EVV17gXTm',
  'admin',
  1,
  1
);

-- ==========================================
-- SAMPLE USERS — Development testing er jonno
-- Password sob er jonno: User@1234
-- ==========================================
INSERT INTO users (name, email, phone_number, password, role, is_verified, is_active)
VALUES
  (
    'Rahim Uddin',
    'rahim@example.com',
    '+8801711111111',
    '$2b$12$7xYkf0TZW7P0/.D4TseEhOJfKbCwYWWCOL0.rjmvZz34EVV17gXTm',
    'citizen',
    1,
    1
  ),
  (
    'Fatema Khatun',
    'fatema@example.com',
    '+8801722222222',
    '$2b$12$7xYkf0TZW7P0/.D4TseEhOJfKbCwYWWCOL0.rjmvZz34EVV17gXTm',
    'citizen',
    1,
    1
  ),
  (
    'Karim Hossain',
    'karim@example.com',
    '+8801733333333',
    '$2b$12$7xYkf0TZW7P0/.D4TseEhOJfKbCwYWWCOL0.rjmvZz34EVV17gXTm',
    'citizen',
    0,
    1
  );

-- ==========================================
-- Users Seed complete. Real civic reports will be submitted by users via frontend.
-- ==========================================
