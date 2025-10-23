import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  FlatList,
  Dimensions,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useApp } from '../../contexts/AppContext';
import { FileHandler, NotificationHandler } from '../../utils/fileHandler';
import AppHeader from '../../components/AppHeader';

const ReportsScreen = ({ navigation }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPatientSelector, setShowPatientSelector] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Form States
  const [newReport, setNewReport] = useState({
    type: '',
    patientId: '',
    patientName: '',
    patientPhone: '',
    doctorId: '',
    doctorName: '',
    notes: '',
    category: 'Laboratory',
    priority: 'normal',
  });

  const [sendReportData, setSendReportData] = useState({
    phoneNumber: '',
    message: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');



  // Use real data from AppContext
  const { 
    patients, 
    doctors,
    reports,
    addReport,
    updateReport,
    deleteReport,
    addFileToReport,
    sendReportToPatient,
    getReportsStats,
  } = useApp();

  // Calculate real stats from AppContext
  const reportsStats = getReportsStats();
  
  // Format storage size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  };

  // Filtered patients for search
  const filteredPatients = (patients || []).filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.phone.includes(patientSearch) ||
    patient.id.toLowerCase().includes(patientSearch.toLowerCase())
  );

  // File Upload Functions
  const handleFileUpload = async (type = 'gallery') => {
    setUploadingFile(true);
    try {
      let file = null;
      
      if (type === 'camera') {
        file = await FileHandler.takePhoto();
      } else if (type === 'document') {
        file = await FileHandler.pickDocument();
      } else {
        file = await FileHandler.pickImage();
      }

      if (file && FileHandler.validateFileSize(file, 10)) {
        setSelectedFiles(prev => [...prev, file]);
        Alert.alert('Success', 'File added successfully!');
      }
    } catch (error) {
      console.log('File upload error:', error);
      Alert.alert('Error', 'Failed to upload file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const removeFile = (fileIndex) => {
    setSelectedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  };

  const showFileUploadOptions = () => {
    Alert.alert(
      'Upload File',
      'Choose how you want to upload the report file',
      [
        { text: 'Take Photo', onPress: () => handleFileUpload('camera') },
        { text: 'From Gallery', onPress: () => handleFileUpload('gallery') },
        { text: 'Document (PDF/Word)', onPress: () => handleFileUpload('document') },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // Patient Selection Functions
  const selectPatient = (patient) => {
    setNewReport(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
    }));
    
    setShowPatientSelector(false);
    setPatientSearch('');
    
    // Show confirmation
    Alert.alert(
      'Patient Selected',
      `${patient.name} has been selected for this report.`,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  };

  const selectDoctor = (doctorId, doctorName) => {
    setNewReport(prev => ({
      ...prev,
      doctorId,
      doctorName,
    }));
  };

  // Report Management Functions
  const handleAddReport = async () => {
    if (!newReport.type || !newReport.patientId || !newReport.doctorId) {
      Alert.alert('Error', 'Please fill in all required fields (Report Type, Patient, Doctor)');
      return;
    }

    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Please upload at least one file for the report');
      return;
    }

    setLoading(true);
    try {
      // Create the report
      const reportData = {
        type: newReport.type,
        patientId: newReport.patientId,
        patientName: newReport.patientName,
        patientPhone: newReport.patientPhone,
        doctorId: newReport.doctorId,
        doctorName: newReport.doctorName,
        notes: newReport.notes,
        category: newReport.category,
        priority: newReport.priority,
      };

      const createdReport = addReport(reportData);

      // Add files to the report
      for (const file of selectedFiles) {
        await addFileToReport(createdReport.id, file);
      }

      // Reset form
      setShowAddModal(false);
      setNewReport({
        type: '',
        patientId: '',
        patientName: '',
        patientPhone: '',
        doctorId: '',
        doctorName: '',
        notes: '',
        category: 'Laboratory',
        priority: 'normal',
      });
      setSelectedFiles([]);

      Alert.alert('Success', `${newReport.type} has been created successfully!`);
    } catch (error) {
      console.log('Add report error:', error);
      Alert.alert('Error', 'Failed to create report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send Report Functions
  const handleSendReport = (report) => {
    setSelectedReport(report);
    setSendReportData({
      phoneNumber: report.patientPhone || '',
      message: `Your ${report.type} is ready. Please check your patient portal.`,
    });
    setShowSendModal(true);
  };

  const sendReportToPatientPhone = async () => {
    if (!sendReportData.phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    const validation = NotificationHandler.validatePhoneNumber(sendReportData.phoneNumber);
    if (!validation.isValid) {
      Alert.alert('Invalid Phone Number', validation.error);
      return;
    }

    setLoading(true);
    try {
      const result = await NotificationHandler.sendReportToPatient(
        validation.formattedNumber,
        selectedReport,
        patients
      );

      if (result.success) {
        // Update report as sent in context
        sendReportToPatient(selectedReport.id, validation.formattedNumber);
        setShowSendModal(false);
        setSendReportData({ phoneNumber: '', message: '' });
        setSelectedReport(null);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = (reportId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteReport(reportId);
            Alert.alert('Success', 'Report deleted successfully');
          },
        },
      ]
    );
  };

  // View Report Function
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  // Download Report Function
  const handleDownloadReport = async (report) => {
    if (!report.files || report.files.length === 0) {
      Alert.alert('No Files', 'This report has no files to download.');
      return;
    }

    Alert.alert(
      'Download Report',
      `Download ${report.files.length} file(s) for ${report.type}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              setLoading(true);
              
              for (const file of report.files) {
                // For web/simulator, open the file in browser
                if (file.uri && file.uri.startsWith('http')) {
                  await Linking.openURL(file.uri);
                } else {
                  // Simulate download for demo
                  console.log(`Downloading ${file.name}...`);
                }
              }
              
              Alert.alert(
                'Download Started',
                `${report.files.length} file(s) are being downloaded to your device's Downloads folder.`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to download report. Please try again.');
              console.error('Download error:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Share Report Function
  const handleShareReport = async (report) => {
    if (!report.files || report.files.length === 0) {
      Alert.alert('No Files', 'This report has no files to share.');
      return;
    }

    try {
      const shareMessage = `
📋 ${report.type}

👤 Patient: ${report.patientName}
🩺 Doctor: ${report.doctorName}
📅 Date: ${report.date}
📝 Notes: ${report.notes || 'No additional notes'}

Files: ${report.files.length} file(s)
${report.files.map(file => `• ${file.name}`).join('\n')}

📱 KBR Life Care Hospital
      `.trim();

      const result = await Share.share({
        message: shareMessage,
        title: `${report.type} - ${report.patientName}`,
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Success', 'Report shared successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share report. Please try again.');
      console.error('Share error:', error);
    }
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

  const ReportCard = ({ report }) => {
    const getTotalSize = (files) => {
      const totalBytes = files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;
      return formatFileSize(totalBytes);
    };

    const getStatusColor = (status, sentToPatient, viewedByPatient) => {
      if (viewedByPatient) return { bg: '#DCFCE7', text: '#16A34A', label: 'viewed', color: '#15803D' };
      if (sentToPatient) return { bg: '#DBEAFE', text: '#2563EB', label: 'sent', color: '#1D4ED8' };
      return { bg: '#FEF3C7', text: '#D97706', label: 'pending', color: '#B45309' };
    };

    const getReportBgColor = (category) => {
      switch(category?.toLowerCase()) {
        case 'laboratory': return '#4285F4';
        case 'radiology': return '#EA4335';
        case 'cardiology': return '#34A853';
        case 'pathology': return '#FBBC05';
        default: return '#8B5CF6';
      }
    };

    const getReportIcon = (type) => {
      const typeLower = (type || '').toLowerCase();
      
      if (typeLower.includes('blood') || typeLower.includes('lab')) return 'flask-outline';
      if (typeLower.includes('x-ray') || typeLower.includes('scan') || typeLower.includes('mri')) return 'scan-outline';
      if (typeLower.includes('heart') || typeLower.includes('card')) return 'heart-outline';
      if (typeLower.includes('path')) return 'pulse-outline';
      return 'document-text-outline';
    };

    const statusColor = getStatusColor(report.status, report.sentToPatient, report.viewedByPatient);
    const bgColor = report.bgColor || getReportBgColor(report.category);
    const iconName = getReportIcon(report.type);

    return (
      <View style={styles.reportCardContainer}>
        <View style={styles.reportCard}>
          <View style={styles.reportCardHeader}>
            {/* Report Icon */}
            <View style={[styles.reportIconContainer, { backgroundColor: bgColor }]}>
              <Ionicons name={iconName} size={24} color="#FFFFFF" />
            </View>
            
            {/* Report Header Info */}
            <View style={styles.reportHeaderInfo}>
              <View style={styles.reportHeaderTop}>
                <Text style={styles.reportType}>{report.type}</Text>
                {report.priority === 'high' && (
                  <View style={styles.priorityBadge}>
                    <Ionicons name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.priorityText}>High Priority</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.reportCardMeta}>
                <View style={styles.reportMetaItem}>
                  <Ionicons name="person" size={14} color="#6B7280" />
                  <Text style={styles.reportMetaText}>Patient: {report.patientName}</Text>
                </View>
                <View style={styles.reportMetaItem}>
                  <Ionicons name="medkit" size={14} color="#6B7280" />
                  <Text style={styles.reportMetaText}>Doctor: {report.doctorName}</Text>
                </View>
              </View>
            </View>
          </View>
          
          {/* Report Details */}
          <View style={styles.reportDetailsSection}>
            <View style={styles.reportDetailsRow}>
              <View style={styles.reportDetail}>
                <Text style={styles.reportDetailLabel}>Date</Text>
                <Text style={styles.reportDetailValue}>{report.date}</Text>
              </View>
              <View style={styles.reportDetail}>
                <Text style={styles.reportDetailLabel}>Category</Text>
                <Text style={styles.reportDetailValue}>{report.category || 'General'}</Text>
              </View>
              <View style={styles.reportDetail}>
                <Text style={styles.reportDetailLabel}>Files</Text>
                <Text style={styles.reportDetailValue}>
                  {report.files?.length || 0} ({getTotalSize(report.files)})
                </Text>
              </View>
            </View>
            
            <View style={styles.reportStatusRow}>
              <View style={[styles.reportStatusBadge, { backgroundColor: statusColor.bg }]}>
                <View style={styles.statusDot} />
                <Text style={[styles.reportStatusText, { color: statusColor.color }]}>
                  {statusColor.label.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.reportId}>ID: {report.id}</Text>
            </View>
          </View>
          
          {/* Report Actions */}
          <View style={styles.reportActionsRow}>
            <TouchableOpacity 
              style={styles.reportActionButton}
              onPress={() => handleViewReport(report)}
            >
              <Ionicons name="eye" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.reportActionButton, styles.sendActionButton, report.sentToPatient && styles.sentActionButton]}
              onPress={() => handleSendReport(report)}
            >
              <Ionicons 
                name={report.sentToPatient ? "checkmark-circle" : "send"} 
                size={16} 
                color="#FFFFFF" 
              />
              <Text style={styles.actionButtonText}>{report.sentToPatient ? 'Sent' : 'Send'}</Text>
            </TouchableOpacity>
            
            <View style={styles.actionButtonsGroup}>
              <TouchableOpacity 
                style={styles.smallActionButton}
                onPress={() => handleShareReport(report)}
              >
                <Ionicons name="share" size={18} color="#8B5CF6" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.smallActionButton}
                onPress={() => handleDownloadReport(report)}
              >
                <Ionicons name="download" size={18} color="#6B7280" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.smallActionButton}
                onPress={() => handleDeleteReport(report.id)}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          title="Medical Reports"
          subtitle="Generate and manage comprehensive medical reports"
          navigation={navigation}
          showBackButton={true}
          useSimpleAdminHeader={true}
        />

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
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
                    icon="people"
                    color="#10B981"
                    bgColor="#ECFDF5"
                  />
                  <StatCard
                    title="Storage"
                    value={formatFileSize(reportsStats.totalStorage)}
                    icon="server"
                    color="#8B5CF6"
                    bgColor="#F3F0FF"
                  />
                </View>
                <View style={styles.statsRowSecond}>
                  <StatCard
                    title="Sent Reports"
                    value={reportsStats.sentReports.toString()}
                    icon="send"
                    color="#059669"
                    bgColor="#ECFDF5"
                  />
                  <StatCard
                    title="Pending"
                    value={reportsStats.pendingReports.toString()}
                    icon="time"
                    color="#D97706"
                    bgColor="#FFFBEB"
                  />
                </View>
              </View>

              {/* Patient Reports Section */}
              <View style={styles.reportsSection}>
                <View style={styles.sectionHeaderContainer}>
                  <View style={styles.sectionHeaderLeft}>
                    <View style={styles.sectionIconContainer}>
                      <Ionicons name="document-text" size={20} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.sectionTitle}>Patient Reports</Text>
                      <Text style={styles.sectionSubtitle}>
                        {(reports || []).length} total patient medical reports
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setShowAddModal(true)}
                  >
                    <Ionicons name="add" size={16} color={Colors.white} />
                    <Text style={styles.addButtonText}>Add Report</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.reportsList}>
                  {(reports || []).length > 0 ? (
                    (reports || []).map((report) => (
                      <ReportCard key={report.id} report={report} />
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="document-text-outline" size={48} color={Colors.textSecondary} />
                      <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
                      <Text style={styles.emptyStateText}>
                        Start by adding your first patient report using the "Add Report" button above.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
        </ScrollView>

        {/* Enhanced Add Report Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowAddModal(false);
            setSelectedFiles([]);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Report</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowAddModal(false);
                    setSelectedFiles([]);
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Report Type */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Report Type *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newReport.type}
                    onChangeText={(text) => setNewReport({...newReport, type: text})}
                    placeholder="e.g., Blood Test Results, X-Ray Report, MRI Scan"
                  />
                </View>

                {/* Patient Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Patient * ({(patients || []).length} available)</Text>
                  <TouchableOpacity 
                    style={[
                      styles.textInput, 
                      styles.selectorInput,
                      newReport.patientName && styles.selectedInput
                    ]}
                    onPress={() => setShowPatientSelector(true)}
                  >
                    <View style={styles.selectorContent}>
                      {newReport.patientName ? (
                        <View style={styles.selectedPatientInfo}>
                          <Text style={styles.selectedPatientName}>{newReport.patientName}</Text>
                          <Text style={styles.selectedPatientId}>ID: {newReport.patientId}</Text>
                        </View>
                      ) : (
                        <Text style={styles.placeholderText}>Select Patient</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                  {newReport.patientName && (
                    <View style={styles.selectedPatientDetails}>
                      <Text style={styles.selectedInfo}>📞 {newReport.patientPhone}</Text>
                      <TouchableOpacity 
                        style={styles.changePatientButton}
                        onPress={() => setShowPatientSelector(true)}
                      >
                        <Text style={styles.changePatientText}>Change Patient</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Doctor Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Doctor *</Text>
                  <TouchableOpacity 
                    style={[styles.textInput, styles.selectorInput]}
                    onPress={() => {
                      Alert.alert(
                        'Select Doctor',
                        'Choose a doctor for this report:',
                        [
                          ...doctors.map(doctor => ({
                            text: doctor.name,
                            onPress: () => selectDoctor(doctor.id, doctor.name)
                          })),
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }}
                  >
                    <Text style={[
                      styles.selectorText, 
                      !newReport.doctorName && styles.placeholderText
                    ]}>
                      {newReport.doctorName || 'Select Doctor'}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Category and Priority */}
                <View style={styles.rowInputGroup}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <TouchableOpacity 
                      style={[styles.textInput, styles.selectorInput]}
                      onPress={() => {
                        const categories = ['Laboratory', 'Radiology', 'Cardiology', 'Pathology', 'Other'];
                        Alert.alert(
                          'Select Category',
                          'Choose a category:',
                          [
                            ...categories.map(category => ({
                              text: category,
                              onPress: () => setNewReport({...newReport, category})
                            })),
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        );
                      }}
                    >
                      <Text style={styles.selectorText}>{newReport.category}</Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Priority</Text>
                    <TouchableOpacity 
                      style={[styles.textInput, styles.selectorInput]}
                      onPress={() => {
                        const priorities = [
                          { label: 'Normal', value: 'normal' },
                          { label: 'High', value: 'high' },
                          { label: 'Urgent', value: 'urgent' }
                        ];
                        Alert.alert(
                          'Select Priority',
                          'Choose priority level:',
                          [
                            ...priorities.map(priority => ({
                              text: priority.label,
                              onPress: () => setNewReport({...newReport, priority: priority.value})
                            })),
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        );
                      }}
                    >
                      <Text style={styles.selectorText}>
                        {newReport.priority === 'normal' ? 'Normal' : 
                         newReport.priority === 'high' ? 'High' : 
                         newReport.priority === 'urgent' ? 'Urgent' : 'Normal'}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* File Upload Section */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Report Files *</Text>
                  <TouchableOpacity 
                    style={styles.uploadButton}
                    onPress={showFileUploadOptions}
                    disabled={uploadingFile}
                  >
                    {uploadingFile ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Ionicons name="cloud-upload" size={20} color={Colors.white} />
                    )}
                    <Text style={styles.uploadButtonText}>
                      {uploadingFile ? 'Uploading...' : 'Upload Files'}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Selected Files Display */}
                  {selectedFiles.length > 0 && (
                    <View style={styles.filesContainer}>
                      {selectedFiles.map((file, index) => (
                        <View key={index} style={styles.fileItem}>
                          <View style={styles.fileInfo}>
                            <Ionicons 
                              name={FileHandler.getFileIcon(file.name, file.mimeType)} 
                              size={16} 
                              color={Colors.kbrBlue} 
                            />
                            <Text style={styles.fileName}>{file.name}</Text>
                            <Text style={styles.fileSize}>
                              ({FileHandler.formatFileSize(file.size)})
                            </Text>
                          </View>
                          <TouchableOpacity onPress={() => removeFile(index)}>
                            <Ionicons name="close-circle" size={20} color={Colors.kbrRed} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={newReport.notes}
                    onChangeText={(text) => setNewReport({...newReport, notes: text})}
                    placeholder="Additional notes, observations, or recommendations..."
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setSelectedFiles([]);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={handleAddReport}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Create Report</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Patient Selector Modal */}
        <Modal
          visible={showPatientSelector}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setShowPatientSelector(false);
            setPatientSearch('');
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.patientSelectorModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Patient</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowPatientSelector(false);
                    setPatientSearch('');
                  }}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  value={patientSearch}
                  onChangeText={setPatientSearch}
                  placeholder="Search by name, phone, or ID..."
                  autoFocus={false}
                />
              </View>

              {/* Patients Count Info */}
              <View style={styles.patientsCountContainer}>
                <Text style={styles.patientsCountText}>
                  {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} found
                </Text>
              </View>

              {/* Patients List */}
              {filteredPatients.length > 0 ? (
                <FlatList
                  data={filteredPatients}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.patientItem}
                      onPress={() => selectPatient(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.patientAvatarContainer}>
                        <View style={[styles.patientAvatar, { backgroundColor: item.gender === 'Male' ? '#3B82F6' : '#EC4899' }]}>
                          <Ionicons 
                            name="person" 
                            size={20} 
                            color="white" 
                          />
                        </View>
                      </View>
                      <View style={styles.patientInfo}>
                        <Text style={styles.patientName}>{item.name}</Text>
                        <Text style={styles.patientDetails}>
                          ID: {item.id} • Phone: {item.phone}
                        </Text>
                        <Text style={styles.patientMeta}>
                          {item.age}yr • {item.gender} • {item.bloodGroup}
                        </Text>
                        {item.doctor && (
                          <Text style={styles.patientDoctor}>
                            Doctor: {item.doctor}
                          </Text>
                        )}
                      </View>
                      <View style={styles.selectIndicator}>
                        <Ionicons name="chevron-forward" size={20} color={Colors.kbrBlue} />
                      </View>
                    </TouchableOpacity>
                  )}
                  style={styles.patientsList}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.patientsListContent}
                />
              ) : (
                <View style={styles.noPatientsContainer}>
                  <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
                  <Text style={styles.noPatientsTitle}>No Patients Found</Text>
                  <Text style={styles.noPatientsText}>
                    {patientSearch ? 
                      'No patients match your search criteria. Try a different search term.' :
                      'No patients are registered in the system yet.'
                    }
                  </Text>
                  {patientSearch && (
                    <TouchableOpacity 
                      style={styles.clearSearchButton}
                      onPress={() => setPatientSearch('')}
                    >
                      <Text style={styles.clearSearchText}>Clear Search</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}


            </View>
          </View>
        </Modal>

        {/* Send Report Modal */}
        <Modal
          visible={showSendModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSendModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Send Report to Patient</Text>
                <TouchableOpacity 
                  onPress={() => setShowSendModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {selectedReport && (
                  <View style={styles.reportSummary}>
                    <Text style={styles.reportSummaryTitle}>{selectedReport.type}</Text>
                    <Text style={styles.reportSummaryText}>
                      Patient: {selectedReport.patientName}
                    </Text>
                    <Text style={styles.reportSummaryText}>
                      Doctor: {selectedReport.doctorName}
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Patient Phone Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={sendReportData.phoneNumber}
                    onChangeText={(text) => setSendReportData({...sendReportData, phoneNumber: text})}
                    placeholder="Enter 10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={15}
                  />
                  <Text style={styles.inputHint}>
                    The report will be sent to this number and added to the patient's account.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Message (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={sendReportData.message}
                    onChangeText={(text) => setSendReportData({...sendReportData, message: text})}
                    placeholder="Custom message to send with the report..."
                    multiline={true}
                    numberOfLines={3}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowSendModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.disabledButton]}
                  onPress={sendReportToPatientPhone}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="send" size={16} color={Colors.white} />
                      <Text style={[styles.saveButtonText, { marginLeft: 4 }]}>Send Report</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* View Report Modal */}
        <Modal
          visible={showViewModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowViewModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowViewModal(false)}
                >
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>View Report</Text>
              </View>
              <View style={styles.modalHeaderRight}>
                {selectedReport && (
                  <>
                    <TouchableOpacity 
                      style={styles.headerActionButton}
                      onPress={() => handleShareReport(selectedReport)}
                    >
                      <Ionicons name="share" size={20} color="#8B5CF6" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.headerActionButton}
                      onPress={() => handleDownloadReport(selectedReport)}
                    >
                      <Ionicons name="download" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            
            {selectedReport && (
              <ScrollView style={styles.viewModalContent} showsVerticalScrollIndicator={false}>
                {/* Report Header */}
                <View style={styles.viewReportHeader}>
                  <View style={[styles.viewReportIcon, { backgroundColor: selectedReport.bgColor }]}>
                    <Text style={[styles.viewReportIconText, { color: selectedReport.iconColor }]}>
                      {selectedReport.icon}
                    </Text>
                  </View>
                  <View style={styles.viewReportHeaderInfo}>
                    <Text style={styles.viewReportType}>{selectedReport.type}</Text>
                    <Text style={styles.viewReportId}>ID: {selectedReport.id}</Text>
                    {selectedReport.priority === 'high' && (
                      <View style={styles.viewPriorityBadge}>
                        <Ionicons name="alert-circle" size={16} color="#EF4444" />
                        <Text style={styles.viewPriorityText}>High Priority</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Patient & Doctor Info */}
                <View style={styles.viewInfoSection}>
                  <Text style={styles.viewSectionTitle}>Patient Information</Text>
                  <View style={styles.viewInfoRow}>
                    <Ionicons name="person" size={20} color="#6B7280" />
                    <Text style={styles.viewInfoText}>{selectedReport.patientName}</Text>
                  </View>
                  <View style={styles.viewInfoRow}>
                    <Ionicons name="call" size={20} color="#6B7280" />
                    <Text style={styles.viewInfoText}>{selectedReport.patientPhone}</Text>
                  </View>
                </View>

                <View style={styles.viewInfoSection}>
                  <Text style={styles.viewSectionTitle}>Doctor Information</Text>
                  <View style={styles.viewInfoRow}>
                    <Ionicons name="medical" size={20} color="#6B7280" />
                    <Text style={styles.viewInfoText}>{selectedReport.doctorName}</Text>
                  </View>
                  <View style={styles.viewInfoRow}>
                    <Ionicons name="calendar" size={20} color="#6B7280" />
                    <Text style={styles.viewInfoText}>{selectedReport.date} at {selectedReport.time}</Text>
                  </View>
                </View>

                {/* Report Notes */}
                {selectedReport.notes && (
                  <View style={styles.viewInfoSection}>
                    <Text style={styles.viewSectionTitle}>Notes</Text>
                    <Text style={styles.viewNotesText}>{selectedReport.notes}</Text>
                  </View>
                )}

                {/* Files Section */}
                <View style={styles.viewInfoSection}>
                  <Text style={styles.viewSectionTitle}>
                    Report Files ({selectedReport.files?.length || 0})
                  </Text>
                  {selectedReport.files && selectedReport.files.length > 0 ? (
                    selectedReport.files.map((file, index) => (
                      <View key={index} style={styles.viewFileItem}>
                        <View style={styles.viewFileInfo}>
                          <Ionicons 
                            name={file.type === 'image' ? 'image' : 'document'} 
                            size={24} 
                            color="#6B7280" 
                          />
                          <View style={styles.viewFileDetails}>
                            <Text style={styles.viewFileName}>{file.name}</Text>
                            <Text style={styles.viewFileSize}>
                              {((file.size || 0) / (1024 * 1024)).toFixed(1)} MB
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity 
                          style={styles.viewFileButton}
                          onPress={() => {
                            if (file.uri && file.uri.startsWith('http')) {
                              Linking.openURL(file.uri);
                            } else {
                              Alert.alert('File Preview', `Preview for ${file.name}`);
                            }
                          }}
                        >
                          <Ionicons name="eye" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        {file.type === 'image' && file.uri && (
                          <Image 
                            source={{ uri: file.uri }} 
                            style={styles.viewFilePreview}
                            resizeMode="cover"
                          />
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.viewNoFiles}>No files attached to this report</Text>
                  )}
                </View>

                {/* Status Information */}
                <View style={styles.viewInfoSection}>
                  <Text style={styles.viewSectionTitle}>Status Information</Text>
                  <View style={styles.viewStatusGrid}>
                    <View style={styles.viewStatusItem}>
                      <Text style={styles.viewStatusLabel}>Report Status</Text>
                      <Text style={[styles.viewStatusValue, { 
                        color: selectedReport.status === 'available' ? '#16A34A' : '#EF4444' 
                      }]}>
                        {selectedReport.status === 'available' ? 'Available' : 'Pending'}
                      </Text>
                    </View>
                    <View style={styles.viewStatusItem}>
                      <Text style={styles.viewStatusLabel}>Sent to Patient</Text>
                      <Text style={[styles.viewStatusValue, { 
                        color: selectedReport.sentToPatient ? '#16A34A' : '#F59E0B' 
                      }]}>
                        {selectedReport.sentToPatient ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    <View style={styles.viewStatusItem}>
                      <Text style={styles.viewStatusLabel}>Viewed by Patient</Text>
                      <Text style={[styles.viewStatusValue, { 
                        color: selectedReport.viewedByPatient ? '#16A34A' : '#6B7280' 
                      }]}>
                        {selectedReport.viewedByPatient ? 'Yes' : 'No'}
                      </Text>
                    </View>
                    <View style={styles.viewStatusItem}>
                      <Text style={styles.viewStatusLabel}>Category</Text>
                      <Text style={styles.viewStatusValue}>{selectedReport.category}</Text>
                    </View>
                  </View>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            )}
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
    paddingTop: 15,
    paddingBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Top Header Row Styles
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: 12,
  },
  hospitalBranding: {
    flex: 1,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminLogoImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  hospitalTextSection: {
    marginLeft: 14,
  },
  hospitalName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  hospitalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  
  // Header Actions Styles
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  
  // Bottom Header Row Styles
  bottomHeaderRow: {
    paddingHorizontal: Sizes.screenPadding,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
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
    marginBottom: Sizes.sm,
  },
  statsRowSecond: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Sizes.lg,
    paddingBottom: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: Sizes.xl * 2,
  },
  emptyStateTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  emptyStateText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Sizes.lg,
  },
  // Report Card Styles - Enhanced
  reportCardContainer: {
    marginBottom: Sizes.md,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  reportCardHeader: {
    flexDirection: 'row',
    marginBottom: Sizes.md,
  },
  reportIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeaderInfo: {
    flex: 1,
  },
  reportHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  reportType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 4,
  },
  reportCardMeta: {
    marginTop: 4,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportMetaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  reportDetailsSection: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: -Sizes.lg,
    marginBottom: -Sizes.md,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  reportDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Sizes.sm,
  },
  reportDetail: {
    alignItems: 'center',
  },
  reportDetailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  reportDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reportStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: Sizes.sm,
    marginTop: Sizes.sm,
  },
  reportStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'currentColor',
    marginRight: 4,
  },
  reportStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportId: {
    fontSize: 12,
    color: '#6B7280',
  },
  reportActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Sizes.lg,
    marginHorizontal: -8,
  },
  reportActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4B5563',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Sizes.radiusMedium,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  sendActionButton: {
    backgroundColor: '#2563EB',
  },
  sentActionButton: {
    backgroundColor: '#10B981',
  },
  actionButtonsGroup: {
    flexDirection: 'row',
  },
  smallActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
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
  disabledButton: {
    opacity: 0.6,
  },
  
  // Enhanced Modal Styles
  selectorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedInput: {
    borderColor: Colors.kbrBlue,
    backgroundColor: '#F0F9FF',
  },
  selectorContent: {
    flex: 1,
  },
  selectorText: {
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: Sizes.regular,
  },
  selectedPatientInfo: {
    flex: 1,
  },
  selectedPatientName: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  selectedPatientId: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  selectedPatientDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  selectedInfo: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    flex: 1,
  },
  changePatientButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: Sizes.radiusSmall,
  },
  changePatientText: {
    fontSize: Sizes.small,
    color: Colors.white,
    fontWeight: '500',
  },
  rowInputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  
  // File Upload Styles
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingVertical: Sizes.md,
    paddingHorizontal: Sizes.lg,
    borderRadius: Sizes.radiusMedium,
    gap: Sizes.xs,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '500',
  },
  filesContainer: {
    marginTop: Sizes.sm,
    gap: Sizes.xs,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: Sizes.sm,
    borderRadius: Sizes.radiusSmall,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Sizes.xs,
  },
  fileName: {
    fontSize: Sizes.small,
    color: Colors.textPrimary,
    flex: 1,
  },
  fileSize: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  
  // Patient Selector Styles
  patientSelectorModal: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    width: '95%',
    height: '80%',
    maxHeight: 600,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    margin: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    gap: Sizes.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
  },
  patientsCountContainer: {
    paddingHorizontal: Sizes.lg,
    paddingBottom: Sizes.sm,
  },
  patientsCountText: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  patientsList: {
    flex: 1,
  },
  patientsListContent: {
    paddingBottom: Sizes.lg,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  patientAvatarContainer: {
    marginRight: Sizes.md,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  patientDetails: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  patientDoctor: {
    fontSize: Sizes.small,
    color: Colors.kbrBlue,
    fontWeight: '500',
  },
  selectIndicator: {
    marginLeft: Sizes.sm,
  },
  noPatientsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Sizes.xl,
  },
  noPatientsTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  noPatientsText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Sizes.lg,
  },
  clearSearchButton: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
  },
  clearSearchText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '500',
  },
  
  // Send Report Modal Styles
  reportSummary: {
    backgroundColor: Colors.background,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.md,
  },
  reportSummaryTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reportSummaryText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  inputHint: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // View Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActionButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  viewModalContent: {
    flex: 1,
    paddingHorizontal: Sizes.screenPadding,
  },
  viewReportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Sizes.lg,
  },
  viewReportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  viewReportIconText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  viewReportHeaderInfo: {
    flex: 1,
  },
  viewReportType: {
    fontSize: Sizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  viewReportId: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  viewPriorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  viewPriorityText: {
    fontSize: Sizes.small,
    color: '#EF4444',
    fontWeight: '500',
    marginLeft: 4,
  },
  viewInfoSection: {
    marginBottom: Sizes.lg,
  },
  viewSectionTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
  },
  viewInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewInfoText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginLeft: Sizes.md,
    flex: 1,
  },
  viewNotesText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    lineHeight: 22,
    backgroundColor: Colors.background,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
  },
  viewFileItem: {
    backgroundColor: Colors.background,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.sm,
  },
  viewFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewFileDetails: {
    flex: 1,
    marginLeft: Sizes.md,
  },
  viewFileName: {
    fontSize: Sizes.medium,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  viewFileSize: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  viewFileButton: {
    padding: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewFilePreview: {
    width: '100%',
    height: 200,
    borderRadius: Sizes.radiusMedium,
    marginTop: Sizes.md,
  },
  viewNoFiles: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Sizes.lg,
  },
  viewStatusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  viewStatusItem: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: Sizes.md,
  },
  viewStatusLabel: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  viewStatusValue: {
    fontSize: Sizes.medium,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
});

export default ReportsScreen;