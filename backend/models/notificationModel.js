const pool = require('../db/connection');

const create = async (userId, message, relatedRequestId = null) => {
  const [result] = await pool.execute(
    'INSERT INTO notifications (user_id, message, related_request_id) VALUES (?, ?, ?)',
    [userId, message, relatedRequestId]
  );
  const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [result.insertId]);
  return rows[0];
};

const findByUser = async (userId, limit = 50) => {
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const [rows] = await pool.execute(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limitNum}`,
    [userId]
  );
  return rows;
};

const markAllRead = async (userId) => {
  await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
};

module.exports = { create, findByUser, markAllRead };
