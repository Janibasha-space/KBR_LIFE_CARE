import React, { useState } from 'react';
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

const AppointmentScreen = ({ navigation }) => {
  const { getAllServices } = useServices();
  const { isLoggedIn, userData, getUpcomingAppointments, getPastAppointments, cancelAppointment, logout } = useUnifiedAuth();
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

  // Load appointments when screen is focused or user logs in
  React.useEffect(() => {
    if (isLoggedIn) {
      loadUserAppointments();
    }
  }, [isLoggedIn]);

  // Refresh appointments when screen comes into focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isLoggedIn) {
        loadUserAppointments();
      }
    });

    return unsubscribe;
  }, [navigation, isLoggedIn]);

  // Function to load user appointments
  const loadUserAppointments = async () => {
    if (!isLoggedIn) return;
    
    setIsRefreshing(true);
    try {
      console.log('🔄 Loading user appointments...');
      await refreshAppointmentData();
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

  // Get appointments for logged-in user (only when logged in)
  // Pass appointment data from AppContext to UnifiedAuthContext functions
  // Use refreshKey to force recalculation when test appointments are added
  const appointmentsData = React.useMemo(() => appState?.appointments || [], [appState?.appointments, refreshKey]);
  const upcomingAppointments = React.useMemo(() => 
    isLoggedIn ? getUpcomingAppointments(appointmentsData) : [], 
    [isLoggedIn, appointmentsData, getUpcomingAppointments, refreshKey]
  );
  const pastAppointments = React.useMemo(() => 
    isLoggedIn ? getPastAppointments(appointmentsData) : [], 
    [isLoggedIn, appointmentsData, getPastAppointments, refreshKey]
  );

  // If user is not logged in, show loading while redirecting
  if (!isLoggedIn) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white'}}>
        <Text style={{fontSize: 16, color: '#666'}}>Loading...</Text>
      </View>
    );
  }
  
  // Check if appointment can be cancelled (3 hours before)
  const canCancelAppointment = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime - now) / (1000 * 60 * 60);
    return hoursDifference >= 3;
  };

  // Handle appointment cancellation with 3-hour policy
  const handleCancelAppointment = (appointment) => {
    if (!canCancelAppointment(appointment)) {
      Alert.alert(
        'Cannot Cancel',
        'Appointments can only be cancelled at least 3 hours before the scheduled time.',
        [{ text: 'OK' }]
      );
      return;
    }

    const refundMessage = appointment.paymentStatus === 'paid' 
      ? '\n\nSince you have already paid, please contact the hospital for refund processing.'
      : '';

    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment with ${appointment.doctorName} on ${appointment.date} at ${appointment.time}?${refundMessage}`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelAppointment(appointment.id);
            Alert.alert('Success', 'Appointment cancelled successfully');
          },
        },
      ]
    );
  };

  // Handle appointment rescheduling
  const handleRescheduleAppointment = (appointment) => {
    if (!canCancelAppointment(appointment)) {
      Alert.alert(
        'Cannot Reschedule',
        'Appointments can only be rescheduled at least 3 hours before the scheduled time.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedAppointment(appointment);
    setRescheduleData({ date: appointment.date, time: appointment.time });
    setShowRescheduleModal(true);
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

  // Render past appointment card
  const renderPastAppointment = (appointment) => (
    <TouchableOpacity 
      key={appointment.id} 
      style={styles.pastAppointmentCard}
      onPress={() => navigation.navigate('AppointmentDetail', { appointment })}
      activeOpacity={0.7}
    >
      <View style={styles.appointmentHeader}>
        <Text style={styles.appointmentService}>{appointment.serviceName}</Text>
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Completed</Text>
        </View>
      </View>
      <Text style={styles.appointmentDoctor}>{appointment.doctorName}</Text>
      <View style={styles.appointmentDateTime}>
        <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.pastAppointmentDate}>{appointment.date}</Text>
        <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.pastAppointmentTime}>{appointment.time}</Text>
      </View>
      
      {/* Tap to view details indicator */}
      <View style={styles.tapIndicator}>
        <Ionicons name="chevron-forward" size={16} color={Colors.gray} />
        <Text style={styles.tapText}>Tap for details</Text>
      </View>
    </TouchableOpacity>
  );

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
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={true} />
      
      {/* Header - Full screen with rounded bottom corners */}
      <View style={{
        backgroundColor: Colors.kbrBlue,
        paddingTop: StatusBar.currentHeight || 44, // Account for status bar
        paddingHorizontal: 20,
        paddingBottom: 25,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
        
        <View>
          <Text style={{
            fontSize: 24, 
            fontWeight: 'bold', 
            color: Colors.white,
            marginBottom: 4
          }}>
            Your Appointments
          </Text>
          <Text style={{
            fontSize: 14, 
            color: 'rgba(255, 255, 255, 0.8)'
          }}>
            View your past and upcoming appointments
          </Text>
        </View>
      </View>

        <ScrollView 
          style={{flex: 1}} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 20}}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={loadUserAppointments}
              colors={[Colors.kbrBlue]}
              tintColor={Colors.kbrBlue}
            />
          }
        >
          {/* Upcoming Appointments */}
          <View style={{backgroundColor: 'white', marginTop: 0, marginBottom: 8}}>
            <View style={{paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937'}}>
                Upcoming Appointments
              </Text>
            </View>
            
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <View key={appointment.id} style={{
                  marginHorizontal: 16,
                  marginVertical: 8,
                  backgroundColor: '#F8F9FF',
                  borderRadius: 12,
                  padding: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: '#4285F4',
                }}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937', flex: 1}}>
                      {appointment.serviceName}
                    </Text>
                    <View style={{
                      backgroundColor: '#4285F4',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{fontSize: 12, color: 'white', fontWeight: '600'}}>
                        {appointment.tokenNumber}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{fontSize: 14, color: '#374151', marginBottom: 8}}>
                    {appointment.doctorName}
                  </Text>
                  
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 20}}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text style={{fontSize: 12, color: '#6B7280', marginLeft: 5}}>
                        {appointment.date}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={{fontSize: 12, color: '#6B7280', marginLeft: 5}}>
                        {appointment.time}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={{padding: 40, alignItems: 'center'}}>
                <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
                <Text style={{fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 12}}>
                  No upcoming appointments
                </Text>
                
                {/* Fix Appointments Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: '#FF6B35',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 16,
                    marginBottom: 8
                  }}
                  onPress={runAppointmentMigration}
                >
                  <Text style={{color: 'white', fontSize: 14, fontWeight: '600'}}>
                    Fix My Existing Appointments
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={{
                    backgroundColor: Colors.primary,
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 8,
                    marginTop: 8
                  }}
                  onPress={() => navigation.navigate('BookAppointment')}
                >
                  <Text style={{color: 'white', fontSize: 14, fontWeight: '600'}}>
                    Book Your First Appointment
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Past Appointments */}
          <View style={{backgroundColor: 'white', marginBottom: 0}}>
            <View style={{paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6'}}>
              <Text style={{fontSize: 18, fontWeight: 'bold', color: '#1F2937'}}>
                Past Appointments
              </Text>
            </View>
            
            {pastAppointments.length > 0 ? (
              pastAppointments.map((appointment) => (
                <View key={appointment.id} style={{
                  marginHorizontal: 16,
                  marginVertical: 8,
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  padding: 16,
                  borderLeftWidth: 4,
                  borderLeftColor: '#10B981',
                }}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8}}>
                    <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937', flex: 1}}>
                      {appointment.serviceName}
                    </Text>
                    <View style={{
                      backgroundColor: '#10B981',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}>
                      <Text style={{fontSize: 12, color: 'white', fontWeight: '600'}}>
                        Completed
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={{fontSize: 14, color: '#374151', marginBottom: 8}}>
                    {appointment.doctorName}
                  </Text>
                  
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 20}}>
                      <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                      <Text style={{fontSize: 12, color: '#6B7280', marginLeft: 5}}>
                        {appointment.date}
                      </Text>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={{fontSize: 12, color: '#6B7280', marginLeft: 5}}>
                        {appointment.time}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={{padding: 40, alignItems: 'center'}}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#D1D5DB" />
                <Text style={{fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 12}}>
                  No past appointments
                </Text>
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
              backgroundColor: '#4285F4',
              paddingVertical: 15,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => navigation.navigate('BookAppointment')}
            activeOpacity={0.8}
          >
            <Text style={{fontSize: 16, fontWeight: 'bold', color: 'white', marginRight: 8}}>
              Book New Appointment
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
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
  pastAppointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    opacity: 0.8,
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
  completedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: Sizes.radiusSmall,
  },
  completedText: {
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
  pastAppointmentDate: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginLeft: 4,
    marginRight: Sizes.md,
  },
  pastAppointmentTime: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
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