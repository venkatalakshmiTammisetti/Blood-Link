const bcrypt = require('bcryptjs');
const pool = require('../db/connection');
const passwordResetModel = require('../models/passwordResetModel');
const { generateOtp } = require('../utils/helpers');
const { sendSmsOtp } = require('../utils/smsService');
const { normalizePhone } = require('./otpController');
const {
  OTP_EXPIRY_MINUTES,
  MAX_VERIFY_ATTEMPTS,
  OTP_BCRYPT_ROUNDS,
} = require('../utils/otpConfig');

const RESET_VERIFY_WINDOW_MINUTES = 30;

const forgotPassword = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required.' });
    }

    const [users] = await pool.execute('SELECT id, name FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this phone number.' });
    }

    const recentSends = await passwordResetModel.countRecentSends(phone, 15);
    if (recentSends >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many reset requests for this number. Try again in 15 minutes.',
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await passwordResetModel.invalidatePendingForPhone(phone);
    await passwordResetModel.create(phone, otpHash, expiresAt);
    await sendSmsOtp(phone, otp);

    const payload = {
      success: true,
      message: `Password reset OTP sent to +91${phone}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
    if (process.env.NODE_ENV !== 'production') {
      payload.mockOtp = otp;
    }
    res.json(payload);
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset OTP.' });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required.' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'OTP must be a 6-digit code.' });
    }

    const [users] = await pool.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this phone number.' });
    }

    const record = await passwordResetModel.findLatestPending(phone);
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new OTP.',
      });
    }

    if (record.attempt_count >= MAX_VERIFY_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Request a new OTP.',
      });
    }

    const valid = await bcrypt.compare(otp, record.otp_hash);
    if (!valid) {
      await passwordResetModel.incrementAttempts(record.id);
      const remaining = MAX_VERIFY_ATTEMPTS - (record.attempt_count + 1);
      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempt(s) remaining.`
            : 'Invalid OTP. Request a new code.',
      });
    }

    await passwordResetModel.markVerified(record.id);

    res.json({
      success: true,
      message: 'OTP verified. Set your new password within 30 minutes.',
      phone,
    });
  } catch (error) {
    console.error('verifyResetOtp error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const password = String(req.body.password || '');

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const verified = await passwordResetModel.isPhoneVerifiedForReset(phone, RESET_VERIFY_WINDOW_MINUTES);
    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Phone OTP not verified or session expired. Verify OTP again.',
      });
    }

    const [users] = await pool.execute('SELECT id FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute('UPDATE users SET password = ? WHERE phone = ?', [hashedPassword, phone]);

    res.json({ success: true, message: 'Password reset successful. You can log in with your new password.' });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
};

module.exports = { forgotPassword, verifyResetOtp, resetPassword };
