import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
  StatusBar,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';
import CreateInvoiceModal from '../../components/CreateInvoiceModal';
import InvoiceDetailsModal from '../../components/InvoiceDetailsModal';
import AppHeader from '../../components/AppHeader';

const InvoiceManagementScreen = ({ navigation }) => {
  const { invoices, addInvoice, updateInvoiceStatus, deleteInvoice, patients } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Debug invoice data
  useEffect(() => {
    console.log('🧾 Invoice Management - Debug Info:');
    console.log('📊 Total invoices:', invoices?.length || 0);
    console.log('📋 Invoices data:', invoices);
    console.log('🔍 Filtered invoices:', filteredInvoices?.length || 0);
    console.log('🎯 Current filter:', filterStatus);
    console.log('🔎 Search query:', searchQuery);
    
    if (__DEV__) {
      // This helps remove debugging overlays in development
      console.disableYellowBox = true;
    }
  }, [invoices, filteredInvoices, filterStatus, searchQuery]);

  // Filter invoices based on search and filters
  const filteredInvoices = (invoices || []).filter(invoice => {
    if (!invoice) return false;
    
    const matchesSearch = !searchQuery.trim() || 
                         (invoice.patientName && invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (invoice.description && invoice.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate summary statistics
  const totalInvoices = invoices?.length || 0;
  const totalAmount = (invoices || []).reduce((sum, invoice) => sum + (invoice.totalAmount || 0), 0);
  const paidInvoices = (invoices || []).filter(i => i.status === 'paid').length;
  const pendingInvoices = (invoices || []).filter(i => i.status === 'pending').length;
  const overdueInvoices = (invoices || []).filter(i => i.status === 'overdue').length;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return Colors.kbrGreen;
      case 'pending':
        return Colors.warning;
      case 'overdue':
        return Colors.kbrRed;
      case 'cancelled':
        return Colors.textSecondary;
      case 'draft':
        return Colors.gray;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'overdue':
        return 'warning';
      case 'cancelled':
        return 'close-circle';
      case 'draft':
        return 'document';
      default:
        return 'document-outline';
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      await addInvoice(invoiceData);
      Alert.alert('Success', 'Invoice created successfully!');
    } catch (error) {
      console.error('Error creating invoice:', error);
      Alert.alert('Error', 'Failed to create invoice. Please try again.');
    }
  };



  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const handleGeneratePDF = async (invoice) => {
    try {
      Alert.alert(
        'Generate PDF',
        'Choose PDF action:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'View PDF', 
            onPress: () => {
              // In a real app, you would generate the PDF and open it
              Alert.alert('PDF Generated', `PDF for ${invoice.invoiceNumber} is ready to view!`);
            }
          },
          { 
            text: 'Download PDF', 
            onPress: () => {
              // In a real app, you would download the PDF
              Alert.alert('Download Started', `Downloading PDF for ${invoice.invoiceNumber}...`);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    }
  };

  const handleSendInvoice = async (invoice) => {
    const invoiceText = `
Invoice: ${invoice.invoiceNumber}
Patient: ${invoice.patientName}
Amount: ₹${invoice.totalAmount?.toLocaleString()}
Description: ${invoice.description}
Due Date: ${invoice.dueDate}

KBR Life Care Hospital
    `.trim();

    try {
      Alert.alert(
        'Send Invoice',
        `How would you like to send invoice ${invoice.invoiceNumber}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Share via Apps', 
            onPress: async () => {
              try {
                await Share.share({
                  message: invoiceText,
                  title: `Invoice ${invoice.invoiceNumber}`
                });
              } catch (error) {
                Alert.alert('Error', 'Failed to share invoice');
              }
            }
          },
          { 
            text: 'WhatsApp', 
            onPress: () => {
              const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(invoiceText)}`;
              Linking.canOpenURL(whatsappUrl).then(supported => {
                if (supported) {
                  Linking.openURL(whatsappUrl);
                } else {
                  Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature');
                }
              });
            }
          },
          { 
            text: 'Email', 
            onPress: () => {
              const emailUrl = `mailto:?subject=Invoice ${invoice.invoiceNumber}&body=${encodeURIComponent(invoiceText)}`;
              Linking.canOpenURL(emailUrl).then(supported => {
                if (supported) {
                  Linking.openURL(emailUrl);
                } else {
                  Alert.alert('Email not available', 'No email client found');
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send invoice. Please try again.');
    }
  };

  const handleUpdateStatus = (invoice) => {
    const statusOptions = [
      { label: 'Draft', value: 'draft' },
      { label: 'Pending', value: 'pending' },
      { label: 'Paid', value: 'paid' },
      { label: 'Overdue', value: 'overdue' },
      { label: 'Cancelled', value: 'cancelled' }
    ];

    const currentStatusIndex = statusOptions.findIndex(opt => opt.value === invoice.status);
    const availableStatuses = statusOptions.filter(opt => opt.value !== invoice.status);

    Alert.alert(
      'Update Status',
      `Current status: ${invoice.status?.toUpperCase()}\n\nSelect new status for invoice ${invoice.invoiceNumber}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...availableStatuses.map(status => ({
          text: status.label,
          onPress: async () => {
            try {
              await updateInvoiceStatus(invoice.id, status.value);
              Alert.alert(
                'Status Updated',
                `Invoice ${invoice.invoiceNumber} status changed to ${status.label}`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error updating invoice status:', error);
              Alert.alert('Error', 'Failed to update status. Please try again.');
            }
          }
        }))
      ]
    );
  };

  const handleDeleteInvoice = (invoice) => {
    Alert.alert(
      'Delete Invoice',
      `Are you sure you want to delete invoice ${invoice.invoiceNumber}?\n\nPatient: ${invoice.patientName}\nAmount: ₹${invoice.totalAmount?.toLocaleString()}\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvoice(invoice.id);
              Alert.alert(
                'Deleted Successfully', 
                `Invoice ${invoice.invoiceNumber} has been deleted.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error deleting invoice:', error);
              Alert.alert('Error', 'Failed to delete invoice. Please try again.');
            }
          }
        },
      ]
    );
  };

  const InvoiceCard = ({ invoice }) => {
    // Safety check for invoice data
    if (!invoice) {
      console.warn('⚠️ InvoiceCard: Received null/undefined invoice');
      return null;
    }

    return (
      <View style={styles.invoiceCard}>
        <View style={styles.invoiceHeader}>
          <View style={styles.invoiceIcon}>
            <Ionicons 
              name={getStatusIcon(invoice.status)} 
              size={24} 
              color={getStatusColor(invoice.status)} 
            />
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber || 'N/A'}</Text>
            <Text style={styles.patientName}>{invoice.patientName || 'Unknown Patient'}</Text>
            <Text style={styles.invoiceDescription}>{invoice.description || 'No description'}</Text>
          </View>
          <View style={styles.invoiceRight}>
            <Text style={styles.invoiceAmount}>₹{(invoice.totalAmount || 0).toLocaleString()}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
              <Text style={styles.statusText}>{(invoice.status || 'draft').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.invoiceDetails}>
          <View style={styles.invoiceMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>Issue: {invoice.issueDate || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>Due: {invoice.dueDate || 'N/A'}</Text>
            </View>
          </View>
          
          {/* Invoice Items Summary */}
          {invoice.items && invoice.items.length > 0 && (
            <View style={styles.itemsPreview}>
              <Text style={styles.itemsTitle}>Items ({invoice.items.length}):</Text>
              {invoice.items.slice(0, 2).map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>• {item.name}</Text>
                  <Text style={styles.itemAmount}>₹{(item.amount || 0).toLocaleString()}</Text>
                </View>
              ))}
              {invoice.items.length > 2 && (
                <Text style={styles.moreItems}>+{invoice.items.length - 2} more items</Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.invoiceActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleViewInvoice(invoice)}>
              <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
              <Text style={[styles.actionText, { color: Colors.kbrBlue }]}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleUpdateStatus(invoice)}>
              <Ionicons name="refresh" size={16} color={Colors.warning} />
              <Text style={[styles.actionText, { color: Colors.warning }]}>Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleGeneratePDF(invoice)}>
              <Ionicons name="document" size={16} color={Colors.kbrGreen} />
              <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleSendInvoice(invoice)}>
              <Ionicons name="send" size={16} color={Colors?.kbrBlue || '#4A90E2'} />
              <Text style={[styles.actionText, { color: Colors?.kbrBlue || '#4A90E2' }]}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteInvoice(invoice)}>
              <Ionicons name="trash" size={16} color={Colors.kbrRed} />
              <Text style={[styles.actionText, { color: Colors.kbrRed }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors?.kbrBlue || '#4A90E2'} barStyle="light-content" translucent={true} />
      
      {/* Header - Using AppHeader component for consistent look */}
      <AppHeader
        title="Invoice Management"
        subtitle="Create & manage billing invoices"
        navigation={navigation}
        showBackButton={true}
        useSimpleAdminHeader={true}
      />
      
      {/* Add Invoice Button */}
      <TouchableOpacity 
        style={styles.floatingAddButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>

      {/* Dashboard Statistics */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statCircle}>
          <View style={[styles.circleIcon, { backgroundColor: Colors.kbrRed }]}>
            <Ionicons name="document-text" size={24} color={Colors.white} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statCount}>{totalInvoices}</Text>
            <Text style={styles.statTitle}>Total</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCircle}>
          <View style={[styles.circleIcon, { backgroundColor: Colors.kbrGreen }]}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.white} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statCount}>{paidInvoices}</Text>
            <Text style={styles.statTitle}>Paid</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCircle}>
          <View style={[styles.circleIcon, { backgroundColor: Colors.warning }]}>
            <Ionicons name="time" size={24} color={Colors.white} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statCount}>{pendingInvoices}</Text>
            <Text style={styles.statTitle}>Pending</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCircle}>
          <View style={[styles.circleIcon, { backgroundColor: Colors.kbrRed }]}>
            <Ionicons name="alert-circle" size={24} color={Colors.white} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statCount}>{overdueInvoices}</Text>
            <Text style={styles.statTitle}>Overdue</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCircle}>
          <View style={[styles.circleIcon, { backgroundColor: Colors.kbrBlue }]}>
            <Ionicons name="cash" size={24} color={Colors.white} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statCount}>₹{totalAmount.toLocaleString()}</Text>
            <Text style={styles.statTitle}>Total Value</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterTabs}
        >
          {['all', 'draft', 'pending', 'paid', 'overdue', 'cancelled'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filterStatus === status && styles.activeFilterTab
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.filterTabText,
                filterStatus === status && styles.activeFilterTabText
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item, index) => `invoice-${item.id || item.invoiceNumber || 'no-id'}-${index}`}
        renderItem={({ item }) => <InvoiceCard invoice={item} />}
        contentContainerStyle={styles.invoicesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={Colors.lightGray} />
            <Text style={styles.emptyTitle}>No Invoices Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first invoice to get started'
              }
            </Text>
          </View>
        }
      />

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateInvoice}
        patients={patients}
      />

      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        visible={showDetailsModal}
        invoice={selectedInvoice}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedInvoice(null);
        }}
        onGeneratePDF={handleGeneratePDF}
        onSendInvoice={handleSendInvoice}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    position: 'relative',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.kbrBlue || '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 999,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 0,
  },
  statCircle: {
    alignItems: 'center',
    marginHorizontal: 5,
    width: 65,
  },
  circleIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  statTextContainer: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  summaryScroll: {
    backgroundColor: Colors?.white || '#FFFFFF',
    paddingVertical: 16,
    paddingTop: 20,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: Colors?.white || '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors?.border || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors?.textPrimary || '#1F2937',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors?.textSecondary || '#6B7280',
    textAlign: 'center',
  },
  filtersContainer: {
    backgroundColor: Colors?.white || '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors?.border || '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1F2937',
  },
  filterTabs: {
    flexDirection: 'row',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: Colors?.kbrBlue || '#4A90E2',
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
  invoicesList: {
    padding: 16,
  },
  invoiceCard: {
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
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  invoiceDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
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
  invoiceDetails: {
    marginBottom: 12,
  },
  invoiceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  itemsPreview: {
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
  invoiceActions: {
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
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  actionText: {
    fontSize: 10,
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

export default InvoiceManagementScreen;