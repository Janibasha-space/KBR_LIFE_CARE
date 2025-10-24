import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

const AppointmentDetailScreen = ({ navigation, route }) => {
  const { appointment } = route.params;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time not specified';
    return timeString;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'cancelled':
        return Colors.error;
      case 'pending':
        return Colors.warning;
      default:
        return Colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'completed':
        return 'checkmark-done-circle';
      case 'cancelled':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement cancellation logic
            Alert.alert('Success', 'Appointment has been cancelled');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Reschedule functionality will be implemented soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Ionicons 
              name={getStatusIcon(appointment.status)} 
              size={24} 
              color={getStatusColor(appointment.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
              {appointment.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>

        {/* Appointment Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="medical" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Service</Text>
              <Text style={styles.infoValue}>{appointment.serviceName || 'General Consultation'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Doctor</Text>
              <Text style={styles.infoValue}>{appointment.doctorName || 'Dr. Unknown'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {formatDate(appointment.date || appointment.appointmentDate)}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>
                {formatTime(appointment.time)}
              </Text>
            </View>
          </View>

          {appointment.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Notes</Text>
                <Text style={styles.infoValue}>{appointment.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="card" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Payment Status</Text>
              <Text style={[styles.infoValue, styles.paymentStatus]}>
                {appointment.paymentStatus || 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Consultation Fee</Text>
              <Text style={styles.infoValue}>
                ₹{appointment.consultationFee || appointment.amount || '600'}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="wallet" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Payment Method</Text>
              <Text style={styles.infoValue}>
                {appointment.paymentMethod || 'Cash/Card at Hospital'}
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Information Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Patient Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-circle" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Patient Name</Text>
              <Text style={styles.infoValue}>{appointment.patientName || 'Current User'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="id-card" size={20} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Appointment ID</Text>
              <Text style={styles.infoValue}>{appointment.id}</Text>
            </View>
          </View>

          {appointment.patientPhone && (
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={Colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{appointment.patientPhone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {appointment.status?.toLowerCase() === 'confirmed' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rescheduleButton]}
              onPress={handleReschedule}
            >
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
              <Text style={[styles.actionButtonText, { color: Colors.primary }]}>
                Reschedule
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelAppointment}
            >
              <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
              <Text style={[styles.actionButtonText, { color: Colors.error }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.padding,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: Sizes.padding,
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.padding,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Sizes.padding,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  paymentStatus: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    borderWidth: 1,
  },
  rescheduleButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.error,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AppointmentDetailScreen;