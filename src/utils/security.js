// Security utility functions for the KBR Hospital app

import { Alert } from 'react-native';

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
};

// Validate phone number format and sanitize
export const sanitizePhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Indian phone number validation
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  
  if (indianPhoneRegex.test(cleaned)) {
    return cleaned;
  }
  
  return '';
};

// Email validation and sanitization
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  const cleaned = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(cleaned)) {
    return cleaned;
  }
  
  return '';
};

// Name sanitization (remove special characters, keep only letters and spaces)
export const sanitizeName = (name) => {
  if (!name) return '';
  
  return name
    .replace(/[^a-zA-Z\s\.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Secure data storage keys
export const STORAGE_KEYS = {
  USER_TOKEN: '@kbr_hospital:user_token',
  USER_DATA: '@kbr_hospital:user_data',
  PREFERENCES: '@kbr_hospital:preferences',
  CACHE: '@kbr_hospital:cache',
};

// Data validation for API requests
export const validateApiData = (data, requiredFields = []) => {
  const errors = [];
  
  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field] || data[field] === '') {
      errors.push(`${field} is required`);
    }
  });
  
  // Sanitize all string fields
  const sanitizedData = {};
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') {
      sanitizedData[key] = sanitizeInput(data[key]);
    } else {
      sanitizedData[key] = data[key];
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
};

// Secure API request headers
export const getSecureHeaders = (authToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Patient data validation
export const validatePatientData = (patientData) => {
  const requiredFields = ['name', 'phone', 'email'];
  const validation = validateApiData(patientData, requiredFields);
  
  if (!validation.isValid) {
    return validation;
  }
  
  // Additional patient-specific validations
  const { sanitizedData } = validation;
  const errors = [];
  
  // Validate phone number
  if (sanitizedData.phone && !sanitizePhoneNumber(sanitizedData.phone)) {
    errors.push('Invalid phone number format');
  }
  
  // Validate email
  if (sanitizedData.email && !sanitizeEmail(sanitizedData.email)) {
    errors.push('Invalid email format');
  }
  
  // Validate name
  if (sanitizedData.name && sanitizedData.name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      ...sanitizedData,
      phone: sanitizePhoneNumber(sanitizedData.phone),
      email: sanitizeEmail(sanitizedData.email),
      name: sanitizeName(sanitizedData.name),
    },
  };
};

// Appointment data validation
export const validateAppointmentData = (appointmentData) => {
  const requiredFields = ['patientName', 'service', 'date', 'time'];
  const validation = validateApiData(appointmentData, requiredFields);
  
  if (!validation.isValid) {
    return validation;
  }
  
  const { sanitizedData } = validation;
  const errors = [];
  
  // Validate appointment date (must be in future)
  if (sanitizedData.date) {
    const appointmentDate = new Date(sanitizedData.date);
    const now = new Date();
    
    if (appointmentDate <= now) {
      errors.push('Appointment date must be in the future');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData,
  };
};

// Security alert for suspicious activity
export const showSecurityAlert = (message = 'Security validation failed') => {
  Alert.alert(
    'Security Notice',
    message,
    [{ text: 'OK', style: 'default' }],
    { cancelable: false }
  );
};

// Rate limiting helper
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  getRemainingRequests(key) {
    const userRequests = this.requests.get(key) || [];
    const now = Date.now();
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Global rate limiter instance
export const globalRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

// Secure local storage wrapper
export const SecureStorage = {
  // Store data securely
  setItem: async (key, value) => {
    try {
      // In a real app, you might want to encrypt sensitive data
      const serializedValue = JSON.stringify(value);
      // Use AsyncStorage or secure storage library
      return Promise.resolve(serializedValue);
    } catch (error) {
      console.error('Secure storage set error:', error);
      return Promise.reject(error);
    }
  },
  
  // Retrieve data securely
  getItem: async (key) => {
    try {
      // In a real app, you might want to decrypt data
      // const encryptedValue = await AsyncStorage.getItem(key);
      // return decrypt(encryptedValue);
      return Promise.resolve(null);
    } catch (error) {
      console.error('Secure storage get error:', error);
      return Promise.resolve(null);
    }
  },
  
  // Remove data
  removeItem: async (key) => {
    try {
      // await AsyncStorage.removeItem(key);
      return Promise.resolve();
    } catch (error) {
      console.error('Secure storage remove error:', error);
      return Promise.reject(error);
    }
  },
};

export default {
  sanitizeInput,
  sanitizePhoneNumber,
  sanitizeEmail,
  sanitizeName,
  validateApiData,
  validatePatientData,
  validateAppointmentData,
  getSecureHeaders,
  showSecurityAlert,
  globalRateLimiter,
  SecureStorage,
  STORAGE_KEYS,
};