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
import { useApp } from '../contexts/AppContext';

const PatientRegistrationModal = ({ visible, onClose, onSuccess }) => {
  const { addPatient, doctors = [] } = useApp();
  
  const [formData, setFormData] = useState({
    patientType: 'OP',
    fullName: '',
    age: '',
    gender: 'Male',
    bloodGroup: '',
    phoneNumber: '',
    emergencyContact: '',
    address: '',
    doctor: '',
    department: '',
    referredBy: '',
    symptoms: '',
    allergies: '',
    roomNumber: '',
    bedNumber: '',
    totalAmount: '',
    initialPayment: '',
    paymentMethod: 'Cash',
    paymentType: 'Registration Fee',
  });

  const [showDropdowns, setShowDropdowns] = useState({
    patientType: false,
    gender: false,
    doctor: false,
    department: false,
    roomNumber: false,
    bedNumber: false,
    paymentMethod: false,
    paymentType: false,
  });

  const patientTypes = [
    { label: 'Out-Patient (OP)', value: 'OP', description: 'OP: Outpatient consultations' },
    { label: 'In-Patient (IP)', value: 'IP', description: 'IP: Admitted patients' },
  ];

  const genders = ['Male', 'Female', 'Other'];
  
  const departments = [
    'General Medicine',
    'Cardiology',
    'Orthopedics',
    'Gynecology',
    'Pediatrics',
    'Dermatology',
    'ENT',
    'Ophthalmology',
    'Dentistry',
    'Emergency',
  ];

  const paymentMethods = ['Cash', 'Card', 'Online', 'UPI', 'Bank Transfer', 'Cheque'];
  
  const paymentTypes = [
    'Registration Fee',
    'Consultation Fee',
    'Treatment Fee',
    'Room Charges',
    'Medicine Charges',
    'Test Charges',
    'Surgery Fee',
    'Emergency Fee',
    'Other',
  ];

  // Available rooms data
  const availableRooms = [
    { number: '101', type: 'General', beds: ['A1', 'A2', 'B1', 'B2'] },
    { number: '102', type: 'General', beds: ['A1', 'A2'] },
    { number: '103', type: 'General', beds: ['A1', 'B1', 'B2'] },
    { number: '201', type: 'Private', beds: ['A1'] },
    { number: '202', type: 'Private', beds: ['A1'] },
    { number: '203', type: 'Private', beds: ['A1'] },
    { number: '301', type: 'ICU', beds: ['ICU1', 'ICU2', 'ICU3'] },
    { number: '302', type: 'ICU', beds: ['ICU1', 'ICU2'] },
    { number: '401', type: 'Emergency', beds: ['E1', 'E2', 'E3', 'E4'] },
  ];

  const getAvailableBeds = () => {
    const selectedRoom = availableRooms.find(room => room.number === formData.roomNumber);
    return selectedRoom ? selectedRoom.beds : [];
  };

  const validateForm = () => {
    const required = ['fullName', 'age', 'phoneNumber', 'totalAmount'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      Alert.alert('Validation Error', 'Please fill all required fields marked with *');
      return false;
    }

    if (!/^\d+$/.test(formData.age) || parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 120');
      return false;
    }

    if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }

    // Validate payment amounts
    const totalAmount = parseFloat(formData.totalAmount);
    const initialPayment = parseFloat(formData.initialPayment) || 0;

    if (isNaN(totalAmount) || totalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid total amount');
      return false;
    }

    if (initialPayment > totalAmount) {
      Alert.alert('Payment Error', 'Initial payment cannot be greater than total amount');
      return false;
    }

    if (formData.patientType === 'IP' && !formData.roomNumber) {
      Alert.alert('Room Required', 'Please select a room number for IP patients');
      return false;
    }

    if (formData.patientType === 'IP' && !formData.bedNumber) {
      Alert.alert('Bed Required', 'Please select a bed number for IP patients');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const patientId = formData.patientType === 'IP' 
        ? `KBR-IP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`
        : `KBR-OP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

      const totalAmount = parseFloat(formData.totalAmount);
      const initialPayment = parseFloat(formData.initialPayment) || 0;

      const newPatient = {
        id: patientId,
        name: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        bloodGroup: formData.bloodGroup || 'A+',
        phone: formData.phoneNumber,
        emergencyContact: formData.emergencyContact,
        address: formData.address,
        doctor: formData.doctor,
        department: formData.department,
        referredBy: formData.referredBy,
        symptoms: formData.symptoms,
        allergies: formData.allergies,
        patientType: formData.patientType,
        status: formData.patientType,
        statusText: formData.patientType === 'IP' ? 'Admitted' : 'Consultation',
        statusColor: formData.patientType === 'IP' ? '#007AFF' : '#34C759',
        registrationDate: new Date().toISOString().split('T')[0],
        registrationTime: new Date().toLocaleTimeString(),
        medicalReports: [],
        // Payment Information
        paymentDetails: {
          totalAmount: totalAmount,
          payments: initialPayment > 0 ? [{
            id: `PAY-${Date.now()}-1`,
            amount: initialPayment,
            type: formData.paymentType,
            method: formData.paymentMethod,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            description: `Initial payment for ${formData.paymentType}`,
            transactionId: formData.paymentMethod === 'Online' ? `TXN${Date.now()}` : null,
          }] : [],
          totalPaid: initialPayment,
          dueAmount: totalAmount - initialPayment,
          lastPaymentDate: initialPayment > 0 ? new Date().toISOString().split('T')[0] : null,
        },
        editHistory: [{
          action: 'created',
          timestamp: new Date().toISOString(),
          details: `Patient registered with total amount ₹${totalAmount}${initialPayment > 0 ? `, initial payment ₹${initialPayment}` : ''}`,
        }],
      };

      // Add room and bed details for IP patients
      if (formData.patientType === 'IP') {
        newPatient.room = formData.roomNumber;
        newPatient.bedNo = formData.bedNumber;
        newPatient.admissionDate = newPatient.registrationDate;
        const selectedRoom = availableRooms.find(room => room.number === formData.roomNumber);
        newPatient.roomType = selectedRoom?.type || 'General';
      }

      await addPatient(newPatient);
      
      const paymentMessage = initialPayment > 0 
        ? `\nTotal: ₹${totalAmount} | Paid: ₹${initialPayment} | Due: ₹${totalAmount - initialPayment}` 
        : `\nTotal Amount: ₹${totalAmount} | Payment: Pending`;

      const message = formData.patientType === 'IP' 
        ? `Patient registered and admitted successfully!\nID: ${patientId}\nRoom: ${newPatient.room}\nBed: ${newPatient.bedNo}${paymentMessage}`
        : `Patient registered successfully!\nID: ${patientId}${paymentMessage}`;
      
      Alert.alert(
        'Success',
        message,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess && onSuccess(newPatient);
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to register patient. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      patientType: 'OP',
      fullName: '',
      age: '',
      gender: 'Male',
      bloodGroup: '',
      phoneNumber: '',
      emergencyContact: '',
      address: '',
      doctor: '',
      department: '',
      referredBy: '',
      symptoms: '',
      allergies: '',
      roomNumber: '',
      bedNumber: '',
      totalAmount: '',
      initialPayment: '',
      paymentMethod: 'Cash',
      paymentType: 'Registration Fee',
    });
    setShowDropdowns({
      patientType: false,
      gender: false,
      doctor: false,
      department: false,
      roomNumber: false,
      bedNumber: false,
      paymentMethod: false,
      paymentType: false,
    });
    onClose();
  };

  const renderDropdown = (field, options, valueKey = 'value', labelKey = 'label') => (
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
          {options && Array.isArray(options) && options.map((option, index) => {
            const value = typeof option === 'object' ? option[valueKey] : option;
            const label = typeof option === 'object' ? option[labelKey] : option;
            
            return (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => {
                  setFormData(prev => ({ 
                    ...prev, 
                    [field]: value,
                    // Reset bed number if room changes
                    ...(field === 'roomNumber' ? { bedNumber: '' } : {})
                  }));
                  setShowDropdowns(prev => ({ ...prev, [field]: false }));
                }}
              >
                <Text style={styles.dropdownOptionText}>
                  {field === 'roomNumber' ? `Room ${value} (${option.type})` : label}
                </Text>
                {option.description && (
                  <Text style={styles.dropdownOptionDescription}>{option.description}</Text>
                )}
              </TouchableOpacity>
            );
          }) || null}
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Register New Patient</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Patient Type */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Patient Type <Text style={styles.required}>*</Text>
            </Text>
            {renderDropdown('patientType', patientTypes)}
            <Text style={styles.helpText}>IP: Admitted patients | OP: Outpatient consultations</Text>
          </View>

          {/* Personal Information */}
          <View style={styles.row}>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.sectionLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                value={formData.fullName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
              />
            </View>
            
            <View style={[styles.section, styles.flex1, styles.marginLeft]}>
              <Text style={styles.sectionLabel}>
                Age <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                value={formData.age}
                keyboardType="numeric"
                onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
              />
            </View>
          </View>

          {/* Gender and Blood Group */}
          <View style={styles.row}>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.sectionLabel}>
                Gender <Text style={styles.required}>*</Text>
              </Text>
              {renderDropdown('gender', genders)}
            </View>
            
            <View style={[styles.section, styles.flex1, styles.marginLeft]}>
              <Text style={styles.sectionLabel}>Blood Group</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., O+, A+, B+"
                value={formData.bloodGroup}
                onChangeText={(text) => setFormData(prev => ({ ...prev, bloodGroup: text }))}
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXX XXXXX"
              value={formData.phoneNumber}
              keyboardType="phone-pad"
              onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 XXXXX XXXXX"
              value={formData.emergencyContact}
              keyboardType="phone-pad"
              onChangeText={(text) => setFormData(prev => ({ ...prev, emergencyContact: text }))}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Full address"
              value={formData.address}
              multiline
              numberOfLines={3}
              onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            />
          </View>

          {/* Medical Information */}
          <View style={styles.row}>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.sectionLabel}>
                Doctor <Text style={styles.required}>*</Text>
              </Text>
              {renderDropdown('doctor', doctors, 'name', 'name')}
            </View>
            
            <View style={[styles.section, styles.flex1, styles.marginLeft]}>
              <Text style={styles.sectionLabel}>
                Department <Text style={styles.required}>*</Text>
              </Text>
              {renderDropdown('department', departments)}
            </View>
          </View>

          {/* Room Assignment (IP only) */}
          {formData.patientType === 'IP' && (
            <>
              <View style={styles.row}>
                <View style={[styles.section, styles.flex1]}>
                  <Text style={styles.sectionLabel}>
                    Room Number <Text style={styles.required}>*</Text>
                  </Text>
                  {renderDropdown('roomNumber', availableRooms, 'number', 'number')}
                  <Text style={styles.helpText}>Available rooms with beds</Text>
                </View>
                
                <View style={[styles.section, styles.flex1, styles.marginLeft]}>
                  <Text style={styles.sectionLabel}>
                    Bed Number <Text style={styles.required}>*</Text>
                  </Text>
                  {renderDropdown('bedNumber', getAvailableBeds())}
                  {formData.roomNumber && (
                    <Text style={styles.helpText}>
                      Available beds in Room {formData.roomNumber}
                    </Text>
                  )}
                </View>
              </View>
            </>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Referred By</Text>
            <TextInput
              style={styles.input}
              placeholder="Referring doctor/hospital"
              value={formData.referredBy}
              onChangeText={(text) => setFormData(prev => ({ ...prev, referredBy: text }))}
            />
          </View>

          {/* Payment Information Section */}
          <View style={styles.paymentSection}>
            <Text style={styles.paymentSectionTitle}>
              <Ionicons name="card" size={18} color="#EF4444" /> Payment Details
            </Text>
            
            <View style={styles.row}>
              <View style={[styles.section, styles.flex1]}>
                <Text style={styles.sectionLabel}>
                  Total Amount <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹ 0.00"
                  value={formData.totalAmount}
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData(prev => ({ ...prev, totalAmount: text }))}
                />
                <Text style={styles.helpText}>Total treatment/service cost</Text>
              </View>
              
              <View style={[styles.section, styles.flex1, styles.marginLeft]}>
                <Text style={styles.sectionLabel}>Initial Payment</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹ 0.00"
                  value={formData.initialPayment}
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData(prev => ({ ...prev, initialPayment: text }))}
                />
                <Text style={styles.helpText}>Amount paid during registration</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.section, styles.flex1]}>
                <Text style={styles.sectionLabel}>Payment Method</Text>
                {renderDropdown('paymentMethod', paymentMethods)}
              </View>
              
              <View style={[styles.section, styles.flex1, styles.marginLeft]}>
                <Text style={styles.sectionLabel}>Payment Type</Text>
                {renderDropdown('paymentType', paymentTypes)}
              </View>
            </View>

            {/* Payment Summary */}
            {formData.totalAmount && (
              <View style={styles.paymentSummary}>
                <Text style={styles.summaryTitle}>Payment Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Amount:</Text>
                  <Text style={styles.summaryValue}>₹{formData.totalAmount}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Initial Payment:</Text>
                  <Text style={styles.summaryValue}>₹{formData.initialPayment || '0'}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryTotal]}>
                  <Text style={styles.summaryLabelTotal}>Due Amount:</Text>
                  <Text style={styles.summaryValueTotal}>
                    ₹{(parseFloat(formData.totalAmount) - parseFloat(formData.initialPayment || 0)).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Symptoms/Reason for Visit</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Symptoms and reason for visit"
              value={formData.symptoms}
              multiline
              numberOfLines={4}
              onChangeText={(text) => setFormData(prev => ({ ...prev, symptoms: text }))}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Allergies</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Known allergies"
              value={formData.allergies}
              multiline
              numberOfLines={3}
              onChangeText={(text) => setFormData(prev => ({ ...prev, allergies: text }))}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="person-add" size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>Register Patient</Text>
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
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  dropdownOptionDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
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
  paymentSection: {
    backgroundColor: '#F8F9FF',
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  paymentSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentSummary: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 8,
  },
  summaryLabelTotal: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  summaryValueTotal: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: 'bold',
  },
});

export default PatientRegistrationModal;