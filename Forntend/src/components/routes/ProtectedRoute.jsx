import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FullPageLoader } from '../common/LoadingSpinner';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader text="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    // Determine appropriate portal login redirect
    let redirectPath = '/login/member';
    if (location.pathname.startsWith('/admin')) {
      redirectPath = '/login/admin';
    } else if (location.pathname.startsWith('/manager')) {
      redirectPath = '/login/manager';
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

