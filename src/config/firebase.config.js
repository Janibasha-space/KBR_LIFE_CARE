// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;