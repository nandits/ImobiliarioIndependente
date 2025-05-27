import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary

function ProtectedRoute({ children }) {
  const { currentUser, userProfile, loading } = useAuth(); // Get loading state from AuthContext
  const location = useLocation();

  if (loading) {
    // console.log("ProtectedRoute: AuthContext is loading. Path:", location.pathname);
    return <div className="container"><p>Loading user information...</p></div>;
  }

  if (!currentUser) {
    // User not logged in, redirect to login page, passing the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // After authentication, userProfile should ideally be loaded.
  // If userProfile is null, it means their Firestore document might be missing.
  // For subscription checks, we need the userProfile.
  // userProfile can be:
  // undefined: AuthContext has not yet completed the initial fetch attempt for this currentUser
  // null: AuthContext completed fetch, but no profile was found (or an error occurred during fetch)
  // object: Profile was found

  if (userProfile === undefined && currentUser) {
    // This case implies authLoading became false, but userProfile is still in its initial 'undefined' state.
    // This *shouldn't* happen if AuthContext correctly awaits fetchUserProfileData before setting authLoading=false.
    // However, as a safeguard, we can treat this as still loading the profile to prevent premature navigation.
    console.warn("ProtectedRoute: userProfile is undefined, but authLoading is false. This might indicate a timing issue in AuthContext. Treating as loading. Path:", location.pathname);
    return <div className="container"><p>Verifying profile information...</p></div>;
  }

  if (userProfile === null && currentUser) { // Profile fetch complete, but no profile found
    // If they are trying to access their profile page, let AgentProfilePage handle profile creation.
    if (location.pathname === '/my-profile') {
      // console.log("ProtectedRoute: User on /my-profile and profile is null. Rendering children (AgentProfilePage).");
      return children;
    }
    // For other protected routes, if profile doesn't exist, they can't be subscribed.
    // Redirect them to /my-profile to complete it.
    console.warn("ProtectedRoute: User authenticated but no Firestore profile found. Redirecting to /my-profile. Path:", location.pathname);
    // Prevent loop if already trying to go to /my-profile from a different route that also uses ProtectedRoute
    if (location.pathname !== '/my-profile') {
      return <Navigate to="/my-profile" state={{ from: location, message: "Please complete your profile." }} replace />;
    }
    // If already on /my-profile and profile is null, AgentProfilePage should handle it.
    // This return children might be hit if something tries to navigate away from /my-profile while profile is still null.
    return children;
  }

  // Check for active subscription
  if (userProfile && userProfile.subscriptionActive !== true) { // Ensure userProfile exists before checking subscriptionActive
    // User is logged in but not subscribed, redirect to an unauthorized page or a subscription page
    console.warn(`ProtectedRoute: User ${currentUser.uid} does not have an active subscription. Redirecting.`);
    return <Navigate to="/unauthorized" state={{ from: location, message: "Active subscription required." }} replace />;
  }

  // User is logged in, render the requested component
  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;