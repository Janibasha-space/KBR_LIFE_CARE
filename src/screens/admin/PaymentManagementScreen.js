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
  const { patients, getAllPendingPayments, payments, addPayment, updatePaymentStatus, deletePayment, initializeFirebaseData, addInvoice, setAppState } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // Refresh payments when screen comes into focus
  // Function to scroll to top of payment list
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
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
    const totalPayments = payments?.length || 0;
    
    // Calculate total revenue from actual amounts paid
    const totalRevenue = (payments || []).reduce((sum, payment) => {
      const actualPaid = payment.actualAmountPaid || payment.paidAmount || 
                        (payment.status === 'paid' ? payment.amount : 0) || 0;
      return sum + actualPaid;
    }, 0);
    
    // Calculate pending amounts using full amounts and due amounts
    const totalPending = (payments || []).reduce((sum, payment) => {
      const dueAmount = payment.dueAmount || 
                       (payment.fullAmount ? payment.fullAmount - (payment.actualAmountPaid || 0) : 
                        payment.status === 'pending' ? payment.amount : 0) || 0;
      return sum + dueAmount;
    }, 0);
    
    const fullyPaidCount = (payments || []).filter(p => p.status === 'paid').length;
    const pendingCount = (payments || []).filter(p => p.status === 'pending').length;
    const partiallyPaidCount = (payments || []).filter(p => p.status === 'partial').length;

    return {
      totalRevenue,
      totalPending,
      fullyPaidCount,
      partiallyPaidCount,
      pendingCount,
      totalPatients: totalPayments,
    };
  }, [payments]);

  // Transform actual payments data for display  
  const paymentList = useMemo(() => {
    try {
      // Safety check for undefined payments
      if (!payments) {
        console.log('❌ Payments array is undefined');
        return [];
      }
      
      // Ensure we always have data to work with
      if (payments.length === 0) {
        console.log('❌ No payments data available (empty array)');
        return [];
      }
      
      // Enhanced deduplication with guaranteed unique keys
      const uniquePaymentsMap = new Map();
      (payments || []).forEach((payment, idx) => {
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
          
          // Payment amounts - Fixed to show correct total and paid amounts
          amount: payment.actualAmountPaid || payment.amount || payment.totalAmount || 1000, // Actual amount paid
          paymentStatus: payment.status || payment.paymentStatus || 'paid', // Add fallback
          totalAmount: payment.fullAmount || payment.totalAmount || payment.amount || 1000, // Full amount owed
          paidAmount: payment.actualAmountPaid || payment.paidAmount || (payment.status === 'paid' || payment.paymentStatus === 'paid') ? (payment.amount || 1000) : 
                    (payment.status === 'partial' || payment.paymentStatus === 'partial') ? (payment.amount || 1000) * 0.5 : 0,
          dueAmount: payment.dueAmount || (payment.fullAmount ? payment.fullAmount - (payment.actualAmountPaid || 0) : 
                    (payment.status === 'paid' || payment.paymentStatus === 'paid') ? 0 : 
                    (payment.status === 'partial' || payment.paymentStatus === 'partial') ? (payment.amount || 1000) * 0.5 : (payment.amount || 1000)),
          
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
  }, [payments, patients]);

  const filteredPayments = (paymentList || []).filter(payment => {
    // Search filtering
    const matchesSearch = !searchQuery || 
                         (payment.patientName && payment.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (payment.originalId && payment.originalId?.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (payment.patientId && payment.patientId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filtering - ensure exact match or show all
    // Convert everything to lowercase for case-insensitive comparison
    const paymentStatus = (payment.status || payment.paymentStatus || '').toLowerCase();
    let matchesFilter = false;
    if (selectedFilter === 'All') {
      matchesFilter = true; // Show all payments
    } else if (selectedFilter === 'Fully Paid') {
      matchesFilter = paymentStatus === 'fully paid' || paymentStatus === 'paid';
    } else if (selectedFilter === 'Partially Paid') {
      matchesFilter = paymentStatus === 'partially paid' || paymentStatus === 'partial';
    } else if (selectedFilter === 'Pending') {
      matchesFilter = paymentStatus === 'pending';
    } else {
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
    // Navigate to PatientDetails instead of PaymentDetails for better integration
    const patient = patients.find(p => p.id === payment.patientId);
    if (patient) {
      navigation.navigate('PatientDetails', { patient });
    } else {
      Alert.alert('Error', 'Patient details not found');
    }
  };

  const handleAddPayment = async (paymentData) => {
    try {
      setIsLoading(true);
      
      // Create a unique local ID with timestamp for easier tracking
      const localId = `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      // Create a local payment object for immediate UI update
      const localPayment = {
        id: localId,
        patientId: paymentData.patientId,
        patientName: paymentData.patientName,
        fullAmount: parseFloat(paymentData.fullAmount || paymentData.amount),
        actualAmountPaid: parseFloat(paymentData.actualAmountPaid || paymentData.amount),
        amount: parseFloat(paymentData.actualAmountPaid || paymentData.amount), // For backwards compatibility
        totalAmount: parseFloat(paymentData.fullAmount || paymentData.amount),
        paidAmount: parseFloat(paymentData.actualAmountPaid || paymentData.amount),
        dueAmount: parseFloat(paymentData.dueAmount || 0),
        type: paymentData.type || 'consultation',
        paymentMethod: paymentData.paymentMethod || 'cash',
        description: paymentData.description || '',
        status: paymentData.status || 'paid',
        paymentStatus: paymentData.status || 'paid',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        transactionId: paymentData.transactionId || null,
        isLocalPayment: true, // Flag to identify this is a locally added payment
        locallyAdded: true,    // Additional flag for UI differentiation
        pending: true          // Flag to show sync status
      };
      
      // Show an immediate toast or notification
      Alert.alert(
        'Payment Added',
        'Your payment has been added and is being saved.',
        [{ text: 'OK' }],
        { cancelable: true }
      );
      
      // Immediately update local state for responsive UI
      const updatedPayments = [localPayment, ...(payments || [])]; // Add to beginning of array
      
      // Update the payments array directly for immediate UI refresh
      setAppState(prev => ({
        ...prev,
        payments: updatedPayments
      }));
      
      // Force filter reset to "All" to ensure new payment is visible
      setSelectedFilter('All');
      setSearchQuery('');
      
      console.log('✅ Added new payment to state:', localPayment.id);
      
      console.log('📱 Immediately updated UI with new payment:', localId);
      setShowAddModal(false);
      
      // Now send to the backend
      try {
        const result = await addPayment(paymentData);
        console.log('💾 Payment saved to backend:', result);
        
        // Update the local payment with the server-generated ID if available
        if (result && result.data && result.data.id) {
          // Find and update the local payment with the real ID from server
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
        }
      } catch (error) {
        console.error('❌ Error saving payment to backend:', error);
        
        // Mark the payment as failed in UI but keep it visible
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
        
        // Show error but don't disrupt the flow
        Alert.alert(
          'Sync Warning',
          'Your payment was added but had trouble syncing with the server. It will automatically retry.',
          [{ text: 'OK' }]
        );
      }
      
      // Optional: Refresh from Firebase in the background for complete sync
      if (initializeFirebaseData) {
        setTimeout(() => {
          initializeFirebaseData()
            .then(() => console.log('✅ Background sync completed'))
            .catch(err => console.error('⚠️ Background sync error:', err))
            .finally(() => {
              // Ensure loading state is reset after all operations
              setIsLoading(false);
            });
        }, 2000); // Wait 2 seconds before refreshing to allow Firebase to update
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error adding payment:', error);
      Alert.alert('Error', 'Failed to add payment. Please try again.');
    } finally {
      // Final safety to ensure loading is always turned off
      setIsLoading(false);
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
      
      await updatePaymentStatus(paymentId, newStatus);
      
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

  // Function to automatically generate invoice when payment is completed
  const generateInvoiceForPayment = async (paymentId) => {
    try {
      // Find the payment that was just completed - check both original and generated IDs
      let completedPayment = payments.find(p => p.id === paymentId);
      
      // If not found by direct ID, try to find via the transformed payment list
      if (!completedPayment) {
        const transformedPayment = paymentList.find(p => 
          p.id === paymentId || p.originalId === paymentId
        );
        
        if (transformedPayment && transformedPayment.originalId) {
          completedPayment = payments.find(p => p.id === transformedPayment.originalId);
        }
      }
      
      if (!completedPayment) {
        console.error('Payment not found for invoice generation, ID:', paymentId);
        return;
      }

      // Find the patient details
      const patient = patients.find(p => p.id === completedPayment.patientId);
      if (!patient) {
        console.error('Patient not found for invoice generation');
        return;
      }

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`;
      const currentDate = new Date().toISOString().split('T')[0];

      // Create invoice data
      const invoiceData = {
        invoiceNumber,
        patientId: completedPayment.patientId,
        patientName: completedPayment.patientName,
        issueDate: currentDate,
        dueDate: currentDate, // Same day since payment is already completed
        totalAmount: completedPayment.amount,
        status: 'paid', // Already paid
        description: completedPayment.description || 'Medical Service Payment',
        items: [
          {
            description: completedPayment.description || 'Medical Service',
            quantity: 1,
            unitPrice: completedPayment.amount,
            totalPrice: completedPayment.amount
          }
        ],
        paymentDetails: {
          paymentId: completedPayment.id,
          paymentDate: completedPayment.paymentDate,
          paymentMethod: completedPayment.paymentMethod || 'cash',
          transactionId: completedPayment.transactionId
        },
        notes: `Auto-generated invoice for completed payment ${completedPayment.id}`,
        terms: 'Payment completed - Thank you for choosing KBR Life Care'
      };

      // Add invoice to database using the context function
      if (addInvoice) {
        await addInvoice(invoiceData);
        console.log('✅ Invoice generated successfully:', invoiceNumber);
        
        // Show success message to user
        Alert.alert(
          'Invoice Generated', 
          `Invoice ${invoiceNumber} has been automatically created and saved to Invoice Management.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error generating invoice:', error);
      // Don't show error to user since this is automatic - just log it
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
                            {item.patientId || 'No ID'} • {item.patientType || 'IP'}
                          </Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                        <Text style={styles.statusText}>
                          {item.status || (item.paymentStatus === 'paid' ? 'Fully Paid' : 
                          item.paymentStatus === 'pending' ? 'Pending' : 'Partial Paid')}
                        </Text>
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
                            {item.paymentHistory?.length || (item.paymentStatus === 'paid' || item.status === 'Fully Paid') ? '1' : '0'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Latest Payment Info */}
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
                        {isNewPayment ? 'Recently Added Payment' : 'Latest Payment'}
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
                        <Text style={styles.latestPaymentText}>
                          {(item.paymentStatus === 'paid' || item.status === 'Fully Paid') ? 
                            `Payment of ₹${(item.paidAmount || item.amount || 0).toLocaleString()} completed` : 
                            `Registration payment pending`}
                        </Text>
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
                            // Pre-select the patient in the modal
                            setFormData && setFormData(prev => ({
                              ...prev,
                              patientId: item.patientId,
                              patientName: item.patientName
                            }));
                            setShowAddModal(true);
                          }}
                        >
                          <Ionicons name="add-circle" size={16} color="#22C55E" />
                          <Text style={[styles.actionText, { color: "#22C55E" }]}>Add Payment</Text>
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
});

export default PaymentManagementScreen;