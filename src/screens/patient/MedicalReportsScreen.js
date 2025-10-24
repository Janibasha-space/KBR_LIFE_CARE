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

const MedicalReportsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Reports');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isLoggedIn, userData } = useUnifiedAuth();
  const { reports: contextReports } = useApp();
  const { theme } = useTheme();
  
  // Real-time Firebase reports state
  const [userReports, setUserReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug logging for user data
  console.log('👤 Current user data:', {
    id: userData?.id,
    uid: userData?.uid,
    email: userData?.email,
    phone: userData?.phone || userData?.phoneNumber,
    isLoggedIn,
    contextReportsCount: contextReports?.length || 0
  });

  // Real-time Firebase listener for user-specific reports
  useEffect(() => {
    console.log('🔄 Starting reports fetch useEffect...');
    
    if (!userData?.id && !userData?.uid && !userData?.email && !userData?.phone) {
      console.log('⚠️ No user identification available for reports');
      console.log('userData:', userData);
      setLoading(false);
      return;
    }

    // Try multiple user identifiers
    const userId = userData.id || userData.uid;
    const userEmail = userData.email;
    const userPhone = userData.phone || userData.phoneNumber;
    
    console.log('🔍 Setting up real-time listener for user:', {
      id: userId,
      email: userEmail,
      phone: userPhone,
      fullUserData: userData
    });

    try {
      // Simplified query - fetch ALL reports first, then filter
      console.log('📋 Creating Firebase query...');
      const reportsQuery = query(
        collection(db, 'reports')
      );

      console.log('👂 Setting up onSnapshot listener...');
      const unsubscribe = onSnapshot(reportsQuery, (snapshot) => {
        console.log('📥 Firebase snapshot received, size:', snapshot.size);
        
        const allReports = [];
        snapshot.forEach((doc) => {
          const reportData = {
            id: doc.id,
            ...doc.data()
          };
          allReports.push(reportData);
          console.log('📄 Report found:', {
            id: reportData.id,
            patientId: reportData.patientId,
            sentToPatient: reportData.sentToPatient,
            patientEmail: reportData.patientEmail,
            patientPhone: reportData.patientPhone,
            sentToPhoneNumber: reportData.sentToPhoneNumber
          });
        });
        
        console.log('📊 Total reports from Firebase:', allReports.length);
        
        // Filter reports that are sent to patients
        const sentReports = allReports.filter(report => report.sentToPatient === true);
        console.log('📤 Sent reports:', sentReports.length);
        
        // Filter reports that match any of the user identifiers
        const userSpecificReports = sentReports.filter(report => {
          // Check if report matches user by various fields
          const matchesId = report.patientId === userId;
          const matchesEmail = report.patientEmail === userEmail || report.email === userEmail;
          const matchesPhone = report.patientPhone === userPhone || 
                              report.phone === userPhone ||
                              report.sentToPhoneNumber === userPhone;
          
          console.log('� Checking report:', report.id, {
            reportPatientId: report.patientId,
            userIds: [userId],
            reportEmail: report.patientEmail || report.email,
            userEmails: [userEmail],
            reportPhone: report.patientPhone || report.phone || report.sentToPhoneNumber,
            userPhones: [userPhone],
            matchesId,
            matchesEmail,
            matchesPhone,
            finalMatch: matchesId || matchesEmail || matchesPhone
          });
          
          return matchesId || matchesEmail || matchesPhone;
        });
        
        console.log('👤 User-specific reports found:', userSpecificReports.length);
        
        // Sort by sentAt in JavaScript instead of Firebase
        const sortedReports = userSpecificReports.sort((a, b) => {
          const dateA = new Date(a.sentAt || a.createdAt || 0);
          const dateB = new Date(b.sentAt || b.createdAt || 0);
          return dateB - dateA; // Descending order (newest first)
        });
        
        // Temporary: If no user-specific reports found, show all sent reports for debugging
        const finalReports = sortedReports.length > 0 ? sortedReports : sentReports.slice(0, 5); // Show max 5 for testing
        if (sortedReports.length === 0 && sentReports.length > 0) {
          console.log('⚠️ No user-specific reports found, showing all sent reports for debugging');
        }
        
        setUserReports(finalReports);
        setLoading(false);
        setError(null);
        console.log('✅ Final reports set for user:', finalReports.length);
      }, (error) => {
        console.error('❌ Error fetching user reports:', error);
        setError('Failed to load reports');
        setLoading(false);
        
        // Fallback to context reports if available with flexible matching
        const fallbackReports = contextReports?.filter(r => {
          const matchesId = r.patientId === userId;
          const matchesEmail = r.patientEmail === userEmail || r.email === userEmail;
          const matchesPhone = r.patientPhone === userPhone || 
                              r.phone === userPhone ||
                              r.sentToPhoneNumber === userPhone;
          return (matchesId || matchesEmail || matchesPhone) && r.sentToPatient;
        }) || [];
        setUserReports(fallbackReports);
      });

      return () => {
        unsubscribe();
        console.log('🔧 Cleaned up reports listener');
      };
    } catch (error) {
      console.error('❌ Error setting up reports listener:', error);
      setError('Failed to setup reports listener');
      setLoading(false);
    }
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
        title: report.type,
        doctor: report.doctorName,
        date: new Date(report.sentAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: new Date(report.sentAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        description: report.notes || 'Medical report available',
        size: report.files?.length ? `${report.files.length} file${report.files.length > 1 ? 's' : ''}` : 'No files',
        status: "available",
        icon: getCategoryIcon(category),
        iconColor: getCategoryColor(category),
        type: report.type.toLowerCase().replace(/\\s+/g, ''),
        category: category,
        originalReport: report // Keep reference to original Firebase data
      });
    });
    
    return categorized;
  }, [userReports]);
  
  // Combine all reports from all categories for the All Reports tab
  const allReportsData = Object.values(categoriesMap).flat();
  
  // Recent reports from real data - most recent first
  const recentReportsData = React.useMemo(() => {
    return allReportsData
      .sort((a, b) => {
        const dateA = a.originalReport?.sentAt || a.date;
        const dateB = b.originalReport?.sentAt || b.date;
        return new Date(dateB) - new Date(dateA);
      })
      .slice(0, 5); // Show only 5 most recent
  }, [allReportsData]);

  // Statistics calculation from real data
  const statisticsData = React.useMemo(() => {
    return {
      availableReports: allReportsData.length,
      recentlyViewed: recentReportsData.length,
      pendingReports: 0 // No pending reports concept for patients
    };
  }, [allReportsData.length, recentReportsData.length]);

  // Filter reports based on search query
  const filteredReports = React.useMemo(() => {
    if (!searchQuery.trim()) return allReportsData;
    
    const query = searchQuery.toLowerCase();
    return allReportsData.filter(report =>
      report.title.toLowerCase().includes(query) ||
      report.doctor.toLowerCase().includes(query) ||
      report.category.toLowerCase().includes(query) ||
      report.description.toLowerCase().includes(query)
    );
  }, [allReportsData, searchQuery]);

  // Loading state
  if (loading) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
          <AppHeader 
            subtitle="Reports"
            navigation={navigation}
            showBackButton={true}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading your medical reports...</Text>
            <Text style={[styles.loadingText, { fontSize: 12, marginTop: 10 }]}>
              Debug: User ID: {userData?.id || userData?.uid || 'None'}
            </Text>
            <Text style={[styles.loadingText, { fontSize: 12 }]}>
              Email: {userData?.email || 'None'}
            </Text>
            <Text style={[styles.loadingText, { fontSize: 12 }]}>
              Phone: {userData?.phone || userData?.phoneNumber || 'None'}
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
          <AppHeader 
            subtitle="Reports"
            navigation={navigation}
            showBackButton={true}
          />
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.danger} />
            <Text style={styles.errorTitle}>Unable to Load Reports</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => {
              setLoading(true);
              setError(null);
              // The useEffect will retrigger the data fetch
            }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Empty state for no reports
  if (!userReports.length) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
          <AppHeader 
            subtitle="Reports"
            navigation={navigation}
            showBackButton={true}
          />
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={100} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Login to see reports</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Check authentication - redirect if not logged in
  if (!isLoggedIn) {
    return (
      <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
          <AppHeader 
            subtitle="Reports"
            navigation={navigation}
            showBackButton={true}
          />
          <View style={styles.centerContainer}>
            <Text style={styles.authMessage}>Please log in to view your medical reports</Text>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('PatientLogin')}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Main render function for report cards
  const renderReportCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.reportCard, { backgroundColor: theme.cardBackground }]}
      onPress={() => navigation.navigate('ReportDetail', { report: item })}
      activeOpacity={0.7}
    >
      <View style={styles.reportHeader}>
        <View style={[styles.reportIcon, { backgroundColor: item.iconColor }]}>
          <Ionicons name={item.icon} size={24} color="white" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={[styles.reportTitle, { color: theme.textPrimary }]}>{item.title}</Text>
          <Text style={[styles.reportDoctor, { color: theme.textSecondary }]}>{item.doctor}</Text>
          <Text style={[styles.reportDate, { color: theme.textSecondary }]}>
            {item.date} • {item.time}
          </Text>
        </View>
        <View style={styles.reportStatus}>
          <View style={[styles.statusBadge, { backgroundColor: Colors.success }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.reportDescription, { color: theme.textSecondary }]}>
        {item.description}
      </Text>
      
      <View style={styles.reportFooter}>
        <Text style={[styles.reportSize, { color: theme.textSecondary }]}>{item.size}</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <Ionicons name="download-outline" size={16} color={Colors.primary} />
          <Text style={styles.downloadText}>Download</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <StatusBar 
        backgroundColor="transparent" 
        barStyle="light-content" 
        translucent={true} 
      />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
        {/* Header */}
        <AppHeader 
          subtitle="Reports"
          navigation={navigation}
          showBackButton={true}
        />

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Page Title */}
          <View style={styles.titleContainer}>
            <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Medical Reports</Text>
            <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
              Access and manage all your medical reports
            </Text>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.cardBackground }]}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search reports or doctors..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: Colors.success + '20' }]}>
              <Text style={[styles.statNumber, { color: Colors.success }]}>
                {statisticsData.availableReports}
              </Text>
              <Text style={styles.statLabel}>Available Reports</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.primary + '20' }]}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>
                {statisticsData.recentlyViewed}
              </Text>
              <Text style={styles.statLabel}>Recently Viewed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: Colors.warning + '20' }]}>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>
                {statisticsData.pendingReports}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {['All Reports', 'Recent', 'Invoices', 'Categories'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.tabItem,
                    activeTab === tab && styles.activeTab
                  ]}
                  onPress={() => {
                    setActiveTab(tab);
                    setSelectedCategory(null);
                  }}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText
                  ]}>
                    {tab}
                    {tab === 'Recent' && recentReportsData.length > 0 && (
                      <Text style={styles.tabBadge}> {recentReportsData.length}</Text>
                    )}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content based on active tab */}
          <View style={styles.contentContainer}>
            {activeTab === 'All Reports' && (
              <FlatList
                data={filteredReports}
                renderItem={renderReportCard}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <Ionicons name="document-text-outline" size={64} color={Colors.textSecondary} />
                    <Text style={styles.emptyStateTitle}>No Reports Found</Text>
                    <Text style={styles.emptyStateText}>
                      {searchQuery ? 'Try adjusting your search terms' : 'No reports available'}
                    </Text>
                  </View>
                )}
              />
            )}

            {activeTab === 'Recent' && (
              <FlatList
                data={recentReportsData}
                renderItem={renderReportCard}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={64} color={Colors.textSecondary} />
                    <Text style={styles.emptyStateTitle}>No Recent Reports</Text>
                    <Text style={styles.emptyStateText}>Your recently viewed reports will appear here</Text>
                  </View>
                )}
              />
            )}

            {activeTab === 'Categories' && !selectedCategory && (
              <View style={styles.categoriesGrid}>
                {Object.keys(categoriesMap).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.categoryCard, { backgroundColor: theme.cardBackground }]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) }]}>
                      <Ionicons name={getCategoryIcon(category)} size={32} color="white" />
                    </View>
                    <Text style={[styles.categoryName, { color: theme.textPrimary }]}>{category}</Text>
                    <Text style={[styles.categoryCount, { color: theme.textSecondary }]}>
                      {categoriesMap[category].length} report{categoriesMap[category].length !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {activeTab === 'Categories' && selectedCategory && (
              <View>
                <View style={styles.categoryHeader}>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedCategory(null)}
                  >
                    <Ionicons name="chevron-back" size={24} color={Colors.primary} />
                    <Text style={styles.backButtonText}>Back to Categories</Text>
                  </TouchableOpacity>
                  <Text style={[styles.categoryTitle, { color: theme.textPrimary }]}>{selectedCategory}</Text>
                  <Text style={[styles.categorySubtitle, { color: theme.textSecondary }]}>
                    {categoriesMap[selectedCategory] ? categoriesMap[selectedCategory].length : 0} reports
                  </Text>
                </View>
                
                <FlatList
                  data={categoriesMap[selectedCategory] || []}
                  renderItem={renderReportCard}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              </View>
            )}

            {activeTab === 'Invoices' && (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyStateTitle}>No Invoices</Text>
                <Text style={styles.emptyStateText}>Medical report invoices will appear here</Text>
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
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.lg,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: Sizes.sm,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.lg,
    gap: Sizes.sm,
  },
  statCard: {
    flex: 1,
    padding: Sizes.md,
    borderRadius: Sizes.radiusMedium,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    marginHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.lg,
  },
  tabItem: {
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    marginRight: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    backgroundColor: Colors.background,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.white,
  },
  tabBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  contentContainer: {
    paddingHorizontal: Sizes.screenPadding,
    paddingBottom: Sizes.xl,
  },
  reportCard: {
    padding: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    marginBottom: Sizes.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Sizes.sm,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reportDoctor: {
    fontSize: 14,
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 12,
  },
  reportStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: Sizes.radiusSmall,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Sizes.sm,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportSize: {
    fontSize: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.sm,
    paddingVertical: 4,
    borderRadius: Sizes.radiusSmall,
    backgroundColor: Colors.primary + '20',
  },
  downloadText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: Sizes.lg,
    borderRadius: Sizes.radiusLarge,
    alignItems: 'center',
    marginBottom: Sizes.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    textAlign: 'center',
  },
  categoryHeader: {
    marginBottom: Sizes.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.sm,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Sizes.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Sizes.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Sizes.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.danger,
    marginTop: Sizes.md,
    marginBottom: Sizes.xs,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    marginTop: Sizes.lg,
    marginBottom: Sizes.sm,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.screenPadding,
  },
  authMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Sizes.lg,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.radiusMedium,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MedicalReportsScreen;