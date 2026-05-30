const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/connection');
const { isPhoneOtpVerified } = require('./otpController');
const { sanitizeUser, formatUser, BLOOD_GROUPS, normalizeLocation, toBool } = require('../utils/helpers');

const signToken = (user) =>
  jwt.sign(
    { id: Number(user.id), email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const ALLOWED_REGISTER_ROLES = ['donor', 'patient'];

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role: requestedRole = 'donor',
      aadhar,
      blood_group,
      age,
      gender,
      location_lat,
      location_lng,
      is_available = true,
    } = req.body;

    const role = ALLOWED_REGISTER_ROLES.includes(requestedRole) ? requestedRole : null;
    if (!role) {
      return res.status(400).json({ success: false, message: 'Invalid role. Register as donor or patient only.' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required.' });
    }

    if (!name || !normalizedEmail || !password || !normalizedPhone) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and phone are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const phoneVerified = await isPhoneOtpVerified(normalizedPhone);
    if (!phoneVerified) {
      return res.status(400).json({ success: false, message: 'Phone number must be verified with OTP first.' });
    }

    if (role === 'donor') {
      if (!aadhar || !/^\d{12}$/.test(aadhar)) {
        return res.status(400).json({ success: false, message: 'Aadhaar must be exactly 12 digits.' });
      }
      if (!blood_group || !BLOOD_GROUPS.includes(blood_group)) {
        return res.status(400).json({ success: false, message: 'Valid blood group is required.' });
      }
      if (!age || parseInt(age, 10) < 18) {
        return res.status(400).json({ success: false, message: 'Donor must be at least 18 years old.' });
      }
      if (!gender) {
        return res.status(400).json({ success: false, message: 'Gender is required for donors.' });
      }
      const [existingAadhar] = await pool.execute('SELECT id FROM users WHERE aadhar = ?', [aadhar]);
      if (existingAadhar.length > 0) {
        return res.status(400).json({ success: false, message: 'Aadhaar number already registered.' });
      }
    }

    const coords = normalizeLocation(location_lat, location_lng);
    if (coords.location_lat == null || coords.location_lng == null) {
      return res.status(400).json({
        success: false,
        message:
          'Valid location required (lat -90 to 90, lng -180 to 180). Click Use GPS and allow location access, or type coordinates manually.',
      });
    }

    const [existingEmail] = await pool.execute('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingEmail.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const [existingPhone] = await pool.execute('SELECT id FROM users WHERE phone = ?', [normalizedPhone]);
    if (existingPhone.length > 0) {
      return res.status(400).json({ success: false, message: 'Phone already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (
        name, email, password, role, phone, phone_verified,
        aadhar, blood_group, age, gender, location_lat, location_lng, is_available
      ) VALUES (?, ?, ?, ?, ?, TRUE, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        normalizedEmail,
        hashedPassword,
        role,
        normalizedPhone,
        role === 'donor' ? aadhar : null,
        role === 'donor' ? blood_group : null,
        role === 'donor' ? parseInt(age, 10) : null,
        role === 'donor' ? gender : null,
        coords.location_lat,
        coords.location_lng,
        role === 'donor' ? Boolean(is_available) : false,
      ]
    );

    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = users[0];
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('register error:', error);
    const msg =
      error.code === 'ER_WARN_DATA_OUT_OF_RANGE'
        ? 'Invalid location coordinates. Click Use GPS or enter valid lat/lng.'
        : error.code === 'ER_DUP_ENTRY'
          ? 'Email, phone, or Aadhaar already registered.'
          : 'Registration failed.';
    res.status(500).json({ success: false, message: msg });
  }
};

const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ success: false, message: 'Email or phone and password are required.' });
    }

    let query = 'SELECT * FROM users WHERE ';
    const params = [];
    if (email) {
      query += 'email = ?';
      params.push(String(email).toLowerCase().trim());
    } else {
      query += 'phone = ?';
      params.push(String(phone).replace(/\D/g, '').slice(-10));
    }

    const [users] = await pool.execute(query, params);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.role === 'donor' && !toBool(user.phone_verified)) {
      return res.status(403).json({ success: false, message: 'Donor account not verified. Please complete OTP verification.' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, name, email, role, phone, phone_verified, blood_group,
              age, gender, location_lat, location_lng, is_available, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: formatUser(users[0]) });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};

module.exports = { register, login, getMe };
