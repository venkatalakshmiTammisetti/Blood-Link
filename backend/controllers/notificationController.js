const notificationModel = require('../models/notificationModel');
const { formatNotification } = require('../utils/helpers');
const { emitNotificationToUser } = require('../utils/socket');

const createNotification = async (userId, message, relatedRequestId = null) => {
  const row = await notificationModel.create(userId, message, relatedRequestId);
  emitNotificationToUser(userId, row);
  return row;
};

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseInt(userId, 10);

    if (req.user.role !== 'admin' && Number(req.user.id) !== uid) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const notifications = (await notificationModel.findByUser(uid)).map(formatNotification);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const uid = parseInt(userId, 10);

    if (Number(req.user.id) !== uid && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    await notificationModel.markAllRead(uid);
    res.json({ success: true, message: 'Notifications marked as read.' });
  } catch (error) {
    console.error('markNotificationsRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications.' });
  }
};

module.exports = { createNotification, getNotifications, markNotificationsRead };
