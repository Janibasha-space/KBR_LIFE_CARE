import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { useApp } from '../contexts/AppContext';

const AddPatientPaymentModal = ({ visible, onClose, patient, onSuccess }) => {
  const { addPatientPayment } = useApp();
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'Treatment Fee',
    method: 'Cash',
    description: '',
    transactionId: '',
  });

  const [showDropdowns, setShowDropdowns] = useState({
    type: false,
    method: false,
  });

  const paymentTypes = [
    'Registration Fee',
    'Consultation Fee',
    'Treatment Fee',
    'Room Charges',
    'Medicine Charges',
    'Test Charges',
    'Surgery Fee',
    'Emergency Fee',
    'Nursing Charges',
    'Equipment Charges',
    'Other',
  ];

  const paymentMethods = ['Cash', 'Card', 'Online', 'UPI', 'Bank Transfer', 'Cheque'];

  const validateForm = () => {
    if (!formData.amount.trim()) {
      Alert.alert('Validation Error', 'Please enter payment amount');
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0');
      return false;
    }

    if (patient?.paymentDetails && amount > patient.paymentDetails.dueAmount) {
      Alert.alert(
        'Payment Exceeds Due Amount',
        `Payment amount ₹${amount} exceeds the due amount ₹${patient.paymentDetails.dueAmount}. Please adjust the amount.`
      );
      return false;
    }

    if (formData.method === 'Online' || formData.method === 'UPI') {
      if (!formData.transactionId.trim()) {
        Alert.alert('Transaction ID Required', 'Please enter transaction ID for online payments');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const paymentData = {
        amount: formData.amount,
        type: formData.type,
        method: formData.method,
        description: formData.description || `${formData.type} payment`,
        transactionId: formData.transactionId || null,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
      };

      await addPatientPayment(patient.id, paymentData);

      const remainingDue = patient.paymentDetails.dueAmount - parseFloat(formData.amount);
      
      Alert.alert(
        'Payment Added Successfully',
        `Payment of ₹${formData.amount} has been recorded.\n${remainingDue <= 0 ? 'Payment Complete!' : `Remaining Due: ₹${remainingDue.toFixed(2)}`}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess && onSuccess();
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      amount: '',
      type: 'Treatment Fee',
      method: 'Cash',
      description: '',
      transactionId: '',
    });
    setShowDropdowns({
      type: false,
      method: false,
    });
    onClose();
  };

  const renderDropdown = (field, options) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdowns(prev => ({ ...prev, [field]: !prev[field] }))}
      >
        <Text style={[styles.dropdownText, !formData[field] && styles.placeholderText]}>
          {formData[field] || `Select ${field}`}
        </Text>
        <Ionicons 
          name={showDropdowns[field] ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#666" 
        />
      </TouchableOpacity>
      
      {showDropdowns[field] && (
        <View style={styles.dropdownOptions}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dropdownOption}
              onPress={() => {
                setFormData(prev => ({ ...prev, [field]: option }));
                setShowDropdowns(prev => ({ ...prev, [field]: false }));
              }}
            >
              <Text style={styles.dropdownOptionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (!patient) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Add Payment</Text>
            <Text style={styles.headerSubtitle}>{patient.name} • {patient.id}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Patient Payment Summary */}
          {patient.paymentDetails && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                <Ionicons name="card" size={16} color={Colors.kbrBlue} /> Current Payment Status
              </Text>
              
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryValue}>₹{patient.paymentDetails.totalAmount}</Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Paid So Far</Text>
                  <Text style={[styles.summaryValue, { color: Colors.kbrGreen }]}>
                    ₹{patient.paymentDetails.totalPaid}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Due Amount</Text>
                  <Text style={[styles.summaryValue, { color: Colors.kbrRed }]}>
                    ₹{patient.paymentDetails.dueAmount}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Payment Status</Text>
                  <Text style={[
                    styles.summaryValue,
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
            </View>
          )}

          {/* Payment Form */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Payment Amount <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="₹ 0.00"
              value={formData.amount}
              keyboardType="numeric"
              onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
            />
            {patient.paymentDetails && (
              <Text style={styles.helpText}>
                Maximum amount: ₹{patient.paymentDetails.dueAmount}
              </Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.sectionLabel}>
                Payment Type <Text style={styles.required}>*</Text>
              </Text>
              {renderDropdown('type', paymentTypes)}
            </View>
            
            <View style={[styles.section, styles.flex1, styles.marginLeft]}>
              <Text style={styles.sectionLabel}>
                Payment Method <Text style={styles.required}>*</Text>
              </Text>
              {renderDropdown('method', paymentMethods)}
            </View>
          </View>

          {/* Transaction ID for online payments */}
          {(formData.method === 'Online' || formData.method === 'UPI') && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                Transaction ID <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter transaction ID"
                value={formData.transactionId}
                onChangeText={(text) => setFormData(prev => ({ ...prev, transactionId: text }))}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Payment description or notes"
              value={formData.description}
              multiline
              numberOfLines={3}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            />
          </View>

          {/* Payment Preview */}
          {formData.amount && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Payment Preview</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Amount:</Text>
                <Text style={styles.previewValue}>₹{formData.amount}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Type:</Text>
                <Text style={styles.previewValue}>{formData.type}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Method:</Text>
                <Text style={styles.previewValue}>{formData.method}</Text>
              </View>
              {patient.paymentDetails && (
                <View style={[styles.previewRow, styles.previewTotal]}>
                  <Text style={styles.previewLabelTotal}>Remaining Due:</Text>
                  <Text style={styles.previewValueTotal}>
                    ₹{(patient.paymentDetails.dueAmount - parseFloat(formData.amount || 0)).toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="card" size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>Add Payment</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  section: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    marginTop: 20,
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  previewCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 12,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  previewLabel: {
    fontSize: 14,
    color: '#374151',
  },
  previewValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  previewTotal: {
    borderTopWidth: 1,
    borderTopColor: '#BAE6FD',
    marginTop: 8,
    paddingTop: 8,
  },
  previewLabelTotal: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  previewValueTotal: {
    fontSize: 15,
    color: Colors.kbrRed,
    fontWeight: 'bold',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default AddPatientPaymentModal;