/**
 * Read-only check: password_reset_otp columns vs expected implementation.
 * Run: node scripts/verify-password-reset-schema.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('../db/connection');

const EXPECTED = {
  phone: { typeIncludes: ['varchar'], nullable: false },
  otp_hash: { typeIncludes: ['varchar'], nullable: false },
  attempt_count: { typeIncludes: ['int'], nullable: false },
  verified_at: { typeIncludes: ['datetime', 'timestamp'], nullable: true },
};

async function main() {
  try {
    const [columns] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_TYPE
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'password_reset_otp'
       ORDER BY ORDINAL_POSITION`,
      [process.env.DB_NAME || 'bloodlink']
    );

    if (columns.length === 0) {
      console.log('MISMATCH: Table password_reset_otp does not exist.');
      process.exit(1);
    }

    const byName = Object.fromEntries(columns.map((c) => [c.COLUMN_NAME, c]));
    let ok = true;

    for (const [name, spec] of Object.entries(EXPECTED)) {
      const col = byName[name];
      if (!col) {
        console.log(`MISMATCH: Missing column "${name}".`);
        ok = false;
        continue;
      }
      const typeOk = spec.typeIncludes.some((t) => col.DATA_TYPE.toLowerCase().includes(t));
      const nullOk = spec.nullable ? col.IS_NULLABLE === 'YES' : col.IS_NULLABLE === 'NO';
      if (!typeOk) {
        console.log(`MISMATCH: Column "${name}" type is ${col.COLUMN_TYPE}; expected ${spec.typeIncludes.join('|')}.`);
        ok = false;
      }
      if (!nullOk) {
        console.log(`MISMATCH: Column "${name}" nullable=${col.IS_NULLABLE}; expected nullable=${spec.nullable}.`);
        ok = false;
      }
    }

    const legacy = ['email', 'otp'].filter((c) => byName[c]);
    if (legacy.length) {
      console.log(`MISMATCH: Legacy columns still present: ${legacy.join(', ')}. Run migrate-password-reset-phone.sql.`);
      ok = false;
    }

    if (ok) {
      console.log('OK: password_reset_otp schema matches current implementation.');
    } else {
      console.log('\nExpected columns: phone, otp_hash, attempt_count, verified_at (+ id, expires_at, verified, created_at).');
      console.log('See backend/db/schema.sql and backend/db/migrate-password-reset-phone.sql');
    }

    process.exit(ok ? 0 : 1);
  } catch (err) {
    console.error('Verification failed:', err.message);
    process.exit(1);
  }
}

main();
