const express = require('express');
const pool = require('../db/connection');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const [[{ donor_count }]] = await pool.execute(
      "SELECT COUNT(*) AS donor_count FROM users WHERE role = 'donor'"
    );
    const [[{ patient_count }]] = await pool.execute(
      "SELECT COUNT(*) AS patient_count FROM users WHERE role = 'patient'"
    );
    const [[{ pending_requests }]] = await pool.execute(
      "SELECT COUNT(*) AS pending_requests FROM blood_requests WHERE status = 'pending'"
    );
    const [[{ completed_requests }]] = await pool.execute(
      "SELECT COUNT(*) AS completed_requests FROM blood_requests WHERE status = 'completed'"
    );

    res.json({
      success: true,
      stats: { donor_count, patient_count, pending_requests, completed_requests },
    });
  } catch (error) {
    console.error('admin stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

router.get('/requests', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const [requests] = await pool.execute(
      `SELECT br.*, p.name AS patient_name, d.name AS donor_name
       FROM blood_requests br
       JOIN users p ON br.patient_id = p.id
       LEFT JOIN users d ON br.donor_id = d.id
       ORDER BY br.created_at DESC LIMIT 100`
    );
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests.' });
  }
});

module.exports = router;
