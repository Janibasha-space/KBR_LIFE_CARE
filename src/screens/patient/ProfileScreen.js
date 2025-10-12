import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Colors, Sizes } from '../../constants/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logoutUser } = useUser();
  const { theme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logoutUser();
            navigation.navigate('PatientMain', { screen: 'Home' });
          },
        },
      ]
    );
  };

  const profileMenuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'medical-outline',
      title: 'Medical History',
      onPress: () => navigation.navigate('MedicalReports'),
    },
    {
      icon: 'calendar-outline',
      title: 'My Appointments',
      onPress: () => navigation.navigate('AppointmentScreen'),
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      onPress: () => {
        Alert.alert('Coming Soon', 'Payment methods feature will be available soon.');
      },
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => {
        Alert.alert('Coming Soon', 'Notification settings will be available soon.');
      },
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      onPress: () => {
        Alert.alert('Coming Soon', 'Help & support will be available soon.');
      },
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.white }]}>Profile</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.white} />
          </TouchableOpacity>
        </View>

        <View style={[styles.profileCard, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              {user?.userData?.profileImage ? (
                <Image 
                  source={{ uri: user.userData.profileImage }} 
                  style={styles.profileImagePhoto}
                  onError={() => console.log('Profile image failed to load in ProfileScreen:', user.userData.profileImage)}
                />
              ) : (
                <Ionicons name="person" size={40} color={theme.primary} />
              )}
            </View>
          </View>
          
          <Text style={[styles.userName, { color: theme.textPrimary }]}>
            {user?.userData?.name || 'Guest User'}
          </Text>
          
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {user?.userData?.email || 'guest@example.com'}
          </Text>

          {user?.userData?.phone && (
            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>
              {user.userData.phone}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.editProfileButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={[styles.editProfileButtonText, { color: theme.white }]}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.menuSection, { backgroundColor: theme.cardBackground }]}>
          {profileMenuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < profileMenuItems.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={theme.primary}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuItemTitle, { color: theme.textPrimary }]}>
                  {item.title}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutSection, { backgroundColor: theme.cardBackground }]}
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons
              name="log-out-outline"
              size={24}
              color={theme.danger}
              style={styles.menuIcon}
            />
            <Text style={[styles.logoutText, { color: theme.danger }]}>
              Logout
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    paddingTop: Sizes.lg,
  },
  backButton: {
    padding: Sizes.sm,
  },
  headerTitle: {
    fontSize: Sizes.large,
    color: Colors.white,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: Sizes.sm,
  },
  profileCard: {
    marginHorizontal: Sizes.screenPadding,
    marginTop: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
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
  profileImagePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    marginBottom: Sizes.xs,
  },
  userEmail: {
    fontSize: Sizes.regular,
    marginBottom: Sizes.xs,
  },
  userPhone: {
    fontSize: Sizes.regular,
    marginBottom: Sizes.md,
  },
  editProfileButton: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
  },
  editProfileButtonText: {
    fontSize: Sizes.regular,
    color: Colors.white,
    fontWeight: '600',
  },
  menuSection: {
    marginHorizontal: Sizes.screenPadding,
    marginTop: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: Sizes.md,
  },
  menuItemTitle: {
    fontSize: Sizes.regular,
    fontWeight: '500',
  },
  logoutSection: {
    marginHorizontal: Sizes.screenPadding,
    marginTop: Sizes.lg,
    marginBottom: Sizes.xl,
    borderRadius: Sizes.radiusLarge,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
});

export default ProfileScreen;
