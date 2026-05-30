const express = require('express');
const { getUser, updateUser } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/:id', authenticate, getUser);
router.put('/:id', authenticate, updateUser);

module.exports = router;
