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
    const [userProfile, setUserProfile] = useState(null); // To store Firestore profile data

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
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        // User is signed in, fetch their profile from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile({ uid: user.uid, ...userDocSnap.data() });
        } else {
          // User authenticated with Firebase, but no profile in our 'users' collection
          console.warn("User signed in but no profile found in Firestore:", user.uid, user.email);
          setUserProfile(null); // Or set a guest profile, or trigger a registration flow
        }
      } else {
        // User is signed out
        setUserProfile(null);
      }
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