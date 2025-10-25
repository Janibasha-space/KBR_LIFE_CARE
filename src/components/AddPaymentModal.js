import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AddPaymentModal = ({ visible, onClose, onSave, patients = [], initialFormData = null }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    fullAmount: '',
    actualAmountPaid: '',
    type: 'consultation',
    paymentMethod: 'cash',
    description: '',
    transactionId: '',
  });
  
  // Update form data when initialFormData changes
  useEffect(() => {
    if (initialFormData && initialFormData.patientId) {
      setFormData(prev => ({
        ...prev,
        ...initialFormData
      }));
    }
  }, [initialFormData]);

  const paymentTypes = [
    { value: 'consultation', label: 'Consultation', icon: 'medical' },
    { value: 'tests', label: 'Laboratory Tests', icon: 'flask' },
    { value: 'admission', label: 'Room/Admission', icon: 'bed' },
    { value: 'surgery', label: 'Surgery', icon: 'cut' },
    { value: 'medicine', label: 'Medicine', icon: 'medkit' },
    { value: 'emergency', label: 'Emergency', icon: 'warning' },
    { value: 'other', label: 'Other', icon: 'receipt' },
  ];

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: 'cash' },
    { value: 'card', label: 'Debit/Credit Card', icon: 'card' },
    { value: 'online', label: 'Online Payment', icon: 'phone-portrait' },
    { value: 'upi', label: 'UPI', icon: 'qr-code' },
    { value: 'bank', label: 'Bank Transfer', icon: 'business' },
  ];

  const validateForm = () => {
    if (!formData.patientId || !formData.patientName) {
      Alert.alert('Validation Error', 'Please select a patient');
      return false;
    }

    if (!formData.fullAmount || isNaN(parseFloat(formData.fullAmount)) || parseFloat(formData.fullAmount) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid full amount');
      return false;
    }

    if (!formData.actualAmountPaid || isNaN(parseFloat(formData.actualAmountPaid)) || parseFloat(formData.actualAmountPaid) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid actual amount paid');
      return false;
    }

    if (parseFloat(formData.actualAmountPaid) > parseFloat(formData.fullAmount)) {
      Alert.alert('Validation Error', 'Actual amount paid cannot be more than the full amount');
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert('Validation Error', 'Please enter payment description');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const fullAmount = parseFloat(formData.fullAmount);
    const actualAmountPaid = parseFloat(formData.actualAmountPaid);
    const dueAmount = fullAmount - actualAmountPaid;

    // Determine payment status based on amount paid
    let status = 'pending';
    if (actualAmountPaid === 0) {
      status = 'pending';
    } else if (actualAmountPaid === fullAmount) {
      status = 'paid';
    } else {
      status = 'partial';
    }

    const paymentData = {
      patientId: formData.patientId,
      patientName: formData.patientName,
      fullAmount: fullAmount,
      actualAmountPaid: actualAmountPaid,
      amount: actualAmountPaid, // Keep this for backwards compatibility
      totalAmount: fullAmount,
      paidAmount: actualAmountPaid,
      dueAmount: dueAmount,
      type: formData.type,
      paymentMethod: formData.paymentMethod,
      description: formData.description.trim(),
      transactionId: formData.transactionId.trim() || null,
      status: status,
    };

    console.log('Saving payment with data:', paymentData);
    onSave(paymentData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      patientId: '',
      patientName: '',
      fullAmount: '',
      actualAmountPaid: '',
      type: 'consultation',
      paymentMethod: 'cash',
      description: '',
      transactionId: '',
    });
    onClose();
  };

  const selectPatient = (patient) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add Payment Record</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Patient Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Patient *</Text>
              {formData.patientName ? (
                <View style={styles.selectedPatient}>
                  <View style={styles.patientInfo}>
                    <View style={styles.patientAvatar}>
                      <Text style={styles.avatarText}>{formData.patientName.charAt(0)}</Text>
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{formData.patientName}</Text>
                      <Text style={styles.patientId}>{formData.patientId}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.changeButton}
                    onPress={() => setFormData(prev => ({ ...prev, patientId: '', patientName: '' }))}
                  >
                    <Text style={styles.changeText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.patientsScroll}
                >
                  {patients
                    .filter((patient, index, self) => index === self.findIndex(p => p.id === patient.id))
                    .map((patient, index) => (
                    <TouchableOpacity
                      key={`payment-patient-${patient.firebaseDocId || patient._id || ''}-${patient.id}-${index}`}
                      style={styles.patientCard}
                      onPress={() => selectPatient(patient)}
                    >
                      <View style={styles.patientAvatar}>
                        <Text style={styles.avatarText}>{patient.name.charAt(0)}</Text>
                      </View>
                      <Text style={styles.patientCardName}>{patient.name}</Text>
                      <Text style={styles.patientCardId}>{patient.id}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Full Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Amount *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.fullAmount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullAmount: text }))}
                placeholder="Enter total amount in ₹"
                keyboardType="numeric"
              />
            </View>

            {/* Actual Amount Paid */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Actual Amount Paid *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.actualAmountPaid}
                onChangeText={(text) => setFormData(prev => ({ ...prev, actualAmountPaid: text }))}
                placeholder="Enter amount actually paid in ₹"
                keyboardType="numeric"
              />
              {formData.fullAmount && formData.actualAmountPaid && (
                <View style={styles.amountSummary}>
                  <Text style={styles.summaryText}>
                    Due Amount: ₹{(parseFloat(formData.fullAmount || 0) - parseFloat(formData.actualAmountPaid || 0)).toLocaleString()}
                  </Text>
                  <Text style={[styles.statusText, {
                    color: parseFloat(formData.actualAmountPaid || 0) === parseFloat(formData.fullAmount || 0) ? '#22C55E' :
                          parseFloat(formData.actualAmountPaid || 0) === 0 ? '#EF4444' : '#F59E0B'
                  }]}>
                    Status: {parseFloat(formData.actualAmountPaid || 0) === parseFloat(formData.fullAmount || 0) ? 'Fully Paid' :
                             parseFloat(formData.actualAmountPaid || 0) === 0 ? 'Pending' : 'Partially Paid'}
                  </Text>
                </View>
              )}
            </View>

            {/* Payment Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Type</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsContainer}
              >
                {paymentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionButton,
                      formData.type === type.value && styles.selectedOption
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  >
                    <Ionicons 
                      name={type.icon} 
                      size={16} 
                      color={formData.type === type.value ? '#FFF' : '#666'} 
                      style={styles.optionIcon}
                    />
                    <Text style={[
                      styles.optionText,
                      formData.type === type.value && styles.selectedOptionText
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.optionsContainer}
              >
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.optionButton,
                      formData.paymentMethod === method.value && styles.selectedOption
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, paymentMethod: method.value }))}
                  >
                    <Ionicons 
                      name={method.icon} 
                      size={16} 
                      color={formData.paymentMethod === method.value ? '#FFF' : '#666'} 
                      style={styles.optionIcon}
                    />
                    <Text style={[
                      styles.optionText,
                      formData.paymentMethod === method.value && styles.selectedOptionText
                    ]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Description *</Text>
              <TextInput
                style={styles.textInput}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="e.g., Consultation Fee - Dr. K. Ramesh"
                multiline
              />
            </View>

            {/* Transaction ID (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Transaction ID (Optional)</Text>
              <TextInput
                style={styles.textInput}
                value={formData.transactionId}
                onChangeText={(text) => setFormData(prev => ({ ...prev, transactionId: text }))}
                placeholder="TXN123456789"
                autoCapitalize="characters"
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={styles.saveText}>Add Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  selectedPatient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  patientId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  changeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  patientsScroll: {
    flexDirection: 'row',
  },
  patientCard: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
  },
  patientCardName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 6,
    textAlign: 'center',
  },
  patientCardId: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  optionsContainer: {
    flexDirection: 'row',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionIcon: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#10B981',
  },
  saveText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  amountSummary: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default AddPaymentModal;