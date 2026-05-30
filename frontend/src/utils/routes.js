export const dashboardForRole = (role) => {
  if (role === 'donor') return '/donor-dashboard';
  if (role === 'patient') return '/patient-dashboard';
  if (role === 'admin') return '/admin-dashboard';
  return '/login';
};
