import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { requestApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { statusBadge } from '../utils/constants';

const ActiveRequest = () => {
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchActive = async () => {
    try {
      const { data } = await requestApi.active();
      setRequest(data.request);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 8000);
    return () => clearInterval(interval);
  }, []);

  const completeRequest = async () => {
    if (!request) return;
    try {
      await requestApi.complete(request.id);
      setMessage('Donation marked as completed. Thank you!');
      fetchActive();
    } catch (err) {
      setMessage(getApiError(err, 'Failed to complete request.'));
    }
  };

  const mapsUrl =
    request?.maps_url ||
    (request?.location_lat && request?.location_lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${request.location_lat},${request.location_lng}`
      : null);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Active Request</h1>
      {message && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">{message}</div>}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : !request ? (
        <div className="card text-center py-12 max-w-lg mx-auto">
          <p className="text-gray-500 text-lg">No active request found.</p>
          <p className="text-sm text-gray-400 mt-2">
            {user.role === 'patient'
              ? 'Create a blood request from your dashboard.'
              : 'Accept a nearby request from your donor dashboard.'}
          </p>
        </div>
      ) : (
        <div className="card max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">{request.blood_group}</h2>
            <span className={`text-sm px-3 py-1 rounded-full ${statusBadge(request.status)}`}>
              {request.status}
            </span>
          </div>

          <dl className="space-y-3 text-sm mb-6">
            <div className="flex justify-between border-b pb-2">
              <dt className="text-gray-500">Units</dt>
              <dd className="font-medium">{request.units}</dd>
            </div>
            <div className="flex justify-between border-b pb-2">
              <dt className="text-gray-500">Urgency</dt>
              <dd className={`font-medium ${request.urgency === 'emergency' ? 'text-red-600' : ''}`}>
                {request.urgency}
              </dd>
            </div>

            {user.role === 'patient' && request.donor_name && (
              <>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Assigned Donor</dt>
                  <dd className="font-medium">{request.donor_name}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Donor Phone</dt>
                  <dd>{request.donor_phone}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Donor Blood Group</dt>
                  <dd>{request.donor_blood_group}</dd>
                </div>
              </>
            )}

            {user.role === 'donor' && (
              <>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Patient</dt>
                  <dd className="font-medium">{request.patient_name}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Patient Phone</dt>
                  <dd>{request.patient_phone}</dd>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <dt className="text-gray-500">Location</dt>
                  <dd className="text-right text-xs">
                    {parseFloat(request.location_lat).toFixed(5)}, {parseFloat(request.location_lng).toFixed(5)}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {user.role === 'donor' && mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full block text-center mb-4"
            >
              Open in Google Maps →
            </a>
          )}

          {['accepted', 'in_progress'].includes(request.status) && (
            <button onClick={completeRequest} className="btn-outline w-full border-green-600 text-green-700 hover:bg-green-50">
              Mark Donation as Completed
            </button>
          )}

          {request.status === 'in_progress' && user.role === 'patient' && (
            <p className="text-center text-blue-700 bg-blue-50 p-3 rounded-lg text-sm mt-4">
              Your donor is on the way to your location.
            </p>
          )}

          {request.status === 'pending' && user.role === 'patient' && (
            <p className="text-center text-yellow-700 bg-yellow-50 p-3 rounded-lg text-sm mt-4">
              Waiting for a nearby donor to accept your request...
            </p>
          )}
        </div>
      )}
    </Layout>
  );
};

export default ActiveRequest;
