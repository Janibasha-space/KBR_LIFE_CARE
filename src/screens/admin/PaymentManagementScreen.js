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
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';
import AddPaymentModal from '../../components/AddPaymentModal';
import AppHeader from '../../components/AppHeader';

const PaymentManagementScreen = ({ navigation }) => {
  const { patients, getAllPendingPayments, payments, addPayment, updatePaymentStatus, deletePayment, initializeFirebaseData, addInvoice } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
  }, []);

  // Refresh payments when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setIsLoading(true);
      if (initializeFirebaseData) {
        initializeFirebaseData().finally(() => setIsLoading(false));
      }
    });

    return unsubscribe;
  }, [navigation, initializeFirebaseData]);

  // Set loading to false when payments are available
  useEffect(() => {
    if (payments && payments.length >= 0) {
      setIsLoading(false);
    }
  }, [payments]);

  // Calculate real-time payment statistics from actual payments data
  const paymentStats = useMemo(() => {
    const totalPayments = payments?.length || 0;
    const totalRevenue = (payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const paidAmount = (payments || []).filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = (payments || []).filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const fullyPaidCount = (payments || []).filter(p => p.status === 'paid').length;
    const pendingCount = (payments || []).filter(p => p.status === 'pending').length;
    const partiallyPaidCount = (payments || []).filter(p => p.status === 'partial').length;

    return {
      totalRevenue: paidAmount,
      totalPending: pendingAmount,
      fullyPaidCount,
      partiallyPaidCount,
      pendingCount,
      totalPatients: totalPayments,
    };
  }, [payments]);

  // Transform actual payments data for display  
  const paymentList = useMemo(() => {
    // Ensure we always have data to work with
    if (!payments || payments.length === 0) {
      console.log('❌ No payments data available');
      return [];
    }
    
    // Enhanced deduplication: use Map for better performance and handle edge cases
    const uniquePaymentsMap = new Map();
    (payments || []).forEach((payment) => {
      const key = payment.id || `${payment.patientId}-${payment.amount}-${payment.date}`;
      if (!uniquePaymentsMap.has(key)) {
        uniquePaymentsMap.set(key, payment);
      }
    });
    const uniquePayments = Array.from(uniquePaymentsMap.values());

    const transformedPayments = uniquePayments.map((payment, index) => {
      // Find the corresponding patient for additional details
      const patient = patients.find(p => p.id === payment.patientId);
      // Generate stable unique key using payment data and index - no dynamic timestamps
      const uniqueKey = `payment-${payment.id || `temp-${index}`}-${payment.patientId || 'unknown'}-${index}`;
      return {
        id: uniqueKey, // Ensure stable unique ID
        originalId: payment.id, // Keep original ID for reference
        patientName: payment.patientName,
        patientId: payment.patientId,
        patientType: patient?.patientType || 'N/A',
        amount: payment.amount || payment.totalAmount || 1000, // Add fallback
        paymentStatus: payment.status || payment.paymentStatus || 'paid', // Add fallback
        totalAmount: payment.amount || payment.totalAmount || 1000,
        paidAmount: (payment.status === 'paid' || payment.paymentStatus === 'paid') ? (payment.amount || 1000) : 
                   (payment.status === 'partial' || payment.paymentStatus === 'partial') ? (payment.amount || 1000) * 0.5 : 0,
        dueAmount: (payment.status === 'paid' || payment.paymentStatus === 'paid') ? 0 : 
                  (payment.status === 'partial' || payment.paymentStatus === 'partial') ? (payment.amount || 1000) * 0.5 : (payment.amount || 1000),
        status: (payment.status === 'paid' || payment.paymentStatus === 'paid') ? 'Fully Paid' : 
                (payment.status === 'partial' || payment.paymentStatus === 'partial') ? 'Partially Paid' : 'Pending',
        statusColor: (payment.status === 'paid' || payment.paymentStatus === 'paid') ? '#10B981' : 
                    (payment.status === 'partial' || payment.paymentStatus === 'partial') ? '#F59E0B' : '#EF4444',
        lastPaymentDate: payment.paymentDate || payment.date,
        paymentHistory: [payment], // Single payment record
        registrationDate: patient?.registrationDate,
        method: payment.method,
        description: payment.description,
      };
    })
    .sort((a, b) => new Date(b.lastPaymentDate || b.registrationDate) - new Date(a.lastPaymentDate || a.registrationDate));
    
    console.log('✅ Successfully transformed', transformedPayments.length, 'payments');
    return transformedPayments;
    
    return transformedPayments;
  }, [payments, patients]);

  const filteredPayments = paymentList.filter(payment => {
    // Search filtering
    const matchesSearch = !searchQuery || 
                         (payment.patientName && payment.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (payment.originalId && payment.originalId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (payment.patientId && payment.patientId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Status filtering - ensure exact match or show all
    let matchesFilter = false;
    if (selectedFilter === 'All') {
      matchesFilter = true; // Show all payments
    } else if (selectedFilter === 'Fully Paid') {
      matchesFilter = payment.status === 'Fully Paid' || payment.status === 'paid';
    } else if (selectedFilter === 'Partially Paid') {
      matchesFilter = payment.status === 'Partially Paid' || payment.status === 'partial';
    } else if (selectedFilter === 'Pending') {
      matchesFilter = payment.status === 'Pending' || payment.status === 'pending';
    } else {
      matchesFilter = payment.status === selectedFilter;
    }
    
    return matchesSearch && matchesFilter;
  });

  // Log current filtering results
  console.log(`� Payments: ${paymentList.length} total → ${filteredPayments.length} filtered (${selectedFilter})`);
  
  // If no payments show but we have data, log the issue
  if (paymentList.length > 0 && filteredPayments.length === 0 && selectedFilter === 'All') {
    console.warn('⚠️ WARNING: No payments showing with "All" filter, but payments exist');
    paymentList.forEach(payment => {
      console.log(`   - ${payment.patientName}: "${payment.status}"`);
    });
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
      await addPayment(paymentData);
      Alert.alert('Success', 'Payment added successfully!');
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      Alert.alert('Error', 'Failed to add payment. Please try again.');
    }
  };

  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
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
      // Find the payment that was just completed
      const completedPayment = payments.find(p => p.id === paymentId);
      if (!completedPayment) {
        console.error('Payment not found for invoice generation');
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
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete payment for ${payment.patientName}?\n\nAmount: ₹${payment.amount}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePayment(payment.id);
              Alert.alert('Success', 'Payment deleted successfully!');
            } catch (error) {
              console.error('Error deleting payment:', error);
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
      />
      <SafeAreaView style={[styles.safeArea]} edges={['left', 'right']}>
        {/* Fixed Header Container */}
        <View style={styles.fixedHeader}>
          {/* Header Content - Statistics, Search, Filters */}
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

        {/* Search and Filter */}
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
        </View>
        {/* End Fixed Header */}

        {/* Scrollable Content Container */}
        <View style={styles.scrollableContent}>


          {/* Payment List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading payments...</Text>
          </View>
        ) : filteredPayments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Payments Found</Text>
            <Text style={styles.emptyMessage}>
              {payments?.length === 0 
                ? "No payment records available. Add the first payment to get started."
                : `Found ${payments?.length} payments but ${filteredPayments.length} after filtering. Filter: ${selectedFilter}, Search: "${searchQuery}"`
              }
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Add Payment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredPayments}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
            style={{ flex: 1, backgroundColor: '#F5F5F5' }}
            ListHeaderComponent={() => (
              <View style={{ backgroundColor: '#4CAF50', padding: 15, margin: 10, borderRadius: 8 }}>
                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                  📋 Showing {filteredPayments.length} Payment Cards
                </Text>
              </View>
            )}
            renderItem={({ item, index }) => {
              return (
                <View style={[styles.paymentCard, { backgroundColor: '#FFFFFF', margin: 10, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }]}>
                  <View style={styles.paymentHeader}>
                  <View style={styles.patientInfo}>
                    <View style={styles.patientAvatar}>
                      <Text style={styles.avatarText}>
                        {item.patientName?.charAt(0)?.toUpperCase() || 'P'}
                      </Text>
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{item.patientName}</Text>
                      <Text style={styles.patientMeta}>
                        {item.patientId} • {item.patientType || 'IP'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: (item.paymentStatus === 'paid' || item.status === 'Fully Paid') ? '#22C55E' : 
                                   (item.paymentStatus === 'pending' || item.status === 'Pending') ? '#EF4444' : '#F59E0B' 
                  }]}>
                    <Text style={styles.statusText}>
                      {item.status || (item.paymentStatus === 'paid' ? 'Fully Paid' : 
                       item.paymentStatus === 'pending' ? 'Pending' : 'Partial Paid')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.paymentAmounts}>
                  <View style={styles.amountGrid}>
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>Total Amount</Text>
                      <Text style={styles.amountValue}>₹{(item.totalAmount || item.amount || 0).toLocaleString()}</Text>
                    </View>
                    
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>Amount Paid</Text>
                      <Text style={styles.amountValue}>
                        ₹{(item.paidAmount || 0).toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>Due Amount</Text>
                      <Text style={[styles.amountValue, { 
                        color: (item.dueAmount || 0) > 0 ? "#EF4444" : "#22C55E" 
                      }]}>
                        ₹{(item.dueAmount || 0).toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>Payments Made</Text>
                      <Text style={[styles.amountValue, { color: "#4A90E2" }]}>
                        {(item.paymentStatus === 'paid' || item.status === 'Fully Paid') ? '1' : '0'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewDetails(item)}
                  >
                    <Ionicons name="eye" size={16} color="#4A90E2" />
                    <Text style={[styles.actionText, { color: "#4A90E2" }]}>View Patient</Text>
                  </TouchableOpacity>
                  
                  {(item.paymentStatus !== 'paid' && item.status !== 'Fully Paid') && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleUpdatePaymentStatus(item.id, 'paid')}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                      <Text style={[styles.actionText, { color: "#22C55E" }]}>Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => Alert.alert('Invoice', 'Generate/Download invoice feature coming soon!')}
                  >
                    <Ionicons name="document-text" size={16} color="#8B5CF6" />
                    <Text style={[styles.actionText, { color: "#8B5CF6" }]}>Invoice</Text>
                  </TouchableOpacity>
                </View>
              </View>
              );
            }}
          />
        )}
        </View>
        {/* End Scrollable Content */}
      </View>

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
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPayment}
        patients={patients}
      />
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
    backgroundColor: Colors.background || '#FFFFFF',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Statistics Styles
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
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 14,
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
    color: '#9CA3AF',
  },
  // Search and Filter Styles
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  filterIcon: {
    marginLeft: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
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
  },
  // Payment List Styles
  paymentList: {
    padding: 16,
    paddingBottom: 90, // Extra space for FAB
  },
  paymentCard: {
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
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
  },
  patientMeta: {
    fontSize: 12,
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
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  latestPayment: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90E2',
  },
  latestPaymentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  latestPaymentText: {
    fontSize: 12,
    color: '#6B7280',
  },
  cardActions: {
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
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  fixedHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});

export default PaymentManagementScreen;