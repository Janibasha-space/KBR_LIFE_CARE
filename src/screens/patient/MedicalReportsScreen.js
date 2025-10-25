import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Alert,
  Share,
  Platform,
  ToastAndroid,
  ActivityIndicator,
  FlatList,
  Linking,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import AppHeader from '../../components/AppHeader';
import { useApp } from '../../contexts/AppContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const MedicalReportsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Reports');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isLoggedIn, userData } = useUnifiedAuth();
  const { reports: contextReports } = useApp();
  const { theme } = useTheme();
  
  // Action loading states
  const [downloadingReports, setDownloadingReports] = useState(new Set());
  const [sharingReports, setSharingReports] = useState(new Set());
  
  // Real-time Firebase reports state
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging
  console.log('🔍 MedicalReportsScreen - User Data:', {
    isLoggedIn,
    userId: userData?.id || userData?.uid,
    email: userData?.email,
    phone: userData?.phone,
    contextReportsCount: contextReports?.length || 0
  });

  // Real-time Firebase listener for user-specific reports
  useEffect(() => {
    let unsubscribe = null;
    
    console.log('🔄 Setting up reports listener...');
    
    // Check if user data is available
    if (!userData?.id && !userData?.uid && !userData?.email && !userData?.phone) {
      console.log('❌ No user data available');
      setLoading(false);
      setError('No user data available');
      return;
    }

    setLoading(true);
    setError(null);

    const userId = userData.id || userData.uid;
    const userEmail = userData.email;
    const userPhone = userData.phone || userData.phoneNumber;
    
    console.log('👤 Searching for reports with:', { userId, userEmail, userPhone });
    
    try {
      const reportsRef = collection(db, 'reports');

      unsubscribe = onSnapshot(reportsRef, (snapshot) => {
        console.log('📄 Firebase snapshot received, total docs:', snapshot.size);
        
        const userSpecificReports = [];
        
        snapshot.forEach((doc) => {
          const reportData = { id: doc.id, ...doc.data() };
          
          // Only process reports sent to patients
          if (!reportData.sentToPatient) return;
          
          // Check if report matches user by various fields
          const matchesId = reportData.patientId === userId;
          const matchesEmail = reportData.patientEmail === userEmail || reportData.email === userEmail;
          const matchesPhone = reportData.patientPhone === userPhone || 
                              reportData.phone === userPhone ||
                              reportData.sentToPhoneNumber === userPhone;
          
          if (matchesId || matchesEmail || matchesPhone) {
            userSpecificReports.push(reportData);
            console.log('✅ Found matching report:', reportData.id);
          }
        });
        
        console.log('📊 Total user-specific reports found:', userSpecificReports.length);
        setUserReports(userSpecificReports);
        setLoading(false);
        setError(null);
      }, (error) => {
        console.error('❌ Error fetching user reports:', error);
        setError('Failed to load reports: ' + error.message);
        setLoading(false);
        
        // Fallback to context reports
        if (contextReports && contextReports.length > 0) {
          console.log('🔄 Using context reports as fallback');
          const fallbackReports = contextReports.filter(r => {
            const matchesId = r.patientId === userId;
            const matchesEmail = r.patientEmail === userEmail || r.email === userEmail;
            const matchesPhone = r.patientPhone === userPhone || 
                                r.phone === userPhone ||
                                r.sentToPhoneNumber === userPhone;
            return (matchesId || matchesEmail || matchesPhone) && r.sentToPatient;
          });
          setUserReports(fallbackReports);
        }
      });

    } catch (error) {
      console.error('❌ Error setting up reports listener:', error);
      setError('Failed to setup reports listener: ' + error.message);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (unsubscribe) {
        console.log('🧹 Cleaning up reports listener');
        unsubscribe();
      }
    };
  }, [userData?.id, userData?.uid, userData?.email, userData?.phone, contextReports]);

  // Helper function to get color for category
  const getCategoryColor = (category) => {
    const colors = {
      'Blood Tests': Colors.kbrRed,
      'Imaging': Colors.kbrBlue,
      'Cardiology': '#E91E63', // Pink
      'Pathology': Colors.kbrGreen,
      'Radiology': '#9C27B0', // Purple
      'Urine Tests': '#FF9800', // Orange
      'Laboratory': Colors.kbrGreen,
      'General': Colors.kbrBlue
    };
    return colors[category] || Colors.kbrBlue;
  };
  
  // Helper function to get icon for category
  const getCategoryIcon = (category) => {
    const icons = {
      'Blood Tests': 'water-outline',
      'Imaging': 'image-outline',
      'Cardiology': 'heart-outline',
      'Pathology': 'flask-outline',
      'Radiology': 'scan-outline',
      'Urine Tests': 'flask-outline',
      'Laboratory': 'flask-outline',
      'General': 'document-text-outline'
    };
    return icons[category] || 'document-text-outline';
  };

  // Share functionality
  const handleShare = async (report) => {
    // Set loading state
    setSharingReports(prev => new Set([...prev, report.id]));
    
    try {
      const patientName = userData?.name || userData?.email || 'Patient';
      const hospitalName = 'KBR Life Care Hospital';
      const currentDate = new Date().toLocaleDateString();
      
      const shareMessage = `🏥 ${hospitalName}\n` +
                          `� Medical Report Summary\n\n` +
                          `👤 Patient: ${patientName}\n` +
                          `📄 Report: ${report.title}\n` +
                          `👨‍⚕️ Doctor: Dr. ${report.doctor}\n` +
                          `📅 Report Date: ${report.date}\n` +
                          `🕐 Time: ${report.time}\n\n` +
                          `📝 Description:\n${report.description}\n\n` +
                          `📊 Report Details:\n` +
                          `• Category: ${report.category || 'General'}\n` +
                          `• File Size: ${report.size}\n` +
                          `• Status: Available for download\n\n` +
                          `📱 Shared on: ${currentDate}\n` +
                          `Generated by KBR Life Care Mobile App\n\n` +
                          `"Your Health, Our Priority" 💙`;

      const shareOptions = {
        message: shareMessage,
        title: `Medical Report - ${report.title}`,
        subject: `Medical Report: ${report.title} - ${hospitalName}`,
      };

      // Add URL for iOS if available
      if (Platform.OS === 'ios' && (report.downloadUrl || report.fileUrl)) {
        shareOptions.url = report.downloadUrl || report.fileUrl;
      }

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log(`📤 Report shared via: ${result.activityType}`);
        }
        
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            '📤 Report shared successfully!', 
            ToastAndroid.SHORT
          );
        } else {
          // For iOS, success is implied by the share completion
          console.log('📤 Report shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('📤 Share dismissed by user');
      }
    } catch (error) {
      console.error('❌ Error sharing report:', error);
      
      let errorMessage = 'Unable to share the report. ';
      
      if (error.message?.includes('not available')) {
        errorMessage += 'Sharing is not available on this device.';
      } else if (error.message?.includes('cancelled')) {
        errorMessage += 'Share was cancelled.';
      } else {
        errorMessage += 'Please try again or copy the report details manually.';
      }
      
      Alert.alert(
        'Share Failed', 
        errorMessage,
        [
          { text: 'OK' },
          { 
            text: 'Copy Details', 
            onPress: () => {
              // Fallback: create a simple text to copy
              const simpleText = `Medical Report: ${report.title}\nDoctor: Dr. ${report.doctor}\nDate: ${report.date}\nKBR Life Care Hospital`;
              // Note: Clipboard API would need to be added for copy functionality
              Alert.alert('Report Details', simpleText);
            }
          }
        ]
      );
    } finally {
      // Clear loading state
      setSharingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  // Download functionality
  const handleDownload = async (report) => {
    // Set loading state
    setDownloadingReports(prev => new Set([...prev, report.id]));
    
    try {
      // Check if report has downloadUrl
      if (!report.downloadUrl && !report.fileUrl) {
        Alert.alert(
          'Download Not Available',
          'This report doesn\'t have a downloadable file available yet. Please contact your doctor or the hospital for assistance.',
          [{ text: 'OK' }]
        );
        return;
      }

      const downloadUrl = report.downloadUrl || report.fileUrl;
      
      // For Android, request storage permission
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'KBR Life Care needs access to your storage to download medical reports.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied', 
            'Storage permission is required to download reports. Please enable it in app settings.',
            [
              { text: 'Cancel' },
              { text: 'Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }

      // Show loading indicator
      const loadingAlert = Alert.alert(
        'Downloading Report',
        `Please wait while we download "${report.title}"...`,
        [],
        { cancelable: false }
      );

      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const cleanTitle = report.title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
      const filename = `KBR_${cleanTitle}_${timestamp}.pdf`;
      
      if (Platform.OS === 'web') {
        // For web platform, open in new tab
        window.open(downloadUrl, '_blank');
        Alert.alert('Download Started', 'The report will open in a new tab for download.');
      } else {
        // For mobile platforms
        const fileUri = FileSystem.documentDirectory + filename;
        
        const downloadObject = FileSystem.createDownloadResumable(
          downloadUrl,
          fileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            console.log(`📥 Download progress: ${Math.round(progress * 100)}%`);
          }
        );

        const { uri } = await downloadObject.downloadAsync();
        
        // Try to save to media library if available
        try {
          const { status } = await MediaLibrary.requestPermissionsAsync();
          if (status === 'granted') {
            const asset = await MediaLibrary.createAssetAsync(uri);
            const albumExists = await MediaLibrary.getAlbumAsync('KBR Medical Reports');
            if (albumExists) {
              await MediaLibrary.addAssetsToAlbumAsync([asset], albumExists, false);
            } else {
              await MediaLibrary.createAlbumAsync('KBR Medical Reports', asset, false);
            }
            console.log('📁 Report saved to KBR Medical Reports album');
          }
        } catch (mediaError) {
          console.log('📱 MediaLibrary not available or permission denied:', mediaError);
          // Continue without media library - file is still saved to app directory
        }

        // Dismiss loading alert
        Alert.dismiss?.();

        // Show success message
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            `✅ "${report.title}" downloaded successfully!`, 
            ToastAndroid.LONG
          );
        } else {
          Alert.alert(
            '✅ Download Complete',
            `Report "${report.title}" has been downloaded successfully and saved to your device.`,
            [
              { text: 'OK' },
              { 
                text: 'Open File', 
                onPress: () => {
                  Linking.openURL(uri).catch(() => {
                    Alert.alert('Error', 'Unable to open the file. Please check your file manager.');
                  });
                }
              }
            ]
          );
        }
      }
    } catch (error) {
      console.error('❌ Error downloading report:', error);
      
      // Dismiss any loading alert
      Alert.dismiss?.();
      
      let errorMessage = 'Unable to download the report. ';
      
      if (error.message?.includes('Network')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (error.message?.includes('permission')) {
        errorMessage += 'Storage permission is required. Please enable it in app settings.';
      } else if (error.message?.includes('space')) {
        errorMessage += 'Not enough storage space available on your device.';
      } else {
        errorMessage += 'Please try again later or contact support if the problem persists.';
      }
      
      Alert.alert(
        'Download Failed',
        errorMessage,
        [
          { text: 'OK' },
          ...(error.message?.includes('permission') ? [
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ] : [])
        ]
      );
    } finally {
      // Clear loading state
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(report.id);
        return newSet;
      });
    }
  };

  // Convert Firebase reports to categorized format
  const categoriesMap = React.useMemo(() => {
    if (!userReports.length) return {};
    
    const categorized = {};
    userReports.forEach(report => {
      const category = report.category || 'General';
      if (!categorized[category]) {
        categorized[category] = [];
      }
      
      // Convert Firebase report format to display format
      categorized[category].push({
        id: report.id,
        title: report.type || report.testName || report.reportTitle || 'Medical Report',
        doctor: report.doctorName || 'Dr. Unknown',
        date: new Date(report.sentAt || report.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: new Date(report.sentAt || report.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        description: report.notes || report.description || 'Medical report available',
        size: report.files?.length ? `${report.files.length} file${report.files.length > 1 ? 's' : ''}` : 'No files',
        status: "available",
        icon: getCategoryIcon(category),
        iconColor: getCategoryColor(category),
        type: (report.type || 'general').toLowerCase().replace(/\s+/g, ''),
        category: category,
        originalReport: report // Keep reference to original Firebase data
      });
    });
    
    return categorized;
  }, [userReports]);

  // Get all reports data
  const allReportsData = Object.values(categoriesMap).flat();

  // Recent reports data (last 5 recent reports)
  const recentReportsData = React.useMemo(() => {
    return allReportsData
      .sort((a, b) => new Date(b.originalReport.sentAt || b.originalReport.createdAt) - new Date(a.originalReport.sentAt || a.originalReport.createdAt))
      .slice(0, 5);
  }, [allReportsData]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme?.background || Colors.background }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || Colors.background }]} edges={['left', 'right']}>
          <AppHeader 
            subtitle="Reports"
            navigation={navigation}
            showBackButton={true}
          />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: theme?.textPrimary || Colors.text }]}>
              Loading your medical reports...
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme?.background || Colors.background }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || Colors.background }]} edges={['left', 'right']}>
          <AppHeader 
            subtitle="Reports"
            navigation={navigation}
            showBackButton={true}
          />
          <View style={styles.centerContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.danger} />
            <Text style={[styles.errorTitle, { color: theme?.textPrimary || Colors.text }]}>
              Unable to Load Reports
            </Text>
            <Text style={[styles.errorText, { color: theme?.textSecondary || Colors.textSecondary }]}>
              {error}
            </Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => {
                setLoading(true);
                setError(null);
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // No authentication state
  if (!isLoggedIn) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme?.background || Colors.background }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || Colors.background }]} edges={['left', 'right']}>
          <AppHeader 
            subtitle="Reports"
            navigation={navigation}
            showBackButton={true}
          />
          <View style={styles.authRequiredContainer}>
            <View style={styles.authRequiredContent}>
              <Ionicons name="document-text-outline" size={80} color={Colors.textSecondary} />
              <Text style={styles.authRequiredTitle}>Login Required</Text>
              <Text style={styles.authRequiredMessage}>
                Please login to access your medical reports and health information.
              </Text>
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={() => {
                  navigation.navigate('PatientMain', { 
                    screen: 'Home',
                    params: { showAuthModal: true }
                  });
                }}
              >
                <Ionicons name="log-in-outline" size={20} color={Colors.white} />
                <Text style={styles.loginButtonText}>Login Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Main content with original layout
  return (
    <View style={[styles.outerContainer, { backgroundColor: theme?.background || Colors.background }]}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme?.background || Colors.background }]} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          subtitle="Reports"
          navigation={navigation}
          showBackButton={true}
        />

        <ScrollView style={[styles.scrollView, { backgroundColor: theme?.background || Colors.background }]} showsVerticalScrollIndicator={false}>
          {/* Title Section */}
          <View style={[styles.titleSection, { backgroundColor: theme?.background || Colors.background }]}>
            <Text style={styles.mainTitle}>Medical Reports</Text>
            <Text style={styles.subtitle}>Access and manage all your medical reports</Text>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchSection, { backgroundColor: theme?.background || Colors.background }]}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search reports or doctors..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Statistics */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: Colors.kbrGreen + '15' }]}>
                <Text style={[styles.statNumber, { color: Colors.kbrGreen }]}>{allReportsData.length}</Text>
                <Text style={styles.statLabel}>Available Reports</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.kbrBlue + '15' }]}>
                <Text style={[styles.statNumber, { color: Colors.kbrBlue }]}>{recentReportsData.length}</Text>
                <Text style={styles.statLabel}>Recently Viewed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.warning + '15' }]}>
                <Text style={[styles.statNumber, { color: Colors.warning }]}>0</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tabsContainer}>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'All Reports' && styles.activeTabButton]}
                  onPress={() => setActiveTab('All Reports')}
                >
                  <Text style={activeTab === 'All Reports' ? styles.activeTabButtonText : styles.tabButtonText}>
                    All Reports
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'Recent' && styles.activeTabButton]}
                  onPress={() => setActiveTab('Recent')}
                >
                  <View style={styles.tabWithBadge}>
                    <Text style={activeTab === 'Recent' ? styles.activeTabButtonText : styles.tabButtonText}>
                      Recent
                    </Text>
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{recentReportsData.length}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'Categories' && styles.activeTabButton]}
                  onPress={() => setActiveTab('Categories')}
                >
                  <Text style={activeTab === 'Categories' ? styles.activeTabButtonText : styles.tabButtonText}>
                    Categories
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>

          {/* Reports Content */}
          <View style={styles.reportsSection}>
            {activeTab === 'All Reports' && allReportsData.map((report) => (
              <View key={report.id} style={[styles.reportCard, { backgroundColor: theme?.cardBackground || Colors.white }]}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportIconContainer}>
                    <View style={[styles.reportIcon, { backgroundColor: report.iconColor + '20' }]}>
                      <Ionicons name={report.icon} size={24} color={report.iconColor} />
                    </View>
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={[styles.reportTitle, { color: theme?.textPrimary || Colors.text }]}>{report.title}</Text>
                    <Text style={[styles.reportDoctor, { color: theme?.textSecondary || Colors.textSecondary }]}>Dr. {report.doctor}</Text>
                    <Text style={[styles.reportDate, { color: theme?.textSecondary || Colors.textSecondary }]}>{report.date} • {report.time}</Text>
                  </View>
                  <View style={styles.reportActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, sharingReports.has(report.id) && styles.actionButtonLoading]}
                      onPress={() => handleShare(report)}
                      disabled={sharingReports.has(report.id)}
                    >
                      {sharingReports.has(report.id) ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Ionicons name="share-outline" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, downloadingReports.has(report.id) && styles.actionButtonLoading]}
                      onPress={() => handleDownload(report)}
                      disabled={downloadingReports.has(report.id)}
                    >
                      {downloadingReports.has(report.id) ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Ionicons name="download-outline" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.reportDescription, { color: theme?.textSecondary || Colors.textSecondary }]}>{report.description}</Text>
                <View style={styles.reportFooter}>
                  <Text style={[styles.reportSize, { color: theme?.textSecondary || Colors.textSecondary }]}>{report.size}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: Colors.success + '20' }]}>
                    <Text style={[styles.statusText, { color: Colors.success }]}>Available</Text>
                  </View>
                </View>
              </View>
            ))}

            {activeTab === 'Recent' && recentReportsData.map((report) => (
              <View key={report.id} style={[styles.reportCard, { backgroundColor: theme?.cardBackground || Colors.white }]}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportIconContainer}>
                    <View style={[styles.reportIcon, { backgroundColor: report.iconColor + '20' }]}>
                      <Ionicons name={report.icon} size={24} color={report.iconColor} />
                    </View>
                  </View>
                  <View style={styles.reportInfo}>
                    <Text style={[styles.reportTitle, { color: theme?.textPrimary || Colors.text }]}>{report.title}</Text>
                    <Text style={[styles.reportDoctor, { color: theme?.textSecondary || Colors.textSecondary }]}>Dr. {report.doctor}</Text>
                    <Text style={[styles.reportDate, { color: theme?.textSecondary || Colors.textSecondary }]}>{report.date} • {report.time}</Text>
                  </View>
                  <View style={styles.reportActions}>
                    <TouchableOpacity 
                      style={[styles.actionButton, sharingReports.has(report.id) && styles.actionButtonLoading]}
                      onPress={() => handleShare(report)}
                      disabled={sharingReports.has(report.id)}
                    >
                      {sharingReports.has(report.id) ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Ionicons name="share-outline" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, downloadingReports.has(report.id) && styles.actionButtonLoading]}
                      onPress={() => handleDownload(report)}
                      disabled={downloadingReports.has(report.id)}
                    >
                      {downloadingReports.has(report.id) ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Ionicons name="download-outline" size={20} color={Colors.primary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.reportDescription, { color: theme?.textSecondary || Colors.textSecondary }]}>{report.description}</Text>
                <View style={styles.reportFooter}>
                  <Text style={[styles.reportSize, { color: theme?.textSecondary || Colors.textSecondary }]}>{report.size}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: Colors.success + '20' }]}>
                    <Text style={[styles.statusText, { color: Colors.success }]}>Available</Text>
                  </View>
                </View>
              </View>
            ))}

            {activeTab === 'Categories' && Object.keys(categoriesMap).map((category) => (
              <View key={category} style={[styles.categorySection, { backgroundColor: theme?.cardBackground || Colors.white }]}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) + '20' }]}>
                    <Ionicons name={getCategoryIcon(category)} size={20} color={getCategoryColor(category)} />
                  </View>
                  <Text style={[styles.categoryTitle, { color: theme?.textPrimary || Colors.text }]}>{category}</Text>
                  <Text style={[styles.categoryCount, { color: theme?.textSecondary || Colors.textSecondary }]}>({categoriesMap[category].length})</Text>
                </View>
                {categoriesMap[category].slice(0, 2).map((report) => (
                  <View key={report.id} style={styles.categoryReportItem}>
                    <Text style={[styles.categoryReportTitle, { color: theme?.textPrimary || Colors.text }]}>{report.title}</Text>
                    <Text style={[styles.categoryReportDate, { color: theme?.textSecondary || Colors.textSecondary }]}>{report.date}</Text>
                  </View>
                ))}
                {categoriesMap[category].length > 2 && (
                  <TouchableOpacity style={styles.viewMoreButton}>
                    <Text style={[styles.viewMoreText, { color: Colors.primary }]}>View {categoriesMap[category].length - 2} more</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Empty state */}
            {allReportsData.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={100} color={Colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: theme?.textPrimary || Colors.text }]}>No Reports Found</Text>
                <Text style={[styles.emptyText, { color: theme?.textSecondary || Colors.textSecondary }]}>
                  You don't have any medical reports yet. Reports will appear here once they are available.
                </Text>
              </View>
            )}
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  authRequiredContent: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  authRequiredTitle: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Sizes.lg,
    marginBottom: Sizes.sm,
  },
  authRequiredMessage: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Sizes.xl,
    paddingHorizontal: Sizes.lg,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginLeft: Sizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.lg,
  },
  mainTitle: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    color: Colors.kbrRed,
    marginBottom: Sizes.xs,
  },
  subtitle: {
    fontSize: Sizes.regular,
    color: Colors.textSecondary,
  },
  searchSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: Sizes.regular,
    color: Colors.textPrimary,
    marginLeft: Sizes.sm,
  },
  statsSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Sizes.xs,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Sizes.title,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabsSection: {
    marginBottom: Sizes.md,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.screenPadding,
    gap: Sizes.sm,
  },
  tabButton: {
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeTabButton: {
    backgroundColor: Colors.kbrBlue,
    borderColor: Colors.kbrBlue,
  },
  tabButtonText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  activeTabButtonText: {
    fontSize: Sizes.medium,
    color: Colors.white,
    fontWeight: '500',
  },
  tabWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBadge: {
    backgroundColor: Colors.kbrRed,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  tabBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportsSection: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
  },
  reportCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Sizes.md,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  reportDoctor: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  reportDate: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  reportDescription: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportSize: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 2,
    borderRadius: Sizes.radiusSmall,
  },
  statusText: {
    fontSize: Sizes.small,
    fontWeight: '500',
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonLoading: {
    opacity: 0.6,
    backgroundColor: Colors.primary + '10',
  },
  categorySection: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusLarge,
    padding: Sizes.lg,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.md,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.sm,
  },
  categoryTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  categoryCount: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  categoryReportItem: {
    paddingVertical: Sizes.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Sizes.xs,
  },
  categoryReportTitle: {
    fontSize: Sizes.medium,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  categoryReportDate: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  viewMoreButton: {
    paddingVertical: Sizes.xs,
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: Sizes.small,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Sizes.xxl,
  },
  emptyTitle: {
    fontSize: Sizes.xlarge,
    fontWeight: 'bold',
    marginTop: Sizes.lg,
    marginBottom: Sizes.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Sizes.lg,
  },
});

export default MedicalReportsScreen;