import { toast } from 'react-toastify';
import { notificationApi } from '../api/endpoints';

const SHOWN_KEY = 'bl-shown-notifs';

const getShownIds = () => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SHOWN_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const markShown = (id) => {
  const shown = getShownIds();
  shown.add(id);
  sessionStorage.setItem(SHOWN_KEY, JSON.stringify([...shown]));
};

export const clearShownNotifications = () => {
  sessionStorage.removeItem(SHOWN_KEY);
};

export const showNotificationToast = (notification) => {
  if (!notification?.message || !notification?.id) return;
  const shown = getShownIds();
  if (shown.has(notification.id)) return;
  toast.info(notification.message, { toastId: `notif-${notification.id}` });
  markShown(notification.id);
};

export const fetchAndToastUnreadNotifications = async (userId) => {
  if (!userId) return;
  try {
    const { data } = await notificationApi.list(userId);
    const unread = (data.notifications || []).filter((n) => !n.is_read);
    unread.forEach(showNotificationToast);
  } catch {
    // Non-blocking — login and navigation must not fail
  }
};
