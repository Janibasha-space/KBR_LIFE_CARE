// API configuration and base service functions
import { getApiConfig } from '../config/api.config';
import { auth, db } from '../config/firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  constructor() {
    const config = getApiConfig();
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.useFirebase = true; // Flag to use Firebase instead of REST API
  }

  // Get current Firebase user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Get Firebase auth token
  async getFirebaseToken() {
    try {
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      return null;
    }
  }

  // Get stored auth token (fallback for REST API)
  async getAuthToken() {
    try {
      if (this.useFirebase) {
        return await this.getFirebaseToken();
      }
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Set auth token (fallback for REST API)
  async setAuthToken(token) {
    try {
      if (!this.useFirebase && token) {
        await AsyncStorage.setItem('authToken', token);
      } else if (!this.useFirebase) {
        await AsyncStorage.removeItem('authToken');
      }
      // For Firebase, auth state is managed automatically
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get auth token
    const token = await this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      timeout: this.timeout,
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Handle different HTTP error statuses
        switch (response.status) {
          case 401:
            // Unauthorized - clear token and redirect to login
            await this.setAuthToken(null);
            throw new Error('Authentication required');
          case 403:
            throw new Error('Access forbidden');
          case 404:
            throw new Error('Resource not found');
          case 500:
            throw new Error('Server error');
          default:
            throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiService();