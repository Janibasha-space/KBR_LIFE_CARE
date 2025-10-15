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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';
import CreateInvoiceModal from '../../components/CreateInvoiceModal';

const InvoiceManagementScreen = ({ navigation }) => {
  const { invoices, addInvoice, updateInvoiceStatus, deleteInvoice, patients } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Debug invoice data
  useEffect(() => {
    console.log('🧾 Invoice Management - Debug Info:');
    console.log('📊 Total invoices:', invoices?.length || 0);
    console.log('📋 Invoices data:', invoices);
    console.log('🔍 Filtered invoices count:', filteredInvoices?.length || 0);
    console.log('🎯 Current filter:', filterStatus);
    console.log('🔎 Search query:', searchQuery);
    
    if (__DEV__) {
      console.disableYellowBox = true;
    }
  }, [invoices, searchQuery, filterStatus]);

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

  const handleCreateInvoice = (invoiceData) => {
    addInvoice(invoiceData);
    Alert.alert('Success', 'Invoice created successfully!');
  };

  const handleUpdateStatus = (invoice) => {
    const statusOptions = [
      { text: 'Mark as Draft', value: 'draft' },
      { text: 'Mark as Pending', value: 'pending' },
      { text: 'Mark as Paid', value: 'paid' },
      { text: 'Mark as Overdue', value: 'overdue' },
      { text: 'Mark as Cancelled', value: 'cancelled' },
      { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert(
      'Update Invoice Status',
      `Current status: ${invoice.status.toUpperCase()}`,
      statusOptions.map(option => ({
        text: option.text,
        onPress: option.value ? () => {
          updateInvoiceStatus(invoice.id, option.value);
          Alert.alert('Success', `Invoice status updated to ${option.value.toUpperCase()}`);
        } : undefined,
        style: option.style
      }))
    );
  };

  const InvoiceCard = ({ invoice }) => {
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
            <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
              <Ionicons name="eye" size={16} color={Colors.kbrBlue} />
              <Text style={[styles.actionText, { color: Colors.kbrBlue }]}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleUpdateStatus(invoice)}>
              <Ionicons name="refresh" size={16} color={Colors.warning} />
              <Text style={[styles.actionText, { color: Colors.warning }]}>Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
              <Ionicons name="document" size={16} color={Colors.kbrGreen} />
              <Text style={[styles.actionText, { color: Colors.kbrGreen }]}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
              <Ionicons name="send" size={16} color={Colors?.kbrBlue || '#4A90E2'} />
              <Text style={[styles.actionText, { color: Colors?.kbrBlue || '#4A90E2' }]}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => {
              Alert.alert('Delete Invoice', 'Are you sure you want to delete this invoice?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteInvoice(invoice.id) }
              ]);
            }}>
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
      <StatusBar backgroundColor={Colors?.kbrBlue || '#4A90E2'} barStyle="light-content" translucent={false} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Invoice Management</Text>
          <Text style={styles.headerSubtitle}>Create & manage billing invoices</Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
        contentContainerStyle={styles.summaryContainer}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{totalInvoices}</Text>
          <Text style={styles.summaryLabel}>Total Invoices</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: Colors.kbrGreen }]}>
            {paidInvoices}
          </Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: Colors.warning }]}>
            {pendingInvoices}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: Colors.kbrRed }]}>
            {overdueInvoices}
          </Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryNumber, { color: Colors.kbrBlue }]}>
            ₹{totalAmount.toLocaleString()}
          </Text>
          <Text style={styles.summaryLabel}>Total Value</Text>
        </View>
      </ScrollView>

      {/* Search and Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
          {['all', 'draft', 'pending', 'paid', 'overdue', 'cancelled'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filterStatus === status && styles.activeFilterTab,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === status && styles.activeFilterTabText,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item?.id || Math.random().toString()}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors?.background || '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors?.kbrBlue || '#4A90E2',
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
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryScroll: {
    backgroundColor: Colors?.white || '#FFFFFF',
    paddingVertical: 16,
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
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  patientName: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  invoiceDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  invoiceRight: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  invoiceDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  invoiceMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 11,
    color: '#6B7280',
    flex: 1,
  },
  itemAmount: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  moreItems: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
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
  },
  actionText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default InvoiceManagementScreen;