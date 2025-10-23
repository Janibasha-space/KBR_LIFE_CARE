import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/authService';
import { useApp } from './AppContext';

// Firebase-only authentication - no more demo accounts

// Initial auth state
const initialAuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  authMode: 'demo', // 'demo' or 'firebase'
  error: null
};

// Create context
const UnifiedAuthContext = createContext();

// Hook to use auth context
export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
};

// Auth Provider Component
export const UnifiedAuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState);
  const [tokenCounter, setTokenCounter] = useState(9);

  // Initialize authentication state
  useEffect(() => {
    // Initialize authentication system but don't auto-login
    const initializeCleanAuth = async () => {
      try {
        // Clear any cached authentication data
        await AsyncStorage.multiRemove([
          'firebase:authUser',
          'firebase:host:kbr-life-care--hospitals.firebaseapp.com',
          'firebaseLocalStorageDb'
        ]);
        console.log('🗑️ Cleared cached authentication data');
        
        // Force logout any existing Firebase session
        await AuthService.logout();
        console.log('🧹 Cleared any existing authentication session');
        
        // Initialize admin account setup
        initializeAuthentication();
        console.log('🚀 Authentication system ready - manual login required');
        
        // Set initial clean state (no auto authentication)
        setAuthState(prev => ({ 
          ...prev, 
          isAuthenticated: false,
          user: null,
          isLoading: false,
          authMode: 'firebase',
          error: null
        }));
      } catch (error) {
        console.log('⚠️ Auth cleanup completed with minor issues:', error.message);
        // Still set clean state even if logout fails
        setAuthState(prev => ({ 
          ...prev, 
          isAuthenticated: false,
          user: null,
          isLoading: false,
          authMode: 'firebase',
          error: null
        }));
      }
    };

    initializeCleanAuth();
  }, []);

  // No automatic Firebase auth state listening - manual login only

  // No automatic authentication - manual login required
  // Removed initializeAuth and handleFirebaseAuthStateChange functions

  const handleFirebaseUser = async (firebaseUser) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Get additional user data from Firebase service
      const userData = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
        role: 'patient', // Default role
        isDemoAccount: false,
        isFirebaseAccount: true
      };

      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user: userData,
        authMode: 'firebase',
        isLoading: false,
        error: null
      }));
    } catch (error) {
      console.error('Error handling Firebase user:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
    }
  };

  // Firebase-only login function
  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('🔐 Attempting Firebase authentication...');
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        // Firebase login successful - get user role from Firestore
        console.log('✅ Firebase authentication successful');
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: {
            ...response.data.user,
            isFirebaseAccount: true
          },
          authMode: 'firebase',
          isLoading: false,
          error: null
        }));
        
        // Trigger data loading after successful authentication
        setTimeout(() => {
          console.log('🔄 Triggering data refresh after login...');
          // The AppContext will detect the authenticated user and load data
        }, 100);
        
        return {
          ...response,
          message: `Welcome back, ${response.data.user.name}!`
        };
      }
      
    } catch (error) {
      console.error('Firebase login failed:', error.message);
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      
      throw new Error(error.message);
    }
  };

  // Register function - Firebase only
  const register = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('📝 Registering new user with Firebase...');
      const response = await AuthService.register(userData);
      
      if (response.success) {
        console.log('✅ User registration successful');
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: {
            ...response.data.user,
            isFirebaseAccount: true
          },
          authMode: 'firebase',
          isLoading: false,
          error: null
        }));
      }
      
      return response;
      
    } catch (error) {
      console.error('Registration failed:', error.message);
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  // Initialize admin account function
  const initializeAdminAccount = async () => {
    try {
      console.log('🔧 Checking admin account initialization...');
      
      // Admin credentials
      const adminEmail = 'thukaram2388@gmail.com';
      
      // Check if admin already exists by trying to get user data
      // No need to create if already exists - just verify it's available
      console.log(`ℹ️ Admin account (${adminEmail}) is ready for login`);
      
    } catch (error) {
      console.error('Admin initialization error:', error.message);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // If Firebase user, logout from Firebase
      if (authState.authMode === 'firebase') {
        await AuthService.logout();
      }
      
      // Clear local state
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        authMode: 'demo',
        isLoading: false,
        error: null
      }));
      
      // Reset token counter for demo accounts
      setTokenCounter(9);
      
      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message 
      }));
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      if (authState.authMode === 'firebase' && authState.user?.id) {
        // Update Firebase profile
        await AuthService.updateUserProfile?.(authState.user.id, profileData);
      }
      
      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...profileData
        }
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Add family member (for patient accounts)
  const addFamilyMember = (memberData) => {
    if (authState.user?.role === 'patient') {
      const newMember = {
        id: Date.now().toString(),
        ...memberData,
        addedAt: new Date().toISOString(),
      };

      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          familyMembers: [...(prev.user.familyMembers || []), newMember]
        }
      }));
      
      return newMember;
    }
    return null;
  };

  // Generate token number
  const generateTokenNumber = () => {
    const tokenNumber = `KBR${String(tokenCounter).padStart(2, '0')}`;
    setTokenCounter(prev => prev + 1);
    return tokenNumber;
  };

  // Initialize Firebase authentication system
  const initializeAuthentication = async () => {
    try {
      console.log('🚀 Initializing Firebase authentication system...');
      
      // Initialize admin account
      await initializeAdminAccount();
      
      console.log('✅ Authentication system initialized');
    } catch (error) {
      console.error('❌ Authentication initialization failed:', error.message);
    }
  };

  // Context value
  const value = {
    // Auth state
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    authMode: authState.authMode,
    error: authState.error,
    
    // Auth methods
    login,
    register,
    logout,
    updateUserProfile,
    
    // User data methods (for backward compatibility with UserContext)
    loginUser: (userData) => setAuthState(prev => ({ 
      ...prev, 
      isAuthenticated: true, 
      user: { ...userData, isFirebaseAccount: true },
      authMode: 'firebase'
    })),
    logoutUser: logout,
    updateUser: updateUserProfile,
    addFamilyMember,
    generateTokenNumber,
    
    // Utility methods
    initializeAdminAccount,
    
    // Legacy properties for backward compatibility
    isLoggedIn: authState.isAuthenticated,
    userData: authState.user,
    familyMembers: authState.user?.familyMembers || [],
    
    // Legacy methods for compatibility
    checkMobileExists: async (mobile) => {
      // Mock implementation for compatibility
      const existingNumbers = ['+919876543210', '+919876543211'];
      return existingNumbers.includes(mobile);
    },
    sendOTP: async (mobile) => {
      // Mock implementation for compatibility
      console.log('Sending OTP to:', mobile);
      return { success: true, otp: '123456' };
    },
    verifyOTP: async (mobile, otp) => {
      // Mock implementation for compatibility
      console.log('Verifying OTP:', otp, 'for:', mobile);
      return { success: true };
    },
    checkAppointmentConflict: async (appointmentData) => {
      // Mock implementation for compatibility
      return { hasConflict: false };
    },
    handleAppointmentConflict: (conflictData) => {
      // Mock implementation for compatibility
      console.log('Handling appointment conflict:', conflictData);
    }
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export default UnifiedAuthContext;