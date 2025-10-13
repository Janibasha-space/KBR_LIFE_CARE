import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';

const PaymentManagementScreen = ({ navigation }) => {
  const { patients, getAllPendingPayments } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Calculate real-time payment statistics from patient data
  const paymentStats = useMemo(() => {
    const patientsWithPayments = patients.filter(patient => patient.paymentDetails);
    
    const totalRevenue = patientsWithPayments.reduce((sum, patient) => 
      sum + (patient.paymentDetails?.totalPaid || 0), 0);
    
    const totalPending = patientsWithPayments.reduce((sum, patient) => 
      sum + (patient.paymentDetails?.dueAmount || 0), 0);
    
    const fullyPaidCount = patientsWithPayments.filter(patient => 
      patient.paymentDetails?.dueAmount <= 0).length;
    
    const partiallyPaidCount = patientsWithPayments.filter(patient => 
      patient.paymentDetails && patient.paymentDetails.dueAmount > 0 && patient.paymentDetails.totalPaid > 0).length;
    
    const pendingCount = patientsWithPayments.filter(patient => 
      patient.paymentDetails?.totalPaid === 0).length;

    return {
      totalRevenue,
      totalPending,
      fullyPaidCount,
      partiallyPaidCount,
      pendingCount,
      totalPatients: patientsWithPayments.length,
    };
  }, [patients]);

  // Transform patient payment data for display
  const paymentList = useMemo(() => {
    return patients
      .filter(patient => patient.paymentDetails)
      .map(patient => ({
        id: patient.id,
        patientName: patient.name,
        patientId: patient.id,
        patientType: patient.patientType,
        totalAmount: patient.paymentDetails.totalAmount,
        paidAmount: patient.paymentDetails.totalPaid,
        dueAmount: patient.paymentDetails.dueAmount,
        status: patient.paymentDetails.dueAmount <= 0 ? 'Fully Paid' : 
                patient.paymentDetails.totalPaid > 0 ? 'Partially Paid' : 'Pending',
        statusColor: patient.paymentDetails.dueAmount <= 0 ? '#10B981' : 
                    patient.paymentDetails.totalPaid > 0 ? '#F59E0B' : '#EF4444',
        lastPaymentDate: patient.paymentDetails.lastPaymentDate,
        paymentHistory: patient.paymentDetails.payments || [],
        registrationDate: patient.registrationDate,
      }))
      .sort((a, b) => new Date(b.lastPaymentDate || b.registrationDate) - new Date(a.lastPaymentDate || a.registrationDate));
  }, [patients]);

  const filteredPayments = paymentList.filter(payment => {
    const matchesSearch = payment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || payment.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (payment) => {
    // Navigate to PatientDetails instead of PaymentDetails for better integration
    const patient = patients.find(p => p.id === payment.patientId);
    if (patient) {
      navigation.navigate('PatientDetails', { patient });
    } else {
      Alert.alert('Error', 'Patient details not found');
    }
  };

  const handleAddPayment = (payment) => {
    const patient = patients.find(p => p.id === payment.patientId);
    if (patient) {
      navigation.navigate('PatientDetails', { 
        patient,
        openPaymentModal: true // Pass flag to open payment modal
      });
    } else {
      Alert.alert('Error', 'Patient not found');
    }
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

  const PaymentCard = ({ payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.patientInfo}>
          <View style={styles.patientAvatar}>
            <Text style={styles.avatarText}>{payment.patientName.charAt(0)}</Text>
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
            <Text style={[styles.amountValue, { color: Colors.kbrGreen }]}>
              {formatCurrency(payment.paidAmount)}
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Due Amount</Text>
            <Text style={[styles.amountValue, { color: payment.dueAmount > 0 ? Colors.kbrRed : Colors.kbrGreen }]}>
              {formatCurrency(payment.dueAmount)}
            </Text>
          </View>
          
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>Payments Made</Text>
            <Text style={[styles.amountValue, { color: Colors.kbrBlue }]}>
              {payment.paymentHistory.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Latest Payment Info */}
      {payment.paymentHistory.length > 0 && (
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
      )}

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment Management</Text>
          <Text style={styles.headerSubtitle}>Track all IP & OP payments and invoices</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Revenue Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, { backgroundColor: '#E8F5E8' }]}>
              <Text style={styles.statsTitle}>Total Revenue</Text>
              <Text style={[styles.statsAmount, { color: Colors.kbrGreen }]}>
                ₹{paymentStats.totalRevenue.toLocaleString()}
              </Text>
              <Text style={styles.statsSubtitle}>{paymentStats.fullyPaidCount} fully paid</Text>
            </View>
            
            <View style={[styles.statsCard, { backgroundColor: '#FFF3CD' }]}>
              <Text style={styles.statsTitle}>Pending Dues</Text>
              <Text style={[styles.statsAmount, { color: Colors.kbrRed }]}>
                ₹{paymentStats.totalPending.toLocaleString()}
              </Text>
              <Text style={styles.statsSubtitle}>{paymentStats.partiallyPaidCount + paymentStats.pendingCount} pending</Text>
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={[styles.statsCard, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.statsTitle}>Partially Paid</Text>
              <Text style={[styles.statsAmount, { color: Colors.kbrPurple }]}>
                {paymentStats.partiallyPaidCount}
              </Text>
              <Text style={styles.statsSubtitle}>patients</Text>
            </View>
            
            <View style={[styles.statsCard, { backgroundColor: '#F3F4F6' }]}>
              <Text style={styles.statsTitle}>Total Patients</Text>
              <Text style={[styles.statsAmount, { color: Colors.kbrBlue }]}>
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

        {/* Payment List */}
        <FlatList
          data={filteredPayments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PaymentCard payment={item} />}
          contentContainerStyle={styles.paymentList}
          showsVerticalScrollIndicator={false}
        />
      </View>
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
    backgroundColor: Colors?.kbrBlue || '#3B82F6',
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
  },
  activeFilterTab: {
    backgroundColor: Colors?.kbrBlue || '#3B82F6',
    borderColor: Colors?.kbrBlue || '#3B82F6',
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
    paddingBottom: 20,
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
    backgroundColor: Colors?.kbrBlue || '#3B82F6',
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
    borderLeftColor: Colors?.kbrBlue || '#3B82F6',
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
});

export default PaymentManagementScreen;