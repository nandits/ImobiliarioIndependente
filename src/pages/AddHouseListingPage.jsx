import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import HouseForm from '../components/HouseForm'; 
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './AddHouseListingPage.css';



function AddHouseListingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleAddHouse = async (houseData) => {
    if (!currentUser) {
      setSubmitError("You must be logged in to add a listing.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const housePayload = {
        ...houseData,
        agentUid: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
      const docRef = await addDoc(collection(db, 'houses'), housePayload);
      console.log("Document written with ID: ", docRef.id);
      navigate(`/agent/${currentUser.uid}/house/${docRef.id}`); // Navigate to the new house detail page
    } catch (error) {
      console.error("Error adding document: ", error);
      setSubmitError("Failed to add listing. Please try again. " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Add New House Listing</h2>
      {submitError && <p className="error-message">{submitError}</p>}
      <HouseForm onSubmit={handleAddHouse} isLoading={isSubmitting} />
    </div>
  );
}

export default AddHouseListingPage;