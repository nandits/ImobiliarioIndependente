import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import HouseListPane from '../components/HouseListPane';
import HouseViewer from '../components/HouseViewer';
import './AgentDetailPage.css';

function AgentDetailPage({ agentsData, setSelectedAgentInApp }) {
  const { agentId, '*': housePath } = useParams(); // '*' captures the rest of the path for houseId
  const navigate = useNavigate();
  const location = useLocation();

  const [agent, setAgent] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);

  // Determine initial houseId from path or default to first house
  const getHouseIdFromPath = (path) => {
    if (path && path.startsWith('house/')) {
      return path.substring('house/'.length);
    }
    return null;
  };

  useEffect(() => {
    const currentAgent = agentsData[agentId];
    if (currentAgent) {
      setAgent(currentAgent);
      setSelectedAgentInApp(currentAgent); // Update header in App.jsx

      const initialHouseId = getHouseIdFromPath(housePath);
      
      if (initialHouseId && currentAgent.houses[initialHouseId]) {
        setSelectedHouse(currentAgent.houses[initialHouseId]);
      } else if (Object.keys(currentAgent.houses).length > 0) {
        // Default to first house if no specific house in URL or invalid houseId
        const firstHouseId = Object.keys(currentAgent.houses)[0];
        setSelectedHouse(currentAgent.houses[firstHouseId]);
        if (!initialHouseId) { // If not a direct house link, update URL to show first house
            navigate(`/agent/${agentId}/house/${firstHouseId}`, { replace: true });
        }
      } else {
        setSelectedHouse(null); // No houses for this agent
      }
    } else {
      navigate('/'); // Agent not found, redirect to home
    }

    // Cleanup function to clear selected agent when component unmounts or agentId changes
    return () => setSelectedAgentInApp(null);
  }, [agentId, housePath, agentsData, navigate, setSelectedAgentInApp]);

  const handleHouseSelect = (house) => {
    setSelectedHouse(house);
    navigate(`/agent/${agentId}/house/${house.id}`); // Update URL on house selection
    // Optionally, keep the list visible or hide it based on preference
    // setIsHouseListVisible(false); 
  };

  if (!agent) {
    return <p>Loading agent details...</p>;
  }

  return (
    <div className="agent-detail-page">
      <div className="content-area">
          <HouseListPane
            houses={Object.values(agent.houses)}
            onHouseSelect={handleHouseSelect}
            selectedHouseId={selectedHouse?.id}
          />
        <div className="house-viewer-container">
          {selectedHouse ? <HouseViewer house={selectedHouse} /> : <p>Select a house to view details or no houses available.</p>}
        </div>
      </div>
    </div>
  );
}

export default AgentDetailPage;