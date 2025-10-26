import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp } from '../../contexts/AppContext';
import AddPatientPaymentModal from '../../components/AddPatientPaymentModal';
import { Colors } from '../../constants/theme';

const PatientDetailsScreen = ({ route, navigation }) => {
  const { patient: initialPatient } = route.params;
  const { updatePatient, deletePatient, patients } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState(initialPatient);
  const [originalPatient, setOriginalPatient] = useState(initialPatient);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Update patient data from context when it changes (for real-time updates)
  React.useEffect(() => {
    const updatedPatient = patients.find(p => p.id === initialPatient.id);
    if (updatedPatient) {
      console.log('📝 [PatientDetails] Updating patient data from context:', updatedPatient.id);
      setPatient(updatedPatient);
      setOriginalPatient(updatedPatient);
    }
  }, [patients, initialPatient.id]);

  // Refresh patient data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('📝 [PatientDetails] Screen focused - refreshing patient data');
      const updatedPatient = patients.find(p => p.id === initialPatient.id);
      if (updatedPatient) {
        setPatient(updatedPatient);
        setOriginalPatient(updatedPatient);
      }
    }, [patients, initialPatient.id])
  );

  const handleCall = () => {
    const phoneNumber = patient.phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleViewPaymentInvoices = () => {
    navigation.navigate('PatientPaymentInvoices', { 
      patientId: patient.id,
      patientName: patient.name 
    });
  };

  const handleViewMedicalReports = () => {
    navigation.navigate('PatientMedicalReports', { 
      patientId: patient.id,
      patientName: patient.name 
    });
  };

  const handleAddPayment = () => {
    if (!patient.paymentDetails) {
      Alert.alert(
        'No Payment Information',
        'This patient does not have payment details set up. Please register the patient again with payment information.'
      );
      return;
    }
    
    if (patient.paymentDetails.dueAmount <= 0) {
      Alert.alert(
        'Payment Complete',
        'This patient has no outstanding dues. All payments are complete.'
      );
      return;
    }
    
    setShowPaymentModal(true);
  };

  const handlePaymentAdded = () => {
    // Refresh patient data from context
    Alert.alert('Success', 'Payment has been added successfully!');
    setShowPaymentModal(false);
  };

  const handleEdit = () => {
    setOriginalPatient({ ...patient });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setPatient({ ...originalPatient });
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedPatient = {
        ...patient,
        editHistory: [
          ...(patient.editHistory || []),
          {
            action: 'updated',
            timestamp: new Date().toISOString(),
            details: 'Patient information updated',
            changes: getChanges(originalPatient, patient),
          }
        ]
      };

      await updatePatient(patient.id, updatedPatient);
      setOriginalPatient({ ...updatedPatient });
      setIsEditing(false);
      Alert.alert('Success', 'Patient information updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update patient information');
    }
  };

  const getChanges = (original, updated) => {
    const changes = [];
    Object.keys(updated).forEach(key => {
      if (original[key] !== updated[key] && key !== 'editHistory') {
        changes.push(`${key}: ${original[key]} → ${updated[key]}`);
      }
    });
    return changes;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${patient.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePatient(patient.id);
              navigation.goBack();
              Alert.alert('Success', 'Patient deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete patient');
            }
          },
        },
      ]
    );
  };

  const ActionButton = ({ onPress, icon, label, color = '#007AFF', style }) => (
    <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );

  const InfoRow = ({ icon, label, value, editable = false, onChangeText, multiline = false }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color="#6B7280" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing && editable ? (
          <TextInput
            style={[styles.infoInput, multiline && styles.multilineInput]}
            value={value}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
          />
        ) : (
          <Text style={styles.infoValue}>{value || 'Not specified'}</Text>
        )}
      </View>
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
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Patient Details</Text>
          <Text style={styles.headerSubtitle}>{patient.id}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Overview Card */}
        <View style={styles.overviewCard}>
          <View style={styles.patientHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={30} color="#007AFF" />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientMeta}>
                {patient.age} years • {patient.gender} • {patient.bloodGroup}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: patient.statusColor }]}>
              <Text style={styles.statusText}>{patient.status}</Text>
            </View>
          </View>
          
          <View style={styles.quickActions}>
            <ActionButton
              onPress={handleCall}
              icon="call"
              label="Call"
              color="#34C759"
            />
            <ActionButton
              onPress={handleViewPaymentInvoices}
              icon="receipt"
              label="Payments"
              color="#007AFF"
            />
            <ActionButton
              onPress={handleViewMedicalReports}
              icon="document-text"
              label="Reports"
              color="#FF9500"
            />
            {!isEditing ? (
              <ActionButton
                onPress={handleEdit}
                icon="create"
                label="Edit"
                color="#8E44AD"
              />
            ) : (
              <ActionButton
                onPress={handleSaveEdit}
                icon="checkmark"
                label="Save"
                color="#27AE60"
              />
            )}
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="person"
              label="Full Name"
              value={patient.name}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, name: text }))}
            />
            <InfoRow
              icon="calendar"
              label="Age"
              value={patient.age?.toString()}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, age: parseInt(text) || prev.age }))}
            />
            <InfoRow
              icon="person-circle"
              label="Gender"
              value={patient.gender}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, gender: text }))}
            />
            <InfoRow
              icon="water"
              label="Blood Group"
              value={patient.bloodGroup}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, bloodGroup: text }))}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="call"
              label="Phone Number"
              value={patient.phone}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, phone: text }))}
            />
            <InfoRow
              icon="call-outline"
              label="Emergency Contact"
              value={patient.emergencyContact}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, emergencyContact: text }))}
            />
            <InfoRow
              icon="location"
              label="Address"
              value={patient.address}
              editable
              multiline
              onChangeText={(text) => setPatient(prev => ({ ...prev, address: text }))}
            />
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="medical"
              label="Assigned Doctor"
              value={patient.doctor}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, doctor: text }))}
            />
            <InfoRow
              icon="business"
              label="Department"
              value={patient.department}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, department: text }))}
            />
            <InfoRow
              icon="person-add"
              label="Referred By"
              value={patient.referredBy}
              editable
              onChangeText={(text) => setPatient(prev => ({ ...prev, referredBy: text }))}
            />
            <InfoRow
              icon="heart"
              label="Symptoms"
              value={patient.symptoms}
              editable
              multiline
              onChangeText={(text) => setPatient(prev => ({ ...prev, symptoms: text }))}
            />
            <InfoRow
              icon="warning"
              label="Allergies"
              value={patient.allergies}
              editable
              multiline
              onChangeText={(text) => setPatient(prev => ({ ...prev, allergies: text }))}
            />
          </View>
        </View>

        {/* Payment Information */}
        {patient.paymentDetails && (
          <View style={styles.section}>
            <View style={styles.paymentHeader}>
              <Text style={styles.sectionTitle}>Payment Information</Text>
              <TouchableOpacity 
                style={styles.addPaymentButton}
                onPress={handleAddPayment}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.addPaymentText}>Add Payment</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.sectionContent}>
              {/* Payment Summary */}
              <View style={styles.paymentSummaryGrid}>
                <View style={styles.paymentSummaryItem}>
                  <Text style={styles.paymentSummaryLabel}>Total Amount</Text>
                  <Text style={styles.paymentSummaryValue}>
                    ₹{patient.paymentDetails.totalAmount}
                  </Text>
                </View>
                
                <View style={styles.paymentSummaryItem}>
                  <Text style={styles.paymentSummaryLabel}>Total Paid</Text>
                  <Text style={[styles.paymentSummaryValue, { color: Colors.kbrGreen }]}>
                    ₹{patient.paymentDetails.totalPaid}
                  </Text>
                </View>
                
                <View style={styles.paymentSummaryItem}>
                  <Text style={styles.paymentSummaryLabel}>Due Amount</Text>
                  <Text style={[
                    styles.paymentSummaryValue, 
                    { color: patient.paymentDetails.dueAmount > 0 ? Colors.kbrRed : Colors.kbrGreen }
                  ]}>
                    ₹{patient.paymentDetails.dueAmount}
                  </Text>
                </View>
                
                <View style={styles.paymentSummaryItem}>
                  <Text style={styles.paymentSummaryLabel}>Payment Status</Text>
                  <Text style={[
                    styles.paymentSummaryValue,
                    { 
                      color: patient.paymentDetails.dueAmount <= 0 ? Colors.kbrGreen : 
                             patient.paymentDetails.totalPaid > 0 ? Colors.kbrPurple : Colors.kbrRed 
                    }
                  ]}>
                    {patient.paymentDetails.dueAmount <= 0 ? 'Fully Paid' : 
                     patient.paymentDetails.totalPaid > 0 ? 'Partially Paid' : 'Pending'}
                  </Text>
                </View>
              </View>

              {/* Payment History */}
              {patient.paymentDetails.payments && patient.paymentDetails.payments.length > 0 && (
                <View style={styles.paymentHistory}>
                  <Text style={styles.paymentHistoryTitle}>Payment History</Text>
                  {patient.paymentDetails.payments.map((payment, index) => (
                    <View key={payment.id} style={styles.paymentHistoryItem}>
                      <View style={styles.paymentHistoryHeader}>
                        <View style={styles.paymentHistoryLeft}>
                          <Text style={styles.paymentHistoryType}>{payment.type}</Text>
                          <Text style={styles.paymentHistoryDate}>
                            {payment.date} • {payment.time}
                          </Text>
                        </View>
                        <View style={styles.paymentHistoryRight}>
                          <Text style={styles.paymentHistoryAmount}>₹{payment.amount}</Text>
                          <Text style={styles.paymentHistoryMethod}>{payment.method}</Text>
                        </View>
                      </View>
                      
                      {payment.description && (
                        <Text style={styles.paymentHistoryDescription}>
                          {payment.description}
                        </Text>
                      )}
                      
                      {payment.transactionId && (
                        <Text style={styles.paymentHistoryTransaction}>
                          Transaction ID: {payment.transactionId}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* No Payment Info */}
              {(!patient.paymentDetails.payments || patient.paymentDetails.payments.length === 0) && (
                <View style={styles.noPaymentHistory}>
                  <Ionicons name="card-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.noPaymentText}>No payment history available</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* No Payment Details */}
        {!patient.paymentDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.sectionContent}>
              <View style={styles.noPaymentSetup}>
                <Ionicons name="card-outline" size={48} color="#D1D5DB" />
                <Text style={styles.noPaymentSetupText}>
                  No payment information available for this patient
                </Text>
                <Text style={styles.noPaymentSetupSubtext}>
                  Payment details are set up during patient registration
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Admission Details (IP only) */}
        {patient.patientType === 'IP' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admission Details</Text>
            <View style={styles.sectionContent}>
              <InfoRow
                icon="bed"
                label="Room Number"
                value={patient.room}
              />
              <InfoRow
                icon="bed"
                label="Bed Number"
                value={patient.bedNo}
              />
              <InfoRow
                icon="calendar"
                label="Admission Date"
                value={patient.admissionDate}
              />
            </View>
          </View>
        )}

        {/* Registration Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Registration Details</Text>
          <View style={styles.sectionContent}>
            <InfoRow
              icon="calendar"
              label="Registration Date"
              value={patient.registrationDate}
            />
            <InfoRow
              icon="time"
              label="Registration Time"
              value={patient.registrationTime}
            />
          </View>
        </View>

        {/* Edit History */}
        {patient.editHistory && patient.editHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit History</Text>
            <View style={styles.sectionContent}>
              {patient.editHistory.map((entry, index) => (
                <View key={index} style={styles.historyEntry}>
                  <Text style={styles.historyAction}>{entry.action}</Text>
                  <Text style={styles.historyTime}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </Text>
                  <Text style={styles.historyDetails}>{entry.details}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isEditing ? (
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color="#FFF" />
              <Text style={styles.deleteButtonText}>Delete Patient</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Payment Modal */}
      <AddPatientPaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        patient={patient}
        onSuccess={handlePaymentAdded}
      />
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
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    overflow: 'hidden', // This should hide any decorative elements that extend beyond the header bounds
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
  headerAction: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
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
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
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
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoIcon: {
    width: 24,
    marginRight: 12,
    marginTop: 2,
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
  infoInput: {
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  historyEntry: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  historyTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  historyDetails: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 4,
  },
  actionButtons: {
    marginTop: 20,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
  // Payment Styles
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors?.kbrBlue || '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPaymentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  paymentSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentSummaryItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentSummaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  paymentSummaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paymentHistory: {
    marginTop: 16,
  },
  paymentHistoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentHistoryItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors?.kbrBlue || '#007AFF',
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentHistoryLeft: {
    flex: 1,
  },
  paymentHistoryType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentHistoryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentHistoryRight: {
    alignItems: 'flex-end',
  },
  paymentHistoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors?.kbrGreen || '#10B981',
  },
  paymentHistoryMethod: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentHistoryDescription: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
  },
  paymentHistoryTransaction: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  noPaymentHistory: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPaymentText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },
  noPaymentSetup: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPaymentSetupText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  noPaymentSetupSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default PatientDetailsScreen;