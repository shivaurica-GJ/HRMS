import { Navigate, useLocation } from 'react-router-dom';
import { isTokenExpired } from '../utils/auth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // If no token exists or token is expired, redirect to login
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role doesn't match allowed roles, redirect to appropriate dashboard
  if (!allowedRoles.includes(role)) {
    return <Navigate to={
      role === 'admin' ? '/admin/dashboard' : 
      role === 'hr' ? '/hr/dashboard' : 
      '/employee/dashboard'
    } replace />;
  }

  return children;
};

export default ProtectedRoute;
