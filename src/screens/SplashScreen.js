import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Linking,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideUpAnim = new Animated.Value(50);

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate to onboarding after 3 seconds (as fallback)
    const autoNavigateTimer = setTimeout(() => {
      handleEnterApp();
    }, 5000);

    return () => clearTimeout(autoNavigateTimer);
  }, []);

  const handleEnterApp = () => {
    navigation.replace('Onboarding');
  };

  const handleEmergencyCall = () => {
    Linking.openURL('tel:18004191397');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground 
        source={require('../assets/Gemini_Generated_Image_5ppbdb5ppbdb5ppb.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideUpAnim }
                ],
              },
            ]}
          >
            {/* Hospital Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <View style={styles.logoBackground}>
                  <View style={styles.crossVertical} />
                  <View style={styles.crossHorizontal} />
                  <Text style={styles.logoText}>KBR</Text>
                  <Text style={styles.logoSubtext}>Life Care Hospitals</Text>
                </View>
              </View>
            </View>

            {/* Hospital Name and Tagline */}
            <View style={styles.textContainer}>
              <Text style={styles.hospitalName}>KBR LIFE CARE HOSPITALS</Text>
              <Text style={styles.tagline}>Your Health, Our Priority</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.enterButton}
                onPress={handleEnterApp}
                activeOpacity={0.9}
              >
                <Text style={styles.enterButtonText}>Enter KBR Life Care</Text>
                <Ionicons name="arrow-forward" size={18} color="#4A90E2" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.emergencyButton}
                onPress={handleEmergencyCall}
                activeOpacity={0.9}
              >
                <Ionicons name="call" size={18} color="white" />
                <Text style={styles.emergencyButtonText}>Emergency - 1800 419 1397</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Powered by</Text>
              <Text style={styles.footerBrand}>BRISTLETECH</Text>
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2C3E50', // Professional medical background
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Light overlay
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Account for status bar
    paddingBottom: 40,
  },
  
  // Logo Styles
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  crossVertical: {
    position: 'absolute',
    width: 12,
    height: 40,
    backgroundColor: '#DC143C',
    borderRadius: 6,
    top: 20,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 40,
    height: 12,
    backgroundColor: '#DC143C',
    borderRadius: 6,
    top: 34,
  },
  logoText: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC143C',
    top: 65,
    letterSpacing: 1,
  },
  logoSubtext: {
    position: 'absolute',
    fontSize: 8,
    color: '#9C27B0',
    top: 85,
    fontWeight: '500',
  },
  
  // Text Styles
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  hospitalName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 32,
  },
  tagline: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    fontWeight: '400',
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  
  // Button Styles
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  enterButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
  },
  enterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  emergencyButton: {
    backgroundColor: '#DC143C',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  
  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  footerBrand: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SplashScreen;