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

const AppointmentScreen = ({ navigation }) => {
  const { getAllServices } = useServices();
  const [selectedService, setSelectedService] = useState(null);
  
  // Fallback services data in case context has issues
  const fallbackServices = [
    {
      id: 'general-medicine',
      name: 'General Medicine',
      description: 'Primary healthcare and comprehensive medical consultation for all age groups',
      duration: '20 mins',
      icon: 'medical-outline',
      color: '#4285F4',
    },
    {
      id: 'diabetology',
      name: 'Diabetology',
      description: 'Specialized care for diabetes management and metabolic disorders',
      duration: '30 mins',
      icon: 'pulse-outline',
      color: '#4285F4',
    },
    {
      id: 'gynecology',
      name: 'Obstetrics & Gynecology',
      description: 'Complete women\'s health services and reproductive care',
      duration: '30 mins',
      icon: 'person-outline',
      color: '#4285F4',
    },
    {
      id: 'trauma-surgery',
      name: 'Trauma & Maxillofacial Surgery',
      description: 'Emergency trauma care and facial reconstruction surgery',
      duration: '45 mins',
      icon: 'medical',
      color: '#4285F4',
    },
  ];
  
  // Get services from context and show them like in the reference image
  let allServices;
  try {
    allServices = getAllServices();
  } catch (error) {
    console.error('Error getting services from context:', error);
    allServices = [];
  }
  
  const services = (allServices && allServices.length > 0) ? allServices : fallbackServices;

  const renderServiceCard = (service) => {
    // Safety checks to prevent rendering errors
    if (!service || !service.id) {
      return null;
    }

    // Ensure all values are strings to prevent rendering errors
    const serviceName = String(service.name || 'Service Name');
    const serviceDescription = String(service.description || 'Service description');
    const serviceDuration = String(service.duration || '30 mins');
    const serviceIcon = String(service.icon || 'medical-outline');

    return (
      <TouchableOpacity 
        key={service.id} 
        style={styles.serviceCard}
        onPress={() => setSelectedService(service)}
        activeOpacity={0.8}
      >
        <View style={styles.serviceHeader}>
          <View style={styles.serviceIconContainer}>
            <Ionicons name={serviceIcon} size={24} color="#4285F4" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{serviceName}</Text>
            <Text style={styles.serviceDescription}>{serviceDescription}</Text>
          </View>
          <View style={styles.serviceDuration}>
            <Text style={styles.durationText}>{serviceDuration}</Text>
          </View>
        </View>
      </TouchableOpacity>
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
    paddingBottom: Sizes.xxl,
  },
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
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
  serviceDuration: {
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
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

export default AppointmentScreen;