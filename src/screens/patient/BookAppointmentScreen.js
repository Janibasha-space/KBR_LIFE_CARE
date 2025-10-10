import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

// Helper function to create transparent colors
const getTransparentColor = (color, opacity) => `${color}${opacity}`;

const BookAppointmentScreen = ({ navigation }) => {
  const [selectedService, setSelectedService] = useState(null);

  const services = [
    {
      id: 'general',
      title: 'General Medicine',
      description: 'Primary healthcare and comprehensive medical consultation for all age groups',
      duration: '20 mins',
      icon: 'medical-outline',
      color: Colors.kbrBlue,
    },
    {
      id: 'diabetology',
      title: 'Diabetology',
      description: 'Specialized care for diabetes management and metabolic disorders',
      duration: '30 mins',
      icon: 'pulse-outline',
      color: Colors.kbrBlue,
    },
    {
      id: 'gynecology',
      title: 'Obstetrics & Gynecology',
      description: "Complete women's health services and reproductive care",
      duration: '30 mins',
      icon: 'person-outline',
      color: Colors.kbrBlue,
    },
  ];

  const renderServiceCard = (service) => (
    <TouchableOpacity
      key={service.id}
      style={[
        styles.serviceCard,
        selectedService === service.id && styles.selectedServiceCard
      ]}
      onPress={() => setSelectedService(service.id)}
      activeOpacity={0.8}
    >
      <View style={styles.serviceContent}>
        <View style={styles.serviceLeft}>
          <View style={[styles.serviceIconContainer, { backgroundColor: getTransparentColor(service.color, '15') }]}>
            <Ionicons name={service.icon} size={24} color={service.color} />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </View>
        </View>
        <View style={styles.serviceRight}>
          <Text style={styles.serviceDuration}>{service.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
          <View style={styles.headerLogo}>
            <Ionicons name="medical" size={20} color={Colors.white} />
          </View>
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
          {services.map(renderServiceCard)}
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
      </ScrollView>    </SafeAreaView>
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
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Sizes.md,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedServiceCard: {
    borderColor: Colors.kbrBlue,
    backgroundColor: Colors.kbrBlue + '05',
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
  serviceRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: Sizes.sm,
  },
  serviceDuration: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
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
});

export default BookAppointmentScreen;