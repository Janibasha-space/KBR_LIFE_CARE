import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/theme';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';
import AuthModal from '../components/AuthModal';

const { width } = Dimensions.get('window');

// Ensure each item has a completely unique ID
const onboardingData = [
  {
    id: 'onboarding_bookAppointments_1',
    title: 'Book Appointments',
    subtitle: 'Schedule your medical appointments with ease',
    image: require('../../assets/book appointment.jpeg'),
  },
  {
    id: 'onboarding_expertCare_2',
    title: 'Expert Care',
    subtitle: 'Get treated by experienced medical professionals',
    image: require('../../assets/expert care.jpeg'),
  },
  {
    id: 'onboarding_support_3',
    title: '24/7 Support',
    subtitle: 'Round-the-clock medical assistance and care',
    image: require('../../assets/support.jpeg'),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const { login } = useUnifiedAuth();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex });
    } else {
      navigation.replace('PatientMain');
    }
  };

  const handleSkip = () => {
    navigation.replace('PatientMain');
  };



  // Render function now inline in FlatList

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((item, index) => {
          const dotKey = `onboarding-dot-${item.id}-${index}`;
          return (
            <View
              key={dotKey}
              style={[
                styles.dot,
                { 
                  backgroundColor: index === currentIndex ? '#4AA3DF' : '#E0E0E0',
                  opacity: index === currentIndex ? 1 : 0.4,
                  width: index === currentIndex ? 18 : 8, // Make active dot wider instead of larger
                  transform: [{ scale: index === currentIndex ? 1.05 : 1 }]
                }
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={({ item, index }) => (
          <View key={`slide-${item.id}-${index}`} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image 
                source={item.image} 
                style={styles.image} 
                resizeMode="cover" 
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => `onboarding-item-${item.id}-${index}`}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
      />

      <View style={styles.footer}>
        {renderDots()}
        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Auth Modal */}
      <AuthModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.lg,
    paddingBottom: Sizes.md,
    minHeight: 50,
  },
  skipButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: 'rgba(74, 163, 223, 0.1)',
  },
  skipText: {
    fontSize: 15,
    color: '#4AA3DF',
    fontWeight: '500', // Medium weight for better legibility
    letterSpacing: 0.2,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Sizes.screenPadding * 1.5,
    paddingBottom: 80, // Space for footer
  },
  imageContainer: {
    width: width * 0.85,
    height: width * 0.7,
    borderRadius: Sizes.radiusLarge,
    overflow: 'hidden',
    marginBottom: Sizes.xl * 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: Sizes.radiusLarge,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 26,
    fontWeight: '700', // Slightly lighter than bold for a more modern look
    color: '#2D3748', // Darker, richer color for better contrast
    textAlign: 'center',
    marginBottom: Sizes.md,
    letterSpacing: 0.3, // Slightly tighter letter spacing
    includeFontPadding: false, // Removes extra padding
    fontFamily: 'System', // Using system font for clean look
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400', // Regular weight for subtitle
    color: '#718096', // Softer gray that looks more professional
    textAlign: 'center',
    lineHeight: 22, // Tighter line height for cleaner appearance
    paddingHorizontal: Sizes.md,
    maxWidth: width * 0.75, // Slightly narrower for better readability
    letterSpacing: 0.2, // Subtle letter spacing
  },
  textContainer: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    alignItems: 'center',
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.md,
    paddingBottom: Sizes.lg + 10, // Extra padding for safe area
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.xl,
    paddingVertical: Sizes.sm,
  },
  dot: {
    width: 8, // Smaller dots look more modern and elegant
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    opacity: 0.35,
  },
  nextButton: {
    backgroundColor: '#4AA3DF',
    borderRadius: 12, // More modern, slightly rounder corners
    paddingVertical: 14,
    paddingHorizontal: Sizes.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // Slightly taller button for better touch target
    shadowColor: '#3182CE', // Darker shadow color for depth
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 5, // Prevent cut-off
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.5, // Slightly increased for emphasis
    textTransform: 'capitalize', // Makes the text look more professional
  },
});

export default OnboardingScreen;