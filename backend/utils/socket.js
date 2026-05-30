const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const { formatNotification } = require('./helpers');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || true,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: Number(decoded.id),
        role: decoded.role,
      };
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.id}`);
    socket.emit('connected', { userId: socket.user.id });
  });

  return io;
};

const getIo = () => io;

const emitNotificationToUser = (userId, notification) => {
  if (!io) return;
  const payload = formatNotification(notification);
  io.to(`user:${userId}`).emit('notification', payload);
};

module.exports = { initSocket, getIo, emitNotificationToUser };
