const pool = require('../db/connection');

const invalidatePendingForPhone = async (phone) => {
  await pool.execute(
    `UPDATE password_reset_otp SET verified = TRUE, verified_at = NOW()
     WHERE phone = ? AND verified = FALSE`,
    [phone]
  );
};

const create = async (phone, otpHash, expiresAt) => {
  const [result] = await pool.execute(
    `INSERT INTO password_reset_otp (phone, otp_hash, expires_at, verified, attempt_count)
     VALUES (?, ?, ?, FALSE, 0)`,
    [phone, otpHash, expiresAt]
  );
  return result.insertId;
};

const findLatestPending = async (phone) => {
  const [rows] = await pool.execute(
    `SELECT * FROM password_reset_otp
     WHERE phone = ? AND verified = FALSE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone]
  );
  return rows[0] || null;
};

const incrementAttempts = async (id) => {
  await pool.execute('UPDATE password_reset_otp SET attempt_count = attempt_count + 1 WHERE id = ?', [id]);
};

const markVerified = async (id) => {
  await pool.execute(
    'UPDATE password_reset_otp SET verified = TRUE, verified_at = NOW() WHERE id = ?',
    [id]
  );
};

const isPhoneVerifiedForReset = async (phone, windowMinutes) => {
  const [rows] = await pool.execute(
    `SELECT id FROM password_reset_otp
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
    `SELECT COUNT(*) AS cnt FROM password_reset_otp
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
  isPhoneVerifiedForReset,
  countRecentSends,
};
