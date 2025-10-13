﻿/**
 * KBR LIFE CARE HOSPITALS - COMPREHENSIVE HOME SCREEN
 * React Native version of the complete KBR Hospital home page
 * Features: Hero section, Doctors carousel, Services, Health packages, Tests, Contact
 * Theme: Blue (#4AA3DF), White (#FFFFFF), Red (#C62828)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  Modal,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import AppHeader from '../../components/AppHeader';

const { width: screenWidth } = Dimensions.get('window');

// Sample data - same as web version but adapted for React Native
const doctors = [
  {
    id: 1,
    name: "DR. K. RAMESH",
    credentials: "M.B.B.S., M.D",
    role: "General Physician",
    fellowship: "Fellowship in Echocardiography",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
    expertise: [
      "Infectious diseases (Dengue, Malaria, RTIs, COVID-19)",
      "Sepsis & Critical Care management",
      "Chronic illnesses: Diabetes, Hypertension, Hypothyroidism",
      "Medical emergencies: Poisonings, Snake bites, DKA",
      "Preventive medicine & health screening"
    ]
  },
  {
    id: 2,
    name: "DR. K. THUKARAM",
    credentials: "B.D.S, M.D.S (Dental)",
    role: "Orthodontics & Dentofacial Orthopaedics",
    fellowship: "",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
    expertise: [
      "Orthodontic treatment, Invisalign/Aligners",
      "Teeth whitening & cleaning, Laser dentistry",
      "RCT (Root Canal), Cosmetic dentistry",
      "Oral & Maxillofacial surgery, Dental implants",
      "Pediatric dentistry & preventive care"
    ]
  },
  {
    id: 3,
    name: "DR. K. DIVYAVANI",
    credentials: "M.B.B.S, M.S (OBG)",
    role: "Obstetrician & Gynaecologist",
    fellowship: "",
    image: "https://images.unsplash.com/photo-1594824804732-ca8ace6a77cf?w=400&q=80",
    expertise: [
      "24/7 elective & emergency delivery & LSCS",
      "Antenatal check-ups, High-risk pregnancy care",
      "Normal & painless delivery, Family-planning surgery",
      "Ectopic pregnancy management",
      "Gynecological surgeries & minimally invasive procedures"
    ]
  }
];

const healthPackages = [
  {
    id: 1,
    name: "Basic Health Checkup",
    price: "₹1,999",
    popular: false,
    features: [
      "Complete Blood Count",
      "Blood Sugar Test",
      "Lipid Profile",
      "Kidney Function Test",
      "Doctor Consultation"
    ]
  },
  {
    id: 2,
    name: "Comprehensive Health Package",
    price: "₹4,999",
    popular: true,
    features: [
      "All Basic Tests",
      "Thyroid Profile",
      "Liver Function Test",
      "ECG",
      "X-Ray Chest",
      "USG Abdomen",
      "Specialist Consultation"
    ]
  },
  {
    id: 3,
    name: "Executive Health Checkup",
    price: "₹8,999",
    popular: false,
    features: [
      "All Comprehensive Tests",
      "2D Echo",
      "Stress Test",
      "Cancer Markers",
      "Full Body Checkup",
      "Nutrition Counseling",
      "Follow-up Consultation"
    ]
  }
];

const popularTests = [
  { id: 1, name: "Complete Blood Count (CBC)", price: "₹350" },
  { id: 2, name: "Lipid Profile", price: "₹500" },
  { id: 3, name: "Thyroid Profile (T3, T4, TSH)", price: "₹450" },
  { id: 4, name: "HbA1c (Diabetes)", price: "₹400" },
  { id: 5, name: "Liver Function Test (LFT)", price: "₹600" },
  { id: 6, name: "Kidney Function Test (KFT)", price: "₹550" }
];

const PatientHomeScreen = ({ navigation }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginTab, setLoginTab] = useState('signin');
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const autoPlayRef = useRef(null);
  
  // Get services from context
  const { getAllServices } = useServices();
  const allServices = getAllServices();
  const services = allServices && allServices.length > 0 ? allServices.slice(0, 4) : []; // Show only first 4 services for home screen
  
  // Get user context
  const { isLoggedIn, userData, loginUser } = useUser();
  
  // Get theme context
  const { theme } = useTheme();

  // Patient admission status - Mock data for demonstration
  // Only show this data when user is logged in
  const [patientStatus, setPatientStatus] = useState(() => {
    // Only return admission data if user is logged in and is a patient
    if (!isLoggedIn || !userData) {
      return { isAdmitted: false };
    }
    
    // Mock admission data for logged-in patients
    // In real app, this would come from API based on user ID
    return {
      isAdmitted: true, // This would be fetched from backend
      admissionType: 'IP', // IP or OP
      roomNumber: '201',
      roomType: 'Private Deluxe',
      bedNumber: 'A1',
      admissionDate: '2024-01-10',
      estimatedDischargeDate: '2024-01-18',
      currentDoctor: 'Dr. K. Ramesh',
      department: 'General Medicine',
      treatments: [
        { id: 1, name: 'IV Antibiotics', status: 'Ongoing', time: '8:00 AM, 2:00 PM, 8:00 PM' },
        { id: 2, name: 'Blood Pressure Monitoring', status: 'Daily', time: '6:00 AM, 12:00 PM, 6:00 PM' },
        { id: 3, name: 'Physical Therapy', status: 'Scheduled', time: '10:00 AM' }
      ],
      upcomingTests: [
        { id: 1, name: 'Blood Test', scheduledTime: '2024-01-16 7:00 AM', department: 'Lab' },
        { id: 2, name: 'X-Ray Chest', scheduledTime: '2024-01-16 10:00 AM', department: 'Radiology' }
      ],
      meals: {
        breakfast: 'Served at 8:00 AM',
        lunch: 'Served at 12:30 PM',
        dinner: 'Served at 7:00 PM'
      },
      visitors: {
        allowedHours: '10:00 AM - 8:00 PM',
        maxVisitors: 2
      },
      emergencyContact: '+91 98765 43210'
    };
  });

  // Update patient status when login state changes
  useEffect(() => {
    if (!isLoggedIn || !userData) {
      setPatientStatus({ isAdmitted: false });
    } else {
      // In real app, fetch patient admission status from API
      // For demo, set mock data for logged-in patients
      setPatientStatus({
        isAdmitted: true, // This would be fetched from backend based on userData.id
        admissionType: 'IP',
        roomNumber: '201',
        roomType: 'Private Deluxe',
        bedNumber: 'A1',
        admissionDate: '2024-01-10',
        estimatedDischargeDate: '2024-01-18',
        currentDoctor: 'Dr. K. Ramesh',
        department: 'General Medicine',
        treatments: [
          { id: 1, name: 'IV Antibiotics', status: 'Ongoing', time: '8:00 AM, 2:00 PM, 8:00 PM' },
          { id: 2, name: 'Blood Pressure Monitoring', status: 'Daily', time: '6:00 AM, 12:00 PM, 6:00 PM' },
          { id: 3, name: 'Physical Therapy', status: 'Scheduled', time: '10:00 AM' }
        ],
        upcomingTests: [
          { id: 1, name: 'Blood Test', scheduledTime: '2024-01-16 7:00 AM', department: 'Lab' },
          { id: 2, name: 'X-Ray Chest', scheduledTime: '2024-01-16 10:00 AM', department: 'Radiology' }
        ],
        meals: {
          breakfast: 'Served at 8:00 AM',
          lunch: 'Served at 12:30 PM',
          dinner: 'Served at 7:00 PM'
        },
        visitors: {
          allowedHours: '10:00 AM - 8:00 PM',
          maxVisitors: 2
        },
        emergencyContact: '+91 98765 43210'
      });
    }
  }, [isLoggedIn, userData]);

  // Initialize loading state with network error handling
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Quick initialization without network dependencies
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        // Even if there's an error, show the app
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Doctor carousel auto-play
  useEffect(() => {
    if (isPlaying && !isLoading) {
      autoPlayRef.current = setInterval(() => {
        setCurrentDoctorIndex((prev) => (prev + 1) % doctors.length);
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, isLoading]);

  const handleLogin = () => {
    if (loginTab === 'signin') {
      // Admin credentials
      if (email === "admin@kbrhospitals.com" && password === "admin123") {
        setShowLoginModal(false);
        setShowAdminModal(false);
        Alert.alert(
          'Admin Login Successful! 🎉',
          'Welcome to Admin Dashboard',
          [{ text: 'Continue', onPress: () => navigation.navigate('AdminMain') }]
        );
      }
      // Patient credentials
      else if (email === "patient@kbr.com" && password === "patient123") {
        // Login the patient using UserContext
        const patientData = {
          id: 'patient_001',
          name: 'John Doe',
          email: email,
          mobileNumber: '+919876543210',
          age: 30,
          gender: 'Male',
          isPatient: true
        };
        loginUser(patientData);
        
        setShowLoginModal(false);
        Alert.alert(
          'Patient Login Successful! 🎉',
          'Welcome to Patient Portal',
          [{ text: 'Continue' }]
        );
      }
      else {
        Alert.alert(
          '❌ Invalid Credentials',
          'Demo Accounts:\n👨‍⚕️ Admin: admin@kbrhospitals.com / admin123\n🏥 Patient: patient@kbr.com / patient123'
        );
      }
    } else {
      // For signup, create a new patient account
      const newPatientData = {
        id: Date.now().toString(),
        name: 'New Patient',
        email: email,
        mobileNumber: '+919876543211',
        age: 25,
        gender: 'Male',
        isPatient: true
      };
      loginUser(newPatientData);
      
      Alert.alert('✅ Account Created Successfully!', 'Welcome to KBR Life Care Hospitals!');
      setShowLoginModal(false);
    }
  };

  const handleServicePress = (serviceName) => {
    switch (serviceName) {
      case 'Book Appointment':
        navigation.navigate('BookAppointment');
        break;
      case 'Services':
        navigation.navigate('Services');
        break;
      case 'Reports':
        navigation.navigate('Reports');
        break;
      case 'Pharmacy':
        navigation.navigate('Pharmacy');
        break;
      default:
        Alert.alert('Coming Soon', `${serviceName} feature will be available soon!`);
    }
  };

  const makeCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendEmail = (emailAddress) => {
    Linking.openURL(`mailto:${emailAddress}`);
  };

  // Render Patient Treatment Status for admitted patients
  const renderPatientTreatmentStatus = () => {
    // Only show treatment status if user is logged in AND patient is admitted
    if (!isLoggedIn || !userData || !patientStatus.isAdmitted) return null;

    return (
      <View style={styles.treatmentStatusContainer}>
        <View style={styles.treatmentHeader}>
          <View style={styles.treatmentHeaderLeft}>
            <View style={styles.admissionBadge}>
              <Ionicons name="medical" size={16} color="#FFFFFF" />
              <Text style={styles.admissionBadgeText}>{patientStatus.admissionType}</Text>
            </View>
            <View style={styles.treatmentInfo}>
              <Text style={styles.treatmentTitle}>Current Treatment</Text>
              <Text style={styles.treatmentSubtitle}>Room {patientStatus.roomNumber} • {patientStatus.roomType}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.expandButton}>
            <Ionicons name="chevron-down" size={20} color={Colors.kbrBlue} />
          </TouchableOpacity>
        </View>

        <View style={styles.treatmentContent}>
          {/* Doctor & Department */}
          <View style={styles.treatmentRow}>
            <View style={styles.treatmentItem}>
              <Ionicons name="person" size={16} color={Colors.kbrBlue} />
              <Text style={styles.treatmentLabel}>Doctor</Text>
              <Text style={styles.treatmentValue}>{patientStatus.currentDoctor}</Text>
            </View>
            <View style={styles.treatmentItem}>
              <Ionicons name="medical" size={16} color={Colors.kbrBlue} />
              <Text style={styles.treatmentLabel}>Department</Text>
              <Text style={styles.treatmentValue}>{patientStatus.department}</Text>
            </View>
          </View>

          {/* Admission Details */}
          <View style={styles.treatmentRow}>
            <View style={styles.treatmentItem}>
              <Ionicons name="calendar" size={16} color={Colors.kbrGreen} />
              <Text style={styles.treatmentLabel}>Admitted</Text>
              <Text style={styles.treatmentValue}>{patientStatus.admissionDate}</Text>
            </View>
            <View style={styles.treatmentItem}>
              <Ionicons name="time" size={16} color={Colors.kbrPurple} />
              <Text style={styles.treatmentLabel}>Est. Discharge</Text>
              <Text style={styles.treatmentValue}>{patientStatus.estimatedDischargeDate}</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="clipboard" size={16} color={Colors.kbrBlue} />
              <Text style={styles.quickActionText}>Treatments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="flask" size={16} color={Colors.kbrGreen} />
              <Text style={styles.quickActionText}>Tests</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="restaurant" size={16} color={Colors.kbrPurple} />
              <Text style={styles.quickActionText}>Meals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Ionicons name="call" size={16} color={Colors.kbrRed} />
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
          </View>

          {/* Current Treatments Preview */}
          <View style={styles.treatmentsPreview}>
            <Text style={styles.previewTitle}>Today's Treatments</Text>
            {patientStatus.treatments.slice(0, 2).map((treatment) => (
              <View key={treatment.id} style={styles.treatmentItemPreview}>
                <View style={styles.treatmentStatus}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: treatment.status === 'Ongoing' ? Colors.kbrGreen : 
                                   treatment.status === 'Scheduled' ? Colors.kbrBlue : Colors.kbrPurple 
                  }]} />
                  <Text style={styles.treatmentName}>{treatment.name}</Text>
                </View>
                <Text style={styles.treatmentTime}>{treatment.time}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.viewAllTreatments}>
              <Text style={styles.viewAllText}>View All Treatments</Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.kbrBlue} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#4AA3DF" barStyle="light-content" translucent={false} />
        <SafeAreaView style={styles.loadingScreen}>
          <View style={styles.loadingContent}>
            <View style={styles.loadingLogo}>
              <Image 
                source={require('../../../assets/hospital-logo.jpeg')}
                style={styles.loadingLogoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.loadingTitle}>KBR LIFE CARE HOSPITALS</Text>
            <Text style={styles.loadingSubtitle}>Loading your healthcare portal...</Text>
            <ActivityIndicator size="large" color="#4AA3DF" style={styles.loadingSpinner} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        backgroundColor={theme.primary} 
        barStyle="light-content" 
        translucent={false} 
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        {/* App Header */}
        <AppHeader 
          subtitle="Excellence in Healthcare"
          navigation={navigation}
        />
        
        {/* Admin Portal & Notifications */}
        <View style={styles.secondaryHeader}>
          <TouchableOpacity
            style={styles.adminPortalButton}
            onPress={() => setShowAdminModal(true)}
          >
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.adminPortalText}>Admin Portal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setShowNotifications(!showNotifications)}
          >
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Patient Treatment Status - Show if patient is admitted */}
        {renderPatientTreatmentStatus()}

        <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
          {/* Hero Section - Simplified for better loading */}
          <View style={[styles.heroSection, { backgroundColor: theme.background }]}>
            <View style={styles.heroFallback}>
              <View style={styles.heroIcon}>
                <Image 
                  source={require('../../../assets/hospital-logo.jpeg')}
                  style={styles.heroLogoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>Welcome to KBR Life Care Hospitals, Sangareddy</Text>
              <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
                We blend compassionate care with cutting-edge medicine, driven by a dedicated team prioritizing your well-being.
              </Text>
            </View>
          </View>

          {/* Vision & Mission */}
          <View style={[styles.visionSection, { backgroundColor: theme.background }]}>
            <View style={[styles.visionItem, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.visionTitle, { color: theme.textPrimary }]}>Our Vision</Text>
              <Text style={[styles.visionText, { color: theme.textSecondary }]}>
                To be the preferred healthcare provider in Sangareddy and beyond, delivering world-class medical services with compassion, innovation, and excellence.
              </Text>
            </View>
            <View style={[styles.visionItem, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.visionTitle, { color: theme.textPrimary }]}>Our Mission</Text>
              <Text style={[styles.visionText, { color: theme.textSecondary }]}>
                Providing accessible, affordable, and advanced healthcare through dedicated professionals, state-of-the-art facilities, and patient-centered approach.
              </Text>
            </View>
          </View>

          {/* Doctors Carousel */}
          <View style={styles.doctorsSection}>
            <Text style={styles.sectionTitle}>Meet Our Expert Doctors</Text>
            <Text style={styles.sectionSubtitle}>Experienced specialists dedicated to your health</Text>
            
            <View style={styles.doctorCard}>
              <View style={styles.doctorImageContainer}>
                <View style={styles.doctorImageWrapper}>
                  <View style={styles.doctorPlaceholder}>
                    <Ionicons name="person" size={60} color="#4AA3DF" />
                  </View>
                </View>
                
                <View style={styles.carouselControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setCurrentDoctorIndex((prev) => (prev - 1 + doctors.length) % doctors.length)}
                  >
                    <Ionicons name="chevron-back" size={20} color="#4AA3DF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.controlButton, styles.playButton]}
                    onPress={() => setIsPlaying(!isPlaying)}
                  >
                    <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setCurrentDoctorIndex((prev) => (prev + 1) % doctors.length)}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#4AA3DF" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.dotsIndicator}>
                  {doctors.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dot,
                        index === currentDoctorIndex && styles.activeDot
                      ]}
                      onPress={() => setCurrentDoctorIndex(index)}
                    />
                  ))}
                </View>
              </View>
              
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctors[currentDoctorIndex].name}</Text>
                <Text style={styles.doctorCredentials}>{doctors[currentDoctorIndex].credentials}</Text>
                <Text style={styles.doctorRole}>{doctors[currentDoctorIndex].role}</Text>
                {doctors[currentDoctorIndex].fellowship && (
                  <Text style={styles.doctorFellowship}>{doctors[currentDoctorIndex].fellowship}</Text>
                )}
                
                <View style={styles.expertiseSection}>
                  <Text style={styles.expertiseTitle}>Areas of Expertise:</Text>
                  {doctors[currentDoctorIndex].expertise.map((item, index) => (
                    <View key={index} style={styles.expertiseItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4AA3DF" />
                      <Text style={styles.expertiseText}>{item}</Text>
                    </View>
                  ))}
                </View>
                
                <TouchableOpacity
                  style={styles.bookAppointmentButton}
                  onPress={() => handleServicePress('Book Appointment')}
                >
                  <Text style={styles.bookAppointmentText}>Book Appointment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="people" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>10,000+</Text>
                <Text style={styles.statLabel}>Patients Treated</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="trophy" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>15+</Text>
                <Text style={styles.statLabel}>Years Experience</Text>
              </View>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Ionicons name="medical" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>25+</Text>
                <Text style={styles.statLabel}>Expert Doctors</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="heart" size={32} color="#FFFFFF" />
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>Success Rate</Text>
              </View>
            </View>
          </View>

          {/* Services Section */}
          <View style={styles.servicesSection}>
            <Text style={styles.sectionTitle}>Our Medical Services</Text>
            <Text style={styles.sectionSubtitle}>Comprehensive healthcare solutions for you and your family</Text>
            
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity key={service.id} style={styles.serviceCard}>
                  <View style={[styles.serviceIcon, { backgroundColor: service.color || '#E6F4FB' }]}>
                    <Ionicons name={service.icon || 'medical-outline'} size={28} color="#333333" />
                  </View>
                  <Text style={styles.serviceTitle}>{service.name || 'Service'}</Text>
                  <Text style={styles.serviceDescription}>{service.description || 'Description not available'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Health Packages - Simplified */}
          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>Health Packages</Text>
            <Text style={styles.sectionSubtitle}>Comprehensive checkups tailored to your needs</Text>
            
            <View style={styles.quickPackagesGrid}>
              <TouchableOpacity style={styles.quickPackageCard} onPress={() => setShowLoginModal(true)}>
                <Text style={styles.quickPackageName}>Basic Checkup</Text>
                <Text style={styles.quickPackagePrice}>₹1,999</Text>
                <Text style={styles.quickPackageButton}>Book Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.quickPackageCard, styles.popularQuickPackage]} onPress={() => setShowLoginModal(true)}>
                <View style={styles.quickPopularBadge}>
                  <Text style={styles.quickPopularText}>Popular</Text>
                </View>
                <Text style={styles.quickPackageName}>Comprehensive</Text>
                <Text style={styles.quickPackagePrice}>₹4,999</Text>
                <Text style={styles.quickPackageButton}>Book Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickPackageCard} onPress={() => setShowLoginModal(true)}>
                <Text style={styles.quickPackageName}>Executive</Text>
                <Text style={styles.quickPackagePrice}>₹8,999</Text>
                <Text style={styles.quickPackageButton}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Popular Tests - Simplified */}
          <View style={styles.testsSection}>
            <Text style={styles.sectionTitle}>Popular Diagnostic Tests</Text>
            <Text style={styles.sectionSubtitle}>Quick and accurate test results</Text>
            
            <View style={styles.quickTestsContainer}>
              <TouchableOpacity style={styles.quickTestCard}>
                <Text style={styles.quickTestName}>CBC</Text>
                <Text style={styles.quickTestPrice}>₹350</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickTestCard}>
                <Text style={styles.quickTestName}>Lipid Profile</Text>
                <Text style={styles.quickTestPrice}>₹500</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickTestCard}>
                <Text style={styles.quickTestName}>Thyroid</Text>
                <Text style={styles.quickTestPrice}>₹450</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickTestCard}>
                <Text style={styles.quickTestName}>HbA1c</Text>
                <Text style={styles.quickTestPrice}>₹400</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.sectionTitle}>Get In Touch</Text>
            <Text style={styles.sectionSubtitle}>We're here to help you 24/7</Text>
            
            <View style={styles.contactGrid}>
              <TouchableOpacity style={styles.contactCard} onPress={() => makeCall('+918466999000')}>
                <View style={[styles.contactIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="call" size={24} color="#C62828" />
                </View>
                <Text style={styles.contactTitle}>Phone</Text>
                <Text style={styles.contactText}>+91 8466 999 000</Text>
                <Text style={styles.contactSubtext}>24/7 Emergency</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactCard} onPress={() => sendEmail('info@kbrhospitals.com')}>
                <View style={[styles.contactIcon, { backgroundColor: '#E6F4FB' }]}>
                  <Ionicons name="mail" size={24} color="#4AA3DF" />
                </View>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactText}>info@kbrhospitals.com</Text>
                <Text style={styles.contactSubtext}>support@kbrhospitals.com</Text>
              </TouchableOpacity>
              
              <View style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="location" size={24} color="#10B981" />
                </View>
                <Text style={styles.contactTitle}>Location</Text>
                <Text style={styles.contactText}>Sangareddy</Text>
                <Text style={styles.contactSubtext}>Telangana, India</Text>
              </View>
              
              <View style={styles.contactCard}>
                <View style={[styles.contactIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.contactTitle}>Hours</Text>
                <Text style={styles.contactText}>Mon - Sun</Text>
                <Text style={styles.contactSubtext}>24/7 Open</Text>
              </View>
            </View>
          </View>

          {/* Emergency Banner */}
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyTitle}>Emergency? Call Us Now!</Text>
            <Text style={styles.emergencySubtitle}>We're available 24/7 for medical emergencies</Text>
            <TouchableOpacity
              style={styles.emergencyCallButton}
              onPress={() => makeCall('+918466999000')}
            >
              <Ionicons name="call" size={20} color="#C62828" />
              <Text style={styles.emergencyCallText}>Call Emergency: +91 8466 999 000</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Login Modal */}
        <Modal
          visible={showLoginModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLoginModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalLogoSection}>
                  <Image 
                    source={require('../../../assets/hospital-logo.jpeg')}
                    style={styles.modalLogoImage}
                    resizeMode="contain"
                  />
                  <View>
                    <Text style={styles.modalTitle}>Sign In to Continue</Text>
                    <Text style={styles.modalSubtitle}>Access your KBR healthcare account</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, loginTab === 'signin' && styles.activeTab]}
                  onPress={() => setLoginTab('signin')}
                >
                  <Text style={[styles.tabText, loginTab === 'signin' && styles.activeTabText]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, loginTab === 'signup' && styles.activeTab]}
                  onPress={() => setLoginTab('signup')}
                >
                  <Text style={[styles.tabText, loginTab === 'signup' && styles.activeTabText]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {loginTab === 'signin' && (
                <View style={styles.credentialsInfo}>
                  <View style={styles.credentialCard}>
                    <Text style={styles.credentialTitle}>🔑 Admin Portal Access:</Text>
                    <Text style={styles.credentialText}>admin@kbrhospitals.com</Text>
                    <Text style={styles.credentialText}>admin123</Text>
                  </View>
                  <View style={styles.credentialCard}>
                    <Text style={styles.credentialTitle}>🏥 Patient Portal Access:</Text>
                    <Text style={styles.credentialText}>patient@kbr.com</Text>
                    <Text style={styles.credentialText}>patient123</Text>
                  </View>
                </View>
              )}

              {loginTab === 'signup' && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#999" />
                </TouchableOpacity>
              </View>

              {loginTab === 'signup' && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              )}

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>
                  {loginTab === 'signin' ? 'Sign In & Continue' : 'Create Account & Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Admin Login Modal */}
        <Modal
          visible={showAdminModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAdminModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.adminModalHeader}>
                <Ionicons name="shield-checkmark" size={48} color="#C62828" />
                <Text style={styles.adminModalTitle}>Admin Portal Login</Text>
                <Text style={styles.adminModalSubtitle}>Authorized Access Only</Text>
                <TouchableOpacity
                  style={styles.adminModalClose}
                  onPress={() => setShowAdminModal(false)}
                >
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.adminCredentials}>
                <Text style={styles.adminCredentialTitle}>🔑 Admin Credentials:</Text>
                <Text style={styles.adminCredentialText}>admin@kbrhospitals.com</Text>
                <Text style={styles.adminCredentialText}>admin123</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Enter admin email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#999" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.adminLoginButton} onPress={handleLogin}>
                <Text style={styles.adminLoginButtonText}>Access Admin Portal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <View style={styles.notificationsDropdown}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>3 New</Text>
              </View>
            </View>
            <View style={styles.notificationItem}>
              <View style={styles.notificationDot} />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>Appointment Confirmed</Text>
                <Text style={styles.notificationSubtext}>Your appointment is confirmed for tomorrow at 2:00 PM</Text>
                <Text style={styles.notificationTime}>2 minutes ago</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => setShowNotifications(false)}
            >
              <Text style={styles.viewAllText}>View All Notifications</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Loading Screen Styles
  loadingContainer: {
    flex: 1,
    backgroundColor: '#4AA3DF',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Sizes.screenPadding,
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  loadingLogoImage: {
    width: 60,
    height: 60,
  },
  loadingTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.sm,
  },
  loadingSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.xl,
  },
  loadingSpinner: {
    marginTop: Sizes.lg,
  },
  
  // Main Screen Styles
  container: {
    flex: 1,
    backgroundColor: '#4AA3DF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4AA3DF',
    paddingBottom: Sizes.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.md,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerLogoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  hospitalInfo: {
    marginLeft: Sizes.sm,
  },
  hospitalName: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.white,
  },
  hospitalSubtitle: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.sm,
  },
  actionButton: {
    padding: Sizes.sm,
    borderRadius: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C62828',
  },
  signInButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 20,
  },
  signInText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
  },
  headerBottom: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  adminPortalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#C62828',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
  },
  adminPortalText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Secondary Header Styles (for admin portal and notifications)
  secondaryHeader: {
    backgroundColor: '#4AA3DF',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationButton: {
    padding: Sizes.sm,
    borderRadius: 20,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  scrollView: {
    flex: 1,
  },
  
  // Hero Section - Simplified for better performance
  heroSection: {
    height: 300,
    backgroundColor: 'linear-gradient(135deg, #4AA3DF 0%, #2563EB 100%)',
    position: 'relative',
  },
  heroFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4AA3DF',
    padding: Sizes.screenPadding,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.lg,
    overflow: 'hidden',
  },
  heroLogoImage: {
    width: 60,
    height: 60,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: Sizes.screenPadding,
  },
  heroContent: {
    maxWidth: '100%',
  },
  heroTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Sizes.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.white,
    lineHeight: 20,
    textAlign: 'center',
  },
  
  // Vision Section
  visionSection: {
    backgroundColor: Colors.white,
    padding: Sizes.screenPadding,
  },
  visionItem: {
    marginBottom: Sizes.md,
  },
  visionTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
    textDecorationLine: 'underline',
  },
  visionText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  
  // Doctors Section
  doctorsSection: {
    backgroundColor: '#F8FAFC',
    padding: Sizes.screenPadding,
  },
  sectionTitle: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.sm,
  },
  sectionSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorImageContainer: {
    alignItems: 'center',
    marginBottom: Sizes.lg,
  },
  doctorImageWrapper: {
    width: 200,
    height: 200,
    borderRadius: Sizes.radiusLarge,
    backgroundColor: '#E6F4FB',
    marginBottom: Sizes.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6F4FB',
  },
  carouselControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.md,
    marginBottom: Sizes.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: '#4AA3DF',
  },
  dotsIndicator: {
    flexDirection: 'row',
    gap: Sizes.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  activeDot: {
    backgroundColor: '#4AA3DF',
    width: 20,
  },
  doctorInfo: {
    alignItems: 'center',
  },
  doctorName: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  doctorCredentials: {
    fontSize: Sizes.medium,
    color: '#4AA3DF',
    fontWeight: '600',
    marginBottom: 4,
  },
  doctorRole: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  doctorFellowship: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Sizes.md,
  },
  expertiseSection: {
    width: '100%',
    marginBottom: Sizes.lg,
  },
  expertiseTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  expertiseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Sizes.sm,
  },
  expertiseText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginLeft: Sizes.sm,
    flex: 1,
  },
  bookAppointmentButton: {
    backgroundColor: '#4AA3DF',
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
  },
  bookAppointmentText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
  
  // Stats Section
  statsSection: {
    backgroundColor: '#4AA3DF',
    padding: Sizes.screenPadding,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Sizes.md,
    marginBottom: Sizes.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
  },
  statValue: {
    fontSize: Sizes.xxlarge,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: Sizes.sm,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Sizes.medium,
    color: Colors.white,
    textAlign: 'center',
  },
  
  // Services Section
  servicesSection: {
    backgroundColor: Colors.white,
    padding: Sizes.screenPadding,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: '47%',
    backgroundColor: Colors.white,
    padding: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    alignItems: 'center',
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: Sizes.radiusLarge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.md,
  },
  serviceTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  serviceDescription: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Packages Section - Simplified
  packagesSection: {
    backgroundColor: '#F8FAFC',
    padding: Sizes.screenPadding,
  },
  quickPackagesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  quickPackageCard: {
    backgroundColor: Colors.white,
    padding: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    width: '31%',
    alignItems: 'center',
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  popularQuickPackage: {
    borderColor: '#4AA3DF',
  },
  quickPopularBadge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#C62828',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quickPopularText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  quickPackageName: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
    textAlign: 'center',
  },
  quickPackagePrice: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: '#4AA3DF',
    marginBottom: Sizes.sm,
  },
  quickPackageButton: {
    fontSize: Sizes.small,
    color: '#4AA3DF',
    fontWeight: '600',
  },
  
  // Tests Section - Simplified
  testsSection: {
    backgroundColor: Colors.white,
    padding: Sizes.screenPadding,
  },
  quickTestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickTestCard: {
    width: '48%',
    backgroundColor: '#E6F4FB',
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.md,
    alignItems: 'center',
  },
  quickTestName: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  quickTestPrice: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: '#4AA3DF',
  },
  
  // Contact Section
  contactSection: {
    backgroundColor: '#F8FAFC',
    padding: Sizes.screenPadding,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    alignItems: 'center',
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.md,
  },
  contactTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  contactText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  contactSubtext: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  
  // Emergency Banner
  emergencyBanner: {
    backgroundColor: '#C62828',
    margin: Sizes.screenPadding,
    padding: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Sizes.sm,
  },
  emergencySubtitle: {
    fontSize: Sizes.medium,
    color: '#FFEBEE',
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  emergencyCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderRadius: 25,
  },
  emergencyCallText: {
    color: '#C62828',
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    marginLeft: Sizes.sm,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Sizes.screenPadding,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Sizes.lg,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalLogoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalLogoImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Sizes.md,
  },
  modalTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: Sizes.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Sizes.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
  },
  activeTab: {
    borderBottomColor: '#4AA3DF',
    backgroundColor: '#E6F4FB',
  },
  tabText: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4AA3DF',
  },
  credentialsInfo: {
    marginBottom: Sizes.lg,
  },
  credentialCard: {
    backgroundColor: '#E6F4FB',
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#4AA3DF',
  },
  credentialTitle: {
    fontSize: Sizes.small,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: Sizes.sm,
  },
  credentialText: {
    fontSize: Sizes.small,
    color: '#1976D2',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    fontSize: Sizes.regular,
    backgroundColor: '#FAFAFA',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.md,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    padding: Sizes.md,
    fontSize: Sizes.regular,
  },
  passwordToggle: {
    padding: Sizes.md,
  },
  loginButton: {
    backgroundColor: '#4AA3DF',
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
  
  // Admin Modal
  adminModalHeader: {
    alignItems: 'center',
    marginBottom: Sizes.lg,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  adminModalClose: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  adminModalTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.md,
  },
  adminModalSubtitle: {
    fontSize: Sizes.medium,
    color: '#C62828',
    marginTop: 4,
  },
  adminCredentials: {
    backgroundColor: '#FFF3E0',
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  adminCredentialTitle: {
    fontSize: Sizes.small,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: Sizes.sm,
  },
  adminCredentialText: {
    fontSize: Sizes.small,
    color: '#F57C00',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  adminLoginButton: {
    backgroundColor: '#C62828',
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  adminLoginButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
  
  // Notifications Dropdown
  notificationsDropdown: {
    position: 'absolute',
    top: 80,
    right: Sizes.screenPadding,
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    width: 300,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Sizes.md,
    paddingBottom: Sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  newBadge: {
    backgroundColor: '#C62828',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: Sizes.small,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C62828',
    marginTop: 6,
    marginRight: Sizes.sm,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  notificationSubtext: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: Sizes.small,
    color: '#4AA3DF',
  },
  viewAllButton: {
    paddingVertical: Sizes.md,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#4AA3DF',
    fontSize: Sizes.medium,
    fontWeight: '600',
  },
  
  // Treatment Status Styles
  treatmentStatusContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrBlue,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  treatmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  admissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  admissionBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  treatmentInfo: {
    flex: 1,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  treatmentSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  expandButton: {
    padding: 4,
  },
  treatmentContent: {
    gap: 12,
  },
  treatmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  treatmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  treatmentLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 6,
    flex: 1,
  },
  treatmentValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'right',
    flex: 1,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  treatmentsPreview: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  treatmentItemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  treatmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  treatmentName: {
    fontSize: 12,
    color: '#1F2937',
    flex: 1,
  },
  treatmentTime: {
    fontSize: 10,
    color: '#6B7280',
  },
  viewAllTreatments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewAllText: {
    fontSize: 11,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default PatientHomeScreen;