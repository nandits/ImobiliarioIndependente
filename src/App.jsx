import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import OwnerProtectedRoute from './components/OwnerProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute'; // Import general ProtectedRoute
import HomePage from './pages/HomePage';
import AgentDetailPage from './pages/AgentDetailPage';
import LoginPage from './pages/LoginPage';
import AgentProfilePage from './pages/AgentProfilePage'; // Import AgentProfilePage
import AddHouseListingPage from './pages/AddHouseListingPage'; // Import the new page
import ManageListingsPage from './pages/ManageListingsPage'; // Import the new page
import UnauthorizedPage from './pages/UnauthorizedPage'; // Import UnauthorizedPage
import './App.css';

function App() {

  //const [appData, setAppData] = useState({ agents: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <div className="container"><p>Loading application data...</p></div>;
  if (error) return <div className="container"><p>Error loading data: {error}.</p></div>;

  return (
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <div className="app-container">
        <Header agent={selectedAgent} />
        <main className="container">
          <Routes>
            <Route
              path="/"
              element={
                <OwnerProtectedRoute>
                  <HomePage />
                </OwnerProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/agent/:agentId/*"
              element={
                <AgentDetailPage
                  setSelectedAgentInApp={setSelectedAgent}
                />
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <AgentProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile/add-listing"
              element={
                <ProtectedRoute>
                  <AddHouseListingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile/my-listings"
              element={
                <ProtectedRoute>
                  <ManageListingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </main>
        <footer>
          <p>&copy; 2024 Real Estate Catalog</p>
        </footer>
      </div>
    </AuthProvider>
  )
}

export default App
