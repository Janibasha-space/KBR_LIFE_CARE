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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/theme';
import { useApp } from '../contexts/AppContext';
import { useServices } from '../contexts/ServicesContext';

const AddAppointmentModal = ({ visible, onClose, onSuccess }) => {
  // Get data from contexts
  const { doctors: contextDoctors } = useApp();
  const { getAllServices } = useServices();

  // Debug log when modal opens
  useEffect(() => {
    if (visible) {
      console.log('🏥 AddAppointmentModal opened');
      console.log('📊 Current contextDoctors:', contextDoctors?.length || 0);
      console.log('📊 Current services:', getAllServices()?.length || 0);
    }
  }, [visible]);

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
    service: false,
    paymentMode: false,
    time: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  // Get current data and backend services
  const [backendServices, setBackendServices] = useState([]);
  const [backendTests, setBackendTests] = useState([]);
  const [backendDoctors, setBackendDoctors] = useState([]);

  useEffect(() => {
    console.log('🔄 AddAppointmentModal: Loading real-time data...');
    
    const loadData = async () => {
      // Load services from Firebase hospitalServices collection
      try {
        console.log('🔄 Loading services directly from Firebase hospitalServices...');
        const { FirebaseServiceApiService } = require('../services/firebaseHospitalServices');
        const servicesResponse = await FirebaseServiceApiService.getServicesWithDoctors();
        
        if (servicesResponse.success && servicesResponse.data) {
          const firebaseServices = servicesResponse.data.map(service => ({
            id: service.id,
            name: service.name,
            category: service.category || 'Medical',
            price: service.price || service.fees || 0,
            description: service.description || ''
          }));
          console.log('📋 Loaded services from Firebase hospitalServices:', firebaseServices.length);
          console.log('📋 Services:', firebaseServices.map(s => s.name).join(', '));
          setBackendServices(firebaseServices);
        } else {
          // Fallback to ServicesContext
          console.log('🔄 Firebase services failed, trying ServicesContext...');
          const services = getAllServices();
          console.log('📋 Fallback: Loaded services from ServicesContext:', services?.length || 0);
          setBackendServices(services || []);
        }
      } catch (error) {
        console.error('❌ Error loading services from Firebase:', error);
        // Fallback to ServicesContext
        try {
          const services = getAllServices();
          console.log('📋 Error fallback: Loaded services from ServicesContext:', services?.length || 0);
          setBackendServices(services || []);
        } catch (fallbackError) {
          console.error('❌ ServicesContext fallback also failed:', fallbackError);
          setBackendServices([]);
        }
      }

      // Load tests from Firebase tests collection
      try {
        console.log('🔄 Loading tests directly from Firebase tests collection...');
        const { firebaseHospitalServices } = require('../services/firebaseHospitalServices');
        const testsResponse = await firebaseHospitalServices.getTests();
        
        if (testsResponse.success && testsResponse.data) {
          const firebaseTests = testsResponse.data.map(test => ({
            id: test.id,
            name: test.name,
            category: test.category || 'Lab Test',
            price: test.price || test.fees || 0,
            description: test.description || '',
            sampleRequired: test.sampleRequired || '',
            reportTime: test.reportTime || '',
            testDuration: test.testDuration || ''
          }));
          console.log('🧪 Loaded tests from Firebase tests collection:', firebaseTests.length);
          console.log('🧪 Tests:', firebaseTests.map(t => t.name).join(', '));
          setBackendTests(firebaseTests);
        } else {
          console.log('⚠️ No tests found in Firebase tests collection');
          setBackendTests([]);
        }
      } catch (error) {
        console.error('❌ Error loading tests from Firebase:', error);
        setBackendTests([]);
      }

      // Load doctors directly from Firebase to ensure we get real data
      try {
        // First try AppContext
        if (contextDoctors && Array.isArray(contextDoctors) && contextDoctors.length > 0) {
          const formattedDoctors = contextDoctors.map(doctor => ({
            id: doctor.id,
            name: doctor.name,
            specialization: doctor.specialization || doctor.specialty,
            department: doctor.department || doctor.specialization || doctor.specialty,
            fees: doctor.consultationFee || doctor.fees || 500
          }));
          console.log('👨‍⚕️ Loaded doctors from AppContext:', formattedDoctors.length);
          setBackendDoctors(formattedDoctors);
        } else {
          // Fallback to direct Firebase call
          console.log('🔄 No doctors in AppContext, loading directly from Firebase...');
          const { FirebaseDoctorService } = require('../services/firebaseHospitalServices');
          const doctorsResponse = await FirebaseDoctorService.getDoctors();
          
          if (doctorsResponse.success && doctorsResponse.data) {
            const formattedDoctors = doctorsResponse.data.map(doctor => ({
              id: doctor.id,
              name: doctor.name,
              specialization: doctor.specialization || doctor.specialty,
              department: doctor.department || doctor.specialization || doctor.specialty,
              fees: doctor.consultationFee || doctor.fees || 500
            }));
            console.log('👨‍⚕️ Loaded doctors directly from Firebase:', formattedDoctors.length);
            setBackendDoctors(formattedDoctors);
          } else {
            console.log('⚠️ No doctors found in Firebase');
            setBackendDoctors([]);
          }
        }
      } catch (error) {
        console.error('❌ Error loading doctors:', error);
        setBackendDoctors([]);
      }
    };

    loadData();
  }, [contextDoctors, getAllServices]);

  const genders = ['Male', 'Female', 'Other'];
  const paymentModes = ['Pay at Hospital', 'Online Payment'];

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  ];

  // Date and time picker handlers
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({ 
        ...prev, 
        appointmentDate: date.toISOString().split('T')[0] 
      }));
    }
  };

  const handleTimeChange = (event, time) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      const formattedTime = time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
      setFormData(prev => ({ 
        ...prev, 
        appointmentTime: formattedTime 
      }));
    }
  };

  // Handle doctor selection and auto-fill fees
  const handleDoctorSelect = (doctor) => {
    setFormData(prev => ({ 
      ...prev, 
      doctorName: doctor.name,
      department: doctor.department || doctor.specialization || '',
      fees: doctor.fees ? doctor.fees.toString() : ''
    }));
    setShowDropdowns(prev => ({ ...prev, doctor: false }));
  };

  const validateForm = () => {
    const required = ['patientName', 'patientPhone', 'patientAge', 'doctorName', 'department', 'service', 'appointmentDate', 'appointmentTime', 'fees'];
    const missing = required.filter(field => !formData[field] || !formData[field].toString().trim());
    
    if (missing.length > 0) {
      Alert.alert('Validation Error', 'Please fill all required fields');
      return false;
    }

    if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.patientPhone.replace(/\s/g, ''))) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }

    if (!/^\d+$/.test(formData.patientAge) || parseInt(formData.patientAge) < 1 || parseInt(formData.patientAge) > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age between 1 and 120');
      return false;
    }

    if (!/^\d+$/.test(formData.fees) || parseInt(formData.fees) <= 0) {
      Alert.alert('Invalid Fee', 'Please enter a valid fee amount');
      return false;
    }

    return true;
  };

  // Get AppContext for saving appointments
  const { addAppointment } = useApp();

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const appointmentId = `APT${String(Date.now()).slice(-6)}`;
      const patientId = `KBR-OP-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;

      const appointmentData = {
        id: appointmentId,
        patientName: formData.patientName,
        patientId: patientId,
        patientPhone: formData.patientPhone,
        contactNumber: formData.patientPhone,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,
        doctorName: formData.doctorName,
        department: formData.department,
        service: formData.service,
        serviceName: formData.service,
        appointmentDate: formData.appointmentDate,
        date: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        time: formData.appointmentTime,
        status: formData.paymentMode === 'Online Payment' ? 'confirmed' : 'pending',
        fees: parseInt(formData.fees),
        amount: parseInt(formData.fees),
        totalAmount: parseInt(formData.fees),
        consultationFee: parseInt(formData.fees),
        paymentStatus: formData.paymentMode === 'Online Payment' ? 'Paid' : 'Pending',
        paymentType: formData.paymentMode === 'Online Payment' ? 'online' : 'hospital',
        paymentMethod: formData.paymentMode === 'Online Payment' ? 'Online Payment' : 'Cash/Card at Hospital',
        paymentMode: formData.paymentMode,
        bookingDate: new Date().toISOString().split('T')[0],
        symptoms: formData.symptoms,
        notes: formData.symptoms || `Appointment booked via admin dashboard`,
        isNewPatient: true,
        avatar: formData.patientName.charAt(0).toUpperCase(),
        transactionId: formData.paymentMode === 'Online Payment' ? `TXN${Date.now()}` : null,
        emergencyContact: '',
        patientAddress: '',
        email: '',
        type: 'consultation',
        tokenNumber: Math.floor(Math.random() * 100) + 1,
        createdAt: new Date().toISOString(),
        // Add proper admin booking identification
        source: 'admin_dashboard',
        bookedBy: 'admin'
      };

      console.log('📅 Saving appointment to backend:', appointmentData);

      // Save to backend via AppContext
      const savedAppointment = await addAppointment(appointmentData);
      
      Alert.alert(
        'Success',
        `Appointment created successfully!\nID: ${appointmentId}\nToken: ${savedAppointment.tokenNumber}\nStatus: ${savedAppointment.status}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess && onSuccess(savedAppointment);
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      Alert.alert('Error', `Failed to create appointment: ${error.message || 'Please try again.'}`);
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

  const renderDropdown = (field, options, placeholder, customHandler = null) => (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setShowDropdowns(prev => ({ ...prev, [field]: !prev[field] }))}
      >
        <Text style={[styles.dropdownText, !formData[field] && styles.placeholderText]}>
          {String(formData[field] || placeholder)}
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
                  key={`${field}-${index}-${typeof option === 'object' ? (option.id || option.name || index) : (option || index)}`}
                  style={styles.dropdownOption}
                  onPress={() => {
                    if (customHandler) {
                      customHandler(option);
                    } else {
                      const value = typeof option === 'object' ? option.name || option.id : option;
                      setFormData(prev => ({ ...prev, [field]: value }));
                      setShowDropdowns(prev => ({ ...prev, [field]: false }));
                    }
                  }}
                >
                  <Text style={styles.dropdownOptionText}>
                    {typeof option === 'object' ? (option.name || option.id || 'Unknown') : (option || 'Unknown')}
                  </Text>
                  {typeof option === 'object' && option.specialization && (
                    <Text style={styles.dropdownOptionSubText}>
                      {String(option.specialization || '')}
                    </Text>
                  )}
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

  // Service selection modal
  const renderServiceModal = () => (
    <Modal visible={showServiceModal} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.serviceModalContainer}>
          <View style={styles.serviceModalHeader}>
            <Text style={styles.serviceModalTitle}>Select Service</Text>
            <TouchableOpacity onPress={() => setShowServiceModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.serviceModalContent}>
            {/* Manual Service Input Option */}
            <View style={styles.manualInputSection}>
              <Text style={styles.sectionTitle}>Or Enter Service Manually</Text>
              <TextInput
                style={styles.manualServiceInput}
                placeholder="Type service name manually..."
                value={formData.service || ''}
                onChangeText={(text) => setFormData(prev => ({ ...prev, service: text }))}
                returnKeyType="done"
                onSubmitEditing={() => setShowServiceModal(false)}
              />
            </View>

            {/* Services Section */}
            {backendServices && backendServices.length > 0 && (
              <View style={styles.databaseServicesSection}>
                <Text style={styles.sectionTitle}>Services</Text>
                {backendServices.map((service, index) => (
                  <TouchableOpacity
                    key={`service-${index}-${service.id || service.name || index}`}
                    style={styles.serviceOption}
                    onPress={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        service: service.name,
                        fees: service.price ? service.price.toString() : ''
                      }));
                      setShowServiceModal(false);
                    }}
                  >
                    <View style={styles.serviceOptionContent}>
                      <Text style={styles.serviceOptionTitle}>{String(service.name || 'Unnamed Service')}</Text>
                      <Text style={styles.serviceOptionCategory}>{String(service.category || 'Medical')}</Text>
                      {(service.price !== null && service.price !== undefined && service.price !== '') && (
                        <Text style={styles.serviceOptionPrice}>₹{String(service.price)}</Text>
                      )}
                    </View>
                    <Ionicons name="add-circle-outline" size={20} color={Colors.kbrBlue} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Tests Section */}
            {backendTests && backendTests.length > 0 && (
              <View style={styles.databaseServicesSection}>
                <Text style={styles.sectionTitle}>Tests</Text>
                {backendTests.map((test, index) => (
                  <TouchableOpacity
                    key={`test-${index}-${test.id || test.name || index}`}
                    style={styles.serviceOption}
                    onPress={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        service: test.name,
                        fees: test.price ? test.price.toString() : ''
                      }));
                      setShowServiceModal(false);
                    }}
                  >
                    <View style={styles.serviceOptionContent}>
                      <Text style={styles.serviceOptionTitle}>{String(test.name || 'Unnamed Test')}</Text>
                      <Text style={styles.serviceOptionCategory}>{String(test.category || 'Lab Test')}</Text>
                      {test.sampleRequired && (
                        <Text style={styles.serviceOptionSubInfo}>Sample: {String(test.sampleRequired)}</Text>
                      )}
                      {test.reportTime && (
                        <Text style={styles.serviceOptionSubInfo}>Report: {String(test.reportTime)}</Text>
                      )}
                      {(test.price !== null && test.price !== undefined && test.price !== '') && (
                        <Text style={styles.serviceOptionPrice}>₹{String(test.price)}</Text>
                      )}
                    </View>
                    <Ionicons name="add-circle-outline" size={20} color={Colors.kbrBlue} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Empty State */}
            {(!backendServices || backendServices.length === 0) && (!backendTests || backendTests.length === 0) && (
              <View style={styles.emptyServicesContainer}>
                <Ionicons name="medical-outline" size={48} color="#ccc" />
                <Text style={styles.emptyServicesText}>No services or tests available</Text>
                <Text style={styles.emptyServicesSubText}>Services and tests will be loaded from backend</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Doctor selection modal
  const renderDoctorModal = () => (
    <Modal visible={showDoctorModal} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.serviceModalContainer}>
          <View style={styles.serviceModalHeader}>
            <Text style={styles.serviceModalTitle}>Select Doctor</Text>
            <TouchableOpacity onPress={() => setShowDoctorModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.serviceModalContent}>
            {backendDoctors && backendDoctors.length > 0 ? (
              backendDoctors.map((doctor, index) => (
                <TouchableOpacity
                  key={`doctor-${index}-${doctor.id || doctor.name || index}`}
                  style={styles.serviceOption}
                  onPress={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      doctorName: doctor.name,
                      department: doctor.department || doctor.specialization || '',
                      fees: doctor.fees ? doctor.fees.toString() : prev.fees
                    }));
                    setShowDoctorModal(false);
                  }}
                >
                  <View style={styles.serviceOptionContent}>
                    <Text style={styles.serviceOptionTitle}>{String(doctor.name || 'Unknown Doctor')}</Text>
                    <Text style={styles.serviceOptionCategory}>{String(doctor.specialization || doctor.department || 'General Medicine')}</Text>
                    {(doctor.fees !== null && doctor.fees !== undefined && doctor.fees !== '') && (
                      <Text style={styles.serviceOptionPrice}>₹{String(doctor.fees)}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyServicesContainer}>
                <Ionicons name="person-outline" size={48} color="#ccc" />
                <Text style={styles.emptyServicesText}>No doctors available</Text>
                <Text style={styles.emptyServicesSubText}>Doctors will be loaded from backend</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
                <TouchableOpacity
                  style={styles.serviceButton}
                  onPress={() => setShowDoctorModal(true)}
                >
                  <Text style={[styles.serviceButtonText, !formData.doctorName && styles.placeholderText]}>
                    {String(formData.doctorName || 'Select doctor')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.inputLabel}>Department *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Auto-filled from doctor or enter manually"
                  value={formData.department}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, department: text }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service *</Text>
              <TouchableOpacity
                style={styles.serviceButton}
                onPress={() => setShowServiceModal(true)}
              >
                <Text style={[styles.dropdownText, !formData.service && styles.placeholderText]}>
                  {String(formData.service || 'Select service')}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dropdownText, !formData.appointmentDate && styles.placeholderText]}>
                    {String(formData.appointmentDate || 'Select date')}
                  </Text>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
                <Text style={styles.inputLabel}>Time *</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.dropdownText, !formData.appointmentTime && styles.placeholderText]}>
                    {String(formData.appointmentTime || 'Select time')}
                  </Text>
                  <Ionicons name="time-outline" size={16} color="#666" />
                </TouchableOpacity>
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

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}

        {/* Service Selection Modal */}
        {renderServiceModal()}
        {renderDoctorModal()}
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
  dropdownOptionSubText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  serviceButton: {
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
  dateTimeButton: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.7,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  serviceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  serviceModalContent: {
    maxHeight: Dimensions.get('window').height * 0.5,
    paddingHorizontal: 20,
  },
  serviceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  serviceOptionContent: {
    flex: 1,
  },
  serviceOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceOptionCategory: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  serviceOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.kbrBlue,
    marginTop: 4,
  },
  serviceOptionSubInfo: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyServicesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyServicesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptyServicesSubText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  manualInputSection: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manualServiceInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginTop: 8,
  },
  databaseServicesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
});

export default AddAppointmentModal;