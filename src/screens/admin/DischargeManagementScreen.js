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

const DischargeManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Mock data for discharge stats - matching your UI
  const dischargeStats = {
    totalDischarges: 2,
    thisMonth: 2
  };

  // Mock data for discharge patients - matching your UI exactly
  const dischargePatients = [
    {
      id: 'KBR-IP-2024-001',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'Male',
      doctor: 'Dr. K. Ramesh',
      department: 'Cardiology',
      condition: 'Acute Myocardial Infarction',
      admissionDate: '2024-01-05',
      dischargeDate: '2024-01-10',
      lengthOfStay: '5 days',
      status: 'Discharged',
      statusColor: '#10B981'
    },
    {
      id: 'KBR-IP-2024-003',
      name: 'Meena Devi',
      age: 35,
      gender: 'Female',
      doctor: 'Dr. K. Divyasri',
      department: 'Obstetrics & Gynecology',
      condition: 'Full term pregnancy, Lower Segment Caesarean Section',
      admissionDate: '2024-01-07',
      dischargeDate: '2024-01-12',
      lengthOfStay: '5 days',
      status: 'Discharged',
      statusColor: '#10B981'
    }
  ];

  const filteredPatients = dischargePatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                         (selectedFilter === 'Ready' && patient.status === 'Ready for Discharge') ||
                         (selectedFilter === 'Observation' && patient.status === 'Under Observation') ||
                         (selectedFilter === 'Discharged' && patient.status === 'Discharged');
    return matchesSearch && matchesFilter;
  });

  const handleCreateDischargeSummary = (patient) => {
    Alert.alert(
      'Create Discharge Summary',
      `Create discharge summary for ${patient.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create', onPress: () => console.log('Creating discharge summary') }
      ]
    );
  };

  const StatCard = ({ title, count, color, icon }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statCount}>{count}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const DischargeCard = ({ patient }) => (
    <View style={styles.patientCard}>
      <View style={styles.patientHeader}>
        <View style={styles.documentIcon}>
          <Ionicons name="document-text" size={24} color="#3B82F6" />
        </View>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>{patient.name}</Text>
          <Text style={styles.patientId}>{patient.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: patient.statusColor }]}>
          <Text style={styles.statusText}>{patient.status}</Text>
        </View>
      </View>
      
      <View style={styles.patientDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{patient.age}, {patient.gender}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="medical" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{patient.doctor} • {patient.department}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="heart" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{patient.condition}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={14} color="#6B7280" />
          <Text style={styles.detailText}>{patient.admissionDate} to {patient.dischargeDate} ({patient.lengthOfStay})</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.viewSummaryButton}
          onPress={() => handleCreateDischargeSummary(patient)}
        >
          <Ionicons name="eye" size={16} color="#DC2626" />
          <Text style={styles.viewSummaryText}>View Summary</Text>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Discharge Summaries</Text>
          <Text style={styles.headerSubtitle}>Complete discharge records for all IP patients</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statCount}>{dischargeStats.totalDischarges}</Text>
            <Text style={styles.statTitle}>Total Discharges</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.statCount}>{dischargeStats.thisMonth}</Text>
            <Text style={styles.statTitle}>This Month</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Create Discharge Summary Button */}
        <TouchableOpacity style={styles.createButton}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Create Discharge Summary</Text>
        </TouchableOpacity>

        {/* Patient List */}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DischargeCard patient={item} />}
          contentContainerStyle={styles.patientList}
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
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1F2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  createButtonText: {
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
  documentIcon: {
    marginRight: 12,
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
  },
  statusText: {
    color: '#FFFFFF',
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
  viewSummaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewSummaryText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  downloadButton: {
    padding: 4,
  },
});

export default DischargeManagementScreen;