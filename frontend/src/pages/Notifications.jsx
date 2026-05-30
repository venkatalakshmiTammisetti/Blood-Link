import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { notificationApi } from '../api/endpoints';
import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationApi.list(user.id);
      setNotifications(data.notifications || []);
      await notificationApi.markRead(user.id);
    } catch (err) {
      setError(getApiError(err, 'Failed to load notifications.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user.id]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="card max-w-2xl mx-auto">
        {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li key={n.id} className={`py-4 ${!n.is_read ? 'bg-primary-light/30 -mx-2 px-2 rounded' : ''}`}>
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                  {!n.is_read && <span className="ml-2 text-primary font-medium">New</span>}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default Notifications;
