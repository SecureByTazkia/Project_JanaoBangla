const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/DatabaseConnection');

async function checkAndMigrate() {
  const [cols] = await db.pool.query("SHOW COLUMNS FROM reports WHERE Field = 'category'");
  console.log('Current category type:', cols[0]?.Type);

  const [harassCol] = await db.pool.query("SHOW COLUMNS FROM reports WHERE Field = 'harassment_type'");
  console.log('Current harassment_type:', harassCol[0]?.Type);

  const catType = cols[0]?.Type || '';
  if (!catType.includes('women_harassment') || !catType.includes('extortion_chanda')) {
    console.log('Updating reports.category ENUM in MySQL...');
    await db.pool.query("ALTER TABLE reports MODIFY COLUMN category ENUM('road_damage', 'garbage_waste', 'street_light', 'water_drainage', 'traffic_accident', 'public_safety', 'women_harassment', 'extortion_chanda') NOT NULL");
    console.log('✅ category ENUM updated successfully!');
  } else {
    console.log('✅ category ENUM already has all categories!');
  }

  if (!harassCol || harassCol.length === 0) {
    console.log('Adding harassment_type column to reports...');
    await db.pool.query("ALTER TABLE reports ADD COLUMN harassment_type ENUM('online', 'offline') NULL DEFAULT NULL AFTER category");
    console.log('✅ harassment_type column added successfully!');
  } else {
    console.log('✅ harassment_type column exists!');
  }

  process.exit(0);
}

checkAndMigrate().catch(e => {
  console.error('Migration error:', e);
  process.exit(1);
});
