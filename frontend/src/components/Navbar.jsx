import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'donor'
      ? '/donor-dashboard'
      : user?.role === 'patient'
        ? '/patient-dashboard'
        : '/admin-dashboard';

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <span>🩸</span> Blood-Link
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="text-gray-600 hover:text-primary">
                Dashboard
              </Link>
              <Link to="/notifications" className="text-gray-600 hover:text-primary">
                Notifications
              </Link>
              {(user?.role === 'donor' || user?.role === 'patient') && (
                <Link to="/active-request" className="text-gray-600 hover:text-primary">
                  Active Request
                </Link>
              )}
              <span className="text-gray-500 hidden sm:inline">Hi, {user?.name}</span>
              <button onClick={handleLogout} className="btn-outline py-1.5 px-3 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-primary">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-1.5 px-3 text-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
