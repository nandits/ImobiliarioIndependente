import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary

function OwnerProtectedRoute({ children }) {
  const { currentUser, userProfile } = useAuth(); // Get userProfile from context
  
  console.log("[OwnerProtectedRoute] Rendering. currentUser:", currentUser ? { uid: currentUser.uid, email: currentUser.email } : null);
  console.log("[OwnerProtectedRoute] userProfile:", userProfile);
  console.log("[OwnerProtectedRoute] userProfile.role:", userProfile ? userProfile.role : "userProfile is null");


  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userProfile || userProfile.role !== 'owner') {
    return <Navigate to="/unauthorized" replace />; // Or some other appropriate page
  }

  return children;
}

export default OwnerProtectedRoute;