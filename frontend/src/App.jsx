import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import PatientRegister from './pages/PatientRegister';
import DonorDashboard from './pages/DonorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import Notifications from './pages/Notifications';
import ActiveRequest from './pages/ActiveRequest';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';
import { dashboardForRole } from './utils/routes';

const HomeRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Landing />;
  return <Navigate to={dashboardForRole(user.role)} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register-patient" element={<PatientRegister />} />

      <Route
        path="/donor-dashboard"
        element={
          <ProtectedRoute roles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute roles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/active-request"
        element={
          <ProtectedRoute roles={['donor', 'patient']}>
            <ActiveRequest />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
