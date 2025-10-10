/**
 * KBR LIFE CARE HOSPITALS - PATIENT HOME SCREEN
 * Enhanced Patient Home Screen matching screenshot design
 * Theme: Blue (#4A90E2), White (#FFFFFF), Professional styling
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Modal,
  TextInput,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PatientHomeScreen = ({ navigation }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleServicePress = (serviceName) => {
    if (serviceName === 'Book Appointment') {
      Alert.alert(
        'Book Appointment',
        'Choose your preferred booking method:',
        [
          { text: 'Online Booking', onPress: () => navigation.navigate('BookAppointment') },
          { text: 'Call Hospital', onPress: () => Alert.alert('Call Now', '+91 8466 999 000') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else if (serviceName === 'Services') {
      navigation.navigate('Services');
    } else if (serviceName === 'Reports') {
      navigation.navigate('Reports');
    } else if (serviceName === 'Pharmacy') {
      navigation.navigate('Pharmacy');
    }
  };

  const handleLogin = (email, password) => {
    // Admin login
    if (email === 'admin@kbrhospitals.com' && password === 'admin123') {
      setShowLoginModal(false);
      Alert.alert(
        'Admin Login Successful! 🎉',
        'Welcome to KBR Hospital Admin Dashboard',
        [
          { 
            text: 'Continue to Dashboard', 
            onPress: () => navigation.navigate('AdminMain'),
            style: 'default'
          }
        ]
      );
    }
    // Patient login
    else if (email === 'patient@kbr.com' && password === 'patient123') {
      setShowLoginModal(false);
      Alert.alert(
        'Patient Login Successful! 🎉',
        'Welcome to KBR Hospital Patient Portal',
        [
          { 
            text: 'Continue', 
            onPress: () => {
              // Already on patient screens, just show success
            },
            style: 'default'
          }
        ]
      );
    }
    // Invalid credentials
    else {
      Alert.alert(
        '❌ Invalid Credentials',
        'Please check your email and password.\n\nDemo Accounts:\n👨‍⚕️ Admin: admin@kbrhospitals.com / admin123\n🏥 Patient: patient@kbr.com / patient123',
        [{ text: 'Try Again', style: 'default' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4A90E2" barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.safeArea}>
        {/* Enhanced Professional Header */}
        <View style={styles.header}>
          {/* Top Header Row */}
          <View style={styles.topHeaderRow}>
            <View style={styles.hospitalBranding}>
              <View style={styles.logoSection}>
                <Ionicons name="medical" size={24} color="white" />
                <View style={styles.hospitalTextSection}>
                  <Text style={styles.hospitalName}>KBR LIFE CARE</Text>
                  <Text style={styles.hospitalSubtitle}>HOSPITALS</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.adminButton}
                onPress={() => {
                  Alert.alert(
                    '🔐 Admin Portal Access',
                    'Direct admin login for hospital staff',
                    [
                      { 
                        text: 'Admin Login', 
                        onPress: () => setShowLoginModal(true)
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color="white" />
                <Text style={styles.adminText}>Admin</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => setShowLoginModal(true)}
              >
                <Ionicons name="person-circle-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Header Row */}
          <View style={styles.bottomHeaderRow}>
            <Text style={styles.welcomeMessage}>Welcome to our healthcare family</Text>
            <Text style={styles.tagline}>Your Health, Our Priority • 24/7 Emergency Care</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome to KBR Hospital</Text>
            <Text style={styles.subtitle}>Your health, our priority</Text>
          </View>

          {/* Enhanced Service Cards */}
          <View style={styles.servicesContainer}>
            <TouchableOpacity 
              style={[styles.serviceCard, styles.appointmentCard]} 
              onPress={() => handleServicePress('Book Appointment')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="calendar" size={32} color="#4A90E2" />
              </View>
              <Text style={styles.serviceTitle}>Book Appointment</Text>
              <Text style={styles.serviceDescription}>Schedule with our experts</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceCard, styles.servicesCard]} 
              onPress={() => handleServicePress('Services')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="medical" size={32} color="#4A90E2" />
              </View>
              <Text style={styles.serviceTitle}>Services</Text>
              <Text style={styles.serviceDescription}>View all medical services</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceCard, styles.reportsCard]} 
              onPress={() => handleServicePress('Reports')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="document-text" size={32} color="#4A90E2" />
              </View>
              <Text style={styles.serviceTitle}>Reports</Text>
              <Text style={styles.serviceDescription}>Access your test results</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.serviceCard, styles.pharmacyCard]} 
              onPress={() => handleServicePress('Pharmacy')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="basket-outline" size={32} color="#4A90E2" />
              </View>
              <Text style={styles.serviceTitle}>Pharmacy</Text>
              <Text style={styles.serviceDescription}>Order medicines online</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Why Choose KBR Hospital?</Text>
            
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Expert Medical Care</Text>
                <Text style={styles.featureSubtitle}>Experienced doctors and specialists</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="time" size={24} color="#F59E0B" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>24/7 Emergency Services</Text>
                <Text style={styles.featureSubtitle}>Round-the-clock medical support</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="location" size={24} color="#EF4444" />
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Prime Location</Text>
                <Text style={styles.featureSubtitle}>Easily accessible in Sangareddy</Text>
              </View>
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.emergencySection}>
            <Text style={styles.emergencyTitle}>Medical Emergency?</Text>
            <Text style={styles.emergencySubtitle}>Call us immediately for urgent care</Text>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={() => Alert.alert('Emergency Call', 'Calling +91 8466 999 000...')}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Call Emergency: +91 8466 999 000</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Login Modal */}
        <Modal
          visible={showLoginModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Sign In to KBR Hospital</Text>
                <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.credentialsInfo}>
                <Text style={styles.credentialsTitle}>🔑 Demo Credentials:</Text>
                <Text style={styles.credentialsText}>Patient: patient@kbr.com / patient123</Text>
                <Text style={styles.credentialsText}>Admin: admin@kbrhospitals.com / admin123</Text>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => handleLogin(email, password)}
              >
                <Text style={styles.loginButtonText}>Sign In & Continue</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickFillButton}
                onPress={() => {
                  setEmail('admin@kbrhospitals.com');
                  setPassword('admin123');
                }}
              >
                <Text style={styles.quickFillText}>🔐 Quick Fill Admin Credentials</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.guestButton}
                onPress={() => {
                  setShowLoginModal(false);
                  setEmail('');
                  setPassword('');
                  Alert.alert('Guest Mode', 'Browsing as guest. Some features may be limited.');
                }}
              >
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Enhanced Professional Header Styles
  header: {
    backgroundColor: '#4A90E2',
    paddingTop: 15,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  // Top Header Row Styles
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  hospitalBranding: {
    flex: 1,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hospitalTextSection: {
    marginLeft: 12,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  hospitalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E3F2FD',
    letterSpacing: 1,
    marginTop: -2,
  },
  
  // Header Actions Styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  // Bottom Header Row Styles
  bottomHeaderRow: {
    paddingHorizontal: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
  },
  welcomeMessage: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 12,
    color: '#E3F2FD',
    fontWeight: '400',
    opacity: 0.9,
  },
  
  // Admin Button Styles
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  adminText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  
  // Profile Button Styles  
  profileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  signInText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Content
  content: {
    flex: 1,
    padding: 20,
  },
  
  // Welcome Section
  welcomeSection: {
    marginBottom: 30,
    alignItems: 'center',
    paddingVertical: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  
  // Services Container
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  appointmentCard: {
    borderTopColor: '#4A90E2',
    borderTopWidth: 3,
  },
  servicesCard: {
    borderTopColor: '#2196F3',
    borderTopWidth: 3,
  },
  reportsCard: {
    borderTopColor: '#FF9800',
    borderTopWidth: 3,
  },
  pharmacyCard: {
    borderTopColor: '#4CAF50',
    borderTopWidth: 3,
  },
  iconContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // Features Section
  featuresSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  featureText: {
    marginLeft: 15,
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  
  // Emergency Section
  emergencySection: {
    backgroundColor: '#C62828',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  emergencySubtitle: {
    fontSize: 13,
    color: '#FFEBEE',
    marginBottom: 15,
    textAlign: 'center',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emergencyButtonText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 25,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  credentialsInfo: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  credentialsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  credentialsText: {
    fontSize: 11,
    color: '#1976D2',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickFillButton: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  quickFillText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: '600',
  },
  guestButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  guestButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PatientHomeScreen;
