import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage({ agents }) {
  if (!agents || Object.keys(agents).length === 0) {
    return <p>No agents available at the moment.</p>;
  }

  return (
    <div className="homepage">
      <h2>Select an Agent</h2>
      <ul className="agent-list">
        {Object.values(agents).map(agent => (
          <li key={agent.id} className="agent-list-item">
            <Link to={`/agent/${agent.id}`}>
              <img 
                src={agent.profilePicture} 
                alt={agent.name} 
                className="agent-thumbnail"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display='block';}} // Hide img, show placeholder
              />
              <div className="agent-thumbnail-placeholder" style={{display: 'none'}}>No Img</div>
              <span>{agent.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;