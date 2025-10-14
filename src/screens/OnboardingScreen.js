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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Sizes } from '../constants/theme';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    title: 'Book Appointments',
    subtitle: 'Schedule your medical appointments with ease',
    image: require('../../assets/Gemini_Generated_Image_5ppbdb5ppbdb5ppb.png'),
  },
  {
    id: '2',
    title: 'Expert Care',
    subtitle: 'Get treated by experienced medical professionals',
    image: require('../../assets/hospital-logo.jpeg'),
  },
  {
    id: '3',
    title: '24/7 Support',
    subtitle: 'Round-the-clock medical assistance and care',
    image: require('../../assets/Gemini_Generated_Image_5ppbdb5ppbdb5ppb.png'),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

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

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { 
                backgroundColor: index === currentIndex ? '#4AA3DF' : '#E0E0E0',
                opacity: index === currentIndex ? 1 : 0.4,
                transform: [{ scale: index === currentIndex ? 1.2 : 1 }]
              }
            ]}
          />
        ))}
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
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
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
    minHeight: 60,
  },
  skipButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: 'rgba(74, 163, 223, 0.1)',
  },
  skipText: {
    fontSize: Sizes.regular,
    color: '#4AA3DF',
    fontWeight: '600',
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Sizes.screenPadding * 1.5,
    paddingBottom: 80, // Space for footer
  },
  image: {
    width: width * 0.65, // Responsive image size
    height: width * 0.65,
    marginBottom: Sizes.xl * 1.5,
    borderRadius: Sizes.radiusLarge,
  },
  title: {
    fontSize: Sizes.xxlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: Sizes.large,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: Sizes.md,
    maxWidth: width * 0.8,
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
    opacity: 0.3,
  },
  nextButton: {
    backgroundColor: '#4AA3DF',
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    shadowColor: '#4AA3DF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 5, // Prevent cut-off
  },
  nextButtonText: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.3,
  },
});

export default OnboardingScreen;