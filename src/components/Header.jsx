import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ agent }) {
  return (
    <header className="app-header">
      <div className="container header-content">
        <Link to="/" className="logo-link"><h1>Real Estate Catalog</h1></Link>
        {agent && (
          <div className="agent-info">
            {agent.profilePicture && (
              <img 
                src={agent.profilePicture} 
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
      </div>
    </header>
  );
}

export default Header;