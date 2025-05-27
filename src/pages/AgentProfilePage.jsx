import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, setDoc, collection, query, where, getDocs, writeBatch, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { uploadImageObjects } from '../services/cloudinaryService';
import './AgentProfilePage.css';



function AgentProfilePage() {
  const { currentUser, userProfile, refreshUserProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [newProfilePicFile, setNewProfilePicFile] = useState(null);
  const [newProfilePicPreview, setNewProfilePicPreview] = useState(null);


  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    setFormData({
      displayName: userProfile?.displayName || currentUser?.displayName || '',
      email: userProfile?.email || currentUser?.email || '',
      phone: userProfile?.phone || '',
      bio: userProfile?.bio || '',
    });

    setNewProfilePicFile(null);
    setNewProfilePicPreview(null);

  }, [currentUser, userProfile]);

  useEffect(() => {
    // Cleanup object URL when component unmounts or when newProfilePicPreview changes
    return () => {
      if (newProfilePicPreview) URL.revokeObjectURL(newProfilePicPreview);
    };
  }, [newProfilePicPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (newProfilePicPreview) { // Revoke old preview URL if one exists
        URL.revokeObjectURL(newProfilePicPreview);
      }
      setNewProfilePicFile(file);
      setNewProfilePicPreview(URL.createObjectURL(file));
    } else {
      setNewProfilePicFile(null);
      setNewProfilePicPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError("Utilizador não encontrado. Por favor, faça login novamente.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      let dataToSave = {
        displayName: formData.displayName,
        phone: formData.phone,
        email: formData.email,
        bio: formData.bio,
      };

      if (newProfilePicFile) {
        // Prepare image object for upload service
        const imageToUpload = [{
          file: newProfilePicFile,
          picDisplayPosition: 1, // Not strictly needed for single profile pic
          picDescription: `${formData.displayName || currentUser.displayName}'s profile picture`
        }];

        // Dummy progress callback for now, can be enhanced later
        const onProgress = (index, state) => console.log(`Profile pic upload state for index ${index}:`, state);

        const uploadedImages = await uploadImageObjects(imageToUpload, onProgress);

        if (uploadedImages && uploadedImages.length > 0 && uploadedImages[0].picUrl) {
          const newPicUrl = uploadedImages[0].picUrl;
          const newPublicId = uploadedImages[0].publicId;

          // Check if there was an old profile picture with a publicId to log for deletion
          if (userProfile && userProfile.profilePicturePublicId) {
            const oldPublicId = userProfile.profilePicturePublicId;
            if (oldPublicId !== newPublicId) { // Only log if it's truly a different image
              const imageLogRef = doc(collection(db, 'imagesToDelete')); // Auto-generate ID
              await setDoc(imageLogRef, {
                publicIds: oldPublicId,
                loggedByUid: currentUser.uid,
                contextInfo: `Profile picture change for user ${currentUser.uid}. Old pic publicId: ${oldPublicId}`,
                loggedAt: serverTimestamp()
              });
              console.log(`Logged old profile picture publicId ${oldPublicId} for deletion.`);
            }
          }
          dataToSave.profilePicture = newPicUrl; // Set new profile picture URL
          dataToSave.profilePicturePublicId = newPublicId; // Store the new publicId
          } else {
          throw new Error("Falha ao carregar a imagem de perfil.");
        }
      }

      await setDoc(userDocRef, dataToSave, { merge: true }); // Use setDoc with merge
      setIsEditing(false);
      // Refresh userProfile from context to reflect changes immediately
      // The onSnapshot in AuthContext should ideally pick this up,
      // but calling refreshUserProfile ensures it if there's any delay or issue.
      if (refreshUserProfile) {
        await refreshUserProfile();
      }
      if (newProfilePicPreview && newProfilePicFile) { // If a new pic was uploaded and saved
        URL.revokeObjectURL(newProfilePicPreview); // Revoke after successful save
      }
      setNewProfilePicFile(null); // Clear the selected file
      setNewProfilePicPreview(null); // Clear the preview
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Falha ao atualizar o perfil. Por favor, tente novamente.");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    // Reset formData based on the same logic as useEffect for initial population
    setFormData({
      displayName: userProfile?.displayName || currentUser?.displayName || '',
      email: userProfile?.email || currentUser?.email || '',
      phone: userProfile?.phone || '',
      bio: userProfile?.bio || '',
    });

    if (newProfilePicPreview) {
      URL.revokeObjectURL(newProfilePicPreview);
    }

    setNewProfilePicFile(null);
    setNewProfilePicPreview(null);

    setIsEditing(false);
    setError(''); // Clear any errors
  };


  const handleDeleteAccount = async () => {
    setError('');
    const confirmation1 = window.prompt("Esta acção é irreversível e apagará toda a sua informação, incluindo as suas listagens de casas. Para confirmar, escreva 'APAGAR MINHA CONTA' na caixa abaixo:");
    if (confirmation1 !== "APAGAR MINHA CONTA") {
      setError("Confirmação incorrecta. A conta não foi apagada.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const uid = currentUser.uid;

      // 1. Fetch and process user's house listings
      const housesRef = collection(db, "houses");
      const userHousesQuery = query(housesRef, where("agentUid", "==", uid));
      const userHousesSnapshot = await getDocs(userHousesQuery);

      const batch = writeBatch(db); // Use a batch for multiple Firestore writes

      if (!userHousesSnapshot.empty) {
        console.log(`Found ${userHousesSnapshot.size} house(s) for user ${uid} to delete and log images.`);
        for (const houseDoc of userHousesSnapshot.docs) {
          const houseData = houseDoc.data();
          const houseId = houseDoc.id;

          // Log publicIds for manual deletion from Cloudinary
          if (houseData.images && Array.isArray(houseData.images) && houseData.images.length > 0) {
            const publicIdsToLog = houseData.images
              .map(image => image.publicId)
              .filter(id => !!id);

            publicIdsToLog.forEach(pid => {
              if (pid) { // Ensure pid is not null/undefined
                const imageLogRef = doc(collection(db, 'imagesToDelete')); // Auto-generate ID for each publicId
                batch.set(imageLogRef, {
                  publicId: pid,
                  loggedByUid: uid,
                  loggedAt: serverTimestamp(),
                  sourceDescription: `Image from house ${houseId} (owner: ${uid}) during account deletion.`
                });
              }
            });
            console.log(`Queued logging of ${publicIdsToLog.length} publicIds for house ${houseId} to imagesToDelete.`);
          }
          // Add house deletion to batch
          batch.delete(houseDoc.ref);
          console.log(`Queued deletion of house ${houseId}.`);
        }
      } else {
        console.log(`No houses found for user ${uid}.`);
      }

      // 2. Delete User's Profile Document from 'users' collection
      const userProfileRef = doc(db, "users", uid);
      batch.delete(userProfileRef);
      console.log(`Queued deletion of user profile for ${uid}.`);

      await batch.commit(); // Commit all Firestore operations
      console.log("Firestore data deletion and logging complete.");
      if (logout) { // logout is from useAuth()
        await logout();
      }
      alert("A sua informação foi removida. A sua conta será totalmente desactivada por um administrador em breve.");
      // Navigate to home after logout, AuthContext might also handle this.
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Falha ao apagar a conta. Por favor, tente novamente ou contacte o suporte.");
      setIsDeletingAccount(false);
    }
  };

  const displayProfilePicture = newProfilePicPreview || userProfile?.profilePicture;


  return (
    <div className="agent-profile-page">
      <h2>Meu Perfil de Agent</h2>
      {displayProfilePicture && (
        <img
          src={displayProfilePicture}
          alt={userProfile.displayName || 'Profile'}
          style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }}
          onError={(e) => { e.target.style.display = 'none'; /* Hide if image fails to load */ }}
        />
      )}
      {error && <p className="error-message">{error}</p>}
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Nome:</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Contacto:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio:</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label htmlFor="profilePicture">Foto de Perfil:</label>
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              accept="image/*"
              onChange={handleProfilePicChange} />
          </div>
          <p><strong>Email:</strong> {formData.email || 'N/A'}</p>
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={handleCancel} disabled={loading}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div>
          <p><strong>Nome:</strong> {formData.displayName || 'Não definido'}</p>
          <p><strong>Email:</strong> {formData.email || 'Não definido'}</p>
          <p><strong>Contacto:</strong> {formData.phone || 'Não definido'}</p>
          <p><strong>Bio:</strong> {formData.bio || 'Não definido'}</p>
          <button onClick={() => setIsEditing(true)} className="btn edit-button">
            Editar Perfil
          </button>
          <div className="danger-zone" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid red' }}>
            <h4>Zona de Perigo</h4>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-delete"
              disabled={isDeletingAccount || loading}>
              {isDeletingAccount ? 'Apagando Conta...' : 'Apagar Minha Conta'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentProfilePage;