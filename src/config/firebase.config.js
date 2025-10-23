// Firebase Configuration - Memory-Only Persistence (No Session Saving)
import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAU23ScOB4t2_5rYbAAXkAxv7fMvsDEPuE",
  authDomain: "kbr-life-care--hospitals.firebaseapp.com",
  projectId: "kbr-life-care--hospitals",
  storageBucket: "kbr-life-care--hospitals.firebasestorage.app",
  messagingSenderId: "32013171785",
  appId: "1:32013171785:ios:6a037aa3a8ccf7eccf5398"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with memory-only persistence (no session saving)
let auth;
try {
  // Try to initialize with memory-only persistence
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence
  });
} catch (error) {
  // Fallback to getAuth if already initialized
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;