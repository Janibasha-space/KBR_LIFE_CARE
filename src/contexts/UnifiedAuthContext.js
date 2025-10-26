import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from '../services/authService';

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
  
  // Note: AppContext integration handled separately to avoid circular dependencies

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
      
      console.log('🚪 Starting unified logout process...');
      
      // If Firebase user, logout from Firebase
      if (authState.authMode === 'firebase') {
        console.log('🔥 Logging out from Firebase...');
        await AuthService.logout();
      }
      
      // Clear AsyncStorage data (including any cached user data)
      try {
        await AsyncStorage.multiRemove([
          'firebase:authUser',
          'firebase:host:kbr-life-care--hospitals.firebaseapp.com',
          'firebaseLocalStorageDb',
          'userToken',
          'userData',
          'isLoggedIn',
          'userContext',
          'adminData',
          'patientData'
        ]);
        console.log('🗑️ Cleared all cached authentication and user data');
      } catch (storageError) {
        console.warn('⚠️ Error clearing storage:', storageError);
      }
      
      // Clear local state completely FIRST to trigger auth state change immediately
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        authMode: 'demo',
        error: null
      });
      
      // Reset token counter for demo accounts
      setTokenCounter(9);
      
      console.log('✅ Unified logout completed successfully - all user sessions cleared');
      
      // Add a small delay to ensure the auth state change is processed
      setTimeout(() => {
        console.log('🔄 Auth state change should have triggered listener cleanup');
      }, 100);
      
      return { success: true, message: 'Logged out successfully from all accounts' };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Even if logout fails, clear local state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        authMode: 'demo',
        error: null
      });
      
      console.log('🧹 Force logout completed - local state cleared');
      return { success: true, message: 'Logout completed (with cleanup)' };
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      console.log('🔄 UnifiedAuth: Starting profile update...', {
        authMode: authState.authMode,
        userId: authState.user?.id,
        hasProfileImage: !!profileData.profileImage
      });

      if (authState.authMode === 'firebase' && authState.user?.id) {
        // Update Firebase profile
        console.log('🔥 Updating Firebase profile...');
        await AuthService.updateUserProfile(authState.user.id, profileData);
        console.log('✅ Firebase profile updated successfully');
      }
      
      // Update local state with merged data
      const updatedUser = {
        ...authState.user,
        userData: {
          ...authState.user?.userData,
          ...profileData
        }
      };

      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      console.log('✅ Local auth state updated successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Profile update error:', error);
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
    handleAppointmentConflict: async (conflictData) => {
      // Mock implementation for compatibility
      console.log('Handling appointment conflict:', conflictData);
      return { success: false, message: 'Conflict handling disabled' };
    },
    
    // Appointment management functions
    getUpcomingAppointments: (appointmentsData = []) => {
      if (!authState.isAuthenticated) {
        console.log('📋 User not authenticated, returning empty appointments');
        return [];
      }
      
      // Use provided appointments data or fallback to user appointments
      const appointments = appointmentsData.length > 0 ? appointmentsData : (authState.user?.appointments || []);
      const userId = authState.user?.id;
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Set to start of day for proper comparison
      
      console.log(`📋 Found ${appointments.length} total appointments for user ${userId}`);
      
      const upcoming = appointments
        .filter(appointment => {
          // First filter by user ID - be more flexible with matching
          const appointmentUserId = appointment.patientId || appointment.userId;
          
          if (appointmentUserId !== userId) {
            return false;
          }
          
          try {
            // Handle different date formats more flexibly
            let appointmentDate;
            
            if (appointment.appointmentDate) {
              // appointmentDate format could be "2025-10-25 10:00 AM" or just "2025-10-25"
              const dateStr = appointment.appointmentDate.split(' ')[0]; // Get just the date part
              appointmentDate = new Date(dateStr);
            } else if (appointment.date) {
              appointmentDate = new Date(appointment.date);
            } else {
              console.warn('⚠️ No date found in appointment:', appointment);
              return false;
            }
            
            // Check if date is valid
            if (isNaN(appointmentDate.getTime())) {
              console.warn('⚠️ Invalid date in appointment:', appointment);
              return false;
            }
            
            const isUpcoming = appointmentDate >= now;
            // Be more flexible with status - accept multiple status values
            const validStatuses = ['confirmed', 'scheduled', 'pending', 'booked', 'active'];
            const isActive = !appointment.status || validStatuses.includes(appointment.status.toLowerCase());
            
            return isUpcoming && isActive;
          } catch (error) {
            console.warn('⚠️ Error parsing appointment date:', appointment, error);
            return false;
          }
        })
        .map(appointment => {
          // Normalize appointment data for UI
          return {
            ...appointment,
            date: appointment.date || (appointment.appointmentDate ? appointment.appointmentDate.split(' ')[0] : ''),
            time: appointment.time || (appointment.appointmentDate ? appointment.appointmentDate.split(' ')[1] : ''),
            doctorName: appointment.doctorName || appointment.doctor || 'Dr. Unknown',
            serviceName: appointment.serviceName || appointment.service || 'General Consultation'
          };
        });
      
      console.log(`📅 Returning ${upcoming.length} upcoming appointments:`, upcoming);
      return upcoming;
    },
    
    getPastAppointments: (appointmentsData = []) => {
      if (!authState.isAuthenticated) {
        console.log('📋 User not authenticated, returning empty appointments');
        return [];
      }
      
      // Use provided appointments data or fallback to user appointments
      const appointments = appointmentsData.length > 0 ? appointmentsData : (authState.user?.appointments || []);
      const userId = authState.user?.id;
      
      const now = new Date();
      now.setHours(23, 59, 59, 999); // Set to end of day for proper comparison
      
      console.log(`📋 Found ${appointments.length} total appointments for user ${userId}`);
      
      const past = appointments
        .filter(appointment => {
          // First filter by user ID
          const appointmentUserId = appointment.patientId || appointment.userId;
          
          if (appointmentUserId !== userId) {
            return false;
          }
          
          try {
            // Handle different date formats
            let appointmentDate;
            
            if (appointment.appointmentDate) {
              // appointmentDate format could be "2025-10-25 10:00 AM" or just "2025-10-25"
              const dateStr = appointment.appointmentDate.split(' ')[0]; // Get just the date part
              appointmentDate = new Date(dateStr);
            } else if (appointment.date) {
              appointmentDate = new Date(appointment.date);
            } else {
              console.warn('⚠️ No date found in past appointment:', appointment);
              return false;
            }
            
            // Check if date is valid
            if (isNaN(appointmentDate.getTime())) {
              console.warn('⚠️ Invalid date in past appointment:', appointment);
              return false;
            }
            
            const isPast = appointmentDate < now;
            // Be more flexible with completed status
            const completedStatuses = ['completed', 'cancelled', 'finished', 'done'];
            const isCompleted = appointment.status && completedStatuses.includes(appointment.status.toLowerCase());
            
            return isPast || isCompleted;
          } catch (error) {
            console.warn('⚠️ Error parsing appointment date:', appointment, error);
            return false;
          }
        })
        .map(appointment => {
          // Normalize appointment data for UI
          return {
            ...appointment,
            date: appointment.date || (appointment.appointmentDate ? appointment.appointmentDate.split(' ')[0] : ''),
            time: appointment.time || (appointment.appointmentDate ? appointment.appointmentDate.split(' ')[1] : ''),
            doctorName: appointment.doctorName || appointment.doctor || 'Dr. Unknown',
            serviceName: appointment.serviceName || appointment.service || 'General Consultation'
          };
        });
      
      console.log(`📜 Returning ${past.length} past appointments`);
      return past;
    },
    
    cancelAppointment: async (appointmentId) => {
      try {
        console.log('Cancelling appointment:', appointmentId);
        // Update local state
        setAuthState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            appointments: prev.user?.appointments?.map(apt => 
              apt.id === appointmentId 
                ? { ...apt, status: 'cancelled', updatedAt: new Date().toISOString() }
                : apt
            ) || []
          }
        }));
        return { success: true, message: 'Appointment cancelled successfully' };
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
        return { success: false, message: 'Failed to cancel appointment' };
      }
    },

    // Add appointment to user's data (called when booking is successful)
    addUserAppointment: (appointmentData) => {
      if (!authState.isAuthenticated) {
        console.warn('⚠️ Cannot add appointment: user not authenticated');
        return;
      }
      
      console.log('📝 Adding appointment to user data:', appointmentData);
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          appointments: [
            ...(prev.user?.appointments || []),
            {
              ...appointmentData,
              addedAt: new Date().toISOString()
            }
          ]
        }
      }));
    },

    // Add test appointments for debugging (remove in production)
    addTestAppointments: () => {
      if (!authState.isAuthenticated) {
        console.warn('⚠️ Cannot add test appointments: user not authenticated');
        return;
      }

      const testAppointments = [
        {
          id: "test-001",
          patientId: authState.user?.id,
          serviceName: "General Consultation",
          doctorName: "Dr. John Smith",
          appointmentDate: "2025-10-25 10:00 AM",
          date: "2025-10-25",
          time: "10:00 AM",
          tokenNumber: "KBR-001",
          status: "scheduled",
          createdAt: new Date().toISOString(),
          amount: 500,
          paymentType: "hospital"
        },
        {
          id: "test-002",
          patientId: authState.user?.id,
          serviceName: "Cardiology Consultation",
          doctorName: "Dr. Sarah Johnson",
          appointmentDate: "2025-10-27 02:00 PM",
          date: "2025-10-27",
          time: "02:00 PM",
          tokenNumber: "KBR-002",
          status: "scheduled",
          createdAt: new Date().toISOString(),
          amount: 800,
          paymentType: "online"
        },
        {
          id: "test-003",
          patientId: authState.user?.id,
          serviceName: "Blood Test",
          doctorName: "Dr. Mike Wilson",
          appointmentDate: "2025-10-20 09:00 AM",
          date: "2025-10-20",
          time: "09:00 AM",
          tokenNumber: "KBR-003",
          status: "completed",
          createdAt: "2025-10-18T17:28:48.454Z",
          amount: 300,
          paymentType: "hospital"
        }
      ];

      console.log('🧪 Adding test appointments for user:', authState.user?.id);
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          appointments: testAppointments
        }
      }));

      console.log('✅ Test appointments added successfully');
    },

    // Get hospital admissions for the authenticated user
    getHospitalAdmissions: (admissionsData = []) => {
      if (!authState.isAuthenticated) {
        console.warn('⚠️ User not authenticated for admissions');
        return [];
      }

      const userId = authState.user?.id;
      return admissionsData.filter(admission => admission.patientId === userId);
    },

    // Get test appointments (lab tests, diagnostics) for the authenticated user  
    getTestAppointments: (testAppointmentsData = []) => {
      if (!authState.isAuthenticated) {
        console.warn('⚠️ User not authenticated for test appointments');
        return [];
      }

      const userId = authState.user?.id;
      return testAppointmentsData.filter(testAppt => testAppt.patientId === userId);
    }
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export default UnifiedAuthContext;