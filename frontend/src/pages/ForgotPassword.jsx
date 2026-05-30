import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PhoneOtpVerification from '../components/PhoneOtpVerification';
import { authApi } from '../api/endpoints';
import { getApiError } from '../api/axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePhoneVerified = (verifiedPhone) => {
    setPhone(verifiedPhone);
    setOtpVerified(true);
    setStep(2);
    setSuccess('OTP verified. Set your new password within 30 minutes.');
    setError('');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setError('Please verify your phone with OTP first.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await authApi.resetPassword(phone, password);
      setSuccess(data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(getApiError(err, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto card">
        <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Step {step} of 2 — {step === 1 ? 'Verify phone with OTP' : 'Set new password'}
        </p>

        {step === 2 && error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</div>
        )}

        {step === 1 && (
          <PhoneOtpVerification
            phone={phone}
            onPhoneChange={setPhone}
            onVerified={handlePhoneVerified}
            sendOtpApi={authApi.forgotPassword}
            verifyOtpApi={authApi.verifyResetOtp}
            sendButtonLabel="Send Reset OTP"
            verifyButtonLabel="Verify OTP"
            footerText="Enter your registered mobile number. We will send a code to reset your password."
          />
        )}

        {step === 2 && otpVerified && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-gray-600">
              Resetting password for <strong>+91{phone}</strong>
            </p>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtpVerified(false);
                setPassword('');
                setConfirmPassword('');
                setSuccess('');
              }}
              className="btn-outline w-full text-sm"
            >
              Start over
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-primary font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
