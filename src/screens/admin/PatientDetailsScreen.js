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
  const { updatePatient, deletePatient, patients, payments, appointments, invoices, aggregatedPayments } = useApp();
  
  // Debug: Log the patient data we received
  console.log('🔍 [PatientDetails] Received patient data:', {
    name: initialPatient?.name,
    id: initialPatient?.id,
    source: initialPatient?.source,
    appointmentId: initialPatient?.appointmentId
  });
  
  // Debug: Log context data availability
  console.log('🔍 [PatientDetails] Context data:', {
    payments: payments?.length || 0,
    aggregatedPayments: aggregatedPayments?.length || 0,
    appointments: appointments?.length || 0,
    patients: patients?.length || 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [patient, setPatient] = useState(initialPatient);
  const [originalPatient, setOriginalPatient] = useState(initialPatient);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [patientPayments, setPatientPayments] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [treatmentDetails, setTreatmentDetails] = useState(null);

  // Update patient data from context when it changes (for real-time updates)
  React.useEffect(() => {
    const updatedPatient = patients.find(p => p.id === initialPatient.id);
    if (updatedPatient) {
      console.log('📝 [PatientDetails] Updating patient data from context:', updatedPatient.id);
      setPatient(updatedPatient);
      setOriginalPatient(updatedPatient);
    }
  }, [patients, initialPatient.id]);

  // Initial data fetch on component mount and when data changes
  React.useEffect(() => {
    if (aggregatedPayments || payments || appointments) {
      console.log('🔄 Data available, fetching patient data...');
      fetchPatientData();
    }
  }, [aggregatedPayments, payments, appointments, patient.id, patient.name]);

  // Refresh patient data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('📝 [PatientDetails] Screen focused - refreshing patient data');
      const updatedPatient = patients.find(p => p.id === initialPatient.id);
      if (updatedPatient) {
        setPatient(updatedPatient);
        setOriginalPatient(updatedPatient);
      }
      
      // Fetch patient payments and related data only if we have data
      if (aggregatedPayments || payments || appointments) {
        fetchPatientData();
      }
    }, [patients, initialPatient.id, aggregatedPayments, payments, appointments])
  );

  // Function to fetch patient payments and create treatment details
  const fetchPatientData = () => {
    console.log('🔍 Fetching patient data for:', patient.name, patient.id);
    console.log('🔍 Available data - Payments:', payments?.length || 0, 'AggregatedPayments:', aggregatedPayments?.length || 0, 'Appointments:', appointments?.length || 0);
    
    // Safety check - ensure we have the required data
    if (!aggregatedPayments && !payments && !appointments) {
      console.log('⚠️ No payments or appointments data available yet');
      return;
    }
    
    // Use aggregatedPayments first, fallback to payments
    const paymentSource = aggregatedPayments || payments || [];
    console.log('💰 Using payment source:', aggregatedPayments ? 'aggregatedPayments' : 'payments', '- Count:', paymentSource.length);
    
    // Find payments for this patient using STRICT matching to avoid cross-patient data
    const relatedPayments = paymentSource.filter(payment => {
      // STRICT ID matching first (most reliable)
      const exactIdMatch = payment.patientId === patient.id;
      
      // STRICT name matching (only if ID doesn't match but names are identical)
      const exactNameMatch = !exactIdMatch && payment.patientName === patient.name;
      
      // Only use phone matching as last resort and only if both name and ID don't match
      const phoneMatch = !exactIdMatch && !exactNameMatch && 
                        patient.phone && 
                        (payment.patientPhone === patient.phone || payment.contactNumber === patient.phone);
      
      const matches = exactIdMatch || exactNameMatch || phoneMatch;
      
      if (matches) {
        console.log('💰 Payment match found for', patient.name, ':', {
          paymentPatientName: payment.patientName,
          amount: '₹' + (payment.paidAmount || payment.totalPaid || payment.amount || 0),
          matchType: exactIdMatch ? 'ID' : exactNameMatch ? 'Name' : 'Phone',
          paymentId: payment.id,
          patientId: payment.patientId
        });
      }
      
      return matches;
    });
    
    console.log('💰 Found payments:', relatedPayments.length);
    
    // Validate payments to ensure they actually belong to this patient
    const validatedPayments = relatedPayments.filter(payment => {
      const isValidPayment = (
        payment.patientId === patient.id ||
        payment.patientName === patient.name
      );
      
      if (!isValidPayment) {
        console.warn('⚠️ Filtered out invalid payment:', {
          paymentPatient: payment.patientName,
          currentPatient: patient.name,
          paymentId: payment.id
        });
      }
      
      return isValidPayment;
    });
    
    console.log('💰 Validated payments:', validatedPayments.length);
    console.log('💰 Payment details:', validatedPayments.map(p => ({ 
      name: p.patientName, 
      amount: p.paidAmount || p.totalPaid || p.amount, 
      id: p.patientId 
    })));
    
    // Find appointments for this patient using STRICT matching
    const relatedAppointments = (appointments || []).filter(appointment => {
      // STRICT ID matching first
      const exactIdMatch = appointment.patientId === patient.id;
      
      // STRICT name matching (only if ID doesn't match)
      const exactNameMatch = !exactIdMatch && appointment.patientName === patient.name;
      
      // Phone matching as last resort
      const phoneMatch = !exactIdMatch && !exactNameMatch &&
                        patient.phone &&
                        (appointment.patientPhone === patient.phone || appointment.contactNumber === patient.phone);
      
      const matches = exactIdMatch || exactNameMatch || phoneMatch;
      
      if (matches) {
        console.log('📅 Appointment match found for', patient.name, ':', {
          appointmentPatientName: appointment.patientName,
          paymentStatus: appointment.paymentStatus,
          matchType: exactIdMatch ? 'ID' : exactNameMatch ? 'Name' : 'Phone'
        });
      }
      
      return matches;
    });
    
    console.log('📅 Found appointments:', relatedAppointments.length);
    console.log('📅 Appointment details:', relatedAppointments.map(a => ({ 
      name: a.patientName, 
      paymentStatus: a.paymentStatus, 
      amount: a.amount || a.fee,
      id: a.patientId 
    })));
    setPatientAppointments(relatedAppointments);
    
    // Create appointment payments from completed appointments (only for this patient)
    const appointmentPayments = relatedAppointments
      .filter(appointment => {
        const isPaid = appointment.paymentStatus === 'Paid' || appointment.paymentStatus === 'paid';
        const belongsToPatient = appointment.patientId === patient.id || appointment.patientName === patient.name;
        return isPaid && belongsToPatient;
      })
      .map((appointment, index) => ({
        id: `appointment-payment-${appointment.id}-${index}`,  // Make unique with index
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        totalAmount: appointment.amount || appointment.fee || 0,
        paidAmount: appointment.amount || appointment.fee || 0,
        dueAmount: 0,
        paymentMethod: appointment.paymentMode || 'Cash',
        paymentDate: appointment.appointmentDate || appointment.date,
        status: 'paid',
        paymentStatus: 'paid',
        source: 'appointment',
        service: appointment.service,
        department: appointment.department,
        doctorName: appointment.doctorName,
        createdAt: appointment.createdAt || new Date().toISOString(),
        description: `Payment for ${appointment.service || 'consultation'} appointment with ${appointment.doctorName}`,
        appointmentId: appointment.id  // Add original appointment ID for reference
      }));
    
    console.log('🏥 Created appointment payments:', appointmentPayments.length);
    
    // Combine VALIDATED payments with appointment payments
    const allPatientPayments = [...validatedPayments, ...appointmentPayments];
    
    // Final validation: Ensure ALL payments belong to THIS patient only
    const patientOnlyPayments = allPatientPayments.filter(payment => {
      const belongsToThisPatient = (
        payment.patientId === patient.id ||
        payment.patientName === patient.name
      );
      
      if (!belongsToThisPatient) {
        console.warn('🚫 Removed payment from different patient:', {
          paymentPatient: payment.patientName,
          currentPatient: patient.name,
          amount: payment.paidAmount || payment.totalPaid || payment.amount
        });
      }
      
      return belongsToThisPatient;
    });
    
    // Remove duplicates based on unique identifiers
    const uniquePayments = patientOnlyPayments.filter((payment, index, self) => {
      return index === self.findIndex(p => {
        // Check for duplicates based on multiple criteria
        const isSameId = p.id === payment.id;
        const isSameOriginalId = p.originalId && payment.originalId && p.originalId === payment.originalId;
        const isSameAppointment = p.appointmentId && payment.appointmentId && p.appointmentId === payment.appointmentId;
        const isSamePaymentData = (
          p.patientId === payment.patientId &&
          p.paidAmount === payment.paidAmount &&
          p.paymentDate === payment.paymentDate &&
          p.paymentMethod === payment.paymentMethod
        );
        
        return isSameId || isSameOriginalId || isSameAppointment || isSamePaymentData;
      });
    });
    
    // Sort by date (newest first)
    uniquePayments.sort((a, b) => {
      const dateA = new Date(a.paymentDate || a.createdAt || 0);
      const dateB = new Date(b.paymentDate || b.createdAt || 0);
      return dateB - dateA;
    });
    
    console.log('💰 Payment filtering results for', patient.name, ':', {
      allPayments: allPatientPayments.length,
      patientOnly: patientOnlyPayments.length,
      unique: uniquePayments.length
    });
    
    // Debug: Show final payment details
    console.log('💰 Final payments for', patient.name, ':', uniquePayments.map(p => ({
      patient: p.patientName,
      amount: p.paidAmount || p.totalPaid || p.amount,
      source: p.source || 'regular',
      id: p.id
    })));
    
    // Debug: Log filtering if payments were removed
    if (allPatientPayments.length !== uniquePayments.length) {
      console.log('🔄 Filtered out payments:', allPatientPayments.length - uniquePayments.length);
    }
    
    setPatientPayments(uniquePayments);
    
    // Create treatment details based on service/department
    createTreatmentDetails(patient, relatedAppointments, allPatientPayments);
  };

  // Function to create treatment details based on service
  const createTreatmentDetails = (patientData, appointments, payments) => {
    const service = patientData.service || appointments[0]?.service;
    const department = patientData.department || appointments[0]?.department;
    const symptoms = patientData.symptoms || appointments[0]?.symptoms;
    
    console.log('🏥 Creating treatment details for service:', service, 'department:', department);
    
    let treatmentInfo = {
      service: service || 'General Consultation',
      department: department || 'General Medicine',
      symptoms: symptoms || 'Not specified',
      recommendedTreatment: '',
      medications: [],
      followUpRequired: false,
      estimatedDuration: '',
      specialInstructions: ''
    };
    
    // Generate treatment details based on service/department
    switch (department?.toLowerCase()) {
      case 'nephrologist':
      case 'nephrology':
        treatmentInfo.recommendedTreatment = 'Kidney function assessment and monitoring';
        treatmentInfo.medications = ['Nephron protective medications', 'Blood pressure management', 'Dietary supplements'];
        treatmentInfo.followUpRequired = true;
        treatmentInfo.estimatedDuration = '3-6 months monitoring';
        treatmentInfo.specialInstructions = 'Maintain low sodium diet, monitor fluid intake, regular BP checks';
        break;
        
      case 'cardiology':
      case 'cardiologist':
        treatmentInfo.recommendedTreatment = 'Cardiovascular health evaluation';
        treatmentInfo.medications = ['Cardiac medications', 'Cholesterol management', 'Blood thinners if needed'];
        treatmentInfo.followUpRequired = true;
        treatmentInfo.estimatedDuration = '6 months monitoring';
        treatmentInfo.specialInstructions = 'Regular exercise, heart-healthy diet, stress management';
        break;
        
      case 'orthopedic':
      case 'orthopedics':
        treatmentInfo.recommendedTreatment = 'Musculoskeletal assessment and therapy';
        treatmentInfo.medications = ['Pain management medication', 'Anti-inflammatory drugs', 'Muscle relaxants'];
        treatmentInfo.followUpRequired = true;
        treatmentInfo.estimatedDuration = '4-8 weeks recovery';
        treatmentInfo.specialInstructions = 'Physical therapy, avoid heavy lifting, proper posture';
        break;
        
      case 'general medicine':
      case 'general':
      default:
        treatmentInfo.recommendedTreatment = 'General health assessment and wellness consultation';
        treatmentInfo.medications = ['As per symptoms', 'Preventive medications', 'Vitamin supplements'];
        treatmentInfo.followUpRequired = false;
        treatmentInfo.estimatedDuration = '1-2 weeks observation';
        treatmentInfo.specialInstructions = 'Maintain healthy lifestyle, regular check-ups';
        break;
    }
    
    // Customize based on specific service
    if (service) {
      switch (service.toLowerCase()) {
        case 'sneha':
          treatmentInfo.service = 'Sneha - Specialized Care Program';
          treatmentInfo.specialInstructions += ' | Enrolled in Sneha care program for comprehensive treatment';
          break;
        case 'consultation':
          treatmentInfo.service = 'General Consultation';
          break;
        case 'emergency':
          treatmentInfo.service = 'Emergency Care';
          treatmentInfo.estimatedDuration = 'Immediate care required';
          treatmentInfo.followUpRequired = true;
          break;
      }
    }
    
    setTreatmentDetails(treatmentInfo);
  };

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



        {/* Payment Information Section */}
        <View style={styles.section}>
          <View style={styles.paymentHeader}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <TouchableOpacity 
              style={styles.addPaymentButton}
              onPress={() => setShowPaymentModal(true)}
            >
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addPaymentText}>Add Payment</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionContent}>
            {/* Debug info - remove after testing */}
            {__DEV__ && (
              <Text style={{ fontSize: 10, color: '#888', marginBottom: 10 }}>
                Debug: {patientPayments.length} payments found for {patient.name} (ID: {patient.id})
              </Text>
            )}
            
            {patientPayments.length > 0 ? (
              <>
                {/* Payment Summary */}
                <View style={styles.paymentSummary}>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentLabel}>Total Amount:</Text>
                    <Text style={styles.paymentValue}>
                      ₹{patientPayments.reduce((sum, p) => sum + (p.totalAmount || p.amount || 0), 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentLabel}>Amount Paid:</Text>
                    <Text style={[styles.paymentValue, { color: '#22C55E' }]}>
                      ₹{patientPayments.reduce((sum, p) => sum + (p.paidAmount || p.totalPaid || p.amount || 0), 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentLabel}>Due Amount:</Text>
                    <Text style={[styles.paymentValue, { color: '#EF4444' }]}>
                      ₹{patientPayments.reduce((sum, p) => sum + (p.dueAmount || p.remainingAmount || ((p.totalAmount || p.amount || 0) - (p.paidAmount || p.totalPaid || 0))), 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.paymentSummaryRow}>
                    <Text style={styles.paymentLabel}>Payment Status:</Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: patientPayments.some(p => {
                        const due = p.dueAmount || p.remainingAmount || ((p.totalAmount || p.amount || 0) - (p.paidAmount || p.totalPaid || 0));
                        return due > 0;
                      }) ? '#FEF3C7' : '#D1FAE5' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: patientPayments.some(p => {
                          const due = p.dueAmount || p.remainingAmount || ((p.totalAmount || p.amount || 0) - (p.paidAmount || p.totalPaid || 0));
                          return due > 0;
                        }) ? '#D97706' : '#065F46' }
                      ]}>
                        {patientPayments.some(p => {
                          const due = p.dueAmount || p.remainingAmount || ((p.totalAmount || p.amount || 0) - (p.paidAmount || p.totalPaid || 0));
                          return due > 0;
                        }) ? 'Partial' : 'Fully Paid'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment History */}
                <View style={styles.paymentHistory}>
                  <Text style={styles.subSectionTitle}>Payment History</Text>
                  {patientPayments.map((payment, index) => (
                    <View key={`payment-${payment.id || payment.originalId || payment.appointmentId || 'unknown'}-${index}`} style={styles.paymentHistoryItem}>
                      <View style={styles.paymentHistoryHeader}>
                        <View style={styles.paymentTitleContainer}>
                          <Text style={styles.paymentHistoryTitle}>
                            {payment.source === 'appointment' ? 
                              `${payment.service || 'Appointment'} Payment` : 
                              `Payment #${index + 1}`
                            }
                          </Text>
                          {payment.source === 'appointment' && (
                            <View style={styles.appointmentBadge}>
                              <Text style={styles.appointmentBadgeText}>Appointment</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.paymentDateContainer}>
                          <Text style={styles.paymentHistoryDate}>
                            {payment.paymentDate || payment.createdAt ? 
                              new Date(payment.paymentDate || payment.createdAt).toLocaleDateString('en-IN') : 
                              'Date not specified'
                            }
                          </Text>
                          <Text style={styles.paymentMethod}>
                            {payment.paymentMethod || 'Cash'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.paymentHistoryDetails}>
                        <View style={styles.paymentAmountContainer}>
                          <Text style={styles.paymentHistoryAmount}>
                            ₹{(payment.paidAmount || payment.totalPaid || payment.amount || 0).toLocaleString()}
                          </Text>
                          {payment.source === 'appointment' && payment.doctorName && (
                            <Text style={styles.paymentDoctorName}>Dr. {payment.doctorName}</Text>
                          )}
                        </View>
                        <View style={styles.paymentStatusContainer}>
                          <Text style={styles.paymentHistoryStatus}>
                            {payment.status || payment.paymentStatus || 'Completed'}
                          </Text>
                          {payment.department && (
                            <Text style={styles.paymentDepartment}>{payment.department}</Text>
                          )}
                        </View>
                      </View>
                      {payment.description && (
                        <Text style={styles.paymentDescription}>
                          {payment.description}
                        </Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noPaymentSetup}>
                <Ionicons name="card-outline" size={48} color="#D1D5DB" />
                <Text style={styles.noPaymentSetupText}>
                  No payment records found for this patient
                </Text>
                <Text style={styles.noPaymentSetupSubtext}>
                  Payment records will appear here after transactions
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Treatment Details Section */}
        {treatmentDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Treatment Details</Text>
            <View style={styles.sectionContent}>
              <InfoRow
                icon="medical"
                label="Service"
                value={treatmentDetails.service}
              />
              <InfoRow
                icon="business"
                label="Department"
                value={treatmentDetails.department}
              />
              <InfoRow
                icon="heart"
                label="Symptoms"
                value={treatmentDetails.symptoms}
              />
              <InfoRow
                icon="clipboard"
                label="Recommended Treatment"
                value={treatmentDetails.recommendedTreatment}
              />
              <InfoRow
                icon="time"
                label="Estimated Duration"
                value={treatmentDetails.estimatedDuration}
              />
              <InfoRow
                icon="checkmark-circle"
                label="Follow-up Required"
                value={treatmentDetails.followUpRequired ? 'Yes' : 'No'}
              />
              
              {/* Medications */}
              {treatmentDetails.medications.length > 0 && (
                <View style={styles.medicationSection}>
                  <Text style={styles.subSectionTitle}>Recommended Medications</Text>
                  {treatmentDetails.medications.map((medication, index) => (
                    <View key={index} style={styles.medicationItem}>
                      <Ionicons name="medical" size={16} color="#6B7280" />
                      <Text style={styles.medicationText}>{medication}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Special Instructions */}
              {treatmentDetails.specialInstructions && (
                <View style={styles.instructionsSection}>
                  <Text style={styles.subSectionTitle}>Special Instructions</Text>
                  <Text style={styles.instructionsText}>
                    {treatmentDetails.specialInstructions}
                  </Text>
                </View>
              )}
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
  paymentSummary: {
    marginBottom: 20,
  },
  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  paymentValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentHistory: {
    marginTop: 20,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  paymentHistoryItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentHistoryDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentHistoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentHistoryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22C55E',
  },
  paymentHistoryStatus: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  paymentTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  appointmentBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  appointmentBadgeText: {
    fontSize: 10,
    color: '#4F46E5',
    fontWeight: '600',
  },
  paymentDateContainer: {
    alignItems: 'flex-end',
  },
  paymentMethod: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  paymentAmountContainer: {
    alignItems: 'flex-start',
  },
  paymentDoctorName: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentStatusContainer: {
    alignItems: 'flex-end',
  },
  paymentDepartment: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  paymentDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  medicationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  medicationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  instructionsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  instructionsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
});

export default PatientDetailsScreen;