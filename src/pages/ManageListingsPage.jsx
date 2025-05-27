import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, orderBy, doc, deleteDoc, setDoc, serverTimestamp} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './ManageListingsPage.css';


function ManageListingsPage() {
  const { currentUser } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // To show loading state for delete

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError("Utilizador não autenticado .");
      return;
    }

    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const housesCollectionRef = collection(db, 'houses');
        const q = query(
          housesCollectionRef,
          where('agentUid', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyListings(listings);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Falhou ao carregar a sua Listagem. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentUser]);

  const handleDeleteListing = async (houseId) => {
    if (!window.confirm("Tem a certeza que quer apagar esta listagem? Esta acção não pode ser desfeita.")) {
      return;
    }
    setDeletingId(houseId);
    setError(null); // Clear previous errors

    const listingToDelete = myListings.find(listing => listing.id === houseId);

    try {
      if (listingToDelete && listingToDelete.images && listingToDelete.images.length > 0) {
        const publicIdsToLog = listingToDelete.images
          .map(image => image.publicId)
          .filter(id => !!id); // Ensure only valid publicIds are logged

        // Log each publicId as a separate document
        for (const pid of publicIdsToLog) {
          if (pid) { // Ensure pid is not null/undefined
            const imageLogRef = doc(collection(db, 'imagesToDelete')); // Auto-generate ID
            await setDoc(imageLogRef, {
              publicId: pid, // Store the single publicId
              loggedByUid: currentUser.uid,
              loggedAt: serverTimestamp(),
              sourceDescription: `Image from deleted house ${houseId} by user ${currentUser.uid}.`
            });
          }
        }
        console.log(`Logged ${publicIdsToLog.length} publicIds to imagesToDelete for house ${houseId}.`);
      }

      const docRef = doc(db, 'houses', houseId);
      await deleteDoc(docRef);
      console.log(`Document ${houseId} from houses deleted successfully.`);

      setMyListings(prevListings => prevListings.filter(listing => listing.id !== houseId));

    } catch (err) {
      console.error("Error deleting listing:", err);
      setError(err.message || "Falhou ao apagar a listagem. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };


  if (loading) {
    return <p>Carregando a sua Listagem</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="manage-listings-page">
      <h2>Minha listagem</h2>
      <Link to="/my-profile/add-listing" className="add-listing-link"><strong>Adicionar Casa</strong></Link>
      {myListings.length === 0 ? (
        <p>
          Não existem casas listadas.
          <Link to="/my-profile/add-listing"> Adicione Agora!</Link>
        </p>
      ) : (
        <ul className="listings-list">
          {myListings.map(listing => (
            <li key={listing.id} className="listing-item">
              <div className="listing-info">
                <h3>{listing.title}</h3>
                <p>{listing.address || 'N/A'}</p>
                <p>Montante: {listing.price ? `$${listing.price.toLocaleString()}` : 'N/A'}</p>
                {/* Optionally display first image */}
                {listing.images && listing.images.length > 0 && listing.images[0].picUrl && (
                  <img src={listing.images[0].picUrl} alt={listing.title} className="listing-thumbnail" />
                )}
              </div>
              <div className="listing-actions">
                {/* <Link to={`/my-profile/edit-listing/${listing.id}`} className="btn btn-edit">Edit</Link> */}
                <button
                  className="btn btn-delete"
                  onClick={() => handleDeleteListing(listing.id)} // We'll implement this next
                  disabled={deletingId === listing.id}
                >
                  {deletingId === listing.id ? 'Apagando...' : 'Apagar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ManageListingsPage;