import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';

const PaymentDetailsScreen = ({ navigation, route }) => {
  const { payment = {} } = route.params || {};

  // Extended mock data for payment details
  const paymentDetails = {
    ...payment,
    billBreakdown: [
      { item: 'Room Charges (5 days)', amount: 15000 },
      { item: 'Doctor Consultation', amount: 5000 },
      { item: 'Lab Tests', amount: 8500 },
      { item: 'Medications', amount: 12100 },
      { item: 'X-Ray', amount: 5000 }
    ],
    transactionHistory: [
      { 
        type: 'Advance', 
        amount: 20000, 
        date: '2024-01-05', 
        method: 'Cash',
        status: 'Completed'
      },
      { 
        type: 'Final Settlement', 
        amount: 25600, 
        date: '2024-01-10', 
        method: 'Card',
        status: 'Completed'
      }
    ]
  };

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  const handleDownloadInvoice = () => {
    Alert.alert('Download Invoice', 'Invoice will be downloaded to your device.');
  };

  const InfoSection = ({ title, children }) => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Payment Details"
        navigation={navigation}
        showBackButton={true}
        useSimpleAdminHeader={true}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Header */}
        <View style={styles.invoiceCard}>
          <View style={styles.invoiceIcon}>
            <Ionicons name="receipt" size={32} color="#34C759" />
          </View>
          
          <Text style={styles.invoiceId}>{payment.id || 'N/A'}</Text>
          <Text style={styles.invoiceDate}>Date: {payment.date || 'N/A'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: payment.statusColor || '#8E8E93' }]}>
            <Text style={styles.statusText}>{payment.status || 'Unknown'}</Text>
          </View>
        </View>

        {/* Patient Information */}
        <InfoSection title="Patient Information">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{payment.patientName || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient ID</Text>
            <Text style={styles.infoValue}>{payment.patientId || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={[styles.infoValue, styles.ipBadge]}>
              {(payment.patientId || '').includes('IP') ? 'IP' : 'OP'}
            </Text>
          </View>
        </InfoSection>

        {/* Bill Breakdown */}
        <InfoSection title="Bill Breakdown">
          {paymentDetails.billBreakdown.map((item, index) => (
            <View key={index} style={styles.billRow}>
              <Text style={styles.billItem}>{item.item}</Text>
              <Text style={styles.billAmount}>{formatCurrency(item.amount)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(payment.amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.paidLabel}>Paid Amount:</Text>
            <Text style={styles.paidAmount}>{formatCurrency(payment.paidAmount)}</Text>
          </View>
          {(payment.amount || 0) > (payment.paidAmount || 0) && (
            <View style={styles.totalRow}>
              <Text style={styles.pendingLabel}>Pending Amount:</Text>
              <Text style={styles.pendingAmount}>
                {formatCurrency((payment.amount || 0) - (payment.paidAmount || 0))}
              </Text>
            </View>
          )}
        </InfoSection>

        {/* Transaction History */}
        <InfoSection title="Transaction History">
          {paymentDetails.transactionHistory.map((transaction, index) => (
            <View key={index} style={styles.transactionRow}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionType}>{transaction.type}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
                <Text style={styles.transactionMethod}>{transaction.method}</Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.transactionAmountText}>
                  {formatCurrency(transaction.amount)}
                </Text>
                <Text style={styles.transactionStatus}>{transaction.status}</Text>
              </View>
            </View>
          ))}
        </InfoSection>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownloadInvoice}
          >
            <Ionicons name="download" size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download Invoice</Text>
          </TouchableOpacity>
          
          {(payment.status || '') === 'Pending' && (
            <TouchableOpacity style={styles.paymentButton}>
              <Ionicons name="card" size={20} color="#FFFFFF" />
              <Text style={styles.paymentButtonText}>Collect Payment</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share" size={20} color="#007AFF" />
            <Text style={styles.shareButtonText}>Share Invoice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  content: {
    flex: 1,
    paddingTop: 20,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceIcon: {
    marginBottom: 12,
  },
  invoiceId: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  ipBadge: {
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billItem: {
    fontSize: 14,
    color: '#1C1C1E',
    flex: 1,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  paidLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  paidAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34C759',
  },
  pendingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  pendingAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  transactionDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#34C759',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  actionButtons: {
    margin: 20,
    marginTop: 0,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  downloadButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  shareButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PaymentDetailsScreen;