import React, { useEffect } from 'react';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import { useApp } from '../contexts/AppContext';

/**
 * Integration wrapper that connects authentication with app data management
 * This component handles real-time listener setup after successful authentication
 */
const AuthIntegrationWrapper = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useUnifiedAuth();
  const { setupRealTimeListeners } = useApp();

  // Set up real-time listeners when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && user) {
      console.log('🔗 Authentication successful - setting up real-time data listeners...');
      
      // Small delay to ensure Firebase auth state is fully propagated
      setTimeout(() => {
        setupRealTimeListeners();
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, setupRealTimeListeners]);

  return children;
};

export default AuthIntegrationWrapper;