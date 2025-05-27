import React from 'react';
import './HouseListPane.css';

function HouseListPane({ houses, onHouseSelect, selectedHouseId }) {
  if (!houses || houses.length === 0) {
    return <aside className="house-list-pane"><p>No houses listed for this agent.</p></aside>;
  }

  return (
    <aside className="house-list-pane">
      <h3>Available Houses</h3>
      <ul>
        {houses.map(house => (
          <li 
            key={house.id} 
            onClick={() => onHouseSelect(house)}
            className={house.id === selectedHouseId ? 'selected' : ''}
          >
            <img src={house.images[0].picUrl} alt={house.name} className="house-thumbnail" onError={(e) => e.target.src = '/placeholder-house.png'} />
            <div className="house-list-info">
              <h4>{house.name}</h4>
              <p>{house.price}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default HouseListPane;