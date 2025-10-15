import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const InvoiceDetailsModal = ({ visible, invoice, onClose, onGeneratePDF, onSendInvoice }) => {
  if (!invoice) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return Colors.kbrGreen;
      case 'pending': return Colors.warning;
      case 'overdue': return Colors.kbrRed;
      case 'draft': return Colors.textSecondary;
      case 'cancelled': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const calculateSubtotal = () => {
    return invoice.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Invoice Details</Text>
            <Text style={styles.headerSubtitle}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onGeneratePDF(invoice)}
            >
              <Ionicons name="download" size={20} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onSendInvoice(invoice)}
            >
              <Ionicons name="share" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Invoice Information */}
          <View style={styles.section}>
            <View style={styles.invoiceHeader}>
              <View>
                <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
                <Text style={styles.patientName}>{invoice.patientName}</Text>
                <Text style={styles.description}>{invoice.description}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
                <Text style={styles.statusText}>{(invoice.status || 'draft').toUpperCase()}</Text>
              </View>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invoice Dates</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Ionicons name="calendar" size={16} color={Colors.kbrBlue} />
                <Text style={styles.dateLabel}>Issue Date</Text>
                <Text style={styles.dateValue}>{invoice.issueDate || 'N/A'}</Text>
              </View>
              <View style={styles.dateItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors.warning} />
                <Text style={styles.dateLabel}>Due Date</Text>
                <Text style={styles.dateValue}>{invoice.dueDate || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items & Services</Text>
            <View style={styles.itemsContainer}>
              <View style={styles.itemsHeader}>
                <Text style={styles.itemHeaderText}>Description</Text>
                <Text style={styles.itemHeaderText}>Amount</Text>
              </View>
              {invoice.items?.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.itemDescription}>{item.description}</Text>
                    )}
                  </View>
                  <Text style={styles.itemAmount}>₹{(item.amount || 0).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Calculation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Billing Summary</Text>
            <View style={styles.calculationContainer}>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Subtotal</Text>
                <Text style={styles.calcValue}>₹{calculateSubtotal().toLocaleString()}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>GST (18%)</Text>
                <Text style={styles.calcValue}>₹{calculateTax().toLocaleString()}</Text>
              </View>
              <View style={[styles.calcRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{(invoice.totalAmount || calculateTotal()).toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Information</Text>
              {invoice.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Notes:</Text>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </View>
              )}
              {invoice.terms && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Terms & Conditions:</Text>
                  <Text style={styles.notesText}>{invoice.terms}</Text>
                </View>
              )}
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: Colors?.kbrBlue || '#4A90E2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors?.primary || '#1F2937',
    marginBottom: 15,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors?.primary || '#1F2937',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors?.kbrBlue || '#4A90E2',
    marginTop: 5,
  },
  description: {
    fontSize: 14,
    color: Colors?.textSecondary || '#6B7280',
    marginTop: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 12,
    color: Colors?.textSecondary || '#6B7280',
    marginTop: 5,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors?.primary || '#1F2937',
    marginTop: 2,
  },
  itemsContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors?.textSecondary || '#6B7280',
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors?.primary || '#1F2937',
  },
  itemDescription: {
    fontSize: 12,
    color: Colors?.textSecondary || '#6B7280',
    marginTop: 2,
  },
  itemAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors?.kbrBlue || '#4A90E2',
  },
  calculationContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  calcLabel: {
    fontSize: 14,
    color: Colors?.textSecondary || '#6B7280',
  },
  calcValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors?.primary || '#1F2937',
  },
  totalRow: {
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors?.primary || '#1F2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors?.kbrBlue || '#4A90E2',
  },
  notesContainer: {
    marginBottom: 15,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors?.primary || '#1F2937',
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: Colors?.textSecondary || '#6B7280',
    lineHeight: 20,
  },
});

export default InvoiceDetailsModal;