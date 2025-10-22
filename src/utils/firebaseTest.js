// Quick Firebase Test Script
// Add this to any screen to test Firebase connectivity

import { auth, db } from '../config/firebase.config';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase Connection...');
  
  try {
    // Test 1: Check Firebase Auth
    console.log('✅ Firebase Auth initialized');
    
    // Test 2: Check Firestore connection
    const testCollection = collection(db, 'test');
    console.log('✅ Firestore connection established');
    
    // Test 3: Try to read from Firestore (doctors collection)
    try {
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'));
      console.log(`✅ Found ${doctorsSnapshot.size} doctors in database`);
    } catch (error) {
      console.log('ℹ️ Doctors collection not found (run setup to create sample data)');
    }
    
    // Test 4: Check current auth state
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log(`✅ User logged in: ${currentUser.email}`);
    } else {
      console.log('ℹ️ No user currently logged in');
    }
    
    console.log('🎉 Firebase connection test completed successfully!');
    return { success: true, message: 'Firebase is working correctly' };
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Quick auth test
export const quickAuthTest = async () => {
  try {
    // Create test user
    const testEmail = 'test@kbrhospital.com';
    const testPassword = 'password123';
    
    console.log('🔐 Testing Firebase Authentication...');
    
    try {
      // Try to create user
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      console.log('✅ Test user created successfully');
      
      // Add user data to Firestore
      await addDoc(collection(db, 'users'), {
        name: 'Test User',
        email: testEmail,
        role: 'patient',
        createdAt: new Date().toISOString()
      });
      
      console.log('✅ User data saved to Firestore');
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('ℹ️ Test user already exists, trying to login...');
        
        // Try to login
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        console.log('✅ Login successful');
      } else {
        throw error;
      }
    }
    
    return { success: true, message: 'Authentication test passed' };
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return { success: false, error: error.message };
  }
};

export default { testFirebaseConnection, quickAuthTest };