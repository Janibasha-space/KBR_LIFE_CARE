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
import { useUser } from '../../contexts/UserContext';

const PatientPaymentHistoryScreen = ({ navigation }) => {
  const { payments, invoices, getInvoicesByPatient } = useApp();
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState('payments');

  // Filter payments and invoices for current patient
  const patientPayments = (payments || []).filter(payment => 
    payment.patientName === userData?.name || payment.patientId === userData?.patientId
  );

  const patientInvoices = getInvoicesByPatient ? 
    getInvoicesByPatient(userData?.patientId) : 
    (invoices || []).filter(invoice => 
      invoice.patientName === userData?.name || invoice.patientId === userData?.patientId
    );

  // Calculate summary statistics
  const totalPaid = patientPayments.reduce((sum, payment) => 
    payment.status === 'paid' ? sum + payment.amount : sum, 0);
  
  const totalPending = patientInvoices.reduce((sum, invoice) => 
    invoice.status === 'pending' || invoice.status === 'overdue' ? sum + invoice.totalAmount : sum, 0);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      case 'failed':
        return '#EF4444';
      case 'refunded':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
        return 'calendar';
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

  const handleViewPayment = (payment) => {
    Alert.alert(
      'Payment Details',
      `Payment ID: ${payment.id}\nAmount: ₹${payment.amount}\nStatus: ${payment.status}\nDate: ${payment.date}\nMethod: ${payment.paymentMethod}`,
      [{ text: 'OK' }]
    );
  };

  const handleViewInvoice = (invoice) => {
    const itemsText = invoice.items && invoice.items.length > 0 
      ? invoice.items.map(item => `• ${item.name}: ₹${item.amount}`).join('\n')
      : 'No items listed';

    Alert.alert(
      'Invoice Details',
      `Invoice: ${invoice.invoiceNumber}\nAmount: ₹${invoice.totalAmount}\nStatus: ${invoice.status}\nIssue Date: ${invoice.issueDate}\nDue Date: ${invoice.dueDate}\n\nItems:\n${itemsText}`,
      [{ text: 'OK' }]
    );
  };

  const handleDownloadReceipt = (item) => {
    Alert.alert('Download', `Downloading receipt for ${item.id || item.invoiceNumber}...`);
  };

  const PaymentCard = ({ payment }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons 
            name={getTypeIcon(payment.type)} 
            size={24} 
            color="#007AFF" 
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{payment.description || 'Payment'}</Text>
          <Text style={styles.cardSubtitle}>{payment.id}</Text>
          <Text style={styles.cardDate}>{payment.date} • {payment.time}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardAmount}>₹{payment.amount.toLocaleString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
            <Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Method:</Text>
          <Text style={styles.metaValue}>{payment.paymentMethod}</Text>
        </View>
        {payment.transactionId && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Transaction ID:</Text>
            <Text style={styles.metaValue}>{payment.transactionId}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewPayment(payment)}
        >
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadReceipt(payment)}
        >
          <Ionicons name="download" size={16} color="#10B981" />
          <Text style={styles.actionText}>Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const InvoiceCard = ({ invoice }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons 
            name="document-text" 
            size={24} 
            color="#8B5CF6" 
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{invoice.description}</Text>
          <Text style={styles.cardSubtitle}>{invoice.invoiceNumber}</Text>
          <Text style={styles.cardDate}>Issue: {invoice.issueDate} • Due: {invoice.dueDate}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardAmount}>₹{invoice.totalAmount.toLocaleString()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
            <Text style={styles.statusText}>{invoice.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {invoice.items && invoice.items.length > 0 && (
        <View style={styles.cardDetails}>
          <Text style={styles.itemsTitle}>Items ({invoice.items.length}):</Text>
          {invoice.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>• {item.name}</Text>
              <Text style={styles.itemAmount}>₹{item.amount}</Text>
            </View>
          ))}
          {invoice.items.length > 2 && (
            <Text style={styles.moreItems}>+{invoice.items.length - 2} more items</Text>
          )}
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewInvoice(invoice)}
        >
          <Ionicons name="eye" size={16} color="#8B5CF6" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadReceipt(invoice)}
        >
          <Ionicons name="download" size={16} color="#10B981" />
          <Text style={styles.actionText}>Download</Text>
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
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Payment History</Text>
          <Text style={styles.headerSubtitle}>Your payments & invoices</Text>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#10B981' }]}>
            ₹{totalPaid.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Total Paid</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
            ₹{totalPending.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{patientPayments.length}</Text>
          <Text style={styles.summaryLabel}>Payments</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{patientInvoices.length}</Text>
          <Text style={styles.summaryLabel}>Invoices</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <Ionicons 
            name="wallet" 
            size={20} 
            color={activeTab === 'payments' ? '#FFF' : '#6B7280'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'payments' && styles.activeTabText
          ]}>
            Payments ({patientPayments.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'invoices' && styles.activeTab]}
          onPress={() => setActiveTab('invoices')}
        >
          <Ionicons 
            name="document-text" 
            size={20} 
            color={activeTab === 'invoices' ? '#FFF' : '#6B7280'} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'invoices' && styles.activeTabText
          ]}>
            Invoices ({patientInvoices.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={activeTab === 'payments' ? patientPayments : patientInvoices}
        keyExtractor={(item) => item.id || item.invoiceNumber}
        renderItem={({ item }) => 
          activeTab === 'payments' ? <PaymentCard payment={item} /> : <InvoiceCard invoice={item} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'payments' ? 'wallet-outline' : 'document-text-outline'} 
              size={64} 
              color="#D1D5DB" 
            />
            <Text style={styles.emptyTitle}>
              No {activeTab === 'payments' ? 'Payments' : 'Invoices'} Found
            </Text>
            <Text style={styles.emptySubtitle}>
              Your {activeTab === 'payments' ? 'payment history' : 'invoices'} will appear here
            </Text>
          </View>
        }
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardAmount: {
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
  cardDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  actionText: {
    fontSize: 12,
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
});

export default PatientPaymentHistoryScreen;