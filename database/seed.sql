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
INSERT INTO users (full_name, email, phone, password_hash, role, is_verified, is_active)
VALUES (
  'JanaoBangla Admin',
  'admin@janaobangla.com',
  '+8801700000000',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG',
  'admin',
  1,
  1
);

-- ==========================================
-- SAMPLE USERS — Development testing er jonno
-- Password sob er jonno: User@1234
-- ==========================================
INSERT INTO users (full_name, email, phone, password_hash, role, is_verified, is_active)
VALUES
  (
    'Rahim Uddin',
    'rahim@example.com',
    '+8801711111111',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG',
    'user',
    1,
    1
  ),
  (
    'Fatema Khatun',
    'fatema@example.com',
    '+8801722222222',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG',
    'user',
    1,
    1
  ),
  (
    'Karim Hossain',
    'karim@example.com',
    '+8801733333333',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMYJZNiEIxvSIl5qGEYlHbJMSG',
    'user',
    0,
    1
  );

-- ==========================================
-- SAMPLE LOCATIONS — Bangladesh er real coordinates
-- ==========================================
INSERT INTO locations (label, address, division, district, upazila, latitude, longitude)
VALUES
  (
    'Dhanmondi Lake Area',
    'Dhanmondi, Dhaka',
    'Dhaka',
    'Dhaka',
    'Dhanmondi',
    23.74695,
    90.37440
  ),
  (
    'Mirpur-10 Circle',
    'Mirpur-10, Dhaka',
    'Dhaka',
    'Dhaka',
    'Mirpur',
    23.80726,
    90.36893
  ),
  (
    'Agrabad Commercial Area',
    'Agrabad, Chattogram',
    'Chattogram',
    'Chattogram',
    'Double Mooring',
    22.33029,
    91.82289
  ),
  (
    'Sylhet City Center',
    'Zindabazar, Sylhet',
    'Sylhet',
    'Sylhet',
    'Sylhet Sadar',
    24.89528,
    91.86917
  );

-- ==========================================
-- SAMPLE REPORTS — Development er jonno test reports
-- ==========================================
INSERT INTO reports (user_id, location_id, title, description, category, status, visibility, priority, verification_count)
VALUES
  (
    2,
    1,
    'Dhanmondi Lake Road e Bora Khaad',
    'Dhanmondi 27 number road e ekta bora khaad ache. Raat e light nei tai accident er bhoy ache. Khub taratari fix kora dorkar.',
    'road_damage',
    'submitted',
    'public',
    'high',
    5
  ),
  (
    3,
    2,
    'Mirpur-10 e Garbage Jome Ache',
    'Mirpur-10 bus stand er pashe bahir theke boro pile of garbage jome ache. Gondho ber hocche, manush pathe chole ne parche.',
    'garbage_waste',
    'under_review',
    'public',
    'medium',
    12
  ),
  (
    2,
    1,
    'Street Light Kaj Korche Na',
    'Dhanmondi 15 er shesh mathay 5ta street light er moddhe 3ta e kharap. Raat 8tar por oi path khub andhara thake.',
    'street_light',
    'processing',
    'public',
    'medium',
    3
  ),
  (
    4,
    3,
    'Chattogram Agrabad e Pani Jome Ache',
    'Borsha r paani nikashot problem er karone Agrabad er main road e ek goru dhore pani jome ache. Dupur berle haastu jabe.',
    'water_drainage',
    'submitted',
    'public',
    'critical',
    8
  );
