import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>KBR Life Care - Hospital App</Text>
      <Text style={styles.subtitle}>App is working! 🎉</Text>
      
      <View style={styles.box} />
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Test Alert" 
          onPress={() => Alert.alert('Success!', 'The app is working perfectly!')} 
        />
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  box: {
    width: 80,
    height: 80,
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 10,
    width: '100%',
    maxWidth: 200,
  },
});