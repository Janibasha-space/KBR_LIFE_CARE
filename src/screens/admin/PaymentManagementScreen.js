import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Alert,
  StatusBar,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';
import AddPaymentModal from '../../components/AddPaymentModal';
import AppHeader from '../../components/AppHeader';

const PaymentManagementScreen = ({ navigation }) => {
  const { patients, appointments, getAllPendingPayments, payments, addPayment, addPatient, updatePayment, updatePaymentStatus, updatePaymentStatusAndSync, generateInvoiceForPayment, deletePayment, initializeFirebaseData, addInvoice, setAppState, syncMissingPaymentsFromInvoices, invoices } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPaymentForUpdate, setSelectedPaymentForUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aggregatedPayments, setAggregatedPayments] = useState([]);
  const flatListRef = React.useRef(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    amount: '',
    type: 'consultation',
    paymentMethod: 'cash',
    description: '',
    transactionId: '',
  });

  // Load payments data when component mounts
  useEffect(() => {
    const loadPaymentsData = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Firebase data to ensure payments are loaded
        if (initializeFirebaseData) {
          await initializeFirebaseData();
        }
        
      } catch (error) {
        console.error('❌ Error loading payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentsData();
    
    // Set up periodic background refresh to keep data fresh
    // This helps ensure any changes made by other users are reflected
    const backgroundRefreshInterval = setInterval(() => {
      console.log('🔄 Running background refresh...');
      if (initializeFirebaseData) {
        initializeFirebaseData()
          .then(() => console.log('✅ Background refresh completed'))
          .catch(err => console.error('⚠️ Background refresh error:', err));
      }
    }, 60000); // Refresh every 60 seconds
    
    return () => {
      // Clean up interval on component unmount
      clearInterval(backgroundRefreshInterval);
    };
  }, []);

  // Load aggregated payments function - moved outside useEffect to be accessible globally
  const loadAggregatedPayments = async () => {
    try {
      const allPayments = await aggregateAllPayments();
      setAggregatedPayments(allPayments);
      
      // Also update the app state with aggregated payments for revenue calculation
      if (setAppState) {
        console.log(`🔄 Updating AppContext aggregatedPayments with ${allPayments.length} payments`);
        setAppState(prev => ({
          ...prev,
          aggregatedPayments: allPayments, // Store aggregated payments for revenue calculation
        }));
        console.log('✅ AppContext aggregatedPayments updated successfully');
      } else {
        console.warn('⚠️ setAppState is not available - aggregated payments not stored in AppContext');
      }
    } catch (error) {
      console.error('❌ Error loading aggregated payments:', error);
      setAggregatedPayments(payments || []);
    }
  };

  // Load aggregated payments when payments, appointments, or patients change
  useEffect(() => {
    loadAggregatedPayments();
  }, [payments, appointments, patients]);

  // Separate useEffect for one-time payment sync when invoices are first loaded
  useEffect(() => {
    let syncTimer;
    
    const performSync = () => {
      if (syncMissingPaymentsFromInvoices && invoices && invoices.length > 0 && patients && patients.length > 0) {
        console.log('🔄 One-time sync of missing payments from invoices...');
        syncMissingPaymentsFromInvoices();
      }
    };
    
    // Debounce the sync to prevent multiple calls
    if (invoices && invoices.length > 0) {
      syncTimer = setTimeout(performSync, 1000); // Wait 1 second before syncing
    }
    
    return () => {
      if (syncTimer) {
        clearTimeout(syncTimer);
      }
    };
  }, [invoices?.length]); // Only trigger when invoices count changes

  // Refresh payments when screen comes into focus
  // Function to scroll to top of payment list
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // Function to aggregate all payment types from different sources
  const aggregateAllPayments = async () => {
    try {
      console.log('🔄 Aggregating payments from all sources...');
      
      // Get existing payments from the payments collection
      const existingPayments = payments || [];
      console.log(`💰 Found ${existingPayments.length} payments from payments collection`);

      // Get appointment payments (OP payments)
      const appointmentPayments = [];
      if (appointments && appointments.length > 0) {
        appointments.forEach(appointment => {
          if (appointment.paymentStatus && appointment.amount > 0) {
            appointmentPayments.push({
              id: `appointment-${appointment.id}`,
              patientId: appointment.patientId,
              patientName: appointment.patientName,
              amount: appointment.amount || appointment.totalAmount || appointment.consultationFee,
              totalAmount: appointment.amount || appointment.totalAmount || appointment.consultationFee,
              paidAmount: appointment.paymentStatus === 'Paid' ? (appointment.amount || appointment.totalAmount || appointment.consultationFee) : 0,
              dueAmount: appointment.paymentStatus === 'Paid' ? 0 : (appointment.amount || appointment.totalAmount || appointment.consultationFee),
              status: appointment.paymentStatus === 'Paid' ? 'paid' : 'pending',
              paymentStatus: appointment.paymentStatus,
              type: 'appointment',
              serviceType: 'OP', // Out-Patient
              description: `Appointment - ${appointment.serviceName || appointment.doctorName}`,
              paymentMethod: appointment.paymentMethod || appointment.paymentMode || 'cash',
              appointmentDate: appointment.appointmentDate || appointment.date,
              doctorName: appointment.doctorName,
              serviceName: appointment.serviceName,
              tokenNumber: appointment.tokenNumber,
              createdAt: appointment.createdAt || appointment.date,
              updatedAt: appointment.updatedAt
            });
          }
        });
      }
      console.log(`🏥 Found ${appointmentPayments.length} appointment payments (OP)`);

      // Get admission payments (IP payments)
      const admissionPayments = [];
      if (patients && patients.length > 0) {
        patients.forEach(patient => {
          // Check if patient has payment information (from Patient Management)
          if (patient.paymentDetails && patient.paymentDetails.totalAmount > 0) {
            admissionPayments.push({
              id: `admission-${patient.id}`,
              patientId: patient.id,
              patientName: patient.name,
              amount: patient.paymentDetails.totalAmount,
              totalAmount: patient.paymentDetails.totalAmount,
              paidAmount: patient.paymentDetails.totalPaid || 0,
              dueAmount: patient.paymentDetails.dueAmount || 0,
              status: (patient.paymentDetails.dueAmount || 0) <= 0 ? 'paid' : 
                     (patient.paymentDetails.totalPaid || 0) > 0 ? 'partial' : 'pending',
              paymentStatus: (patient.paymentDetails.dueAmount || 0) <= 0 ? 'Paid' : 
                           (patient.paymentDetails.totalPaid || 0) > 0 ? 'Partially Paid' : 'Pending',
              type: 'admission',
              serviceType: 'IP', // In-Patient
              description: `${patient.patientType || 'IP'} Patient - ${patient.department || 'General Ward'}`,
              paymentMethod: patient.paymentDetails.payments && patient.paymentDetails.payments.length > 0 
                           ? patient.paymentDetails.payments[patient.paymentDetails.payments.length - 1].method
                           : 'cash',
              admissionDate: patient.admissionDate || patient.registrationDate,
              department: patient.department,
              roomNumber: patient.roomNumber || patient.room,
              createdAt: patient.registrationDate || patient.createdAt,
              updatedAt: patient.paymentDetails.lastPaymentDate || patient.updatedAt,
              patientType: patient.patientType,
              doctor: patient.doctor,
              // Include payment history for detailed view
              paymentHistory: patient.paymentDetails.payments || []
            });
          }
          // Also check for legacy format (backward compatibility)
          else if (patient.admissionDate && patient.totalBill > 0) {
            admissionPayments.push({
              id: `admission-legacy-${patient.id}`,
              patientId: patient.id,
              patientName: patient.name,
              amount: patient.totalBill,
              totalAmount: patient.totalBill,
              paidAmount: patient.paidAmount || 0,
              dueAmount: (patient.totalBill || 0) - (patient.paidAmount || 0),
              status: (patient.paidAmount || 0) >= (patient.totalBill || 0) ? 'paid' : 
                     (patient.paidAmount || 0) > 0 ? 'partial' : 'pending',
              paymentStatus: (patient.paidAmount || 0) >= (patient.totalBill || 0) ? 'Paid' : 
                           (patient.paidAmount || 0) > 0 ? 'Partially Paid' : 'Pending',
              type: 'admission',
              serviceType: 'IP', // In-Patient
              description: `Admission - ${patient.department || 'General Ward'}`,
              paymentMethod: patient.paymentMethod || 'cash',
              admissionDate: patient.admissionDate,
              department: patient.department,
              roomNumber: patient.roomNumber,
              createdAt: patient.admissionDate,
              updatedAt: patient.updatedAt || patient.admissionDate
            });
          }
        });
      }
      console.log(`🏨 Found ${admissionPayments.length} admission payments (IP)`);
      
      // Debug: Log patient data for troubleshooting
      if (patients && patients.length > 0) {
        console.log(`👥 Processing ${patients.length} patients for IP payments:`);
        patients.forEach((patient, index) => {
          console.log(`  Patient #${index + 1}: ${patient.name} (${patient.id})`);
          console.log(`    - Has paymentDetails: ${!!patient.paymentDetails}`);
          if (patient.paymentDetails) {
            console.log(`    - Total Amount: ₹${patient.paymentDetails.totalAmount || 0}`);
            console.log(`    - Total Paid: ₹${patient.paymentDetails.totalPaid || 0}`);
            console.log(`    - Due Amount: ₹${patient.paymentDetails.dueAmount || 0}`);
            console.log(`    - Payment Count: ${patient.paymentDetails.payments?.length || 0}`);
          }
          console.log(`    - Patient Type: ${patient.patientType || 'Unknown'}`);
          console.log(`    - Department: ${patient.department || 'None'}`);
        });
      }

      // Get test/laboratory payments
      const testPayments = [];
      // Note: Test payments would come from a tests collection if it exists
      // For now, we'll check if any appointments have test-related services
      if (appointments && appointments.length > 0) {
        appointments.forEach(appointment => {
          if (appointment.type === 'test' || appointment.serviceName?.toLowerCase().includes('test') || 
              appointment.serviceName?.toLowerCase().includes('lab') || appointment.serviceName?.toLowerCase().includes('x-ray') ||
              appointment.serviceName?.toLowerCase().includes('scan') || appointment.serviceName?.toLowerCase().includes('blood')) {
            testPayments.push({
              id: `test-${appointment.id}`,
              patientId: appointment.patientId,
              patientName: appointment.patientName,
              amount: appointment.amount || appointment.totalAmount || appointment.consultationFee,
              totalAmount: appointment.amount || appointment.totalAmount || appointment.consultationFee,
              paidAmount: appointment.paymentStatus === 'Paid' ? (appointment.amount || appointment.totalAmount || appointment.consultationFee) : 0,
              dueAmount: appointment.paymentStatus === 'Paid' ? 0 : (appointment.amount || appointment.totalAmount || appointment.consultationFee),
              status: appointment.paymentStatus === 'Paid' ? 'paid' : 'pending',
              paymentStatus: appointment.paymentStatus,
              type: 'test',
              serviceType: 'TEST', // Test/Laboratory
              description: `Test - ${appointment.serviceName}`,
              paymentMethod: appointment.paymentMethod || appointment.paymentMode || 'cash',
              testDate: appointment.appointmentDate || appointment.date,
              testName: appointment.serviceName,
              doctorName: appointment.doctorName,
              createdAt: appointment.createdAt || appointment.date,
              updatedAt: appointment.updatedAt
            });
          }
        });
      }
      console.log(`🧪 Found ${testPayments.length} test payments`);

      // Combine all payment sources
      const allPayments = [
        ...existingPayments,
        ...appointmentPayments,
        ...admissionPayments,
        ...testPayments
      ];

      console.log(`📊 Total aggregated payments: ${allPayments.length} (${existingPayments.length} general + ${appointmentPayments.length} OP + ${admissionPayments.length} IP + ${testPayments.length} tests)`);
      
      return allPayments;
    } catch (error) {
      console.error('❌ Error aggregating payments:', error);
      return payments || []; // Fallback to existing payments
    }
  };

  // Function to manually refresh payments
  const refreshPayments = async () => {
    console.log('🔄 Manually refreshing payments...');
    setIsLoading(true);
    
    try {
      // Reset filters to show all payments
      setSelectedFilter('All');
      setSearchQuery('');
      
      // Scroll back to top for better UX
      scrollToTop();
      
      // Request payment refresh from context
      if (typeof initializeFirebaseData === 'function') {
        await initializeFirebaseData();
        console.log('✅ Payments refreshed successfully');
        
        // Double-check if payments are available but not showing
        setTimeout(() => {
          if (payments?.length > 0 && (filteredPayments?.length || 0) === 0) {
            console.warn('⚠️ Payments exist but not showing after refresh - forcing update');
            // Force state update to trigger rerender
            setAppState(prev => ({
              ...prev,
              payments: [...(prev.payments || [])]
            }));
          }
        }, 500);
      } else {
        console.warn('⚠️ No refresh function found');
        // Force re-render
        setAppState(prev => ({
          ...prev,
          payments: [...(prev.payments || [])]
        }));
      }
    } catch (error) {
      console.error('❌ Error refreshing payments:', error);
      Alert.alert(
        'Refresh Failed',
        'Unable to refresh payments. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };
  
  // Function to force rebuild the payment list
  const forceRebuildPaymentList = () => {
    console.log('🔨 Forcing payment list rebuild...');
    
    // Reset filters
    setSelectedFilter('All');
    setSearchQuery('');
    
    // Create a temporary loading state
    setIsLoading(true);
    
    // Force app state update to trigger rerender
    if (payments && payments.length > 0) {
      // Create a shallow copy with a new reference
      const paymentsCopy = [...payments];
      
      // Add a timestamp to make sure we get a new reference
      paymentsCopy.forEach(p => {
        if (p) p._forceRefresh = Date.now();
      });
      
      setAppState(prev => ({
        ...prev,
        payments: paymentsCopy
      }));
      
      console.log('✅ Forced payment list rebuild with', paymentsCopy.length, 'payments');
    }
    
    // Turn off loading after a short delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    refreshPayments();
  };
  
  useEffect(() => {
    console.log('Setting up focus listener for payment refresh');
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Payment screen focused - refreshing data');
      refreshPayments();
    });

    return unsubscribe;
  }, [navigation, initializeFirebaseData]);
  
  // Helper function to verify if payments should be visible
  const verifyPaymentsVisibility = () => {
    console.log('🔍 Verifying payment visibility:');
    console.log(`   - Raw payments: ${payments?.length || 0}`);
    console.log(`   - Transformed payments: ${paymentList?.length || 0}`);
    console.log(`   - Filtered payments: ${filteredPayments?.length || 0}`);
    console.log(`   - Filter: "${selectedFilter}"`);
    console.log(`   - Search: "${searchQuery}"`);
    
    // Check first few payments
    if (payments && payments.length > 0) {
      console.log('First payment:', {
        id: payments[0]?.id,
        patientName: payments[0]?.patientName,
        amount: payments[0]?.amount,
        status: payments[0]?.status || payments[0]?.paymentStatus
      });
    }
    
    // Check filter results
    if (paymentList && paymentList.length > 0) {
      const statuses = {};
      paymentList.forEach(p => {
        const status = p.status || p.paymentStatus || 'unknown';
        statuses[status] = (statuses[status] || 0) + 1;
      });
      console.log('Payment status distribution:', statuses);
    }
    
    // Show alert with payment counts
    Alert.alert(
      'Payment Data Diagnostic',
      `Raw payments: ${payments?.length || 0}
Transformed: ${paymentList?.length || 0}
Filtered: ${filteredPayments?.length || 0}
Filter: ${selectedFilter}
Search: "${searchQuery || 'none'}"`,
      [
        { text: 'Reset Filters', onPress: () => { setSelectedFilter('All'); setSearchQuery(''); }},
        { text: 'Force Rebuild', onPress: forceRebuildPaymentList },
        { text: 'Close', style: 'cancel' }
      ]
    );
    
    // Force UI refresh
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Set loading to false when payments are available
  useEffect(() => {
    if (payments) {
      console.log(`📊 Payments updated: ${payments.length} payments available`);
      setIsLoading(false);
      
      try {
        // Find any local payments
        const localPayments = (payments || []).filter(p => p && p.id && p.id.toString().startsWith('local-'));
        if (localPayments && localPayments.length > 0) {
          console.log(`🆕 Found ${localPayments.length} locally added payments`);
        }
      } catch (err) {
        console.error('Error processing payments:', err);
      }
    } else {
      console.log('⚠️ Payments array is undefined or null');
    }
  }, [payments]);
  
  // Debug log when payment list changes
  useEffect(() => {
    if (paymentList) {
      console.log(`📋 Payment list transformed: ${paymentList?.length || 0} payments available for display`);
      // Log statistics about payment statuses
      const statuses = (paymentList || []).reduce((acc, p) => {
        const status = p?.status || p?.paymentStatus || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Payment statuses:', statuses);
    }
  }, [paymentList]);
  
  // Debug when filtered payments change
  useEffect(() => {
    if (filteredPayments) {
      console.log(`🔍 Filtered payments: ${filteredPayments?.length || 0} payments after filtering`);
    }
  }, [filteredPayments]);

  // Calculate real-time payment statistics from actual payments data
  const paymentStats = useMemo(() => {
    // Use aggregatedPayments instead of payments for more accurate calculations
    const paymentsToUse = aggregatedPayments?.length > 0 ? aggregatedPayments : payments || [];
    const totalPayments = paymentsToUse.length;
    
    console.log(`📊 Payment stats calculating from ${totalPayments} payments (aggregated: ${aggregatedPayments?.length || 0}, direct: ${payments?.length || 0})`);
    
    // Calculate total revenue from actual amounts paid
    const totalRevenue = paymentsToUse.reduce((sum, payment) => {
      const actualPaid = payment.paidAmount || payment.actualAmountPaid || 
                        (payment.status === 'paid' ? payment.amount : 0) || 0;
      return sum + actualPaid;
    }, 0);
    
    // Calculate pending amounts using full amounts and due amounts
    const totalPending = paymentsToUse.reduce((sum, payment) => {
      const dueAmount = payment.dueAmount || 
                       (payment.totalAmount ? payment.totalAmount - (payment.paidAmount || 0) : 
                        payment.status === 'pending' ? payment.amount : 0) || 0;
      return sum + dueAmount;
    }, 0);
    
    const fullyPaidCount = paymentsToUse.filter(p => p.status === 'paid' || p.paymentStatus === 'Paid').length;
    const pendingCount = paymentsToUse.filter(p => p.status === 'pending' || p.paymentStatus === 'Pending').length;
    const partiallyPaidCount = paymentsToUse.filter(p => p.status === 'partial' || p.paymentStatus === 'Partially Paid').length;
    
    console.log(`💰 Payment stats calculated: Revenue=₹${totalRevenue}, Pending=₹${totalPending}, FullyPaid=${fullyPaidCount}, Partial=${partiallyPaidCount}`);

    return {
      totalRevenue,
      totalPending,
      fullyPaidCount,
      partiallyPaidCount,
      pendingCount,
      totalPatients: totalPayments,
    };
  }, [payments, aggregatedPayments]);

  // Transform actual payments data for display  
  const paymentList = useMemo(() => {
    try {
      // Use aggregated payments which includes all payment types
      const allPayments = aggregatedPayments.length > 0 ? aggregatedPayments : payments || [];
      
      // Safety check for undefined payments
      if (!allPayments) {
        console.log('❌ Payments array is undefined');
        return [];
      }
      
      // Ensure we always have data to work with
      if (allPayments.length === 0) {
        console.log('❌ No payments data available (empty array)');
        return [];
      }
      
      console.log(`📊 Processing ${allPayments.length} total payments (aggregated from all sources)`);
      
      // Enhanced deduplication with guaranteed unique keys
      const uniquePaymentsMap = new Map();
      (allPayments || []).forEach((payment, idx) => {
        if (!payment) return; // Skip undefined payments
        
        // Generate a truly unique key with multiple fallbacks
        let key;
        if (payment.id) {
          // Use original ID if available
          key = `${payment.id}`;
        } else if (payment.patientId && payment.date && payment.amount) {
          // Create composite key from available data
          key = `${payment.patientId}-${payment.date}-${payment.amount}-${idx}`;
        } else {
          // Fallback to index-based key with timestamp to ensure uniqueness
          key = `no-id-payment-${idx}-${Date.now()}`;
        }
        
        if (!uniquePaymentsMap.has(key)) {
          // Add index to payment object for stable reference
          uniquePaymentsMap.set(key, {
            ...payment,
            _uniqueIndex: idx // Add index for stable rendering
          });
        } else {
          console.log(`⚠️ Duplicate payment detected with key: ${key}, using indexed version`);
          // In case of duplicates, append the index to make it unique
          uniquePaymentsMap.set(`${key}-duplicate-${idx}`, {
            ...payment,
            _uniqueIndex: idx,
            _isDuplicate: true
          });
        }
      });
      const uniquePayments = Array.from(uniquePaymentsMap.values());

      const transformedPayments = uniquePayments.map((payment, index) => {
        if (!payment) return null; // Skip undefined payments
        
        // Find the corresponding patient for additional details
        const patient = patients?.find(p => p?.id === payment.patientId);
        
        // Generate truly unique stable key incorporating multiple unique factors
        // Use _uniqueIndex added during deduplication for extra stability
        const originalIndex = payment._uniqueIndex !== undefined ? payment._uniqueIndex : index;
        const uniqueKey = `payment-${payment.id || `temp-${originalIndex}`}-${originalIndex}`;
        
        // Check if this is a locally added payment (has a local- prefix or isLocalPayment flag)
        const isLocalPayment = 
          payment.isLocalPayment || 
          (payment.id && payment.id.toString().startsWith('local-')) || 
          payment.locallyAdded;
        
        // Track sync status
        const isPending = payment.pending === true;
        const hasSyncFailed = payment.syncFailed === true;
        
        // If a local payment, add to diagnostic log
        if (isLocalPayment) {
          console.log(`🆕 Processing locally added payment: ${payment.patientName} - ₹${payment.amount} - Status: ${isPending ? 'PENDING' : hasSyncFailed ? 'FAILED' : 'NEW'}`);
        }
        
        // For locally added payments, ensure we have proper styling/UX cues
        const localAdditionTime = isLocalPayment ? (
          payment.createdAt ? new Date(payment.createdAt) : new Date()
        ) : null;
        
        // Calculate time since addition - useful for "Added X minutes ago"
        const timeSinceAddition = localAdditionTime ? 
          Math.floor((new Date() - localAdditionTime) / (1000 * 60)) : null;
        
        // Default colors for status
        let statusColor = (payment.status === 'paid' || payment.paymentStatus === 'paid') ? '#10B981' : 
                        (payment.status === 'partial' || payment.paymentStatus === 'partial') ? '#F59E0B' : '#EF4444';
                        
        // Override status color for local payments
        if (isLocalPayment) {
          statusColor = hasSyncFailed ? '#EF4444' : isPending ? '#F59E0B' : '#10B981';
        }
        
        return {
          id: uniqueKey, // Use the uniqueKey as the primary identifier
          originalId: payment.id, // Store original ID for backend operations
          displayId: uniqueKey, // Stable display ID for UI
          paymentHash: `${payment.patientId || ''}-${payment.amount || 0}-${index}`, // Additional unique hash
          isLocalPayment, // Flag to identify locally added payments
          isPending, // Sync pending flag
          hasSyncFailed, // Sync failed flag
          syncedAt: payment.syncedAt, // When payment was synced with server
          
          // Patient information
          patientName: payment.patientName || 'Unknown Patient',
          patientId: payment.patientId || `unknown-${index}`,
          patientType: patient?.patientType || 'IP',
          
          // Payment amounts - FIXED to show correct payment amounts
          amount: payment.actualAmountPaid || payment.amount || payment.totalAmount || 1000, // Actual amount paid
          paymentStatus: payment.status || payment.paymentStatus || 'paid', // Add fallback
          totalAmount: payment.totalAmount || payment.fullAmount || payment.amount || 1000, // Full amount owed
          paidAmount: payment.totalPaid || (payment.totalAmount && payment.dueAmount ? payment.totalAmount - payment.dueAmount : payment.actualAmountPaid || payment.paidAmount || 0),
          dueAmount: payment.dueAmount || 0,
          
          // Status information
          status: isLocalPayment && hasSyncFailed ? 'Sync Failed' :
                isLocalPayment && isPending ? 'Syncing' :
                (payment.status === 'paid' || payment.paymentStatus === 'paid') ? 'Fully Paid' : 
                (payment.status === 'partial' || payment.paymentStatus === 'partial') ? 'Partially Paid' : 'Pending',
          
          statusColor,
          lastPaymentDate: payment.paymentDate || payment.date,
          paymentHistory: [payment], // Single payment record
          registrationDate: patient?.registrationDate,
          method: payment.method || payment.paymentMethod || 'cash',
          description: payment.description || '',
          
          // Local payment tracking for UI
          localAdditionTime: isLocalPayment ? localAdditionTime : null,
          timeSinceAddition: isLocalPayment ? timeSinceAddition : null,
          localIndicator: isLocalPayment ? 
            (hasSyncFailed ? 'Sync Failed - Tap to Retry' : 
            isPending ? 'Syncing with Server...' : 
            'Added ' + (timeSinceAddition < 1 ? 'just now' : timeSinceAddition + ' min ago')) : null,
          
          // Add index as another uniqueness factor for stable rendering
          index: index
        };
      })
      .filter(item => item !== null) // Remove any null items from mapping
      // Sort by local first (so new payments are at top), then by date
      .sort((a, b) => {
        try {
          // Local payments should be shown first
          if (a.isLocalPayment && !b.isLocalPayment) return -1;
          if (!a.isLocalPayment && b.isLocalPayment) return 1;
          
          // Then by date (newest first)
          return new Date(b.lastPaymentDate || b.registrationDate || 0) - 
                new Date(a.lastPaymentDate || a.registrationDate || 0);
        } catch (err) {
          console.error('❌ Error sorting payments:', err);
          return 0; // Default no change in order
        }
      });
      
      console.log('✅ Successfully transformed', transformedPayments.length, 'payments');
      return transformedPayments;
    } catch (error) {
      console.error('❌ Error transforming payments:', error);
      return []; // Return empty array to prevent crashes
    }
  }, [aggregatedPayments, payments, patients]);

  const filteredPayments = (paymentList || []).filter(payment => {
    // Search filtering
    const matchesSearch = !searchQuery || 
                         (payment.patientName && payment.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (payment.originalId && payment.originalId?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (payment.patientId && payment.patientId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status and Service Type filtering
    const paymentStatus = (payment.status || payment.paymentStatus || '').toLowerCase();
    let matchesFilter = false;
    
    if (selectedFilter === 'All') {
      matchesFilter = true; // Show all payments
    } 
    // Payment Status Filters
    else if (selectedFilter === 'Fully Paid') {
      matchesFilter = paymentStatus === 'fully paid' || paymentStatus === 'paid';
    } else if (selectedFilter === 'Partially Paid') {
      matchesFilter = paymentStatus === 'partially paid' || paymentStatus === 'partial';
    } else if (selectedFilter === 'Pending') {
      matchesFilter = paymentStatus === 'pending';
    } 
    // Service Type Filters
    else if (selectedFilter === 'OP Payments') {
      matchesFilter = payment.serviceType === 'OP' || payment.type === 'appointment';
    } else if (selectedFilter === 'IP Payments') {
      matchesFilter = payment.serviceType === 'IP' || payment.type === 'admission';
    } else if (selectedFilter === 'Test Payments') {
      matchesFilter = payment.serviceType === 'TEST' || payment.type === 'test';
    } else if (selectedFilter === 'General') {
      matchesFilter = !payment.serviceType || payment.serviceType === 'General' || payment.type === 'consultation';
    } 
    else {
      matchesFilter = paymentStatus === selectedFilter.toLowerCase();
    }
    
    console.log(`Filter check for ${payment.patientName}: Filter=${selectedFilter}, Status=${paymentStatus}, Matches=${matchesFilter}`);
    
    return matchesSearch && matchesFilter;
  });

  // Enhanced logging for debugging payment display issues
  console.log(`📊 Payments: ${paymentList?.length || 0} total → ${filteredPayments?.length || 0} filtered (${selectedFilter})`);
  console.log(`🔍 Search query: "${searchQuery || 'none'}"`);
  console.log(`🔄 Payment rendering state: isLoading=${isLoading}, refreshing=${refreshing}`);
  
  // If no payments show but we have data, log the issue
  if ((paymentList?.length || 0) > 0 && (filteredPayments?.length || 0) === 0 && selectedFilter === 'All') {
    console.warn('⚠️ WARNING: No payments showing with "All" filter, but payments exist');
    (paymentList || []).forEach(payment => {
      console.log(`   - ${payment.patientName || 'Unknown'}: "${payment.status || 'unknown'}"`);
    });
  }
  
  // Log raw payment data to help diagnose issues
  if (payments && payments.length > 0) {
    console.log('📝 First few raw payments:', 
      payments.slice(0, 2).map(p => ({ 
        id: p.id, 
        patientName: p.patientName, 
        amount: p.amount,
        status: p.status || p.paymentStatus
      }))
    );
  }

  const handleViewDetails = (payment) => {
    console.log('🔍 Looking for patient with payment data:', {
      paymentId: payment.id,
      patientId: payment.patientId,
      patientName: payment.patientName,
      patientPhone: payment.patientPhone,
      originalId: payment.originalId,
      appointmentId: payment.appointmentId
    });
    console.log('🔍 Available patients count:', patients.length);
    console.log('🔍 Sample patients:', patients.slice(0, 3).map(p => ({ 
      id: p.id, 
      name: p.name, 
      phone: p.phone || p.contactNumber,
      firebaseId: p.firebaseId || p.uid
    })));
    
    // Clean up payment name (remove trailing spaces)
    const cleanPaymentName = payment.patientName?.trim();
    
    // Method 1: Try exact patientId match
    let patient = patients.find(p => p.id === payment.patientId);
    if (patient) {
      console.log('✅ Found patient by ID match:', patient.name);
      navigation.navigate('PatientDetails', { patient });
      return;
    }
    
    // Method 2: Try Firebase UID/firebaseId match
    patient = patients.find(p => 
      p.firebaseId === payment.patientId || 
      p.uid === payment.patientId ||
      p.userId === payment.patientId
    );
    if (patient) {
      console.log('✅ Found patient by Firebase ID match:', patient.name);
      navigation.navigate('PatientDetails', { patient });
      return;
    }
    
    // Method 3: Try exact name match (case sensitive)
    patient = patients.find(p => p.name === cleanPaymentName);
    if (patient) {
      console.log('✅ Found patient by exact name match:', patient.name);
      navigation.navigate('PatientDetails', { patient });
      return;
    }
    
    // Method 4: Try case-insensitive name match
    patient = patients.find(p => 
      p.name?.toLowerCase() === cleanPaymentName?.toLowerCase()
    );
    if (patient) {
      console.log('✅ Found patient by case-insensitive name match:', patient.name);
      navigation.navigate('PatientDetails', { patient });
      return;
    }
    
    // Method 5: Try phone number match
    if (payment.patientPhone) {
      patient = patients.find(p => 
        p.phone === payment.patientPhone || 
        p.contactNumber === payment.patientPhone
      );
      if (patient) {
        console.log('✅ Found patient by phone match:', patient.name);
        navigation.navigate('PatientDetails', { patient });
        return;
      }
    }
    
    // Method 6: Try partial name matching
    patient = patients.find(p => {
      const patientName = p.name?.toLowerCase();
      const paymentName = cleanPaymentName?.toLowerCase();
      return (patientName && paymentName) && 
             (patientName.includes(paymentName) || paymentName.includes(patientName));
    });
    if (patient) {
      console.log('✅ Found patient by partial name match:', patient.name);
      navigation.navigate('PatientDetails', { patient });
      return;
    }
    
    // Method 7: Try fuzzy name matching (for typos like "Jyothi" vs "Jothi")
    patient = patients.find(p => {
      const patientName = p.name?.toLowerCase().replace(/[^a-z]/g, '');
      const paymentName = cleanPaymentName?.toLowerCase().replace(/[^a-z]/g, '');
      
      if (!patientName || !paymentName) return false;
      
      // Check if names are similar (allowing for 1-2 character differences)
      const minLength = Math.min(patientName.length, paymentName.length);
      const maxLength = Math.max(patientName.length, paymentName.length);
      
      // If length difference is too much, skip
      if (maxLength - minLength > 2) return false;
      
      // Check character similarity
      let matchingChars = 0;
      const shorterName = patientName.length <= paymentName.length ? patientName : paymentName;
      const longerName = patientName.length > paymentName.length ? patientName : paymentName;
      
      for (let i = 0; i < shorterName.length; i++) {
        if (longerName.includes(shorterName[i])) {
          matchingChars++;
        }
      }
      
      // If 80% or more characters match, consider it a match
      return (matchingChars / shorterName.length) >= 0.8;
    });
    if (patient) {
      console.log('✅ Found patient by fuzzy name match:', patient.name, '(for payment name:', cleanPaymentName, ')');
      Alert.alert(
        'Similar Patient Found',
        `Found similar patient "${patient.name}" for payment "${cleanPaymentName}".\n\nIs this the correct patient?`,
        [
          { text: 'No, Create New', onPress: () => {
            // Continue to show the create patient dialog
            console.log('User chose to create new patient instead of using similar match');
          }},
          { text: 'Yes, Use This Patient', onPress: () => {
            navigation.navigate('PatientDetails', { patient });
          }}
        ]
      );
      return;
    }
    
    // Method 8: Search in appointments data if patient not found in patients database
    console.log('🔍 Searching in appointments data...', appointments?.length || 0, 'appointments available');
    let appointmentPatient = null;
    
    if (appointments && appointments.length > 0) {
      // Try to find appointment with matching patient name
      const matchingAppointment = appointments.find(apt => 
        apt.patientName?.toLowerCase() === cleanPaymentName?.toLowerCase() ||
        apt.patientName?.toLowerCase().trim() === cleanPaymentName?.toLowerCase().trim()
      );
      
      if (matchingAppointment) {
        console.log('✅ Found matching appointment:', matchingAppointment);
        
        // Create a patient-like object from appointment data
        appointmentPatient = {
          id: matchingAppointment.patientId || matchingAppointment.id,
          name: matchingAppointment.patientName,
          phone: matchingAppointment.patientPhone || matchingAppointment.contactNumber,
          contactNumber: matchingAppointment.patientPhone || matchingAppointment.contactNumber,
          age: matchingAppointment.patientAge || '',
          gender: matchingAppointment.patientGender || '',
          assignedDoctor: matchingAppointment.doctorName,
          department: matchingAppointment.department,
          appointmentDate: matchingAppointment.appointmentDate || matchingAppointment.date,
          appointmentTime: matchingAppointment.appointmentTime || matchingAppointment.time,
          appointmentId: matchingAppointment.id,
          symptoms: matchingAppointment.symptoms,
          service: matchingAppointment.service,
          status: matchingAppointment.status,
          source: 'from-appointment-data'
        };
        
        console.log('✅ Created patient object from appointment data:', appointmentPatient.name);
        navigation.navigate('PatientDetails', { patient: appointmentPatient });
        return;
      }
    }
    
    // If still no patient found, show detailed error
    console.error('❌ Patient not found after all matching attempts');
    console.error('❌ Payment data:', { 
      patientId: payment.patientId, 
      patientName: payment.patientName,
      cleanedName: cleanPaymentName,
      patientPhone: payment.patientPhone,
      appointmentId: payment.appointmentId
    });
    console.error('❌ Available patient IDs:', patients.map(p => p.id));
    console.error('❌ Available patient names:', patients.map(p => p.name));
    
    // No patient found - show enhanced error dialog with auto-create option
    Alert.alert(
      'Patient Not Found', 
      `Patient "${cleanPaymentName}" (ID: ${payment.patientId}) was not found in the patient database.\n\nAvailable patients: ${patients.map(p => p.name).join(', ')}\n\nThis usually happens when:\n• Patient booked appointment but wasn't registered\n• Patient record was deleted\n• Name mismatch between payment and patient records\n\nWould you like to create a patient record automatically?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Show Payment Details', 
          onPress: () => {
            Alert.alert(
              'Payment Information',
              `Patient: ${cleanPaymentName}\nPatient ID: ${payment.patientId}\nOriginal ID: ${payment.originalId || 'N/A'}\nAppointment ID: ${payment.appointmentId || 'N/A'}\n\nAmount: ₹${payment.totalAmount || 0}\nPaid: ₹${payment.paidAmount || 0}\nDue: ₹${payment.dueAmount || 0}\nStatus: ${payment.status || 'Unknown'}\nMethod: ${payment.paymentMethod || 'Not specified'}\nPhone: ${payment.patientPhone || 'Not specified'}`,
              [{ text: 'OK' }]
            );
          }
        },
        {
          text: 'Auto-Create Patient',
          onPress: async () => {
            try {
              console.log('🏥 Auto-creating patient record for:', cleanPaymentName);
              
              // Create patient data from payment information
              const newPatientData = {
                name: cleanPaymentName,
                patientId: payment.patientId,
                phone: payment.patientPhone || '',
                contactNumber: payment.patientPhone || '',
                age: '',
                gender: '',
                bloodGroup: '',
                address: '',
                emergencyContact: '',
                assignedDoctor: payment.doctorName || '',
                department: payment.department || '',
                registrationDate: new Date().toISOString().split('T')[0],
                registrationTime: new Date().toLocaleTimeString('en-IN', { 
                  hour12: false, 
                  hour: '2-digit', 
                  minute: '2-digit'
                }),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                source: 'auto-created-from-payment'
              };
              
              // Use AppContext to add the patient
              if (addPatient) {
                const result = await addPatient(newPatientData);
                
                if (result && result.success) {
                  Alert.alert(
                    'Patient Created Successfully',
                    `Patient record for "${cleanPaymentName}" has been created.\n\nOpening patient details...`,
                    [{ 
                      text: 'OK', 
                      onPress: () => {
                        // Navigate to the newly created patient
                        const createdPatient = {
                          ...newPatientData,
                          id: result.patientId || payment.patientId
                        };
                        navigation.navigate('PatientDetails', { patient: createdPatient });
                      }
                    }]
                  );
                } else {
                  throw new Error(result?.error || 'Failed to create patient');
                }
              } else {
                throw new Error('addPatient function not available');
              }
              
            } catch (error) {
              console.error('❌ Error auto-creating patient:', error);
              Alert.alert(
                'Error Creating Patient',
                `Failed to create patient record: ${error.message}\n\nPlease create the patient manually from the Patients screen.`,
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
      console.error('❌ Patient not found. Payment data:', { 
        patientId: payment.patientId, 
        patientName: payment.patientName,
        cleanedName: cleanPaymentName
      });
      
      Alert.alert(
        'Patient Not Found', 
        `Could not find patient "${cleanPaymentName}" in the patient database.\n\nThis usually happens when a patient books an appointment but wasn't registered as a patient record.\n\nWould you like to create a patient record for this person?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Show Payment Only', 
            onPress: () => {
              Alert.alert(
                'Payment Information',
                `Patient: ${cleanPaymentName}\nPatient ID: ${payment.patientId}\n\nAmount: ₹${payment.totalAmount || 0}\nPaid: ₹${payment.paidAmount || 0}\nDue: ₹${payment.dueAmount || 0}\nStatus: ${payment.status || 'Unknown'}\nMethod: ${payment.paymentMethod || 'Not specified'}`,
                [{ text: 'OK' }]
              );
            }
          },
          {
            text: 'Create Patient Record',
            onPress: () => handleCreatePatientFromPayment(payment, cleanPaymentName)
          }
        ]
      );
  };

  const handleViewPaymentHistory = (payment) => {
    const paymentHistory = payment.paymentHistory || [];
    const historyText = paymentHistory.map((p, index) => {
      const sequence = index + 1;
      const suffix = sequence === 1 ? 'st' : sequence === 2 ? 'nd' : sequence === 3 ? 'rd' : 'th';
      const date = p.date || p.paidDate || new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN');
      const method = p.method || p.paymentMethod || 'Cash';
      return `${sequence}${suffix} Payment: ₹${p.amount?.toLocaleString() || '0'}\nDate: ${date}\nMethod: ${method}`;
    }).join('\n\n');

    Alert.alert(
      `Payment History - ${payment.patientName}`,
      `Total Payments: ${paymentHistory.length}\n\n${historyText}`,
      [
        {
          text: 'View Patient Details',
          onPress: () => handleViewDetails(payment)
        },
        { text: 'OK', style: 'default' }
      ]
    );
  };



  const handleAddPayment = async (paymentData, actionType = 'create') => {
    try {
      setIsLoading(true);
      
      if (actionType === 'update' && selectedPaymentForUpdate) {
        // Updating an existing payment with additional payment
        console.log('💰 Processing additional payment for:', selectedPaymentForUpdate.id);
        console.log('💰 Payment data received:', paymentData);
        
        // Update the existing payment in local state with new totals
        setAppState(prev => ({
          ...prev,
          payments: prev.payments.map(p => 
            p.id === selectedPaymentForUpdate.id ? {
              ...p,
              ...paymentData,
              // Ensure these critical fields are properly updated
              totalAmount: paymentData.totalAmount || p.totalAmount,
              paidAmount: paymentData.paidAmount,
              actualAmountPaid: paymentData.paidAmount,
              amount: paymentData.paidAmount,
              dueAmount: paymentData.dueAmount,
              remainingAmount: paymentData.dueAmount,
              status: paymentData.status,
              paymentStatus: paymentData.paymentStatus,
              paymentHistory: paymentData.paymentHistory,
              paymentCount: paymentData.paymentCount,
              lastPaymentDate: paymentData.lastPaymentDate,
              lastPaymentAmount: paymentData.additionalPaymentAmount,
              updatedAt: new Date().toISOString()
            } : p
          )
        }));
        
        // Send update to backend using updatePayment method
        try {
          console.log('🔄 Attempting to update payment with ID:', selectedPaymentForUpdate.id);
          console.log('🔄 Payment data being sent:', {
            id: paymentData.id,
            totalAmount: paymentData.totalAmount,
            paidAmount: paymentData.paidAmount,
            dueAmount: paymentData.dueAmount
          });
          
          const result = await updatePayment(selectedPaymentForUpdate.id, paymentData);
          console.log('✅ Backend update successful:', result);
        } catch (backendError) {
          console.warn('⚠️ Backend update failed, but local state updated:', backendError);
          // Could optionally show a "retry" option to the user
        }
        
        Alert.alert(
          'Payment Added Successfully!', 
          `Additional payment of ₹${paymentData.additionalPaymentAmount} has been recorded.\n\nTotal Paid: ₹${paymentData.paidAmount}\nRemaining: ₹${paymentData.dueAmount}\nStatus: ${paymentData.paymentStatus}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh the data to ensure consistency
                if (initializeFirebaseData) {
                  initializeFirebaseData();
                }
              }
            }
          ]
        );
        setSelectedPaymentForUpdate(null);
      } else {
        // Creating a new payment record
        const localId = `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        
        const localPayment = {
          id: localId,
          patientId: paymentData.patientId,
          patientName: paymentData.patientName,
          fullAmount: parseFloat(paymentData.fullAmount || paymentData.amount),
          actualAmountPaid: parseFloat(paymentData.actualAmountPaid || paymentData.amount),
          amount: parseFloat(paymentData.actualAmountPaid || paymentData.amount),
          totalAmount: parseFloat(paymentData.fullAmount || paymentData.amount),
          paidAmount: parseFloat(paymentData.actualAmountPaid || paymentData.amount),
          dueAmount: parseFloat(paymentData.dueAmount || 0),
          type: paymentData.type || 'consultation',
          paymentMethod: paymentData.paymentMethod || 'cash',
          description: paymentData.description || '',
          status: paymentData.status || 'paid',
          paymentStatus: paymentData.status || 'paid',
          paymentHistory: paymentData.paymentHistory || [],
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }),
          paymentDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          transactionId: paymentData.transactionId || null,
          isLocalPayment: true,
          locallyAdded: true,
          pending: true
        };
        
        Alert.alert(
          'Payment Added',
          'Your payment has been added and is being saved.',
          [{ text: 'OK' }],
          { cancelable: true }
        );
        
        const updatedPayments = [localPayment, ...(payments || [])];
        
        setAppState(prev => ({
          ...prev,
          payments: updatedPayments
        }));
        
        setSelectedFilter('All');
        setSearchQuery('');
        
        console.log('✅ Added new payment to state:', localPayment.id);
        
        try {
          const result = await addPayment(paymentData);
          console.log('💾 Payment saved to backend:', result);
          
          if (result && result.data && result.data.id) {
            const serverPayment = result.data;
            
            setAppState(prev => ({
              ...prev,
              payments: prev.payments.map(p => 
                p.id === localId ? { 
                  ...p, 
                  id: serverPayment.id, 
                  originalId: serverPayment.id,
                  pending: false,
                  syncedAt: new Date().toISOString()
                } : p
              )
            }));
            
            console.log('🔄 Updated local payment with server ID:', serverPayment.id);
            
            // Auto-generate invoice for any payment with amount > 0
            if (serverPayment.id && paymentData.actualAmountPaid > 0) {
              setTimeout(async () => {
                await generateInvoiceForPayment(serverPayment.id);
              }, 1000); // Small delay to ensure payment is fully processed
            }
          }
        } catch (error) {
          console.error('❌ Error saving payment to backend:', error);
          
          setAppState(prev => ({
            ...prev,
            payments: prev.payments.map(p => 
              p.id === localId ? { 
                ...p, 
                syncFailed: true,
                pending: false
              } : p
            )
          }));
          
          Alert.alert(
            'Sync Warning',
            'Your payment was added but had trouble syncing with the server. It will automatically retry.',
            [{ text: 'OK' }]
          );
        }
      }
      
      setShowAddModal(false);
      
      // Force refresh all payment data after adding payment
      setTimeout(async () => {
        try {
          console.log('🔄 Forcing complete payment data refresh after payment addition...');
          
          // Refresh all data to ensure consistency
          if (initializeFirebaseData) {
            await initializeFirebaseData();
          }
          
          // Also refresh aggregated payments specifically
          await loadAggregatedPayments();
          
          console.log('✅ Complete payment data refresh completed');
        } catch (error) {
          console.error('⚠️ Error during payment data refresh:', error);
        } finally {
          setIsLoading(false);
        }
      }, 1500); // Give enough time for backend to process
    } catch (error) {
      console.error('❌ Error adding payment:', error);
      Alert.alert('Error', 'Failed to add payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a patient record from payment data
  const handleCreatePatientFromPayment = async (payment, cleanPaymentName) => {
    try {
      console.log('👤 Creating patient record from payment data:', cleanPaymentName);
      
      // Generate a new patient ID
      const timestamp = Date.now();
      const uniqueId = timestamp.toString().slice(-10);
      const newPatientId = `KBR-OP-${new Date().getFullYear()}-${uniqueId}`;
      
      const newPatientData = {
        id: newPatientId,
        name: cleanPaymentName,
        phone: payment.patientPhone || 'Not provided',
        age: 30, // Default age
        gender: 'Male', // Default gender
        bloodGroup: 'A+', // Default blood group
        address: 'Not provided',
        patientType: 'OP',
        status: 'OP',
        statusText: 'Consultation',
        statusColor: '#34C759',
        registrationDate: new Date().toISOString().split('T')[0],
        registrationTime: new Date().toLocaleTimeString(),
        
        // Link the Firebase UID to this patient record
        firebaseId: payment.patientId,
        uid: payment.patientId,
        userId: payment.patientId,
        
        // Payment details based on the payment record
        paymentDetails: {
          totalAmount: payment.totalAmount || 0,
          totalPaid: payment.paidAmount || 0,
          dueAmount: payment.dueAmount || 0,
          payments: [],
          lastPaymentDate: payment.date
        },
        
        editHistory: [{
          action: 'created_from_payment',
          timestamp: new Date().toISOString(),
          details: `Patient record created from payment ${payment.id}`,
        }]
      };
      
      // Save to database
      const result = await addPatient(newPatientData);
      
      if (result) {
        Alert.alert(
          'Patient Created!',
          `Patient record created successfully for ${cleanPaymentName}.\n\nPatient ID: ${newPatientId}`,
          [
            {
              text: 'View Patient',
              onPress: () => {
                // Find the newly created patient and navigate to details
                setTimeout(() => {
                  const createdPatient = patients.find(p => p.id === newPatientId) || result;
                  if (createdPatient) {
                    navigation.navigate('PatientDetails', { patient: createdPatient });
                  }
                }, 1000);
              }
            },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error creating patient from payment:', error);
      Alert.alert('Error', 'Failed to create patient record. Please try again.');
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      // Check if paymentId is a generated id or an original id
      if (paymentId && paymentId.startsWith('payment-')) {
        // This is a generated ID, find the original ID from the payment list
        const payment = paymentList.find(p => p.id === paymentId);
        if (payment && payment.originalId) {
          paymentId = payment.originalId;
        } else {
          console.error('❌ Could not find original payment ID for:', paymentId);
          Alert.alert('Error', 'Could not find original payment ID. Please try again.');
          return;
        }
      }
      
      // Use centralized update function for better synchronization
      await updatePaymentStatusAndSync(paymentId, newStatus);
      
      // If payment is marked as paid, automatically generate an invoice
      if (newStatus === 'paid') {
        await generateInvoiceForPayment(paymentId);
      }
      
      Alert.alert('Success', 'Payment status updated successfully!');
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status. Please try again.');
    }
  };

  // Payment completion handler with centralized updates
  const handlePaymentCompleted = async (paymentId) => {
    try {
      console.log('💰 Completing payment:', paymentId);
      
      // Use centralized function that handles both payment status and invoice generation
      await updatePaymentStatusAndSync(paymentId, 'paid');
      
      Alert.alert(
        'Payment Completed!', 
        'Payment has been marked as completed. Invoice has been automatically generated and the appointment status has been updated.',
        [{ text: 'OK' }]
      );
      
      // Force refresh to show updates
      setTimeout(async () => {
        await loadAggregatedPayments();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error completing payment:', error);
      Alert.alert('Error', 'Failed to complete payment. Please try again.');
    }
  };

  const handleDeletePayment = (payment) => {
    const paymentId = payment.originalId || payment.id;
    const isLocalPayment = payment.isLocalPayment || paymentId.toString().startsWith('local-');
    
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete ${isLocalPayment ? 'this locally added' : ''} payment for ${payment.patientName}?\n\nAmount: ₹${payment.amount}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              
              if (isLocalPayment) {
                // For local payments, just remove from local state
                console.log('Removing local payment from state:', paymentId);
                
                setAppState(prev => ({
                  ...prev,
                  payments: prev.payments.filter(p => p.id !== paymentId)
                }));
                
                Alert.alert('Success', 'Payment removed successfully!');
              } else {
                // For server payments, call the API
                await deletePayment(paymentId);
                Alert.alert('Success', 'Payment deleted successfully!');
              }
              
              // Refresh the UI after deletion
              setTimeout(() => {
                if (initializeFirebaseData) {
                  initializeFirebaseData()
                    .then(() => console.log('✅ Data refreshed after deletion'))
                    .catch(err => console.error('⚠️ Error refreshing after deletion:', err))
                    .finally(() => setIsLoading(false));
                } else {
                  setIsLoading(false);
                }
              }, 1000);
            } catch (error) {
              console.error('Error deleting payment:', error);
              setIsLoading(false);
              Alert.alert('Error', 'Failed to delete payment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleDownloadInvoice = (payment) => {
    Alert.alert(
      'Download Invoice',
      `Download invoice for ${payment.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Download', 
          onPress: () => {
            // Implement download logic here
            Alert.alert('Success', 'Invoice download started');
          }
        }
      ]
    );
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const RevenueCard = ({ title, amount, icon, color, subtitle }) => (
    <View style={[styles.revenueCard, { borderLeftColor: color }]}>
      <View style={styles.revenueIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.revenueCardContent}>
        <Text style={styles.revenueAmount}>{formatCurrency(amount)}</Text>
        <Text style={styles.revenueTitle}>{title}</Text>
        {subtitle && <Text style={styles.revenueSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  // Payment card component showing payment details
  const PaymentCard = ({ payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>Amit Patel</Text>
            <Text style={styles.patientMeta}>
              KBR-IP-2024-002 • IP
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: "#EF4444" }]}>
          <Text style={styles.statusText}>Pending</Text>
        </View>
      </View>
      
      <View style={styles.paymentAmounts}>
        <View style={styles.amountGrid}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹2,500</Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Amount Paid</Text>
            <Text style={[styles.amountValue, { color: "#6B7280" }]}>
              ₹0
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Due Amount</Text>
            <Text style={[styles.amountValue, { color: "#EF4444" }]}>
              ₹2,500
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Payments Made</Text>
            <Text style={[styles.amountValue, { color: "#4A90E2" }]}>
              1
            </Text>
          </View>
        </View>
      </View>

      {/* Latest Payment Info */}
      <View style={styles.latestPayment}>
        <Text style={styles.latestPaymentTitle}>Latest Payment</Text>
        <Text style={styles.latestPaymentText}>
          Registration payment pending
        </Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewDetails(payment)}
        >
          <Ionicons name="eye" size={16} color="#4A90E2" />
          <Text style={[styles.actionText, { color: "#4A90E2" }]}>View Patient</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleAddPayment(payment)}
        >
          <Ionicons name="add-circle" size={16} color="#22C55E" />
          <Text style={[styles.actionText, { color: "#22C55E" }]}>Add Payment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadInvoice(payment)}
        >
          <Ionicons name="download" size={16} color="#8B5CF6" />
          <Text style={[styles.actionText, { color: "#8B5CF6" }]}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Original implementation (commented out for reference)
  /*
  const originalPaymentCard = ({ payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>{payment.patientName[0]}</Text>
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{payment.patientName}</Text>
            <Text style={styles.patientMeta}>
              {payment.patientId} • {payment.patientType}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: payment.statusColor }]}>
          <Text style={styles.statusText}>{payment.status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentAmounts}>
        <View style={styles.amountGrid}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(payment.totalAmount)}</Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Amount Paid</Text>
            <Text style={styles.amountValue}>{formatCurrency(payment.paidAmount)}</Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Due Amount</Text>
            <Text style={[styles.amountValue, { color: payment.dueAmount > 0 ? "#EF4444" : "#22C55E" }]}>
              {formatCurrency(payment.dueAmount)}
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Payments Made</Text>
            <Text style={[styles.amountValue, { color: "#4A90E2" }]}>
              {payment.paymentHistory.length}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.latestPayment}>
        <Text style={styles.latestPaymentTitle}>Latest Payment</Text>
        <View style={styles.latestPaymentInfo}>
          <Text style={styles.latestPaymentText}>
            ₹{payment.paymentHistory[payment.paymentHistory.length - 1].amount} • 
            {payment.paymentHistory[payment.paymentHistory.length - 1].method} • 
            {payment.paymentHistory[payment.paymentHistory.length - 1].date}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewDetails(payment)}
        >
          <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
          <Text style={[styles.actionText, { color: Colors.kbrBlue }]}>View Patient</Text>
        </TouchableOpacity>
        
        {payment.dueAmount > 0 && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleAddPayment(payment)}
          >
            <Ionicons name="add-circle" size={16} color={Colors.kbrGreen} />
            <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>Add Payment</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadInvoice(payment)}
        >
          <Ionicons name="download" size={16} color={Colors.kbrPurple} />
          <Text style={[styles.actionText, { color: Colors.kbrPurple }]}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  */

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      <AppHeader
        title="Payment Management"
        subtitle="Track all IP & OP payments and invoices"
        navigation={navigation}
        showBackButton={true}
        useSimpleAdminHeader={true}
        rightComponent={() => (
          <TouchableOpacity 
            style={{ marginRight: 15 }}
            onPress={refreshPayments}
          >
            <MaterialIcons name="refresh" size={24} color={Colors.kbrBlue || '#4A90E2'} />
          </TouchableOpacity>
        )}
      />
      <SafeAreaView style={[styles.safeArea]} edges={['left', 'right']}>
        {/* Sticky Filters - Positioned at top for easy access */}
        <View style={styles.stickyFiltersContainer}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by patient, invoice, or date"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterIcon}>
                <Ionicons name="funnel" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabsScrollView}>
              <View style={styles.filterTabs}>
                {/* Payment Status Filters */}
                {['All', 'Fully Paid', 'Partially Paid', 'Pending'].map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterTab,
                      selectedFilter === filter && styles.activeFilterTab
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[
                      styles.filterTabText,
                      selectedFilter === filter && styles.activeFilterTabText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {/* Service Type Filters */}
                <View style={styles.filterSeparator} />
                {['OP Payments', 'IP Payments', 'Test Payments', 'General'].map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterTab,
                      styles.serviceTypeFilterTab,
                      selectedFilter === filter && styles.activeServiceTypeFilterTab
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text style={[
                      styles.filterTabText,
                      styles.serviceTypeFilterText,
                      selectedFilter === filter && styles.activeServiceTypeFilterText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>

        {/* Main Content - Use FlatList for everything to avoid nested scroll */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={Colors.kbrBlue || '#4A90E2'} />
              <Text style={styles.loadingText}>Loading payments...</Text>
              <Text style={styles.loadingSubtext}>Please wait while we fetch your payment records</Text>
              <TouchableOpacity 
                style={styles.loadingRetryButton}
                onPress={refreshPayments}
              >
                <MaterialIcons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.loadingRetryText}>Retry Loading</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : !filteredPayments || filteredPayments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyStateCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No Payments Found</Text>
              <Text style={styles.emptyMessage}>
                {!payments || payments.length === 0 
                  ? "No payment records available. Add the first payment to get started with your payment tracking."
                  : `Found ${payments?.length || 0} payment records but none match your current filter: ${selectedFilter}${searchQuery ? ` and search: "${searchQuery}"` : ""}`
                }
              </Text>
              <View style={styles.emptyButtonGroup}>
                <TouchableOpacity 
                  style={styles.emptyPrimaryButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Add New Payment</Text>
                </TouchableOpacity>
                
                {(payments && payments.length > 0 && filteredPayments?.length === 0) && (
                  <TouchableOpacity 
                    style={styles.emptySecondaryButton}
                    onPress={() => {
                      setSelectedFilter('All');
                      setSearchQuery('');
                    }}
                  >
                    <MaterialIcons name="filter-list-off" size={18} color="#FFFFFF" />
                    <Text style={styles.emptyButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
                
                {__DEV__ && (
                  <View style={{marginTop: 20, flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity 
                      style={[styles.debugButton, {backgroundColor: '#F59E0B'}]}
                      onPress={verifyPaymentsVisibility}
                    >
                      <Ionicons name="bug" size={16} color="#FFFFFF" />
                      <Text style={styles.debugButtonText}>Check Data</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.debugButton, {backgroundColor: '#3B82F6'}]}
                      onPress={forceRebuildPaymentList}
                    >
                      <MaterialIcons name="build" size={16} color="#FFFFFF" />
                      <Text style={styles.debugButtonText}>Rebuild List</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredPayments || []}
            keyExtractor={(item, index) => {
              // Use the pre-generated unique ID or create a fallback with index and random string to guarantee uniqueness
              return item?.id || `payment-fallback-${index}-${Math.random().toString(36).substr(2, 9)}`;
            }}
            extraData={[payments?.length || 0, filteredPayments?.length || 0, selectedFilter, searchQuery]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
            style={{ backgroundColor: '#F5F5F5', flex: 1 }}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={10}
            removeClippedSubviews={false}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.kbrBlue || '#4A90E2']}
                tintColor={Colors.kbrBlue || '#4A90E2'}
              />
            }
            ListHeaderComponent={() => (
              <View style={styles.listHeaderContainer}>
                {/* Revenue Statistics */}
                <View style={styles.statsContainer}>
                  <View style={styles.statsRow}>
                    <View style={[styles.statsCard, { backgroundColor: '#E8F5E8' }]}>
                      <Text style={styles.statsTitle}>Total Revenue</Text>
                      <Text style={[styles.statsAmount, { color: '#22C55E' }]}>
                        ₹{paymentStats.totalRevenue.toLocaleString()}
                      </Text>
                      <Text style={styles.statsSubtitle}>{paymentStats.fullyPaidCount} fully paid</Text>
                    </View>
                    
                    <View style={[styles.statsCard, { backgroundColor: '#FFF3CD' }]}>
                      <Text style={styles.statsTitle}>Pending Dues</Text>
                      <Text style={[styles.statsAmount, { color: '#EF4444' }]}>
                        ₹{paymentStats.totalPending.toLocaleString()}
                      </Text>
                      <Text style={styles.statsSubtitle}>{paymentStats.pendingCount} pending</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statsRow}>
                    <View style={[styles.statsCard, { backgroundColor: '#E0E7FF' }]}>
                      <Text style={styles.statsTitle}>Partially Paid</Text>
                      <Text style={[styles.statsAmount, { color: '#8B5CF6' }]}>
                        {paymentStats.partiallyPaidCount}
                      </Text>
                      <Text style={styles.statsSubtitle}>patients</Text>
                    </View>
                    
                    <View style={[styles.statsCard, { backgroundColor: '#F3F4F6' }]}>
                      <Text style={styles.statsTitle}>Total Patients</Text>
                      <Text style={[styles.statsAmount, { color: '#4A90E2' }]}>
                        {paymentStats.totalPatients}
                      </Text>
                      <Text style={styles.statsSubtitle}>with payments</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            renderItem={({ item, index }) => {
              // Determine payment status colors
              const statusColor = (item.paymentStatus === 'paid' || item.status === 'Fully Paid') 
                ? '#22C55E' 
                : (item.paymentStatus === 'pending' || item.status === 'Pending') 
                  ? '#EF4444' 
                  : '#F59E0B';
              
              // Determine if the payment is new/local
              const isNewPayment = item.isLocalPayment;
              
              return (
                <View 
                  style={[
                    styles.paymentCardContainer,
                    isNewPayment && styles.newPaymentCard
                  ]}
                >
                  {/* Badge for new/syncing payments */}
                  {isNewPayment && (
                    <View style={[
                      styles.paymentBadge,
                      { backgroundColor: item.syncFailed ? '#EF4444' : item.pending ? '#F59E0B' : '#10B981' }
                    ]}>
                      <Text style={styles.paymentBadgeText}>
                        {item.syncFailed ? 'RETRY SYNC' : item.pending ? 'SYNCING...' : 'NEW'}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.paymentCard}>
                    {/* Patient header with avatar and status */}
                    <View style={styles.paymentHeader}>
                      <View style={styles.patientInfo}>
                        <View style={[styles.patientAvatar, {backgroundColor: statusColor}]}>
                          <Text style={styles.avatarText}>
                            {item.patientName?.charAt(0)?.toUpperCase() || 'A'}
                          </Text>
                        </View>
                        <View style={styles.patientDetails}>
                          <Text style={styles.patientName}>{item.patientName || 'Unknown Patient'}</Text>
                          <Text style={styles.patientMeta}>
                            {item.patientId || 'No ID'} • {item.serviceType || item.patientType || 'General'}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.badgeContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                          <Text style={styles.statusText}>
                            {item.status || (item.paymentStatus === 'paid' ? 'Fully Paid' : 
                            item.paymentStatus === 'pending' ? 'Pending' : 'Partial Paid')}
                          </Text>
                        </View>
                        {/* Service Type Badge */}
                        {item.serviceType && (
                          <View style={[styles.serviceTypeBadge, { 
                            backgroundColor: item.serviceType === 'OP' ? '#E0F2FE' : 
                                           item.serviceType === 'IP' ? '#FEF3C7' : 
                                           item.serviceType === 'TEST' ? '#F3E8FF' : '#F1F5F9'
                          }]}>
                            <Text style={[styles.serviceTypeText, {
                              color: item.serviceType === 'OP' ? '#0369A1' : 
                                     item.serviceType === 'IP' ? '#D97706' : 
                                     item.serviceType === 'TEST' ? '#7C3AED' : '#475569'
                            }]}>
                              {item.serviceType}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    
                    {/* Payment amounts in a grid */}
                    <View style={styles.paymentAmounts}>
                      <View style={styles.amountGrid}>
                        <View style={styles.amountItem}>
                          <Text style={styles.amountLabel}>Total Amount</Text>
                          <Text style={styles.amountValue}>₹{(item.totalAmount || item.amount || 0).toLocaleString()}</Text>
                        </View>
                        
                        <View style={styles.amountItem}>
                          <Text style={styles.amountLabel}>Amount Paid</Text>
                          <Text style={[styles.amountValue, { color: (item.paidAmount || 0) > 0 ? "#22C55E" : "#6B7280" }]}>
                            ₹{(item.paidAmount || 0).toLocaleString()}
                          </Text>
                        </View>
                        
                        <View style={styles.amountItem}>
                          <Text style={styles.amountLabel}>Due Amount</Text>
                          <Text style={[styles.amountValue, { color: (item.dueAmount || 0) > 0 ? "#EF4444" : "#22C55E" }]}>
                            ₹{(item.dueAmount || 0).toLocaleString()}
                          </Text>
                        </View>
                        
                        <View style={styles.amountItem}>
                          <Text style={styles.amountLabel}>Payments Made</Text>
                          <Text style={[styles.amountValue, { color: "#4A90E2" }]}>
                            {item.paymentCount || item.paymentHistory?.length || 
                             ((item.paidAmount || 0) > 0 ? '1' : '0')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Enhanced Payment History Section */}
                    <View style={styles.paymentHistorySection}>
                      <Text style={styles.paymentHistoryTitle}>
                        <Ionicons name="receipt" size={14} color="#4A90E2" /> Payment History
                      </Text>
                      
                      {/* Payment History Details */}
                      {item.paymentHistory && item.paymentHistory.length > 0 ? (
                        <View style={styles.paymentHistoryList}>
                          {item.paymentHistory.slice(0, 3).map((payment, historyIndex) => (
                            <View key={`${payment.id}-${historyIndex}`} style={styles.paymentHistoryItem}>
                              <View style={styles.paymentSequence}>
                                <Text style={styles.paymentSequenceNumber}>
                                  {historyIndex + 1}{historyIndex === 0 ? 'st' : historyIndex === 1 ? 'nd' : historyIndex === 2 ? 'rd' : 'th'} time
                                </Text>
                              </View>
                              <View style={styles.paymentHistoryDetails}>
                                <Text style={styles.paymentHistoryAmount}>₹{payment.amount?.toLocaleString() || '0'}</Text>
                                <Text style={styles.paymentHistoryDate}>
                                  {payment.date || payment.paidDate || new Date(payment.createdAt || Date.now()).toLocaleDateString('en-IN')}
                                </Text>
                                <Text style={styles.paymentHistoryMethod}>
                                  {payment.method || payment.paymentMethod || 'Cash'}
                                </Text>
                              </View>
                            </View>
                          ))}
                          
                          {item.paymentHistory.length > 3 && (
                            <TouchableOpacity 
                              style={styles.viewMorePayments}
                              onPress={() => handleViewPaymentHistory(item)}
                            >
                              <Text style={styles.viewMorePaymentsText}>
                                +{item.paymentHistory.length - 3} more payments
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ) : (
                        // Single payment or no history
                        <View style={styles.singlePaymentInfo}>
                          {(item.paidAmount || 0) > 0 ? (
                            <View style={styles.paymentHistoryItem}>
                              <View style={styles.paymentSequence}>
                                <Text style={styles.paymentSequenceNumber}>1st time</Text>
                              </View>
                              <View style={styles.paymentHistoryDetails}>
                                <Text style={styles.paymentHistoryAmount}>₹{(item.paidAmount || item.amount || 0).toLocaleString()}</Text>
                                <Text style={styles.paymentHistoryDate}>
                                  {item.lastPaymentDate || item.createdAt ? 
                                    new Date(item.lastPaymentDate || item.createdAt).toLocaleDateString('en-IN') : 
                                    'Recently'}
                                </Text>
                                <Text style={styles.paymentHistoryMethod}>
                                  {item.paymentMethod || 'Cash'}
                                </Text>
                              </View>
                            </View>
                          ) : (
                            <Text style={styles.noPaymentText}>No payments made yet</Text>
                          )}
                        </View>
                      )}
                      
                      {/* Payment Status Summary */}
                      <View style={styles.paymentStatusSummary}>
                        <Text style={[styles.statusSummaryText, { 
                          color: (item.dueAmount || 0) <= 0 ? '#22C55E' : 
                                 (item.paidAmount || 0) > 0 ? '#F59E0B' : '#EF4444'
                        }]}>
                          Status: {(item.dueAmount || 0) <= 0 ? 'Fully Paid' : 
                                   (item.paidAmount || 0) > 0 ? `Partially Paid (₹${(item.dueAmount || 0).toLocaleString()} due)` : 
                                   'Payment Pending'}
                        </Text>
                      </View>
                    </View>

                    {/* Latest Payment Info - Simplified */}
                    <View style={[
                      styles.latestPayment, 
                      { 
                        backgroundColor: isNewPayment ? 
                          (item.hasSyncFailed ? '#FEF2F2' : item.isPending ? '#FFFBEB' : '#ECFDF5') : 
                          '#F0F9FF',
                        borderLeftColor: isNewPayment ? 
                          (item.hasSyncFailed ? '#EF4444' : item.isPending ? '#F59E0B' : '#10B981') : 
                          statusColor
                      }
                    ]}>
                      <Text style={styles.latestPaymentTitle}>
                        {isNewPayment ? 'Recently Added Payment' : 'Payment Summary'}
                      </Text>
                      {isNewPayment ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {item.isPending && (
                            <ActivityIndicator size="small" color="#F59E0B" style={{ marginRight: 8 }} />
                          )}
                          {item.hasSyncFailed && (
                            <MaterialIcons name="sync-problem" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                          )}
                          <Text style={[
                            styles.latestPaymentText,
                            { 
                              color: item.hasSyncFailed ? '#B91C1C' : 
                                    item.isPending ? '#92400E' : '#065F46',
                              fontWeight: isNewPayment ? '500' : 'normal'
                            }
                          ]}>
                            {item.localIndicator || `Added recently - ₹${(item.amount || 0).toLocaleString()}`}
                          </Text>
                        </View>
                      ) : (
                        <View>
                          <Text style={styles.latestPaymentText}>
                            {(item.paymentStatus === 'paid' || item.status === 'Fully Paid') ? 
                              `${item.serviceType || 'Payment'}: ₹${(item.paidAmount || item.amount || 0).toLocaleString()} paid${item.lastPaymentAmount ? ` (Last: ₹${item.lastPaymentAmount})` : ''}` : 
                              (item.paymentStatus === 'partial' || item.status === 'Partially Paid') ?
                              `${item.serviceType || 'Payment'}: ₹${(item.paidAmount || 0).toLocaleString()} of ₹${(item.totalAmount || item.amount || 0).toLocaleString()} paid` :
                              `${item.serviceType || 'Payment'} pending - ₹${(item.totalAmount || item.amount || 0).toLocaleString()}`}
                          </Text>
                          {item.description && (
                            <Text style={[styles.latestPaymentText, { fontSize: 11, color: '#6B7280', marginTop: 2 }]}>
                              {item.description}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>

                    {/* Action buttons */}
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.actionButtonPrimary]}
                        onPress={() => handleViewDetails(item)}
                      >
                        <Ionicons name="eye" size={16} color="#4A90E2" />
                        <Text style={[styles.actionText, { color: "#4A90E2" }]}>View Patient</Text>
                      </TouchableOpacity>
                      
                      {/* For failed sync payments, show retry option */}
                      {item.syncFailed ? (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.actionButtonWarning]}
                          onPress={() => {
                            // Mark as pending again
                            setAppState(prev => ({
                              ...prev,
                              payments: prev.payments.map(p => 
                                p.id === item.id ? { ...p, pending: true, syncFailed: false } : p
                              )
                            }));
                            
                            // Try to re-add the payment
                            const paymentToRetry = {
                              patientId: item.patientId,
                              patientName: item.patientName,
                              amount: item.amount,
                              type: item.type,
                              paymentMethod: item.paymentMethod,
                              description: item.description,
                              transactionId: item.transactionId
                            };
                            
                            addPayment(paymentToRetry)
                              .then(result => {
                                if (result && result.data && result.data.id) {
                                  // Update with server ID
                                  setAppState(prev => ({
                                    ...prev,
                                    payments: prev.payments.map(p => 
                                      p.id === item.id ? { 
                                        ...p, 
                                        id: result.data.id, 
                                        originalId: result.data.id,
                                        pending: false,
                                        syncFailed: false,
                                        syncedAt: new Date().toISOString() 
                                      } : p
                                    )
                                  }));
                                  
                                  Alert.alert('Success', 'Payment successfully synced with server!');
                                }
                              })
                              .catch(() => {
                                // Mark as failed again
                                setAppState(prev => ({
                                  ...prev,
                                  payments: prev.payments.map(p => 
                                    p.id === item.id ? { ...p, pending: false, syncFailed: true } : p
                                  )
                                }));
                                
                                Alert.alert('Sync Failed', 'Unable to sync payment. Please try again.');
                              });
                          }}
                        >
                          <MaterialIcons name="sync" size={16} color="#EF4444" />
                          <Text style={[styles.actionText, { color: "#EF4444" }]}>Retry Sync</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.actionButtonSuccess]}
                          onPress={() => {
                            // Check if this payment has pending/partial amount
                            const hasRemainingBalance = item.dueAmount > 0 || item.status === 'pending' || item.status === 'partial';
                            
                            if (hasRemainingBalance) {
                              // Set this payment for update using originalId for backend operations
                              const paymentForUpdate = {
                                ...item,
                                id: item.originalId || item.id // Use originalId for backend, fallback to id if no originalId
                              };
                              setSelectedPaymentForUpdate(paymentForUpdate);
                              setFormData(prev => ({
                                ...prev,
                                patientId: item.patientId,
                                patientName: item.patientName,
                                fullAmount: item.totalAmount?.toString() || item.fullAmount?.toString() || '',
                                actualAmountPaid: item.dueAmount?.toString() || ''
                              }));
                            } else {
                              // Pre-select the patient for a new payment
                              setSelectedPaymentForUpdate(null);
                              setFormData(prev => ({
                                ...prev,
                                patientId: item.patientId,
                                patientName: item.patientName,
                                fullAmount: '',
                                actualAmountPaid: ''
                              }));
                            }
                            setShowAddModal(true);
                          }}
                        >
                          <Ionicons name="add-circle" size={16} color="#22C55E" />
                          <Text style={[styles.actionText, { color: "#22C55E" }]}>
                            {(item.dueAmount > 0 || item.status === 'pending' || item.status === 'partial') ? 'Add Payment' : 'New Payment'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* Show delete option for local payments or download for server payments */}
                      {item.isLocalPayment ? (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.actionButtonDanger]}
                          onPress={() => handleDeletePayment(item)}
                        >
                          <Ionicons name="trash" size={16} color="#EF4444" />
                          <Text style={[styles.actionText, { color: "#EF4444" }]}>Remove</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.actionButtonSecondary]}
                          onPress={() => handleDownloadInvoice(item)}
                        >
                          <Ionicons name="download" size={16} color="#8B5CF6" />
                          <Text style={[styles.actionText, { color: "#8B5CF6" }]}>Download</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Floating Action Button for adding payment */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Add Payment Modal */}
        <AddPaymentModal
          visible={showAddModal}
          onClose={() => {
            console.log('Closing payment modal');
            setShowAddModal(false);
            setSelectedPaymentForUpdate(null);
            // Reset form data when modal is closed
            setFormData({
              patientId: '',
              patientName: '',
              amount: '',
              type: 'consultation',
              paymentMethod: 'cash',
              description: '',
              transactionId: '',
            });
          }}
          onSave={handleAddPayment}
          patients={patients}
          initialFormData={formData}
          existingPayment={selectedPaymentForUpdate}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background || '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
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
  paymentsContent: {
    flex: 1,
  },
  listHeaderContainer: {
    paddingBottom: 0,
  },
  filterTabsScrollView: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 10,
  },
  // scroll to top button style removed
  
  // Fixed Header Styles
  fixedHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 2,
  },
  
  // Scrollable Content Styles
  scrollableContent: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    zIndex: 1,
  },

  // Statistics Styles
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  statsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Search and Filter Styles
  searchContainer: {
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 2,
  },
  filterIcon: {
    marginLeft: 8,
    padding: 4,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  activeFilterTab: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  filterTabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  serviceTypeFilterTab: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  activeServiceTypeFilterTab: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  serviceTypeFilterText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeServiceTypeFilterText: {
    color: '#FFFFFF',
  },
  
  // List Header Styles
  listHeader: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  
  // Payment Card Styles
  paymentCardContainer: {
    marginVertical: 8,
    position: 'relative',
  },
  newPaymentCard: {
    marginTop: 14, // Extra space for badge
  },
  paymentBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  paymentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  patientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  serviceTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Payment Amounts Styles
  paymentAmounts: {
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  // Latest Payment Info Styles
  latestPayment: {
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  latestPaymentTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  latestPaymentText: {
    fontSize: 13,
    color: '#4B5563',
  },
  
  // Card Actions Styles
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    paddingBottom: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  actionButtonPrimary: {
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  actionButtonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  actionButtonWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  
  // Loading & Empty States
  // Loading State Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  loadingRetryButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  loadingRetryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyIconContainer: {
    backgroundColor: '#F3F4F6',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButtonGroup: {
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  emptyPrimaryButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptySecondaryButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  debugButton: {
    backgroundColor: '#6B7280',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },

  // Enhanced Payment History Styles
  paymentHistorySection: {
    backgroundColor: '#FAFBFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  paymentHistoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentHistoryList: {
    gap: 8,
  },
  paymentHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentSequence: {
    marginRight: 12,
    alignItems: 'center',
  },
  paymentSequenceNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4A90E2',
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
    minWidth: 50,
  },
  paymentHistoryDetails: {
    flex: 1,
  },
  paymentHistoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 2,
  },
  paymentHistoryDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 1,
  },
  paymentHistoryMethod: {
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  singlePaymentInfo: {
    marginTop: 4,
  },
  noPaymentText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  paymentStatusSummary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusSummaryText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  viewMorePayments: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
    alignItems: 'center',
  },
  viewMorePaymentsText: {
    fontSize: 11,
    color: '#4A90E2',
    fontWeight: '500',
  },
});

export default PaymentManagementScreen;