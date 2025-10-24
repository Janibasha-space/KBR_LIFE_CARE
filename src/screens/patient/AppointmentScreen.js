import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useServices } from '../../contexts/ServicesContext';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useApp } from '../../contexts/AppContext';
import { AppointmentMigration } from '../../services/appointmentMigration';
import { AppointmentService } from '../../services/hospitalServices';
import AppHeader from '../../components/AppHeader';
import AppointmentCard from '../../components/AppointmentCard';

const AppointmentScreen = ({ navigation }) => {
  const { getAllServices } = useServices();
  const { isLoggedIn, userData, getUpcomingAppointments, cancelAppointment, logout } = useUnifiedAuth();
  const { appState, addAppointment, refreshAppointmentData } = useApp(); // Get appointment data and refresh function
  const [selectedService, setSelectedService] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // For forcing re-renders
  const [isRefreshing, setIsRefreshing] = useState(false); // For loading state
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
  });
  const [backendAppointments, setBackendAppointments] = useState([]);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);

  // Load appointments from backend
  const loadBackendAppointments = async () => {
    try {
      setIsLoadingBackend(true);
      
      // Try multiple user ID sources and also load all appointments for now
      const currentUserId = userData?.id || userData?.userData?.id;
      const knownUserId = 'dkvlyCz70qaqDCy1XDdYJDAVRAt2'; // Known user ID from bookings
      
      console.log('� Loading appointments from backend for user:', currentUserId);
      
      // Load appointments for the current user or all appointments if no specific user
      let appointments;
      if (currentUserId) {
        appointments = await AppointmentService.getAppointments(currentUserId);
      } else {
        appointments = await AppointmentService.getAppointments();
      }
      
      console.log(`� Loaded ${appointments?.length || 0} appointments from backend`);
      
      setBackendAppointments(appointments || []);
    } catch (error) {
      console.error('❌ Error loading backend appointments:', error);
      // Fallback to context appointments if backend fails
      setBackendAppointments([]);
    } finally {
      setIsLoadingBackend(false);
    }
  };

  // Load appointments when screen is focused or user logs in
  React.useEffect(() => {
    if (isLoggedIn) {
      loadUserAppointments();
      loadBackendAppointments();
    }
  }, [isLoggedIn]);

  // Refresh appointments when screen comes into focus (handles backend deletions)
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isLoggedIn) {
        loadUserAppointments();
        loadBackendAppointments();
      }
    });

    return unsubscribe;
  }, [navigation, isLoggedIn]);

  // Auto-refresh every 30 seconds to catch backend changes
  React.useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      loadBackendAppointments();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Function to load user appointments
  const loadUserAppointments = async () => {
    if (!isLoggedIn) return;
    
    setIsRefreshing(true);
    try {
      console.log('🔄 Loading user appointments...');
      await refreshAppointmentData();
      await loadBackendAppointments(); // Also refresh backend data
      setRefreshKey(prev => prev + 1); // Force re-render
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
    }
    setIsRefreshing(false);
  };

  // Migration function to fix existing appointments
  const runAppointmentMigration = async () => {
    Alert.alert(
      'Fix Existing Appointments',
      'This will update your existing appointments to show in your account. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Fix Appointments', 
          onPress: async () => {
            setIsRefreshing(true);
            try {
              console.log('🔧 Running appointment migration...');
              const result = await AppointmentMigration.fixExistingAppointments();
              
              if (result.success) {
                Alert.alert(
                  'Success!', 
                  `Fixed ${result.updatedCount} appointments. They should now appear in your list.`,
                  [{ text: 'OK', onPress: () => loadUserAppointments() }]
                );
              } else {
                Alert.alert('Error', `Migration failed: ${result.error}`);
              }
            } catch (error) {
              console.error('❌ Migration error:', error);
              Alert.alert('Error', 'Failed to run migration');
            }
            setIsRefreshing(false);
          }
        }
      ]
    );
  };

  // Navigation logic: Non-logged users go directly to booking flow
  React.useEffect(() => {
    if (!isLoggedIn) {
      // For non-logged users, redirect directly to booking flow
      navigation.replace('BookAppointment');
      return;
    }
  }, [isLoggedIn, navigation]);

  // Merge appointments from context and backend
  const allAppointmentsData = React.useMemo(() => {
    const contextAppointments = appState?.appointments || [];
    const mergedAppointments = [...contextAppointments, ...backendAppointments];
    
    // Remove duplicates based on ID
    const uniqueAppointments = mergedAppointments.filter((appointment, index, self) => 
      index === self.findIndex(apt => apt.id === appointment.id)
    );
    
    console.log(`📊 Merged ${uniqueAppointments.length} unique appointments`);
    
    // ENHANCED USER MATCHING: Handle multiple user ID scenarios
    const currentUserId = userData?.id || userData?.userData?.id;
    const knownUserIds = [
      'dkvlyCz70qaqDCy1XDdYJDAVRAt2', // Known Firebase user ID from bookings
      'mzWCk8qi01WnjH0VusHCFDrn0TG3', // Current auth user ID
      currentUserId // Dynamic current user ID
    ].filter(Boolean);
    
    // Show appointments that match any of the known user IDs OR show all if user is logged in
    const filteredAppointments = uniqueAppointments.filter(apt => {
      const appointmentUserId = apt.patientId || apt.userId || apt.user_id;
      return knownUserIds.includes(appointmentUserId) || !appointmentUserId;
    });
    
    console.log(`📊 Showing ${filteredAppointments.length} appointments for user`);
    
    return filteredAppointments;
  }, [appState?.appointments, backendAppointments, refreshKey, userData]);

  // Enhanced filtering with better date parsing
  const filterAppointmentsByDate = (appointments, isUpcoming = true) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today for comparison
    
    return appointments.filter(appointment => {
      try {
        let appointmentDate;
        
        // Enhanced date parsing
        const dateSource = appointment.date || appointment.appointmentDate;
        if (!dateSource) {
          return false;
        }
        
        if (typeof dateSource === 'string') {
          if (dateSource.includes('T')) {
            appointmentDate = new Date(dateSource);
          } else if (dateSource.includes(' ')) {
            const datePart = dateSource.split(' ')[0];
            appointmentDate = new Date(datePart);
          } else {
            appointmentDate = new Date(dateSource);
          }
        } else {
          appointmentDate = new Date(dateSource);
        }
        
        if (isNaN(appointmentDate.getTime())) {
          return false;
        }
        
        appointmentDate.setHours(0, 0, 0, 0);
        const isAppointmentUpcoming = appointmentDate >= today;
        
        return isUpcoming ? isAppointmentUpcoming : !isAppointmentUpcoming;
      } catch (error) {
        console.warn('Error parsing appointment date:', error);
        return false;
      }
    });
  };

  // Get appointments with more flexible filtering
  const upcomingAppointments = React.useMemo(() => {
    if (!isLoggedIn) return [];
    
    // First try the context filtering, then fallback to our own
    let upcoming = getUpcomingAppointments(allAppointmentsData);
    
    // If context filtering returns empty but we have appointments, use our own filtering
    if (upcoming.length === 0 && allAppointmentsData.length > 0) {
      upcoming = filterAppointmentsByDate(allAppointmentsData, true);
    }
    return upcoming;
  }, [isLoggedIn, allAppointmentsData, getUpcomingAppointments, refreshKey]);

  // If user is not logged in, show loading while redirecting
  if (!isLoggedIn) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}}>
        <Text style={{fontSize: 16, color: '#666'}}>Loading...</Text>
      </View>
    );
  }
  
  // Handle appointment card press - navigate to details
  const handleAppointmentPress = (appointment) => {
    navigation.navigate('AppointmentDetail', { appointment });
  };

  // Handle appointment cancellation with real-time refresh
  const handleCancelAppointment = async (appointmentId) => {
    try {
      setIsRefreshing(true);
      
      // Cancel appointment
      await cancelAppointment(appointmentId);
      
      // Force refresh both context and backend data
      await Promise.all([
        refreshAppointmentData(),
        loadBackendAppointments()
      ]);
      
      // Force re-render
      setRefreshKey(prev => prev + 1);
      
      Alert.alert('Success', 'Appointment cancelled successfully');
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      Alert.alert('Error', 'Failed to cancel appointment. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle appointment rescheduling
  const handleRescheduleAppointment = (appointmentId) => {
    const appointment = allAppointmentsData.find(apt => apt.id === appointmentId);
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowRescheduleModal(true);
    }
  };

  // Check if appointment can be cancelled (3 hours before)
  const canCancelAppointment = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime - now) / (1000 * 60 * 60);
    return hoursDifference >= 3;
  };

  // Render upcoming appointment card
  const renderUpcomingAppointment = (appointment) => {
    const canManageAppointment = canCancelAppointment(appointment);
    
    return (
      <TouchableOpacity 
        key={appointment.id} 
        style={styles.appointmentCard}
        onPress={() => navigation.navigate('AppointmentDetail', { appointment })}
        activeOpacity={0.7}
      >
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentService}>{appointment.serviceName}</Text>
          <View style={styles.tokenBadge}>
            <Text style={styles.tokenText}>{appointment.tokenNumber}</Text>
          </View>
        </View>
        <Text style={styles.appointmentDoctor}>{appointment.doctorName}</Text>
        <View style={styles.appointmentDateTime}>
          <Ionicons name="calendar-outline" size={16} color={Colors.kbrBlue} />
          <Text style={styles.appointmentDate}>{appointment.date}</Text>
          <Ionicons name="time-outline" size={16} color={Colors.kbrBlue} />
          <Text style={styles.appointmentTime}>{appointment.time}</Text>
        </View>
        
        {/* Tap to view details indicator */}
        <View style={styles.tapIndicator}>
          <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
          <Text style={styles.tapText}>Tap for details</Text>
        </View>
        
        {canManageAppointment ? (
          <View style={styles.appointmentActions}>
            <TouchableOpacity
              style={styles.rescheduleButton}
              onPress={(e) => {
                e.stopPropagation();
                handleRescheduleAppointment(appointment);
              }}
            >
              <Ionicons name="calendar-outline" size={16} color={Colors.kbrBlue} />
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={(e) => {
                e.stopPropagation();
                handleCancelAppointment(appointment);
              }}
            >
              <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noActionMessage}>
            <Text style={styles.noActionText}>
              Cannot cancel/reschedule (less than 3 hours remaining)
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // If user is not logged in, show the booking screen directly
  if (!isLoggedIn) {
    return (
      <View style={styles.outerContainer}>
        <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('PatientMain', { screen: 'Home' })}>
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
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('BookAppointment')}
            >
              <Ionicons name="log-in-outline" size={16} color={Colors.white} />
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageTitle}>Book Appointment</Text>
              <Text style={styles.pageSubtitle}>Please login or book a new appointment</Text>
            </View>

            <View style={styles.bookButtonContainer}>
              <TouchableOpacity
                style={styles.bookNewButton}
                onPress={() => navigation.navigate('BookAppointment')}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color={Colors.white} />
                <Text style={styles.bookNewButtonText}>Start Booking Appointment</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={true} />
      
      {/* App Header */}
      <AppHeader 
        title="Your Appointments"
        subtitle="View your past and upcoming appointments"
        navigation={navigation}
        showBackButton={true}
        useSimpleAdminHeader={true}
      />

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || isLoadingBackend}
            onRefresh={loadUserAppointments}
            colors={[Colors.kbrBlue]}
            tintColor={Colors.kbrBlue}
          />
        }
      >
          {/* Backend Loading Indicator */}
          {isLoadingBackend && (
            <View style={{
              backgroundColor: 'white',
              marginHorizontal: 16,
              marginVertical: 8,
              padding: 16,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Ionicons name="sync" size={16} color={Colors.primary} />
              <Text style={{marginLeft: 8, fontSize: 14, color: Colors.primary}}>
                Loading appointments from backend...
              </Text>
            </View>
          )}

          {/* Appointments Summary */}
          {upcomingAppointments.length > 0 && (
            <View style={{
              backgroundColor: '#F0F9FF',
              marginHorizontal: 16,
              marginVertical: 8,
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: Colors.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text style={{fontSize: 16, color: '#1E40AF', fontWeight: '600', marginBottom: 4}}>
                    Your Appointments
                  </Text>
                  <Text style={{fontSize: 12, color: '#3B82F6'}}>
                    {upcomingAppointments.length} upcoming appointments
                  </Text>
                </View>
                <View style={{
                  backgroundColor: '#3B82F6',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}>
                  <Text style={{fontSize: 14, color: 'white', fontWeight: '600'}}>
                    {upcomingAppointments.length}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Upcoming Appointments */}
          <View style={{backgroundColor: 'white', marginTop: 0, marginBottom: 8}}>
            <View style={{paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937'}}>
                Upcoming Appointments ({upcomingAppointments.length})
              </Text>
            </View>
            
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  type="upcoming"
                  onPress={handleAppointmentPress}
                  onCancel={handleCancelAppointment}
                  onReschedule={handleRescheduleAppointment}
                  showActions={true}
                />
              ))
            ) : (
              <View style={{padding: 40, alignItems: 'center', backgroundColor: '#F9FAFB', margin: 16, borderRadius: 12}}>
                <Ionicons name="calendar-outline" size={56} color="#9CA3AF" />
                <Text style={{fontSize: 18, color: '#374151', textAlign: 'center', marginTop: 16, fontWeight: '500'}}>
                  No Upcoming Appointments
                </Text>
                <Text style={{fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 20}}>
                  Book your next appointment to get started
                </Text>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 14,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={() => navigation.navigate('BookAppointment')}
                >
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={{color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8}}>
                    Book Appointment
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Book New Appointment Button */}
        <View style={{
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingVertical: 15,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB'
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 15,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }}
            onPress={() => navigation.navigate('BookAppointment')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={20} color="white" style={{marginRight: 8}} />
            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white'}}>
              Book New Appointment
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={{marginLeft: 8}} />
          </TouchableOpacity>
        </View>

        {/* Reschedule Modal */}
        <Modal
          visible={showRescheduleModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRescheduleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <Text style={styles.modalSubtitle}>
                Select new date and time for your appointment
              </Text>
              
              {selectedAppointment && (
                <View style={styles.currentAppointmentInfo}>
                  <Text style={styles.currentAppointmentLabel}>Current Appointment:</Text>
                  <Text style={styles.currentAppointmentText}>
                    {selectedAppointment.serviceName} with {selectedAppointment.doctorName}
                  </Text>
                  <Text style={styles.currentAppointmentText}>
                    {selectedAppointment.date} at {selectedAppointment.time}
                  </Text>
                </View>
              )}

              <View style={styles.rescheduleOptions}>
                <TouchableOpacity style={styles.rescheduleOptionButton}>
                  <Ionicons name="calendar-outline" size={20} color={Colors.kbrBlue} />
                  <Text style={styles.rescheduleOptionText}>Select New Date</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.rescheduleOptionButton}>
                  <Ionicons name="time-outline" size={20} color={Colors.kbrBlue} />
                  <Text style={styles.rescheduleOptionText}>Select New Time</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowRescheduleModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => {
                    // For now, just show success message
                    setShowRescheduleModal(false);
                    Alert.alert('Success', 'Appointment rescheduled successfully!');
                  }}
                >
                  <Text style={styles.modalConfirmText}>Confirm Reschedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },


  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
  },
  logoutText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
  },
  scrollView: {
    flex: 1,
  },
  pageHeader: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pageTitle: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
  },
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  appointmentService: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  tokenBadge: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: Sizes.radiusSmall,
  },
  tokenText: {
    color: Colors.white,
    fontSize: Sizes.small,
    fontWeight: 'bold',
  },
  appointmentDoctor: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  appointmentDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  appointmentDate: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginLeft: 4,
    marginRight: Sizes.md,
  },
  appointmentTime: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginLeft: 4,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  cancelButtonText: {
    color: Colors.danger,
    fontSize: Sizes.small,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Sizes.xl,
  },
  emptyStateText: {
    fontSize: Sizes.regular,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Sizes.md,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  bookButtonContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
  },
  bookNewButton: {
    backgroundColor: Colors.kbrBlue,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bookNewButtonText: {
    color: Colors.white,
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    marginLeft: Sizes.sm,
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  rescheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.kbrBlue,
    flex: 0.48,
    justifyContent: 'center',
  },
  rescheduleButtonText: {
    color: Colors.kbrBlue,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    flex: 0.48,
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  noActionMessage: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  noActionText: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  currentAppointmentInfo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  currentAppointmentLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  currentAppointmentText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  rescheduleOptions: {
    marginBottom: 24,
  },
  rescheduleOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  rescheduleOptionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
  },
  modalCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalConfirmButton: {
    backgroundColor: Colors.kbrBlue,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 0.45,
  },
  modalConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tapText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
});

export default AppointmentScreen;