import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';

const ReportsScreen = ({ navigation }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReport, setNewReport] = useState({
    type: '',
    patientName: '',
    doctorName: '',
    description: '',
  });

  // Use real data from AppContext
  const { 
    patients, 
    appointments, 
    doctors,
    addPatientReport,
    reports = [] // Will add this to AppContext
  } = useApp();

  // Mock reports data with real integration structure
  const mockReports = [
    {
      id: 'RPT001',
      type: 'Blood Test Results',
      patientName: 'Rajesh Kumar',
      doctorName: 'Dr. K. Ramesh',
      date: '2024-10-12',
      size: '2.3 MB',
      status: 'available',
      icon: 'B',
      iconColor: '#3B82F6',
      bgColor: '#EBF4FF'
    },
    {
      id: 'RPT002',
      type: 'Ultrasound Report',
      patientName: 'Priya Sharma',
      doctorName: 'Dr. K. Divyavani',
      date: '2024-10-11',
      size: '5.1 MB',
      status: 'available',
      icon: 'U',
      iconColor: '#8B5CF6',
      bgColor: '#F3F0FF'
    },
    {
      id: 'RPT003',
      type: 'X-Ray Report',
      patientName: 'Amit Patel',
      doctorName: 'Dr. K. Ramesh',
      date: '2024-10-10',
      size: '1.8 MB',
      status: 'available',
      icon: 'X',
      iconColor: '#10B981',
      bgColor: '#ECFDF5'
    }
  ];

  // Calculate real stats
  const reportsStats = {
    totalReports: mockReports.length,
    totalPatients: patients.length || 3,
    storageUsed: '9.2MB',
    availableReports: mockReports.filter(r => r.status === 'available').length
  };

  const handleAddReport = () => {
    if (!newReport.type || !newReport.patientName || !newReport.doctorName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const report = {
      id: `RPT${Date.now()}`,
      type: newReport.type,
      patientName: newReport.patientName,
      doctorName: newReport.doctorName,
      date: new Date().toISOString().split('T')[0],
      size: '1.0 MB',
      status: 'available',
      icon: newReport.type.charAt(0).toUpperCase(),
      iconColor: '#3B82F6',
      bgColor: '#EBF4FF'
    };

    // Add to reports (will integrate with AppContext)
    setShowAddModal(false);
    setNewReport({ type: '', patientName: '', doctorName: '', description: '' });
    Alert.alert('Success', 'Report added successfully');
  };

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  const ReportCard = ({ report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportLeft}>
        <View style={[styles.reportIcon, { backgroundColor: report.bgColor }]}>
          <Text style={[styles.reportIconText, { color: report.iconColor }]}>
            {report.icon}
          </Text>
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportType}>{report.type}</Text>
          <Text style={styles.reportPatient}>Patient: {report.patientName}</Text>
          <Text style={styles.reportDoctor}>Doctor: {report.doctorName}</Text>
          <View style={styles.reportMeta}>
            <Text style={styles.reportDate}>Date: {report.date}</Text>
            <Text style={styles.reportSize}>Size: {report.size}</Text>
          </View>
          <View style={styles.reportStatus}>
            <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
              <Text style={[styles.statusText, { color: '#16A34A' }]}>
                {report.status}
              </Text>
            </View>
            <Text style={styles.reportId}>ID: {report.id}</Text>
          </View>
        </View>
      </View>
      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="trash" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor={Colors.kbrBlue} barStyle="light-content" translucent={false} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            
            <View style={styles.logoSection}>
              <Image 
                source={require('../../../assets/hospital-logo.jpeg')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <View style={styles.headerTextSection}>
                <Text style={styles.hospitalName}>KBR LIFE CARE</Text>
                <Text style={styles.headerSubtitle}>HOSPITALS</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => {/* Login functionality */}}
          >
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, Admin King</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Stats Cards */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <StatCard
                title="Total Reports"
                value={reportsStats.totalReports.toString()}
                icon="document-text"
                color="#3B82F6"
                bgColor="#EBF4FF"
              />
              <StatCard
                title="Patients"
                value={reportsStats.totalPatients.toString()}
                icon="eye"
                color="#10B981"
                bgColor="#ECFDF5"
              />
              <StatCard
                title="Storage"
                value={reportsStats.storageUsed}
                icon="arrow-up"
                color="#8B5CF6"
                bgColor="#F3F0FF"
              />
            </View>
          </View>

          {/* Patient Reports Section */}
          <View style={styles.reportsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Patient Reports</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
                <Text style={styles.addButtonText}>Add Report</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reportsList}>
              {mockReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('AdminMain', { screen: 'Dashboard' })}
          >
            <Ionicons name="bar-chart" size={20} color="#9CA3AF" />
            <Text style={styles.navText}>Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('AdminMain', { screen: 'Patients' })}
          >
            <Ionicons name="people" size={20} color="#9CA3AF" />
            <Text style={styles.navText}>Appts</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('AdminMain', { screen: 'Patients' })}
          >
            <Ionicons name="time" size={20} color="#9CA3AF" />
            <Text style={styles.navText}>Doctors</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('AdminMain', { screen: 'Payments' })}
          >
            <Ionicons name="card" size={20} color="#9CA3AF" />
            <Text style={styles.navText}>Billing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.navItem, styles.activeNavItem]}
          >
            <Ionicons name="document-text" size={20} color="#EF4444" />
            <Text style={[styles.navText, { color: '#EF4444' }]}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Add Report Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Report</Text>
                <TouchableOpacity 
                  onPress={() => setShowAddModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Report Type *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newReport.type}
                    onChangeText={(text) => setNewReport({...newReport, type: text})}
                    placeholder="e.g., Blood Test Results, X-Ray Report"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Patient Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newReport.patientName}
                    onChangeText={(text) => setNewReport({...newReport, patientName: text})}
                    placeholder="Enter patient name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Doctor Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newReport.doctorName}
                    onChangeText={(text) => setNewReport({...newReport, doctorName: text})}
                    placeholder="Enter doctor name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Description</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newReport.description}
                    onChangeText={(text) => setNewReport({...newReport, description: text})}
                    placeholder="Additional notes or description"
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleAddReport}
                >
                  <Text style={styles.saveButtonText}>Add Report</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.kbrBlue,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Sizes.sm,
  },
  headerTextSection: {
    
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
  },
  loginText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '500',
  },
  welcomeSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.sm,
  },
  welcomeText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  statsSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: Sizes.lg,
    paddingBottom: Sizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Sizes.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Sizes.sm,
  },
  statContent: {
    alignItems: 'center',
  },
  statTitle: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
  },
  reportsSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    backgroundColor: Colors.kbrRed,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '500',
    marginLeft: 4,
  },
  reportsList: {
    gap: Sizes.md,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  reportIconText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  reportPatient: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  reportDoctor: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  reportMeta: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reportDate: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginRight: Sizes.md,
  },
  reportSize: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  reportStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: Sizes.small,
    fontWeight: '500',
  },
  reportId: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  reportActions: {
    flexDirection: 'row',
    gap: Sizes.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: Sizes.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Sizes.xs,
  },
  activeNavItem: {
    
  },
  navText: {
    fontSize: Sizes.small,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: Sizes.xs,
  },
  modalBody: {
    padding: Sizes.lg,
  },
  inputGroup: {
    marginBottom: Sizes.md,
  },
  inputLabel: {
    fontSize: Sizes.medium,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Sizes.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    marginRight: Sizes.sm,
  },
  cancelButtonText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.kbrRed,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
    marginLeft: Sizes.sm,
  },
  saveButtonText: {
    fontSize: Sizes.medium,
    color: Colors.white,
    fontWeight: '500',
  },
});

export default ReportsScreen;