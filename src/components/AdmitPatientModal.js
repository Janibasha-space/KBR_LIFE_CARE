import React, { useState, useEffect } from 'react';
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
import { Colors } from '../constants/theme';
import { FirebaseDoctorService, FirebaseRoomService } from '../services/firebaseHospitalServices';

const AdmitPatientModal = ({ visible, onClose, appointment, onSuccess }) => {
  const { addPatient } = useApp();
  
  // State for backend data
  const [doctors, setDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Pre-populate form with appointment data if available
  const [formData, setFormData] = useState({
    patientType: 'OP',
    fullName: appointment?.patientName || '',
    age: appointment?.patientAge?.toString() || '',
    gender: appointment?.patientGender || 'Male',
    bloodGroup: '',
    phoneNumber: appointment?.patientPhone || '',
    emergencyContact: '',
    address: '',
    doctor: appointment?.doctorName || '',
    department: appointment?.department || '',
    referredBy: '',
    symptoms: appointment?.symptoms || '',
    allergies: '',
    roomNumber: '',
    bedNumber: '',
  });

  const [showDropdowns, setShowDropdowns] = useState({
    patientType: false,
    gender: false,
    doctor: false,
    roomNumber: false,
    bedNumber: false,
  });

  // Fetch doctors and rooms from backend
  const fetchBackendData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching doctors and rooms from Firebase...');
      
      // Fetch doctors
      const doctorsResult = await FirebaseDoctorService.getDoctors();
      if (doctorsResult.success) {
        console.log(`✅ Fetched ${doctorsResult.data.length} doctors from Firebase`);
        setDoctors(doctorsResult.data);
      } else {
        console.warn('⚠️ Failed to fetch doctors:', doctorsResult.warning || 'Unknown error');
        setDoctors([]);
      }

      // Fetch rooms
      const roomsResult = await FirebaseRoomService.getRooms();
      if (roomsResult.success) {
        console.log(`✅ Fetched ${roomsResult.data.length} rooms from Firebase`);
        // Filter only available rooms for admission
        const availableRooms = roomsResult.data.filter(room => 
          room.status === 'Available' || room.status === 'available'
        );
        setRooms(availableRooms);
      } else {
        console.warn('⚠️ Failed to fetch rooms:', roomsResult.warning || 'Unknown error');
        // Fallback to static rooms if Firebase fails
        setRooms([
          { id: '1', roomNumber: '101', roomType: 'General', status: 'Available', beds: ['A1', 'A2', 'B1', 'B2'] },
          { id: '2', roomNumber: '102', roomType: 'General', status: 'Available', beds: ['A1', 'A2'] },
          { id: '3', roomNumber: '201', roomType: 'Private', status: 'Available', beds: ['A1'] },
          { id: '4', roomNumber: '301', roomType: 'ICU', status: 'Available', beds: ['ICU1', 'ICU2'] },
        ]);
      }
    } catch (error) {
      console.error('❌ Error fetching backend data:', error);
      // Set fallback data
      setDoctors([]);
      setRooms([
        { id: '1', roomNumber: '101', roomType: 'General', status: 'Available', beds: ['A1', 'A2', 'B1', 'B2'] },
        { id: '2', roomNumber: '102', roomType: 'General', status: 'Available', beds: ['A1', 'A2'] },
        { id: '3', roomNumber: '201', roomType: 'Private', status: 'Available', beds: ['A1'] },
        { id: '4', roomNumber: '301', roomType: 'ICU', status: 'Available', beds: ['ICU1', 'ICU2'] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (visible) {
      fetchBackendData();
    }
  }, [visible]);

  const patientTypes = [
    { label: 'Out-Patient (OP)', value: 'OP', description: 'OP: Outpatient consultations' },
    { label: 'In-Patient (IP)', value: 'IP', description: 'IP: Admitted patients' },
  ];

  const genders = ['Male', 'Female', 'Other'];

  const getAvailableBeds = () => {
    const selectedRoom = rooms.find(room => 
      (room.roomNumber || room.number) === formData.roomNumber
    );
    return selectedRoom ? (selectedRoom.beds || []) : [];
  };

  const validateForm = () => {
    const required = ['fullName', 'age', 'phoneNumber', 'patientType'];
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
        editHistory: [{
          action: 'created',
          timestamp: new Date().toISOString(),
          details: appointment 
            ? `Patient admitted from appointment ${appointment.id}`
            : 'Patient registered and admitted',
        }],
      };

      // Add room and bed details for IP patients
      if (formData.patientType === 'IP') {
        newPatient.room = formData.roomNumber;
        newPatient.bedNo = formData.bedNumber;
        newPatient.admissionDate = newPatient.registrationDate;
        const selectedRoom = rooms.find(room => 
          (room.roomNumber || room.number) === formData.roomNumber
        );
        newPatient.roomType = selectedRoom?.roomType || selectedRoom?.type || 'General';
      }

      await addPatient(newPatient);
      
      const message = appointment 
        ? `Patient successfully admitted from appointment!\nPatient ID: ${patientId}\nRoom: ${newPatient.room || 'N/A'}\nBed: ${newPatient.bedNo || 'N/A'}`
        : `Patient registered and admitted successfully!\nID: ${patientId}`;
      
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
      Alert.alert('Error', 'Failed to admit patient. Please try again.');
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
    });
    setShowDropdowns({
      patientType: false,
      gender: false,
      doctor: false,
      roomNumber: false,
      bedNumber: false,
    });
    // Reset backend data
    setDoctors([]);
    setRooms([]);
    setLoading(false);
    onClose();
  };

  const renderDropdown = (field, options, valueKey = 'value', labelKey = 'label') => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdowns(prev => ({ ...prev, [field]: !prev[field] }))}
      >
        <Text style={[styles.dropdownText, !formData[field] && styles.placeholderText]}>
          {formData[field] || `Select ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
        </Text>
        <Ionicons 
          name={showDropdowns[field] ? "chevron-up" : "chevron-down"} 
          size={16} 
          color="#666" 
        />
      </TouchableOpacity>
      
      {showDropdowns[field] && (
        <View 
          style={styles.dropdownOptions}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
        >
          <ScrollView 
            style={styles.dropdownScrollView}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            scrollEnabled={true}
            bounces={true}
          >
            {options && Array.isArray(options) && options.length > 0 ? 
              options.map((option, index) => {
                const value = typeof option === 'object' ? option[valueKey] : option;
                const label = typeof option === 'object' ? option[labelKey] : option;
                
                return (
                  <TouchableOpacity
                    key={`${field}-${index}-${value}`}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        [field]: field === 'doctor' ? label : value,
                        ...(field === 'roomNumber' ? { bedNumber: '' } : {})
                      }));
                      setShowDropdowns(prev => ({ ...prev, [field]: false }));
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>
                      {field === 'roomNumber' ? 
                        `Room ${value} (${option.roomType || option.type || 'General'})` : 
                        field === 'doctor' ?
                          `${label} - ${option.specialty || option.department || 'General'}` :
                          label
                      }
                    </Text>
                    {option.description && (
                      <Text style={styles.dropdownOptionDescription}>{option.description}</Text>
                    )}
                  </TouchableOpacity>
                );
              }) :
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
            <Text style={styles.headerTitle}>
              {appointment ? 'Admit Patient' : 'Register New Patient'}
            </Text>
            {appointment && (
              <Text style={styles.headerSubtitle}>
                From appointment: {appointment.id}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!Object.values(showDropdowns).some(isOpen => isOpen)}
          keyboardShouldPersistTaps="always"
        >
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
              <Text style={styles.sectionLabel}>Doctor</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading doctors...</Text>
                </View>
              ) : (
                renderDropdown('doctor', doctors, 'id', 'name')
              )}
              <Text style={styles.helpText}>
                {doctors.length === 0 ? 'No doctors available' : `${doctors.length} doctors available`}
              </Text>
            </View>
            
            <View style={[styles.section, styles.flex1, styles.marginLeft]}>
              <Text style={styles.sectionLabel}>Department</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter department (e.g., Cardiology)"
                value={formData.department}
                onChangeText={(text) => setFormData(prev => ({ ...prev, department: text }))}
              />
              <Text style={styles.helpText}>Manually enter the department name</Text>
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
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Text style={styles.loadingText}>Loading rooms...</Text>
                    </View>
                  ) : (
                    renderDropdown('roomNumber', rooms, 'roomNumber', 'roomNumber')
                  )}
                  <Text style={styles.helpText}>
                    {rooms.length === 0 ? 'No available rooms' : `${rooms.length} available rooms`}
                  </Text>
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
            <Ionicons name={appointment ? "bed" : "person-add"} size={20} color="#FFF" />
            <Text style={styles.submitButtonText}>
              {appointment ? 'Admit Patient' : 'Register Patient'}
            </Text>
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
  loadingContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
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

export default AdmitPatientModal;