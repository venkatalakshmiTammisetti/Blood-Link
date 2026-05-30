import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { authApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { dashboardForRole } from '../utils/routes';

const Login = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', phone: '', password: '', usePhone: false });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.role) {
      navigate(dashboardForRole(user.role), { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = form.usePhone
        ? { phone: form.phone.replace(/\D/g, '').slice(-10), password: form.password }
        : { email: form.email.toLowerCase().trim(), password: form.password };
      const { data } = await authApi.login(payload);
      login(data.token, data.user);
      navigate(dashboardForRole(data.user.role), { replace: true });
    } catch (err) {
      setError(getApiError(err, 'Login failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto card">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.usePhone}
              onChange={(e) => setForm({ ...form, usePhone: e.target.checked })}
            />
            Login with phone instead of email
          </label>

          {form.usePhone ? (
            <div>
              <label className="label">Phone (10 digits)</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                pattern="\d{10}"
                required
              />
            </div>
          ) : (
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          No account?{' '}
          <Link to="/register" className="text-primary font-medium">
            Register as Donor
          </Link>{' '}
          or{' '}
          <Link to="/register-patient" className="text-primary font-medium">
            Patient
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
