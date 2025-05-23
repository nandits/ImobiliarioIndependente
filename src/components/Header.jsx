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
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
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
      <div className="user-auth-section">
          {currentUser && userProfile ? ( // Check for userProfile too
            <div className="logged-in-user-details">
              <button onClick={handleLogout} className="header-logout-link-button">{userProfile.displayName || currentUser.email}{" >> "}Logout</button>
            </div>          
            ) : (
            <Link to="/login" className="header-login-link">Login</Link>
          )}
      </div>
      </div>
    </header>
  );
}

export default Header;