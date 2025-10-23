/**
 * KBR LIFE CARE HOSPITALS - DOCTORS SCREEN
 * Displays details of hospital doctors with their specializations and expertise
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Modal,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { firebaseHospitalServices } from '../../services/firebaseHospitalServices';

const { width } = Dimensions.get('window');

const DoctorsScreen = ({ navigation }) => {
  const { isLoggedIn } = useUnifiedAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Load doctors from Firebase
  useEffect(() => {
    if (isLoggedIn) {
      loadDoctors();
    } else {
      console.log('🔒 Skipping doctors loading - user not authenticated');
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const doctorsResponse = await firebaseHospitalServices.getDoctors();
      console.log('Loaded doctors from Firebase:', doctorsResponse);
      
      // Handle the response object format {success: boolean, data: array}
      if (doctorsResponse.success && doctorsResponse.data) {
        setDoctors(doctorsResponse.data);
      } else {
        console.error('Failed to load doctors:', doctorsResponse.message);
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorPress = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailModal(true);
  };

  const handleBookAppointment = (doctor) => {
    // Navigate directly to BookAppointmentScreen with pre-selected doctor
    navigation.navigate('BookAppointment', { 
      selectedDoctor: doctor,
      preSelectedDoctor: true, // Flag to indicate doctor was pre-selected
      doctorCentricFlow: true  // Flag for doctor-centric booking flow
    });
    setShowDetailModal(false); // Close detail modal if open
  };

  const confirmBooking = () => {
    setShowBookingModal(false);
    // In a real app, you would save the appointment to a database
    // For now, just show a success message via navigation
    navigation.navigate('BookAppointment', { 
      selectedDoctor: bookingDoctor,
      autoSelectDoctor: true
    });
  };

  const renderDoctorCard = (doctor) => (
    <TouchableOpacity
      key={doctor.id}
      style={styles.doctorCard}
      onPress={() => handleDoctorPress(doctor)}
    >
      <View style={styles.doctorImageContainer}>
        {doctor.avatar && (doctor.avatar.startsWith('http') || doctor.avatar.startsWith('file://')) ? (
          <Image 
            source={{ uri: doctor.avatar }} 
            style={styles.doctorFullImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.doctorAvatarContainer}>
            <Text style={styles.doctorAvatarText}>
              {doctor.name ? doctor.name.charAt(0) : 'D'}
            </Text>
          </View>
        )}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Available</Text>
        </View>
      </View>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorCredentials}>{doctor.qualifications}</Text>
        <Text style={styles.doctorRole}>{doctor.specialty}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={16} color="#FFB800" />
          <Text style={styles.infoText}>4.9</Text>
          <Ionicons name="time-outline" size={16} color="#666666" style={styles.infoIcon} />
          <Text style={styles.infoText}>{doctor.experience}</Text>
        </View>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => handleBookAppointment(doctor)}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.kbrBlue} />
        <Text style={styles.loadingText}>Loading doctors information...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
      <View style={styles.safeArea}>
        {/* App Header */}
        <AppHeader 
          title="Our Doctors"
          subtitle="Expert Healthcare Professionals"
          showBackButton={true}
          navigation={navigation}
        />
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>Meet Our Expert Doctors</Text>
            <Text style={styles.heroSubtitle}>
              Our experienced specialists are committed to providing exceptional healthcare with a patient-centered approach.
            </Text>
          </View>

          {/* Doctors List */}
          <View style={styles.doctorsContainer}>
            {doctors && doctors.length > 0 ? (
              doctors.map(doctor => renderDoctorCard(doctor))
            ) : (
              !isLoading && (
                <Text style={styles.noDoctorsText}>No doctors available at the moment</Text>
              )
            )}
          </View>

          {/* Team Information */}
          <View style={styles.teamSection}>
            <Text style={styles.sectionTitle}>Why Choose Our Medical Team?</Text>
            
            <View style={styles.featureRow}>
              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: '#E6F4FB' }]}>
                  <Ionicons name="school" size={24} color={Colors.kbrBlue} />
                </View>
                <Text style={styles.featureTitle}>Highly Qualified</Text>
                <Text style={styles.featureText}>
                  All our doctors are highly qualified with advanced degrees and specializations from prestigious institutions.
                </Text>
              </View>
              
              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="time" size={24} color="#059669" />
                </View>
                <Text style={styles.featureTitle}>Experienced</Text>
                <Text style={styles.featureText}>
                  With years of hands-on experience, our doctors provide expert care based on proven methods.
                </Text>
              </View>
            </View>
            
            <View style={styles.featureRow}>
              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="heart" size={24} color="#F59E0B" />
                </View>
                <Text style={styles.featureTitle}>Compassionate</Text>
                <Text style={styles.featureText}>
                  We believe in treating patients with empathy, dignity and respect at every step.
                </Text>
              </View>
              
              <View style={styles.feature}>
                <View style={[styles.featureIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="medkit" size={24} color="#DC2626" />
                </View>
                <Text style={styles.featureTitle}>24/7 Available</Text>
                <Text style={styles.featureText}>
                  Our emergency team is available round the clock to handle any medical emergencies.
                </Text>
              </View>
            </View>
          </View>

          {/* Contact CTA */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Need Immediate Assistance?</Text>
            <Text style={styles.ctaSubtitle}>Our medical team is just a call away</Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.ctaButtonText}>Contact Us Now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Doctor Detail Modal */}
        <Modal
          visible={showDetailModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedDoctor && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Doctor Profile</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setShowDetailModal(false)}
                    >
                      <Ionicons name="close" size={24} color="#333333" />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.modalDoctorHeader}>
                      <View style={styles.modalDoctorAvatarContainer}>
                        {selectedDoctor.avatar && (selectedDoctor.avatar.startsWith('http') || selectedDoctor.avatar.startsWith('file://')) ? (
                          <Image 
                            source={{ uri: selectedDoctor.avatar }} 
                            style={styles.modalDoctorAvatarContainer}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.modalDoctorAvatarText}>
                            {selectedDoctor.name ? selectedDoctor.name.charAt(0) : 'D'}
                          </Text>
                        )}
                      </View>
                      <View style={styles.modalDoctorInfo}>
                        <Text style={styles.modalDoctorName}>{selectedDoctor.name}</Text>
                        <Text style={styles.modalDoctorCredentials}>{selectedDoctor.qualifications}</Text>
                        <Text style={styles.modalDoctorRole}>{selectedDoctor.specialty}</Text>
                        <View style={styles.modalInfoRow}>
                          <Ionicons name="star" size={16} color="#FFB800" />
                          <Text style={styles.modalInfoText}>4.9</Text>
                          <View style={styles.reviewCount}>
                            <Text style={styles.reviewCountText}>(120+ reviews)</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.modalDoctorDetails}>
                      {/* Fee & Schedule */}
                      <View style={styles.detailRow}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Consultation Fee</Text>
                          <Text style={styles.detailValue}>₹{selectedDoctor.consultationFee || '500'}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Experience</Text>
                          <Text style={styles.detailValue}>{selectedDoctor.experience || 'N/A'}</Text>
                        </View>
                      </View>
                      
                      {/* Availability */}
                      <View style={styles.sectionBlock}>
                        <Text style={styles.sectionBlockTitle}>
                          <Ionicons name="calendar" size={16} color={Colors.kbrBlue} /> Availability
                        </Text>
                        <Text style={styles.sectionBlockContent}>
                          {selectedDoctor.availability || 'Available for consultation'}
                        </Text>
                      </View>
                      
                      {/* Specialty */}
                      <View style={styles.sectionBlock}>
                        <Text style={styles.sectionBlockTitle}>
                          <Ionicons name="medkit" size={16} color={Colors.kbrBlue} /> Specialty
                        </Text>
                        <Text style={styles.bulletPoint}>• {selectedDoctor.specialty}</Text>
                      </View>
                      
                      {/* Qualifications */}
                      <View style={styles.sectionBlock}>
                        <Text style={styles.sectionBlockTitle}>
                          <Ionicons name="school" size={16} color={Colors.kbrBlue} /> Qualifications
                        </Text>
                        <Text style={styles.bulletPoint}>• {selectedDoctor.qualifications}</Text>
                      </View>
                      
                      {/* Phone */}
                      {selectedDoctor.phone && (
                        <View style={styles.sectionBlock}>
                          <Text style={styles.sectionBlockTitle}>
                            <Ionicons name="call" size={16} color={Colors.kbrBlue} /> Contact
                          </Text>
                          <Text style={styles.bulletPoint}>• {selectedDoctor.phone}</Text>
                        </View>
                      )}
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.modalBookButton}
                      onPress={() => handleBookAppointment(selectedDoctor)}
                    >
                      <Text style={styles.modalBookButtonText}>Book Appointment</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Booking Confirmation Modal */}
        <Modal
          visible={showBookingModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowBookingModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.bookingModalContent}>
              {bookingDoctor && (
                <>
                  <View style={styles.bookingModalHeader}>
                    <Text style={styles.bookingModalTitle}>Book Appointment</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setShowBookingModal(false)}
                    >
                      <Ionicons name="close" size={24} color="#333333" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.bookingModalBody}>
                    <View style={styles.bookingDoctorInfo}>
                      <View style={styles.bookingDoctorAvatarContainer}>
                        {bookingDoctor.avatar && (bookingDoctor.avatar.startsWith('http') || bookingDoctor.avatar.startsWith('file://')) ? (
                          <Image 
                            source={{ uri: bookingDoctor.avatar }} 
                            style={styles.bookingDoctorAvatarContainer}
                            resizeMode="cover"
                          />
                        ) : (
                          <Text style={styles.bookingDoctorAvatarText}>
                            {bookingDoctor.name ? bookingDoctor.name.charAt(0) : 'D'}
                          </Text>
                        )}
                      </View>
                      <View>
                        <Text style={styles.bookingDoctorName}>{bookingDoctor.name}</Text>
                        <Text style={styles.bookingDoctorRole}>{bookingDoctor.specialty}</Text>
                        <Text style={styles.bookingDoctorFee}>Fee: ₹{bookingDoctor.consultationFee || '500'}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.bookingConfirmMessage}>
                      <Text style={styles.bookingMessageText}>
                        You are about to be redirected to the appointment booking screen to schedule an appointment with {bookingDoctor.name}.
                      </Text>
                    </View>
                    
                    <View style={styles.bookingActions}>
                      <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => setShowBookingModal(false)}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.confirmButton}
                        onPress={confirmBooking}
                      >
                        <Text style={styles.confirmButtonText}>Continue</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryDark || '#0056b3',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  loadingText: {
    marginTop: Sizes.md,
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  
  // Hero Section
  heroSection: {
    padding: Sizes.screenPadding,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  heroTitle: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Sizes.sm,
  },
  heroSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.white,
    opacity: 0.9,
    lineHeight: 22,
  },
  
  // Doctors Section
  doctorsContainer: {
    padding: Sizes.screenPadding,
    backgroundColor: '#F9FAFB',
  },
  doctorCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    marginBottom: Sizes.lg,
    overflow: 'hidden',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  doctorImageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  doctorFullImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  doctorAvatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.kbrBlue,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  doctorAvatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statusBadge: {
    position: 'absolute',
    top: Sizes.md,
    right: Sizes.md,
    backgroundColor: Colors.kbrGreen,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  statusText: {
    color: Colors.white,
    fontSize: Sizes.small,
    fontWeight: '600',
  },
  doctorInfo: {
    padding: Sizes.lg,
  },
  doctorName: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  doctorCredentials: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.kbrBlue,
    marginBottom: 4,
  },
  doctorRole: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  infoText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  infoIcon: {
    marginLeft: Sizes.md,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Team Section
  teamSection: {
    padding: Sizes.screenPadding,
    backgroundColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.lg,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Sizes.lg,
  },
  feature: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  featureTitle: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // CTA Section
  ctaSection: {
    padding: Sizes.screenPadding,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: Sizes.lg,
  },
  ctaButton: {
    flexDirection: 'row',
    backgroundColor: Colors.kbrRed,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.xl,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
    marginLeft: Sizes.sm,
  },
  
  // Doctor Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingTop: Sizes.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
  },
  modalDoctorHeader: {
    flexDirection: 'row',
    padding: Sizes.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalDoctorAvatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.kbrBlue,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: Sizes.lg,
  },
  modalDoctorAvatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
  },
  modalDoctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalDoctorName: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalDoctorCredentials: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.kbrBlue,
    marginBottom: 4,
  },
  modalDoctorRole: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalInfoText: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  reviewCount: {
    marginLeft: Sizes.sm,
  },
  reviewCountText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  modalDoctorDetails: {
    padding: Sizes.screenPadding,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Sizes.lg,
  },
  detailItem: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
    width: '48%',
  },
  detailLabel: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionBlock: {
    marginBottom: Sizes.lg,
  },
  sectionBlockTitle: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  sectionBlockContent: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bulletPoint: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 4,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#E6F4FB',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    color: Colors.kbrBlue,
    fontSize: Sizes.medium,
  },
  modalBookButton: {
    margin: Sizes.screenPadding,
    backgroundColor: Colors.kbrBlue,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  modalBookButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: '600',
  },
  
  // Booking Modal Styles
  bookingModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Sizes.lg,
    maxHeight: '50%',
  },
  bookingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bookingModalTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  bookingModalBody: {
    padding: Sizes.screenPadding,
  },
  bookingDoctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.lg,
  },
  bookingDoctorAvatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.kbrBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
    overflow: 'hidden',
  },
  bookingDoctorAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  bookingDoctorName: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  bookingDoctorRole: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  bookingDoctorFee: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.kbrGreen,
  },
  bookingConfirmMessage: {
    backgroundColor: '#F3F4F6',
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    marginBottom: Sizes.lg,
  },
  bookingMessageText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bookingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    width: '48%',
    padding: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
  },
  confirmButton: {
    width: '48%',
    padding: Sizes.md,
    backgroundColor: Colors.kbrBlue,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default DoctorsScreen;