import ApiService from './api';
import { FirebaseAuthService } from './firebaseAuthService';

export class AuthService {
  // Login user
  static async login(credentials) {
    try {
      // Use Firebase Authentication
      if (ApiService.useFirebase) {
        return await FirebaseAuthService.login(credentials);
      }
      
      // Fallback to REST API
      const response = await ApiService.post('/auth/login', credentials);
      
      if (response.token) {
        // Store the authentication token
        await ApiService.setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // Register new user
  static async register(userData) {
    try {
      // Use Firebase Authentication
      if (ApiService.useFirebase) {
        return await FirebaseAuthService.register(userData);
      }
      
      // Fallback to REST API
      const response = await ApiService.post('/auth/register', userData);
      
      if (response.token) {
        // Store the authentication token
        await ApiService.setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Logout user
  static async logout() {
    try {
      console.log('🚪 Starting auth service logout...');
      
      // Use Firebase Authentication
      if (ApiService.useFirebase) {
        const result = await FirebaseAuthService.logout();
        console.log('✅ Firebase logout completed');
        return result;
      }
      
      // Fallback to REST API
      try {
        await ApiService.post('/auth/logout');
        console.log('✅ REST API logout completed');
      } catch (apiError) {
        console.warn('⚠️ REST API logout failed:', apiError.message);
        // Continue with local cleanup even if API call fails
      }
      
      return {
        success: true,
        message: 'Logout completed successfully'
      };
    } catch (error) {
      console.error('Auth service logout error:', error);
      
      // Still return success to allow local cleanup
      return {
        success: true,
        message: 'Logout completed (with local cleanup)'
      };
    } finally {
      // Always clear local token for REST API
      if (!ApiService.useFirebase) {
        try {
          await ApiService.setAuthToken(null);
          console.log('🗑️ Cleared local auth token');
        } catch (tokenError) {
          console.warn('⚠️ Error clearing local token:', tokenError);
        }
      }
    }
  }

  // Check if user is authenticated
  static async isAuthenticated() {
    if (ApiService.useFirebase) {
      return FirebaseAuthService.isAuthenticated();
    }
    
    const token = await ApiService.getAuthToken();
    return !!token;
  }

  // Get current user
  static getCurrentUser() {
    if (ApiService.useFirebase) {
      return FirebaseAuthService.getCurrentUser();
    }
    return null;
  }

  // Verify token with backend
  static async verifyToken() {
    try {
      if (ApiService.useFirebase) {
        return await FirebaseAuthService.verifyToken();
      }
      
      const response = await ApiService.get('/auth/verify');
      return response.valid;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  // Forgot password
  static async forgotPassword(email) {
    try {
      if (ApiService.useFirebase) {
        return await FirebaseAuthService.forgotPassword(email);
      }
      
      return await ApiService.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password failed:', error);
      throw error;
    }
  }

  // Listen to authentication state changes (Firebase only)
  static onAuthStateChanged(callback) {
    if (ApiService.useFirebase) {
      return FirebaseAuthService.onAuthStateChanged(callback);
    }
    return () => {}; // Return empty unsubscribe function for non-Firebase
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    try {
      return await ApiService.post('/auth/reset-password', {
        token,
        newPassword
      });
    } catch (error) {
      console.error('Reset password failed:', error);
      throw error;
    }
  }
}

export default AuthService;