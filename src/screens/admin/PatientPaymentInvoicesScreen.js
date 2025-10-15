import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import AddPaymentInvoiceModal from '../../components/AddPaymentInvoiceModal';

const PatientPaymentInvoicesScreen = ({ route, navigation }) => {
  const { patientId, patientName } = route.params || {};
  const { payments, addPayment, updatePaymentStatus, deletePayment } = useApp() || {};
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filter payments for this specific patient
  const patientPayments = (payments || []).filter(payment => 
    payment && (payment.patientId === patientId || 
    payment.patientName === patientName)
  );

  // Mock payment data for the patient if no real payments exist
  const mockPayments = [
    {
      id: 'INV-2024-001',
      patientId: patientId,
      patientName: patientName,
      date: '2024-01-15',
      time: '10:30 AM',
      amount: 1200,
      description: 'Consultation Fee - Dr. K. Ramesh',
      type: 'consultation',
      status: 'paid',
      paymentMethod: 'Online',
      transactionId: 'TXN123456789',
      items: [
        { name: 'Doctor Consultation', amount: 800 },
        { name: 'Registration Fee', amount: 200 },
        { name: 'Medical Records', amount: 200 }
      ]
    },
    {
      id: 'INV-2024-002',
      patientId: patientId,
      patientName: patientName,
      date: '2024-01-16',
      time: '02:15 PM',
      amount: 2500,
      description: 'Laboratory Tests',
      type: 'tests',
      status: 'paid',
      paymentMethod: 'Cash',
      transactionId: 'TXN123456790',
      items: [
        { name: 'Complete Blood Count', amount: 500 },
        { name: 'Lipid Profile', amount: 800 },
        { name: 'X-Ray Chest', amount: 600 },
        { name: 'ECG', amount: 400 },
        { name: 'Processing Fee', amount: 200 }
      ]
    },
    {
      id: 'INV-2024-003',
      patientId: patientId,
      patientName: patientName,
      date: '2024-01-18',
      time: '11:45 AM',
      amount: 15000,
      description: 'Room Charges & Medications',
      type: 'admission',
      status: 'paid',
      paymentMethod: 'Card',
      transactionId: 'TXN123456791',
      items: [
        { name: 'Room Charges (3 days)', amount: 9000 },
        { name: 'Medications', amount: 3500 },
        { name: 'Nursing Care', amount: 2000 },
        { name: 'Service Charges', amount: 500 }
      ]
    },
    {
      id: 'INV-2024-004',
      patientId: patientId,
      patientName: patientName,
      date: '2024-01-20',
      time: '09:20 AM',
      amount: 800,
      description: 'Follow-up Consultation',
      type: 'consultation',
      status: 'pending',
      paymentMethod: 'Cash',
      transactionId: null,
      items: [
        { name: 'Follow-up Consultation', amount: 600 },
        { name: 'Prescription', amount: 200 }
      ]
    }
  ];

  // Use mock data if no real payments found
  const allPayments = patientPayments.length > 0 ? patientPayments : mockPayments;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'failed':
        return '#EF4444';
      case 'refunded':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'consultation':
        return 'medical';
      case 'tests':
        return 'flask';
      case 'admission':
        return 'bed';
      case 'surgery':
        return 'cut';
      case 'medicine':
        return 'medkit';
      default:
        return 'receipt';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'card':
        return 'card';
      case 'cash':
        return 'cash';
      case 'online':
        return 'phone-portrait';
      case 'upi':
        return 'qr-code';
      default:
        return 'wallet';
    }
  };

  const handleViewInvoice = (payment) => {
    const itemsText = payment.items && payment.items.length > 0 
      ? payment.items.map(item => `• ${item.name}: ₹${item.amount}`).join('\n')
      : 'No item details available';
      
    Alert.alert(
      'Invoice Details',
      `Invoice: ${payment.id}\nAmount: ₹${payment.amount}\nStatus: ${payment.status}\n\nItems:\n${itemsText}`,
      [
        { text: 'Download PDF', onPress: () => handleDownloadInvoice(payment) },
        { text: 'Share', onPress: () => handleShareInvoice(payment) },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleDownloadInvoice = (payment) => {
    Alert.alert('Download', `Downloading invoice ${payment.id}...`);
  };

  const handleShareInvoice = (payment) => {
    Alert.alert('Share Invoice', `Share invoice ${payment.id} via email or message?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Email', onPress: () => Alert.alert('Info', 'Opening email client...') },
      { text: 'WhatsApp', onPress: () => Alert.alert('Info', 'Opening WhatsApp...') },
    ]);
  };

  const handlePrintInvoice = (payment) => {
    Alert.alert('Print', `Printing invoice ${payment.id}...`);
  };

  const handleAddPayment = (invoiceData) => {
    addPayment(invoiceData);
    Alert.alert('Success', 'Payment invoice added successfully!');
  };

  const handleStatusUpdate = (payment) => {
    const statusOptions = [
      { text: 'Mark as Due', value: 'due', color: '#F59E0B' },
      { text: 'Mark as Partial', value: 'partial', color: '#FFA500' },
      { text: 'Mark as Paid', value: 'paid', color: '#10B981' },
      { text: 'Mark as Failed', value: 'failed', color: '#EF4444' },
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert(
      'Update Payment Status',
      `Current status: ${payment.status}\nInvoice: ${payment.id}`,
      statusOptions.map(option => ({
        text: option.text,
        style: option.style || 'default',
        onPress: option.value ? () => {
          updatePaymentStatus(payment.id, option.value);
          Alert.alert('Updated', `Payment status updated to ${option.value}`);
        } : undefined
      }))
    );
  };

  const handleDeletePayment = (payment) => {
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete invoice ${payment.id}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deletePayment(payment.id);
            Alert.alert('Deleted', 'Invoice deleted successfully');
          }
        },
      ]
    );
  };

  const totalPaid = (allPayments || [])
    .filter(p => p && p.status === 'paid')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const totalPending = (allPayments || [])
    .filter(p => p && p.status === 'pending')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  const PaymentCard = ({ payment }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.paymentIcon}>
          <Ionicons 
            name={getTypeIcon(payment.type || 'consultation')} 
            size={24} 
            color="#007AFF" 
          />
        </View>
        <View style={styles.paymentInfo}>
          <Text style={styles.invoiceNumber}>{payment.id || 'N/A'}</Text>
          <Text style={styles.paymentDescription}>{payment.description || 'Payment'}</Text>
          <Text style={styles.paymentMeta}>
            {payment.date || 'N/A'} • {payment.time || 'N/A'}
          </Text>
        </View>
        <View style={styles.paymentRight}>
          <Text style={styles.paymentAmount}>₹{(payment.amount || 0).toLocaleString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status || 'pending') }]}>
            <Text style={styles.statusText}>{(payment.status || 'pending').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.paymentMethodRow}>
          <Ionicons 
            name={getPaymentMethodIcon(payment.paymentMethod || 'cash')} 
            size={16} 
            color="#6B7280" 
          />
          <Text style={styles.paymentMethodText}>{payment.paymentMethod || 'Cash'}</Text>
          {payment.transactionId && (
            <Text style={styles.transactionId}>TXN: {payment.transactionId}</Text>
          )}
        </View>

        {/* Items breakdown */}
        {payment.items && Array.isArray(payment.items) && payment.items.length > 0 && (
          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>Items:</Text>
            {payment.items.slice(0, 2).map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.itemName}>• {item.name || 'Item'}</Text>
                <Text style={styles.itemAmount}>₹{item.amount || 0}</Text>
              </View>
            ))}
            {payment.items.length > 2 && (
              <Text style={styles.moreItems}>+{payment.items.length - 2} more items</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.paymentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewInvoice(payment)}
        >
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleStatusUpdate(payment)}
        >
          <Ionicons name="refresh" size={16} color="#F59E0B" />
          <Text style={styles.actionText}>Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShareInvoice(payment)}
        >
          <Ionicons name="share" size={16} color="#FF9500" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeletePayment(payment)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
          <Text style={styles.actionText}>Delete</Text>
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
          <Text style={styles.headerTitle}>Payment Invoices</Text>
          <Text style={styles.headerSubtitle}>{patientName}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{(allPayments || []).length}</Text>
            <Text style={styles.statLabel}>Total Invoices</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              ₹{totalPaid.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Paid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              ₹{totalPending.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      {/* Payments List */}
      <FlatList
        data={allPayments || []}
        keyExtractor={(item) => item.id || item.index || Math.random().toString()}
        renderItem={({ item }) => <PaymentCard payment={item} />}
        contentContainerStyle={styles.paymentsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Payment Records</Text>
            <Text style={styles.emptySubtitle}>
              Payment invoices will appear here once available
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Add Payment Invoice Modal */}
      <AddPaymentInvoiceModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPayment}
        patientId={patientId}
        patientName={patientName}
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
  searchButton: {
    marginLeft: 15,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  paymentsList: {
    padding: 16,
    paddingTop: 0,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  paymentMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  paymentDetails: {
    marginBottom: 16,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentMethodText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 6,
    marginRight: 12,
  },
  transactionId: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  itemsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemName: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  itemAmount: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default PatientPaymentInvoicesScreen;