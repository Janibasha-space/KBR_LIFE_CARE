// Firebase Authentication Service
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

export class FirebaseAuthService {
  // Helper method for retry logic on network errors
  static async retryOnNetworkError(operation, maxRetries = 3, delay = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Auth attempt ${attempt}/${maxRetries}`);
        return await operation();
      } catch (error) {
        console.log(`❌ Attempt ${attempt} failed:`, error.code);
        
        // Retry only on network errors and if we haven't reached max retries
        if (error.code === 'auth/network-request-failed' && attempt < maxRetries) {
          console.log(`⏳ Network error detected. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Re-throw error if max retries reached or different error type
        throw error;
      }
    }
  }

  // Login user with Firebase
  static async login(credentials) {
    try {
      const { email, password } = credentials;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get additional user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      return {
        success: true,
        data: {
          token: await user.getIdToken(),
          user: {
            id: user.uid,
            name: userData.name || user.displayName,
            email: user.email,
            role: userData.role || 'patient',
            phone: userData.phone || '',
            ...userData
          }
        },
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Firebase login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Register new user with Firebase
  static async register(userData) {
    try {
      const { email, password, name, phone, role = 'patient' } = userData;
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, { displayName: name });
      
      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        phone,
        role,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        data: {
          token: await user.getIdToken(),
          user: {
            id: user.uid,
            name,
            email,
            phone,
            role
          }
        },
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Firebase registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Logout user
  static async logout() {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('Firebase logout error:', error);
      throw new Error('Logout failed');
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!auth.currentUser;
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Verify token (Firebase handles this automatically)
  static async verifyToken() {
    try {
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true); // Force refresh token
        return { valid: true };
      }
      return { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }

  // Forgot password
  static async forgotPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Listen to auth state changes
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Sign in anonymously (for testing/guest access)
  static async signInAnonymously() {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      console.log('✅ Anonymous sign-in successful:', user.uid);
      
      return {
        success: true,
        data: {
          user: {
            id: user.uid,
            name: 'Guest User',
            email: 'guest@kbrlifecare.com',
            role: 'guest',
            isAnonymous: true
          }
        },
        message: 'Anonymous authentication successful'
      };
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      throw new Error('Anonymous authentication failed');
    }
  }

  // Auto-authenticate users (sign in anonymously or with test user)
  static async ensureAuthentication() {
    try {
      if (auth.currentUser) {
        console.log('✅ User already authenticated:', auth.currentUser.uid);
        return { success: true, user: auth.currentUser };
      }

      console.log('🔐 No user authenticated, trying authentication...');
      
      // Try anonymous authentication first
      try {
        const result = await this.retryOnNetworkError(() => this.signInAnonymously());
        return { success: true, user: auth.currentUser };
      } catch (anonError) {
        console.log('❌ Anonymous auth failed, trying test user login...');
        
        // Fallback: Try to login with test user
        try {
          const testCredentials = {
            email: 'test@kbrlifecare.com',
            password: 'test123456'
          };
          
          console.log('🧪 Attempting test user login...');
          await this.retryOnNetworkError(() => this.login(testCredentials));
          console.log('✅ Test user login successful!');
          return { success: true, user: auth.currentUser };
        } catch (loginError) {
          // If login fails, try to register the test user
          console.log('👤 Test user not found, creating test user...');
          try {
            const testUserData = {
              email: 'test@kbrlifecare.com',
              password: 'test123456',
              name: 'Test User',
              phone: '+1234567890',
              role: 'admin'
            };
            
            await this.retryOnNetworkError(() => this.register(testUserData));
            console.log('✅ Test user created and logged in!');
            return { success: true, user: auth.currentUser };
          } catch (registerError) {
            console.error('❌ All authentication methods failed');
            
            // Provide better error information for network issues
            if (registerError.code === 'auth/network-request-failed') {
              console.log('🔌 Network error detected. Please check your internet connection.');
              return { 
                success: false, 
                error: 'Network connection failed. Please check your internet connection and try again.',
                isNetworkError: true
              };
            }
            
            return { success: false, error: 'All authentication methods failed' };
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to ensure authentication:', error);
      return { success: false, error: error.message };
    }
  }

  // Update user profile
  static async updateUserProfile(userId, profileData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      // Update Firebase Auth profile if name changed
      if (profileData.name && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: profileData.name });
      }
      
      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Helper method to get user-friendly error messages
  static getErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'Email address is already registered';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'User account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      default:
        return 'Authentication failed. Please try again';
    }
  }
}

export default FirebaseAuthService;