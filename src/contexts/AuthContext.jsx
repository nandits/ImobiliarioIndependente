import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth, db } from '../firebaseConfig'; // Import db
import { onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  async function logout() {
    return firebaseSignOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[AuthContext] onAuthStateChanged triggered. User object:", user ? { uid: user.uid, email: user.email } : "User is null");
      setCurrentUser(user);
      if (user) {
        setLoading(true);
        // User is signed in, fetch their profile from Firestore
        console.log(`[AuthContext] User is signed in. Attempting to fetch profile for UID: ${user.uid}`);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const profileData = { uid: user.uid, ...userDocSnap.data() };
            console.log("[AuthContext] Profile FOUND in Firestore:", profileData);
            setUserProfile(profileData);
          } else {
            // User authenticated with Firebase, but no profile in our 'users' collection
            console.warn(`[AuthContext] Profile NOT found in Firestore for UID: ${user.uid}. User email: ${user.email}`);
            setUserProfile(null); // Or set a guest profile, or trigger a registration flow
          }
        } catch (error) {
          console.error("[AuthContext] Error fetching user profile from Firestore:", error);
          setUserProfile(null); // Or set a guest profile, or trigger a registration flow
        }
      } else {
        // User is signed out
        console.log("[AuthContext] User is signed out.");
        setUserProfile(null);
      }
      console.log("[AuthContext] Setting loading to false.");
      setLoading(false); // Set loading to false after auth state and profile are processed
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const value = {
    currentUser,
    userProfile, // Provide userProfile through context
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}