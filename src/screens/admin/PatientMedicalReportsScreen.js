import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PatientMedicalReportsScreen = ({ route, navigation }) => {
  const { patientId, patientName } = route.params;
  
  // Mock medical reports data
  const [reports] = useState([
    {
      id: 'report-001',
      type: 'Lab Report',
      title: 'Complete Blood Count (CBC)',
      date: '2024-01-08',
      time: '10:30 AM',
      doctor: 'Dr. K. Ramesh',
      department: 'Pathology',
      status: 'Completed',
      priority: 'Normal',
      results: {
        hemoglobin: '12.5 g/dL',
        wbc: '7,500 /μL',
        platelets: '250,000 /μL',
        rbc: '4.2 million/μL',
      },
      normalRanges: {
        hemoglobin: '12-15.5 g/dL',
        wbc: '4,500-11,000 /μL',
        platelets: '150,000-450,000 /μL',
        rbc: '4.2-5.4 million/μL',
      },
      notes: 'All parameters within normal limits.',
    },
    {
      id: 'report-002',
      type: 'Imaging',
      title: 'Chest X-Ray',
      date: '2024-01-07',
      time: '2:15 PM',
      doctor: 'Dr. Mahesh Kumar',
      department: 'Radiology',
      status: 'Completed',
      priority: 'Normal',
      findings: 'Clear lung fields. Heart size normal. No acute cardiopulmonary pathology.',
      impression: 'Normal chest X-ray',
      notes: 'Follow-up if symptoms persist.',
    },
    {
      id: 'report-003',
      type: 'Cardiac Report',
      title: 'ECG Report',
      date: '2024-01-06',
      time: '11:45 AM',
      doctor: 'Dr. K. Ramesh',
      department: 'Cardiology',
      status: 'Completed',
      priority: 'Normal',
      rhythm: 'Sinus Rhythm',
      rate: '72 bpm',
      findings: 'Normal sinus rhythm. No ST-T changes. QRS within normal limits.',
      impression: 'Normal ECG',
      notes: 'No immediate cardiac concerns.',
    },
    {
      id: 'report-004',
      type: 'Lab Report',
      title: 'Lipid Profile',
      date: '2024-01-05',
      time: '9:00 AM',
      doctor: 'Dr. K. Divyasri',
      department: 'Biochemistry',
      status: 'Completed',
      priority: 'Attention',
      results: {
        totalCholesterol: '220 mg/dL',
        ldl: '140 mg/dL',
        hdl: '45 mg/dL',
        triglycerides: '180 mg/dL',
      },
      normalRanges: {
        totalCholesterol: '<200 mg/dL',
        ldl: '<100 mg/dL',
        hdl: '>40 mg/dL (M), >50 mg/dL (F)',
        triglycerides: '<150 mg/dL',
      },
      notes: 'Elevated cholesterol and triglycerides. Dietary modifications recommended.',
    },
  ]);

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return '#EF4444';
      case 'attention':
        return '#F59E0B';
      case 'normal':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'lab report':
        return 'flask';
      case 'imaging':
        return 'scan';
      case 'cardiac report':
        return 'heart';
      case 'prescription':
        return 'medical';
      default:
        return 'document-text';
    }
  };

  const handleViewReport = (report) => {
    navigation.navigate('ReportDetail', { 
      report,
      patientId,
      patientName 
    });
  };

  const handleDownloadReport = (report) => {
    Alert.alert(
      'Download Report',
      `Download ${report.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download', onPress: () => Alert.alert('Success', 'Report downloaded successfully') },
      ]
    );
  };

  const handleShareReport = (report) => {
    Alert.alert(
      'Share Report',
      `Share ${report.title} via email or message?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Email', onPress: () => Alert.alert('Info', 'Opening email client...') },
        { text: 'Message', onPress: () => Alert.alert('Info', 'Opening message app...') },
      ]
    );
  };

  const ReportCard = ({ report }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportIcon}>
          <Ionicons 
            name={getTypeIcon(report.type)} 
            size={24} 
            color="#007AFF" 
          />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportType}>{report.type}</Text>
          <Text style={styles.reportMeta}>
            {report.date} • {report.time} • {report.doctor}
          </Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(report.priority) }]}>
          <Text style={styles.priorityText}>{report.priority}</Text>
        </View>
      </View>

      <View style={styles.reportContent}>
        {report.results && (
          <View style={styles.quickResults}>
            <Text style={styles.quickResultsTitle}>Key Results:</Text>
            {Object.entries(report.results).slice(0, 2).map(([key, value]) => (
              <Text key={key} style={styles.quickResultItem}>
                • {key}: {value}
              </Text>
            ))}
          </View>
        )}
        
        {report.findings && (
          <View style={styles.findingsSection}>
            <Text style={styles.findingsTitle}>Findings:</Text>
            <Text style={styles.findingsText}>{report.findings}</Text>
          </View>
        )}

        {report.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes:</Text>
            <Text style={styles.notesText}>{report.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.reportActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleViewReport(report)}
        >
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDownloadReport(report)}
        >
          <Ionicons name="download" size={16} color="#34C759" />
          <Text style={styles.actionText}>Download</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleShareReport(report)}
        >
          <Ionicons name="share" size={16} color="#FF9500" />
          <Text style={styles.actionText}>Share</Text>
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
          <Ionicons name="chevron-back" size={26} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Medical Reports</Text>
          <Text style={styles.headerSubtitle}>{patientName}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {reports.filter(r => r.priority === 'Normal').length}
            </Text>
            <Text style={styles.statLabel}>Normal</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
              {reports.filter(r => r.priority === 'Attention').length}
            </Text>
            <Text style={styles.statLabel}>Attention</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>
              {reports.filter(r => r.priority === 'Critical').length}
            </Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReportCard report={item} />}
        contentContainerStyle={styles.reportsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No Medical Reports</Text>
            <Text style={styles.emptySubtitle}>
              Medical reports will appear here once available
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => Alert.alert('Add Report', 'Feature coming soon')}>
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
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
  searchButton: {
    marginLeft: 15,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  reportsList: {
    padding: 16,
    paddingTop: 0,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  reportType: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 4,
  },
  reportMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  reportContent: {
    marginBottom: 16,
  },
  quickResults: {
    marginBottom: 12,
  },
  quickResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  quickResultItem: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 2,
  },
  findingsSection: {
    marginBottom: 12,
  },
  findingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  findingsText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  notesSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  notesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  reportActions: {
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
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: 6,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default PatientMedicalReportsScreen;