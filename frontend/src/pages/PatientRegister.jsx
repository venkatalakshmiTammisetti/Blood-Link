import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PhoneOtpVerification from '../components/PhoneOtpVerification';
import { authApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatCoordinate } from '../utils/constants';
import LocationFields from '../components/LocationFields';

const PatientRegister = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location_lat: '',
    location_lng: '',
  });

  const handlePhoneVerified = (verifiedPhone) => {
    setPhoneVerified(true);
    setForm((prev) => ({ ...prev, phone: verifiedPhone }));
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneVerified) {
      setError('Please verify your phone number first.');
      return;
    }
    const location_lat = formatCoordinate(form.location_lat, 'lat');
    const location_lng = formatCoordinate(form.location_lng, 'lng');
    if (!location_lat || !location_lng) {
      setError('Enter valid coordinates or use GPS.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await authApi.register({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: 'patient',
        location_lat: parseFloat(location_lat),
        location_lng: parseFloat(location_lng),
      });
      login(data.token, data.user);
      navigate('/patient-dashboard', { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto card">
        <h2 className="text-2xl font-bold text-center mb-2">Patient Registration</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Step {step} of 2 — {step === 1 ? 'Phone OTP Verification' : 'Account Details'}
        </p>

        {step === 2 && error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        {step === 2 && success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{success}</div>
        )}

        {step === 1 && (
          <PhoneOtpVerification
            phone={form.phone}
            onPhoneChange={(phone) => setForm({ ...form, phone })}
            onVerified={handlePhoneVerified}
          />
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              Phone +91{form.phone} verified. Complete registration within 30 minutes.
            </p>
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
            </div>
            <LocationFields
              lat={form.location_lat}
              lng={form.location_lng}
              onChange={(location_lat, location_lng) => setForm({ ...form, location_lat, location_lng })}
              onError={setError}
              onSuccess={setSuccess}
            />
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-primary font-medium">Login</Link>
        </p>
      </div>
    </Layout>
  );
};

export default PatientRegister;
