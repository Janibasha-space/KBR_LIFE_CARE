import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FirebaseDebugHelper } from '../utils/firebaseDebug';
import { FirebaseDoctorService } from '../services/firebaseHospitalServices';
import { auth } from '../config/firebase.config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const FirebaseTestScreen = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { message, type, timestamp }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const runFullDiagnosis = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('🔍 Starting Firebase diagnosis...', 'info');
      
      const diagnosis = await FirebaseDebugHelper.runDiagnosis();
      
      addResult(`Auth Status: ${diagnosis.authState.isAuthenticated ? '✅ OK' : '❌ FAILED'}`, 
        diagnosis.authState.isAuthenticated ? 'success' : 'error');
      
      addResult(`Firestore Access: ${diagnosis.firestoreTest.success ? '✅ OK' : '❌ FAILED'}`, 
        diagnosis.firestoreTest.success ? 'success' : 'error');
      
      addResult(`Recommendation: ${diagnosis.recommendation}`, 'info');
      
      if (!diagnosis.authState.isAuthenticated) {
        addResult('ℹ️ Try the "Login Test User" button below', 'info');
      }
      
    } catch (error) {
      addResult(`❌ Diagnosis failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testDoctorsFetch = async () => {
    setLoading(true);
    
    try {
      addResult('📋 Testing doctors fetch...', 'info');
      
      const result = await FirebaseDoctorService.getDoctors();
      
      if (result.success) {
        addResult(`✅ Doctors fetched successfully! Found ${result.data.length} doctors`, 'success');
      } else {
        addResult('❌ Failed to fetch doctors', 'error');
      }
      
    } catch (error) {
      addResult(`❌ Doctor fetch error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testDoctorCreation = async () => {
    setLoading(true);
    
    try {
      addResult('👨‍⚕️ Testing doctor creation...', 'info');
      
      const testDoctor = {
        name: `Dr. Test ${Date.now()}`,
        specialty: 'General Medicine',
        email: `test${Date.now()}@hospital.com`,
        phone: '+1234567890',
        experience: 5,
        qualification: 'MBBS',
        available: true
      };
      
      const result = await FirebaseDoctorService.createDoctor(testDoctor);
      
      if (result.success) {
        addResult(`✅ Doctor created successfully! ID: ${result.data.id}`, 'success');
      } else {
        addResult('❌ Failed to create doctor', 'error');
      }
      
    } catch (error) {
      addResult(`❌ Doctor creation error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginTestUser = async () => {
    setLoading(true);
    
    try {
      addResult('🔐 Attempting to login test user...', 'info');
      
      const testEmail = 'test@kbrlifecare.com';
      const testPassword = 'test123456';
      
      try {
        // Try to login first
        await signInWithEmailAndPassword(auth, testEmail, testPassword);
        addResult('✅ Test user logged in successfully!', 'success');
      } catch (loginError) {
        if (loginError.code === 'auth/user-not-found') {
          addResult('👤 Test user not found, creating new user...', 'info');
          
          // Create test user
          await createUserWithEmailAndPassword(auth, testEmail, testPassword);
          addResult('✅ Test user created and logged in!', 'success');
        } else {
          throw loginError;
        }
      }
      
      // Verify auth state
      setTimeout(() => {
        if (auth.currentUser) {
          addResult(`✅ User authenticated: ${auth.currentUser.email}`, 'success');
          addResult('🎯 Now try running the diagnosis again!', 'info');
        }
      }, 1000);
      
    } catch (error) {
      addResult(`❌ Login error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  const getResultColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
          🔥 Firebase Debug Center
        </Text>
        
        <View style={{ marginBottom: 20 }}>
          <TouchableOpacity
            onPress={runFullDiagnosis}
            disabled={loading}
            style={{
              backgroundColor: '#2196F3',
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
              opacity: loading ? 0.6 : 1
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              🔍 Run Full Diagnosis
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={loginTestUser}
            disabled={loading}
            style={{
              backgroundColor: '#4CAF50',
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
              opacity: loading ? 0.6 : 1
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              🔐 Login Test User
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={testDoctorsFetch}
            disabled={loading}
            style={{
              backgroundColor: '#FF9800',
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
              opacity: loading ? 0.6 : 1
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              📋 Test Doctors Fetch
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={testDoctorCreation}
            disabled={loading}
            style={{
              backgroundColor: '#9C27B0',
              padding: 15,
              borderRadius: 8,
              marginBottom: 10,
              opacity: loading ? 0.6 : 1
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
              👨‍⚕️ Test Doctor Creation
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={clearResults}
            style={{
              backgroundColor: '#757575',
              padding: 10,
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              🗑️ Clear Results
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Results Display */}
        <View style={{
          backgroundColor: 'white',
          borderRadius: 8,
          padding: 15,
          minHeight: 200
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            📊 Test Results:
          </Text>
          
          {results.length === 0 ? (
            <Text style={{ color: '#666', fontStyle: 'italic' }}>
              No results yet. Run a test to see output here.
            </Text>
          ) : (
            results.map((result, index) => (
              <View key={index} style={{
                borderLeftWidth: 3,
                borderLeftColor: getResultColor(result.type),
                paddingLeft: 10,
                paddingVertical: 5,
                marginBottom: 8,
                backgroundColor: '#f9f9f9'
              }}>
                <Text style={{ fontSize: 12, color: '#666' }}>{result.timestamp}</Text>
                <Text style={{ color: getResultColor(result.type) }}>
                  {result.message}
                </Text>
              </View>
            ))
          )}
        </View>
        
        {loading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10
            }}>
              <Text style={{ textAlign: 'center' }}>Running test...</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default FirebaseTestScreen;