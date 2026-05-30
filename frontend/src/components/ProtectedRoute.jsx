import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardForRole } from '../utils/routes';

const ProtectedRoute = ({ children, roles }) => {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={dashboardForRole(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
