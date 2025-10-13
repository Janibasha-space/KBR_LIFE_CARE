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
import { useApp } from '../../contexts/AppContext';

const AdminPharmacyScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Inventory');
  const [searchQuery, setSearchQuery] = useState('');

  // Use real data from AppContext
  const { pharmacy, addMedicine } = useApp();

  // Real-time pharmacy stats from AppContext
  const pharmacyStats = {
    inventoryValue: pharmacy.inventory.reduce((sum, med) => sum + (med.price * med.stock), 0),
    inventoryCount: pharmacy.inventory.length,
    totalSales: pharmacy.totalSales,
    todaySales: pharmacy.todaySales,
    transactionCount: pharmacy.sales.length,
    lowStockItems: pharmacy.inventory.filter(med => med.stock <= med.minStock).length,
    expiringItems: pharmacy.inventory.filter(med => {
      const expiryDate = new Date(med.expiry);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      return expiryDate <= threeMonthsFromNow;
    }).length
  };

  // Real medicine data from AppContext
  const medicines = pharmacy.inventory.map(med => ({
    ...med,
    statusColor: med.stock > med.minStock ? '#10B981' : med.stock > 0 ? '#F59E0B' : '#EF4444'
  }));

  // Real sales data from AppContext
  const salesData = pharmacy.sales.map(sale => ({
    id: sale.id,
    date: sale.date,
    patientName: sale.patientName,
    patientId: sale.patientId || 'N/A',
    items: [{
      name: sale.medicineName,
      qty: sale.quantity,
      price: sale.unitPrice
    }],
    total: sale.totalAmount,
    paymentMethod: sale.paymentMethod
  }));

  const filteredMedicines = medicines.filter(medicine => 
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (medicine.category && medicine.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
    medicine.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.supplier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to add new medicine to inventory
  const handleAddMedicine = () => {
    Alert.prompt(
      'Add New Medicine',
      'Enter medicine name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: (medicineName) => {
            if (medicineName) {
              const newMedicine = {
                name: medicineName,
                batchNo: `BATCH${Date.now()}`,
                stock: 100,
                minStock: 20,
                price: 10.00,
                salePrice: 12.00,
                expiry: '2025-12-31',
                supplier: 'Hospital Pharmacy',
                category: 'General',
                manufacturer: 'KBR Pharma'
              };
              addMedicine(newMedicine);
              Alert.alert('Success', 'Medicine added to inventory');
            }
          },
        },
      ],
    );
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const MedicineCard = ({ medicine }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineIconContainer}>
          <Ionicons name="medical" size={24} color="#3B82F6" />
        </View>
        <View style={styles.medicineInfo}>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDetails}>Stock: {medicine.stock} units</Text>
          <Text style={styles.medicineSubDetails}>Batch: {medicine.batchNo} | Exp: {medicine.expiry}</Text>
        </View>
        <View style={styles.medicineActions}>
          <View style={[styles.stockBadge, { 
            backgroundColor: medicine.stock > 10 ? '#DCFCE7' : medicine.stock > 0 ? '#FEF3C7' : '#FEE2E2'
          }]}>
            <Text style={[styles.stockText, {
              color: medicine.stock > 10 ? '#16A34A' : medicine.stock > 0 ? '#D97706' : '#DC2626'
            }]}>
              {medicine.stock} left
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.medicineFooter}>
        <View style={styles.priceInfo}>
          <Text style={styles.priceLabel}>Unit Price</Text>
          <Text style={styles.priceValue}>₹{medicine.price}</Text>
        </View>
        <View style={styles.supplierInfo}>
          <Text style={styles.supplierLabel}>Supplier</Text>
          <Text style={styles.supplierValue}>{medicine.supplier}</Text>
        </View>
      </View>
    </View>
  );

  const SalesCard = ({ sale }) => (
    <View style={styles.salesCard}>
      <View style={styles.salesHeader}>
        <View style={styles.salesInfo}>
          <Text style={styles.saleId}>{sale.id}</Text>
          <Text style={styles.saleDate}>{sale.date}</Text>
        </View>
        <Text style={styles.saleTotal}>₹{(sale.total || 0).toFixed(2)}</Text>
      </View>
      
      <View style={styles.salesDetails}>
        <Text style={styles.patientInfo}>{sale.patientName} - {sale.patientId}</Text>
        <Text style={styles.paymentMethod}>Payment: {sale.paymentMethod}</Text>
        
        <View style={styles.itemsList}>
          {sale.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>Qty: {item.qty} × ₹{item.price}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderInventoryTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Medicine List */}
      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MedicineCard medicine={item} />}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </ScrollView>
  );

  const renderSalesTab = () => (
    <View style={styles.tabContent}>
      {/* Sales Stats */}
      <View style={styles.statsRow}>
        <StatCard 
          title="Total Sales" 
          value={`₹${(pharmacyStats.totalSales || 0).toLocaleString()}`} 
          icon="wallet" 
          color="#34C759"
          subtitle="All time"
        />
        <StatCard 
          title="Today's Sales" 
          value={`₹${(pharmacyStats.todaySales || 0).toLocaleString()}`} 
          icon="today" 
          color="#007AFF"
          subtitle="Oct 12, 2025"
        />
      </View>

      {/* Sales List */}
      <FlatList
        data={salesData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SalesCard sale={item} />}
        contentContainerStyle={styles.salesList}
        showsVerticalScrollIndicator={false}
      />
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
          <Text style={styles.headerTitle}>Pharmacy Management</Text>
          <Text style={styles.headerSubtitle}>Complete Inventory, Sales & Purchase Management</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.statTitle}>Inventory Value</Text>
            <Text style={[styles.statAmount, { color: '#16A34A' }]}>₹{(pharmacyStats.inventoryValue || 0).toLocaleString()}</Text>
            <Text style={styles.statSubtitle}>{pharmacyStats.inventoryCount} medicines</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statTitle}>Total Sales</Text>
            <Text style={[styles.statAmount, { color: '#2563EB' }]}>₹{pharmacyStats.totalSales}</Text>
            <Text style={styles.statSubtitle}>{pharmacyStats.transactionCount} transactions</Text>
          </View>
        </View>

        {/* Alert Cards */}
        <View style={styles.alertsContainer}>
          <View style={styles.alertCard}>
            <Ionicons name="warning" size={16} color="#F59E0B" />
            <Text style={styles.alertText}>{pharmacyStats.lowStockItems} items are low on stock</Text>
          </View>
          <View style={[styles.alertCard, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="time" size={16} color="#DC2626" />
            <Text style={styles.alertText}>{pharmacyStats.expiringItems} items expiring within 3 months</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {['Inventory', 'Sales', 'Purchases'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search medicines..."
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

        {/* Add Medicine Button */}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Medicine</Text>
        </TouchableOpacity>

        {/* Tab Content */}
        {activeTab === 'Inventory' && renderInventoryTab()}
        {activeTab === 'Sales' && renderSalesTab()}
        {activeTab === 'Purchases' && (
          <View style={styles.comingSoon}>
            <Ionicons name="basket" size={64} color="#8E8E93" />
            <Text style={styles.comingSoonText}>Purchases Coming Soon</Text>
          </View>
        )}
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
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  alertsContainer: {
    marginBottom: 20,
    gap: 8,
  },
  alertCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  filterIcon: {
    padding: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1C1C1E',
  },
  tabContent: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginRight: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statTitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 9,
    color: '#C7C7CC',
    marginTop: 1,
  },
  medicineList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  medicineCard: {
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
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  medicineCategory: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  medicineId: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  medicineDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#8E8E93',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  priceText: {
    fontWeight: 'bold',
    color: '#34C759',
  },
  medicineActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  salesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  salesCard: {
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
  salesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  salesInfo: {
    flex: 1,
  },
  saleId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  saleDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  saleTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  salesDetails: {
    marginTop: 8,
  },
  patientInfo: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 13,
    color: '#1C1C1E',
    flex: 1,
  },
  itemDetails: {
    fontSize: 13,
    color: '#8E8E93',
  },
  tabContent: {
    flex: 1,
  },
  medicineCard: {
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
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EBF8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  medicineDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  medicineSubDetails: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  medicineActions: {
    alignItems: 'flex-end',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  medicineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceInfo: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  supplierInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  supplierLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  supplierValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 16,
  },
});

export default AdminPharmacyScreen;