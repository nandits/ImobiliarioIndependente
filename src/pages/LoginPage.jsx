import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as necessary
import './LoginPage.css'; // Create this CSS file for styling


function LoginPage() { 
  const { loginWithGoogle, currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/'; // Default redirect for owner

  useEffect(() => {
    // Redirect based on userProfile after login
    if (currentUser && userProfile) { 
      if (userProfile.role === 'owner') {
        navigate(from === '/login' ? '/' : from, { replace: true });
      } else if (userProfile.role === 'agent' && userProfile.agentAppId) {
        navigate(`/agent/${userProfile.agentAppId}`, { replace: true });
      } else {
        // Logged in but not owner or recognized agent with agentAppId
        console.warn("Logged in user has no recognized role or agentAppId:", userProfile);
        // Potentially redirect to an "unauthorized" or "pending approval" page, or logout
        navigate('/unauthorized', { replace: true }); 
      }
    } else if (currentUser && !userProfile) { 
      // User is authenticated with Firebase, but no profile in our DB (not registered in our system)
      console.log("User authenticated but not registered in the system. Redirecting to unauthorized.");
      navigate('/NewUserForm', { replace: true }); // Or a "please register" page
    }
  }, [currentUser, userProfile, navigate, from, location.state]);

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
          <img src={`${import.meta.env.BASE_URL}google-logo.svg`} alt="Google sign-in" />
          Sign in with Google
        </button>
        <p className="login-note">Only registered agents and site owner can log in.</p>
      </div>
    </div>
  );
}

export default LoginPage;