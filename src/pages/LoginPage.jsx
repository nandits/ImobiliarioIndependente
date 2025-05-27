import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary
import './LoginPage.css'; // Create this CSS file for styling


function LoginPage() { 
  const { loginWithGoogle, currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  // Memoize 'from' to stabilize it as a dependency.
  // It will only recompute if location.state.from.pathname actually changes.
  const from = useMemo(() => {
    // console.log("LoginPage: Recalculating 'from'. location.state:", location.state);
    return location.state?.from?.pathname || '/';
  }, [location.state?.from?.pathname]);
  
  useEffect(() => {
    
    // Only attempt redirection if AuthContext is no longer loading
    if (loading) {
      return; // Wait for auth and profile to be processed
    }
    
    // Redirect based on userProfile after login
    if (currentUser && userProfile) {
      if (userProfile.role === 'owner') {
        navigate(from === '/login' ? '/' : from, { replace: true });
      } else if (userProfile.role === 'agent' && userProfile.userAppID) {
        navigate(`/agent/${userProfile.userAppID}`, { replace: true });
      } else {
        // Logged in but not owner or recognized agent with agentAppId
        console.warn("LoginPage: User has profile but unrecognized role/userAppID. Navigating to /unauthorized. Profile:", userProfile);
        navigate('/unauthorized', { replace: true }); 
      }
    } else if (currentUser && userProfile === null) { // Check for explicitly null, meaning fetch completed but no profile
      // User is authenticated with Firebase, but no profile in our DB (not registered in our system)
      console.log("User authenticated but not registered in the system. Redirecting to unauthorized.");
      // Only navigate if not already on /my-profile to prevent loops if /my-profile itself has issues.
      if (location.pathname !== '/my-profile') {
        navigate('/my-profile', { replace: true });
      }    }
  }, [currentUser, userProfile, loading, navigate, from, location.pathname]);

  const handleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      // Redirection is handled by the useEffect hook above
    } catch (err) {
      console.error("Login failed:", err);
      setError('Failed to log in. Please try again.');
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-box">
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleLogin} className="google-login-button">
          <img src={"https://res.cloudinary.com/dynnpabnw/image/upload/v1748059246/google-logo_v32mr7.svg"} alt="Google sign-in" />
          Sign in with Google
        </button>
        <p className="login-note">Only registered agents and site owner can log in.</p>
      </div>
    </div>
  );
}

export default LoginPage;