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
import { useTheme } from '../../contexts/ThemeContext';
import { Colors, Sizes } from '../../constants/theme';
import { PatientService, AppointmentService } from '../../services/hospitalServices';
import AppHeader from '../../components/AppHeader';
import { useApp } from '../../contexts/AppContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logoutUser, isAuthenticated } = useUnifiedAuth();
  const { theme } = useTheme();
  const { reports } = useApp();
  
  // State management
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [appointmentCount, setAppointmentCount] = useState({ upcoming: 0, past: 0 });
  const [medicalHistoryCount, setMedicalHistoryCount] = useState(0);

  // Fetch profile data from backend
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.userData?.id && !user?.id) {
        console.log('No user ID available');
        return;
      }

      const userId = user?.userData?.id || user?.id;
      
      // Fetch user profile with error handling
      try {
        const profile = await PatientService.getProfile(userId);
        setProfileData(profile);
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // Use existing user data as fallback
        setProfileData(user?.userData || null);
      }

      // Fetch appointment counts with error handling
      try {
        const appointments = await AppointmentService.getAppointments(userId);
        const now = new Date();
        const upcomingCount = appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate || apt.date + ' ' + apt.time);
          return aptDate > now && apt.status !== 'cancelled';
        }).length;
        
        setAppointmentCount({
          upcoming: upcomingCount,
          past: appointments.length - upcomingCount
        });
      } catch (appointmentError) {
        console.error('Error fetching appointments:', appointmentError);
        // Set default counts on error
        setAppointmentCount({ upcoming: 0, past: 0 });
      }

      // Set medical history count from reports data
      if (reports && Array.isArray(reports)) {
        // Count reports that are sent to this patient
        const userReports = reports.filter(report => {
          const matchesUser = report.patientId === userId || 
                             report.patientEmail === (profileData?.email || user?.userData?.email) ||
                             report.patientPhone === (profileData?.phone || user?.userData?.phone);
          return matchesUser && report.sentToPatient;
        });
        setMedicalHistoryCount(userReports.length);
      } else {
        setMedicalHistoryCount(0);
      }
      
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Don't show alert for profile fetch errors, just log and continue
      // The individual error handling above will manage partial data loading
      console.log('Profile data loading completed with some errors - using fallback data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchProfileData();
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated, user]);

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
              await logoutUser();
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
    // Navigate to the Patient tab navigator first, then to Reports tab
    navigation.navigate('PatientMain', { 
      screen: 'Reports',
      initial: false 
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
              {profileData?.profileImage || user?.userData?.profileImage ? (
                <Image 
                  source={{ uri: profileData?.profileImage || user?.userData?.profileImage }} 
                  style={styles.profileImagePhoto}
                  onError={() => console.log('Profile image failed to load')}
                />
              ) : (
                <Ionicons name="person" size={40} color={Colors.kbrBlue} />
              )}
            </View>
          </View>
          
          <Text style={styles.userName}>
            {profileData?.name || user?.userData?.name || 'Guest User'}
          </Text>
          
          <Text style={styles.userEmail}>
            {profileData?.email || user?.userData?.email || 'guest@example.com'}
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
});

export default ProfileScreen;
