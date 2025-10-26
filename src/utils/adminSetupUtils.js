// Quick Admin Setup Script
// You can run this in your React Native app's JavaScript console or create a temporary screen for it

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

export const quickAdminSetup = async () => {
  const adminEmail = 'thukaram2388@gmail.com';
  
  console.log('🔧 Quick admin setup starting...');
  
  try {
    // Check if user is currently signed in
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ No user is currently signed in');
      console.log('💡 Please sign in with the admin email first, then run this setup');
      return {
        success: false,
        message: 'Please sign in with admin email first'
      };
    }
    
    if (currentUser.email !== adminEmail) {
      console.log('❌ Currently signed in user is not the admin');
      console.log('📧 Current user:', currentUser.email);
      console.log('📧 Expected admin:', adminEmail);
      console.log('💡 Please sign in with the admin email first');
      return {
        success: false,
        message: 'Please sign in with admin email first'
      };
    }
    
    console.log('✅ Admin user is signed in:', currentUser.email);
    
    // Update user document with admin role
    const userDocRef = doc(db, 'users', currentUser.uid);
    const adminData = {
      name: 'Admin King',
      email: adminEmail,
      role: 'admin',
      phone: '+91 9876543210',
      isAdmin: true,
      permissions: ['all'],
      department: 'Administration',
      position: 'System Administrator',
      updatedAt: new Date().toISOString()
    };
    
    // Check current data
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      console.log('📋 Current user data:', userDoc.data());
    } else {
      console.log('📝 No user document found, creating new one');
      adminData.createdAt = new Date().toISOString();
    }
    
    // Set the admin data
    await setDoc(userDocRef, adminData, { merge: true });
    
    console.log('✅ Admin data updated successfully!');
    
    // Verify the update
    const updatedUserDoc = await getDoc(userDocRef);
    const finalData = updatedUserDoc.data();
    
    console.log('🎉 Admin setup complete!');
    console.log('👤 Name:', finalData.name);
    console.log('📧 Email:', finalData.email);
    console.log('🔑 Role:', finalData.role);
    console.log('👑 Is Admin:', finalData.isAdmin);
    
    return {
      success: true,
      message: 'Admin account setup complete',
      userData: finalData
    };
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

// Helper function to check current user role
export const checkCurrentUserRole = async () => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('❌ No user signed in');
      return null;
    }
    
    console.log('👤 Current user:', currentUser.email);
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('📋 User data:', userData);
      console.log('🔑 Role:', userData.role);
      return userData;
    } else {
      console.log('❌ No user document found in Firestore');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking user role:', error);
    return null;
  }
};