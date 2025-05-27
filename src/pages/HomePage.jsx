import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import Firestore instance
import { collection, query, where, getDocs } from 'firebase/firestore';
import './HomePage.css';

function HomePage() {
  const [agentsList, setAgentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersCollectionRef = collection(db, 'users');
        const q = query(usersCollectionRef);
        const querySnapshot = await getDocs(q);
        const fetchedAgents = [];
        querySnapshot.forEach((doc) => {
          fetchedAgents.push({ id: doc.id, ...doc.data() });
        });
        setAgentsList(fetchedAgents);
      } catch (err) {
        console.error("Error fetching agents from Firestore:", err);
        setError("Failed to load agents. Please try again later.");
      }
      setLoading(false);
    };

    fetchAgents();
  }, []);

  if (loading) {
    return <p>Loading agents...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (agentsList.length === 0) {
    return <p>No agents available at the moment.</p>;
  }

  return (
    <div className="homepage">
      <h2>Select an Agent</h2>
      <ul className="agent-list">
          {agentsList.map(agent => (
            <li key={agent.id} className="agent-list-item"> 
              <Link to={`/agent/${agent.id}`}>          
              <img 
                src={agent.profilePicture} 
                alt={agent.displayName} 
                className="agent-thumbnail"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display='block';}} // Hide img, show placeholder
              />
              <div className="agent-thumbnail-placeholder" style={{display: 'none'}}>No Img</div>
              <span>{agent.displayName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;