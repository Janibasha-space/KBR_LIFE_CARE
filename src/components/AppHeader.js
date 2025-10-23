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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
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
  hideProfileButton = false,
  useSimpleAdminHeader = false,
  // Notification props
  showNotificationButton = false,
  notificationCount = 0,
  onNotificationPress = null
}) => {
  const { isAuthenticated, user, logout } = useUnifiedAuth();
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

  const handleMenuPress = () => {
    // Open drawer navigation for admin screens
    navigation?.getParent()?.openDrawer();
  };

  const handleAuthPress = () => {
    if (isAuthenticated) {
      // Show user options menu
      Alert.alert(
        'Account Options',
        `Welcome back, ${user?.name || 'User'}!`,
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
                    onPress: async () => {
                      try {
                        await logout();
                        Alert.alert('Success', 'You have been logged out successfully.');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to logout. Please try again.');
                      }
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
    <View 
      style={[
        styles.header, 
        useSimpleAdminHeader ? styles.adminHeader : styles.dashboardHeader,
        { backgroundColor: theme.primary || '#007bff' }
      ]}
    >
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      
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
            <Text style={styles.simpleHeaderTitle} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.simpleHeaderSubtitle} numberOfLines={1} ellipsizeMode="tail">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      ) : (
        // Default Header Layout (Dashboard)
        <View style={styles.dashboardLayout}>
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
                <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                  {title || "KBR Life Care Hospitals"}
                </Text>
                {subtitle && (
                  <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.rightSection}>
            {showNotificationButton && (
              <TouchableOpacity 
                style={styles.notificationButton}
                onPress={onNotificationPress}
              >
                <Ionicons name="notifications" size={20} color={Colors.white} />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {!hideProfileButton && (
              <TouchableOpacity 
                style={styles.profileIconButton}
                onPress={handleAuthPress}
              >
                {isAuthenticated ? (
                  user?.profileImage ? (
                    <Image 
                      source={{ uri: userData.userData.profileImage }} 
                      style={styles.profileIconImage}
                      onError={() => console.log('Profile image failed to load')}
                    />
                  ) : (
                    <View style={styles.profileIconPlaceholder}>
                      <Ionicons name="person-circle" size={24} color={Colors.white} />
                    </View>
                  )
                ) : (
                  <View style={styles.loginIconContainer}>
                    <Ionicons name="person-circle-outline" size={24} color={Colors.white} />
                  </View>
                )}
              </TouchableOpacity>
            )}

            {showMenuButton && (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={handleMenuPress}
              >
                <Ionicons name="menu-outline" size={24} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

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
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    height: Platform.OS === 'ios' ? 120 : 110,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
    overflow: 'hidden',
  },
  adminHeader: {
    // Optimized for admin screens with typically longer titles
    paddingBottom: 12,
  },
  dashboardHeader: {
    // Optimized for dashboard screens
    paddingBottom: 14,
  },
  dashboardLayout: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden', // Ensure no content overflow
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 2,
    flexShrink: 1,
    overflow: 'hidden',
    marginRight: 8, // Give space between left and right sections
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginLeft: -4,
    // Keep back button perfectly centered
    paddingLeft: 0,
    paddingRight: 2,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
    overflow: 'hidden',
    marginRight: 4, // Ensure there's space for the right section
  },
  headerLogoImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    flexShrink: 1,
    marginRight: 10,
    overflow: 'hidden',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    flexShrink: 1,
    marginRight: 4,
    maxWidth: '95%',
    overflow: 'hidden',
    // Ensure text truncates if too long
    ellipsizeMode: 'tail',
    numberOfLines: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '400',
    marginTop: 1,
    opacity: 0.85,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    flexShrink: 1,
    maxWidth: '95%',
    // Ensure subtitle truncates if too long
    ellipsizeMode: 'tail',
    numberOfLines: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  profileIconImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  simpleAdminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'flex-start',
    paddingVertical: 0,
    paddingHorizontal: 0,
    flexWrap: 'nowrap',
    marginTop: -4,
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  simpleBackButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginRight: 6,
    marginLeft: -4,
    marginTop: -1,
    // Keep back button perfectly centered
    paddingLeft: 0,
    paddingRight: 2,
  },
  simpleHeaderContent: {
    flex: 1,
    flexShrink: 1,
    justifyContent: 'center',
    height: '100%',
    paddingVertical: 0,
    marginLeft: 4,
    marginTop: -2,
    marginRight: 10,
    overflow: 'hidden',
  },
  simpleHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.2,
    marginBottom: 4,
    lineHeight: 26,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    flexShrink: 1,
    maxWidth: '98%',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    // Ensure text truncates if too long
    ellipsizeMode: 'tail',
    numberOfLines: 1,
  },
  simpleHeaderSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
    lineHeight: 18,
    opacity: 0.9,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    flexShrink: 1,
    maxWidth: '98%',
    // Ensure subtitle truncates if too long
    ellipsizeMode: 'tail',
    numberOfLines: 1,
  },
  // Notification Styles
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.kbrBlue,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 12,
  },
});

export default AppHeader;