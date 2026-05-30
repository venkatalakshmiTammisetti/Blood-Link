import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';
import { getApiError } from '../api/axios';

const OTP_EXPIRY_SECONDS = 5 * 60;
const RESEND_COOLDOWN_SECONDS = 60;

const PhoneOtpVerification = ({
  phone,
  onPhoneChange,
  onVerified,
  disabledPhone = false,
  sendOtpApi = authApi.sendOtp,
  verifyOtpApi = authApi.verifyOtp,
  sendButtonLabel = 'Send OTP',
  verifyButtonLabel = 'Verify Phone',
  footerText = 'We will send a one-time code to verify your mobile number. Required to register.',
}) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const normalizedPhone = phone.replace(/\D/g, '').slice(-10);

  const handleSendOtp = useCallback(async () => {
    setError('');
    setSuccess('');
    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }
    setSending(true);
    try {
      const { data } = await sendOtpApi(normalizedPhone);
      setOtpSent(true);
      setOtpInput('');
      setMockOtp(data.mockOtp || '');
      setSecondsLeft(data.expiresInSeconds || OTP_EXPIRY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccess(data.message);
    } catch (err) {
      setError(getApiError(err, 'Failed to send OTP.'));
    } finally {
      setSending(false);
    }
  }, [normalizedPhone, sendOtpApi]);

  const handleVerifyOtp = async () => {
    setError('');
    setSuccess('');
    if (!/^\d{6}$/.test(otpInput)) {
      setError('Enter the 6-digit OTP.');
      return;
    }
    setVerifying(true);
    try {
      const { data } = await verifyOtpApi(normalizedPhone, otpInput);
      setSuccess(data.message);
      onVerified(normalizedPhone);
    } catch (err) {
      setError(getApiError(err, 'Verification failed.'));
    } finally {
      setVerifying(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

      <div>
        <label className="label">Phone Number</label>
        <input
          className="input-field"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
          disabled={disabledPhone || otpSent}
          inputMode="numeric"
          pattern="\d{10}"
          placeholder="10 digit mobile"
          maxLength={10}
        />
      </div>

      {!otpSent ? (
        <button type="button" onClick={handleSendOtp} className="btn-primary w-full" disabled={sending}>
          {sending ? 'Sending OTP...' : sendButtonLabel}
        </button>
      ) : (
        <>
          {mockOtp && (
            <p className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg">
              Dev OTP: <strong>{mockOtp}</strong> (also in server console)
            </p>
          )}
          {secondsLeft > 0 && (
            <p className="text-sm text-gray-600 text-center">
              OTP expires in <strong className="text-primary">{formatTime(secondsLeft)}</strong>
            </p>
          )}
          {secondsLeft === 0 && otpSent && (
            <p className="text-sm text-red-600 text-center">OTP expired. Request a new code.</p>
          )}
          <div>
            <label className="label">Enter 6-digit OTP</label>
            <input
              className="input-field text-center tracking-widest text-lg"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="••••••"
              autoComplete="one-time-code"
            />
          </div>
          <button
            type="button"
            onClick={handleVerifyOtp}
            className="btn-primary w-full"
            disabled={verifying || secondsLeft === 0}
          >
            {verifying ? 'Verifying...' : verifyButtonLabel}
          </button>
          <button
            type="button"
            onClick={handleSendOtp}
            className="btn-outline w-full text-sm"
            disabled={sending || resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </>
      )}

      {footerText && <p className="text-xs text-gray-500 text-center">{footerText}</p>}
    </div>
  );
};

export default PhoneOtpVerification;
