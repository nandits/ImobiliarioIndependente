import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

// eslint-disable-next-line react/prop-types
function Header({ agent }) {

  const { currentUser, logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="app-header">
      <div className="container header-content">
        <Link to="/" className="logo-title-link">
          <img src={`${import.meta.env.BASE_URL}ACImob1_NBG.png`} alt="AC Soluções Logo" className="header-logo-img"/>
          <h1>Catálogo de Imobiliário</h1>
        </Link>
        {/* Display current viewing agent's info (if on their page) */}
        {agent && (
          <div className="agent-info">
            {agent.profilePicture && (
              <img 
                src={`${import.meta.env.BASE_URL}${agent.profilePicture}`}
                alt={agent.name} 
                className="agent-avatar" 
                onError={(e) => { e.target.style.display = 'none'; /* Optionally hide if image fails to load */ }} 
              />
            )}
            <div>
              <h2>{agent.name}</h2>
              {agent.profileInfo && (
                <p>
                  {agent.profileInfo.email}{agent.profileInfo.phone && agent.profileInfo.email ? ' | ' : ''}{agent.profileInfo.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login/Logout and Logged-in User Info */}
        <div className="user-auth-section">
          {currentUser && userProfile ? ( // Check for userProfile too
            <div className="logged-in-user">
              <span className="user-email">{userProfile.displayName || currentUser.email}</span>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-button">Login</Link>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;