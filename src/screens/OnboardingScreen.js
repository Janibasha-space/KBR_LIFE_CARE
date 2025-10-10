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
              { backgroundColor: index === currentIndex ? Colors.primary : Colors.lightGray }
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
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
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
    paddingTop: Sizes.md,
  },
  skipButton: {
    padding: Sizes.sm,
  },
  skipText: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.md,
  },
  subtitle: {
    fontSize: Sizes.large,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.xl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: Sizes.radiusMedium,
    paddingVertical: Sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: Sizes.buttonHeight,
  },
  nextButtonText: {
    fontSize: Sizes.large,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default OnboardingScreen;