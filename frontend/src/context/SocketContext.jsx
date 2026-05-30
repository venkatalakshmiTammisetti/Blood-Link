import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import {
  fetchAndToastUnreadNotifications,
  showNotificationToast,
} from '../utils/notificationToast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, loading } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  // Show unread DB notifications after login / session restore (covers offline completion)
  useEffect(() => {
    if (loading || !user?.id || !localStorage.getItem('token')) return undefined;
    fetchAndToastUnreadNotifications(user.id);
    return undefined;
  }, [user?.id, loading]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (loading || !token || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setConnected(false);
      return undefined;
    }

    const socket = io({
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('notification', (notification) => {
      showNotificationToast(notification);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user?.id, loading]);

  return (
    <SocketContext.Provider value={{ connected, socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
