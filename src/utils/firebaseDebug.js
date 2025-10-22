// Firebase Debug Helper - Temporary file for debugging authentication
import { auth, db } from '../config/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';

export class FirebaseDebugHelper {
  // Debug authentication state
  static debugAuthState() {
    console.log('=== FIREBASE AUTH DEBUG ===');
    console.log('Auth object exists:', !!auth);
    console.log('Current user:', auth.currentUser);
    console.log('User ID:', auth.currentUser?.uid);
    console.log('User email:', auth.currentUser?.email);
    console.log('User display name:', auth.currentUser?.displayName);
    console.log('Email verified:', auth.currentUser?.emailVerified);
    console.log('Auth state (boolean):', !!auth.currentUser);
    console.log('Database exists:', !!db);
    console.log('============================');
    
    return {
      isAuthenticated: !!auth.currentUser,
      userId: auth.currentUser?.uid,
      userEmail: auth.currentUser?.email
    };
  }

  // Listen to auth state changes
  static setupAuthListener() {
    console.log('Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔥 AUTH STATE CHANGED 🔥');
      if (user) {
        console.log('✅ User is authenticated');
        console.log('User ID:', user.uid);
        console.log('Email:', user.email);
        console.log('Display name:', user.displayName);
      } else {
        console.log('❌ User is NOT authenticated');
      }
      console.log('========================');
    });

    return unsubscribe;
  }

  // Test Firestore connection
  static async testFirestoreConnection() {
    try {
      console.log('Testing Firestore connection...');
      
      const authState = this.debugAuthState();
      
      if (!authState.isAuthenticated) {
        console.log('⚠️ WARNING: User not authenticated - this might cause permission errors');
      }

      // Try to access a simple collection
      const { collection, getDocs } = await import('firebase/firestore');
      
      console.log('Attempting to fetch doctors...');
      const doctorsRef = collection(db, 'doctors');
      const snapshot = await getDocs(doctorsRef);
      
      console.log('✅ Firestore connection successful!');
      console.log('Documents found:', snapshot.size);
      
      return {
        success: true,
        docCount: snapshot.size,
        authenticated: authState.isAuthenticated
      };
      
    } catch (error) {
      console.log('❌ Firestore connection failed!');
      console.error('Error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
        authenticated: this.debugAuthState().isAuthenticated
      };
    }
  }

  // Get current user token
  static async getUserToken() {
    try {
      if (!auth.currentUser) {
        console.log('No current user for token');
        return null;
      }

      const token = await auth.currentUser.getIdToken();
      console.log('User token retrieved successfully');
      console.log('Token length:', token.length);
      
      return token;
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  // Complete diagnosis
  static async runDiagnosis() {
    console.log('\n🔍 RUNNING FIREBASE DIAGNOSIS...\n');

    // 1. Check auth state
    const authState = this.debugAuthState();

    // 2. Test Firestore connection
    const firestoreTest = await this.testFirestoreConnection();

    // 3. Get user token if authenticated
    let tokenTest = null;
    if (authState.isAuthenticated) {
      tokenTest = await this.getUserToken();
    }

    // 4. Summary
    console.log('\n📊 DIAGNOSIS SUMMARY:');
    console.log('Authentication:', authState.isAuthenticated ? '✅ OK' : '❌ FAILED');
    console.log('Firestore Access:', firestoreTest.success ? '✅ OK' : '❌ FAILED');
    console.log('User Token:', tokenTest ? '✅ OK' : '❌ FAILED');
    
    if (!authState.isAuthenticated) {
      console.log('\n🚨 ISSUE FOUND: User not authenticated');
      console.log('💡 SOLUTION: Make sure user is logged in before accessing Firestore');
    }
    
    if (!firestoreTest.success && authState.isAuthenticated) {
      console.log('\n🚨 ISSUE FOUND: Permission denied despite authentication');
      console.log('💡 SOLUTION: Check Firebase Security Rules');
      console.log('Error code:', firestoreTest.errorCode);
    }

    return {
      authState,
      firestoreTest,
      tokenTest,
      recommendation: !authState.isAuthenticated 
        ? 'User needs to log in' 
        : !firestoreTest.success 
        ? 'Check Firebase Security Rules' 
        : 'Everything looks good'
    };
  }
}

export default FirebaseDebugHelper;