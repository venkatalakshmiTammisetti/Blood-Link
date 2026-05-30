const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { sendOtp, verifyOtp } = require('../controllers/otpController');
const {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../controllers/passwordResetController');
const { createRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

const authLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many login attempts. Try again in 15 minutes.' });
const otpLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5, message: 'Too many OTP requests. Try again in 15 minutes.' });
const verifyOtpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many verification attempts. Try again in 15 minutes.',
});

router.post('/register', register);
router.post('/login', authLimiter, login);
router.post('/send-otp', otpLimiter, sendOtp);
router.post('/verify-otp', verifyOtpLimiter, verifyOtp);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/verify-reset-otp', verifyOtpLimiter, verifyResetOtp);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', authenticate, getMe);

module.exports = router;
