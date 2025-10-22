import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FirebaseServiceApiService } from '../../services/firebaseHospitalServices';
import AppHeader from '../../components/AppHeader';

const ServicesScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getServiceCounts, getAllServices } = useServices();
  const { theme } = useTheme();
  
  // Get the selected service from navigation params
  const selectedService = route?.params?.selectedService;
  const serviceId = route?.params?.serviceId;
  const scrollToService = route?.params?.scrollToService;
  const scrollToSection = route?.params?.scrollToSection;
  const focusOnTests = route?.params?.focusOnTests;
  const selectedPackage = route?.params?.selectedPackage;
  const openServiceDetails = route?.params?.openServiceDetails;
  
  // Get pre-loaded data if available (for faster loading)
  const preloaded = route?.params?.preloaded || false;
  const serviceDetails = route?.params?.serviceDetails;
  const packageDetails = route?.params?.packageDetails;
  const testDetails = route?.params?.testDetails;
  const selectedTest = route?.params?.selectedTest;
  
  // State for Firebase services with doctors
  const [firebaseServices, setFirebaseServices] = useState([]);
  const [loadingFirebaseServices, setLoadingFirebaseServices] = useState(true);
  
  // State for expanded service details
  const [expandedService, setExpandedService] = useState(null);
  
  // State for expanded specialty category
  // Initialize as null - we'll set it from params in useEffect
  const [expandedSpecialty, setExpandedSpecialty] = useState(null);
  
  // References for scrolling
  const scrollViewRef = React.useRef(null);
  // Reference for tests section position
  const [testsPosition, setTestsPosition] = useState(0);
  
  // Get services data from context
  const { getServicesByCategory } = useServices();
  
  // Get services by category
  const services = {
    medical: getServicesByCategory('medical'),
    surgical: getServicesByCategory('surgical'),
    specialized: getServicesByCategory('specialized')
  };
  
  // Calculate service counts from Firebase data
  const getFirebaseServiceCounts = () => {
    const counts = { medical: 0, surgical: 0, specialized: 0 };
    firebaseServices.forEach(service => {
      if (counts.hasOwnProperty(service.category)) {
        counts[service.category]++;
      }
    });
    return counts;
  };

  const serviceCounts = getFirebaseServiceCounts();
  const allServices = firebaseServices;

  // Reference to the diagnostic tests section
  const testsRef = React.useRef(null);
  
  // Loading state for content
  const [contentLoaded, setContentLoaded] = useState(preloaded);

  // Load services with doctor details from Firebase
  useEffect(() => {
    const loadServicesWithDoctors = async () => {
      try {
        setLoadingFirebaseServices(true);
        const result = await FirebaseServiceApiService.getServicesWithDoctors();
        if (result.success) {
          setFirebaseServices(result.data);
        }
      } catch (error) {
        console.error('Error loading services with doctors:', error);
      } finally {
        setLoadingFirebaseServices(false);
      }
    };

    loadServicesWithDoctors();
  }, []);
  
  // Function to scroll to tests section smoothly
  const scrollToTestsSection = () => {
    if (testsPosition > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: testsPosition,
          animated: true
        });
      }, 100);
    }
  };
  
  // Reference positions for specialty categories
  const [specialtiesPosition, setSpecialtiesPosition] = useState(0);
  
  // Function to scroll to the expanded specialty
  const scrollToSpecialties = () => {
    if (specialtiesPosition > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollTo({
          y: specialtiesPosition - 20, // Scroll a bit above to make it clearly visible
          animated: true
        });
      }, 300);
    }
  };
  
  // Handle content loading, scrolling, and initial rendering
  useEffect(() => {
    // Initialize with pre-loaded data if available
    if (preloaded) {
      setContentLoaded(true);
    }
    
    // Handle scrolling to sections based on navigation params
    if (scrollToSection === 'diagnosticTests' && testsPosition > 0) {
      scrollToTestsSection();
    }
    
    // Set a flag when content is fully loaded
    const loadTimer = setTimeout(() => {
      setContentLoaded(true);
    }, 300);
    
    return () => clearTimeout(loadTimer);
  }, [preloaded, scrollToSection, testsPosition]);
  
  // Handle navigation focus/blur events
  useEffect(() => {
    // When focusing on this screen
    const focusListener = navigation.addListener('focus', () => {
      // Only expand if explicitly provided in route params - otherwise reset
      if (route?.params?.expandedSpecialty) {
        setExpandedSpecialty(route.params.expandedSpecialty);
        
        // If there's a specific service selected, highlight it
        if (route?.params?.selectedService && route?.params?.serviceId) {
          setExpandedService(route?.params?.serviceId);
        }
      } else {
        // If no specialty specified in route, reset expanded state
        setExpandedSpecialty(null);
        setExpandedService(null);
      }
    });

    // When navigating away from this screen
    const blurListener = navigation.addListener('blur', () => {
      // Clear the route params to ensure fresh state next time
      navigation.setParams({
        expandedSpecialty: null,
        selectedService: null,
        serviceId: null
      });
      
      // Reset expanded states
      setExpandedSpecialty(null);
      setExpandedService(null);
    });

    return () => {
      focusListener();
      blurListener();
    };
  }, [navigation, route?.params]);

  const specialtyCategories = [
    {
      id: 'medical',
      title: 'Medical',
      subtitle: 'Specialties',
      count: serviceCounts.medical,
      icon: 'medical-outline',
      color: '#FFFFFF',
      backgroundColor: '#4285F4', // Blue
      description: 'Comprehensive medical care across all specialties',
    },
    {
      id: 'surgical',
      title: 'Surgical',
      subtitle: 'Specialties',
      count: serviceCounts.surgical,
      icon: 'cut-outline',
      color: '#FFFFFF',
      backgroundColor: '#EA4335', // Red
      description: 'Advanced surgical procedures and treatments',
    },
    {
      id: 'specialized',
      title: 'Specialized Care',
      subtitle: '',
      count: serviceCounts.specialized,
      icon: 'star',
      color: '#FFFFFF',
      backgroundColor: '#34A853', // Green
      description: 'Specialized treatments and expert care',
    },
  ];

  // Test Categories - Added as requested below Medical/Surgical/Specialized Care
  const testCategories = [
    {
      id: 'blood-tests',
      title: 'Blood Tests',
      subtitle: 'Laboratory Tests',
      count: 12,
      icon: 'water',
      color: '#FFFFFF',
      backgroundColor: '#DC2626', // Red
      description: 'Complete blood analysis and screening',
    },
    {
      id: 'imaging-tests',
      title: 'Imaging',
      subtitle: 'Radiology Tests',
      count: 8,
      icon: 'scan',
      color: '#FFFFFF',
      backgroundColor: '#7C3AED', // Purple
      description: 'X-Ray, CT, MRI, and ultrasound services',
    },
    {
      id: 'cardiac-tests',
      title: 'Cardiac Tests',
      subtitle: 'Heart Tests',
      count: 5,
      icon: 'heart',
      color: '#FFFFFF',
      backgroundColor: '#059669', // Green
      description: 'ECG, Echo, and cardiac evaluations',
    },
  ];

  const renderSpecialtyCard = (specialty) => {
    const isExpanded = expandedSpecialty === specialty.id;
    
    // Get specialty services from Firebase with doctor details
    const getSpecialtyServices = (id) => {
      try {
        // Filter Firebase services by category
        const categoryServices = firebaseServices.filter(service => 
          service.category === id
        ) || [];
        
        // Map the services to include icons and other UI properties
        return categoryServices.map(service => {
          // Define default tags if none are present
          let tags = service.tags || [];
          if (!tags.length) {
            if (id === 'medical') {
              tags = ['Health Check-ups', 'Chronic Disease Management'];
            } else if (id === 'surgical') {
              tags = ['Surgery', 'Consultation'];
            } else if (id === 'specialized') {
              tags = ['Specialized Care', 'Expert Consultation'];
            }
          }
          
          return {
            ...service,
            // Use service icon from the Firebase data or derive a default one
            icon: service.icon || getServiceIcon(service.name || ''),
            tags: tags,
            // Include doctor details from Firebase
            assignedDoctors: service.doctorDetails || []
          };
        });
      } catch (error) {
        console.error(`Error getting services for ${id}:`, error);
        return [];
      }
    };
    
    // Helper function to get appropriate icon for service
    const getServiceIcon = (serviceName) => {
      if (!serviceName || typeof serviceName !== 'string') {
        return 'medical-outline';
      }
      const name = serviceName.toLowerCase();
      if (name.includes('general') || name.includes('medicine')) return 'medkit-outline';
      if (name.includes('cardiology') || name.includes('heart')) return 'heart-outline';
      if (name.includes('surgery') || name.includes('surgical')) return 'cut-outline';
      if (name.includes('orthopedics') || name.includes('bone')) return 'body-outline';
      if (name.includes('diabetes') || name.includes('diabetology')) return 'pulse-outline';  
      if (name.includes('gynecology') || name.includes('obstetrics')) return 'woman-outline';
      if (name.includes('trauma')) return 'bandage-outline';
      if (name.includes('oncology') || name.includes('cancer')) return 'ribbon-outline';
      if (name.includes('neurology') || name.includes('brain')) return 'brain-outline';
      return 'medical-outline'; // Default icon
    };
    
    const specialtyServices = getSpecialtyServices(specialty.id);
    
    // Render tags for each specialty service
    const renderTags = (tags) => {
      return (
        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      );
    };
    
    // Get appropriate icon for each tag type
    const getTagIcon = (tag) => {
      const tagLower = tag.toLowerCase();
      if (tagLower.includes('check') || tagLower.includes('monitor'))
        return 'checkmark-circle-outline';
      if (tagLower.includes('disease') || tagLower.includes('management'))
        return 'pulse-outline';
      if (tagLower.includes('preventive') || tagLower.includes('prevention'))
        return 'shield-checkmark-outline';
      if (tagLower.includes('emergency'))
        return 'alert-circle-outline';
      if (tagLower.includes('therapy') || tagLower.includes('treatment'))
        return 'fitness-outline';
      if (tagLower.includes('diet') || tagLower.includes('nutrition'))
        return 'nutrition-outline';
      if (tagLower.includes('surgery'))
        return 'cut-outline';
      if (tagLower.includes('heart') || tagLower.includes('cardio'))
        return 'heart-outline';
      
      // Default icon
      return 'medical-outline';
    };
    
    return (
      <View key={specialty.id} style={styles.specialtyCardContainer}>
        {/* Main Specialty Card */}
        <TouchableOpacity
          style={[
            styles.specialtyCard, 
            { 
              backgroundColor: specialty.backgroundColor || '#4285F4',
              borderBottomLeftRadius: isExpanded ? 0 : Sizes.radiusLarge,
              borderBottomRightRadius: isExpanded ? 0 : Sizes.radiusLarge
            }
          ]}
          activeOpacity={0.8}
          onPress={() => {
            if (isExpanded) {
              setExpandedSpecialty(null);
            } else {
              setExpandedSpecialty(specialty.id);
            }
          }}
        >
          <View style={styles.specialtyContent}>
            <View style={styles.specialtyLeft}>
              <View style={styles.specialtyIconContainer}>
                <Ionicons name={specialty.icon || 'medical-outline'} size={24} color={specialty.color || '#FFFFFF'} />
              </View>
              <View style={styles.specialtyInfo}>
                <Text style={styles.specialtyTitle}>{specialty.title || 'Specialty'}</Text>
                {specialty.subtitle && <Text style={styles.specialtySubtitle}>{specialty.subtitle}</Text>}
                <Text style={styles.specialtyCount}>{(specialty.count || 0)} specialties available</Text>
              </View>
            </View>
            <View style={styles.specialtyRight}>
              <View style={styles.seeDetailsButton}>
                <Text style={styles.seeDetailsText}>{isExpanded ? 'Hide' : 'See'} Details</Text>
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={Colors.white} 
                  style={{marginLeft: 4}}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.specialtyDropdown}>
            {specialtyServices.map((service, index) => (
              <View key={service.id} style={[
                styles.specialtyServiceItem,
                index < specialtyServices.length - 1 && styles.serviceItemBorder
              ]}>
                {/* Service Icon and Info Layout */}
                <View style={styles.serviceHeaderRow}>
                  <View style={[
                    styles.serviceIconContainer,
                    { backgroundColor: specialty.backgroundColor } // Match the specialty color
                  ]}>
                    <Ionicons name={service.icon} size={22} color={Colors.white} />
                  </View>
                  
                  <View style={styles.serviceHeaderContent}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  </View>
                </View>
                
                {/* Assigned Doctors */}
                {service.assignedDoctors && service.assignedDoctors.length > 0 && (
                  <View style={styles.assignedDoctorsSection}>
                    <Text style={styles.assignedDoctorsTitle}>Available Doctors:</Text>
                    <View style={styles.assignedDoctorsContainer}>
                      {service.assignedDoctors.map((doctor, doctorIndex) => (
                        <View key={doctorIndex} style={styles.assignedDoctorChip}>
                          <View style={styles.doctorAvatarSmall}>
                            <Text style={styles.doctorInitialsSmall}>
                              {doctor.name?.charAt(0)?.toUpperCase() || 'D'}
                            </Text>
                          </View>
                          <View style={styles.doctorInfoSmall}>
                            <Text style={styles.doctorNameSmall}>Dr. {doctor.name}</Text>
                            <Text style={styles.doctorSpecialtySmall}>{doctor.specialty}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Service Price */}
                {service.price && (
                  <View style={styles.servicePriceContainer}>
                    <Text style={styles.servicePriceLabel}>Starting from:</Text>
                    <Text style={styles.servicePriceValue}>₹{service.price}</Text>
                  </View>
                )}

                {/* Tags */}
                {renderTags(service.tags)}
                
                {/* Book Appointment Button */}
                <TouchableOpacity 
                  style={[
                    styles.bookAppointmentButton,
                    { backgroundColor: specialty.backgroundColor } // Match the specialty color
                  ]}
                  onPress={() => navigation.navigate('BookAppointment', { 
                    category: specialty.id,
                    service: service.name,
                    serviceId: service.id,
                    serviceDetails: service,
                    assignedDoctors: service.assignedDoctors
                  })}
                >
                  <Ionicons name="calendar-outline" size={16} color={Colors.white} style={styles.bookBtnIcon} />
                  <Text style={styles.bookAppointmentText}>Book Appointment</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTestCard = (test) => (
    <TouchableOpacity
      key={test.id}
      style={[styles.testCard, { backgroundColor: test.backgroundColor }]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('BookAppointment', { category: test.id, type: 'test' })}
    >
      <View style={styles.testContent}>
        <View style={styles.testLeft}>
          <View style={styles.testIconContainer}>
            <Ionicons name={test.icon} size={24} color={test.color} />
          </View>
          <View style={styles.testInfo}>
            <Text style={styles.testTitle}>{test.title}</Text>
            {test.subtitle && <Text style={styles.testSubtitle}>{test.subtitle}</Text>}
            <Text style={styles.testCount}>{test.count} tests available</Text>
          </View>
        </View>
        <View style={styles.testRight}>
          <View style={styles.bookTestButton}>
            <Ionicons name="calendar" size={16} color={Colors.white} />
            <Text style={styles.bookTestText}>Book</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmergencyCard = () => (
    <TouchableOpacity
      style={styles.emergencyCard}
      activeOpacity={0.8}
      onPress={() => {
        // Handle emergency call
      }}
    >
      <View style={styles.emergencyIconContainer}>
        <Ionicons name="medical" size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.emergencyTitle}>24/7 Emergency</Text>
      <Text style={styles.emergencySubtitle}>
        Round-the-clock emergency care for all medical emergencies
      </Text>
    </TouchableOpacity>
  );

  // Render individual service with expandable details
  const renderServiceCard = (service) => {
    const isExpanded = expandedService === service.id;
    
    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.serviceDetailCard, isExpanded && styles.expandedServiceCard]}
        onPress={() => setExpandedService(isExpanded ? null : service.id)}
        activeOpacity={0.8}
      >
        <View style={styles.serviceCardHeader}>
          <View style={styles.serviceCardLeft}>
            <View style={styles.serviceCardIcon}>
              <Ionicons 
                name={service.icon || 'medical-outline'} 
                size={24} 
                color="#4AA3DF" 
              />
            </View>
            <View style={styles.serviceCardInfo}>
              <Text style={[styles.serviceCardTitle, { color: theme.textPrimary }]}>{service.name}</Text>
              <Text style={[styles.serviceCardDuration, { color: theme.textSecondary }]}>{service.duration || '30 mins'}</Text>
            </View>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={theme.textSecondary} 
          />
        </View>
        
        {isExpanded && (
          <View style={styles.serviceCardDetails}>
            <Text style={[styles.serviceCardDescription, { color: theme.textSecondary }]}>
              {service.description}
            </Text>
            
            {service.doctors && service.doctors.length > 0 && (
              <View style={styles.serviceCardDoctors}>
                <Text style={[styles.serviceCardSectionTitle, { color: theme.textPrimary }]}>Available Doctors:</Text>
                {service.doctors.map((doctor, index) => (
                  <Text key={index} style={[styles.doctorName, { color: theme.textSecondary }]}>• {doctor}</Text>
                ))}
              </View>
            )}
            
            {service.tags && service.tags.length > 0 && (
              <View style={styles.serviceCardTags}>
                <Text style={[styles.serviceCardSectionTitle, { color: theme.textPrimary }]}>Treatments Include:</Text>
                <View style={styles.tagsContainer}>
                  {service.tags.map((tag, index) => (
                    <View key={index} style={styles.tagChip}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.bookServiceButton}
              onPress={() => navigation.navigate('BookAppointment', { service: service.name })}
            >
              <Ionicons name="calendar" size={16} color="#FFFFFF" />
              <Text style={styles.bookServiceText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          subtitle="Services"
          navigation={navigation}
          showBackButton={true}
        />
        
        {/* Loading Overlay - Shown when content is still loading */}
        {!contentLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.kbrBlue} />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        )}

      <ScrollView 
        ref={scrollViewRef}
        style={[styles.scrollView, { backgroundColor: theme.background }]} 
        showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <View style={[styles.titleSection, { backgroundColor: theme.background }]}>
          <View style={styles.titleRow}>
            <Ionicons name="star" size={20} color="#FFA500" />
            <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Our Specialties</Text>
          </View>
          <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>Comprehensive medical care across all specialties</Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchSection, { backgroundColor: theme.background }]}>
          <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search for services or treatments..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Specialty Categories */}
        <View 
          style={styles.specialtiesSection}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setSpecialtiesPosition(layout.y);
            
            // If there is an expanded specialty from route params, scroll to it
            if (expandedSpecialty && contentLoaded) {
              scrollToSpecialties();
            }
          }}
        >
          {specialtyCategories.map(renderSpecialtyCard)}
        </View>

        {/* Tests Section - Added as requested */}
        <View 
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setTestsPosition(layout.y);
            
            // If we need to scroll to tests section
            if (scrollToSection === 'diagnosticTests' && focusOnTests && contentLoaded) {
              scrollToTestsSection();
            }
          }}
          style={styles.testsSection}>
          <View style={styles.testsSectionHeader}>
            <View style={styles.testsHeaderRow}>
              <Ionicons name="flask" size={20} color="#FF6B35" />
              <Text style={[styles.testsTitle, { color: theme.textPrimary }]}>Diagnostic Tests</Text>
            </View>
            <Text style={[styles.testsSubtitle, { color: theme.textSecondary }]}>Quick and accurate test results</Text>
          </View>
          <View style={styles.testCardsContainer}>
            {testCategories.map(renderTestCard)}
          </View>
        </View>

        {/* Expand All Categories Button */}
        <View style={styles.expandSection}>
          <TouchableOpacity style={styles.expandButton}>
            <Text style={styles.expandText}>Expand All Categories</Text>
            <Ionicons name="add" size={20} color={Colors.kbrRed} />
          </TouchableOpacity>
        </View>

        {/* Emergency Services */}
        <View style={styles.emergencySection}>
          {renderEmergencyCard()}
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
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.xs,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontWeight: '400',
  },
  searchSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  specialtiesSection: {
    paddingHorizontal: Sizes.screenPadding,
    backgroundColor: Colors.white,
    paddingBottom: Sizes.lg,
  },
  specialtyCardContainer: {
    marginBottom: Sizes.md,
  },
  specialtyCard: {
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  specialtyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specialtyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  specialtyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    shadowOpacity: 0.3,
  },
  specialtyInfo: {
    flex: 1,
  },
  specialtyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  specialtySubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  specialtyCount: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  specialtyRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  seeDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeDetailsText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: '600',
  },
  expandSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.kbrRed,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
  },
  expandText: {
    fontSize: Sizes.medium,
    color: Colors.kbrRed,
    fontWeight: '500',
    marginRight: Sizes.xs,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandButtonText: {
    color: Colors.kbrRed,
    fontSize: Sizes.regular,
    fontWeight: '600',
    marginRight: Sizes.sm,
  },
  emergencySection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xxl,
    backgroundColor: Colors.white,
  },
  emergencyCard: {
    backgroundColor: '#EA4335',
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.xl,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.md,
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Sizes.xs,
  },
  emergencyDescription: {
    fontSize: Sizes.medium,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  specialtyDropdown: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Sizes.radiusLarge,
    borderBottomRightRadius: Sizes.radiusLarge,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  specialtyServiceItem: {
    padding: Sizes.xl,
  },
  serviceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceHeaderContent: {
    flex: 1,
    marginLeft: Sizes.md,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: Sizes.md,
    marginHorizontal: -2,
  },
  tagChip: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: Sizes.md,
    borderRadius: 6,
    marginRight: Sizes.sm,
    marginBottom: Sizes.sm,
    borderWidth: 0,
  },
  tagText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  bookAppointmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: Sizes.xl,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: Sizes.md,
  },
  bookBtnIcon: {
    marginRight: 5,
  },
  bookAppointmentText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    marginRight: Sizes.xs,
  },
  
  // Assigned Doctors Styles
  assignedDoctorsSection: {
    marginVertical: Sizes.md,
    paddingTop: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  assignedDoctorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: Sizes.sm,
  },
  assignedDoctorsContainer: {
    gap: Sizes.sm,
  },
  assignedDoctorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  doctorAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.sm,
  },
  doctorInitialsSmall: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  doctorInfoSmall: {
    flex: 1,
  },
  doctorNameSmall: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  doctorSpecialtySmall: {
    fontSize: 13,
    color: '#666666',
  },
  
  // Service Price Styles
  servicePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Sizes.sm,
    paddingVertical: Sizes.xs,
  },
  servicePriceLabel: {
    fontSize: 14,
    color: '#666666',
    marginRight: Sizes.xs,
  },
  servicePriceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  
  // Tests Section Styles
  testsSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
  },
  testsSectionHeader: {
    marginBottom: Sizes.lg,
  },
  testsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.xs,
  },
  testsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: Sizes.xs,
  },
  testsSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  testCardsContainer: {
    gap: Sizes.md,
  },
  testCard: {
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  testContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  testIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  testInfo: {
    flex: 1,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 2,
  },
  testSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  testCount: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.8,
  },
  testRight: {
    alignItems: 'flex-end',
  },
  bookTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  bookTestText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Individual Services Styles
  individualServicesSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.md,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  servicesTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    marginLeft: Sizes.sm,
  },
  servicesSubtitle: {
    fontSize: Sizes.medium,
    marginBottom: Sizes.lg,
    lineHeight: 20,
  },
  servicesContainer: {
    gap: Sizes.md,
  },
  serviceDetailCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expandedServiceCard: {
    backgroundColor: '#E6F4FB',
    borderColor: '#4AA3DF',
    borderWidth: 2,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6F4FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  serviceCardInfo: {
    flex: 1,
  },
  serviceCardTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  serviceCardDuration: {
    fontSize: Sizes.small,
  },
  serviceCardDetails: {
    marginTop: Sizes.md,
    paddingTop: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  serviceCardDescription: {
    fontSize: Sizes.medium,
    lineHeight: 20,
    marginBottom: Sizes.md,
  },
  serviceCardDoctors: {
    marginBottom: Sizes.md,
  },
  serviceCardSectionTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginBottom: Sizes.sm,
  },
  doctorName: {
    fontSize: Sizes.medium,
    marginBottom: 2,
  },
  serviceCardTags: {
    marginBottom: Sizes.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Sizes.sm,
  },
  tagChip: {
    backgroundColor: '#4AA3DF',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: '500',
  },
  bookServiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4AA3DF',
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginTop: Sizes.sm,
  },
  bookServiceText: {
    fontSize: Sizes.regular,
    color: Colors.white,
    fontWeight: '600',
    marginLeft: Sizes.sm,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
});

export default ServicesScreen;