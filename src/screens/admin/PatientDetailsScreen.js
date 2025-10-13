import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PatientDetailsScreen = ({ navigation, route }) => {
  const { patient } = route.params;

  // Additional mock data for detailed view
  const patientDetails = {
    ...patient,
    bloodGroup: 'B+',
    phone: '+91 98765 43210',
    emergencyContact: '+91 98765 43211',
    address: 'Hyderabad, Telangana',
    admissionDate: '2024-01-05',
    referredBy: 'Dr. Suresh (City Hospital)',
    medicalHistory: 'Hypertension, Diabetes',
    allergies: 'Penicillin',
    bedNo: patient.status === 'IP' ? 'A1' : null,
    previousVisits: 3
  };

  const InfoSection = ({ title, children }) => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const InfoRow = ({ label, value, valueColor = '#1C1C1E' }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Avatar and Basic Info */}
        <View style={styles.patientCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#007AFF" />
            </View>
          </View>
          
          <View style={styles.patientBasicInfo}>
            <Text style={styles.patientName}>{patientDetails.name}</Text>
            <Text style={styles.patientId}>{patientDetails.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: patientDetails.statusColor }]}>
              <Text style={styles.statusText}>
                {patientDetails.status === 'IP' ? 'Admitted' : 'Admitted'}
              </Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <InfoSection title="Basic Information">
          <InfoRow label="Age" value={`${patientDetails.age} years`} />
          <InfoRow label="Gender" value={patientDetails.gender} />
          <InfoRow label="Blood Group" value={patientDetails.bloodGroup} />
          <InfoRow label="Previous Visits" value={patientDetails.previousVisits.toString()} />
        </InfoSection>

        {/* Contact Information */}
        <InfoSection title="Contact Information">
          <InfoRow label="Phone" value={patientDetails.phone} />
          <InfoRow label="Emergency Contact" value={patientDetails.emergencyContact} />
          <InfoRow label="Address" value={patientDetails.address} />
        </InfoSection>

        {/* Medical Information */}
        <InfoSection title="Medical Information">
          <InfoRow label="Department" value={patientDetails.department} />
          <InfoRow label="Doctor" value={patientDetails.doctor} />
          {patientDetails.room && (
            <InfoRow label="Room No." value={patientDetails.room} />
          )}
          {patientDetails.bedNo && (
            <InfoRow label="Bed No." value={patientDetails.bedNo} />
          )}
          <InfoRow label="Admission Date" value={patientDetails.admissionDate} />
          <InfoRow label="Referred By" value={patientDetails.referredBy} />
        </InfoSection>

        {/* Medical History */}
        <InfoSection title="Medical History & Diagnosis">
          <InfoRow 
            label="Medical History/Diagnosis" 
            value={patientDetails.medicalHistory} 
          />
          <InfoRow 
            label="Allergies" 
            value={patientDetails.allergies}
            valueColor="#FF3B30"
          />
        </InfoSection>

        {/* Current Status */}
        <InfoSection title="Current Status">
          <InfoRow 
            label="Condition" 
            value={patientDetails.condition}
            valueColor={patientDetails.condition === 'Critical' ? '#FF3B30' : '#34C759'}
          />
        </InfoSection>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>View Medical Records</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Schedule Appointment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="call" size={20} color="#007AFF" />
            <Text style={styles.actionButtonText}>Contact Patient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  moreButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientBasicInfo: {
    alignItems: 'center',
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  patientId: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
    flex: 1,
    marginRight: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    margin: 20,
    marginTop: 0,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 12,
  },
});

export default PatientDetailsScreen;