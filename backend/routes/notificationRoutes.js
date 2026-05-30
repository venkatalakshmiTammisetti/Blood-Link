const express = require('express');
const {
  getNotifications,
  markNotificationsRead,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/:userId', authenticate, getNotifications);
router.put('/:userId/read', authenticate, markNotificationsRead);

module.exports = router;
