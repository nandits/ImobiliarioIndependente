import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';


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
          <img src={`https://res.cloudinary.com/dynnpabnw/image/upload/v1748059246/ACImob1_NBG_bb8m36.png`} alt="AC Soluções Logo" className="header-logo-img"/>
          <h1>Catálogo de Imobiliário</h1>
        </Link>
        {/* Display current viewing agent's info (if on their page) */}
        {agent && (
          <div className="agent-info">
            {agent.profilePicture && (
              <img 
                src={agent.profilePicture}
                alt={agent.displayName} 
                className="agent-avatar" 
                onError={(e) => { e.target.style.display = 'none';}} 
              />
            )}
            <div>
              <h2>{agent.displayName}</h2>
              {(agent.phone || agent.email) && (
                <p>
                  {agent.phone && <span>{agent.phone}</span>}
                  {agent.phone && agent.email && <span> | </span>}
                  {agent.email && <span>{agent.email}</span>}              
                </p>
              )}
            </div>
          </div>
        )}
      <div className="user-auth-section">
          {currentUser && userProfile ? ( // Check for userProfile too
            <div className="logged-in-user-details">
              <Link to="/my-profile" className="header-logout-link-button">Meu Perfil</Link>
              <Link to={`/agent/${currentUser.uid}`} className="header-logout-link-button" >Minha Pagina</Link>
              <Link to="/my-profile/my-listings" className="header-logout-link-button" >Gerir Minhas Listagens</Link>
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