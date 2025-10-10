import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../../constants/theme';

// Helper function to create transparent colors
const getTransparentColor = (color, opacity) => `${color}${opacity}`;

const MedicalReportsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All Reports');
  const [selectedFilter, setSelectedFilter] = useState('All Reports');
  const [selectedDateFilter, setSelectedDateFilter] = useState('Date');

  const tabs = ['All Reports', 'Recent', 'Invoices', 'Categories'];

  const reports = [
    {
      id: '1',
      title: 'Complete Blood Count (CBC)',
      doctor: 'Dr. Sarah Johnson',
      date: 'Dec 10, 2024',
      time: '10:30 AM',
      description: 'All parameters within normal range',
      size: '2.3 MB • 3 pages',
      status: 'available',
      icon: 'water-outline',
      color: Colors.kbrRed,
    },
    {
      id: '2',
      title: 'Chest X-Ray',
      doctor: 'Dr. Michael Brown',
      date: 'Dec 8, 2024',
      time: '2:15 PM',
      description: 'No abnormalities detected',
      size: '5.1 MB • 2 pages',
      status: 'available',
      icon: 'medical-outline',
      color: Colors.kbrBlue,
    },
  ];

  const renderTabButton = (tab, index) => (
    <TouchableOpacity
      key={`tab-${index}`}
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {tab}
      </Text>
    </TouchableOpacity>
  );

  const renderReportCard = (report, index) => (
    <View key={`report-${report.id}-${index}`} style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={styles.reportLeft}>
          <View style={[styles.reportIconContainer, { backgroundColor: getTransparentColor(report.color, '15') }]}>
            <Ionicons name={report.icon} size={24} color={report.color} />
          </View>
          <View style={styles.reportInfo}>
            <View style={styles.reportTitleRow}>
              <Text style={styles.reportTitle}>{report.title || 'No Title'}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getTransparentColor(Colors.kbrGreen, '15') }]}>
                <Text style={[styles.statusText, { color: Colors.kbrGreen }]}>
                  {report.status || 'Unknown'}
                </Text>
              </View>
            </View>
            <Text style={styles.reportDoctor}>{report.doctor || 'Unknown Doctor'}</Text>
            <View style={styles.reportDateTime}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.reportDate}>{report.date || 'No Date'}</Text>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.reportTime}>{report.time || 'No Time'}</Text>
            </View>
            <Text style={styles.reportDescription}>{report.description || 'No Description'}</Text>
            <Text style={styles.reportSize}>{report.size || 'Unknown Size'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.reportActions}>
        <TouchableOpacity style={styles.viewButton}>
          <Ionicons name="eye-outline" size={16} color={Colors.white} />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download-outline" size={16} color={Colors.kbrRed} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={16} color={Colors.kbrRed} />
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerLogo}>
            <Ionicons name="medical" size={20} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>KBR LIFE CARE HOSPITALS</Text>
            <Text style={styles.headerSubtitle}>Reports</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.loginButton}>
          <Ionicons name="log-in-outline" size={16} color={Colors.white} />
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Medical Reports</Text>
          <Text style={styles.subtitle}>Access and manage all your medical reports</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
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

        {/* Filters */}
        <View style={styles.filtersSection}>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="funnel-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.filterText}>{selectedFilter}</Text>
              <Ionicons name="chevron-down-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>{selectedDateFilter}</Text>
              <Ionicons name="chevron-down-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: getTransparentColor(Colors.kbrGreen, '15') }]}>
              <Text style={[styles.statNumber, { color: Colors.kbrGreen }]}>7</Text>
              <Text style={styles.statLabel}>Available Reports</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: getTransparentColor(Colors.warning, '15') }]}>
              <Text style={[styles.statNumber, { color: Colors.warning }]}>1</Text>
              <Text style={styles.statLabel}>Pending Reports</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tabsContainer}>
              {tabs.map((tab, index) => renderTabButton(tab, index))}
            </View>
          </ScrollView>
        </View>

        {/* Reports List */}
        <View style={styles.reportsSection}>
          {reports.map((report, index) => renderReportCard(report, index))}
        </View>
      </ScrollView>    </SafeAreaView>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Sizes.md,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
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
  filtersSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Sizes.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Sizes.md,
    paddingVertical: Sizes.sm,
    borderRadius: Sizes.radiusMedium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterText: {
    fontSize: Sizes.medium,
    color: Colors.textPrimary,
    marginHorizontal: Sizes.xs,
  },
  statsSection: {
    paddingHorizontal: Sizes.screenPadding,
    marginBottom: Sizes.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Sizes.md,
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
    color: Colors.white,
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