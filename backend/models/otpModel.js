const pool = require('../db/connection');

const invalidatePendingForPhone = async (phone) => {
  await pool.execute(
    `UPDATE otp_verification SET verified = TRUE, verified_at = NOW()
     WHERE phone = ? AND verified = FALSE`,
    [phone]
  );
};

const create = async (phone, otpHash, expiresAt) => {
  const [result] = await pool.execute(
    `INSERT INTO otp_verification (phone, otp_hash, expires_at, verified, attempt_count)
     VALUES (?, ?, ?, FALSE, 0)`,
    [phone, otpHash, expiresAt]
  );
  return result.insertId;
};

const findLatestPending = async (phone) => {
  const [rows] = await pool.execute(
    `SELECT * FROM otp_verification
     WHERE phone = ? AND verified = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone]
  );
  return rows[0] || null;
};

const incrementAttempts = async (id) => {
  await pool.execute('UPDATE otp_verification SET attempt_count = attempt_count + 1 WHERE id = ?', [id]);
};

const markVerified = async (id) => {
  await pool.execute(
    'UPDATE otp_verification SET verified = TRUE, verified_at = NOW() WHERE id = ?',
    [id]
  );
};

const isPhoneVerifiedForRegistration = async (phone, windowMinutes) => {
  const [rows] = await pool.execute(
    `SELECT id FROM otp_verification
     WHERE phone = ? AND verified = TRUE
       AND verified_at IS NOT NULL
       AND verified_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
     ORDER BY verified_at DESC LIMIT 1`,
    [phone, windowMinutes]
  );
  return rows.length > 0;
};

const countRecentSends = async (phone, windowMinutes) => {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS cnt FROM otp_verification
     WHERE phone = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
    [phone, windowMinutes]
  );
  return rows[0].cnt;
};

module.exports = {
  invalidatePendingForPhone,
  create,
  findLatestPending,
  incrementAttempts,
  markVerified,
  isPhoneVerifiedForRegistration,
  countRecentSends,
};
