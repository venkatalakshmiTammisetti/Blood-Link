const pool = require('../db/connection');

const findByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
};

const findByPhone = async (phone) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE phone = ?', [phone]);
  return rows[0] || null;
};

const findById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
};

const findByAadhar = async (aadhar) => {
  const [rows] = await pool.execute('SELECT id FROM users WHERE aadhar = ?', [aadhar]);
  return rows[0] || null;
};

const create = async (data) => {
  const [result] = await pool.execute(
    `INSERT INTO users (
      name, email, password, role, phone, phone_verified,
      aadhar, blood_group, age, gender, location_lat, location_lng, is_available
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    data
  );
  return findById(result.insertId);
};

const update = async (id, fields) => {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  values.push(id);
  await pool.execute(`UPDATE users SET ${setClause} WHERE id = ?`, values);
  return findById(id);
};

const findMatchingDonors = async (bloodGroup) => {
  const [rows] = await pool.execute(
    `SELECT id, name, phone, blood_group, location_lat, location_lng, is_available, age, phone_verified
     FROM users
     WHERE role = 'donor'
       AND blood_group = ?
       AND is_available = TRUE
       AND phone_verified = TRUE
       AND age >= 18
       AND location_lat IS NOT NULL
       AND location_lng IS NOT NULL`,
    [bloodGroup]
  );
  return rows;
};

module.exports = { findByEmail, findByPhone, findById, findByAadhar, create, update, findMatchingDonors };
