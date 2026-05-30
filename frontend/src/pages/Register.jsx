import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PhoneOtpVerification from '../components/PhoneOtpVerification';
import { authApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, GENDERS, formatCoordinate } from '../utils/constants';
import LocationFields from '../components/LocationFields';

const Register = () => {
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
    aadhar: '',
    blood_group: 'O+',
    age: '',
    gender: 'Male',
    location_lat: '',
    location_lng: '',
    is_available: true,
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
    if (!/^\d{12}$/.test(form.aadhar)) {
      setError('Aadhaar must be exactly 12 digits.');
      return;
    }
    if (parseInt(form.age, 10) < 18) {
      setError('You must be at least 18 years old.');
      return;
    }
    const location_lat = formatCoordinate(form.location_lat, 'lat');
    const location_lng = formatCoordinate(form.location_lng, 'lng');
    if (!location_lat || !location_lng) {
      setError('Enter valid coordinates or use GPS (latitude -90 to 90, longitude -180 to 180).');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await authApi.register({
        ...form,
        role: 'donor',
        age: parseInt(form.age, 10),
        location_lat: parseFloat(location_lat),
        location_lng: parseFloat(location_lng),
      });
      login(data.token, data.user);
      navigate('/donor-dashboard');
    } catch (err) {
      setError(getApiError(err, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto card">
        <h2 className="text-2xl font-bold text-center mb-2">Donor Registration</h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          Step {step} of 2 — {step === 1 ? 'Phone OTP Verification' : 'Profile Details'}
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
              Phone +91{form.phone} verified. Complete your profile within 30 minutes.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
            </div>
            <div>
              <label className="label">Aadhaar Number (12 digits)</label>
              <input className="input-field" value={form.aadhar} onChange={(e) => setForm({ ...form, aadhar: e.target.value.replace(/\D/g, '').slice(0, 12) })} pattern="\d{12}" required />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Blood Group</label>
                <select className="input-field" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Age</label>
                <input type="number" min="18" className="input-field" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} required />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input-field" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
            <LocationFields
              lat={form.location_lat}
              lng={form.location_lng}
              onChange={(location_lat, location_lng) => setForm({ ...form, location_lat, location_lng })}
              onError={setError}
              onSuccess={setSuccess}
            />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} />
              Available to donate now
            </label>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium">Login</Link>
        </p>
      </div>
    </Layout>
  );
};

export default Register;
