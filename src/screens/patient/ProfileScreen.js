import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useAuth, usePatientData } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors, Sizes } from '../../constants/theme';
import { PatientService, AppointmentService } from '../../services/hospitalServices';
import AppHeader from '../../components/AppHeader';
import { useApp } from '../../contexts/AppContext';

const ProfileScreen = ({ navigation, route }) => {
  const { user, logoutUser, isAuthenticated } = useUnifiedAuth();
  const { currentUser, currentPatient, isAuthenticated: isFirebaseAuth, clearUserData } = useAuth();
  const { patient, appointments, medicalReports } = usePatientData();
  const { theme } = useTheme();
  const { reports } = useApp();
  
  // State management
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState({ upcoming: 0, past: 0 });
  const [medicalHistoryCount, setMedicalHistoryCount] = useState(0);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now()); // Force image refresh

  // Fetch profile data from backend
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Starting profile data fetch...');
      
      // Add timeout to prevent indefinite loading
      const fetchTimeout = setTimeout(() => {
        console.log('⏰ Profile fetch timeout, setting loading to false');
        setIsLoading(false);
      }, 10000); // 10 second timeout
      
      // Priority 1: Use currentPatient data if available (from AppContext authentication)
      if (currentPatient && currentPatient.name) {
        clearTimeout(fetchTimeout);
        console.log('✅ Using currentPatient data:', currentPatient.name);
        setProfileData(currentPatient);
        await fetchAppointmentCounts(currentPatient.id || currentPatient.userId);
        return;
      }
      
      // Priority 2: Use patient data from usePatientData hook
      if (patient && patient.name) {
        clearTimeout(fetchTimeout);
        console.log('✅ Using patient data from hook:', patient.name);
        setProfileData(patient);
        await fetchAppointmentCounts(patient.id || patient.userId);
        return;
      }
      
      // Priority 3: Create profile from user credentials if no patient record exists
      if (currentUser) {
        clearTimeout(fetchTimeout);
        console.log('📋 Creating profile from user credentials:', currentUser.email);
        
        const userProfileData = {
          id: currentUser.uid,
          name: currentUser.userData?.name || currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.userData?.email || currentUser.email,
          phone: currentUser.userData?.phone || '',
          role: currentUser.userData?.role || 'patient',
          userId: currentUser.uid,
          // Add default values for missing fields
          bloodGroup: 'Not specified',
          address: '',
          emergencyContact: '',
          createdAt: new Date().toISOString()
        };
        
        setProfileData(userProfileData);
        console.log('✅ Profile created from user credentials:', userProfileData.name);
        
        // Try to fetch appointments with user ID
        await fetchAppointmentCounts(currentUser.uid);
        return;
      }
      
      // Priority 4: Fallback to UnifiedAuth user data
      if (user?.userData) {
        clearTimeout(fetchTimeout);
        console.log('📋 Using UnifiedAuth user data as fallback');
        const fallbackProfile = {
          id: user.userData.id || user.id,
          name: user.userData.name || 'User',
          email: user.userData.email || '',
          phone: user.userData.phone || '',
          role: 'patient',
          bloodGroup: 'Not specified',
          address: '',
          emergencyContact: ''
        };
        
        setProfileData(fallbackProfile);
        await fetchAppointmentCounts(fallbackProfile.id);
        return;
      }
      
      // If no user data is available
      clearTimeout(fetchTimeout);
      console.log('⚠️ No user data available from any source');
      setProfileData(null);
      
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      // Create a minimal profile even if everything fails
      if (currentUser || user) {
        const fallbackProfile = {
          id: currentUser?.uid || user?.id || 'unknown',
          name: currentUser?.email?.split('@')[0] || user?.userData?.name || 'User',
          email: currentUser?.email || user?.userData?.email || '',
          phone: '',
          role: 'patient',
          bloodGroup: 'Not specified',
          address: '',
          emergencyContact: ''
        };
        setProfileData(fallbackProfile);
        console.log('📋 Using minimal fallback profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Separate function to fetch appointment counts
  const fetchAppointmentCounts = async (userId) => {
    try {
      // Use appointments from usePatientData if available, otherwise fetch
      let userAppointments = [];
      
      if (appointments && appointments.length > 0) {
        userAppointments = appointments;
        console.log('📅 Using appointments from usePatientData:', appointments.length);
      } else if (userId) {
        try {
          const fetchedAppointments = await AppointmentService.getAppointments(userId);
          userAppointments = Array.isArray(fetchedAppointments) ? fetchedAppointments : [];
          console.log('📅 Fetched appointments from service:', userAppointments.length);
        } catch (appointmentError) {
          console.log('⚠️ Could not fetch appointments:', appointmentError.message);
          userAppointments = [];
        }
      }
      
      const now = new Date();
      const upcomingCount = userAppointments.filter(apt => {
        try {
          const aptDate = new Date(apt.appointmentDate || apt.date + ' ' + apt.time);
          return aptDate > now && apt.status !== 'cancelled';
        } catch (dateError) {
          return false;
        }
      }).length;
      
      const pastCount = userAppointments.filter(apt => {
        try {
          const aptDate = new Date(apt.appointmentDate || apt.date + ' ' + apt.time);
          return aptDate <= now || apt.status === 'completed';
        } catch (dateError) {
          return true; // Default to past if date parsing fails
        }
      }).length;
      
      setAppointmentCount({ upcoming: upcomingCount, past: pastCount });
      
      // Count medical reports
      if (medicalReports && Array.isArray(medicalReports)) {
        // Use medical reports from usePatientData (already filtered for current patient)
        setMedicalHistoryCount(medicalReports.length);
        console.log('📄 Using medical reports from usePatientData:', medicalReports.length);
      } else if (reports && Array.isArray(reports)) {
        // Fallback: Count reports that are sent to this patient
        const userReports = reports.filter(report => {
          const matchesUser = report.patientId === userId || 
                             report.patientEmail === (currentPatient?.email || currentUser?.email || user?.userData?.email) ||
                             report.patientPhone === (currentPatient?.phone || user?.userData?.phone);
          return matchesUser && report.sentToPatient;
        });
        setMedicalHistoryCount(userReports.length);
      } else {
        setMedicalHistoryCount(0);
      }
      
    } catch (error) {
      console.log('⚠️ Error fetching appointment counts:', error.message);
      // Set default values if fetching fails
      setAppointmentCount({ upcoming: 0, past: 0 });
      setMedicalHistoryCount(0);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfileData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    console.log('🚀 ProfileScreen mounted with auth states:', {
      isAuthenticated,
      isFirebaseAuth,
      hasUser: !!user,
      hasCurrentUser: !!currentUser,
      hasCurrentPatient: !!currentPatient,
      hasPatient: !!patient
    });
    
    if (isAuthenticated || isFirebaseAuth) {
      fetchProfileData();
    } else {
      console.log('⚠️ User not authenticated on mount, setting loading to false');
      setIsLoading(false);
    }
  }, [isAuthenticated, isFirebaseAuth, user, currentUser, currentPatient]);

  // Listen for navigation focus to refresh data when returning from EditProfile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('📱 ProfileScreen focused - refreshing profile data...');
      console.log('🔍 Auth states:', {
        isAuthenticated,
        isFirebaseAuth,
        hasUser: !!user,
        hasCurrentUser: !!currentUser,
        hasCurrentPatient: !!currentPatient,
        hasPatient: !!patient
      });
      
      // Force refresh whenever screen gains focus (especially after EditProfile)
      setImageRefreshKey(Date.now()); // Force image refresh
      
      if (isAuthenticated || isFirebaseAuth) {
        fetchProfileData();
      } else {
        console.log('⚠️ User not authenticated, cannot fetch profile data');
      }
    });

    return unsubscribe;
  }, [navigation, isAuthenticated, isFirebaseAuth]);

  // Additional listener for profile data changes (when returning from EditProfile)
  useEffect(() => {
    console.log('🔄 Profile data changed, checking for updates...', {
      currentPatientName: currentPatient?.name,
      currentPatientImage: !!currentPatient?.profileImage,
      patientName: patient?.name,
      patientImage: !!patient?.profileImage,
      profileDataName: profileData?.name,
      profileDataImage: !!profileData?.profileImage,
      userLastUpdated: user?.lastUpdated,
      userLastProfileUpdate: user?.userData?.lastProfileUpdate
    });
    
    // Force refresh if we detect any changes in the context data or if user was recently updated
    if ((currentPatient || patient || user?.lastUpdated || user?.userData?.lastProfileUpdate) && (isAuthenticated || isFirebaseAuth)) {
      // Force image refresh when user data is updated
      if (user?.lastUpdated || user?.userData?.lastProfileUpdate) {
        setImageRefreshKey(user?.lastUpdated || user?.userData?.lastProfileUpdate || Date.now());
      }
      fetchProfileData();
    }
  }, [currentPatient?.profileImage, patient?.profileImage, currentPatient?.name, patient?.name, user?.lastUpdated, user?.userData?.lastProfileUpdate]);

  // Specific watcher for user profile image changes
  useEffect(() => {
    console.log('🖼️ User profile image changed:', {
      userDataImage: user?.userData?.profileImage,
      userProfileImage: user?.profileImage,
      lastUpdated: user?.lastUpdated
    });
    
    if (user?.userData?.profileImage || user?.profileImage) {
      console.log('📸 Forcing image refresh due to user context change');
      setImageRefreshKey(Date.now());
    }
  }, [user?.userData?.profileImage, user?.profileImage]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear both authentication systems
              await logoutUser();
              clearUserData();
              
              // Also clear Firebase auth if available
              try {
                const { auth, signOut } = require('../../config/firebase.config');
                await signOut(auth);
                console.log('✅ Firebase logout completed');
              } catch (firebaseError) {
                console.log('⚠️ Firebase logout error (expected if not using Firebase):', firebaseError.message);
              }
              
              navigation.navigate('PatientMain', { screen: 'Home' });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Navigation handlers for menu items
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleMedicalHistory = () => {
    // Navigate directly to the standalone MedicalReportsScreen from Profile
    navigation.navigate('MedicalReports', { 
      fromProfile: true
    });
  };

  const handleMyAppointments = () => {
    navigation.navigate('AppointmentScreen');
  };

  const handlePaymentMethods = () => {
    // Navigate to payment methods or show coming soon
    Alert.alert('Coming Soon', 'Payment methods management will be available soon.');
  };

  const handleNotifications = () => {
    // Navigate to notification settings or show coming soon
    Alert.alert('Coming Soon', 'Notification preferences will be available soon.');
  };

  const handleHelpSupport = () => {
    // Navigate to help & support screen
    Alert.alert(
      'Help & Support',
      'Contact our support team:\n\nPhone: +91-12345-67890\nEmail: support@kbrlifecarecare.com\n\nOr visit our help center for FAQs and guides.',
      [
        { text: 'Call Support', onPress: () => console.log('Call support') },
        { text: 'Email Support', onPress: () => console.log('Email support') },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  const profileMenuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: handleEditProfile,
      color: Colors.kbrBlue,
    },
    {
      icon: 'medical-outline',
      title: 'Medical History',
      subtitle: `${medicalHistoryCount} records`,
      onPress: handleMedicalHistory,
      color: Colors.kbrPurple,
    },
    {
      icon: 'calendar-outline',
      title: 'My Appointments',
      subtitle: `${appointmentCount.upcoming} upcoming`,
      onPress: handleMyAppointments,
      color: Colors.kbrGreen,
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage cards & payments',
      onPress: handlePaymentMethods,
      color: Colors.kbrOrange,
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage preferences',
      onPress: handleNotifications,
      color: Colors.kbrRed,
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: '24/7 assistance',
      onPress: handleHelpSupport,
      color: Colors.kbrTeal,
    },
  ];

  if (isLoading && !profileData) {
    console.log('🔄 ProfileScreen is loading, showing loading screen...');
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" />
        <AppHeader 
          title="Profile"
          showBackButton={true}
          navigation={navigation}
          useSimpleAdminHeader={true}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.kbrBlue} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profileData && !isLoading) {
    console.log('⚠️ No profile data available and not loading, showing error state...');
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" />
        <AppHeader 
          title="Profile"
          showBackButton={true}
          navigation={navigation}
          useSimpleAdminHeader={true}
        />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Unable to load profile data</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              console.log('🔄 Retry button pressed, refetching profile data...');
              fetchProfileData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" />
      
      {/* App Header */}
      <AppHeader 
        title="Profile"
        showBackButton={true}
        navigation={navigation}
        useSimpleAdminHeader={true}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[Colors.kbrBlue]}
            tintColor={Colors.kbrBlue}
          />
        }
      >

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              {(() => {
                // Debug profile image sources
                const sources = {
                  userDataImage: user?.userData?.profileImage,
                  userProfileImage: user?.profileImage,
                  currentPatient: currentPatient?.profileImage,
                  patient: patient?.profileImage,
                  profileData: profileData?.profileImage
                };
                console.log('🖼️ Profile image sources:', sources);
                
                // Prioritize user context first (most recent), then other sources
                const profileImageUri = user?.userData?.profileImage || 
                                       user?.profileImage ||
                                       currentPatient?.profileImage || 
                                       patient?.profileImage || 
                                       profileData?.profileImage;
                                       
                console.log('🖼️ Selected profile image URI:', profileImageUri);
                
                return profileImageUri ? (
                  <Image 
                    source={{ uri: `${profileImageUri}?t=${imageRefreshKey}` }} // Add cache-busting parameter
                    style={styles.profileImagePhoto}
                    onError={(error) => {
                      console.log('❌ Profile image failed to load:', error.nativeEvent.error);
                    }}
                    onLoad={() => {
                      console.log('✅ Profile image loaded successfully');
                    }}
                    // Force image refresh by adding timestamp to prevent caching issues
                    key={`profile-image-${profileImageUri}-${imageRefreshKey}`}
                  />
                ) : (
                  <Ionicons name="person" size={40} color={Colors.kbrBlue} />
                );
              })()}
            </View>
          </View>
          
          <Text style={styles.userName}>
            {currentPatient?.name || patient?.name || profileData?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || user?.userData?.name || 'Patient User'}
          </Text>
          
          <Text style={styles.userEmail}>
            {currentPatient?.email || patient?.email || profileData?.email || currentUser?.email || user?.userData?.email || 'No email available'}
          </Text>

          {(profileData?.phone || user?.userData?.phone) && (
            <Text style={styles.userPhone}>
              {profileData?.phone || user?.userData?.phone}
            </Text>
          )}

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < profileMenuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={item.color}
                  />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="#C4C4C4"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <TouchableOpacity
          style={styles.logoutSection}
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#EF4444"
              />
            </View>
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileImagePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  userPhone: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  editProfileButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editProfileButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  menuSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  retryButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ProfileScreen;
