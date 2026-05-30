const bcrypt = require('bcryptjs');
const otpModel = require('../models/otpModel');
const { generateOtp } = require('../utils/helpers');
const { sendSmsOtp } = require('../utils/smsService');
const {
  OTP_EXPIRY_MINUTES,
  REGISTRATION_VERIFY_WINDOW_MINUTES,
  MAX_VERIFY_ATTEMPTS,
  OTP_BCRYPT_ROUNDS,
} = require('../utils/otpConfig');

const normalizePhone = (phone) => String(phone).replace(/\D/g, '').slice(-10);

const sendOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required.' });
    }

    const recentSends = await otpModel.countRecentSends(phone, 15);
    if (recentSends >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests for this number. Try again in 15 minutes.',
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await otpModel.invalidatePendingForPhone(phone);
    await otpModel.create(phone, otpHash, expiresAt);
    await sendSmsOtp(phone, otp);

    const payload = {
      success: true,
      message: `OTP sent to +91${phone}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    };
    if (process.env.NODE_ENV !== 'production') {
      payload.mockOtp = otp;
    }
    res.json(payload);
  } catch (error) {
    console.error('sendOtp error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit phone number required.' });
    }
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: 'OTP must be a 6-digit code.' });
    }

    const record = await otpModel.findLatestPending(phone);
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
      await otpModel.incrementAttempts(record.id);
      const remaining = MAX_VERIFY_ATTEMPTS - (record.attempt_count + 1);
      return res.status(400).json({
        success: false,
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempt(s) remaining.`
            : 'Invalid OTP. Request a new code.',
      });
    }

    await otpModel.markVerified(record.id);

    res.json({
      success: true,
      message: 'Phone verified successfully. Complete registration within 30 minutes.',
      phone,
      phone_verified: true,
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
};

const isPhoneOtpVerified = async (phone) =>
  otpModel.isPhoneVerifiedForRegistration(
    normalizePhone(phone),
    REGISTRATION_VERIFY_WINDOW_MINUTES
  );

module.exports = { sendOtp, verifyOtp, isPhoneOtpVerified, normalizePhone };
