import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { requestApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { BLOOD_GROUPS, formatCoordinate, statusBadge } from '../utils/constants';
import LocationFields from '../components/LocationFields';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    blood_group: 'O+',
    units: 1,
    urgency: 'normal',
    location_lat: '',
    location_lng: '',
  });

  const fetchRequests = async () => {
    try {
      const { data } = await requestApi.mine();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const location_lat = formatCoordinate(form.location_lat, 'lat');
    const location_lng = formatCoordinate(form.location_lng, 'lng');
    if (!location_lat || !location_lng) {
      setMessage('Enter valid coordinates or use GPS.');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const { data } = await requestApi.create({
        ...form,
        units: parseInt(form.units, 10),
        location_lat: parseFloat(location_lat),
        location_lng: parseFloat(location_lng),
      });
      setMessage(data.message);
      fetchRequests();
      navigate('/active-request');
    } catch (err) {
      setMessage(getApiError(err, 'Failed to create request.'));
      if (err.response?.data?.requestId) {
        navigate('/active-request');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const activeRequest = requests.find((r) =>
    ['pending', 'accepted', 'in_progress'].includes(r.status)
  );

  const handleCancel = async () => {
    if (!activeRequest || activeRequest.status !== 'pending') return;
    setCancelling(true);
    setMessage('');
    try {
      const { data } = await requestApi.cancel(activeRequest.id);
      setMessage(data.message);
      await fetchRequests();
    } catch (err) {
      setMessage(getApiError(err, 'Failed to cancel request.'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Patient Dashboard</h1>
      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('Failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-lg mb-4">Create Blood Request</h2>
          {activeRequest ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-gray-600 mb-4">You have an active request.</p>
              <button onClick={() => navigate('/active-request')} className="btn-primary w-full">
                View Active Request
              </button>
              {activeRequest.status === 'pending' && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline w-full border-red-300 text-red-700 hover:bg-red-50"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Request'}
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">Blood Group</label>
                <select className="input-field" value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })}>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Units</label>
                  <input type="number" min="1" max="10" className="input-field" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} />
                </div>
                <div>
                  <label className="label">Urgency</label>
                  <select className="input-field" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                    <option value="normal">Normal</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <LocationFields
                lat={form.location_lat}
                lng={form.location_lng}
                onChange={(location_lat, location_lng) => setForm({ ...form, location_lat, location_lng })}
                onError={setMessage}
                onSuccess={() => setMessage('Location captured successfully.')}
              />
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Request'}
              </button>
            </form>
          )}
        </div>

        <div className="card">
          <h2 className="font-bold text-lg mb-4">Request History</h2>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-gray-500">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="border rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary">{req.blood_group}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(req.status)}`}>{req.status}</span>
                  </div>
                  <p>{req.units} unit(s) · {req.urgency}</p>
                  {req.donor_name && <p className="text-green-700 mt-1">Donor: {req.donor_name} ({req.donor_phone})</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
