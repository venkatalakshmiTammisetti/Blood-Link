/**
 * Mock SMS for development, demo, and testing.
 * OTP is logged to the backend console; API may include mockOtp in non-production.
 */
const sendSmsOtp = async (phone, otp) => {
  const message = `Your Blood-Link verification code is ${otp}. Valid for 5 minutes. Do not share this code.`;
  console.log(`[SMS MOCK] To: +91${phone}\n${message}`);
  return { delivered: true, provider: 'mock' };
};

module.exports = { sendSmsOtp };
