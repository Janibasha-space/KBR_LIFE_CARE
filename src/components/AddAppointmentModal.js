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

const AddAppointmentModal = ({ visible, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientAge: '',
    patientGender: 'Male',
    doctorName: '',
    department: '',
    service: '',
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    paymentMode: 'Pay at Hospital',
    fees: '',
  });

  const [showDropdowns, setShowDropdowns] = useState({
    gender: false,
    doctor: false,
    department: false,
    service: false,
    paymentMode: false,
    time: false,
  });

  const genders = ['Male', 'Female', 'Other'];
  
  const doctors = [
    'Dr. K. Ramesh',
    'Dr. K. Divyavani', 
    'Dr. Mahesh Kumar',
    'Dr. K. Thukaram',
    'Dr. Srinivas Reddy',
    'Dr. Priya Sharma',
  ];

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

  const services = [
    'General Consultation',
    'Prenatal Checkup',
    'ECG & Consultation',
    'Dental Consultation',
    'Eye Examination',
    'Blood Test',
    'X-Ray',
    'Ultrasound',
    'CT Scan',
    'MRI',
  ];

  const paymentModes = ['Pay at Hospital', 'Online Payment'];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  ];

  const validateForm = () => {
    const required = ['patientName', 'patientPhone', 'patientAge', 'doctorName', 'department', 'service', 'appointmentDate', 'appointmentTime', 'fees'];
    const missing = required.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return false;
    }

    if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.patientPhone.replace(/\s/g, ''))) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }

    if (!/^\d+$/.test(formData.age) || parseInt(formData.patientAge) < 1 || parseInt(formData.patientAge) > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 120');
      return false;
    }

    if (!/^\d+$/.test(formData.fees) || parseInt(formData.fees) <= 0) {
      Alert.alert('Invalid Fee', 'Please enter a valid fee amount');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const appointmentId = `APT${String(Date.now()).slice(-6)}`;
      const patientId = `KBR-OP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

      const newAppointment = {
        id: appointmentId,
        patientName: formData.patientName,
        patientId: patientId,
        patientPhone: formData.patientPhone,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,
        doctorName: formData.doctorName,
        department: formData.department,
        service: formData.service,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        status: formData.paymentMode === 'Online Payment' ? 'Confirmed' : 'Pending',
        statusColor: formData.paymentMode === 'Online Payment' ? '#10B981' : '#F59E0B',
        fees: parseInt(formData.fees),
        paymentStatus: formData.paymentMode === 'Online Payment' ? 'Paid' : 'Pending',
        paymentMode: formData.paymentMode,
        bookingDate: new Date().toISOString().split('T')[0],
        symptoms: formData.symptoms,
        isNewPatient: true,
        avatar: formData.patientName.charAt(0).toUpperCase(),
        transactionId: formData.paymentMode === 'Online Payment' ? `TXN${Date.now()}` : null,
        emergencyContact: '',
        patientAddress: '',
      };

      Alert.alert(
        'Success',
        `Appointment created successfully!\nID: ${appointmentId}\nStatus: ${newAppointment.status}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess && onSuccess(newAppointment);
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create appointment. Please try again.');
    }
  };

  const handleClose = () => {
    setFormData({
      patientName: '',
      patientPhone: '',
      patientAge: '',
      patientGender: 'Male',
      doctorName: '',
      department: '',
      service: '',
      appointmentDate: '',
      appointmentTime: '',
      symptoms: '',
      paymentMode: 'Pay at Hospital',
      fees: '',
    });
    setShowDropdowns({
      gender: false,
      doctor: false,
      department: false,
      service: false,
      paymentMode: false,
      time: false,
    });
    onClose();
  };

  const renderDropdown = (field, options, placeholder) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdowns(prev => ({ ...prev, [field]: !prev[field] }))}
      >
        <Text style={[styles.dropdownText, !formData[field] && styles.placeholderText]}>
          {formData[field] || placeholder}
        </Text>
        <Ionicons 
          name={showDropdowns[field] ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#666" 
        />
      </TouchableOpacity>
      
      {showDropdowns[field] && (
        <View style={styles.dropdownOptions}>
          <ScrollView 
            style={styles.dropdownScrollView}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            scrollEnabled={true}
            bounces={true}
          >
            {options && Array.isArray(options) && options.length > 0 ? 
              options.map((option, index) => (
                <TouchableOpacity
                  key={`${field}-${index}-${option}`}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, [field]: option }));
                    setShowDropdowns(prev => ({ ...prev, [field]: false }));
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              )) :
              <View style={styles.emptyDropdownOption}>
                <Text style={styles.emptyDropdownText}>No options available</Text>
              </View>
            }
          </ScrollView>
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
            <Text style={styles.headerTitle}>Add New Appointment</Text>
            <Text style={styles.headerSubtitle}>Schedule a new patient appointment</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!Object.values(showDropdowns).some(isOpen => isOpen)}
          keyboardShouldPersistTaps="handled"
        >
          {/* Patient Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patient Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Patient Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter patient name"
                value={formData.patientName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, patientName: text }))}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.patientPhone}
                  keyboardType="phone-pad"
                  onChangeText={(text) => setFormData(prev => ({ ...prev, patientPhone: text }))}
                />
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Age"
                  value={formData.patientAge}
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData(prev => ({ ...prev, patientAge: text }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender *</Text>
              {renderDropdown('patientGender', genders, 'Select gender')}
            </View>
          </View>

          {/* Appointment Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>Doctor *</Text>
                {renderDropdown('doctorName', doctors, 'Select doctor')}
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.inputLabel}>Department *</Text>
                {renderDropdown('department', departments, 'Select department')}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service *</Text>
              {renderDropdown('service', services, 'Select service')}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.appointmentDate}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, appointmentDate: text }))}
                />
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.inputLabel}>Time *</Text>
                {renderDropdown('appointmentTime', timeSlots, 'Select time')}
              </View>
            </View>
          </View>

          {/* Payment & Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment & Additional Info</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>Payment Mode *</Text>
                {renderDropdown('paymentMode', paymentModes, 'Select payment mode')}
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.inputLabel}>Fee Amount *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="₹ 0"
                  value={formData.fees}
                  keyboardType="numeric"
                  onChangeText={(text) => setFormData(prev => ({ ...prev, fees: text }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Symptoms/Reason for Visit</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe symptoms or reason for appointment"
                value={formData.symptoms}
                multiline
                numberOfLines={4}
                onChangeText={(text) => setFormData(prev => ({ ...prev, symptoms: text }))}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>Create Appointment</Text>
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
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  dropdownScrollView: {
    maxHeight: 200,
    minHeight: 100,
  },
  emptyDropdownOption: {
    padding: 15,
    alignItems: 'center',
  },
  emptyDropdownText: {
    color: '#999',
    fontStyle: 'italic',
  },
});

export default AddAppointmentModal;