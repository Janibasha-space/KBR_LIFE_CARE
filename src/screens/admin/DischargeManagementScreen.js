import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Alert,
  StatusBar,
  Modal,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { useApp } from '../../contexts/AppContext';
import { Colors } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const DischargeManagementScreen = ({ navigation }) => {
  const { 
    patients, 
    createDischargeSummary, 
    getDischargesByPatient, 
    getDischargeStatistics, 
    processPatientDischarge 
  } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showDischargeSummaryModal, setShowDischargeSummaryModal] = useState(false);
  const [selectedPatientForSummary, setSelectedPatientForSummary] = useState(null);
  const [showPatientSelectionModal, setShowPatientSelectionModal] = useState(false);
  const [dischargeSummaryData, setDischargeSummaryData] = useState(null);
  const [dischargeStats, setDischargeStats] = useState({ totalDischarges: 0, thisMonth: 0 });
  const [loading, setLoading] = useState(false);

  // Load discharge statistics on component mount
  useEffect(() => {
    loadDischargeStats();
  }, []);

  const loadDischargeStats = async () => {
    try {
      const stats = await getDischargeStatistics();
      setDischargeStats(stats);
    } catch (error) {
      console.error('Error loading discharge stats:', error);
    }
  };

  // Patient data now comes from AppContext (real Firebase data)
  // Filter for discharged patients only
  // Use real patients from AppContext instead of mock data
  const dischargePatients = patients || [];

  const filteredPatients = dischargePatients.filter(patient => {
    const matchesSearch = patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                         (selectedFilter === 'Ready' && patient.status === 'Ready for Discharge') ||
                         (selectedFilter === 'Observation' && patient.status === 'Under Observation') ||
                         (selectedFilter === 'Discharged' && patient.status === 'Discharged');
    return matchesSearch && matchesFilter;
  });

  const handleCreateDischargeSummary = () => {
    setShowPatientSelectionModal(true);
  };

  const selectPatientForSummary = async (patient) => {
    try {
      setLoading(true);
      setSelectedPatientForSummary(patient);
      setShowPatientSelectionModal(false);
      
      // Check if discharge summary already exists
      const existingDischarges = await getDischargesByPatient(patient.id);
      
      if (existingDischarges && existingDischarges.length > 0) {
        // Use the most recent discharge summary
        setDischargeSummaryData(existingDischarges[0]);
      } else {
        // Generate comprehensive discharge summary
        const summary = generateComprehensiveSummary(patient);
        setDischargeSummaryData(summary);
      }
      
      setShowDischargeSummaryModal(true);
    } catch (error) {
      console.error('Error loading discharge summary:', error);
      Alert.alert('Error', 'Failed to load discharge summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveSummary = (patient) => {
    const totalCost = calculateTotalCost(patient);
    return {
      patient: patient,
      totalCost: totalCost,
      summary: {
        patientInfo: {
          name: patient.name,
          id: patient.id,
          age: patient.age,
          gender: patient.gender,
          phone: patient.phone,
          address: patient.address,
          emergencyContact: patient.emergencyContact
        },
        admissionDetails: {
          doctor: patient.doctor,
          department: patient.department,
          condition: patient.condition,
          admissionDate: patient.admissionDate,
          dischargeDate: patient.dischargeDate
        },
        treatments: patient.treatments || [],
        diagnosticTests: patient.tests || [],
        roomCharges: patient.rooms || [],
        followUpAppointments: patient.appointments || [],
        financialSummary: patient.payments || [],
        totalAmount: totalCost
      }
    };
  };

  const calculateTotalCost = (patient) => {
    let total = 0;
    
    // Room charges
    if (patient.rooms) {
      patient.rooms.forEach(room => total += room.cost || 0);
    }
    
    // Test charges
    if (patient.tests) {
      patient.tests.forEach(test => total += test.cost || 0);
    }
    
    // Medication charges
    if (patient.medications) {
      patient.medications.forEach(med => total += med.cost || 0);
    }
    
    return total;
  };

  const handleSaveDischargeSummary = async (summaryData) => {
    try {
      setLoading(true);
      await createDischargeSummary(selectedPatientForSummary.id, summaryData);
      
      // Also process the patient discharge
      await processPatientDischarge(selectedPatientForSummary.id, {
        roomId: selectedPatientForSummary.roomId,
        dischargeDate: new Date().toISOString(),
        dischargeSummary: summaryData
      });
      
      Alert.alert('Success', 'Discharge summary created and patient discharged successfully!');
      setShowDischargeSummaryModal(false);
      loadDischargeStats(); // Refresh stats
    } catch (error) {
      console.error('Error saving discharge summary:', error);
      Alert.alert('Error', 'Failed to save discharge summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={true} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <AppHeader
          title="Discharge Management"
          subtitle="Manage patient discharge and summaries"
          showBackButton={true}
          useSimpleAdminHeader={true}
          navigation={navigation}
        />

      {/* Patient List with Header */}
      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.patientCard}
            onPress={() => selectPatientForSummary(item)}
          >
            <Text style={styles.patientName}>{item.name}</Text>
            <Text style={styles.patientId}>{item.id}</Text>
            <Text style={styles.patientStatus}>{item.status}</Text>
          </TouchableOpacity>
        )}
        ListHeaderComponent={() => (
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
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateDischargeSummary}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Discharge Summary</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.patientList}
        showsVerticalScrollIndicator={false}
      />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statTitle: {
    fontSize: 14,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  patientId: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  patientStatus: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 4,
  },
});

export default DischargeManagementScreen;