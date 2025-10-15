import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
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
  customBackAction = null,
  showMenuButton = false,
  showAdminStatus = false,
  hideProfileButton = false,
  useSimpleAdminHeader = false
}) => {
  const { isLoggedIn, userData, logoutUser } = useUser();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleBackPress = () => {
    if (customBackAction) {
      customBackAction();
    } else if (backAction) {
      backAction();
    } else {
      try {
        // Get current navigation state
        const state = navigation?.getState();
        const canGoBack = navigation?.canGoBack();
        
        if (canGoBack && state?.routes?.length > 1) {
          // We have navigation history, go back properly
          navigation.goBack();
        } else {
          // Check parent navigators (drawer/tab navigators)
          const parentNav = navigation?.getParent();
          if (parentNav?.canGoBack()) {
            parentNav.goBack();
          } else {
            // For admin screens, go back to dashboard instead of patient home
            const currentRoute = state?.routes?.[state?.index];
            if (currentRoute?.name?.includes('Admin') || navigation?.getId()?.includes('Admin')) {
              navigation?.navigate('AdminTabs', { screen: 'Dashboard' });
            } else {
              navigation?.navigate('PatientMain', { screen: 'Home' });
            }
          }
        }
      } catch (error) {
        // Fallback - just try to go back
        if (navigation?.canGoBack()) {
          navigation.goBack();
        }
      }
    }
  };

  const handleMenuPress = () => {
    // Open drawer navigation for admin screens
    navigation?.getParent()?.openDrawer();
  };

  const handleAuthPress = () => {
    if (isLoggedIn) {
      // Show user options menu
      Alert.alert(
        'Account Options',
        `Welcome back, ${userData?.name || 'User'}!`,
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
                  { 
                    text: 'Cancel', 
                    style: 'cancel' 
                  },
                  { 
                    text: 'Logout', 
                    style: 'destructive',
                    onPress: () => {
                      logoutUser();
                      Alert.alert('Success', 'You have been logged out successfully.');
                    }
                  }
                ]
              );
            }
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          }
        ]
      );
    } else {
      // Show login modal
      setShowAuthModal(true);
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
      {useSimpleAdminHeader ? (
        // Simple Admin Header Layout
        <View style={styles.simpleAdminHeader}>
          {showBackButton && (
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.simpleBackButton}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
          )}
          <View style={styles.simpleHeaderContent}>
            <Text style={[styles.simpleHeaderTitle, { color: theme.white }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.simpleHeaderSubtitle, { color: theme.white }]}>{subtitle}</Text>
            )}
          </View>
        </View>
      ) : (
        // Default Header Layout
        <View style={styles.leftSection}>
          {showBackButton && (
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
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
      )}
      
      {!useSimpleAdminHeader && (
        <View style={styles.rightSection}>
          {!hideProfileButton && (
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
                    <Ionicons name="person-circle" size={22} color={theme.white} />
                  </View>
                )
              ) : (
                <View style={styles.loginIconContainer}>
                  <Ionicons name="person-circle-outline" size={22} color={theme.white} />
                </View>
              )}
            </TouchableOpacity>
          )}

          {showMenuButton && (
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={handleMenuPress}
            >
              <Ionicons name="menu" size={24} color={theme.white} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        navigation={navigation}
      />
      
      {/* Admin Status Section */}
      {showAdminStatus && (
        <View style={styles.adminStatusSection}>
          <Text style={styles.adminStatusText}>Hospital Management System</Text>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.statusText}>System Online • Live Dashboard</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '500',
    marginTop: 2,
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
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  adminStatusSection: {
    position: 'absolute',
    bottom: -40,
    left: Sizes.screenPadding,
    right: Sizes.screenPadding,
  },
  adminStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  simpleAdminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  simpleBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  simpleHeaderContent: {
    flex: 1,
  },
  simpleHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.3,
    marginBottom: 2,
    lineHeight: 24,
  },
  simpleHeaderSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
    lineHeight: 16,
  },
});

export default AppHeader;