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
  StatusBar,
  Modal,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { Colors } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const DischargeManagementScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showDischargeSummaryModal, setShowDischargeSummaryModal] = useState(false);
  const [selectedPatientForSummary, setSelectedPatientForSummary] = useState(null);
  const [showPatientSelectionModal, setShowPatientSelectionModal] = useState(false);
  const [dischargeSummaryData, setDischargeSummaryData] = useState(null);

  // Mock data for discharge stats - matching your UI
  const dischargeStats = {
    totalDischarges: 2,
    thisMonth: 2
  };

  // Comprehensive patient data for discharge summaries
  const allPatients = [
    {
      id: 'KBR-IP-2024-001',
      name: 'Rajesh Kumar',
      age: 45,
      gender: 'Male',
      phone: '+91 9876543210',
      email: 'rajesh.kumar@email.com',
      address: '123, MG Road, Hyderabad, Telangana - 500001',
      emergencyContact: 'Sunita Kumar (Wife) - +91 9876543211',
      doctor: 'Dr. K. Ramesh',
      department: 'Cardiology',
      condition: 'Acute Myocardial Infarction',
      admissionDate: '2024-01-05',
      dischargeDate: '2024-01-10',
      lengthOfStay: '5 days',
      status: 'Discharged',
      statusColor: '#10B981',
      admissionReason: 'Patient presented with severe chest pain, shortness of breath, and sweating. ECG showed ST elevation consistent with acute MI.',
      presentCondition: 'Stable, chest pain resolved, normal cardiac rhythm, ready for discharge with medications.',
      treatments: [
        { date: '2024-01-05', treatment: 'Primary PCI (Percutaneous Coronary Intervention)', doctor: 'Dr. K. Ramesh' },
        { date: '2024-01-06', treatment: 'Cardiac rehabilitation consultation', doctor: 'Dr. Priya Sharma' },
        { date: '2024-01-07', treatment: 'Medication adjustment - Beta blockers', doctor: 'Dr. K. Ramesh' },
        { date: '2024-01-08', treatment: 'Echocardiogram monitoring', doctor: 'Dr. K. Ramesh' }
      ],
      rooms: [
        { type: 'ICU', roomNo: 'ICU-301', duration: '2 days', cost: 15000, dates: '05-01 to 07-01' },
        { type: 'Private Ward', roomNo: 'PW-205', duration: '3 days', cost: 9000, dates: '07-01 to 10-01' }
      ],
      appointments: [
        { date: '2024-01-15', time: '10:00 AM', doctor: 'Dr. K. Ramesh', type: 'Follow-up', status: 'Scheduled' },
        { date: '2024-01-30', time: '2:00 PM', doctor: 'Dr. K. Ramesh', type: 'Cardiac Check-up', status: 'Scheduled' }
      ],
      tests: [
        { date: '2024-01-05', test: 'ECG', result: 'ST elevation in leads II, III, aVF', doctor: 'Dr. K. Ramesh', cost: 500 },
        { date: '2024-01-05', test: 'Troponin I', result: 'Elevated (12.5 ng/ml)', doctor: 'Dr. K. Ramesh', cost: 800 },
        { date: '2024-01-06', test: 'Echocardiogram', result: 'LVEF 45%, mild hypokinesia', doctor: 'Dr. K. Ramesh', cost: 2500 },
        { date: '2024-01-08', test: 'Lipid Profile', result: 'Total cholesterol: 280 mg/dl', doctor: 'Dr. K. Ramesh', cost: 600 },
        { date: '2024-01-09', test: 'CBC', result: 'Normal', doctor: 'Dr. K. Ramesh', cost: 400 }
      ],
      medications: [
        { name: 'Aspirin 75mg', dosage: 'Once daily', duration: '3 months', cost: 200 },
        { name: 'Metoprolol 50mg', dosage: 'Twice daily', duration: '6 months', cost: 450 },
        { name: 'Atorvastatin 40mg', dosage: 'Once daily at night', duration: '6 months', cost: 600 },
        { name: 'Clopidogrel 75mg', dosage: 'Once daily', duration: '1 year', cost: 1200 }
      ],
      payments: [
        { date: '2024-01-05', description: 'Room Charges (ICU)', amount: 15000, status: 'Paid' },
        { date: '2024-01-07', description: 'Room Charges (Private Ward)', amount: 9000, status: 'Paid' },
        { date: '2024-01-08', description: 'Laboratory Tests', amount: 4800, status: 'Paid' },
        { date: '2024-01-09', description: 'Procedure Charges (PCI)', amount: 85000, status: 'Paid' },
        { date: '2024-01-10', description: 'Doctor Consultation', amount: 5000, status: 'Paid' },
        { date: '2024-01-10', description: 'Medications', amount: 2450, status: 'Paid' }
      ]
    },
    {
      id: 'KBR-IP-2024-003',
      name: 'Meena Devi',
      age: 35,
      gender: 'Female',
      phone: '+91 9123456789',
      email: 'meena.devi@email.com',
      address: '456, Jubilee Hills, Hyderabad, Telangana - 500033',
      emergencyContact: 'Ravi Kumar (Husband) - +91 9123456788',
      doctor: 'Dr. K. Divyasri',
      department: 'Obstetrics & Gynecology',
      condition: 'Full term pregnancy, Lower Segment Caesarean Section',
      admissionDate: '2024-01-07',
      dischargeDate: '2024-01-12',
      lengthOfStay: '5 days',
      status: 'Discharged',
      statusColor: '#10B981',
      admissionReason: 'Patient admitted for elective cesarean section at 38 weeks gestation due to previous LSCS and patient preference.',
      presentCondition: 'Post-operative recovery excellent, wound healing well, breastfeeding established, baby healthy.',
      treatments: [
        { date: '2024-01-07', treatment: 'Pre-operative preparation and counseling', doctor: 'Dr. K. Divyasri' },
        { date: '2024-01-08', treatment: 'Lower Segment Cesarean Section', doctor: 'Dr. K. Divyasri' },
        { date: '2024-01-09', treatment: 'Post-operative wound care', doctor: 'Dr. K. Divyasri' },
        { date: '2024-01-10', treatment: 'Lactation counseling', doctor: 'Dr. Priya (Lactation Consultant)' }
      ],
      rooms: [
        { type: 'Maternity Ward', roomNo: 'MW-101', duration: '5 days', cost: 12500, dates: '07-01 to 12-01' }
      ],
      appointments: [
        { date: '2024-01-20', time: '11:00 AM', doctor: 'Dr. K. Divyasri', type: 'Post-operative check-up', status: 'Scheduled' },
        { date: '2024-02-05', time: '3:00 PM', doctor: 'Dr. K. Divyasri', type: 'Contraception counseling', status: 'Scheduled' }
      ],
      tests: [
        { date: '2024-01-07', test: 'Pre-operative blood work', result: 'Hb: 11.5 g/dl, Normal', doctor: 'Dr. K. Divyasri', cost: 1200 },
        { date: '2024-01-08', test: 'Baby APGAR Score', result: '9/10 at 1 min, 10/10 at 5 min', doctor: 'Dr. K. Divyasri', cost: 0 },
        { date: '2024-01-09', test: 'Post-op CBC', result: 'Hb: 10.2 g/dl, recovering', doctor: 'Dr. K. Divyasri', cost: 400 },
        { date: '2024-01-11', test: 'Wound inspection', result: 'Healing well, no infection', doctor: 'Dr. K. Divyasri', cost: 0 }
      ],
      medications: [
        { name: 'Iron tablets', dosage: 'Once daily', duration: '3 months', cost: 300 },
        { name: 'Calcium supplements', dosage: 'Twice daily', duration: '2 months', cost: 250 },
        { name: 'Paracetamol 500mg', dosage: 'As needed for pain', duration: '1 week', cost: 50 },
        { name: 'Multivitamin', dosage: 'Once daily', duration: '3 months', cost: 400 }
      ],
      payments: [
        { date: '2024-01-07', description: 'Room Charges (Maternity)', amount: 12500, status: 'Paid' },
        { date: '2024-01-08', description: 'Surgery Charges (LSCS)', amount: 45000, status: 'Paid' },
        { date: '2024-01-09', description: 'Laboratory Tests', amount: 1600, status: 'Paid' },
        { date: '2024-01-10', description: 'Doctor Consultation', amount: 3500, status: 'Paid' },
        { date: '2024-01-11', description: 'Medications', amount: 1000, status: 'Paid' },
        { date: '2024-01-12', description: 'Newborn care charges', amount: 2500, status: 'Paid' }
      ]
    }
  ];

  // Filter for discharged patients only
  const dischargePatients = allPatients;

  const filteredPatients = dischargePatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                         (selectedFilter === 'Ready' && patient.status === 'Ready for Discharge') ||
                         (selectedFilter === 'Observation' && patient.status === 'Under Observation') ||
                         (selectedFilter === 'Discharged' && patient.status === 'Discharged');
    return matchesSearch && matchesFilter;
  });

  const handleCreateDischargeSummary = () => {
    setShowPatientSelectionModal(true);
  };

  const selectPatientForSummary = (patient) => {
    setSelectedPatientForSummary(patient);
    setShowPatientSelectionModal(false);
    
    // Generate comprehensive discharge summary
    const summary = generateComprehensiveSummary(patient);
    setDischargeSummaryData(summary);
    setShowDischargeSummaryModal(true);
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
          admissionDate: patient.admissionDate,
          dischargeDate: patient.dischargeDate,
          lengthOfStay: patient.lengthOfStay,
          admissionReason: patient.admissionReason,
          department: patient.department,
          primaryDoctor: patient.doctor
        },
        medicalDetails: {
          condition: patient.condition,
          presentCondition: patient.presentCondition,
          treatments: patient.treatments,
          medications: patient.medications
        },
        diagnosticTests: patient.tests,
        roomCharges: patient.rooms,
        followUpAppointments: patient.appointments,
        financialSummary: patient.payments,
        totalAmount: totalCost
      }
    };
  };

  const calculateTotalCost = (patient) => {
    let total = 0;
    
    // Room charges
    patient.rooms.forEach(room => total += room.cost);
    
    // Test charges
    patient.tests.forEach(test => total += test.cost);
    
    // Medication charges
    patient.medications.forEach(med => total += med.cost);
    
    // Payment amounts
    patient.payments.forEach(payment => total += payment.amount);
    
    return total;
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
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" translucent={true} />
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <AppHeader 
          title="Discharge Summaries"
          subtitle="Complete discharge records for all IP patients"
          showBackButton={true}
          useSimpleAdminHeader={true}
          navigation={navigation}
        />

        {/* Patient List */}
        <FlatList
          data={filteredPatients}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <DischargeCard patient={item} />}
          contentContainerStyle={styles.patientList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View>
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
        />
      </SafeAreaView>

      {/* Patient Selection Modal */}
      <Modal
        visible={showPatientSelectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPatientSelectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.patientSelectionModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient for Discharge Summary</Text>
              <TouchableOpacity
                onPress={() => setShowPatientSelectionModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.patientListContainer}>
              {allPatients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={styles.patientSelectionCard}
                  onPress={() => selectPatientForSummary(patient)}
                >
                  <View style={styles.patientSelectionInfo}>
                    <Text style={styles.patientSelectionName}>{patient.name}</Text>
                    <Text style={styles.patientSelectionId}>ID: {patient.id}</Text>
                    <Text style={styles.patientSelectionDetails}>
                      {patient.age} years, {patient.gender} • {patient.department}
                    </Text>
                    <Text style={styles.patientSelectionCondition}>{patient.condition}</Text>
                  </View>
                  <View style={styles.patientSelectionArrow}>
                    <Ionicons name="chevron-forward" size={24} color={Colors.kbrBlue} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Comprehensive Discharge Summary Modal */}
      <Modal
        visible={showDischargeSummaryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDischargeSummaryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dischargeSummaryModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Discharge Summary Report</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.downloadPdfButton}>
                  <Ionicons name="download" size={20} color="#FFFFFF" />
                  <Text style={styles.downloadButtonText}>Download PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowDischargeSummaryModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {dischargeSummaryData && (
              <ScrollView style={styles.summaryContent}>
                {/* Hospital Header */}
                <View style={styles.hospitalHeader}>
                  <Text style={styles.hospitalName}>KBR LIFE CARE HOSPITALS</Text>
                  <Text style={styles.hospitalAddress}>Comprehensive Healthcare Center</Text>
                  <Text style={styles.reportTitle}>DISCHARGE SUMMARY REPORT</Text>
                </View>

                {/* Patient Information */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>PATIENT INFORMATION</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.patientInfo.name}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Patient ID:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.patientInfo.id}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Age/Gender:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.patientInfo.age} years, {dischargeSummaryData.summary.patientInfo.gender}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Contact:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.patientInfo.phone}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Address:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.patientInfo.address}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Emergency Contact:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.patientInfo.emergencyContact}</Text>
                    </View>
                  </View>
                </View>

                {/* Admission Details */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>ADMISSION DETAILS</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Admission Date:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.admissionDetails.admissionDate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Discharge Date:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.admissionDetails.dischargeDate}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Length of Stay:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.admissionDetails.lengthOfStay}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Department:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.admissionDetails.department}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Primary Doctor:</Text>
                      <Text style={styles.infoValue}>{dischargeSummaryData.summary.admissionDetails.primaryDoctor}</Text>
                    </View>
                    <View style={styles.infoRowFull}>
                      <Text style={styles.infoLabel}>Reason for Admission:</Text>
                      <Text style={styles.infoValueLong}>{dischargeSummaryData.summary.admissionDetails.admissionReason}</Text>
                    </View>
                  </View>
                </View>

                {/* Medical Condition */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>MEDICAL CONDITION & TREATMENT</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoRowFull}>
                      <Text style={styles.infoLabel}>Primary Diagnosis:</Text>
                      <Text style={styles.infoValueLong}>{dischargeSummaryData.summary.medicalDetails.condition}</Text>
                    </View>
                    <View style={styles.infoRowFull}>
                      <Text style={styles.infoLabel}>Present Condition at Discharge:</Text>
                      <Text style={styles.infoValueLong}>{dischargeSummaryData.summary.medicalDetails.presentCondition}</Text>
                    </View>
                  </View>
                </View>

                {/* Treatments Provided */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>TREATMENTS PROVIDED</Text>
                  {dischargeSummaryData.summary.medicalDetails.treatments.map((treatment, index) => (
                    <View key={index} style={styles.treatmentItem}>
                      <Text style={styles.treatmentDate}>{treatment.date}</Text>
                      <Text style={styles.treatmentDescription}>{treatment.treatment}</Text>
                      <Text style={styles.treatmentDoctor}>By: {treatment.doctor}</Text>
                    </View>
                  ))}
                </View>

                {/* Diagnostic Tests */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>DIAGNOSTIC TESTS & RESULTS</Text>
                  {dischargeSummaryData.summary.diagnosticTests.map((test, index) => (
                    <View key={index} style={styles.testItem}>
                      <View style={styles.testHeader}>
                        <Text style={styles.testName}>{test.test}</Text>
                        <Text style={styles.testCost}>₹{test.cost}</Text>
                      </View>
                      <Text style={styles.testDate}>Date: {test.date}</Text>
                      <Text style={styles.testResult}>Result: {test.result}</Text>
                      <Text style={styles.testDoctor}>Ordered by: {test.doctor}</Text>
                    </View>
                  ))}
                </View>

                {/* Room Charges */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>ROOM CHARGES & ACCOMMODATION</Text>
                  {dischargeSummaryData.summary.roomCharges.map((room, index) => (
                    <View key={index} style={styles.roomItem}>
                      <View style={styles.roomHeader}>
                        <Text style={styles.roomType}>{room.type} - {room.roomNo}</Text>
                        <Text style={styles.roomCost}>₹{room.cost}</Text>
                      </View>
                      <Text style={styles.roomDuration}>Duration: {room.duration} ({room.dates})</Text>
                    </View>
                  ))}
                </View>

                {/* Medications */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>MEDICATIONS PRESCRIBED</Text>
                  {dischargeSummaryData.summary.medicalDetails.medications.map((medication, index) => (
                    <View key={index} style={styles.medicationItem}>
                      <View style={styles.medicationHeader}>
                        <Text style={styles.medicationName}>{medication.name}</Text>
                        <Text style={styles.medicationCost}>₹{medication.cost}</Text>
                      </View>
                      <Text style={styles.medicationDosage}>Dosage: {medication.dosage}</Text>
                      <Text style={styles.medicationDuration}>Duration: {medication.duration}</Text>
                    </View>
                  ))}
                </View>

                {/* Financial Summary */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>FINANCIAL SUMMARY</Text>
                  {dischargeSummaryData.summary.financialSummary.map((payment, index) => (
                    <View key={index} style={styles.paymentItem}>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentDate}>{payment.date}</Text>
                        <Text style={styles.paymentAmount}>₹{payment.amount}</Text>
                      </View>
                      <Text style={styles.paymentDescription}>{payment.description}</Text>
                      <Text style={[styles.paymentStatus, { color: payment.status === 'Paid' ? '#10B981' : '#EF4444' }]}>
                        {payment.status}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.totalAmount}>
                    <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
                    <Text style={styles.totalValue}>₹{dischargeSummaryData.summary.totalAmount}</Text>
                  </View>
                </View>

                {/* Follow-up Appointments */}
                <View style={styles.summarySection}>
                  <Text style={styles.sectionTitle}>FOLLOW-UP APPOINTMENTS</Text>
                  {dischargeSummaryData.summary.followUpAppointments.map((appointment, index) => (
                    <View key={index} style={styles.appointmentItem}>
                      <Text style={styles.appointmentDate}>{appointment.date} at {appointment.time}</Text>
                      <Text style={styles.appointmentDoctor}>With: {appointment.doctor}</Text>
                      <Text style={styles.appointmentType}>Type: {appointment.type}</Text>
                    </View>
                  ))}
                </View>

                {/* Doctor's Signature */}
                <View style={styles.signatureSection}>
                  <View style={styles.signatureBox}>
                    <Text style={styles.signatureLabel}>Doctor's Signature & Stamp</Text>
                    <Text style={styles.doctorName}>{dischargeSummaryData.summary.admissionDetails.primaryDoctor}</Text>
                    <Text style={styles.doctorDept}>{dischargeSummaryData.summary.admissionDetails.department}</Text>
                  </View>
                  <View style={styles.dateBox}>
                    <Text style={styles.dateLabel}>Date:</Text>
                    <Text style={styles.currentDate}>{new Date().toLocaleDateString()}</Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientSelectionModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: screenWidth * 0.9,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  dischargeSummaryModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: screenWidth * 0.95,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    marginLeft: 10,
  },
  downloadPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 5,
  },
  
  // Patient Selection Styles
  patientListContainer: {
    maxHeight: 400,
  },
  patientSelectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  patientSelectionInfo: {
    flex: 1,
  },
  patientSelectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  patientSelectionId: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  patientSelectionDetails: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  patientSelectionCondition: {
    fontSize: 12,
    color: '#7C3AED',
    fontStyle: 'italic',
  },
  patientSelectionArrow: {
    marginLeft: 12,
  },
  
  // Discharge Summary Styles
  summaryContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  hospitalHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: Colors.kbrBlue,
    marginBottom: 20,
  },
  hospitalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    textAlign: 'center',
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 10,
    letterSpacing: 1,
  },
  
  // Summary Sections
  summarySection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.kbrBlue,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    marginBottom: 12,
    textAlign: 'center',
  },
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  infoRowFull: {
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  infoValueLong: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
    lineHeight: 20,
  },
  
  // Treatment Items
  treatmentItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  treatmentDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  treatmentDescription: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 2,
  },
  treatmentDoctor: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  // Test Items
  testItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  testCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  testDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  testResult: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  testDoctor: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  // Room Items
  roomItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  roomCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  roomDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Medication Items
  medicationItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  medicationCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  medicationDosage: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  medicationDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Payment Items
  paymentItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  paymentDescription: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  
  // Appointment Items
  appointmentItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#06B6D4',
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  appointmentDoctor: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Signature Section
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  signatureBox: {
    flex: 1,
  },
  signatureLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 30,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  doctorDept: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateBox: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default DischargeManagementScreen;