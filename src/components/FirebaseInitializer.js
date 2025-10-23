import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { FirebaseAuthService } from '../services/firebaseAuthService';
import { auth } from '../config/firebase.config';

const FirebaseInitializer = ({ children, onInitialized }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        console.log('🔥 Initializing Firebase Authentication...');
        
        // Check if user is already authenticated
        if (auth.currentUser) {
          console.log('✅ User already authenticated:', auth.currentUser.uid);
          setIsInitializing(false);
          if (onInitialized) onInitialized(true);
          return;
        }

        // Skip automatic authentication for now
        console.log('🔐 Skipping automatic authentication - will authenticate on demand');
        console.log('✅ Firebase initialization complete!');
        setIsInitializing(false);
        if (onInitialized) onInitialized(true);
        
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        console.log('⚠️ Continuing without authentication - check Firebase rules');
        // Don't block the app, continue anyway
        setIsInitializing(false);
        if (onInitialized) onInitialized(true);
      }
    };

    // Small delay to ensure Firebase is ready
    const timer = setTimeout(initializeFirebase, 1000);
    
    return () => clearTimeout(timer);
  }, [onInitialized]);

  if (isInitializing) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{
          marginTop: 20,
          fontSize: 16,
          color: '#666',
          textAlign: 'center'
        }}>
          🔥 Initializing Firebase...
        </Text>
        <Text style={{
          marginTop: 10,
          fontSize: 12,
          color: '#999',
          textAlign: 'center'
        }}>
          Setting up authentication
        </Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20
      }}>
        <Text style={{
          fontSize: 18,
          color: '#f44336',
          textAlign: 'center',
          marginBottom: 10
        }}>
          ❌ Firebase Initialization Failed
        </Text>
        <Text style={{
          fontSize: 14,
          color: '#666',
          textAlign: 'center',
          marginBottom: 20
        }}>
          {initError}
        </Text>
        <Text style={{
          fontSize: 12,
          color: '#999',
          textAlign: 'center'
        }}>
          Please check your Firebase configuration and try again.
        </Text>
      </View>
    );
  }

  return children;
};

export default FirebaseInitializer;