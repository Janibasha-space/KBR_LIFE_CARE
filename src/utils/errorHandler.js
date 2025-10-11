import { Alert } from 'react-native';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTH: 'AUTH_ERROR',
  SERVER: 'SERVER_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

// Error messages
const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'Network connection failed. Please check your internet connection.',
  [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
  [ERROR_TYPES.AUTH]: 'Authentication failed. Please login again.',
  [ERROR_TYPES.SERVER]: 'Server error occurred. Please try again later.',
  [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.',
};

// Error handling utility class
export class ErrorHandler {
  // Log error for debugging
  static logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${context}: ${error.message || error}`;
    
    if (__DEV__) {
      console.error(logMessage, error);
    }
    
    // In production, you might want to send errors to a logging service
    // this.sendToLoggingService(error, context);
  }

  // Determine error type
  static getErrorType(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return ERROR_TYPES.NETWORK;
    }
    
    if (error.status === 401 || error.status === 403) {
      return ERROR_TYPES.AUTH;
    }
    
    if (error.status >= 500) {
      return ERROR_TYPES.SERVER;
    }
    
    if (error.status >= 400 && error.status < 500) {
      return ERROR_TYPES.VALIDATION;
    }
    
    return ERROR_TYPES.UNKNOWN;
  }

  // Get user-friendly error message
  static getUserMessage(error) {
    const errorType = this.getErrorType(error);
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
  }

  // Handle error with user notification
  static handleError(error, context = '', showAlert = true) {
    this.logError(error, context);
    
    if (showAlert) {
      const userMessage = this.getUserMessage(error);
      Alert.alert('Error', userMessage);
    }
  }

  // Handle API errors specifically
  static handleApiError(error, context = '') {
    this.logError(error, `API Error - ${context}`);
    
    const errorType = this.getErrorType(error);
    let title = 'Error';
    let message = this.getUserMessage(error);
    
    switch (errorType) {
      case ERROR_TYPES.NETWORK:
        title = 'Connection Error';
        break;
      case ERROR_TYPES.AUTH:
        title = 'Authentication Error';
        break;
      case ERROR_TYPES.SERVER:
        title = 'Server Error';
        break;
      default:
        title = 'Error';
    }
    
    Alert.alert(title, message);
  }

  // Safe async operation wrapper
  static async safeAsync(operation, errorContext = '', fallbackValue = null) {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, errorContext, false);
      return fallbackValue;
    }
  }

  // Safe sync operation wrapper
  static safe(operation, errorContext = '', fallbackValue = null) {
    try {
      return operation();
    } catch (error) {
      this.handleError(error, errorContext, false);
      return fallbackValue;
    }
  }
}

// Utility functions for common error scenarios
export const handleServiceError = (error, serviceName) => {
  ErrorHandler.handleApiError(error, `${serviceName} Service`);
};

export const handleContextError = (error, contextName) => {
  ErrorHandler.logError(error, `${contextName} Context`);
  // Return safe fallback data for context errors
  return null;
};

export const safeParseJson = (jsonString, fallback = {}) => {
  return ErrorHandler.safe(
    () => JSON.parse(jsonString),
    'JSON Parse',
    fallback
  );
};

export default ErrorHandler;