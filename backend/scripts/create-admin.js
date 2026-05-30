/**
 * Run once to create an admin user:
 * node scripts/create-admin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');

async function main() {
  const email = 'admin@bloodlink.com';
  const password = 'Admin@123';
  const hashed = await bcrypt.hash(password, 10);

  try {
    await pool.execute(
      `INSERT INTO users (name, email, password, role, phone, phone_verified, is_available)
       VALUES ('Admin', ?, ?, 'admin', '9000000000', TRUE, FALSE)
       ON DUPLICATE KEY UPDATE name = name`,
      [email, hashed]
    );
    console.log('Admin created (or already exists):');
    console.log('  Email:', email);
    console.log('  Password:', password);
  } catch (err) {
    console.error(err.message);
  }
  process.exit(0);
}

main();
