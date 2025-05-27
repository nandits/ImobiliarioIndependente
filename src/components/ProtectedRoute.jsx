import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary

function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth(); // Get loading state from AuthContext
  const location = useLocation();

  if (loading) {
    // Optional: Show a loading indicator while auth state is being determined
    return <div className="container"><p>Loading user information...</p></div>;
  }

  if (!currentUser) {
    // User not logged in, redirect to login page, passing the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // After authentication, userProfile should ideally be loaded.
  // If userProfile is null, it means their Firestore document might be missing.
  // For subscription checks, we need the userProfile.
  if (!userProfile) {
    if (location.pathname !== '/my-profile') {
      console.warn("ProtectedRoute: User authenticated but userProfile is missing. Redirecting to /my-profile or /unauthorized.");
    }
    return <Navigate to="/my-profile" state={{ from: location, message: "Please complete your profile." }} replace />;
  }

  // Check for active subscription
  if (userProfile.subscriptionActive !== true) {
    // User is logged in but not subscribed, redirect to an unauthorized page or a subscription page
    console.warn(`ProtectedRoute: User ${currentUser.uid} does not have an active subscription. Redirecting.`);
    return <Navigate to="/unauthorized" state={{ from: location, message: "Active subscription required." }} replace />;
  }

  // User is logged in, render the requested component
  return children;
}

export default ProtectedRoute;