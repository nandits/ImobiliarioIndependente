import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AgentDetailPage from './pages/AgentDetailPage';
import './App.css'

function App() {

  const [appData, setAppData] = useState({ agents: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    fetch('/app_data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setAppData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch app_data.json:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container"><p>Loading application data...</p></div>;
  if (error) return <div className="container"><p>Error loading data: {error}. Please check console and ensure app_data.json is in public folder.</p></div>;

  return (
    <div className="app-container">
      <Header agent={selectedAgent} />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage agents={appData.agents} />} />
          <Route 
            path="/agent/:agentId/*" 
            element={
              <AgentDetailPage 
                agentsData={appData.agents} 
                setSelectedAgentInApp={setSelectedAgent}
              />
            } 
          />
        </Routes>
      </main>
      <footer>
        <p>&copy; 2024 Real Estate Catalog</p>
      </footer>
    </div>
  )
}

export default App
