module.exports = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  /** Window after verify-otp during which registration is allowed */
  REGISTRATION_VERIFY_WINDOW_MINUTES: 30,
  MAX_VERIFY_ATTEMPTS: 5,
  OTP_BCRYPT_ROUNDS: 10,
};
