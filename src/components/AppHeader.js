import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';
import { useUser } from '../contexts/UserContext';

const AppHeader = ({ 
  title, 
  subtitle, 
  navigation, 
  showBackButton = false, 
  backAction = null,
  customBackAction = null 
}) => {
  const { isLoggedIn, userData, logoutUser } = useUser();

  const handleBackPress = () => {
    if (customBackAction) {
      customBackAction();
    } else if (backAction) {
      backAction();
    } else if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Home');
    }
  };

  const handleAuthPress = () => {
    if (isLoggedIn) {
      // Show profile menu
      Alert.alert(
        `Hello, ${userData?.name || userData?.username || 'User'}!`,
        'What would you like to do?',
        [
          {
            text: 'View Profile',
            onPress: () => navigation?.navigate('Profile'),
          },
          {
            text: 'My Appointments', 
            onPress: () => {
              // Navigate to appointments - we'll need to handle this since we removed the tab
              // For now, let's create a separate appointments screen
              Alert.alert('Info', 'Appointments can be viewed in the Book Appointment section');
            }
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
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
                      navigation?.navigate('Home');
                    },
                  },
                ]
              );
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      // Navigate to login/booking screen
      navigation?.navigate('BookAppointment');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Image 
            source={require('../../assets/hospital-logo.jpeg')}
            style={styles.headerLogoImage}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>KBR LIFE CARE HOSPITALS</Text>
            {subtitle && (
              <Text style={styles.headerSubtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.authButton}
        onPress={handleAuthPress}
      >
        {isLoggedIn ? (
          <>
            <Ionicons name="person-circle" size={20} color={Colors.white} />
            <Text style={styles.authText}>Profile</Text>
          </>
        ) : (
          <>
            <Ionicons name="log-in-outline" size={16} color={Colors.white} />
            <Text style={styles.authText}>Sign In</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: Sizes.sm,
    padding: 4,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Sizes.sm,
  },
  titleContainer: {
    flex: 1,
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
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
    minWidth: 80,
    justifyContent: 'center',
  },
  authText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
    fontWeight: '500',
  },
});

export default AppHeader;