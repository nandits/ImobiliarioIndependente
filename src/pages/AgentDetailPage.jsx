import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import HouseListPane from '../components/HouseListPane';
import HouseViewer from '../components/HouseViewer';
import './AgentDetailPage.css';
import { db } from '../firebaseConfig'; // Import Firestore instance
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

function AgentDetailPage({ setSelectedAgentInApp }) { // Removed agentsData prop
  const { agentId, '*': housePath } = useParams(); // '*' captures the rest of the path for houseId
  const navigate = useNavigate();
  const location = useLocation();

  const [agent, setAgent] = useState(null);
  const [loadingAgent, setLoadingAgent] = useState(true);
  const [agentError, setAgentError] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [agentHouses, setAgentHouses] = useState([]);
  const [loadingHouses, setLoadingHouses] = useState(true);

  // Determine initial houseId from path or default to first house
  const getHouseIdFromPath = (path) => {
    if (path && path.startsWith('house/')) {
      return path.substring('house/'.length);
    }
    return null;
  };

  useEffect(() => {
    
    const fetchAgentHouses = async (currentAgentId) => {
      if (!currentAgentId) return;
      setLoadingHouses(true);
      try {
        const housesCollectionRef = collection(db, 'houses');
        // Query houses where 'agentUid' matches the agent's Firestore document ID (agent.id)
        const q = query(housesCollectionRef, where('agentUid', '==', currentAgentId));
        const querySnapshot = await getDocs(q);
        const fetchedHouses = [];
        querySnapshot.forEach((doc) => {
          fetchedHouses.push({ id: doc.id, ...doc.data() });
        });
        setAgentHouses(fetchedHouses);

        // After fetching houses, then determine the selectedHouse
        const initialHouseId = getHouseIdFromPath(housePath);
        if (initialHouseId && fetchedHouses.find(h => h.id === initialHouseId)) {
          setSelectedHouse(fetchedHouses.find(h => h.id === initialHouseId));
        } else if (fetchedHouses.length > 0) {
          setSelectedHouse(fetchedHouses[0]);
          if (!initialHouseId) { // If not a direct house link, update URL to show first house
            navigate(`/agent/${agentId}/house/${fetchedHouses[0].id}`, { replace: true });
          }
        } else {
          setSelectedHouse(null);
        }
      } catch (err) {
        console.error("Error fetching agent houses:", err);
      }
      setLoadingHouses(false);
    };

    const fetchAgentData = async () => {
      if (!agentId) {
        setLoadingAgent(false);
        setAgentError("No agent ID provided.");
        navigate('/'); // Or an error page
        return;
      }
      setLoadingAgent(true);
      setAgentError(null);
      try {
        
        // Fetch the user document directly using agentId (which is the Firebase Auth UID)
        const agentDocRef = doc(db, 'users', agentId);
        const agentDocSnap = await getDoc(agentDocRef);

        if (agentDocSnap.exists()) {
          const agentData = { id: agentDocSnap.id, ...agentDocSnap.data() };

          setAgent(agentData);
          setSelectedAgentInApp(agentData);
          await fetchAgentHouses(agentDocSnap.id);
        } else {
          setAgentError("Agent not found.");
        }
      } catch (err) {
        console.error("Error fetching agent data:", err);
        setAgentError("Failed to load agent details.");
      }
      setLoadingAgent(false);
    };

    fetchAgentData();

    // Cleanup function to clear selected agent when component unmounts or agentId changes
    return () => setSelectedAgentInApp(null);
  }, [agentId, housePath, navigate, setSelectedAgentInApp]);

  const handleHouseSelect = (house) => {
    setSelectedHouse(house);
    navigate(`/agent/${agentId}/house/${house.id}`); // Update URL on house selection
  };

  if (loadingAgent || (agent && loadingHouses)) { // Show loading if agent data or house data is loading
    return <p>Loading agent details...</p>;
  }

    if (agentError) {
    return <p style={{ color: 'red' }}>{agentError}</p>;
  }

  if (!agent) {
    return <p>Agent not found.</p>; // Should be caught by agentError ideally
  }

  return (
    <div className="agent-detail-page">
      <div className="content-area">
          <HouseListPane
            houses={agentHouses} 
            onHouseSelect={handleHouseSelect}
            selectedHouseId={selectedHouse?.id}
          />
        <div className="house-viewer-container">
          {loadingHouses && !selectedHouse && <p>Loading houses...</p>}
          {!loadingHouses && agentHouses.length === 0 && <p>This agent has no houses listed yet.</p>}
          {!loadingHouses && agentHouses.length > 0 && !selectedHouse && <p>Select a house to view details.</p>}
          {selectedHouse && <HouseViewer house={selectedHouse} />}        </div>
      </div>
    </div>
  );
}

export default AgentDetailPage;