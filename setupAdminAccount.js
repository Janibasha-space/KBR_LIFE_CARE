// Admin Account Setup Utility
// Run this script to ensure the admin account has the correct role in Firestore

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './src/config/firebase.config.js';

const setupAdminAccount = async () => {
  const adminEmail = 'thukaram2388@gmail.com';
  const adminPassword = 'admin123'; // Change this to your desired password
  
  console.log('🔧 Setting up admin account...');
  
  try {
    // First, try to sign in to see if account exists
    let userCredential;
    let accountExists = true;
    
    try {
      console.log('🔍 Checking if admin account exists...');
      userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log('✅ Admin account exists, updating role...');
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found') {
        console.log('👤 Admin account not found, creating new account...');
        accountExists = false;
        
        // Create the admin account
        userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('✅ Admin account created successfully');
      } else if (signInError.code === 'auth/wrong-password') {
        console.log('❌ Admin account exists but password is incorrect');
        console.log('🔑 Please update the password in this script or use the correct password');
        return;
      } else {
        throw signInError;
      }
    }
    
    const user = userCredential.user;
    console.log('👤 Admin user ID:', user.uid);
    
    // Check if user document exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    const adminData = {
      name: 'Admin King',
      email: adminEmail,
      role: 'admin',
      phone: '+91 9876543210',
      isAdmin: true,
      permissions: ['all'],
      department: 'Administration',
      position: 'System Administrator',
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (userDoc.exists()) {
      const currentData = userDoc.data();
      console.log('📋 Current user data:', currentData);
      
      if (currentData.role !== 'admin') {
        console.log('🔧 Updating user role to admin...');
        await setDoc(userDocRef, adminData, { merge: true });
        console.log('✅ User role updated to admin');
      } else {
        console.log('✅ User already has admin role');
        // Update other fields to ensure consistency
        await setDoc(userDocRef, adminData, { merge: true });
        console.log('✅ Admin data updated');
      }
    } else {
      console.log('📝 Creating user document with admin role...');
      await setDoc(userDocRef, adminData);
      console.log('✅ Admin user document created');
    }
    
    // Verify the setup
    const updatedUserDoc = await getDoc(userDocRef);
    const finalData = updatedUserDoc.data();
    
    console.log('🎉 Admin account setup complete!');
    console.log('📧 Email:', finalData.email);
    console.log('👤 Name:', finalData.name);
    console.log('🔑 Role:', finalData.role);
    console.log('📞 Phone:', finalData.phone);
    console.log('✅ Admin status:', finalData.isAdmin);
    
    console.log('\n🚀 You can now login with:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔒 Password: ${adminPassword}`);
    console.log('🏥 Interface: Admin Dashboard');
    
  } catch (error) {
    console.error('❌ Error setting up admin account:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('💡 The admin email is already in use. Try signing in instead.');
    } else if (error.code === 'auth/weak-password') {
      console.log('💡 Please use a stronger password (at least 6 characters).');
    } else if (error.code === 'auth/network-request-failed') {
      console.log('💡 Network error. Please check your internet connection.');
    }
  }
};

// Run the setup
setupAdminAccount();