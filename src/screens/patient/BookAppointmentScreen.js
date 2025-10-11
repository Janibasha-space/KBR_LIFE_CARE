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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';

// Helper function to create transparent colors
const getTransparentColor = (color, opacity) => `${color}${opacity}`;

const BookAppointmentScreen = ({ navigation, route }) => {
  const [selectedService, setSelectedService] = useState(null);
  const { getAllServices } = useServices();
  
  // Get services from context
  const allServices = getAllServices();
  
  // Filter services by category if passed from ServicesScreen
  const categoryFilter = route?.params?.category;
  const services = categoryFilter 
    ? allServices.filter(service => service.category === categoryFilter)
    : allServices;

  const renderServiceCard = (service) => {
    // Safety checks
    if (!service || !service.id) {
      return null;
    }

    return (
      <View key={service.id} style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
          <View style={styles.serviceLeft}>
            <View style={[styles.serviceIconContainer, { backgroundColor: getTransparentColor(service.color || '#4285F4', '15') }]}>
              <Ionicons name={service.icon || 'medical-outline'} size={24} color={service.color || '#4285F4'} />
            </View>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceTitle}>{String(service.name || 'Service')}</Text>
              <Text style={styles.serviceDescription}>{String(service.description || 'Description')}</Text>
            </View>
          </View>
        </View>
      
        {/* Service Tags */}
        <View style={styles.tagsContainer}>
          {(service.tags && Array.isArray(service.tags)) ? service.tags.map((tag, index) => (
            <View key={index} style={styles.tagItem}>
              <Text style={styles.tagText}>{String(tag || '')}</Text>
            </View>
          )) : null}
        </View>

        {/* Book Appointment Button */}
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => {
            // Handle book appointment
            console.log('Book appointment for:', service.name);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

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
              <Text style={styles.headerSubtitle}>Book Appointment</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.loginButton}>
            <Ionicons name="log-in-outline" size={16} color={Colors.white} />
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Progress Header */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Book Appointment</Text>
            <Text style={styles.progressStep}>Step 1 of 6</Text>
          </View>

          {/* Section Title */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Select Service</Text>
            <Text style={styles.sectionSubtitle}>Choose the medical service you need</Text>
          </View>

          {/* Services List */}
          <View style={styles.servicesSection}>
            {services && services.length > 0 ? (
              services.map(renderServiceCard)
            ) : (
              <View style={styles.noServicesContainer}>
                <Text style={styles.noServicesText}>No services available</Text>
                <Text style={styles.noServicesSubtext}>Please check back later or contact support</Text>
              </View>
            )}
          </View>

          {/* Continue Button */}
          {selectedService && (
            <View style={styles.buttonSection}>
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => {
                  // Navigate to next step
                  console.log('Continue to next step with service:', selectedService);
                }}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          )}
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
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
  },
  loginText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
  },
  scrollView: {
    flex: 1,
  },
  progressSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  progressStep: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionTitleContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.xl,
    paddingBottom: Sizes.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  sectionSubtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  servicesSection: {
    paddingHorizontal: Sizes.screenPadding,
    gap: Sizes.md,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    marginBottom: Sizes.md,
  },
  serviceLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  serviceDescription: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Sizes.md,
    gap: Sizes.xs,
  },
  tagItem: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: Sizes.xs,
    marginBottom: Sizes.xs,
  },
  tagText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: Colors.kbrBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    gap: Sizes.xs,
  },
  bookButtonText: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.xl,
  },
  continueButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusLarge,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.white,
    marginRight: Sizes.sm,
  },
  noServicesContainer: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  noServicesText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  noServicesSubtext: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default BookAppointmentScreen;