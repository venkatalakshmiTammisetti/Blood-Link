const express = require('express');
const {
  createRequest,
  getNearbyRequests,
  getMyRequests,
  getActiveRequest,
  acceptRequest,
  cancelRequest,
  completeRequest,
} = require('../controllers/requestController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/create', authenticate, createRequest);
router.get('/nearby', authenticate, getNearbyRequests);
router.get('/mine', authenticate, getMyRequests);
router.get('/active', authenticate, getActiveRequest);
router.put('/accept/:id', authenticate, acceptRequest);
router.put('/cancel/:id', authenticate, cancelRequest);
router.put('/complete/:id', authenticate, completeRequest);

module.exports = router;
