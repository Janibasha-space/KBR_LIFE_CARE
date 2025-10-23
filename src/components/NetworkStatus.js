import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NetworkStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
      
      // Show status briefly when it changes
      if (!connected) {
        setShowStatus(true);
        // Keep showing if offline
      } else {
        // Hide after 3 seconds when back online
        setTimeout(() => setShowStatus(false), 3000);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!showStatus) return null;

  return (
    <View style={[styles.container, isConnected ? styles.online : styles.offline]}>
      <Text style={styles.text}>
        {isConnected ? '🌐 Connected' : '📱 Offline Mode'}
      </Text>
      {!isConnected && (
        <Text style={styles.subtitle}>
          Bookings will sync when connection is restored
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#FF9800',
  },
  text: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default NetworkStatus;