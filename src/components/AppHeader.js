import React, { useState } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import AuthModal from './AuthModal';

const AppHeader = ({ 
  title, 
  subtitle, 
  navigation, 
  showBackButton = false, 
  backAction = null,
  customBackAction = null 
}) => {
  const { isLoggedIn, userData, logoutUser } = useUser();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBackPress = () => {
    if (customBackAction) {
      customBackAction();
    } else if (backAction) {
      backAction();
    } else if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('PatientMain', { screen: 'Home' });
    }
  };

  const handleAuthPress = () => {
    if (isLoggedIn) {
      // Show logout confirmation
      Alert.alert(
        'User Options',
        `Welcome, ${userData?.name || 'User'}!`,
        [
          {
            text: 'View Profile',
            onPress: () => navigation?.navigate('Profile')
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Logout Confirmation',
                'Are you sure you want to logout?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: () => {
                      logoutUser();
                      Alert.alert('Logged Out', 'You have been logged out successfully.');
                    }
                  }
                ]
              );
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      // Show login modal
      setShowAuthModal(true);
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity 
            onPress={handleBackPress}
            style={styles.backButton}
          >
            <View style={styles.circleBackButton}>
              <Ionicons name="chevron-back" size={20} color={Colors.white} />
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Image 
            source={require('../../assets/hospital-logo.jpeg')}
            style={styles.headerLogoImage}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: theme.white }]}>KBR LIFE CARE HOSPITALS</Text>
            {subtitle && (
              <Text style={[styles.headerSubtitle, { color: theme.white }]}>{subtitle}</Text>
            )}
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.profileIconButton}
        onPress={handleAuthPress}
      >
        {isLoggedIn ? (
          userData?.userData?.profileImage ? (
            <Image 
              source={{ uri: userData.userData.profileImage }} 
              style={styles.profileIconImage}
              onError={() => console.log('Profile image failed to load:', userData.userData.profileImage)}
            />
          ) : (
            <View style={styles.profileIconPlaceholder}>
              <Ionicons name="person" size={20} color={theme.white} />
            </View>
          )
        ) : (
          <View style={styles.loginIconContainer}>
            <Ionicons name="log-in-outline" size={20} color={theme.white} />
          </View>
        )}
      </TouchableOpacity>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        navigation={navigation}
      />
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
  },
  circleBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5EAEF5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
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
  profileIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileIconImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileIconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AppHeader;