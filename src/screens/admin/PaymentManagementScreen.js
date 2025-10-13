import React, { useState } from 'react';
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

const PaymentManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Mock data for revenue stats - matching your UI
  const revenueStats = {
    totalRevenue: 96800,
    paidInvoices: 2,
    pendingPayments: 32000,
    pendingInvoices: 1
  };

  // Mock data for payments - matching your UI exactly
  const payments = [
    {
      id: 'INV-2024-001',
      patientName: 'Rajesh Kumar',
      patientId: 'KBR-IP-2024-001',
      totalAmount: 45600,
      paidAmount: 45600,
      status: 'Paid',
      statusColor: '#10B981',
      date: '2024-01-10',
      paymentMethod: 'Card'
    },
    {
      id: 'INV-2024-002',
      patientName: 'Priya Sharma',
      patientId: 'KBR-OP-2024-501',
      totalAmount: 1200,
      paidAmount: 1200,
      status: 'Paid',
      statusColor: '#10B981',
      date: '2024-01-10',
      paymentMethod: 'UPI'
    },
    {
      id: 'INV-2024-003',
      patientName: 'Amit Patel',
      patientId: 'KBR-IP-2024-002',
      totalAmount: 78500,
      paidAmount: 50000,
      balance: 28500,
      status: 'Partial',
      statusColor: '#F59E0B',
      date: '2024-01-12',
      paymentMethod: 'Multiple'
    }
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || payment.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (payment) => {
    // Map the payment data to match PaymentDetailsScreen expectations
    const mappedPayment = {
      ...payment,
      amount: payment.totalAmount, // Map totalAmount to amount for PaymentDetailsScreen
    };
    navigation.navigate('PaymentDetails', { payment: mappedPayment });
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
        <View style={styles.statusIndicator}>
          <View style={[styles.statusCircle, { backgroundColor: payment.statusColor }]} />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.patientName}>{payment.patientName}</Text>
          <Text style={styles.invoiceInfo}>{payment.id} • {payment.patientId}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: payment.statusColor }]}>
          <Text style={styles.statusText}>{payment.status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(payment.totalAmount)}</Text>
        </View>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Paid</Text>
          <Text style={[styles.amountValue, { color: '#10B981' }]}>{formatCurrency(payment.paidAmount)}</Text>
        </View>
        {payment.balance && (
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Balance</Text>
            <Text style={[styles.amountValue, { color: '#EF4444' }]}>{formatCurrency(payment.balance)}</Text>
          </View>
        )}
        <View style={styles.paymentMethodRow}>
          <Ionicons name="calendar" size={14} color="#6B7280" />
          <Text style={styles.paymentMethodText}>{payment.date} • {payment.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(payment)}
        >
          <Ionicons name="eye" size={16} color="#DC2626" />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download" size={16} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment Management</Text>
          <Text style={styles.headerSubtitle}>Track all IP & OP payments and invoices</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Revenue Cards */}
        <View style={styles.revenueContainer}>
          <View style={[styles.revenueCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.revenueTitle}>Total Revenue</Text>
            <Text style={[styles.revenueAmount, { color: '#16A34A' }]}>₹{(revenueStats.totalRevenue || 0).toLocaleString()}</Text>
            <Text style={styles.revenueSubtitle}>{revenueStats.paidInvoices || 0} paid invoices</Text>
          </View>
          <View style={[styles.revenueCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.revenueTitle}>Pending</Text>
            <Text style={[styles.revenueAmount, { color: '#D97706' }]}>₹{(revenueStats.pendingPayments || 0).toLocaleString()}</Text>
            <Text style={styles.revenueSubtitle}>{revenueStats.pendingInvoices || 0} pending payments</Text>
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
          
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>All</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
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
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
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
  revenueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  revenueCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  revenueTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  revenueSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 4,
  },
  paymentList: {
    paddingBottom: 20,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    marginRight: 12,
  },
  statusCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  paymentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  invoiceInfo: {
    fontSize: 12,
    color: '#6B7280',
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
  paymentDetails: {
    marginBottom: 12,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadButton: {
    padding: 4,
  },
});

export default PaymentManagementScreen;