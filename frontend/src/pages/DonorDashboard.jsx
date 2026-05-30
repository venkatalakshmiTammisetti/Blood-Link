import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { userApi, requestApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { statusBadge } from '../utils/constants';
import { isAvailable, isPhoneVerified } from '../utils/user';

const DonorDashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchData = async () => {
    try {
      const [profileRes, nearbyRes] = await Promise.all([
        userApi.getById(user.id),
        requestApi.nearby(),
      ]);
      setFetchError('');
      setProfile(profileRes.data.user);
      setRequests(nearbyRes.data.requests || []);
    } catch (err) {
      console.error(err);
      setFetchError(getApiError(err, 'Failed to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [user.id]);

  const toggleAvailability = async () => {
    try {
      const newVal = !isAvailable(profile);
      const { data } = await userApi.update(user.id, { is_available: newVal });
      setProfile(data.user);
      updateUser({ ...user, is_available: newVal });
      setMessage(newVal ? 'You are now available for donations.' : 'You are now unavailable.');
    } catch (err) {
      setMessage(getApiError(err, 'Failed to update availability.'));
    }
  };

  const acceptRequest = async (id) => {
    try {
      await requestApi.accept(id);
      setMessage('Request accepted! Check Active Request for patient location.');
      navigate('/active-request');
    } catch (err) {
      setMessage(getApiError(err, 'Failed to accept request.'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Donor Dashboard</h1>
      {message && <div className="bg-primary-light text-primary-dark p-3 rounded-lg mb-4 text-sm">{message}</div>}
      {fetchError && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{fetchError}</div>}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="font-bold text-lg mb-4">My Profile</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{profile?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Blood Group</dt><dd className="font-medium text-primary">{profile?.blood_group}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Age</dt><dd>{profile?.age}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Phone</dt><dd>{profile?.phone}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Verified</dt><dd>{isPhoneVerified(profile) ? '✅ Yes' : '❌ No'}</dd></div>
          </dl>
          <button onClick={toggleAvailability} className={`mt-4 w-full py-2 rounded-lg font-semibold ${isAvailable(profile) ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}>
            {isAvailable(profile) ? 'Available — Click to go Offline' : 'Unavailable — Click to go Online'}
          </button>
        </div>

        <div className="card bg-primary-light border-primary/20">
          <h2 className="font-bold text-lg mb-2">Quick Actions</h2>
          <p className="text-sm text-gray-600 mb-4">Accept a nearby request, then navigate to the patient.</p>
          <button onClick={() => navigate('/active-request')} className="btn-primary w-full mb-2">
            View Active Request
          </button>
          <button onClick={() => navigate('/notifications')} className="btn-outline w-full">
            Notifications
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-4">Nearby Blood Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending requests nearby. Stay available!</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="border border-gray-100 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-primary">{req.blood_group}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${req.urgency === 'emergency' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {req.urgency}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(req.status)}`}>{req.status}</span>
                  </div>
                  <p className="text-sm text-gray-600">{req.units} unit(s) · {req.distance_km} km away</p>
                  <p className="text-sm text-gray-500">Patient: {req.patient_name}</p>
                </div>
                <button onClick={() => acceptRequest(req.id)} className="btn-primary shrink-0">
                  Accept Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DonorDashboard;
