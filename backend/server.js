const http = require('http');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set in environment variables.');
  process.exit(1);
}

const pool = require('./db/connection');
const { initSocket } = require('./utils/socket');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.testConnection();
    res.json({ success: true, message: 'Blood-Link API is running.', database: 'connected' });
  } catch (err) {
    res.status(503).json({ success: false, message: 'API running but database unavailable.', database: 'disconnected' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/request', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const start = async () => {
  try {
    await pool.testConnection();
    console.log('MySQL database connected.');
  } catch (err) {
    console.error('FATAL: Cannot connect to MySQL.', err.message);
    process.exit(1);
  }

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Blood-Link API running on http://localhost:${PORT}`);
    console.log(`Socket.io enabled on path /socket.io`);
    console.log('OTP delivery: mock (console + mockOtp in dev API responses)');
  });
};

start();
