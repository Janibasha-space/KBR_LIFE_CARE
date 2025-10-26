import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { useServices } from '../../contexts/ServicesContext';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import AppHeader from '../../components/AppHeader';

const DoctorDashboardScreen = ({ navigation }) => {
  const { appointments, doctors: backendDoctors } = useApp();
  const { getAllServices } = useServices();
  const { user, userData } = useUnifiedAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Get current doctor info (assuming logged in doctor)
  const currentDoctor = backendDoctors?.find(doc => 
    doc.email === user?.email || 
    doc.id === userData?.id ||
    doc.name.toLowerCase().includes(userData?.name?.toLowerCase() || '')
  ) || backendDoctors?.[0]; // Fallback to first doctor

  // Filter appointments for current doctor and selected date
  const doctorAppointments = appointments?.filter(appointment => 
    appointment.doctorName?.toLowerCase().includes(currentDoctor?.name?.toLowerCase() || '') &&
    appointment.appointmentDate === selectedDate
  ) || [];

  // Get services from backend
  const allServices = getAllServices();

  // Stats for doctor dashboard
  const todayStats = {
    totalAppointments: doctorAppointments.length,
    completedAppointments: doctorAppointments.filter(apt => apt.status?.toLowerCase() === 'completed').length,
    pendingAppointments: doctorAppointments.filter(apt => apt.status?.toLowerCase() === 'pending').length,
    confirmedAppointments: doctorAppointments.filter(apt => apt.status?.toLowerCase() === 'confirmed').length,
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh data from backend
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleUpdateAppointmentStatus = (appointmentId, newStatus) => {
    Alert.alert(
      'Update Status',
      `Update appointment status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          // TODO: Implement status update via AppContext
          console.log('Updating appointment:', appointmentId, 'to:', newStatus);
        }}
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#10B981';
      case 'completed': return '#6B7280';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const renderAppointmentCard = (appointment) => (
    <View key={appointment.id} style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {appointment.patientName?.charAt(0)?.toUpperCase() || 'P'}
            </Text>
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{appointment.patientName}</Text>
            <Text style={styles.patientId}>ID: {appointment.patientId}</Text>
            <Text style={styles.appointmentTime}>
              <Ionicons name="time-outline" size={14} color="#666" />
              {' '}{appointment.appointmentTime}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>
      
      <View style={styles.appointmentDetails}>
        <Text style={styles.serviceText}>
          <Ionicons name="medical-outline" size={14} color="#666" />
          {' '}{appointment.service || appointment.serviceName}
        </Text>
        <Text style={styles.feeText}>
          <Ionicons name="card-outline" size={14} color="#666" />
          {' '}₹{appointment.fees || appointment.amount}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
        >
          <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Complete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rescheduleButton]}
          onPress={() => Alert.alert('Reschedule', 'Reschedule functionality coming soon')}
        >
          <Ionicons name="calendar-outline" size={16} color="#4A90E2" />
          <Text style={[styles.actionButtonText, { color: '#4A90E2' }]}>Reschedule</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <AppHeader 
        title="Doctor Dashboard" 
        subtitle={currentDoctor?.name || 'Doctor Portal'}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Doctor Info Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorAvatar}>
            <Text style={styles.doctorAvatarText}>
              {currentDoctor?.name?.charAt(0)?.toUpperCase() || 'D'}
            </Text>
          </View>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{currentDoctor?.name || 'Doctor'}</Text>
            <Text style={styles.doctorSpecialty}>{currentDoctor?.specialization || 'General Physician'}</Text>
            <Text style={styles.doctorDepartment}>{currentDoctor?.department || 'General Medicine'}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayStats.totalAppointments}</Text>
            <Text style={styles.statLabel}>Total Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayStats.confirmedAppointments}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayStats.completedAppointments}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{todayStats.pendingAppointments}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateContainer}>
          <Text style={styles.sectionTitle}>Appointments for {selectedDate}</Text>
          <TouchableOpacity style={styles.dateButton}>
            <Ionicons name="calendar-outline" size={20} color="#4A90E2" />
            <Text style={styles.dateButtonText}>Change Date</Text>
          </TouchableOpacity>
        </View>

        {/* Appointments List */}
        {doctorAppointments.length > 0 ? (
          doctorAppointments.map(renderAppointmentCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No appointments for {selectedDate}</Text>
            <Text style={styles.emptyStateSubtext}>
              {backendDoctors?.length > 0 ? 'Check another date or refresh the page' : 'Doctors data loading from backend...'}
            </Text>
          </View>
        )}

        {/* Services Section */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          <View style={styles.servicesGrid}>
            {allServices.slice(0, 6).map((service, index) => (
              <View key={service.id || index} style={styles.serviceCard}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.kbrBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  doctorAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  doctorDepartment: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateButtonText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontWeight: '500',
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  patientId: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  appointmentTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  feeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  completeButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  rescheduleButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#4A90E2',
  },
  actionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  servicesSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    minWidth: '30%',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 12,
    color: Colors.kbrBlue,
    fontWeight: 'bold',
  },
});

export default DoctorDashboardScreen;