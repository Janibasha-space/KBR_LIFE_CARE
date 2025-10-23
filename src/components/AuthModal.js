import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import { useApp } from '../contexts/AppContext';

const AuthModal = ({ visible, onClose, navigation }) => {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });

  const { login, register, isLoading } = useUnifiedAuth();
  const { initializeFirebaseData } = useApp();

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phone: '',
    });
    setAuthMode('signin');
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  // Handle authentication
  const handleAuth = async () => {
    if (authMode === 'signin') {
      // Sign in logic
      if (!formData.email || !formData.password) {
        Alert.alert('Error', 'Please enter both email and password');
        return;
      }

      setLoading(true);
      try {
        const response = await login({
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          Alert.alert('Success', response.message || 'Signed in successfully!', [
            {
              text: 'OK',
              onPress: () => {
                handleClose();
                // Navigate based on user role - fix the data structure path
                const userRole = response.data?.user?.role || response.user?.role;
                console.log('🔄 User role detected:', userRole);
                
                // Trigger data loading after successful authentication
                console.log('📊 Loading Firebase data after successful login...');
                initializeFirebaseData();
                
                if (userRole === 'admin') {
                  console.log('🚀 Navigating to Admin Dashboard');
                  navigation?.navigate('AdminMain');
                } else {
                  console.log('🏥 Navigating to Patient Dashboard');
                  navigation?.navigate('PatientMain', { screen: 'Home' });
                }
              },
            },
          ]);
        }
      } catch (error) {
        Alert.alert('Sign In Failed', error.message || 'Please check your credentials and try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Sign up logic
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
        Alert.alert('Error', 'Please fill in all fields');
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      try {
        const response = await register({
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          phone: formData.phone,
          role: 'patient'
        });
        
        if (response.success) {
          Alert.alert('Success', 'Account created successfully!', [
            {
              text: 'OK',
              onPress: () => {
                handleClose();
                navigation?.navigate('PatientMain', { screen: 'Home' });
              },
            },
          ]);
        }
      } catch (error) {
        Alert.alert('Registration Failed', error.message || 'Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle demo account selection
  // Firebase-only authentication - removed demo account functions

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              {/* Subtitle */}
              <Text style={styles.subtitle}>
                {authMode === 'signin' 
                  ? 'Welcome back! Please sign in to your account.' 
                  : 'Create a new account to get started with KBR Life Care.'
                }
              </Text>

              {/* Auth Mode Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, authMode === 'signin' && styles.activeTab]}
                  onPress={() => setAuthMode('signin')}
                >
                  <Text style={[styles.tabText, authMode === 'signin' && styles.activeTabText]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, authMode === 'signup' && styles.activeTab]}
                  onPress={() => setAuthMode('signup')}
                >
                  <Text style={[styles.tabText, authMode === 'signup' && styles.activeTabText]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Demo Accounts Section */}
              {/* Firebase-only Authentication Form */}

              {/* Form Content */}
              <View style={styles.formContainer}>
                {authMode === 'signup' && (
                  <>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your full name"
                      placeholderTextColor="#999"
                      value={formData.fullName}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                    />
                  </>
                )}

                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={formData.password}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
                  </TouchableOpacity>
                </View>

                {authMode === 'signup' && (
                  <>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your phone number"
                      placeholderTextColor="#999"
                      value={formData.phone}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                    />

                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm your password"
                        placeholderTextColor="#999"
                        value={formData.confirmPassword}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#999" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAuth}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Switch Mode */}
                <View style={styles.switchContainer}>
                  <Text style={styles.switchText}>
                    {authMode === 'signin' 
                      ? "Don't have an account? " 
                      : "Already have an account? "
                    }
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  >
                    <Text style={styles.switchLink}>
                      {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.kbrBlue,
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 15,
  },
  submitButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
  // Demo accounts styles
  demoAccountsContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  hideDemo: {
    fontSize: 14,
    color: Colors.kbrBlue,
    fontWeight: '500',
  },
  demoSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  demoAccountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  demoAccountInfo: {
    flex: 1,
  },
  demoAccountRole: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    marginBottom: 2,
  },
  demoAccountName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 1,
  },
  demoAccountEmail: {
    fontSize: 11,
    color: '#666',
  },
  demoAccountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoQuickLogin: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  demoQuickLoginText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  demoFillButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.kbrBlue,
  },
  showDemoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.kbrBlue,
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 6,
  },
  showDemoText: {
    color: Colors.kbrBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
});

export default AuthModal;