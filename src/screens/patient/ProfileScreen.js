import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useUser } from '../../contexts/UserContext';

const ProfileScreen = ({ navigation }) => {
  const { userData, logoutUser, isLoggedIn } = useUser();
  
  const [userProfile, setUserProfile] = useState({
    name: userData?.name || userData?.username || 'John Doe',
    email: userData?.email || 'john.doe@email.com',
    phone: userData?.mobileNumber || '+91 98765 43210',
    dateOfBirth: userData?.dateOfBirth || '1990-01-15',
    bloodGroup: userData?.bloodGroup || 'O+',
    address: userData?.address || '123 Main Street, City, State - 123456',
    emergencyContact: userData?.emergencyContact || '+91 98765 43211',
    profilePicture: userData?.profilePicture || null,
  });

  const profileMenuItems = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      subtitle: 'Update your personal details',
      icon: 'person-outline',
      onPress: () => Alert.alert('Feature', 'Personal info editing coming soon'),
    },
    {
      id: 'medical-history',
      title: 'Medical History',
      subtitle: 'View your medical records',
      icon: 'medical-outline',
      onPress: () => navigation.navigate('Reports'),
    },
    {
      id: 'appointments',
      title: 'My Appointments',
      subtitle: 'View upcoming and past appointments',
      icon: 'calendar-outline',
      onPress: () => navigation.navigate('Appointments'),
    },
    {
      id: 'pharmacy-orders',
      title: 'Pharmacy Orders',
      subtitle: 'Track your medicine orders',
      icon: 'basket-outline',
      onPress: () => navigation.navigate('Pharmacy'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications-outline',
      onPress: () => Alert.alert('Feature', 'Notification settings coming soon'),
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Support', 'Contact: +91 18004191397'),
    },
    {
      id: 'logout',
      title: 'Logout',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      onPress: () => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: () => {
                logoutUser();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'OnboardingScreen' }],
                });
              },
            },
          ]
        );
      },
    },
  ];

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Image 
              source={require('../../../assets/hospital-logo.jpeg')}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>KBR LIFE CARE HOSPITALS</Text>
              <Text style={styles.headerSubtitle}>My Profile</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                {userProfile.profilePicture ? (
                  <Image 
                    source={{ uri: userProfile.profilePicture }} 
                    style={styles.profilePicture}
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={40} color={Colors.kbrBlue} />
                )}
              </View>
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="camera" size={16} color={Colors.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileEmail}>{userProfile.email}</Text>
              <Text style={styles.profilePhone}>{userProfile.phone}</Text>
            </View>
          </View>

          {/* Quick Info Cards */}
          <View style={styles.quickInfoSection}>
            <View style={styles.quickInfoCard}>
              <Ionicons name="water-outline" size={20} color={Colors.kbrRed} />
              <Text style={styles.quickInfoLabel}>Blood Group</Text>
              <Text style={styles.quickInfoValue}>{userProfile.bloodGroup}</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <Ionicons name="calendar-outline" size={20} color={Colors.kbrBlue} />
              <Text style={styles.quickInfoLabel}>Date of Birth</Text>
              <Text style={styles.quickInfoValue}>{new Date(userProfile.dateOfBirth).toLocaleDateString()}</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {profileMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: item.id === 'logout' ? Colors.danger + '15' : Colors.kbrBlue + '15' }]}>
                    <Ionicons 
                      name={item.icon} 
                      size={20} 
                      color={item.id === 'logout' ? Colors.danger : Colors.kbrBlue} 
                    />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={[styles.menuItemTitle, item.id === 'logout' && { color: Colors.danger }]}>
                      {item.title}
                    </Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>KBR Hospital App v1.0.0</Text>
            <Text style={styles.versionSubtext}>Built with ❤️ for better healthcare</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Sizes.md,
  },
  headerLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Sizes.sm,
  },
  headerTitle: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Sizes.screenPadding,
    marginTop: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Sizes.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.kbrBlue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profilePicture: {
    width: 80,
    height: 80,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.kbrRed,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  quickInfoSection: {
    flexDirection: 'row',
    marginHorizontal: Sizes.screenPadding,
    marginTop: Sizes.lg,
    gap: Sizes.md,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickInfoLabel: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginTop: Sizes.sm,
    textAlign: 'center',
  },
  quickInfoValue: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  menuSection: {
    marginHorizontal: Sizes.screenPadding,
    marginTop: Sizes.lg,
  },
  menuItem: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Sizes.lg,
    marginBottom: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Sizes.xl,
    marginBottom: Sizes.lg,
  },
  versionText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;