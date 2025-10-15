import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

const AppointmentDetailsScreen = ({ route, navigation }) => {
  const { appointment } = route.params;
  const [appointmentData, setAppointmentData] = useState(appointment);

  const handleCall = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleEditStatus = () => {
    Alert.alert(
      'Edit Appointment Status',
      'Select new status:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pending', 
          onPress: () => updateStatus('Pending', '#F59E0B') 
        },
        { 
          text: 'Confirmed', 
          onPress: () => updateStatus('Confirmed', '#10B981') 
        },
        { 
          text: 'Completed', 
          onPress: () => updateStatus('Completed', '#6B7280') 
        },
        { 
          text: 'Cancelled', 
          onPress: () => updateStatus('Cancelled', '#EF4444') 
        },
      ]
    );
  };

  const updateStatus = (status, color) => {
    setAppointmentData(prev => ({
      ...prev,
      status,
      statusColor: color
    }));
    Alert.alert('Success', `Appointment status updated to ${status}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            navigation.goBack();
            Alert.alert('Success', 'Appointment deleted successfully');
          }
        }
      ]
    );
  };

  const InfoSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const InfoRow = ({ icon, label, value, onPress }) => (
    <TouchableOpacity 
      style={styles.infoRow} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={Colors.kbrBlue} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, onPress && styles.infoValueLink]}>
          {value || 'Not specified'}
        </Text>
      </View>
      {onPress && (
        <Ionicons name="call" size={16} color={Colors.kbrGreen} />
      )}
    </TouchableOpacity>
  );

  const ActionButton = ({ icon, label, color, onPress, style }) => (
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: `${color}15` }, style]} 
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Appointment Details</Text>
          <Text style={styles.headerSubtitle}>{appointmentData.id}</Text>
        </View>
        <TouchableOpacity 
          style={styles.headerAction} 
          onPress={() => handleCall(appointmentData.patientPhone)}
        >
          <Ionicons name="call" size={24} color={Colors.kbrBlue} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Overview */}
        <View style={styles.overviewCard}>
          <View style={styles.patientHeader}>
            <View style={[styles.avatar, { backgroundColor: Colors.kbrBlue }]}>
              <Text style={styles.avatarText}>{appointmentData.avatar}</Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{appointmentData.patientName}</Text>
              <Text style={styles.patientId}>{appointmentData.patientId}</Text>
              <Text style={styles.patientMeta}>
                {appointmentData.patientAge} years • {appointmentData.patientGender}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: appointmentData.statusColor }]}>
              <Text style={styles.statusText}>{appointmentData.status}</Text>
            </View>
          </View>
          
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <ActionButton
              icon="call"
              label="Call Patient"
              color={Colors.kbrGreen}
              onPress={() => handleCall(appointmentData.patientPhone)}
            />
            <ActionButton
              icon="create"
              label="Edit Status"
              color={Colors.kbrPurple}
              onPress={handleEditStatus}
            />
            <ActionButton
              icon="trash"
              label="Delete"
              color={Colors.kbrRed}
              onPress={handleDelete}
            />
          </View>
        </View>

        {/* Appointment Information */}
        <InfoSection title="Appointment Information">
          <InfoRow
            icon="calendar"
            label="Date"
            value={appointmentData.appointmentDate}
          />
          <InfoRow
            icon="time"
            label="Time"
            value={appointmentData.appointmentTime}
          />
          <InfoRow
            icon="medical"
            label="Service"
            value={appointmentData.service}
          />
          <InfoRow
            icon="person"
            label="Doctor"
            value={appointmentData.doctorName}
          />
          <InfoRow
            icon="business"
            label="Department"
            value={appointmentData.department}
          />
          <InfoRow
            icon="calendar-outline"
            label="Booking Date"
            value={appointmentData.bookingDate}
          />
        </InfoSection>

        {/* Patient Contact Information */}
        <InfoSection title="Patient Contact">
          <InfoRow
            icon="call"
            label="Primary Phone"
            value={appointmentData.patientPhone}
            onPress={() => handleCall(appointmentData.patientPhone)}
          />
          {appointmentData.emergencyContact && (
            <InfoRow
              icon="call-outline"
              label="Emergency Contact"
              value={appointmentData.emergencyContact}
              onPress={() => handleCall(appointmentData.emergencyContact)}
            />
          )}
          {appointmentData.patientAddress && (
            <InfoRow
              icon="location"
              label="Address"
              value={appointmentData.patientAddress}
            />
          )}
        </InfoSection>

        {/* Medical Information */}
        <InfoSection title="Medical Information">
          {appointmentData.symptoms && (
            <InfoRow
              icon="heart"
              label="Symptoms"
              value={appointmentData.symptoms}
            />
          )}
          {appointmentData.allergies && (
            <InfoRow
              icon="warning"
              label="Allergies"
              value={appointmentData.allergies}
            />
          )}
          {appointmentData.medicalHistory && (
            <InfoRow
              icon="document-text"
              label="Medical History"
              value={appointmentData.medicalHistory}
            />
          )}
        </InfoSection>

        {/* Payment Information */}
        <InfoSection title="Payment Information">
          <InfoRow
            icon="cash"
            label="Fee Amount"
            value={`₹${appointmentData.fees}`}
          />
          <InfoRow
            icon="card"
            label="Payment Status"
            value={appointmentData.paymentStatus}
          />
          <InfoRow
            icon="wallet"
            label="Payment Mode"
            value={appointmentData.paymentMode || 'Not specified'}
          />
          {appointmentData.transactionId && (
            <InfoRow
              icon="receipt"
              label="Transaction ID"
              value={appointmentData.transactionId}
            />
          )}
          {appointmentData.razorpayOrderId && (
            <InfoRow
              icon="document"
              label="Razorpay Order ID"
              value={appointmentData.razorpayOrderId}
            />
          )}
          {appointmentData.invoiceNumber && (
            <InfoRow
              icon="document-text"
              label="Invoice Number"
              value={appointmentData.invoiceNumber}
            />
          )}
        </InfoSection>

        {/* Admission Details (if applicable) */}
        {appointmentData.admissionDetails && (
          <InfoSection title="Admission Details">
            <InfoRow
              icon="business"
              label="Patient Type"
              value={appointmentData.admissionDetails.patientType}
            />
            {appointmentData.admissionDetails.roomNumber && (
              <InfoRow
                icon="bed"
                label="Room Number"
                value={appointmentData.admissionDetails.roomNumber}
              />
            )}
            {appointmentData.admissionDetails.bedNumber && (
              <InfoRow
                icon="bed-outline"
                label="Bed Number"
                value={appointmentData.admissionDetails.bedNumber}
              />
            )}
            {appointmentData.admissionDetails.admissionDate && (
              <InfoRow
                icon="calendar"
                label="Admission Date"
                value={appointmentData.admissionDetails.admissionDate}
              />
            )}
          </InfoSection>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {appointmentData.status === 'Pending' && appointmentData.paymentMode === 'Pay at Hospital' && (
            <View style={styles.paymentActions}>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={() => updateStatus('Confirmed', '#10B981')}
              >
                <Ionicons name="checkmark" size={20} color="#FFF" />
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => updateStatus('Cancelled', '#EF4444')}
              >
                <Ionicons name="close" size={20} color="#FFF" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {appointmentData.status === 'Confirmed' && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => updateStatus('Completed', '#6B7280')}
            >
              <Ionicons name="checkmark-done" size={20} color="#FFF" />
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 41, 55, 0.1)',
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
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerAction: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginBottom: 4,
  },
  patientMeta: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoIcon: {
    width: 32,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  infoValueLink: {
    color: Colors.kbrBlue,
    textDecorationLine: 'underline',
  },
  actionButtons: {
    marginTop: 20,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrGreen,
    paddingVertical: 16,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrRed,
    paddingVertical: 16,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrPurple,
    paddingVertical: 16,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AppointmentDetailsScreen;