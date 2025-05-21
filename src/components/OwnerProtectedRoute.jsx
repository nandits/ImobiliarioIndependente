import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary

function OwnerProtectedRoute({ children }) {
  const { currentUser, userProfile } = useAuth(); // Get userProfile from context
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (currentUser.email !== userProfile.role !== 'owner') {
    return <Navigate to="/unauthorized" replace />; // Or some other appropriate page
  }

  return children;
}

export default OwnerProtectedRoute;