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
  const [userProfile, setUserProfile] = useState(undefined); // Initialize as undefined
  const [profileError, setProfileError] = useState(null); // State for profile fetching errors
  const [authLoading, setAuthLoading] = useState(true);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  async function logout() {
    console.log("[AuthContext] Logging out user.");
    setUserProfile(null);
    return firebaseSignOut(auth);
  }

  const fetchUserProfileData = async (authUser)=> {
    setProfileError(null); // Reset profile error before fetching

    if (!authUser || !authUser.uid) {
      console.log("[AuthContext] fetchUserProfileData called with no UID, setting profile to null.");
      setUserProfile(null);
      return;
    }
    console.log(`[AuthContext] Attempting to fetch profile for UID: ${authUser.uid}`);
    const userDocRef = doc(db, "users", authUser.uid);
    try {
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const profileData = { uid: userDocSnap.id, ...userDocSnap.data() }; // Ensure uid is from doc.id
        console.log("[AuthContext] Profile FOUND in Firestore:", profileData);
        setUserProfile(profileData);
      } else {
        console.warn(`[AuthContext] Profile NOT found in Firestore for UID: ${uid}. User email: ${currentUser?.email}`);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("[AuthContext] Error fetching user profile from Firestore:", error);
      setProfileError(error); 
      setUserProfile(null);
    }
  };


  useEffect(() => {
    setAuthLoading(true); // Ensure loading is true at the start of the effect
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("[AuthContext] onAuthStateChanged triggered. User object:", user ? { uid: user.uid, email: user.email } : "User is null");
      setProfileError(null); // Reset profile error on auth state change      
      setCurrentUser(user);
      if (user) {
        await fetchUserProfileData(user);
      } else {
        // User is signed out
        console.log("[AuthContext] User is signed out.");
        setUserProfile(null);
      }
      setAuthLoading(false); // Set loading to false after auth state and profile are processed
    });
    return () => {
      console.log("[AuthContext] Unsubscribing from onAuthStateChanged.");
      unsubscribe(); // Cleanup subscription on unmount
    };
  }, []);

  const refreshUserProfile = async () => {
    if (currentUser) {
      console.log(`[AuthContext] refreshUserProfile called for UID: ${currentUser.uid}`);
      await fetchUserProfileData(currentUser.uid);
    } else {
      console.log("[AuthContext] refreshUserProfile called, but no current user.");
    }
  };

  const value = {
    currentUser,
    userProfile, // Provide userProfile through context
    profileError,
    loginWithGoogle,
    logout,
    authLoading,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{!authLoading && children}</AuthContext.Provider>;
}