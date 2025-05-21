// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
import { getAuth } from "firebase/auth"; // Import getAuth
import { getFirestore } from "firebase/firestore"; // Import getFirestore

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWn6taqzEraho6NfRrwqF0c-C_B5j5n60",
  authDomain: "imobiliario-independente.firebaseapp.com",
  projectId: "imobiliario-independente",
  storageBucket: "imobiliario-independente.firebasestorage.app",
  messagingSenderId: "282984057819",
  appId: "1:282984057819:web:d4aa98d58d9e7ca88275fe",
  measurementId: "G-F4QBQYXD5D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { app, auth, db, analytics }; // Export the instances