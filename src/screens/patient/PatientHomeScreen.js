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
  StatusBar,
  Image,
  TextInput,
  Modal,
  Alert,
  Linking,
  Dimensions,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';
import AppHeader from '../../components/AppHeader';

const { width: screenWidth } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Sample data - same as web version but adapted for React Native
const doctors = [
  {
    id: 1,
    name: "DR. K. RAMESH",
    credentials: "M.B.B.S., M.D",
    role: "General Physician",
    fellowship: "Fellowship in Echocardiography",
    image: require('../../../assets/DR. K. RAMESH.jpeg'),
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
    image: require('../../../assets/DR. K. THUKARAM.jpeg'),
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
    image: require('../../../assets/DR.K. DIVYAVANI.jpeg'),
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
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(2); // Default to Comprehensive package (index 2)
  const [isTreatmentExpanded, setIsTreatmentExpanded] = useState(true); // State for treatment card expansion
  const [showAllTreatments, setShowAllTreatments] = useState(false); // State for showing all treatments
  const [showUpcomingTreatments, setShowUpcomingTreatments] = useState(false); // State for showing upcoming treatments
  const [showTests, setShowTests] = useState(false); // State for showing diagnostic tests
  const animatedRotation = useRef(new Animated.Value(1)).current; // For chevron rotation (1 = expanded initially)
  const animatedHeight = useRef(new Animated.Value(1)).current; // For content height (1 = expanded initially)
  const autoPlayRef = useRef(null);
  
  // Initialize animation values based on default state
  useEffect(() => {
    // Set initial rotation value based on expanded state
    animatedRotation.setValue(isTreatmentExpanded ? 1 : 0);
    // Set initial height value based on expanded state
    animatedHeight.setValue(isTreatmentExpanded ? 1 : 0);
  }, []);

  // Sample notifications data - Enhanced with more realistic hospital scenarios
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "🩺 Appointment Confirmed",
      message: "Your appointment with Dr. K. Ramesh (General Physician) is confirmed for tomorrow at 2:00 PM in Room 201.",
      type: "appointment",
      time: "2 minutes ago",
      date: "2025-10-13T14:30:00Z",
      isRead: false,
      icon: "calendar",
      color: "#4AA3DF"
    },
    {
      id: 2,
      title: "🧪 Lab Results Ready",
      message: "Your Complete Blood Count (CBC) and Lipid Profile results are now available. All parameters are within normal range.",
      type: "report",
      time: "45 minutes ago",
      date: "2025-10-13T13:15:00Z",
      isRead: false,
      icon: "flask",
      color: "#10B981"
    },
    {
      id: 3,
      title: "💳 Payment Reminder",
      message: "Your consultation bill (Bill #KBR2025-1013) for ₹500 is due in 2 days. Pay online for 5% discount!",
      type: "payment",
      time: "1 hour ago",
      date: "2025-10-13T12:00:00Z",
      isRead: false,
      icon: "card",
      color: "#F59E0B"
    },
    {
      id: 4,
      title: "🏥 Room Upgraded",
      message: "Good news! Your room has been upgraded to Deluxe Private Room 305 at no extra cost.",
      type: "room",
      time: "2 hours ago",
      date: "2025-10-13T11:30:00Z",
      isRead: false,
      icon: "bed",
      color: "#8B5CF6"
    },
    {
      id: 5,
      title: "💊 Medication Schedule",
      message: "Evening medication reminder: Take Paracetamol 500mg and Vitamin D3 at 8:00 PM with food.",
      type: "medication",
      time: "4 hours ago",
      date: "2025-10-13T10:00:00Z",
      isRead: false,
      icon: "medical",
      color: "#8B5CF6"
    },
    {
      id: 6,
      title: "📋 Pre-Surgery Instructions",
      message: "Important: Please fast for 12 hours before your surgery scheduled for Oct 15th. No food or water after 8 PM tonight.",
      type: "surgery",
      time: "5 hours ago",
      date: "2025-10-13T09:00:00Z",
      isRead: true,
      icon: "cut",
      color: "#DC2626"
    },
    {
      id: 7,
      title: "🎁 Health Package Offer",
      message: "Special Diwali offer: 25% OFF on Comprehensive Health Checkup Package. Valid until Oct 31st!",
      type: "offer",
      time: "6 hours ago",
      date: "2025-10-13T08:00:00Z",
      isRead: true,
      icon: "gift",
      color: "#C62828"
    },
    {
      id: 8,
      title: "🏃‍♂️ Physical Therapy Session",
      message: "Your physiotherapy session with Dr. Sarah is scheduled for Oct 14th at 10:00 AM in Rehabilitation Center.",
      type: "therapy",
      time: "1 day ago",
      date: "2025-10-12T15:30:00Z",
      isRead: true,
      icon: "fitness",
      color: "#059669"
    },
    {
      id: 9,
      title: "🍎 Diet Plan Updated",
      message: "Your nutritionist has updated your diet plan. New diabetic-friendly meal options are now available.",
      type: "diet",
      time: "1 day ago",
      date: "2025-10-12T14:00:00Z",
      isRead: true,
      icon: "restaurant",
      color: "#16A34A"
    },
    {
      id: 10,
      title: "📱 Telemedicine Available",
      message: "You can now consult with Dr. K. Divyavani via video call. Book your online consultation today!",
      type: "telemedicine",
      time: "1 day ago",
      date: "2025-10-12T12:00:00Z",
      isRead: true,
      icon: "videocam",
      color: "#0EA5E9"
    },
    {
      id: 11,
      title: "🚨 Emergency Contact Update",
      message: "Please update your emergency contact information in your profile for better patient care coordination.",
      type: "emergency",
      time: "2 days ago",
      date: "2025-10-11T16:00:00Z",
      isRead: true,
      icon: "call",
      color: "#DC2626"
    },
    {
      id: 12,
      title: "📑 Discharge Summary Ready",
      message: "Your discharge summary and follow-up care instructions are ready for download. Take care!",
      type: "document",
      time: "3 days ago",
      date: "2025-10-10T11:30:00Z",
      isRead: true,
      icon: "document-text",
      color: "#06B6D4"
    },
    {
      id: 13,
      title: "🏆 Health Milestone",
      message: "Congratulations! You've completed 30 days of your diabetes management program. Keep it up!",
      type: "achievement",
      time: "4 days ago",
      date: "2025-10-09T10:00:00Z",
      isRead: true,
      icon: "trophy",
      color: "#F59E0B"
    },
    {
      id: 14,
      title: "🔔 Vaccine Reminder",
      message: "Annual flu vaccination is now available at KBR Hospitals. Book your slot to stay protected!",
      type: "vaccine",
      time: "5 days ago",
      date: "2025-10-08T09:00:00Z",
      isRead: true,
      icon: "shield-checkmark",
      color: "#059669"
    },
    {
      id: 15,
      title: "📊 Monthly Health Report",
      message: "Your September health summary is ready with insights on your blood pressure, weight, and medication adherence.",
      type: "report",
      time: "1 week ago",
      date: "2025-10-06T08:00:00Z",
      isRead: true,
      icon: "analytics",
      color: "#7C3AED"
    }
  ]);
  
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
        
        // Prefetch data for Services screen to make navigation faster
        try {
          // This will ensure the data is already in context when we navigate
          // to the Services screen, reducing loading time
          const servicesData = getAllServices();
          console.log('Prefetched services data:', servicesData?.length || 0, 'services');
        } catch (err) {
          console.log('Error prefetching services data:', err);
        }
        
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
        setCurrentDoctorIndex((prev) => (prev + 1) % (doctors?.length || 1));
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, isLoading]);
  
  // Auto-scroll for doctors horizontal scroll view
  const doctorsScrollViewRef = useRef(null);
  const [doctorScrollPosition, setDoctorScrollPosition] = useState(0);
  const [isDoctorScrollPaused, setIsDoctorScrollPaused] = useState(false);
  
  useEffect(() => {
    // Only auto-scroll if not paused by user touch
    if (!isDoctorScrollPaused) {
      const scrollInterval = setInterval(() => {
        if (doctorsScrollViewRef.current) {
          // Calculate the next scroll position based on card width + margins
          const cardWidth = screenWidth - 40; // Card width with side margins
          const fullCardWidth = screenWidth; // Total width including margins
          
          // Calculate next position with snap points
          const nextPosition = Math.floor(doctorScrollPosition / fullCardWidth + 1) * fullCardWidth;
          const maxScroll = (doctors.length - 1) * fullCardWidth;
          
          // If at the end, scroll back to start, otherwise advance
          if (doctorScrollPosition >= maxScroll) {
            doctorsScrollViewRef.current.scrollTo({ x: 0, animated: true });
            setDoctorScrollPosition(0);
          } else {
            doctorsScrollViewRef.current.scrollTo({ x: nextPosition, animated: true });
            setDoctorScrollPosition(nextPosition);
          }
        }
      }, 2100); // Scroll every 2.1 seconds for faster transitions
      
      return () => clearInterval(scrollInterval);
    }
  }, [doctorScrollPosition, doctors.length, isDoctorScrollPaused, screenWidth]);

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
      default:
        Alert.alert('Coming Soon', `${serviceName} feature will be available soon!`);
    }
  };
  
  // Handle health package selection with prefetching data
  const handlePackageSelect = async (packageId) => {
    setSelectedPackage(packageId);
    
    // Prepare data ahead of time to reduce loading delay
    let packageData = healthPackages.find(p => p.id === packageId);
    
    // Extract relevant package details for sending to services screen
    const packageDetails = {
      id: packageId,
      name: packageData?.name || "",
      price: packageData?.price || "",
      features: packageData?.features || []
    };
    
    // Navigate with the pre-fetched data
    navigation.navigate('Services', { 
      scrollToSection: 'diagnosticTests',
      focusOnTests: true,
      selectedPackage: packageId,
      packageDetails: packageDetails,
      preloaded: true // Flag to indicate data is already available
    });
  };
  
  // Handle test selection with prefetching data
  const handleTestSelect = (testId) => {
    // Find the test data
    const testData = popularTests.find(t => t.id === testId);
    
    // Navigate to Services screen with test details
    navigation.navigate('Services', {
      scrollToSection: 'diagnosticTests',
      focusOnTests: true,
      selectedTest: testId,
      testDetails: testData,
      preloaded: true
    });
  };

  // Notification handlers
  const handleNotificationPress = (notification) => {
    // Mark notification as read
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notification.id 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    
    // Set selected notification for detailed view
    setSelectedNotification(notification);
    setShowNotifications(false);
  };

  const handleViewAllNotifications = () => {
    setShowAllNotifications(true);
    setShowNotifications(false);
  };

  const handleCloseNotificationDetail = () => {
    setSelectedNotification(null);
  };

  const handleCloseAllNotifications = () => {
    setShowAllNotifications(false);
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
    if (selectedNotification?.id === notificationId) {
      setSelectedNotification(null);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.isRead).length;
  };

  const makeCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const sendEmail = (emailAddress) => {
    Linking.openURL(`mailto:${emailAddress}`);
  };

  const openLocation = () => {
    const address = "KBR Life Care Hospitals, Sangareddy, Telangana, India";
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(
        "Location",
        "KBR Life Care Hospitals\nSangareddy, Telangana, India\n\nUnable to open maps. Please search for 'KBR Life Care Hospitals Sangareddy' in your maps app."
      );
    });
  };

  const showHospitalInfo = () => {
    Alert.alert(
      "🏥 Hospital Hours",
      "KBR Life Care Hospitals\n\n⏰ Operating Hours:\n• Mon - Sun: 24/7 Open\n• Emergency Services: Always Available\n• Outpatient: 8:00 AM - 8:00 PM\n• Inpatient: Round-the-clock care\n\n📞 For appointments: +91 8466 999 000",
      [
        { text: "Call Now", onPress: () => makeCall('+918466999000') },
        { text: "OK", style: "cancel" }
      ]
    );
  };

  // Render Patient Treatment Status for admitted patients
  const renderPatientTreatmentStatus = () => {
    // Only show treatment status if user is logged in AND patient is admitted
    if (!isLoggedIn || !userData || !patientStatus.isAdmitted) return null;

    // Handler to toggle the treatment card expansion
    const toggleTreatmentExpansion = () => {
      // Configure layout animation for smooth transitions
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });
      
      // Toggle state
      setIsTreatmentExpanded(!isTreatmentExpanded);
      
      // Animate the rotation of the chevron
      Animated.spring(animatedRotation, {
        toValue: isTreatmentExpanded ? 0 : 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      
      // Animate the content height
      Animated.timing(animatedHeight, {
        toValue: isTreatmentExpanded ? 0 : 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    };

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
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={toggleTreatmentExpansion}
            activeOpacity={0.7}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: animatedRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '180deg'],
                    }),
                  },
                ],
              }}
            >
              <Ionicons 
                name="chevron-down" 
                size={20} 
                color={Colors.kbrBlue} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.View 
          style={[
            styles.treatmentContentContainer,
            {
              opacity: animatedHeight,
              maxHeight: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 500], // Max height when expanded
              }),
              overflow: 'hidden',
            }
          ]}
        >
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
            <TouchableOpacity 
              style={[
                styles.quickActionButton,
                showUpcomingTreatments && styles.activeQuickAction
              ]}
              onPress={() => {
                setShowUpcomingTreatments(!showUpcomingTreatments);
                if (!showUpcomingTreatments) {
                  setShowAllTreatments(false); // Close All Treatments when opening Upcoming Treatments
                }
              }}
            >
              <Ionicons 
                name="clipboard" 
                size={16} 
                color={showUpcomingTreatments ? Colors.white : Colors.kbrBlue} 
              />
              <Text style={[
                styles.quickActionText, 
                showUpcomingTreatments && styles.activeQuickActionText
              ]}>Treatments</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.quickActionButton,
                showTests && styles.activeTestAction
              ]}
              onPress={() => {
                setShowTests(!showTests);
                if (!showTests) {
                  // Close other expanded sections
                  setShowUpcomingTreatments(false);
                  setShowAllTreatments(false);
                }
              }}
            >
              <Ionicons 
                name="flask" 
                size={16} 
                color={showTests ? Colors.white : Colors.kbrGreen} 
              />
              <Text style={[
                styles.quickActionText, 
                showTests && styles.activeTestActionText
              ]}>Tests</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, styles.emergencyButton]}
              onPress={() => {
                Alert.alert(
                  "Emergency Contact",
                  "Call hospital emergency line?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Call Now", onPress: () => Linking.openURL('tel:+919876543210') }
                  ]
                );
              }}
            >
              <Ionicons name="call" size={16} color={Colors.kbrRed} />
              <Text style={styles.quickActionText}>Emergency</Text>
            </TouchableOpacity>
          </View>

          {/* Current Treatments Preview */}
          <View style={styles.treatmentsPreview}>
            <Text style={styles.previewTitle}>Today's Treatments</Text>
            {/* Show only 2 treatments when not expanded */}
            {(!showAllTreatments && !showUpcomingTreatments && !showTests) && patientStatus.treatments.slice(0, 2).map((treatment) => (
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
            
            {/* Show all treatments when expanded */}
            {showAllTreatments && (
              <View style={styles.allTreatmentsContainer}>
                {patientStatus.treatments.map((treatment) => (
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
              </View>
            )}
            
            {/* Show upcoming treatments */}
            {showUpcomingTreatments && (
              <View style={styles.allTreatmentsContainer}>
                <Text style={styles.sectionSubtitle}>Upcoming Treatments</Text>
                {patientStatus.treatments
                  .filter(treatment => treatment.status === 'Scheduled')
                  .map((treatment) => (
                    <View key={treatment.id} style={styles.treatmentItemPreview}>
                      <View style={styles.treatmentStatus}>
                        <View style={[styles.statusDot, { backgroundColor: Colors.kbrBlue }]} />
                        <Text style={styles.treatmentName}>{treatment.name}</Text>
                      </View>
                      <Text style={styles.treatmentTime}>{treatment.time}</Text>
                    </View>
                  ))}
              </View>
            )}
            
            {/* Show upcoming tests */}
            {showTests && (
              <View style={styles.allTreatmentsContainer}>
                <Text style={[styles.sectionSubtitle, { color: Colors.kbrGreen }]}>Scheduled Tests</Text>
                {patientStatus.upcomingTests.map((test) => (
                  <View key={test.id} style={styles.testItemPreview}>
                    <View style={styles.treatmentStatus}>
                      <View style={[styles.statusDot, { backgroundColor: Colors.kbrGreen }]} />
                      <Text style={styles.treatmentName}>{test.name}</Text>
                    </View>
                    <View style={styles.testDetails}>
                      <Text style={styles.testDepartment}>{test.department}</Text>
                      <Text style={styles.testTime}>{test.scheduledTime}</Text>
                    </View>
                  </View>
                ))}
                
                <Text style={[styles.sectionSubtitle, { color: Colors.kbrGreen, marginTop: 12 }]}>Available Tests</Text>
                <View style={styles.availableTestsGrid}>
                  {popularTests.map((test) => (
                    <TouchableOpacity 
                      key={test.id} 
                      style={styles.availableTestCard}
                      onPress={() => Alert.alert("Book Test", `Would you like to schedule the ${test.name} test?`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Book", onPress: () => Alert.alert("Success", `${test.name} test has been scheduled.`) }
                      ])}
                    >
                      <Ionicons name="flask-outline" size={16} color={Colors.kbrGreen} />
                      <Text style={styles.availableTestName}>{test.name}</Text>
                      <Text style={styles.availableTestPrice}>{test.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={[
                styles.viewAllTreatments,
                showAllTreatments && styles.activeViewAll
              ]}
              onPress={() => {
                setShowAllTreatments(!showAllTreatments);
                if (!showAllTreatments) {
                  setShowUpcomingTreatments(false); // Close other sections
                  setShowTests(false);
                }
              }}
            >
              <Text style={[
                styles.viewAllText,
                showAllTreatments && styles.activeViewAllText
              ]}>
                {showAllTreatments ? "Hide All Treatments" : "View All Treatments"}
              </Text>
              <Ionicons 
                name={showAllTreatments ? "arrow-up" : "arrow-forward"} 
                size={14} 
                color={showAllTreatments ? Colors.white : Colors.kbrBlue} 
              />
            </TouchableOpacity>
          </View>
          </View>
        </Animated.View>
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
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['left', 'right']}>
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
            {getUnreadCount() > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {getUnreadCount() > 9 ? '9+' : getUnreadCount()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Patient Treatment Status - Show if patient is admitted */}
        {renderPatientTreatmentStatus()}

        <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
          {/* Hero Section - Simplified for better loading */}
          <View style={[styles.heroSection, { backgroundColor: theme.background }]}>
            <Image 
              source={require('../../../assets/hospital-building.jpg.jpeg')}
              style={styles.heroBackgroundImage}
              resizeMode="cover"
            />
            <View style={styles.heroFallback}>
              <View style={styles.heroIcon}>
                <Image 
                  source={require('../../../assets/hospital-logo.jpeg')}
                  style={styles.heroLogoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={[styles.heroTitle, { color: '#000000', fontWeight: 'bold', fontSize: 22 }]}>Welcome to KBR Life Care Hospitals, Sangareddy</Text>
              <Text style={[styles.heroSubtitle, { color: '#000000', fontWeight: '600', fontSize: 16 }]}>
                We blend compassionate care with cutting-edge medicine, driven by a dedicated team prioritizing your well-being.
              </Text>
            </View>
          </View>

          {/* Vision & Mission */}
          <View style={styles.visionMissionSection}>
            <View style={styles.visionMissionHeader}>
              <Text style={styles.visionMissionMainTitle}>Our Foundation</Text>
              <Text style={styles.visionMissionSubtitle}>Building healthcare excellence through our core values</Text>
            </View>
            
            <View style={styles.visionMissionCards}>
              {/* Vision Card */}
              <View style={[styles.visionMissionCard, styles.visionCard]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, styles.visionIcon]}>
                    <Ionicons name="eye" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.cardTitle}>Our Vision</Text>
                </View>
                <Text style={styles.cardDescription}>
                  To be the preferred healthcare provider in Sangareddy and beyond, delivering world-class medical services with compassion, innovation, and excellence.
                </Text>
                <View style={styles.cardAccent} />
              </View>

              {/* Mission Card */}
              <View style={[styles.visionMissionCard, styles.missionCard]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, styles.missionIcon]}>
                    <Ionicons name="medical" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.cardTitle}>Our Mission</Text>
                </View>
                <Text style={styles.cardDescription}>
                  Providing accessible, affordable, and advanced healthcare through dedicated professionals, state-of-the-art facilities, and patient-centered approach.
                </Text>
                <View style={styles.cardAccent} />
              </View>
            </View>
          </View>

          {/* Doctors Carousel */}
          <View style={styles.doctorsSection}>
            <Text style={styles.sectionTitle}>Meet Our Expert Doctors</Text>
            <Text style={styles.sectionSubtitle}>Experienced specialists dedicated to your health</Text>
            
            <View style={styles.doctorsScrollViewContainer}>
              <ScrollView
                ref={doctorsScrollViewRef}
                horizontal
                pagingEnabled
                decelerationRate="fast"
                snapToInterval={screenWidth}
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.doctorsScrollContent}
                onMomentumScrollEnd={(event) => {
                  // Update the current scroll position when user manually scrolls
                  setDoctorScrollPosition(event.nativeEvent.contentOffset.x);
                }}
                onTouchStart={() => {
                  // Pause auto-scrolling when user touches the scroll view
                  setIsDoctorScrollPaused(true);
                }}
                onTouchEnd={() => {
                  // Resume auto-scrolling when user stops touching
                  setIsDoctorScrollPaused(false);
                }}
                onScrollBeginDrag={() => {
                  // Another way to detect user interaction
                  setIsDoctorScrollPaused(true);
                }}
                onScrollEndDrag={() => {
                  // Resume after user finishes dragging
                  setTimeout(() => setIsDoctorScrollPaused(false), 1500);
                }}
              >
              {doctors.map((doctor, index) => (
                <View key={doctor.id} style={styles.doctorSlideItem}>
                  <View style={styles.doctorImageWrapper}>
                    <Image 
                      source={doctor.image}
                      style={styles.doctorCarouselImage}
                      resizeMode="cover"
                    />
                  </View>
                  
                  <View style={styles.doctorInfo}>
                    <Text style={styles.doctorName} numberOfLines={1} ellipsizeMode="tail">{doctor.name}</Text>
                    <Text style={styles.doctorCredentials} numberOfLines={1} ellipsizeMode="tail">{doctor.credentials}</Text>
                    <Text style={styles.doctorRole} numberOfLines={2} ellipsizeMode="tail">{doctor.role}</Text>
                    {doctor.fellowship && (
                      <Text style={styles.doctorFellowship} numberOfLines={1} ellipsizeMode="tail">{doctor.fellowship}</Text>
                    )}
                    
                    <View style={styles.expertiseSection}>
                      <Text style={styles.expertiseTitle}>Areas of Expertise:</Text>
                      {doctor.expertise.slice(0, 3).map((item, idx) => (
                        <View key={idx} style={styles.expertiseItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#4AA3DF" />
                          <Text style={styles.expertiseText} numberOfLines={1} ellipsizeMode="tail">{item}</Text>
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
              ))}
              </ScrollView>
              
              {/* Pagination indicators */}
              <View style={styles.paginationDots}>
                {doctors.map((_, index) => {
                  // Calculate the current visible doctor based on scroll position
                  const currentIndex = Math.round(doctorScrollPosition / screenWidth);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.paginationDot,
                        index === currentIndex && styles.paginationDotActive
                      ]}
                    />
                  );
                })}
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
                <TouchableOpacity 
                  key={service.id} 
                  style={styles.serviceCard}
                  onPress={() => {
                    // Prepare service data for faster loading
                    const serviceDetails = {
                      id: service.id,
                      name: service.name,
                      description: service.description,
                      icon: service.icon,
                      color: service.color,
                      duration: service.duration || '30 mins',
                      doctors: service.doctors || [],
                      tags: service.tags || []
                    };
                    
                    navigation.navigate('Services', { 
                      selectedService: service.name, 
                      serviceId: service.id,
                      scrollToService: true,
                      openServiceDetails: true,
                      serviceDetails: serviceDetails,
                      preloaded: true
                    });
                  }}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: service.color || '#E6F4FB' }]}>
                    <Ionicons name={service.icon || 'medical-outline'} size={28} color="#333333" />
                  </View>
                  <Text style={styles.serviceTitle}>{service.name || 'Service'}</Text>
                  <Text style={styles.serviceDescription}>{service.description || 'Description not available'}</Text>
                  <View style={styles.serviceAction}>
                    <Text style={styles.serviceActionText}>Learn More</Text>
                    <Ionicons name="arrow-forward" size={16} color="#4AA3DF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Health Packages - Simplified */}
          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>Health Packages</Text>
            <Text style={styles.sectionSubtitle}>Comprehensive checkups tailored to your needs</Text>
            
            <View style={styles.quickPackagesGrid}>
              <TouchableOpacity 
                style={[
                  styles.quickPackageCard,
                  selectedPackage === 1 && styles.popularQuickPackage
                ]}
                onPress={() => handlePackageSelect(1)}
              >
                <Text style={styles.quickPackageName}>Basic Checkup</Text>
                <Text style={styles.quickPackagePrice}>₹1,999</Text>
                <Text style={styles.quickPackageButton}>Book Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.quickPackageCard,
                  selectedPackage === 2 && styles.popularQuickPackage
                ]}
                onPress={() => handlePackageSelect(2)}
              >
                <View style={styles.quickPopularBadge}>
                  <Text style={styles.quickPopularText}>Popular</Text>
                </View>
                <Text style={styles.quickPackageName}>Comprehensive</Text>
                <Text style={styles.quickPackagePrice}>₹4,999</Text>
                <Text style={styles.quickPackageButton}>Book Now</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.quickPackageCard,
                  selectedPackage === 3 && styles.popularQuickPackage
                ]}
                onPress={() => handlePackageSelect(3)}
              >
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
              {popularTests.slice(0, 4).map((test) => (
                <TouchableOpacity 
                  key={test.id}
                  style={styles.quickTestCard}
                  onPress={() => handleTestSelect(test.id)}
                >
                  <Text style={styles.quickTestName}>{test.name.split('(')[0].trim()}</Text>
                  <Text style={styles.quickTestPrice}>{test.price}</Text>
                </TouchableOpacity>
              ))}
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
              
              <TouchableOpacity style={styles.contactCard} onPress={openLocation}>
                <View style={[styles.contactIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="location" size={24} color="#10B981" />
                </View>
                <Text style={styles.contactTitle}>Location</Text>
                <Text style={styles.contactText}>Sangareddy</Text>
                <Text style={styles.contactSubtext}>Tap to open maps</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.contactCard} onPress={showHospitalInfo}>
                <View style={[styles.contactIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="time" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.contactTitle}>Hours</Text>
                <Text style={styles.contactText}>Mon - Sun</Text>
                <Text style={styles.contactSubtext}>Tap for details</Text>
              </TouchableOpacity>
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

        {/* All Notifications Modal */}
        <Modal
          visible={showAllNotifications}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseAllNotifications}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.notificationsModalContent]}>
              <View style={styles.notificationsModalHeader}>
                <Text style={styles.notificationsModalTitle}>All Notifications</Text>
                <TouchableOpacity onPress={handleCloseAllNotifications}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.notificationsModalList} showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[styles.notificationModalItem, !notification.isRead && styles.unreadNotification]}
                    onPress={() => {
                      setShowAllNotifications(false);
                      handleNotificationPress(notification);
                    }}
                  >
                    <View style={[styles.notificationIcon, { backgroundColor: notification.color }]}>
                      <Ionicons name={notification.icon} size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.notificationModalContent}>
                      <Text style={[styles.notificationText, !notification.isRead && styles.unreadText]}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationSubtext} numberOfLines={2}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>{notification.time}</Text>
                    </View>
                    <View style={styles.notificationActions}>
                      {!notification.isRead && <View style={styles.notificationDot} />}
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteNotification(notification.id)}
                      >
                        <Ionicons name="trash" size={16} color="#C62828" />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Notification Detail Modal */}
        <Modal
          visible={selectedNotification !== null}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseNotificationDetail}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.notificationDetailContent]}>
              {selectedNotification && (
                <>
                  <View style={styles.notificationDetailHeader}>
                    <View style={styles.notificationDetailTitle}>
                      <View style={[styles.notificationIcon, { backgroundColor: selectedNotification.color }]}>
                        <Ionicons name={selectedNotification.icon} size={24} color="#FFFFFF" />
                      </View>
                      <Text style={styles.notificationDetailTitleText}>{selectedNotification.title}</Text>
                    </View>
                    <TouchableOpacity onPress={handleCloseNotificationDetail}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.notificationDetailBody}>
                    <Text style={styles.notificationDetailMessage}>
                      {selectedNotification.message}
                    </Text>
                    <Text style={styles.notificationDetailTime}>
                      Received {selectedNotification.time}
                    </Text>
                    
                    {selectedNotification.type === 'appointment' && (
                      <TouchableOpacity 
                        style={styles.notificationActionButton}
                        onPress={() => {
                          handleCloseNotificationDetail();
                          navigation.navigate('BookAppointment');
                        }}
                      >
                        <Text style={styles.notificationActionButtonText}>View Appointment</Text>
                      </TouchableOpacity>
                    )}
                    
                    {selectedNotification.type === 'report' && (
                      <TouchableOpacity 
                        style={styles.notificationActionButton}
                        onPress={() => {
                          handleCloseNotificationDetail();
                          navigation.navigate('Reports');
                        }}
                      >
                        <Text style={styles.notificationActionButtonText}>View Reports</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <>
            <TouchableOpacity 
              style={styles.notificationBackdrop} 
              onPress={() => setShowNotifications(false)}
              activeOpacity={1}
            />
            <View style={styles.notificationsDropdown}>
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              {getUnreadCount() > 0 && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>{getUnreadCount()} New</Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.markAllReadButton}
                onPress={markAllAsRead}
              >
                <Text style={styles.markAllReadText}>Mark All Read</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
              {notifications.slice(0, 3).map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[styles.notificationItem, !notification.isRead && styles.unreadNotification]}
                  onPress={() => handleNotificationPress(notification)}
                >
                  <View style={[styles.notificationIcon, { backgroundColor: notification.color }]}>
                    <Ionicons name={notification.icon} size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[styles.notificationText, !notification.isRead && styles.unreadText]}>
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationSubtext} numberOfLines={2}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                  {!notification.isRead && <View style={styles.notificationDot} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleViewAllNotifications}
            >
              <Text style={styles.viewAllText}>View All Notifications</Text>
              <Ionicons name="arrow-forward" size={16} color="#4AA3DF" />
            </TouchableOpacity>
          </View>
          </>
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
    backgroundColor: 'transparent',
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
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C62828',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  heroBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 163, 223, 0.3)',
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
  
  // Vision & Mission Section - Modern Design
  visionMissionSection: {
    backgroundColor: '#F8FAFC',
    padding: Sizes.screenPadding,
    paddingVertical: Sizes.xl,
  },
  visionMissionHeader: {
    alignItems: 'center',
    marginBottom: Sizes.xl,
  },
  visionMissionMainTitle: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
    textAlign: 'center',
  },
  visionMissionSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  visionMissionCards: {
    gap: Sizes.lg,
  },
  visionMissionCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  visionCard: {
    borderLeftColor: '#4AA3DF',
    backgroundColor: '#FAFBFF',
  },
  missionCard: {
    borderLeftColor: '#10B981',
    backgroundColor: '#FAFFFE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  visionIcon: {
    backgroundColor: '#4AA3DF',
  },
  missionIcon: {
    backgroundColor: '#10B981',
  },
  cardTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  cardDescription: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Sizes.md,
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(74, 163, 223, 0.1)',
    borderBottomLeftRadius: 30,
  },
  
  // Doctors Section
  doctorsSection: {
    backgroundColor: '#F8FAFC',
    paddingVertical: Sizes.screenPadding,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Sizes.sm,
    paddingHorizontal: Sizes.screenPadding,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
    paddingHorizontal: Sizes.screenPadding,
  },
  doctorsScrollContent: {
    paddingBottom: Sizes.md,
  },
  doctorsScrollViewContainer: {
    width: '100%',
    marginVertical: Sizes.md,
    position: 'relative',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
    margin: 4,
  },
  paginationDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4AA3DF',
  },
  doctorSlideItem: {
    width: screenWidth, // Full screen width
    paddingHorizontal: 20, // Internal padding instead of margins
    overflow: 'visible', // Allow elements to overflow (for the doctor info card)
  },
  doctorImageWrapper: {
    width: '100%',
    height: 260,
    borderRadius: Sizes.radiusLarge,
    backgroundColor: '#E6F4FB',
    marginBottom: 0, // Removed margin since we're overlapping
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  doctorCarouselImage: {
    width: '100%',
    height: '100%',
  },
  doctorInfo: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: Sizes.md,
    borderRadius: Sizes.radiusLarge,
    marginTop: -20, // Overlap with image
  },
  doctorName: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorCredentials: {
    fontSize: Sizes.medium,
    color: '#4AA3DF',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  doctorRole: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
    textAlign: 'center',
  },
  doctorFellowship: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Sizes.md,
    textAlign: 'center',
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
    textAlign: 'center',
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
    marginBottom: Sizes.sm,
  },
  serviceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Sizes.sm,
    paddingTop: Sizes.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  serviceActionText: {
    fontSize: Sizes.small,
    color: '#4AA3DF',
    fontWeight: '600',
    marginRight: 4,
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
  
  // Notifications Dropdown & Modals
  notificationsDropdown: {
    position: 'absolute',
    top: 80,
    right: Sizes.screenPadding,
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    width: 320,
    maxHeight: 400,
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
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#C62828',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: Sizes.sm,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: Sizes.small,
    fontWeight: '600',
  },
  markAllReadButton: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
  },
  markAllReadText: {
    color: '#4AA3DF',
    fontSize: Sizes.small,
    fontWeight: '600',
  },
  notificationsList: {
    maxHeight: 200,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    marginBottom: 4,
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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
  unreadText: {
    fontWeight: 'bold',
  },
  notificationSubtext: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: Sizes.small,
    color: '#4AA3DF',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C62828',
    position: 'absolute',
    top: 8,
    right: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    paddingVertical: Sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Sizes.sm,
  },
  viewAllText: {
    color: '#4AA3DF',
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginRight: Sizes.sm,
  },
  
  // Notification Backdrop
  notificationBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  
  // Notification Enhanced Styles
  markAllReadButton: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    backgroundColor: '#E6F4FB',
    borderRadius: 12,
  },
  markAllReadText: {
    color: '#4AA3DF',
    fontSize: Sizes.small,
    fontWeight: '600',
  },
  notificationsList: {
    maxHeight: 200,
  },
  unreadNotification: {
    backgroundColor: '#F0F8FF',
    borderLeftWidth: 3,
    borderLeftColor: '#4AA3DF',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.sm,
    marginTop: 2,
  },

  // All Notifications Modal
  notificationsModalContent: {
    height: '80%',
  },
  notificationsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Sizes.lg,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationsModalTitle: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  notificationsModalList: {
    flex: 1,
  },
  notificationModalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.sm,
    position: 'relative',
  },
  notificationModalContent: {
    flex: 1,
    marginRight: Sizes.sm,
  },
  notificationActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  deleteButton: {
    padding: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: '#FEE2E2',
  },

  // Notification Detail Modal
  notificationDetailContent: {
    maxHeight: '70%',
  },
  notificationDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Sizes.lg,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  notificationDetailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationDetailTitleText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: Sizes.md,
  },
  notificationDetailBody: {
    paddingBottom: Sizes.lg,
  },
  notificationDetailMessage: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: Sizes.lg,
  },
  notificationDetailTime: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: Sizes.xl,
  },
  notificationActionButton: {
    backgroundColor: '#4AA3DF',
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  notificationActionButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
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
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(74, 163, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  treatmentContentContainer: {
    overflow: 'hidden',
  },
  treatmentContent: {
    gap: 12,
    paddingTop: 12,
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
  activeQuickAction: {
    backgroundColor: Colors.kbrBlue,
  },
  activeQuickActionText: {
    color: Colors.white,
  },
  activeTestAction: {
    backgroundColor: Colors.kbrGreen,
  },
  activeTestActionText: {
    color: Colors.white,
  },
  emergencyButton: {
    backgroundColor: 'rgba(220, 38, 38, 0.08)', // Light red background
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)', // Red border
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
  allTreatmentsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.kbrBlue,
  },
  testItemPreview: {
    flexDirection: 'column',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  testDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingLeft: 16,
  },
  testDepartment: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.kbrGreen,
  },
  testTime: {
    fontSize: 10,
    color: '#6B7280',
  },
  availableTestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  availableTestCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  availableTestName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    marginTop: 6,
    textAlign: 'center',
  },
  availableTestPrice: {
    fontSize: 10,
    color: Colors.kbrGreen,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.kbrBlue,
    marginBottom: 8,
  },
  viewAllTreatments: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 4,
    borderRadius: 12,
  },
  activeViewAll: {
    backgroundColor: Colors.kbrBlue,
  },
  activeViewAllText: {
    color: Colors.white,
  },
  viewAllTreatmentsWrapper: {
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

  // Doctors Section Styles
  doctorsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  doctorsScroll: {
    marginTop: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  doctorImageContainer: {
    position: 'relative',
    alignSelf: 'center',
    marginBottom: 12,
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
  },
  doctorStatus: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  doctorCardInfo: {
    alignItems: 'center',
  },
  doctorCardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 3,
    numberOfLines: 2,
  },
  doctorCardCredentials: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 3,
  },
  doctorCardSpecialization: {
    fontSize: 13,
    color: '#4AA3DF',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 6,
    numberOfLines: 2,
  },
  doctorCardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 4,
    fontWeight: '500',
  },
  experienceText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  consultationFee: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'center',
  },
  noDoctorsContainer: {
    width: screenWidth * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginHorizontal: Sizes.screenPadding,
  },
  noDoctorsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default PatientHomeScreen;