import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!accessToken) {
    // Redirect to login but save current location context
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If user's role is not in the allowed roles list, redirect to root dashboard
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
