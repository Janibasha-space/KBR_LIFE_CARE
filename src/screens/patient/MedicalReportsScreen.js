import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import AppHeader from '../../components/AppHeader';

const MedicalReportsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Reports');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isLoggedIn, userData } = useUser();
  
  // Helper function to get color for category
  const getCategoryColor = (category) => {
    const colors = {
      'Blood Tests': Colors.kbrRed,
      'Imaging': Colors.kbrBlue,
      'Cardiology': '#E91E63', // Pink
      'Pathology': Colors.kbrGreen,
      'Radiology': '#9C27B0', // Purple
      'Urine Tests': '#FF9800', // Orange
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
      'General': 'document-text-outline'
    };
    return icons[category] || 'document-text-outline';
  };
  
  // Define categoriesMap for the Categories tab (with enhanced data as shown in the image)
  const categoriesMap = {
    "Blood Tests": [
      {
        id: 1,
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
        category: "Blood Tests"
      },
      {
        id: 4, // This is the original Lipid Profile in Blood Tests category
        title: "Lipid Profile",
        doctor: "Dr. James Wilson",
        date: "Dec 5, 2024",
        time: "11:00 AM",
        description: "Cholesterol and triglycerides evaluation",
        size: "1.8 MB • 2 pages",
        status: "available",
        icon: "flask-outline",
        iconColor: Colors.kbrRed,
        type: "bloodwork",
        category: "Blood Tests"
      },
      {
        id: 8,
        title: "Blood Sugar Test",
        doctor: "Dr. Maria Rodriguez",
        date: "Nov 28, 2024",
        time: "8:30 AM",
        description: "Fasting and post-prandial glucose levels",
        size: "1.1 MB • 2 pages",
        status: "available",
        icon: "water-outline",
        iconColor: Colors.kbrRed,
        type: "bloodwork",
        category: "Blood Tests"
      }
    ],
    "Imaging": [
      {
        id: 2,
        title: "Chest X-Ray",
        doctor: "Dr. Michael Brown",
        date: "Dec 8, 2024",
        time: "2:15 PM",
        description: "No abnormalities detected",
        size: "5.1 MB • 2 pages",
        status: "available",
        icon: "image-outline",
        iconColor: Colors.kbrBlue,
        type: "imaging",
        category: "Imaging"
      }
    ],
    "Cardiology": [
      {
        id: 5,
        title: "Electrocardiogram (ECG)",
        doctor: "Dr. Robert Chen",
        date: "Nov 30, 2024",
        time: "3:45 PM",
        description: "Normal sinus rhythm",
        size: "2.8 MB • 3 pages",
        status: "available",
        icon: "heart-outline",
        iconColor: "#E91E63",
        type: "cardiology",
        category: "Cardiology"
      }
    ],
    "Pathology": [],
    "Radiology": [
      {
        id: 6,
        title: "Brain MRI",
        doctor: "Dr. Lisa Thompson",
        date: "Nov 15, 2024",
        time: "10:00 AM",
        description: "No significant findings",
        size: "12.4 MB • 5 pages",
        status: "available",
        icon: "scan-outline",
        iconColor: "#9C27B0",
        type: "radiology",
        category: "Radiology"
      }
    ],
    "Urine Tests": [
      {
        id: 7,
        title: "Routine Urine Analysis",
        doctor: "Dr. Mark Davis",
        date: "Dec 1, 2024",
        time: "9:30 AM",
        description: "Normal findings",
        size: "1.5 MB • 2 pages",
        status: "available",
        icon: "flask-outline",
        iconColor: "#FF9800",
        type: "urinalysis",
        category: "Urine Tests"
      }
    ]
  };
  
  // Combine all reports from all categories for the All Reports tab
  const allReportsData = Object.values(categoriesMap).flat();
  
  // Recent reports - let's sort them by most recent date first and take only the recent ones
  // We're also adding a "lastViewed" property to indicate when the report was last accessed
  const recentReportsData = [
    {
      ...allReportsData[0],
      id: 901, // Use a unique ID to avoid conflicts
      lastViewed: "Today, 9:45 AM"
    },
    {
      ...allReportsData[1],
      id: 902, // Use a unique ID to avoid conflicts
      lastViewed: "Yesterday, 3:20 PM"
    },
    {
      id: 903, // Use a unique ID to avoid conflicts with other lists
      title: "Lipid Profile",
      doctor: "Dr. James Wilson",
      date: "Dec 5, 2024",
      time: "11:00 AM",
      description: "Cholesterol and triglycerides evaluation",
      size: "1.8 MB • 2 pages",
      status: "available",
      icon: "flask-outline",
      iconColor: Colors.kbrRed,
      type: "bloodwork",
      category: "Bloodwork",
      lastViewed: "2 days ago, 10:15 AM"
    }
  ];
  
  // Invoices data
  const invoicesData = [
    {
      id: 101,
      title: "Hospital Visit Invoice #INV-2024-12",
      doctor: "KBR Life Care",
      date: "Dec 10, 2024",
      time: "11:45 AM",
      description: "Hospital visit and consultation charges",
      size: "0.5 MB • 1 page",
      status: "paid",
      icon: "cash-outline",
      iconColor: Colors.kbrGreen,
      type: "invoice",
      amount: "$150.00"
    },
    {
      id: 102,
      title: "Laboratory Tests Invoice #INV-2024-11",
      doctor: "KBR Life Care",
      date: "Dec 10, 2024",
      time: "11:30 AM",
      description: "CBC and other laboratory tests",
      size: "0.8 MB • 1 page",
      status: "paid",
      icon: "cash-outline",
      iconColor: Colors.kbrGreen,
      type: "invoice",
      amount: "$75.00"
    }
  ];


  // Handle download report
  const handleDownload = async (reportTitle) => {
    try {
      // Show downloading notification
      Alert.alert('Downloading', 'Download started...', [{ text: 'OK' }]);
      
      // Simulate download delay without native module dependencies
      setTimeout(() => {
        try {
          // Simplified success notification without file operations
          if (Platform.OS === 'android') {
            ToastAndroid.show('Report downloaded successfully!', ToastAndroid.SHORT);
          } else {
            Alert.alert(
              'Download Complete', 
              `${reportTitle} has been downloaded successfully`,
              [{ text: 'OK' }]
            );
          }
        } catch (err) {
          console.error('Error in download simulation:', err);
          Alert.alert('Download Error', 'Failed to download the report. Please try again.');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Failed', 'Could not download the report. Please try again later.');
    }
  };

  // Handle share report
  const handleShare = async (reportTitle, doctorName, date) => {
    try {
      // Simplified share function without URL that might cause issues
      const shareOptions = {
        title: reportTitle,
        message: `I'd like to share my ${reportTitle} report from KBR Life Care by Dr. ${doctorName}, dated ${date}.`,
      };
      
      await Share.share(shareOptions);
      
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Share Failed', 'Could not share the report. Please try again later.');
    }
  };

  const { theme } = useTheme();

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent={true} />
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
        {/* App Header */}
        <AppHeader 
          subtitle="Reports"
          navigation={navigation}
          showBackButton={true}
          // Use default back behavior from AppHeader
        />

        <ScrollView style={[styles.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
          {/* Title Section */}
          <View style={[styles.titleSection, { backgroundColor: theme.background }]}>
            <Text style={styles.mainTitle}>Medical Reports</Text>
            <Text style={styles.subtitle}>Access and manage all your medical reports</Text>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchSection, { backgroundColor: theme.background }]}>
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
                <Text style={[styles.statNumber, { color: Colors.kbrGreen }]}>{allReportsData.length + 1}</Text>
                <Text style={styles.statLabel}>Available Reports</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.kbrBlue + '15' }]}>
                <Text style={[styles.statNumber, { color: Colors.kbrBlue }]}>{recentReportsData.length}</Text>
                <Text style={styles.statLabel}>Recently Viewed</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: Colors.warning + '15' }]}>
                <Text style={[styles.statNumber, { color: Colors.warning }]}>1</Text>
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
                  style={[styles.tabButton, activeTab === 'Invoices' && styles.activeTabButton]}
                  onPress={() => setActiveTab('Invoices')}
                >
                  <Text style={activeTab === 'Invoices' ? styles.activeTabButtonText : styles.tabButtonText}>
                    Invoices
                  </Text>
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

          {/* Reports List */}
          <View style={styles.reportsSection}>
            {activeTab === 'All Reports' && allReportsData.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportLeft}>
                    <View style={[styles.reportIconContainer, { backgroundColor: report.iconColor + '15' }]}>
                      <Ionicons name={report.icon} size={24} color={report.iconColor} />
                    </View>
                    <View style={styles.reportInfo}>
                      <View style={styles.reportTitleRow}>
                        <Text style={styles.reportTitle}>{report.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: Colors.kbrGreen + '15' }]}>
                          <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>{report.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.reportDoctor}>{report.doctor}</Text>
                      <View style={styles.reportDateTime}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.reportDate}>{report.date}</Text>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.reportTime}>{report.time}</Text>
                      </View>
                      <Text style={styles.reportDescription}>{report.description}</Text>
                      <Text style={styles.reportSize}>{report.size}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.reportActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('ReportDetail', { report })}
                  >
                    <Ionicons name="eye-outline" size={16} color={Colors.white} />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDownload(report.title)}
                  >
                    <Ionicons name="download-outline" size={16} color={Colors.kbrRed} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShare(report.title, report.doctor, report.date)}
                  >
                    <Ionicons name="share-outline" size={16} color={Colors.kbrRed} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {activeTab === 'Recent' && recentReportsData.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportLeft}>
                    <View style={[styles.reportIconContainer, { backgroundColor: report.iconColor + '15' }]}>
                      <Ionicons name={report.icon} size={24} color={report.iconColor} />
                    </View>
                    <View style={styles.reportInfo}>
                      <View style={styles.reportTitleRow}>
                        <Text style={styles.reportTitle}>{report.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: Colors.kbrGreen + '15' }]}>
                          <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>{report.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.reportDoctor}>{report.doctor}</Text>
                      <View style={styles.reportDateTime}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.reportDate}>{report.date}</Text>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.reportTime}>{report.time}</Text>
                      </View>
                      <Text style={styles.reportDescription}>{report.description}</Text>
                      <View style={styles.lastViewedContainer}>
                        <Ionicons name="time-outline" size={14} color={Colors.kbrBlue} />
                        <Text style={styles.lastViewedText}>Last viewed: {report.lastViewed}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.reportActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('ReportDetail', { report })}
                  >
                    <Ionicons name="eye-outline" size={16} color={Colors.white} />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDownload(report.title)}
                  >
                    <Ionicons name="download-outline" size={16} color={Colors.kbrRed} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShare(report.title, report.doctor, report.date)}
                  >
                    <Ionicons name="share-outline" size={16} color={Colors.kbrRed} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {activeTab === 'Invoices' && invoicesData.map((invoice) => (
              <View key={invoice.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportLeft}>
                    <View style={[styles.reportIconContainer, { backgroundColor: invoice.iconColor + '15' }]}>
                      <Ionicons name={invoice.icon} size={24} color={invoice.iconColor} />
                    </View>
                    <View style={styles.reportInfo}>
                      <View style={styles.reportTitleRow}>
                        <Text style={styles.reportTitle}>{invoice.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: Colors.kbrGreen + '15' }]}>
                          <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>{invoice.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.reportDoctor}>{invoice.doctor}</Text>
                      <View style={styles.reportDateTime}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.reportDate}>{invoice.date}</Text>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.reportTime}>{invoice.time}</Text>
                      </View>
                      <Text style={styles.reportDescription}>{invoice.description}</Text>
                      <Text style={[styles.reportAmount, { color: Colors.kbrGreen }]}>Amount: {invoice.amount}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.reportActions}>
                  <TouchableOpacity 
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('ReportDetail', { report: invoice })}
                  >
                    <Ionicons name="eye-outline" size={16} color={Colors.white} />
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDownload(invoice.title)}
                  >
                    <Ionicons name="download-outline" size={16} color={Colors.kbrRed} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShare(invoice.title, invoice.doctor, invoice.date)}
                  >
                    <Ionicons name="share-outline" size={16} color={Colors.kbrRed} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {activeTab === 'Categories' && (
              <>
                {selectedCategory ? (
                  // Show reports for selected category
                  <View>
                    <TouchableOpacity 
                      style={styles.backToCategoriesButton}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <Ionicons name="arrow-back" size={20} color={Colors.kbrBlue} />
                      <Text style={styles.backToCategoriesText}>Back to Categories</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.categoryHeaderSection}>
                      <View style={[styles.categoryIconLarge, { backgroundColor: getCategoryColor(selectedCategory) + '15' }]}>
                        <Ionicons name={getCategoryIcon(selectedCategory)} size={32} color={getCategoryColor(selectedCategory)} />
                      </View>
                      <View>
                        <Text style={styles.categoryHeaderTitle}>{selectedCategory}</Text>
                        <Text style={styles.categoryHeaderCount}>
                          {categoriesMap[selectedCategory] ? categoriesMap[selectedCategory].length : 0} reports
                        </Text>
                      </View>
                    </View>
                    
                    {categoriesMap[selectedCategory] && categoriesMap[selectedCategory].map(report => (
                      <View key={report.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                          <View style={styles.reportLeft}>
                            <View style={[styles.reportIconContainer, { backgroundColor: report.iconColor + '15' }]}>
                              <Ionicons name={report.icon} size={24} color={report.iconColor} />
                            </View>
                            <View style={styles.reportInfo}>
                              <View style={styles.reportTitleRow}>
                                <Text style={styles.reportTitle}>{report.title}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: Colors.kbrGreen + '15' }]}>
                                  <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>{report.status}</Text>
                                </View>
                              </View>
                              <Text style={styles.reportDoctor}>{report.doctor}</Text>
                              <View style={styles.reportDateTime}>
                                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.reportDate}>{report.date}</Text>
                                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                                <Text style={styles.reportTime}>{report.time}</Text>
                              </View>
                              <Text style={styles.reportDescription}>{report.description}</Text>
                              <Text style={styles.reportSize}>{report.size}</Text>
                            </View>
                          </View>
                        </View>
                        
                        <View style={styles.reportActions}>
                          <TouchableOpacity 
                            style={styles.viewButton}
                            onPress={() => navigation.navigate('ReportDetail', { report })}
                          >
                            <Ionicons name="eye-outline" size={16} color={Colors.white} />
                            <Text style={styles.viewButtonText}>View</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleDownload(report.title)}
                          >
                            <Ionicons name="download-outline" size={16} color={Colors.kbrRed} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.actionButton}
                            onPress={() => handleShare(report.title, report.doctor, report.date)}
                          >
                            <Ionicons name="share-outline" size={16} color={Colors.kbrRed} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  // Show category grid
                  <View style={styles.categoriesGrid}>
                    {Object.keys(categoriesMap).map((category) => (
                      <TouchableOpacity 
                        key={category} 
                        style={styles.categoryCard}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) + '15' }]}>
                          <Ionicons name={getCategoryIcon(category)} size={28} color={getCategoryColor(category)} />
                        </View>
                        <Text style={styles.categoryName}>{category}</Text>
                        <Text style={styles.categoryCount}>
                          {categoriesMap[category].length} report{categoriesMap[category].length !== 1 ? 's' : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
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
  categorySection: {
    marginBottom: Sizes.md,
  },
  categoryTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.kbrBlue,
    marginBottom: Sizes.sm,
    paddingHorizontal: Sizes.xs,
  },
  reportAmount: {
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginTop: Sizes.xs,
  },
  lastViewedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Sizes.xs,
    backgroundColor: Colors.kbrBlue + '10',
    paddingHorizontal: Sizes.xs,
    paddingVertical: 2,
    borderRadius: Sizes.radiusSmall,
    alignSelf: 'flex-start',
  },
  lastViewedText: {
    fontSize: Sizes.small,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginLeft: 4,
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: Sizes.md,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    width: '48%',
    padding: Sizes.md,
    alignItems: 'center',
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  backToCategoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Sizes.sm,
    marginBottom: Sizes.sm,
  },
  backToCategoriesText: {
    fontSize: Sizes.medium,
    color: Colors.kbrBlue,
    fontWeight: '500',
    marginLeft: Sizes.xs,
  },
  categoryHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Sizes.radiusMedium,
    padding: Sizes.md,
    marginBottom: Sizes.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIconLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Sizes.md,
  },
  categoryHeaderTitle: {
    fontSize: Sizes.large,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  categoryHeaderCount: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  header: {
    backgroundColor: Colors.kbrBlue,
    paddingHorizontal: Sizes.screenPadding,
    paddingVertical: Sizes.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Sizes.md,
  },
  headerLogoImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: Sizes.sm,
  },
  headerTitle: {
    fontSize: Sizes.medium,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: Sizes.small,
    color: Colors.white,
    opacity: 0.9,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Sizes.sm,
    paddingVertical: Sizes.xs,
    borderRadius: Sizes.radiusSmall,
  },
  loginText: {
    color: Colors.white,
    marginLeft: 4,
    fontSize: Sizes.small,
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  profilePicture: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginBottom: Sizes.md,
  },
  reportLeft: {
    flexDirection: 'row',
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Sizes.md,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Sizes.xs,
  },
  reportTitle: {
    fontSize: Sizes.regular,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
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
  reportDoctor: {
    fontSize: Sizes.medium,
    color: Colors.textSecondary,
    marginBottom: Sizes.xs,
  },
  reportDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Sizes.xs,
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
  reportDescription: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  reportSize: {
    fontSize: Sizes.small,
    color: Colors.textSecondary,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Sizes.sm,
  },
  viewButton: {
    backgroundColor: Colors.kbrBlue,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Sizes.lg,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    flex: 1,
    justifyContent: 'center',
  },
  viewButtonText: {
    color: Colors.white,
    fontSize: Sizes.medium,
    fontWeight: '600',
    marginLeft: 4,
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
});

export default MedicalReportsScreen;