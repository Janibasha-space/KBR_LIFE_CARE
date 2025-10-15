import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import AdmitPatientModal from '../../components/AdmitPatientModal';
import AddAppointmentModal from '../../components/AddAppointmentModal';
import AppHeader from '../../components/AppHeader';

const AppointmentManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);

  // Mock data for appointments - Convert to state for dynamic updates
  const [appointmentsList, setAppointmentsList] = useState([
    {
      id: 'APT001',
      patientName: 'Rajesh Kumar',
      patientId: 'KBR-OP-2024-001',
      patientPhone: '+91 98765 43210',
      doctorName: 'Dr. K. Ramesh',
      department: 'General Medicine',
      service: 'General Consultation',
      appointmentDate: '2024-01-15',
      appointmentTime: '10:00 AM',
      status: 'Confirmed',
      statusColor: '#10B981',
      fees: 600,
      paymentStatus: 'Paid',
      paymentMode: 'Online',
      transactionId: 'TXN123456789',
      razorpayOrderId: 'order_123456',
      bookingDate: '2024-01-12',
      patientAge: 45,
      patientGender: 'Male',
      symptoms: 'Fever, headache, body pain',
      emergencyContact: '+91 98765 43211',
      patientAddress: '123 Main St, City, State, 12345',
      isNewPatient: false,
      avatar: 'R'
    },
    {
      id: 'APT002',
      patientName: 'Priya Sharma',
      patientId: 'KBR-OP-2024-002',
      patientPhone: '+91 98765 43211',
      doctorName: 'Dr. K. Divyavani',
      department: 'Gynecology',
      service: 'Prenatal Checkup',
      appointmentDate: '2024-01-15',
      appointmentTime: '11:30 AM',
      status: 'Pending',
      statusColor: '#F59E0B',
      fees: 800,
      paymentStatus: 'Pending',
      paymentMode: 'Pay at Hospital',
      bookingDate: '2024-01-14',
      patientAge: 28,
      patientGender: 'Female',
      symptoms: 'Routine prenatal checkup',
      emergencyContact: '+91 98765 43212',
      patientAddress: '456 Oak Ave, City, State, 67890',
      isNewPatient: true,
      avatar: 'P'
    },
    {
      id: 'APT003',
      patientName: 'Amit Patel',
      patientId: 'KBR-OP-2024-003',
      patientPhone: '+91 98765 43212',
      doctorName: 'Dr. Mahesh Kumar',
      department: 'Cardiology',
      service: 'ECG & Consultation',
      appointmentDate: '2024-01-15',
      appointmentTime: '2:00 PM',
      status: 'Completed',
      statusColor: '#6B7280',
      fees: 1200,
      paymentStatus: 'Paid',
      bookingDate: '2024-01-10',
      patientAge: 52,
      patientGender: 'Male',
      symptoms: 'Chest pain, breathing difficulty',
      isNewPatient: false,
      avatar: 'A'
    },
    {
      id: 'APT004',
      patientName: 'Sunita Devi',
      patientId: 'KBR-OP-2024-004',
      patientPhone: '+91 98765 43213',
      doctorName: 'Dr. K. Thukaram',
      department: 'Dentistry',
      service: 'Dental Consultation',
      appointmentDate: '2024-01-15',
      appointmentTime: '3:30 PM',
      status: 'Cancelled',
      statusColor: '#EF4444',
      fees: 500,
      paymentStatus: 'Refunded',
      bookingDate: '2024-01-13',
      patientAge: 35,
      patientGender: 'Female',
      symptoms: 'Tooth pain, gum swelling',
      isNewPatient: true,
      avatar: 'S'
    }
  ]);

  // Helper function to check if date matches filter (needed for statistics)
  const checkDateFilter = (appointmentDate, filter) => {
    const today = new Date();
    const appointmentDateTime = new Date(appointmentDate);
    
    switch (filter) {
      case 'Today':
        return appointmentDateTime.toDateString() === today.toDateString();
      case 'Tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return appointmentDateTime.toDateString() === tomorrow.toDateString();
      case 'This Week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return appointmentDateTime >= startOfWeek && appointmentDateTime <= endOfWeek;
      case 'This Month':
        return appointmentDateTime.getMonth() === today.getMonth() && 
               appointmentDateTime.getFullYear() === today.getFullYear();
      case 'All':
        return true;
      default:
        return true;
    }
  };

  // Calculate real-time appointment statistics using useMemo for performance
  const appointmentStats = useMemo(() => {
    // Add safety check to prevent errors
    if (!appointmentsList || !Array.isArray(appointmentsList)) {
      return {
        totalAppointments: 0,
        todayAppointments: 0,
        confirmedAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0
      };
    }
    
    return {
      totalAppointments: appointmentsList.length,
      todayAppointments: appointmentsList.filter(apt => checkDateFilter(apt.appointmentDate, 'Today')).length,
      confirmedAppointments: appointmentsList.filter(apt => apt.status === 'Confirmed').length,
      pendingAppointments: appointmentsList.filter(apt => apt.status === 'Pending').length,
      completedAppointments: appointmentsList.filter(apt => apt.status === 'Completed').length
    };
  }, [appointmentsList]);

  const statuses = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];
  const dateFilters = ['All', 'Today', 'Tomorrow', 'This Week', 'This Month'];

  const filteredAppointments = useMemo(() => {
    // Add safety check to prevent errors
    if (!appointmentsList || !Array.isArray(appointmentsList)) {
      return [];
    }
    
    return appointmentsList.filter(appointment => {
      const matchesSearch = appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || appointment.status === selectedStatus;
      const matchesDate = checkDateFilter(appointment.appointmentDate, selectedDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointmentsList, searchQuery, selectedStatus, selectedDate]);

  // Handler functions
  const handleViewAppointment = (appointment) => {
    navigation.navigate('AppointmentDetails', { appointment });
  };

  const handleCall = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleConfirmPayment = (appointmentId) => {
    Alert.alert(
      'Confirm Payment',
      'Has the patient made the payment at the hospital?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Confirm', 
          onPress: () => {
            Alert.alert('Success', 'Payment confirmed and appointment updated');
            // Update appointment status logic here
          }
        }
      ]
    );
  };

  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Appointment cancelled');
            // Cancel appointment logic here
          }
        }
      ]
    );
  };

  const handleCompleteAppointment = (appointmentId) => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Complete', 
          onPress: () => {
            Alert.alert('Success', 'Appointment marked as completed');
            // Complete appointment logic here
          }
        }
      ]
    );
  };

  const handleAdmitPatient = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAdmitModal(true);
  };

  const handleAdmitSuccess = (newPatient) => {
    Alert.alert(
      'Patient Admitted',
      `${newPatient.name} has been successfully admitted to the ${newPatient.patientType === 'IP' ? 'In-Patient' : 'Out-Patient'} list.`,
      [
        {
          text: 'View Patients',
          onPress: () => navigation.navigate('PatientManagement')
        },
        { text: 'OK' }
      ]
    );
  };

  const handleAddAppointment = () => {
    setShowAddAppointmentModal(true);
  };

  const handleAddAppointmentSuccess = (newAppointment) => {
    setAppointmentsList(prev => [newAppointment, ...prev]);
    Alert.alert('Success', 'New appointment has been added successfully!');
  };

  const handleQuickEditStatus = (appointment) => {
    Alert.alert(
      'Change Status',
      `Current status: ${appointment.status}\nSelect new status:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pending', 
          onPress: () => updateAppointmentStatus(appointment.id, 'Pending', '#F59E0B') 
        },
        { 
          text: 'Confirmed', 
          onPress: () => updateAppointmentStatus(appointment.id, 'Confirmed', '#10B981') 
        },
        { 
          text: 'Completed', 
          onPress: () => updateAppointmentStatus(appointment.id, 'Completed', '#6B7280') 
        },
        { 
          text: 'Cancelled', 
          onPress: () => updateAppointmentStatus(appointment.id, 'Cancelled', '#EF4444') 
        },
      ]
    );
  };

  const updateAppointmentStatus = (appointmentId, status, color) => {
    setAppointmentsList(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status, statusColor: color }
          : appointment
      )
    );
    Alert.alert('Success', `Appointment status updated to ${status}`);
  };

  const StatsCard = ({ title, value, subtitle, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const AppointmentCard = ({ appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.patientInfo}>
          <View style={[styles.avatar, { backgroundColor: Colors.kbrBlue }]}>
            <Text style={styles.avatarText}>{appointment.avatar}</Text>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.patientNameRow}>
              <Text style={styles.patientName}>{appointment.patientName}</Text>
              {appointment.isNewPatient && (
                <View style={styles.newPatientBadge}>
                  <Text style={styles.newPatientText}>NEW</Text>
                </View>
              )}
            </View>
            <Text style={styles.patientId}>{appointment.patientId}</Text>
            <Text style={styles.patientMeta}>
              {appointment.patientAge}yrs • {appointment.patientGender} • {appointment.patientPhone}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: appointment.statusColor }]}>
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.appointmentRow}>
          <View style={styles.appointmentItem}>
            <Ionicons name="person" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.doctorName}</Text>
          </View>
          <View style={styles.appointmentItem}>
            <Ionicons name="medical" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.department}</Text>
          </View>
        </View>

        <View style={styles.appointmentRow}>
          <View style={styles.appointmentItem}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.appointmentDate}</Text>
          </View>
          <View style={styles.appointmentItem}>
            <Ionicons name="time" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.appointmentTime}</Text>
          </View>
        </View>

        <View style={styles.serviceRow}>
          <View style={styles.serviceItem}>
            <Ionicons name="clipboard" size={16} color={Colors.kbrBlue} />
            <Text style={styles.serviceText}>{appointment.service}</Text>
          </View>
          <View style={styles.feeItem}>
            <Ionicons name="cash" size={16} color={Colors.kbrGreen} />
            <Text style={styles.feeText}>₹{appointment.fees}</Text>
            <Text style={[styles.paymentStatus, { 
              color: appointment.paymentStatus === 'Paid' ? Colors.kbrGreen : 
                     appointment.paymentStatus === 'Pending' ? Colors.kbrPurple : Colors.kbrRed 
            }]}>
              • {appointment.paymentStatus}
            </Text>
          </View>
        </View>

        {appointment.symptoms && (
          <View style={styles.symptomsContainer}>
            <Text style={styles.symptomsLabel}>Symptoms:</Text>
            <Text style={styles.symptomsText}>{appointment.symptoms}</Text>
          </View>
        )}

        <View style={styles.bookingInfo}>
          <Text style={styles.bookingText}>Booked on: {appointment.bookingDate}</Text>
        </View>
      </View>

      <View style={styles.appointmentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewAppointment(appointment)}
        >
          <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        {/* Edit Status Button - Next to View */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleQuickEditStatus(appointment)}
        >
          <Ionicons name="create" size={16} color={Colors.kbrPurple} />
          <Text style={[styles.actionText, { color: Colors.kbrPurple }]}>Edit</Text>
        </TouchableOpacity>
        
        {/* Admit Button for ALL appointments */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleAdmitPatient(appointment)}
        >
          <Ionicons name="bed" size={16} color={Colors.kbrBlue} />
          <Text style={[styles.actionText, { color: Colors.kbrBlue }]}>Admit</Text>
        </TouchableOpacity>
        
        {/* Payment-based confirmation for Pay at Hospital */}
        {appointment.status === 'Pending' && appointment.paymentMode === 'Pay at Hospital' && (
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleConfirmPayment(appointment.id)}
            >
              <Ionicons name="checkmark" size={16} color={Colors.kbrGreen} />
              <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleCancelAppointment(appointment.id)}
            >
              <Ionicons name="close" size={16} color={Colors.kbrRed} />
              <Text style={[styles.actionText, { color: Colors.kbrRed }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {/* Auto-confirmed for online payments */}
        {appointment.status === 'Pending' && appointment.paymentMode === 'Online' && (
          <View style={styles.autoConfirmedBadge}>
            <Text style={styles.autoConfirmedText}>Auto-confirmed</Text>
          </View>
        )}
        
        {appointment.status === 'Confirmed' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCompleteAppointment(appointment.id)}
          >
            <Ionicons name="checkmark-done" size={16} color={Colors.kbrPurple} />
            <Text style={[styles.actionText, { color: Colors.kbrPurple }]}>Complete</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCall(appointment.patientPhone)}
        >
          <Ionicons name="call" size={16} color={Colors.kbrGreen} />
          <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={true} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <AppHeader 
          title="Appointment Management"
          subtitle="Manage patient appointments and schedules"
          showBackButton={true}
          useSimpleAdminHeader={true}
          navigation={navigation}
        />
        
        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddAppointment}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Appointment</Text>
          </TouchableOpacity>
        </View>

      <View style={styles.content}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total"
              value={appointmentStats.totalAppointments}
              subtitle="All appointments"
              icon="calendar"
              color={Colors.kbrBlue}
            />
            <StatsCard
              title="Today"
              value={appointmentStats.todayAppointments}
              subtitle="Scheduled today"
              icon="today"
              color={Colors.kbrGreen}
            />
          </View>
          <View style={styles.statsRow}>
            <StatsCard
              title="Confirmed"
              value={appointmentStats.confirmedAppointments}
              subtitle="Ready to serve"
              icon="checkmark-circle"
              color={Colors.kbrPurple}
            />
            <StatsCard
              title="Pending"
              value={appointmentStats.pendingAppointments}
              subtitle="Need confirmation"
              icon="time"
              color={Colors.kbrRed}
            />
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search appointments, patients, doctors..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  selectedStatus === status && styles.activeFilterTab
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedStatus === status && styles.activeFilterTabText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {dateFilters.map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.filterTab,
                  selectedDate === date && styles.activeFilterTab
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedDate === date && styles.activeFilterTabText
                ]}>
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Appointments List */}
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AppointmentCard appointment={item} />}
          contentContainerStyle={styles.appointmentsList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Admit Patient Modal */}
      <AdmitPatientModal
        visible={showAdmitModal}
        onClose={() => setShowAdmitModal(false)}
        appointment={selectedAppointment}
        onSuccess={handleAdmitSuccess}
      />

      {/* Add New Appointment Modal */}
      <AddAppointmentModal
        visible={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSuccess={handleAddAppointmentSuccess}
      />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  addButtonContainer: {
    padding: 16,
    alignItems: 'flex-end',
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.kbrBlue,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIcon: {
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterTabs: {
    marginBottom: 8,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterTab: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  filterTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  appointmentsList: {
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientDetails: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  newPatientBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  newPatientText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientId: {
    fontSize: 12,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginTop: 2,
  },
  patientMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appointmentText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    marginLeft: 6,
    fontWeight: '500',
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 12,
    color: Colors.kbrGreen,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  paymentStatus: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  symptomsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  symptomsLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  bookingInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookingText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    marginLeft: 4,
    fontWeight: '500',
  },
  autoConfirmedBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  autoConfirmedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default AppointmentManagementScreen;