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

const PatientManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Mock data for stats - matching your UI
  const stats = {
    total: 3,
    inPatient: 2,
    outPatient: 1
  };

  // Mock data for patients - matching your UI exactly
  const patients = [
    {
      id: 'KBR-IP-2024-001',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'Male',
      bloodGroup: 'B+',
      phone: '+91 98765 43210',
      doctor: 'Dr. K. Ramesh',
      department: 'Cardiology',
      room: '201',
      bedNo: 'A1',
      admissionDate: '2024-01-05',
      status: 'IP',
      statusText: 'Admitted',
      statusColor: '#007AFF'
    },
    {
      id: 'KBR-OP-2024-501',
      name: 'Priya Sharma',
      age: 32,
      gender: 'Female',
      phone: '+91 98765 43220',
      doctor: 'Dr. K. Divyasri',
      department: 'Obstetrics & Gynecology',
      visitDate: '2024-01-10',
      status: 'OP',
      statusText: 'Consultation',
      statusColor: '#34C759'
    },
    {
      id: 'KBR-IP-2024-002',
      name: 'Amit Patel',
      age: 55,
      gender: 'Male',
      phone: '+91 98765 43230',
      doctor: 'Dr. Mahesh Kumar',
      department: 'Orthopedics',
      status: 'IP',
      statusText: 'Under Treatment',
      statusColor: '#FF9500'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || patient.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (patient) => {
    navigation.navigate('PatientDetails', { patient });
  };

  const handleRegisterNewPatient = () => {
    Alert.alert('Register New Patient', 'This will open the patient registration form.');
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
          <Text style={styles.statusText}>{patient.status}</Text>
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
        {patient.visitDate && (
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={14} color="#666" />
            <Text style={styles.detailText}>Visit: {patient.visitDate}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(patient)}
        >
          <Ionicons name="eye" size={16} color="#DC2626" />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create" size={16} color="#007AFF" />
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
          <Text style={styles.headerTitle}>Patient Management</Text>
          <Text style={styles.headerSubtitle}>Manage IP & OP Patients</Text>
        </View>
      </View>

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
          
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>All</Text>
            <Ionicons name="chevron-down" size={16} color="#6B7280" />
          </TouchableOpacity>
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
});

export default PatientManagementScreen;