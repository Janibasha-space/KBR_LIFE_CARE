import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Linking,
  StatusBar,
  Modal,
  RefreshControl,
  Picker,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import PatientRegistrationModal from '../../components/PatientRegistrationModal';
import AddAppointmentModal from '../../components/AddAppointmentModal';
import { FirebaseAppointmentService } from '../../services/firebaseHospitalServices';
import { InvoiceGenerationService } from '../../services/invoiceGenerationService';
import AppHeader from '../../components/AppHeader';
import { useApp } from '../../contexts/AppContext';
import { db } from '../../config/firebase.config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const AppointmentManagementScreen = ({ navigation }) => {
  const { 
    refreshAppointmentData, 
    forceRefreshAppointments, 
    initializeFirebaseData,
    appState,
    updatePayment,
    updatePatient,
    updateInvoice,
    updateInvoiceStatus
  } = useApp(); // Get refresh functions and data from AppContext
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [showAppointmentDetailModal, setShowAppointmentDetailModal] = useState(false);

  // Real-time appointments data from Firebase
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to generate avatar from name
  const getAvatar = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'P';
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'scheduled':
        return '#10B981';
      case 'admitted':
        return '#059669'; // Dark green for admitted status
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#6B7280';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  // Helper function to format Firebase appointment data to match UI expectations
  const formatAppointmentData = (firebaseAppointment, index = 0) => {
    const name = firebaseAppointment.patientName || firebaseAppointment.name || 'Unknown Patient';
    const status = firebaseAppointment.status || 'scheduled';
    
    // Handle both new and old data structures
    // New structure: firebaseDocId = actual Firebase document ID, appointmentId = appointment identifier
    // Old structure: id = Firebase document ID (for backwards compatibility)
    const firebaseDocId = firebaseAppointment.firebaseDocId || firebaseAppointment.id;
    const appointmentId = firebaseAppointment.appointmentId || firebaseAppointment.id;
    
    // Generate proper appointment number for display if not exists
    const appointmentNumber = firebaseAppointment.appointmentNumber || 
                             (firebaseAppointment.tokenNumber?.startsWith('KBR-') ? firebaseAppointment.tokenNumber : null) ||
                             `KBR-${(index + 1).toString().padStart(3, '0')}`;
    
    console.log(`📝 Formatting appointment - Firebase Doc ID: ${firebaseDocId}, Appointment ID: ${appointmentId}, Display Number: ${appointmentNumber}`);
    
    return {
      id: firebaseDocId, // Use actual Firebase document ID for updates
      appointmentId: appointmentId, // Store the appointment ID separately
      patientName: name,
      patientId: appointmentNumber, // Display the KBR number
      appointmentNumber: appointmentNumber,
      patientPhone: firebaseAppointment.contactNumber || firebaseAppointment.patientPhone || 'N/A',
      doctorName: firebaseAppointment.doctorName || firebaseAppointment.doctor || 'Dr. TBD',
      department: firebaseAppointment.department || firebaseAppointment.specialty || 'General',
      service: firebaseAppointment.service || firebaseAppointment.serviceType || 'Consultation',
      appointmentDate: firebaseAppointment.appointmentDate || new Date().toISOString().split('T')[0],
      appointmentTime: firebaseAppointment.appointmentTime || firebaseAppointment.timeSlot || 'TBD',
      status: status.charAt(0).toUpperCase() + status.slice(1),
      statusColor: getStatusColor(status),
      fees: firebaseAppointment.fees || firebaseAppointment.amount || 500,
      paymentStatus: firebaseAppointment.paymentStatus || 'Pending',
      paymentMode: firebaseAppointment.paymentMode || 'Pay at Hospital',
      transactionId: firebaseAppointment.transactionId || null,
      razorpayOrderId: firebaseAppointment.razorpayOrderId || null,
      bookingDate: firebaseAppointment.createdAt ? new Date(firebaseAppointment.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      patientAge: firebaseAppointment.patientAge || firebaseAppointment.age || 'N/A',
      patientGender: firebaseAppointment.patientGender || firebaseAppointment.gender || 'N/A',
      symptoms: firebaseAppointment.symptoms || firebaseAppointment.reason || 'General consultation',
      emergencyContact: firebaseAppointment.emergencyContact || firebaseAppointment.contactNumber || 'N/A',
      patientAddress: firebaseAppointment.patientAddress || firebaseAppointment.address || 'N/A',
      isNewPatient: firebaseAppointment.isNewPatient || false,
      avatar: getAvatar(name),
      tokenNumber: firebaseAppointment.tokenNumber || null,
    };
  };

  // Debug function to check Firebase appointment IDs
  const debugAppointmentIds = async () => {
    try {
      console.log('🔍 DEBUG: Checking Firebase appointment collection...');
      const result = await FirebaseAppointmentService.getAppointments();
      
      if (result.success) {
        console.log('🔍 DEBUG: Firebase appointments:');
        result.data.forEach((appointment, index) => {
          console.log(`   ${index + 1}. ID: "${appointment.id}" | Name: "${appointment.patientName || appointment.name}" | Token: "${appointment.tokenNumber}"`);
        });
      }
    } catch (error) {
      console.error('🔍 DEBUG: Error fetching appointments for debug:', error);
    }
  };

  // Fetch appointments from Firebase
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const timestamp = new Date().toISOString();
      console.log(`🔄 Fetching appointments from Firebase at ${timestamp}...`);
      
      // Add debug call
      await debugAppointmentIds();
      
      const result = await FirebaseAppointmentService.getAppointments();
      
      if (result.success) {
        console.log('✅ Appointments fetched successfully:', result.data.length, 'appointments');
        
        // Debug: Log the actual appointment IDs from Firebase
        result.data.forEach((appointment, index) => {
          console.log(`📋 Appointment ${index + 1}:`, {
            id: appointment.id,
            patientName: appointment.patientName || appointment.name,
            tokenNumber: appointment.tokenNumber,
            status: appointment.status
          });
        });
        
        const formattedAppointments = result.data.map((appointment, index) => formatAppointmentData(appointment, index));
        
        // Check for duplicate IDs before setting state
        const ids = formattedAppointments.map(apt => apt.id);
        const uniqueIds = [...new Set(ids)];
        if (ids.length !== uniqueIds.length) {
          console.warn('⚠️ Duplicate appointment IDs detected:', ids);
          console.warn('⚠️ Unique IDs:', uniqueIds);
        }
        
        setAppointmentsList(formattedAppointments);
      } else {
        console.warn('⚠️ Failed to fetch appointments:', result.message);
        setError('Failed to load appointments');
        setAppointmentsList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      setError('Error loading appointments');
      setAppointmentsList([]);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time listener for appointments on component mount
  useEffect(() => {
    console.log('🔄 Setting up real-time appointments listener...');
    
    let unsubscribe = null;
    
    const setupRealtimeListener = () => {
      try {
        // Create real-time query for appointments
        const appointmentsRef = collection(db, 'appointments');
        const q = query(appointmentsRef, orderBy('updatedAt', 'desc'));
        
        // Set up real-time listener
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log('🔥 Real-time update detected - processing appointments...');
          
          const appointments = [];
          querySnapshot.forEach((doc) => {
            const documentData = doc.data();
            const appointmentData = {
              firebaseDocId: doc.id,
              ...documentData,
              appointmentId: documentData.id || doc.id,
              id: doc.id
            };
            console.log(`📋 Real-time appointment data for ${doc.id}:`, appointmentData);
            appointments.push(appointmentData);
          });
          
          console.log(`🔄 Real-time update: ${appointments.length} appointments received`);
          
          // Check for duplicate IDs
          const ids = appointments.map(apt => apt.id);
          const uniqueIds = [...new Set(ids)];
          if (ids.length !== uniqueIds.length) {
            console.warn('⚠️ Duplicate appointment IDs detected in real-time update:', ids);
          }
          
          // Format appointments and update state
          const formattedAppointments = appointments.map((appointment, index) => 
            formatAppointmentData(appointment, index)
          );
          
          setAppointmentsList(formattedAppointments);
          setLoading(false);
        }, (error) => {
          console.error('❌ Real-time listener error:', error);
          // Fallback to manual fetch if real-time fails
          console.log('🔄 Falling back to manual fetch...');
          fetchAppointments();
        });
        
      } catch (error) {
        console.error('❌ Error setting up real-time listener:', error);
        // Fallback to manual fetch
        fetchAppointments();
      }
    };
    
    // Initial setup
    setupRealtimeListener();
    
    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up appointments real-time listener...');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Helper function to check if date matches filter (needed for statistics)
  const checkDateFilter = (appointmentDate, filter) => {
    const today = new Date();
    const appointmentDateTime = new Date(appointmentDate);
    
    switch (filter) {
      case 'Today':
        return appointmentDateTime.toDateString() === today.toDateString();
      case 'Tomorrow':
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        return appointmentDateTime.toDateString() === tomorrow.toDateString();
      case 'This Week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return appointmentDateTime >= startOfWeek && appointmentDateTime <= endOfWeek;
      case 'This Month':
        return appointmentDateTime.getMonth() === today.getMonth() && 
               appointmentDateTime.getFullYear() === today.getFullYear();
      case 'All':
        return true;
      default:
        return true;
    }
  };

  // Calculate real-time appointment statistics using useMemo for performance
  const appointmentStats = useMemo(() => {
    // Add safety check to prevent errors
    if (!appointmentsList || !Array.isArray(appointmentsList)) {
      return {
        totalAppointments: 0,
        todayAppointments: 0,
        confirmedAppointments: 0,
        admittedAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0
      };
    }
    
    return {
      totalAppointments: appointmentsList.length,
      todayAppointments: appointmentsList.filter(apt => checkDateFilter(apt.appointmentDate, 'Today')).length,
      confirmedAppointments: appointmentsList.filter(apt => apt.status === 'Confirmed').length,
      admittedAppointments: appointmentsList.filter(apt => apt.status === 'Admitted').length,
      pendingAppointments: appointmentsList.filter(apt => apt.status === 'Pending').length,
      completedAppointments: appointmentsList.filter(apt => apt.status === 'Completed').length
    };
  }, [appointmentsList]);

  const statuses = ['All', 'Confirmed', 'Admitted', 'Pending', 'Completed', 'Cancelled'];
  const dateFilters = ['All', 'Today', 'Tomorrow', 'This Week', 'This Month'];

  const filteredAppointments = useMemo(() => {
    // Add safety check to prevent errors
    if (!appointmentsList || !Array.isArray(appointmentsList)) {
      return [];
    }
    
    // Remove duplicates based on ID first
    const uniqueAppointments = appointmentsList.reduce((acc, appointment) => {
      const existingIndex = acc.findIndex(item => item.id === appointment.id);
      if (existingIndex >= 0) {
        // Replace with the newer one (assume later entries are more recent)
        acc[existingIndex] = appointment;
      } else {
        acc.push(appointment);
      }
      return acc;
    }, []);
    
    return uniqueAppointments.filter(appointment => {
      const matchesSearch = appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           appointment.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'All' || appointment.status === selectedStatus;
      const matchesDate = checkDateFilter(appointment.appointmentDate, selectedDate);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [appointmentsList, searchQuery, selectedStatus, selectedDate]);

  // Handler functions
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetailModal(true);
  };

  const handleCall = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\s/g, '');
    Linking.openURL(`tel:${cleanNumber}`);
  };

  const handleConfirmPayment = (appointmentId) => {
    Alert.alert(
      'Confirm Payment',
      'Has the patient made the payment at the hospital?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Confirm', 
          onPress: () => {
            Alert.alert('Success', 'Payment confirmed and appointment updated');
            // Update appointment status logic here
          }
        }
      ]
    );
  };

  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Appointment cancelled');
            // Cancel appointment logic here
          }
        }
      ]
    );
  };

  const handleCompleteAppointment = (appointmentId) => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Complete', 
          onPress: () => {
            Alert.alert('Success', 'Appointment marked as completed');
            // Complete appointment logic here
          }
        }
      ]
    );
  };

  const handleAdmitPatient = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = async (newPatient) => {
    // Update the appointment status to "Admitted" if we have a selected appointment
    if (selectedAppointment) {
      try {
        console.log(`🏥 Updating appointment ${selectedAppointment.id} status to "Admitted"`);
        await FirebaseAppointmentService.updateAppointment(selectedAppointment.id, {
          status: 'Admitted',
          statusColor: '#10B981', // Green color for admitted status
          admittedDate: new Date().toISOString(),
          admittedPatientId: newPatient.id,
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Appointment status updated to Admitted');
        
        // Clear the selected appointment
        setSelectedAppointment(null);
      } catch (error) {
        console.error('❌ Error updating appointment status:', error);
        // Don't block the success flow, just log the error
      }
    }

    Alert.alert(
      'Patient Registered & Admitted',
      `${newPatient.name} has been successfully registered and admitted to the ${newPatient.patientType === 'IP' ? 'In-Patient' : 'Out-Patient'} list.${selectedAppointment ? ' The appointment status has been updated to "Admitted".' : ''}`,
      [
        {
          text: 'View Patients',
          onPress: () => navigation.navigate('PatientManagement')
        },
        { text: 'OK' }
      ]
    );
    
    // Close the registration modal
    setShowRegistrationModal(false);
  };

  const handleAddAppointment = () => {
    setShowAddAppointmentModal(true);
  };

  const handleAddAppointmentSuccess = async (newAppointment) => {
    try {
      console.log('✅ Appointment added successfully:', newAppointment);
      
      // Force refresh appointment data from multiple sources
      await fetchAppointments(); // Refresh local appointments list
      
      // Also refresh AppContext data
      if (forceRefreshAppointments) {
        await forceRefreshAppointments();
      }
      
      Alert.alert('Success', `New appointment has been added successfully!\nPatient: ${newAppointment.patientName}\nToken: ${newAppointment.tokenNumber || 'TBD'}`);
    } catch (error) {
      console.error('❌ Error refreshing after appointment creation:', error);
      Alert.alert('Success', 'Appointment added, but there may be a delay in displaying the latest data.');
    }
  };

  // Generate appointment number in KBR-XXX format
  const generateAppointmentNumber = (appointments) => {
    const existingNumbers = appointments
      .map(apt => apt.appointmentNumber || apt.patientId)
      .filter(num => num && num.startsWith('KBR-'))
      .map(num => parseInt(num.split('-')[1]) || 0)
      .sort((a, b) => b - a);
    
    const nextNumber = existingNumbers.length > 0 ? existingNumbers[0] + 1 : 1;
    return `KBR-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Helper function to update existing payment record (prevents duplicates)
  const updateExistingPaymentRecord = async (appointment, newPaymentStatus, paymentMode) => {
    try {
      console.log('🔄 Searching for existing payment record for appointment:', appointment.id);
      
      // Search for existing payment linked to this appointment
      // Check multiple sources: direct payments, patient payment history, appointment payments
      
      // Method 1: Check if appointment has linked invoices, then find payments linked to those invoices
      const { invoices } = appState;
      const appointmentInvoices = invoices.filter(inv => 
        inv.appointmentId === appointment.id || 
        inv.patientId === appointment.patientId
      );
      
      if (appointmentInvoices.length > 0) {
        console.log('📄 Found', appointmentInvoices.length, 'related invoices');
        
        // Find payments linked to these invoices
        const { payments } = appState;
        const relatedPayments = payments.filter(payment => 
          appointmentInvoices.some(inv => inv.id === payment.invoiceId)
        );
        
        if (relatedPayments.length > 0) {
          console.log('💰 Found', relatedPayments.length, 'existing payment records to update');
          
          // Update all related payments
          for (const payment of relatedPayments) {
            const updatedPaymentData = {
              status: newPaymentStatus === 'Paid' ? 'completed' : 'pending',
              paymentMethod: paymentMode,
              updatedAt: new Date().toISOString()
            };
            
            await updatePayment(payment.id, updatedPaymentData);
            console.log('✅ Updated payment record:', payment.id);
          }
          
          return { success: true, updated: relatedPayments.length };
        }
      }
      
      // Method 2: Check patient payment details for this appointment
      const { patients } = appState;
      const patient = patients.find(p => p.id === appointment.patientId);
      
      if (patient && patient.paymentDetails) {
        console.log('👤 Found patient with payment details, updating patient payment record');
        
        // Calculate new paid amount based on payment status
        let newPaidAmount = patient.paymentDetails.totalPaid || 0;
        let newStatus = 'pending';
        
        if (newPaymentStatus === 'Paid') {
          // If marking as paid, ensure the paid amount includes this appointment
          const appointmentAmount = appointment.amount || appointment.totalAmount || appointment.consultationFee || 0;
          newPaidAmount = Math.max(newPaidAmount, appointmentAmount);
          newStatus = newPaidAmount >= (patient.paymentDetails.totalAmount || 0) ? 'fully_paid' : 'partially_paid';
        } else {
          // If marking as pending, recalculate paid amount excluding this appointment
          const appointmentAmount = appointment.amount || appointment.totalAmount || appointment.consultationFee || 0;
          newPaidAmount = Math.max(0, newPaidAmount - appointmentAmount);
          newStatus = newPaidAmount > 0 ? 'partially_paid' : 'pending';
        }
        
        // Update patient payment details
        const updatedPatient = {
          ...patient,
          paymentDetails: {
            ...patient.paymentDetails,
            totalPaid: newPaidAmount,
            status: newStatus,
            paymentMethod: paymentMode,
            lastUpdated: new Date().toISOString()
          }
        };
        
        // Update patient record
        await updatePatient(patient.id, updatedPatient);
        console.log('✅ Updated patient payment record - Status:', newStatus, 'Paid:', newPaidAmount);
        
        return { success: true, updated: 1 };
      }
      
      console.log('⚠️ No existing payment record found - will be handled by appointment update');
      return { success: false, message: 'No existing payment found' };
      
    } catch (error) {
      console.error('❌ Error updating existing payment record:', error);
      return { success: false, error: error.message };
    }
  };

  // Helper function to update existing invoice status (prevents duplicates)
  const updateExistingInvoiceStatus = async (appointment, newInvoiceStatus) => {
    try {
      console.log('🔄 Searching for existing invoice for appointment:', appointment.id);
      
      const { invoices } = appState;
      
      // Find existing invoice linked to this appointment
      const existingInvoice = invoices.find(inv => 
        inv.appointmentId === appointment.id || 
        (inv.patientId === appointment.patientId && 
         inv.patientName === appointment.patientName &&
         inv.description && inv.description.includes(appointment.serviceName || appointment.service))
      );
      
      if (existingInvoice) {
        console.log('📄 Found existing invoice:', existingInvoice.invoiceNumber);
        console.log('🔄 Updating invoice status from', existingInvoice.status, 'to', newInvoiceStatus);
        
        const updatedInvoiceData = {
          status: newInvoiceStatus.toLowerCase(),
          paymentStatus: newInvoiceStatus.toLowerCase(),
          updatedAt: new Date().toISOString()
        };
        
        // If marking as paid, add payment date
        if (newInvoiceStatus === 'PAID') {
          updatedInvoiceData.paymentDate = new Date().toISOString().split('T')[0];
        }
        
        // Update invoice using AppContext method
        await updateInvoice(existingInvoice.id, updatedInvoiceData);
        console.log('✅ Invoice status updated successfully');
        
        return { 
          success: true, 
          invoice: existingInvoice,
          newStatus: newInvoiceStatus 
        };
      } else {
        console.log('📄 No existing invoice found for this appointment');
        return { success: false, message: 'No existing invoice found' };
      }
      
    } catch (error) {
      console.error('❌ Error updating existing invoice status:', error);
      return { success: false, error: error.message };
    }
  };

  // Batch function to synchronize all existing invoices (fix inconsistent invoice statuses)
  const synchronizeAllInvoiceStatuses = async () => {
    try {
      console.log('🔄 Starting batch synchronization of invoice statuses...');
      const { invoices } = appState;
      
      let fixedCount = 0;
      
      for (const invoice of invoices) {
        // Check for inconsistent status
        const hasInconsistentStatus = (
          invoice.paymentStatus === 'paid' && invoice.status !== 'paid'
        ) || (
          invoice.paymentStatus === 'pending' && invoice.status === 'paid'
        ) || (
          invoice.paymentStatus === 'draft' && invoice.status === 'paid'
        );
        
        if (hasInconsistentStatus) {
          console.log(`🔧 Fixing inconsistent invoice: ${invoice.invoiceNumber}`);
          console.log(`   Current: paymentStatus="${invoice.paymentStatus}", status="${invoice.status}"`);
          
          // Fix the inconsistency
          let newStatus = invoice.paymentStatus;
          if (invoice.paymentStatus === 'pending' || invoice.paymentStatus === 'draft') {
            newStatus = 'draft';
          } else if (invoice.paymentStatus === 'paid') {
            newStatus = 'paid';
          }
          
          const updateData = {
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
          
          if (newStatus === 'paid') {
            updateData.paymentDate = new Date().toISOString().split('T')[0];
          }
          
          await updateInvoice(invoice.id, updateData);
          fixedCount++;
          
          console.log(`   Fixed: paymentStatus="${invoice.paymentStatus}", status="${newStatus}"`);
        }
      }
      
      if (fixedCount > 0) {
        console.log(`✅ Fixed ${fixedCount} inconsistent invoices`);
        Alert.alert('Success', `Fixed ${fixedCount} invoice status inconsistencies`);
        
        // Refresh data to show updates
        setTimeout(async () => {
          await initializeFirebaseData();
          console.log('✅ Data refreshed after batch invoice sync');
        }, 1000);
      } else {
        console.log('✅ All invoices are already synchronized');
        Alert.alert('Info', 'All invoices are already synchronized');
      }
      
    } catch (error) {
      console.error('❌ Error synchronizing invoice statuses:', error);
      Alert.alert('Error', 'Failed to synchronize invoice statuses');
    }
  };

  // Save edit changes
  const handleSaveEditChanges = async () => {
    if (!editingAppointment) return;

    try {
      console.log('🔧 Editing appointment:', editingAppointment);
      console.log('🔧 Firebase Document ID for update:', editingAppointment.id);
      console.log('🔧 Appointment ID (for display):', editingAppointment.appointmentId);
      
      // Verify we have a valid appointment ID
      if (!editingAppointment.id) {
        throw new Error('Invalid appointment ID');
      }
      
      // Smart payment logic: Auto-update payment status based on payment mode
      let finalPaymentStatus = editFormData.paymentStatus;
      
      // IMPORTANT: "Pay at Hospital" means payment is NOT made yet - patient will pay at hospital
      // Only set to "Paid" for "Pay at Hospital" if explicitly marked as "Paid" by admin
      if (editFormData.paymentMode === 'Pay at Hospital') {
        // Keep the current payment status - do NOT auto-set to "Paid"
        // Payment should remain "Pending" until actually received at hospital
        finalPaymentStatus = editFormData.paymentStatus; // Keep as is
      }
      
      // If payment mode is "Cash", "UPI", or "Card" and status is confirmed, assume payment received
      else if (['Cash', 'UPI', 'Card'].includes(editFormData.paymentMode) && 
          (editFormData.status === 'Confirmed' || editFormData.status === 'Admitted' || editFormData.status === 'Completed')) {
        finalPaymentStatus = 'Paid';
      }

      const updatedData = {
        status: editFormData.status,
        paymentMode: editFormData.paymentMode,
        paymentStatus: finalPaymentStatus,
        statusColor: getStatusColor(editFormData.status),
      };

      // If rescheduling, include new date/time
      if (editFormData.status === 'Reschedule' && editFormData.appointmentDate) {
        updatedData.appointmentDate = editFormData.appointmentDate;
        updatedData.appointmentTime = editFormData.appointmentTime;
        updatedData.status = 'Confirmed'; // Reset status to confirmed after reschedule
        updatedData.statusColor = getStatusColor('Confirmed');
      }

      // Add notes if provided
      if (editFormData.notes) {
        updatedData.notes = editFormData.notes;
        updatedData.updatedAt = new Date().toISOString();
      }

      console.log('💾 Attempting to update appointment in Firebase with ID:', editingAppointment.id);
      console.log('📊 Update data:', updatedData);

      // Update in Firebase first
      const updateResult = await FirebaseAppointmentService.updateAppointment(editingAppointment.id, updatedData);
      
      if (updateResult.success) {
        console.log('✅ Firebase update successful');
        
        // Handle payment status changes - Update existing payment/invoice instead of creating new ones
        const originalPaymentStatus = editingAppointment.paymentStatus;
        const wasStatusChangedToPaid = originalPaymentStatus !== 'Paid' && finalPaymentStatus === 'Paid';
        const wasStatusChangedToPending = originalPaymentStatus === 'Paid' && finalPaymentStatus === 'Pending';
        
        console.log('🔍 Payment Status Check:');
        console.log('   Original:', originalPaymentStatus, '→ New:', finalPaymentStatus);
        console.log('   Changed to Paid:', wasStatusChangedToPaid);
        console.log('   Changed to Pending:', wasStatusChangedToPending);
        
        let invoiceMessage = '';
        
        // Handle payment status change to PAID
        if (wasStatusChangedToPaid) {
          console.log('💳 Payment status changed from', originalPaymentStatus, 'to', finalPaymentStatus);
          console.log('� Updating existing payment and invoice records...');
          
          try {
            // Step 1: Update existing payment record (don't create new one)
            await updateExistingPaymentRecord(editingAppointment, finalPaymentStatus, editFormData.paymentMode);
            
            // Step 2: Update existing invoice status from DRAFT to PAID (don't create new one)
            const invoiceUpdateResult = await updateExistingInvoiceStatus(editingAppointment, 'PAID');
            
            if (invoiceUpdateResult.success) {
              console.log('✅ Invoice status updated to PAID successfully');
              invoiceMessage = `\n\n🧾 Invoice status updated to PAID`;
            } else {
              // If no existing invoice found, create new one
              console.log('📄 No existing invoice found - creating new one...');
              const appointmentForInvoice = {
                ...editingAppointment,
                paymentStatus: finalPaymentStatus,
                paymentMode: editFormData.paymentMode,
                status: editFormData.status
              };
              
              const invoiceResult = await InvoiceGenerationService.processInvoiceGeneration(appointmentForInvoice);
              
              if (invoiceResult.success) {
                console.log('✅ New invoice generated successfully:', invoiceResult.invoiceNumber);
                invoiceMessage = `\n\n🧾 Invoice ${invoiceResult.invoiceNumber} generated for ₹${invoiceResult.invoice.totalAmount}`;
              } else {
                console.error('❌ Invoice generation failed:', invoiceResult.message);
                invoiceMessage = '\n\n⚠️ Invoice generation failed. Please create invoice manually.';
              }
            }
            
          } catch (error) {
            console.error('❌ Error updating payment/invoice records:', error);
            invoiceMessage = '\n\n⚠️ Payment/Invoice update failed. Please check manually.';
          }
        }
        
        // Handle payment status change to PENDING (from PAID)
        if (wasStatusChangedToPending) {
          console.log('💳 Payment status changed from PAID to PENDING');
          console.log('🔄 Updating existing payment and invoice records...');
          
          try {
            // Update existing payment record
            await updateExistingPaymentRecord(editingAppointment, finalPaymentStatus, editFormData.paymentMode);
            
            // Update existing invoice status from PAID back to DRAFT
            const invoiceUpdateResult = await updateExistingInvoiceStatus(editingAppointment, 'DRAFT');
            
            if (invoiceUpdateResult.success) {
              console.log('✅ Invoice status updated to DRAFT successfully');
              invoiceMessage = `\n\n🧾 Invoice status updated to DRAFT`;
            }
            
          } catch (error) {
            console.error('❌ Error updating payment/invoice records:', error);
            invoiceMessage = '\n\n⚠️ Payment/Invoice update failed. Please check manually.';
          }
        }
        
        // Refresh data to show updates and trigger payment aggregation
        if (wasStatusChangedToPaid || wasStatusChangedToPending) {
          setTimeout(async () => {
            try {
              // Refresh all data including payments, invoices, and patients
              await initializeFirebaseData();
              console.log('✅ Data refreshed - updated records should now be visible');
              
              // Force refresh appointments specifically to trigger real-time updates
              await forceRefreshAppointments();
              console.log('✅ Appointments refreshed - payment aggregation will be updated');
              
            } catch (refreshError) {
              console.error('❌ Error refreshing data:', refreshError);
            }
          }, 1000);
        }
        
        // Close modal
        setShowEditModal(false);
        setEditingAppointment(null);

        // Show appropriate success message
        let successMessage = updateResult.message || 'Appointment updated successfully!';
        if (finalPaymentStatus === 'Paid' && editFormData.paymentStatus !== 'Paid' && editFormData.paymentMode !== 'Pay at Hospital') {
          successMessage += '\n\nPayment status automatically set to "Paid" based on payment mode and appointment status.';
        }
        
        // Add invoice generation message
        successMessage += invoiceMessage;

        Alert.alert('Success', successMessage);
        
        // Force refresh global context for dashboard updates
        // Local appointments will be updated automatically by real-time listener
        setTimeout(async () => {
          console.log('🔄 Force refreshing global appointment data for dashboards...');
          await forceRefreshAppointments();
          console.log('✅ Global appointment data refreshed - dashboards updated');
        }, 500);
      } else {
        throw new Error('Firebase update failed');
      }

    } catch (error) {
      console.error('❌ Error updating appointment:', error);
      
      // Close modal on error
      setShowEditModal(false);
      setEditingAppointment(null);
      
      // Show user-friendly error message
      let errorMessage = 'Failed to update appointment';
      if (error.message.includes('No document to update')) {
        errorMessage = 'Appointment not found in database. It may have been deleted or moved.';
      }
      
      Alert.alert('Error', errorMessage);
      
      // Refresh data to ensure consistency
      fetchAppointments();
    }
  };

  // Enhanced Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    status: '',
    paymentMode: '',
    paymentStatus: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  const handleQuickEditStatus = (appointment) => {
    setEditingAppointment(appointment);
    setEditFormData({
      status: appointment.status || 'Pending',
      paymentMode: appointment.paymentMode || 'Pay at Hospital',
      paymentStatus: appointment.paymentStatus || 'Pending',
      appointmentDate: appointment.appointmentDate || '',
      appointmentTime: appointment.appointmentTime || '',
      reason: appointment.symptoms || '',
      notes: ''
    });
    setShowEditModal(true);
  };

  const updateAppointmentStatus = async (appointmentId, status, color) => {
    try {
      // Update locally first for immediate UI feedback
      setAppointmentsList(prev => 
        prev.map(appointment => 
          appointment.id === appointmentId 
            ? { ...appointment, status, statusColor: color }
            : appointment
        )
      );

      // TODO: Implement Firebase status update when updateAppointment method is available
      // await FirebaseAppointmentService.updateAppointment(appointmentId, { status });

      Alert.alert('Success', `Appointment status updated to ${status}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Revert the local change if Firebase update fails
      fetchAppointments();
      Alert.alert('Error', 'Failed to update appointment status');
    }
  };

  const StatsCard = ({ title, value, subtitle, icon, color }) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
        {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const AppointmentCard = ({ appointment }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.patientInfo}>
          <View style={[styles.avatar, { backgroundColor: Colors.kbrBlue }]}>
            <Text style={styles.avatarText}>{appointment.avatar}</Text>
          </View>
          <View style={styles.patientDetails}>
            <View style={styles.patientNameRow}>
              <Text style={styles.patientName}>{appointment.patientName}</Text>
              {appointment.isNewPatient && (
                <View style={styles.newPatientBadge}>
                  <Text style={styles.newPatientText}>NEW</Text>
                </View>
              )}
            </View>
            <Text style={styles.patientId}>{appointment.patientId}</Text>
            <Text style={styles.patientMeta}>
              {appointment.patientAge}yrs • {appointment.patientGender} • {appointment.patientPhone}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: appointment.statusColor }]}>
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.appointmentRow}>
          <View style={styles.appointmentItem}>
            <Ionicons name="person" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.doctorName}</Text>
          </View>
          <View style={styles.appointmentItem}>
            <Ionicons name="medical" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.department}</Text>
          </View>
        </View>

        <View style={styles.appointmentRow}>
          <View style={styles.appointmentItem}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.appointmentDate}</Text>
          </View>
          <View style={styles.appointmentItem}>
            <Ionicons name="time" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentText}>{appointment.appointmentTime}</Text>
          </View>
        </View>

        <View style={styles.serviceRow}>
          <View style={styles.serviceItem}>
            <Ionicons name="clipboard" size={16} color={Colors.kbrBlue} />
            <Text style={styles.serviceText}>{appointment.service}</Text>
          </View>
          <View style={styles.feeItem}>
            <Ionicons name="cash" size={16} color={Colors.kbrGreen} />
            <Text style={styles.feeText}>₹{appointment.fees}</Text>
            <Text style={[styles.paymentStatus, { 
              color: appointment.paymentStatus === 'Paid' ? Colors.kbrGreen : 
                     appointment.paymentStatus === 'Pending' ? Colors.kbrPurple : Colors.kbrRed 
            }]}>
              • {appointment.paymentStatus}
            </Text>
          </View>
        </View>

        {appointment.symptoms && (
          <View style={styles.symptomsContainer}>
            <Text style={styles.symptomsLabel}>Symptoms:</Text>
            <Text style={styles.symptomsText}>{appointment.symptoms}</Text>
          </View>
        )}

        <View style={styles.bookingInfo}>
          <Text style={styles.bookingText}>Booked on: {appointment.bookingDate}</Text>
        </View>
      </View>

      <View style={styles.appointmentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewAppointment(appointment)}
        >
          <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        {/* Edit Status Button - Next to View */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleQuickEditStatus(appointment)}
        >
          <Ionicons name="create" size={16} color={Colors.kbrPurple} />
          <Text style={[styles.actionText, { color: Colors.kbrPurple }]}>Edit</Text>
        </TouchableOpacity>
        
        {/* Admit Button - only for non-admitted appointments */}
        {appointment.status !== 'Admitted' && appointment.status !== 'Completed' && appointment.status !== 'Cancelled' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAdmitPatient(appointment)}
          >
            <Ionicons name="bed" size={16} color={Colors.kbrBlue} />
            <Text style={[styles.actionText, { color: Colors.kbrBlue }]}>Admit</Text>
          </TouchableOpacity>
        )}
        
        {/* Payment-based confirmation for Pay at Hospital */}
        {appointment.status === 'Pending' && appointment.paymentMode === 'Pay at Hospital' && (
          <>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleConfirmPayment(appointment.id)}
            >
              <Ionicons name="checkmark" size={16} color={Colors.kbrGreen} />
              <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleCancelAppointment(appointment.id)}
            >
              <Ionicons name="close" size={16} color={Colors.kbrRed} />
              <Text style={[styles.actionText, { color: Colors.kbrRed }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {/* Auto-confirmed for online payments */}
        {appointment.status === 'Pending' && appointment.paymentMode === 'Online' && (
          <View style={styles.autoConfirmedBadge}>
            <Text style={styles.autoConfirmedText}>Auto-confirmed</Text>
          </View>
        )}
        
        {(appointment.status === 'Confirmed' || appointment.status === 'Admitted') && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleCompleteAppointment(appointment.id)}
          >
            <Ionicons name="checkmark-done" size={16} color={Colors.kbrPurple} />
            <Text style={[styles.actionText, { color: Colors.kbrPurple }]}>Complete</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleCall(appointment.patientPhone)}
        >
          <Ionicons name="call" size={16} color={Colors.kbrGreen} />
          <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={true} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <AppHeader 
          title="Appointment Management"
          subtitle="Manage patient appointments and schedules"
          showBackButton={true}
          useSimpleAdminHeader={true}
          navigation={navigation}
        />

        {/* Sticky Filters - Positioned at top for easy access */}
        <View style={styles.stickyFiltersContainer}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search appointments, patients, doctors..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {statuses.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  selectedStatus === status && styles.activeFilterTab
                ]}
                onPress={() => setSelectedStatus(status)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedStatus === status && styles.activeFilterTabText
                ]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
            {dateFilters.map((date) => (
              <TouchableOpacity
                key={date}
                style={[
                  styles.filterTab,
                  selectedDate === date && styles.activeFilterTab
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.filterTabText,
                  selectedDate === date && styles.activeFilterTabText
                ]}>
                  {date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      {/* Main Content - Use FlatList with header to avoid nested scroll */}
      {!loading && !error ? (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <AppointmentCard appointment={item} />}
          contentContainerStyle={styles.appointmentsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchAppointments}
              colors={[Colors.kbrBlue]}
              tintColor={Colors.kbrBlue}
            />
          }
          ListHeaderComponent={() => (
            <View style={styles.listHeaderContainer}>
              {/* Statistics Cards */}
              <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                  <StatsCard
                    title="Total"
                    value={appointmentStats.totalAppointments}
                    subtitle="All appointments"
                    icon="calendar"
                    color={Colors.kbrBlue}
                  />
                  <StatsCard
                    title="Today"
                    value={appointmentStats.todayAppointments}
                    subtitle="Scheduled today"
                    icon="today"
                    color={Colors.kbrGreen}
                  />
                </View>
                <View style={styles.statsRow}>
                  <StatsCard
                    title="Confirmed"
                    value={appointmentStats.confirmedAppointments}
                    subtitle="Ready to serve"
                    icon="checkmark-circle"
                    color={Colors.kbrPurple}
                  />
                  <StatsCard
                    title="Admitted"
                    value={appointmentStats.admittedAppointments}
                    subtitle="In hospital"
                    icon="medical"
                    color="#059669"
                  />
                </View>
                <View style={styles.statsRow}>
                  <StatsCard
                    title="Pending"
                    value={appointmentStats.pendingAppointments}
                    subtitle="Need confirmation"
                    icon="time"
                    color={Colors.kbrRed}
                  />
                  <StatsCard
                    title="Completed"
                    value={appointmentStats.completedAppointments}
                    subtitle="Finished"
                    icon="checkmark-done-circle"
                    color={Colors.kbrGreen}
                  />
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No appointments found</Text>
              <Text style={styles.emptySubtext}>Add a new appointment to get started</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.content}>
          {/* Loading and Error States */}
          {loading && (
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading appointments...</Text>
            </View>
          )}

          {error && !loading && (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchAppointments}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingActionButton}
        onPress={handleAddAppointment}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        visible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        appointment={selectedAppointment}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Add New Appointment Modal */}
      <AddAppointmentModal
        visible={showAddAppointmentModal}
        onClose={() => setShowAddAppointmentModal(false)}
        onSuccess={handleAddAppointmentSuccess}
      />

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <Modal
          visible={showAppointmentDetailModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAppointmentDetailModal(false)}
        >
          <View style={styles.detailModalOverlay}>
            <View style={styles.detailModalContent}>
              <View style={styles.detailModalHeader}>
                <Text style={styles.detailModalTitle}>Appointment Details</Text>
                <TouchableOpacity 
                  style={styles.detailCloseButton} 
                  onPress={() => setShowAppointmentDetailModal(false)}
                >
                  <Ionicons name="close" size={28} color={Colors.kbrBlue} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.detailModalBody}>
                {/* Patient Overview */}
                <View style={styles.detailPatientHeader}>
                  <View style={[styles.avatar, { backgroundColor: Colors.kbrBlue }]}>
                    <Text style={styles.avatarText}>{selectedAppointment.avatar}</Text>
                  </View>
                  <View style={styles.detailPatientInfo}>
                    <Text style={styles.detailPatientName}>{selectedAppointment.patientName}</Text>
                    <Text style={styles.detailPatientId}>{selectedAppointment.patientId}</Text>
                    <Text style={styles.detailPatientMeta}>
                      {selectedAppointment.patientAge}yrs • {selectedAppointment.patientGender}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: selectedAppointment.statusColor }]}>
                    <Text style={styles.statusText}>{selectedAppointment.status}</Text>
                  </View>
                </View>
                
                {/* Appointment Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Appointment Information</Text>
                  <View style={styles.detailSectionContent}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Date</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.appointmentDate}</Text>
                      </View>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Time</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.appointmentTime}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Doctor</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.doctorName}</Text>
                      </View>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Department</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.department}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.detailFullRow}>
                      <Text style={styles.detailLabel}>Service</Text>
                      <Text style={styles.detailValue}>{selectedAppointment.service}</Text>
                    </View>
                    
                    {selectedAppointment.symptoms && (
                      <View style={styles.detailFullRow}>
                        <Text style={styles.detailLabel}>Symptoms</Text>
                        <View style={styles.detailSymptomsBox}>
                          <Text style={styles.detailValue}>{selectedAppointment.symptoms}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Payment Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Payment Information</Text>
                  <View style={styles.detailSectionContent}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Amount</Text>
                        <Text style={styles.detailValue}>₹{selectedAppointment.fees}</Text>
                      </View>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <Text style={[styles.detailValue, { 
                          color: selectedAppointment.paymentStatus === 'Paid' ? Colors.kbrGreen : 
                                selectedAppointment.paymentStatus === 'Pending' ? Colors.kbrPurple : Colors.kbrRed 
                        }]}>
                          {selectedAppointment.paymentStatus}
                        </Text>
                      </View>
                    </View>
                    
                    {selectedAppointment.paymentMode && (
                      <View style={styles.detailFullRow}>
                        <Text style={styles.detailLabel}>Payment Mode</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.paymentMode}</Text>
                      </View>
                    )}
                    
                    {selectedAppointment.transactionId && (
                      <View style={styles.detailFullRow}>
                        <Text style={styles.detailLabel}>Transaction ID</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.transactionId}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Contact Information */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Contact Information</Text>
                  <View style={styles.detailSectionContent}>
                    <View style={styles.detailFullRow}>
                      <Text style={styles.detailLabel}>Phone Number</Text>
                      <View style={styles.detailPhoneRow}>
                        <Text style={styles.detailValue}>{selectedAppointment.patientPhone}</Text>
                        <TouchableOpacity
                          style={styles.detailCallButton}
                          onPress={() => handleCall(selectedAppointment.patientPhone)}
                        >
                          <Ionicons name="call" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {selectedAppointment.patientAddress && (
                      <View style={styles.detailFullRow}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>{selectedAppointment.patientAddress}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.detailActions}>
                  <TouchableOpacity
                    style={[styles.detailActionButton, { backgroundColor: Colors.kbrPurple }]}
                    onPress={() => {
                      setShowAppointmentDetailModal(false);
                      handleQuickEditStatus(selectedAppointment);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.detailActionButtonText}>Update Status</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.detailActionButton, { backgroundColor: Colors.kbrBlue }]}
                    onPress={() => {
                      setShowAppointmentDetailModal(false);
                      handleAdmitPatient(selectedAppointment);
                    }}
                  >
                    <Ionicons name="bed-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.detailActionButtonText}>Admit Patient</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Enhanced Edit Appointment Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.editModalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>Edit Appointment</Text>
              <TouchableOpacity 
                style={styles.editCloseButton} 
                onPress={() => setShowEditModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.kbrBlue} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editModalBody}>
              {/* Patient Info Header */}
              {editingAppointment && (
                <View style={styles.editPatientHeader}>
                  <View style={[styles.avatar, { backgroundColor: Colors.kbrBlue }]}>
                    <Text style={styles.avatarText}>{editingAppointment.avatar}</Text>
                  </View>
                  <View style={styles.editPatientInfo}>
                    <Text style={styles.editPatientName}>{editingAppointment.patientName}</Text>
                    <Text style={styles.editPatientId}>{editingAppointment.patientId}</Text>
                  </View>
                </View>
              )}

              {/* Status Selection */}
              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Appointment Status</Text>
                <View style={styles.editStatusContainer}>
                  {['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Reschedule', 'Close'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.editStatusButton,
                        editFormData.status === status && styles.editStatusButtonActive
                      ]}
                      onPress={() => setEditFormData({...editFormData, status})}
                    >
                      <Text style={[
                        styles.editStatusButtonText,
                        editFormData.status === status && styles.editStatusButtonTextActive
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Payment Information */}
              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Payment Information</Text>
                
                {/* Payment Mode */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editSubLabel}>Payment Mode</Text>
                  <View style={styles.editPaymentModes}>
                    {['Cash', 'UPI', 'Card', 'Pay at Hospital', 'Online'].map((mode) => (
                      <TouchableOpacity
                        key={mode}
                        style={[
                          styles.editPaymentModeButton,
                          editFormData.paymentMode === mode && styles.editPaymentModeButtonActive
                        ]}
                        onPress={() => setEditFormData({...editFormData, paymentMode: mode})}
                      >
                        <Text style={[
                          styles.editPaymentModeText,
                          editFormData.paymentMode === mode && styles.editPaymentModeTextActive
                        ]}>
                          {mode}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Payment Status */}
                <View style={styles.editInputGroup}>
                  <Text style={styles.editSubLabel}>Payment Status</Text>
                  <View style={styles.editPaymentStatus}>
                    {['Pending', 'Paid', 'Refunded'].map((payStatus) => (
                      <TouchableOpacity
                        key={payStatus}
                        style={[
                          styles.editPaymentStatusButton,
                          editFormData.paymentStatus === payStatus && styles.editPaymentStatusButtonActive
                        ]}
                        onPress={() => setEditFormData({...editFormData, paymentStatus: payStatus})}
                      >
                        <Text style={[
                          styles.editPaymentStatusText,
                          editFormData.paymentStatus === payStatus && styles.editPaymentStatusTextActive
                        ]}>
                          {payStatus}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  {/* Smart Payment Logic Indicator */}
                  {(['Cash', 'UPI', 'Card'].includes(editFormData.paymentMode) && 
                    ['Confirmed', 'Completed'].includes(editFormData.status)) && (
                    <View style={styles.smartPaymentIndicator}>
                      <Ionicons name="information-circle" size={16} color={Colors.kbrBlue} />
                      <Text style={styles.smartPaymentText}>
                        Payment status will be automatically set to "Paid" for this payment mode and status combination.
                      </Text>
                    </View>
                  )}
                  
                  {/* Pay at Hospital Warning */}
                  {editFormData.paymentMode === 'Pay at Hospital' && (
                    <View style={[styles.smartPaymentIndicator, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                      <Ionicons name="warning" size={16} color="#F59E0B" />
                      <Text style={[styles.smartPaymentText, { color: '#92400E' }]}>
                        "Pay at Hospital" means payment is NOT received yet. Keep status as "Pending" until patient pays at reception.
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Reschedule Section (only show if Reschedule is selected) */}
              {editFormData.status === 'Reschedule' && (
                <View style={styles.editSection}>
                  <Text style={styles.editLabel}>Reschedule Details</Text>
                  
                  <View style={styles.editInputGroup}>
                    <Text style={styles.editSubLabel}>New Date</Text>
                    <TextInput
                      style={styles.editTextInput}
                      placeholder="YYYY-MM-DD"
                      value={editFormData.appointmentDate}
                      onChangeText={(text) => setEditFormData({...editFormData, appointmentDate: text})}
                    />
                  </View>

                  <View style={styles.editInputGroup}>
                    <Text style={styles.editSubLabel}>New Time</Text>
                    <TextInput
                      style={styles.editTextInput}
                      placeholder="HH:MM AM/PM"
                      value={editFormData.appointmentTime}
                      onChangeText={(text) => setEditFormData({...editFormData, appointmentTime: text})}
                    />
                  </View>
                </View>
              )}

              {/* Reason/Notes */}
              <View style={styles.editSection}>
                <Text style={styles.editLabel}>Reason/Notes</Text>
                <TextInput
                  style={styles.editTextArea}
                  placeholder="Add reason for changes or additional notes..."
                  multiline
                  numberOfLines={4}
                  value={editFormData.notes}
                  onChangeText={(text) => setEditFormData({...editFormData, notes: text})}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={styles.editCancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.editCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editSaveButton}
                  onPress={() => handleSaveEditChanges()}
                >
                  <Text style={styles.editSaveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8, // Reduced top padding since filters are now sticky
  },
  listHeaderContainer: {
    paddingBottom: 0,
  },
  stickyFiltersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingActionButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.kbrBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsIcon: {
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statsTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterTabs: {
    marginBottom: 6,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterTab: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  filterTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  appointmentsList: {
    paddingBottom: 100, // Extra padding to ensure content isn't hidden behind floating button
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientDetails: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  newPatientBadge: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  newPatientText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientId: {
    fontSize: 12,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginTop: 2,
  },
  patientMeta: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appointmentText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    marginLeft: 6,
    fontWeight: '500',
  },
  feeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeText: {
    fontSize: 12,
    color: Colors.kbrGreen,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  paymentStatus: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  symptomsContainer: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  symptomsLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  symptomsText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  bookingInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookingText: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: Colors.kbrBlue,
    marginLeft: 4,
    fontWeight: '500',
  },
  autoConfirmedBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  autoConfirmedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '600',
  },
  // Modal Styles
  detailModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  detailModalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailModalTitle: {
    fontSize: 18,
    color: Colors.kbrDarkBlue,
    fontWeight: 'bold',
  },
  detailCloseButton: {
    padding: 4,
  },
  detailModalBody: {
    padding: 16,
    maxHeight: '80%',
  },
  detailPatientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailPatientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailPatientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.kbrDarkBlue,
    marginBottom: 2,
  },
  detailPatientId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailPatientMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    color: Colors.kbrDarkBlue,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailSectionContent: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailColumn: {
    flex: 1,
    paddingHorizontal: 4,
  },
  detailFullRow: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  detailSymptomsBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    padding: 8,
  },
  detailPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailCallButton: {
    backgroundColor: Colors.kbrGreen,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  detailActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  detailActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 0.48,
  },
  detailActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Loading and Error States
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.kbrRed,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  // Enhanced Edit Modal Styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModalContent: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editModalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  editModalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  editCloseButton: {
    padding: 4,
  },
  editModalBody: {
    padding: 16,
    maxHeight: '85%',
  },
  editPatientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  editPatientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  editPatientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.kbrDarkBlue,
  },
  editPatientId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.kbrDarkBlue,
    marginBottom: 12,
  },
  editSubLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  editStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  editStatusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: 80,
    alignItems: 'center',
  },
  editStatusButtonActive: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  editStatusButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  editStatusButtonTextActive: {
    color: '#FFFFFF',
  },
  editInputGroup: {
    marginBottom: 16,
  },
  editPaymentModes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  editPaymentModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  editPaymentModeButtonActive: {
    backgroundColor: Colors.kbrGreen,
    borderColor: Colors.kbrGreen,
  },
  editPaymentModeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  editPaymentModeTextActive: {
    color: '#FFFFFF',
  },
  editPaymentStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  editPaymentStatusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    flex: 1,
    alignItems: 'center',
  },
  editPaymentStatusButtonActive: {
    backgroundColor: Colors.kbrPurple,
    borderColor: Colors.kbrPurple,
  },
  editPaymentStatusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  editPaymentStatusTextActive: {
    color: '#FFFFFF',
  },
  editTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  editTextArea: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  editCancelButton: {
    flex: 0.45,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  editCancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  editSaveButton: {
    flex: 0.45,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.kbrBlue,
    alignItems: 'center',
  },
  editSaveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  smartPaymentIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EEF2FF',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  smartPaymentText: {
    fontSize: 11,
    color: Colors.kbrBlue,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
});

export default AppointmentManagementScreen;