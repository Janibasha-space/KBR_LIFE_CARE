import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { Colors } from '../constants/theme';
import { AuthService } from '../services/authService';
import { PatientService, AppointmentService, DoctorService } from '../services/hospitalServices';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { setupFirebaseData } from '../config/firebaseDataSetup';

const ExampleApiUsageScreen = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const { user, isAuthenticated, login, register, logout } = useFirebaseAuth();

  // Example: Setup Firebase data
  const setupData = async () => {
    setLoading(true);
    try {
      await setupFirebaseData();
      Alert.alert('Success', 'Firebase data setup completed!');
    } catch (error) {
      Alert.alert('Setup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Login function
  const handleLogin = async () => {
    setLoading(true);
    try {
      const credentials = {
        email: 'test@kbrhospital.com',
        password: 'password123'
      };
      
      const response = await login(credentials);
      Alert.alert('Success', 'Login successful!');
      setUserData(user);
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Register function
  const handleRegister = async () => {
    setLoading(true);
    try {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '+91-9876543210',
        role: 'patient'
      };
      
      const response = await register(userData);
      Alert.alert('Success', 'Registration successful!');
      setUserData(user);
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch user profile
  const fetchUserData = async () => {
    try {
      const patientId = '12345'; // This would come from your authentication context
      const profile = await PatientService.getProfile(patientId);
      setUserData(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  // Example: Fetch appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const patientId = userData?.id;
      const appointmentList = await AppointmentService.getAppointments(patientId);
      setAppointments(appointmentList);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  // Example: Book new appointment
  const bookAppointment = async () => {
    setLoading(true);
    try {
      const appointmentData = {
        doctorId: 'doctor123',
        patientId: userData?.id,
        dateTime: new Date().toISOString(),
        type: 'consultation',
        notes: 'Regular checkup'
      };
      
      const response = await AppointmentService.bookAppointment(appointmentData);
      Alert.alert('Success', 'Appointment booked successfully!');
      
      // Refresh appointments list
      await fetchAppointments();
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  // Example: Fetch doctors list
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const doctorsList = await DoctorService.getDoctors();
      setDoctors(doctorsList);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  // Example: Logout function
  const handleLogout = async () => {
    try {
      await logout();
      setUserData(null);
      setAppointments([]);
      setDoctors([]);
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  useEffect(() => {
    // Set user data when Firebase auth state changes
    if (isAuthenticated && user) {
      setUserData(user);
    } else {
      setUserData(null);
      setAppointments([]);
      setDoctors([]);
    }
  }, [isAuthenticated, user]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Integration Example</Text>
      
      {/* Firebase Setup Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firebase Setup</Text>
        <TouchableOpacity 
          style={[styles.button, styles.setupButton]} 
          onPress={setupData}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Setup Firebase Data</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.infoText}>Run this once to populate sample data in Firebase</Text>
      </View>
      
      {/* Authentication Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Firebase Authentication</Text>
        {!isAuthenticated ? (
          <View>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Register New User</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.userInfo}>Welcome, {userData?.name || userData?.email}!</Text>
            <Text style={styles.userInfo}>User ID: {userData?.id}</Text>
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* User Data Section */}
      {isAuthenticated && userData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Firebase User Profile</Text>
          <Text>Name: {userData.name || 'Not set'}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>User ID: {userData.id}</Text>
          <Text>Email Verified: {userData.emailVerified ? 'Yes' : 'No'}</Text>
        </View>
      )}

      {/* Appointments Section */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appointments</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={fetchAppointments}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Fetch Appointments</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={bookAppointment}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Book New Appointment</Text>
          </TouchableOpacity>
          
          {appointments.length > 0 && (
            <View style={styles.listContainer}>
              {appointments.map((appointment, index) => (
                <Text key={index} style={styles.listItem}>
                  {appointment.dateTime} - {appointment.type}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Doctors Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Doctors</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={fetchDoctors}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Fetch Doctors</Text>
        </TouchableOpacity>
        
        {doctors.length > 0 && (
          <View style={styles.listContainer}>
            {doctors.map((doctor, index) => (
              <Text key={index} style={styles.listItem}>
                Dr. {doctor.name} - {doctor.specialty}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: Colors.error,
  },
  setupButton: {
    backgroundColor: '#FF9800',
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  listContainer: {
    marginTop: 15,
  },
  listItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});

export default ExampleApiUsageScreen;