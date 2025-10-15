import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Alert,
  Linking,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import PatientRegistrationModal from '../../components/PatientRegistrationModal';
import AppHeader from '../../components/AppHeader';

const PatientManagementScreen = ({ navigation }) => {
  const { patients, deletePatient } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Calculate stats from real patient data
  const stats = {
    total: patients.length,
    inPatient: patients.filter(p => p.patientType === 'IP').length,
    outPatient: patients.filter(p => p.patientType === 'OP').length,
  };

  // Filter options
  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'IP Only', value: 'IP' },
    { label: 'OP Only', value: 'OP' },
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || patient.patientType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (patient) => {
    navigation.navigate('PatientDetails', { patient });
  };

  const handleRegisterNewPatient = () => {
    setShowRegistrationModal(true);
  };

  const handleRegistrationSuccess = (newPatient) => {
    Alert.alert('Success', `Patient ${newPatient.name} registered successfully!`);
  };

  const handleCall = (patient) => {
    const phoneNumber = patient.phone.replace(/\s/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleViewPaymentInvoices = (patient) => {
    navigation.navigate('PatientPaymentInvoices', { 
      patientId: patient.id,
      patientName: patient.name 
    });
  };

  const handleViewMedicalReports = (patient) => {
    navigation.navigate('PatientMedicalReports', { 
      patientId: patient.id,
      patientName: patient.name 
    });
  };

  const handleEditPatient = (patient) => {
    navigation.navigate('PatientDetails', { patient });
  };

  const handleDeletePatient = (patient) => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${patient.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePatient(patient.id);
            Alert.alert('Success', 'Patient deleted successfully');
          },
        },
      ]
    );
  };

  const StatCard = ({ title, count, color }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const PatientCard = ({ patient }) => (
    <View style={styles.patientCard}>
      <View style={styles.patientHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color="#007AFF" />
          </View>
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientId}>{patient.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: patient.statusColor }]}>
          <Text style={styles.statusText}>{patient.patientType}</Text>
        </View>
        <View style={[styles.statusBadge2, { backgroundColor: '#E8F5E8' }]}>
          <Text style={[styles.statusText2, { color: patient.statusColor }]}>{patient.statusText}</Text>
        </View>
      </View>
      
      <View style={styles.patientDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={14} color="#666" />
          <Text style={styles.detailText}>{patient.age}, {patient.gender} • {patient.bloodGroup || 'A+'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={14} color="#666" />
          <Text style={styles.detailText}>{patient.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="medical" size={14} color="#666" />
          <Text style={styles.detailText}>{patient.doctor} • {patient.department}</Text>
        </View>
        {patient.room && (
          <View style={styles.detailRow}>
            <Ionicons name="bed" size={14} color="#666" />
            <Text style={styles.detailText}>Room {patient.room}, Bed {patient.bedNo} • Admitted: {patient.admissionDate}</Text>
          </View>
        )}
        {patient.registrationDate && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color="#666" />
            <Text style={styles.detailText}>Registered: {patient.registrationDate}</Text>
          </View>
        )}
      </View>

      {/* Quick Actions Row */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleCall(patient)}
        >
          <Ionicons name="call" size={16} color="#34C759" />
          <Text style={[styles.quickActionText, { color: '#34C759' }]}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleViewPaymentInvoices(patient)}
        >
          <Ionicons name="receipt" size={16} color="#007AFF" />
          <Text style={[styles.quickActionText, { color: '#007AFF' }]}>Payments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleViewMedicalReports(patient)}
        >
          <Ionicons name="document-text" size={16} color="#FF9500" />
          <Text style={[styles.quickActionText, { color: '#FF9500' }]}>Reports</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(patient)}
        >
          <Ionicons name="eye" size={16} color="#DC2626" />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditPatient(patient)}
        >
          <Ionicons name="create" size={16} color="#007AFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeletePatient(patient)}
        >
          <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.kbrBlue }]}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          title="Patient Management"
          subtitle="Manage inpatient and outpatient records and information"
          navigation={navigation}
          showBackButton={true}
          useSimpleAdminHeader={true}
        />

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard title="Total" count={stats.total} color="#FECACA" />
          <StatCard title="IP" count={stats.inPatient} color="#BFDBFE" />
          <StatCard title="OP" count={stats.outPatient} color="#BBF7D0" />
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, ID, or phone"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.filterIcon}>
              <Ionicons name="funnel" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Ionicons name={showFilterDropdown ? "chevron-up" : "chevron-down"} size={16} color="#6B7280" />
            </TouchableOpacity>
            
            {showFilterDropdown && (
              <View style={styles.filterDropdown}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.filterOption}
                    onPress={() => {
                      setSelectedFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      selectedFilter === option.value && styles.selectedFilterText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Register Button */}
        <TouchableOpacity 
          style={styles.registerButton}
          onPress={handleRegisterNewPatient}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.registerButtonText}>Register New Patient</Text>
        </TouchableOpacity>

        {/* Patient List */}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PatientCard patient={item} />}
          contentContainerStyle={styles.patientList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Patients Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery 
                  ? `No patients match "${searchQuery}"`
                  : 'Register your first patient to get started'
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={handleRegisterNewPatient}
                >
                  <Text style={styles.emptyActionText}>Register New Patient</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      </View>

      {/* Registration Modal */}
      <PatientRegistrationModal
        visible={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationSuccess}
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
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
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
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  patientList: {
    paddingBottom: 20,
  },
  patientCard: {
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
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  patientId: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge2: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText2: {
    fontSize: 10,
    fontWeight: '600',
  },
  patientDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
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
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  filterContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedFilterText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
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
    marginBottom: 20,
  },
  emptyActionButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PatientManagementScreen;