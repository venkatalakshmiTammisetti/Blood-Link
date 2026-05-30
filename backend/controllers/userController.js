const pool = require('../db/connection');
const { formatUser, normalizeLocation } = require('../utils/helpers');

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.execute(
      `SELECT id, name, email, role, phone, phone_verified, aadhar, blood_group,
              age, gender, location_lat, location_lng, is_available, created_at
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.user.role !== 'admin' && parseInt(id, 10) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this profile.' });
    }

    const user = formatUser(users[0]);
    if (req.user.role !== 'admin') delete user.aadhar;

    res.json({ success: true, user });
  } catch (error) {
    console.error('getUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id, 10);

    if (req.user.role !== 'admin' && userId !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile.' });
    }

    const { name, location_lat, location_lng, is_available, blood_group, age, gender } = req.body;

    const [existing] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = existing[0];
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (location_lat != null && location_lng != null) {
      const coords = normalizeLocation(location_lat, location_lng);
      if (coords.location_lat == null || coords.location_lng == null) {
        return res.status(400).json({ success: false, message: 'Invalid location coordinates.' });
      }
      updates.push('location_lat = ?', 'location_lng = ?');
      values.push(coords.location_lat, coords.location_lng);
    } else if (location_lat != null || location_lng != null) {
      return res.status(400).json({ success: false, message: 'Both latitude and longitude are required.' });
    }
    if (is_available !== undefined && user.role === 'donor') {
      updates.push('is_available = ?');
      values.push(Boolean(is_available));
    }
    if (blood_group && user.role === 'donor') {
      updates.push('blood_group = ?');
      values.push(blood_group);
    }
    if (age && user.role === 'donor') {
      updates.push('age = ?');
      values.push(parseInt(age, 10));
    }
    if (gender && user.role === 'donor') {
      updates.push('gender = ?');
      values.push(gender);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    values.push(userId);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

    const [updated] = await pool.execute(
      `SELECT id, name, email, role, phone, phone_verified, blood_group,
              age, gender, location_lat, location_lng, is_available
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({ success: true, message: 'Profile updated.', user: formatUser(updated[0]) });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

module.exports = { getUser, updateUser };
