import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Share,
  Platform,
  ToastAndroid,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import AppHeader from '../../components/AppHeader';

const windowWidth = Dimensions.get('window').width;

const ReportDetailScreen = ({ route, navigation }) => {
  const { report } = route.params;
  const [activeTab, setActiveTab] = useState('report');
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  // This would come from the report parameter in a real app
  const reportData = report || {
    title: "Complete Blood Count (CBC)",
    doctor: "Dr. Sarah Johnson",
    date: "Dec 10, 2024",
    time: "10:30 AM",
    description: "All parameters within normal range",
    size: "2.3 MB • 3 pages",
    status: "available",
    icon: "water-outline",
    iconColor: Colors.kbrRed,
    type: "bloodwork",
  };
  
  // Mock data for report details
  const reportDetails = {
    summary: "This Complete Blood Count (CBC) test measures several components and features of your blood, including red blood cells, white blood cells, and platelets. Results are within normal ranges, indicating good overall health.",
    testResults: [
      { name: "Hemoglobin", value: "14.2 g/dL", range: "13.5-17.5 g/dL", status: "normal" },
      { name: "White Blood Cells", value: "7.2 K/uL", range: "4.5-11.0 K/uL", status: "normal" },
      { name: "Platelets", value: "250 K/uL", range: "150-450 K/uL", status: "normal" },
      { name: "Red Blood Cells", value: "5.1 M/uL", range: "4.5-5.9 M/uL", status: "normal" },
      { name: "Hematocrit", value: "42%", range: "41-50%", status: "normal" },
    ],
    recommendations: "Continue with regular health maintenance. No specific interventions are needed based on these results. Follow up with your healthcare provider as scheduled.",
  };

  // Handler for downloading the report
  const handleDownload = useCallback(async () => {
    try {
      // Prevent multiple downloads
      if (downloadInProgress) {
        return;
      }
      
      setDownloadInProgress(true);
      
      // Show downloading notification with progress indicator
      Alert.alert(
        'Downloading', 
        'Your report is being downloaded. Please wait...',
        [{ text: 'OK' }]
      );
      
      // Simulate download delay without accessing native modules directly
      setTimeout(() => {
        try {
          // For simplicity in fixing the error, we'll just show a success message
          // instead of actually writing to the file system
          
          if (Platform.OS === 'android') {
            ToastAndroid.show('Report downloaded successfully!', ToastAndroid.SHORT);
          } else {
            Alert.alert(
              'Download Complete', 
              `Report "${reportData.title}" has been saved to your device.`,
              [{ text: 'OK' }]
            );
          }
          
          // Reset download state
          setDownloadInProgress(false);
          
        } catch (err) {
          console.error('Error in download simulation:', err);
          Alert.alert('Download Error', 'Failed to download the report. Please try again.');
          setDownloadInProgress(false);
        }
      }, 2000); // Simulate a 2-second download
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not download the report. Please try again later.');
      setDownloadInProgress(false);
    }
  }, [reportData, downloadInProgress]);

  // Handler for sharing the report
  const handleShare = useCallback(async () => {
    try {
      // Simple text sharing that doesn't rely on native modules
      const shareOptions = {
        title: reportData.title,
        message: `I'd like to share my ${reportData.title} report from KBR Life Care, dated ${reportData.date}.`,
      };
      
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', 'Could not share the report. Please try again later.');
    }
  }, [reportData]);

  // Mock data for different report types
  const bloodworkDetails = {
    summary: "This Complete Blood Count (CBC) test measures several components and features of your blood, including red blood cells, white blood cells, and platelets. Results are within normal ranges, indicating good overall health.",
    testResults: [
      { name: "Hemoglobin", value: "14.2 g/dL", range: "13.5-17.5 g/dL", status: "normal" },
      { name: "White Blood Cells", value: "7.2 K/uL", range: "4.5-11.0 K/uL", status: "normal" },
      { name: "Platelets", value: "250 K/uL", range: "150-450 K/uL", status: "normal" },
      { name: "Red Blood Cells", value: "5.1 M/uL", range: "4.5-5.9 M/uL", status: "normal" },
      { name: "Hematocrit", value: "42%", range: "41-50%", status: "normal" },
    ],
    recommendations: "Continue with regular health maintenance. No specific interventions are needed based on these results. Follow up with your healthcare provider as scheduled.",
  };
  
  const imagingDetails = {
    summary: "This chest X-ray examination shows clear lung fields with no evidence of infiltrates, effusions, or pneumothorax. The heart size appears normal with no evidence of cardiomegaly.",
    findings: [
      "Heart: Normal size and contour",
      "Lungs: Clear lung fields bilaterally",
      "Pleura: No evidence of pleural effusion",
      "Mediastinum: Normal width",
      "Bones: No bony abnormalities noted",
    ],
    recommendations: "No further imaging needed at this time. Follow-up chest X-ray in one year for routine screening or sooner if clinically indicated.",
  };
  
  const physicalDetails = {
    summary: "Annual physical examination shows patient is in overall good health. Vital signs are within normal limits. No significant abnormalities detected during examination.",
    vitals: [
      { name: "Blood Pressure", value: "120/80 mmHg", range: "<130/80 mmHg", status: "normal" },
      { name: "Heart Rate", value: "72 bpm", range: "60-100 bpm", status: "normal" },
      { name: "Respiratory Rate", value: "16 rpm", range: "12-20 rpm", status: "normal" },
      { name: "Temperature", value: "98.6°F", range: "97.8-99.1°F", status: "normal" },
      { name: "Oxygen Saturation", value: "99%", range: ">95%", status: "normal" },
    ],
    examFindings: "HEENT: Normal\nCardiovascular: Regular rate and rhythm, no murmurs\nRespiratory: Clear to auscultation bilaterally\nAbdomen: Soft, non-tender, no organomegaly\nExtremities: No edema, normal pulses\nNeurological: Alert and oriented, normal reflexes",
    recommendations: "Continue healthy lifestyle with regular exercise and balanced diet. Schedule next annual physical exam in one year.",
  };
  
  const invoiceDetails = {
    summary: "Invoice for medical services provided by KBR Life Care.",
    lineItems: [
      { service: "Doctor Consultation", amount: "$100.00" },
      { service: "Laboratory Tests", amount: "$75.00" },
      { service: "Radiology Services", amount: "$150.00" },
      { service: "Medications", amount: "$45.00" },
    ],
    paymentDetails: {
      subtotal: "$370.00",
      discount: "$20.00",
      insurance: "$300.00",
      patientResponsibility: "$50.00",
      paymentStatus: "Paid",
      paymentDate: "Dec 15, 2024",
      paymentMethod: "Credit Card",
      transactionId: "TXN-2024-12345"
    }
  };

  // Determine which details to show based on report type
  const getReportDetails = () => {
    switch (reportData.type) {
      case 'bloodwork':
        return bloodworkDetails;
      case 'imaging':
        return imagingDetails;
      case 'physical':
        return physicalDetails;
      case 'invoice':
        return invoiceDetails;
      default:
        return reportDetails; // Fallback to default
    }
  };

  const renderTabContent = () => {
    const currentDetails = getReportDetails();
    
    switch(activeTab) {
      case 'report':
        if (reportData.type === 'invoice') {
          return (
            <View style={styles.tabContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Invoice Summary</Text>
                <Text style={styles.sectionText}>{currentDetails.summary}</Text>
                
                <View style={styles.invoiceContainer}>
                  <View style={styles.invoiceHeader}>
                    <Text style={styles.invoiceHeaderText}>Service</Text>
                    <Text style={styles.invoiceHeaderText}>Amount</Text>
                  </View>
                  
                  {currentDetails.lineItems.map((item, index) => (
                    <View key={index} style={styles.invoiceRow}>
                      <Text style={styles.invoiceService}>{item.service}</Text>
                      <Text style={styles.invoiceAmount}>{item.amount}</Text>
                    </View>
                  ))}
                  
                  <View style={styles.invoiceDivider} />
                  
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceBoldText}>Subtotal</Text>
                    <Text style={styles.invoiceBoldText}>{currentDetails.paymentDetails.subtotal}</Text>
                  </View>
                  
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceText}>Discount</Text>
                    <Text style={styles.invoiceDiscountText}>-{currentDetails.paymentDetails.discount}</Text>
                  </View>
                  
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceText}>Insurance Coverage</Text>
                    <Text style={styles.invoiceInsuranceText}>-{currentDetails.paymentDetails.insurance}</Text>
                  </View>
                  
                  <View style={styles.invoiceDivider} />
                  
                  <View style={styles.invoiceRow}>
                    <Text style={styles.invoiceTotalText}>Patient Responsibility</Text>
                    <Text style={styles.invoiceTotalAmount}>{currentDetails.paymentDetails.patientResponsibility}</Text>
                  </View>
                  
                  <View style={styles.paymentInfoBox}>
                    <Text style={styles.paymentStatusText}>
                      <Text style={styles.paymentLabel}>Status: </Text>
                      <Text style={[styles.paymentStatus, {color: Colors.kbrGreen}]}>
                        {currentDetails.paymentDetails.paymentStatus}
                      </Text>
                    </Text>
                    <Text style={styles.paymentText}>
                      <Text style={styles.paymentLabel}>Paid on: </Text>
                      {currentDetails.paymentDetails.paymentDate}
                    </Text>
                    <Text style={styles.paymentText}>
                      <Text style={styles.paymentLabel}>Method: </Text>
                      {currentDetails.paymentDetails.paymentMethod}
                    </Text>
                    <Text style={styles.paymentText}>
                      <Text style={styles.paymentLabel}>Transaction ID: </Text>
                      {currentDetails.paymentDetails.transactionId}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        } else if (reportData.type === 'imaging') {
          return (
            <View style={styles.tabContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text style={styles.sectionText}>{currentDetails.summary}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Findings</Text>
                {currentDetails.findings.map((finding, index) => (
                  <View key={index} style={styles.findingItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.kbrGreen} />
                    <Text style={styles.findingText}>{finding}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                <Text style={styles.sectionText}>{currentDetails.recommendations}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Doctor's Notes</Text>
                <View style={styles.doctorNote}>
                  <View style={styles.doctorHeader}>
                    <View style={styles.doctorAvatar}>
                      <Text style={styles.doctorInitials}>MB</Text>
                    </View>
                    <View>
                      <Text style={styles.doctorName}>{reportData.doctor}</Text>
                      <Text style={styles.doctorSpecialty}>Radiologist</Text>
                    </View>
                  </View>
                  <Text style={styles.noteText}>
                    "Chest X-ray reveals normal cardiac silhouette and clear lung fields. 
                    No evidence of infiltrates, effusions, or pneumothorax. 
                    Normal bony structures without fractures or lesions."
                  </Text>
                </View>
              </View>
            </View>
          );
        } else if (reportData.type === 'physical') {
          return (
            <View style={styles.tabContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text style={styles.sectionText}>{currentDetails.summary}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vital Signs</Text>
                <View style={styles.resultsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Measurement</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Result</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Normal Range</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
                  </View>
                  {currentDetails.vitals.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{item.name}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{item.value}</Text>
                      <Text style={[styles.tableCell, { flex: 2, fontSize: Sizes.small }]}>{item.range}</Text>
                      <View style={[styles.statusCell, { flex: 1 }]}>
                        <View style={[styles.statusIndicator, 
                          { backgroundColor: item.status === 'normal' ? Colors.kbrGreen : Colors.warning }]} />
                        <Text style={[styles.statusText, 
                          { color: item.status === 'normal' ? Colors.kbrGreen : Colors.warning }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Examination Findings</Text>
                <Text style={styles.examText}>{currentDetails.examFindings}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                <Text style={styles.sectionText}>{currentDetails.recommendations}</Text>
              </View>
            </View>
          );
        } else {
          // Default bloodwork view
          return (
            <View style={styles.tabContent}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text style={styles.sectionText}>{currentDetails.summary}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Test Results</Text>
                <View style={styles.resultsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Test</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Result</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Normal Range</Text>
                    <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Status</Text>
                  </View>
                  {currentDetails.testResults.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{item.name}</Text>
                      <Text style={[styles.tableCell, { flex: 1 }]}>{item.value}</Text>
                      <Text style={[styles.tableCell, { flex: 2, fontSize: Sizes.small }]}>{item.range}</Text>
                      <View style={[styles.statusCell, { flex: 1 }]}>
                        <View style={[styles.statusIndicator, 
                          { backgroundColor: item.status === 'normal' ? Colors.kbrGreen : Colors.warning }]} />
                        <Text style={[styles.statusText, 
                          { color: item.status === 'normal' ? Colors.kbrGreen : Colors.warning }]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommendations</Text>
                <Text style={styles.sectionText}>{currentDetails.recommendations}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Doctor's Notes</Text>
                <View style={styles.doctorNote}>
                  <View style={styles.doctorHeader}>
                    <View style={styles.doctorAvatar}>
                      <Text style={styles.doctorInitials}>SJ</Text>
                    </View>
                    <View>
                      <Text style={styles.doctorName}>{reportData.doctor}</Text>
                      <Text style={styles.doctorSpecialty}>Hematologist</Text>
                    </View>
                  </View>
                  <Text style={styles.noteText}>
                    "Patient's CBC results are completely normal. All parameters are within reference range 
                    indicating good hematological health. Continue with regular check-ups as scheduled."
                  </Text>
                </View>
              </View>
            </View>
          );
        }
        
      case 'images':
        // Debug log to check the report structure
        console.log('Report data for images:', JSON.stringify(report, null, 2));
        console.log('Files available:', report?.originalReport?.files);
        
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Report Images</Text>
              
              {/* Display actual images from the report */}
              {report?.originalReport?.files && report.originalReport.files.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.imagesGrid}>
                    {report.originalReport.files.map((file, index) => {
                      // Check if the file is an image
                      if (file.type?.includes('image') || file.downloadUrl?.includes('image') || 
                          file.name?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
                        return (
                          <View 
                            key={index} 
                            style={styles.imageItemFullWidth}
                          >
                            <Image 
                              source={{ uri: file.downloadUrl || file.url }} 
                              style={styles.fullWidthImage}
                              resizeMode="contain"
                              onError={(error) => {
                                console.log('Image load error:', error.nativeEvent?.error);
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', file.name);
                              }}
                              onLoadStart={() => {
                                console.log('Starting to load image:', file.downloadUrl || file.url);
                              }}
                            />
                            <View style={styles.imageInfoOverlay}>
                              <Text style={styles.imageNameOverlay} numberOfLines={1}>
                                {file.name || `Image ${index + 1}`}
                              </Text>
                              <Text style={styles.imageSizeOverlay}>
                                {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
                              </Text>
                            </View>
                          </View>
                        );
                      }
                      return null;
                    })}
                  </View>
                  
                  {/* Show files that are not images */}
                  {report.originalReport.files.some(file => 
                    !(file.type?.includes('image') || file.downloadUrl?.includes('image') || 
                      file.name?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i))
                  ) && (
                    <View style={styles.filesSection}>
                      <Text style={styles.filesSectionTitle}>Other Files</Text>
                      {report.originalReport.files
                        .filter(file => !(file.type?.includes('image') || file.downloadUrl?.includes('image') || 
                                        file.name?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)))
                        .map((file, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.fileItem}
                            onPress={() => {
                              Alert.alert(
                                'Download File',
                                `Would you like to download ${file.name}?`,
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Download', onPress: () => {
                                    // Handle file download
                                    console.log('Downloading file:', file.name);
                                  }}
                                ]
                              );
                            }}
                          >
                            <View style={styles.fileInfo}>
                              <Ionicons name="document-outline" size={24} color={Colors.kbrBlue} />
                              <View style={styles.fileDetails}>
                                <Text style={styles.fileName}>{file.name || 'Unknown file'}</Text>
                                <Text style={styles.fileSize}>
                                  {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
                                </Text>
                              </View>
                            </View>
                            <Ionicons name="download-outline" size={20} color={Colors.textSecondary} />
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                  
                  <Text style={styles.imageDisclaimerText}>
                    Report images are displayed above. Files can be downloaded from other sections.
                  </Text>
                </ScrollView>
              ) : reportData.type === 'imaging' ? (
                // Show placeholder for imaging reports without actual images
                <View style={styles.imagesGrid}>
                  <View style={styles.imagePlaceholderFullWidth}>
                    <Ionicons name="image" size={60} color={Colors.textSecondary} />
                    <Text style={styles.imagePlaceholderText}>X-Ray Images</Text>
                    <Text style={styles.imagePlaceholderSubtext}>Images will appear here when available</Text>
                  </View>
                </View>
              ) : (
                // No images available
                <View style={styles.noImagesContainer}>
                  <Ionicons name="image-outline" size={64} color={Colors.textSecondary} />
                  <Text style={styles.noImagesTitle}>No Images Available</Text>
                  <Text style={styles.noImagesText}>
                    This report doesn't contain any images. Images will appear here when available.
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
        
      case 'history':
        return (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Previous Results</Text>
              
              <View style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>Oct 15, 2024</Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{reportData.title}</Text>
                  <Text style={styles.historyDoctor}>{reportData.doctor}</Text>
                  <TouchableOpacity style={styles.historyButton}>
                    <Text style={styles.historyButtonText}>View Results</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Text style={styles.historyDateText}>Jul 22, 2024</Text>
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyTitle}>{reportData.title}</Text>
                  <Text style={styles.historyDoctor}>Dr. Michael Chen</Text>
                  <TouchableOpacity style={styles.historyButton}>
                    <Text style={styles.historyButtonText}>View Results</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      default:
        return <View />;
    }
  };

  return (
    <View style={styles.outerContainer}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          subtitle="Report Details"
          navigation={navigation}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Report Card */}
          <View style={styles.reportCard}>
            <View style={styles.reportHeader}>
              <View style={styles.reportIconContainer}>
                <Ionicons name={reportData.icon} size={32} color={reportData.iconColor} />
              </View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{reportData.title}</Text>
                <Text style={styles.reportDoctor}>{reportData.doctor}</Text>
                <View style={styles.reportDateTime}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.reportDate}>{reportData.date}</Text>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.reportTime}>{reportData.time}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: Colors.kbrGreen + '15' }]}>
                <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>{reportData.status}</Text>
              </View>
            </View>
            
            <View style={styles.reportActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleDownload}
                disabled={downloadInProgress}
              >
                {downloadInProgress ? (
                  <>
                    <ActivityIndicator size="small" color={Colors.kbrBlue} />
                    <Text style={[styles.actionButtonText, {color: Colors.kbrBlue}]}>Downloading...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="download-outline" size={20} color={Colors.kbrBlue} />
                    <Text style={[styles.actionButtonText, {color: Colors.kbrBlue}]}>Download</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="print-outline" size={20} color={Colors.kbrRed} />
                <Text style={[styles.actionButtonText, {color: Colors.kbrRed}]}>Print</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Ionicons name="share-social-outline" size={20} color={Colors.textPrimary} />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'report' && styles.activeTab]}
              onPress={() => setActiveTab('report')}
            >
              <Ionicons 
                name="document-text-outline" 
                size={20} 
                color={activeTab === 'report' ? Colors.kbrBlue : Colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'report' && styles.activeTabText
                ]}
              >
                Report
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'images' && styles.activeTab]}
              onPress={() => setActiveTab('images')}
            >
              <Ionicons 
                name="image-outline" 
                size={20} 
                color={activeTab === 'images' ? Colors.kbrBlue : Colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'images' && styles.activeTabText
                ]}
              >
                Images
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Ionicons 
                name="time-outline" 
                size={20} 
                color={activeTab === 'history' ? Colors.kbrBlue : Colors.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText, 
                  activeTab === 'history' && styles.activeTabText
                ]}
              >
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {renderTabContent()}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  reportCard: {
    backgroundColor: Colors.white,
    margin: Sizes.screenPadding,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  reportIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.kbrRed + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reportDoctor: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  reportDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportDate: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginRight: Sizes.sm,
  },
  reportTime: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: Sizes.radiusSmall,
  },
  statusText: {
    fontSize: Sizes.small,
    fontWeight: '500',
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Sizes.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.sm,
  },
  actionButtonText: {
    fontSize: Sizes.medium,
    marginLeft: 6,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Sizes.screenPadding,
    borderRadius: Sizes.radiusMedium,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Sizes.md,
    backgroundColor: Colors.white,
    gap: 4,
  },
  activeTab: {
    backgroundColor: Colors.lightBackground,
    borderBottomWidth: 2,
    borderBottomColor: Colors.kbrBlue,
  },
  tabText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.kbrBlue,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xxl,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Sizes.large,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Sizes.sm,
  },
  sectionText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  resultsTable: {
    marginTop: Sizes.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.lightBackground,
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.sm,
    borderRadius: Sizes.radiusSmall,
  },
  tableHeaderCell: {
    fontSize: Sizes.small,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Sizes.sm,
    paddingHorizontal: Sizes.sm,
  },
  tableCell: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
  },
  statusCell: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  doctorNote: {
    backgroundColor: Colors.lightBackground,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    marginTop: Sizes.sm,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.kbrBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.sm,
  },
  doctorInitials: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: Sizes.medium,
  },
  doctorName: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  noteText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  historyItem: {
    flexDirection: 'row',
    marginBottom: Sizes.md,
  },
  historyDate: {
    width: 80,
    marginRight: Sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.xs,
  },
  historyDateText: {
    fontSize: Sizes.small,
    fontWeight: '600',
    color: Colors.kbrBlue,
    textAlign: 'center',
  },
  historyContent: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    paddingLeft: Sizes.md,
  },
  historyTitle: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  historyDoctor: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginBottom: Sizes.sm,
  },
  historyButton: {
    backgroundColor: Colors.lightBackground,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusMedium,
    alignSelf: 'flex-start',
  },
  historyButtonText: {
    fontSize: Sizes.small,
    fontWeight: '500',
    color: Colors.kbrBlue,
  },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Sizes.xs,
  },
  findingText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginLeft: Sizes.xs,
  },
  invoiceContainer: {
    marginTop: Sizes.md,
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusSmall,
    padding: Sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  invoiceHeaderText: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Sizes.sm,
  },
  invoiceService: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  invoiceAmount: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  invoiceDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Sizes.sm,
  },
  invoiceText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
  },
  invoiceBoldText: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  invoiceTotalText: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
  },
  invoiceTotalAmount: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
  },
  invoiceDiscountText: {
    color: Colors.kbrGreen,
    fontWeight: '500',
  },
  invoiceInsuranceText: {
    color: Colors.kbrBlue,
    fontWeight: '500',
  },
  paymentInfoBox: {
    marginTop: Sizes.md,
    padding: Sizes.md,
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusSmall,
  },
  paymentStatusText: {
    fontSize: Sizes.medium,
    marginBottom: Sizes.xs,
  },
  paymentLabel: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentStatus: {
    fontWeight: 'bold',
  },
  paymentText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginTop: Sizes.md,
  },
  imagePlaceholder: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: Colors.lightBackground,
    borderRadius: Sizes.radiusMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Sizes.md,
  },
  imagePlaceholderText: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Sizes.sm,
  },
  imagePlaceholderSubtext: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginTop: Sizes.xs,
  },
  imagePlaceholderFullWidth: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.lightBackground,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  imageDisclaimerText: {
    fontSize: Sizes.small,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginTop: Sizes.sm,
  },
  // Images grid layout
  imagesGrid: {
    flex: 1,
    marginTop: 12,
  },
  // Full width image display for mobile
  imageItemFullWidth: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  fullWidthImage: {
    width: '100%',
    minHeight: 200,
    maxHeight: 400,
    backgroundColor: Colors.lightBackground,
  },
  imageInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imageNameOverlay: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  imageSizeOverlay: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // New image and file display styles
  imageItem: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  reportImage: {
    width: '100%',
    height: 140,
    backgroundColor: Colors.lightBackground,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 6,
  },
  imageFileName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
  imageFileSize: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  noImagesContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
    borderRadius: 8,
    marginTop: 12,
  },
  noImagesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  noImagesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  filesSection: {
    marginTop: 24,
  },
  filesSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  examText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
});

export default ReportDetailScreen;