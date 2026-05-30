import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';
import { AUTH_LOGOUT_EVENT } from '../utils/authEvents';
import { clearShownNotifications } from '../utils/notificationToast';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    clearShownNotifications();
    setUser(null);
  }, []);

  useEffect(() => {
    const onLogout = () => clearSession();
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
  }, [clearSession]);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } catch {
        clearSession();
      }
      setLoading(false);
    };
    init();
  }, [clearSession]);

  const login = useCallback((token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    clearShownNotifications();
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  /** Context user is authoritative; localStorage fallback only during the same tick as login() */
  const resolveUser = useCallback(() => user ?? readStoredUser(), [user]);

  const hasToken = !!localStorage.getItem('token');
  const isAuthenticated = !loading && hasToken && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
        resolveUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
