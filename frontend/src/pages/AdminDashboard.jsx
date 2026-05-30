import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { adminApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { statusBadge } from '../utils/constants';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, reqRes] = await Promise.all([adminApi.stats(), adminApi.requests()]);
        setStats(statsRes.data.stats);
        setRequests(reqRes.data.requests || []);
      } catch (err) {
        setError(getApiError(err, 'Failed to load admin data.'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Donors', value: stats?.donor_count },
          { label: 'Patients', value: stats?.patient_count },
          { label: 'Pending', value: stats?.pending_requests },
          { label: 'Completed', value: stats?.completed_requests },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className="text-3xl font-bold text-primary">{s.value ?? 0}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-bold text-lg mb-4">All Blood Requests</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Patient</th>
              <th className="pb-2 pr-4">Group</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Donor</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-gray-50">
                <td className="py-2 pr-4">#{r.id}</td>
                <td className="py-2 pr-4">{r.patient_name}</td>
                <td className="py-2 pr-4 font-medium text-primary">{r.blood_group}</td>
                <td className="py-2 pr-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(r.status)}`}>{r.status}</span>
                </td>
                <td className="py-2">{r.donor_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
